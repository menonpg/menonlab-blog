---
title: "Multi-Turn Visual Context in VLMs: Send the Image Once, Ask Questions Forever"
description: "Testing Qwen 2.5-VL-72B's ability to maintain visual context across conversation turns. Send an image once, then ask follow-up questions without resending — the model remembers what it saw."
date: "2026-02-25"
tags: ["vlm", "qwen", "vision-language-models", "ai-engineering", "multimodal"]
---

Here's something that should be obvious but isn't always: when you send an image to a vision-language model, can you ask follow-up questions without resending the image?

The answer, with modern VLMs like Qwen 2.5-VL-72B, is **yes** — and it works remarkably well.

## The Test

I wanted to verify whether Qwen 2.5-VL-72B could maintain visual context across multiple conversation turns. The setup:

1. **Turn 1:** Send an image + ask "What do you see in this image?"
2. **Turn 2:** Ask "What is the condition?" — **without resending the image**

If the model maintains context, it should analyze the same image. If not, it would either hallucinate or refuse.

## What Happened

**Turn 1 — Image Analysis:**

```
User: [image] What do you see in this image? Describe it concisely.

Model: The user wants a concise description of the image.

1. **Identify the main subject:** It's a vertical string of insulators.
2. **Identify the material/color:** They look like ceramic or porcelain, 
   dark brown or reddish-brown.
3. **Identify the context:** They are hanging from a metal structure (top) 
   and holding up power lines (bottom). This is clearly a high-voltage 
   transmission line setup.
4. **Identify the background:** Clear blue sky.
5. **Identify specific details:**
   - There are multiple discs stacked vertically (a "string").
   - At the bottom, there are metal clamps holding two parallel wires.
   - The top connects to a metal bracket.
   - The lighting suggests a sunny day (shadows on the insulators).
```

The model correctly identified technical equipment, materials, context, and even lighting conditions from shadows.

**Turn 2 — Follow-up Without Resending Image:**

```
User: What is the condition?

Model: The user is asking about the "condition" of the object in the image. 
I need to look closely at the insulators and the hardware to assess their state.

1. **Inspect the insulators:**
   - They are a string of disc insulators.
   - They appear to be made of porcelain or ceramic (dark brown/reddish color).
   - Looking at the discs, they seem intact. No obvious cracks or chips 
     are visible from this distance.
   - The color is consistent, suggesting they are relatively clean or 
     uniformly weathered.
   - The metal fittings look metallic, likely galvanized steel or aluminum. 
     They show some signs of weathering/oxidation but don't look severely 
     corroded or broken.

2. **Inspect the hardware at the bottom:**
   - The clamps holding the wires look solid.
   - The wires themselves look taut and intact.
```

**The model remembered the image.** It didn't ask for it again, didn't hallucinate a different scene, and provided detailed condition assessment by "looking closely" at specific parts of the original image.

## Why This Matters

This capability unlocks conversational image analysis:

- **Iterative inspection:** "Describe this" → "What about the top-left corner?" → "Is that damage or shadow?"
- **Comparative analysis:** Upload two images, then ask questions referencing both
- **Expert workflows:** Send a complex diagram once, then have a multi-turn discussion about different components
- **Reduced token costs:** Images are expensive in tokens. Sending once vs. every turn saves significant compute

## How It Works Under the Hood

Looking at the prompt structure reveals the mechanism:

```
<|im_start|>user
<|vision_start|><|image_pad|><|vision_end|>What do you see in this image?<|im_end|>
<|im_start|>assistant
[First response]<|im_end|>
<|im_start|>user
What is the condition<|im_end|>
<|im_start|>assistant
[Second response — still has access to image tokens from turn 1]
```

The image tokens (`<|image_pad|>`) remain in the context window. As long as you don't exceed the model's context length, the visual information persists across turns.

**Key insight:** This isn't magic — it's just context window management. The image is encoded into tokens that stay in the conversation history, exactly like text tokens do.

## The Catch: Memory Requirements

Qwen 2.5-VL-72B is a beast. Here's what you need to run it:

| Precision | VRAM Required | Hardware Options |
|-----------|---------------|------------------|
| BF16 (full) | ~144 GB | 2× H100 80GB, 4× A100 40GB |
| FP8 | ~72 GB | 1× H100 80GB, 2× A100 40GB |
| 4-bit quantized | ~36 GB | 1× A100 40GB, 2× RTX 4090 |
| AWQ/GPTQ 4-bit | ~40 GB | Consumer multi-GPU setups |

For reference, a single RTX 4090 has 24 GB VRAM. You're not running the 72B model on consumer hardware without serious quantization and multi-GPU setups.

### Smaller Alternatives

If you don't have datacenter hardware:

| Model | VRAM (BF16) | VRAM (4-bit) | Quality |
|-------|-------------|--------------|---------|
| Qwen 2.5-VL-7B | ~14 GB | ~4 GB | Good for simple tasks |
| Qwen 2.5-VL-32B | ~64 GB | ~18 GB | Strong balance |
| Qwen 2.5-VL-72B | ~144 GB | ~36 GB | State-of-the-art |

The 7B model fits on a single RTX 4090 and still handles multi-turn visual context — just with less nuanced understanding.

## Running It Yourself

### Option 1: Transformers (Local)

```python
from transformers import Qwen2_5_VLForConditionalGeneration, AutoProcessor
from PIL import Image

model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
    "Qwen/Qwen2.5-VL-72B-Instruct",
    torch_dtype="auto",
    device_map="auto"
)
processor = AutoProcessor.from_pretrained("Qwen/Qwen2.5-VL-72B-Instruct")

# First turn: image + question
messages = [
    {
        "role": "user",
        "content": [
            {"type": "image", "image": Image.open("equipment.jpg")},
            {"type": "text", "text": "What do you see in this image?"}
        ]
    }
]

# Process and generate
inputs = processor.apply_chat_template(messages, return_tensors="pt")
output = model.generate(**inputs, max_new_tokens=512)
response_1 = processor.decode(output[0], skip_special_tokens=True)

# Second turn: follow-up WITHOUT resending image
messages.append({"role": "assistant", "content": response_1})
messages.append({
    "role": "user", 
    "content": [{"type": "text", "text": "What is the condition?"}]
})

inputs = processor.apply_chat_template(messages, return_tensors="pt")
output = model.generate(**inputs, max_new_tokens=512)
response_2 = processor.decode(output[0], skip_special_tokens=True)
# Model still "sees" the original image ✓
```

### Option 2: vLLM (Production)

```python
from vllm import LLM, SamplingParams

llm = LLM(
    model="Qwen/Qwen2.5-VL-72B-Instruct",
    tensor_parallel_size=4,  # Across 4 GPUs
    max_model_len=32768,
)

# vLLM handles multi-turn context automatically
# Just maintain conversation history in your application
```

### Option 3: API Providers

If you don't have the hardware:

- **Together AI** — Qwen 2.5-VL models available via API
- **Fireworks AI** — Optimized VLM inference  
- **Replicate** — Pay-per-use, no setup
- **Hugging Face Inference Endpoints** — Deploy your own instance

## Practical Applications

This multi-turn visual context enables workflows that weren't practical before:

**Medical Imaging Review:**
1. Upload X-ray
2. "Describe what you see"
3. "Is there anything abnormal in the upper right quadrant?"
4. "Compare the density to the left side"

**Document Analysis:**
1. Upload complex form/diagram
2. "What type of document is this?"
3. "Extract the values from section 3"
4. "Is the signature present?"

**Quality Inspection:**
1. Upload product photo
2. "Describe the item"
3. "Any visible defects?"
4. "Rate the condition 1-10"

**Code Review with Screenshots:**
1. Upload IDE screenshot
2. "What language is this?"
3. "Any obvious bugs?"
4. "How would you refactor the highlighted function?"

## Limitations

Not everything is perfect:

1. **Context window limits:** Images consume significant tokens. Very long conversations or multiple high-res images can exceed limits.

2. **Resolution matters:** The model downsamples large images. Fine details may be lost, affecting follow-up questions about small features.

3. **No "zoom and enhance":** The model can't magically see details that aren't in the original image data.

4. **Quantization tradeoffs:** Running 4-bit to fit on smaller GPUs reduces visual understanding quality.

## The Bottom Line

Modern VLMs like Qwen 2.5-VL-72B maintain visual context across conversation turns naturally. Send an image once, then have a multi-turn conversation about it — the model remembers what it saw.

This isn't a special feature you need to enable. It's how the architecture works: image tokens persist in the context window alongside text tokens.

The main barrier is hardware. The 72B model needs serious GPU infrastructure. But smaller variants (7B, 32B) offer the same multi-turn capability with proportionally lower requirements.

For applications requiring iterative visual analysis — inspection workflows, document review, medical imaging, design feedback — this changes what's possible with a single API call.

---

*Testing VLMs for production use cases? I'd love to hear what you're building — reach out on [X @themedcave](https://x.com/themedcave).*
