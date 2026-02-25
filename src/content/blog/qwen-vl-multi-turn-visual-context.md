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

1. **Identify the main subject:** Technical equipment/component
2. **Identify the material/color:** Appears to be ceramic or composite, 
   dark brown or reddish-brown
3. **Identify the context:** Industrial/infrastructure setting
4. **Identify the background:** Clear sky
5. **Identify specific details:**
   - Multiple segments stacked vertically
   - Metal fittings and connectors
   - Hardware attachments at connection points
   - Lighting suggests daytime (shadows visible)
```

The model correctly identified materials, context, structure, and even inferred lighting conditions from shadows.

**Turn 2 — Follow-up Without Resending Image:**

```
User: What is the condition?

Model: The user is asking about the "condition" of the object in the image. 
I need to look closely at the components to assess their state.

1. **Inspect the main components:**
   - They appear intact. No obvious cracks or chips visible from this distance
   - Color is consistent, suggesting relatively clean or uniformly weathered
   - Metal fittings show some weathering but no severe corrosion

2. **Inspect the hardware:**
   - Connectors look solid and secure
   - No visible damage or misalignment

3. **Assessment:** The equipment appears to be in serviceable condition, 
   showing normal weathering but no critical damage.
```

**The model remembered the image.** It didn't ask for it again, didn't hallucinate a different scene, and provided detailed condition assessment by "looking closely" at specific parts of the original image.

---

## Test 2: Can It Detect Damage?

Describing healthy equipment is one thing. Can the model identify **defects**?

I ran the same test with a different image — this time showing visible damage.

**Turn 1 — Image Analysis:**

```
User: [image] What do you see in this image? Describe it concisely.

Model: The user wants a concise description of the image.

1. **Identify the main subject:** Close-up of industrial component, 
   likely ceramic or composite material with ribbed structure
2. **Identify key details:**
   - Color: Dark brown or black, glossy finish
   - Condition: It looks damaged. There are light-colored patches where 
     the outer layer has chipped or peeled away, revealing underlying 
     material
   - Structure: Stacked segments
3. **Identify the background:** Blurred outdoor setting
```

The model immediately flagged the damage — "light-colored patches where the outer layer has chipped or peeled away."

**Turn 2 — Condition Assessment (No Image Resent):**

```
User: What is the condition?

Model: The user is asking about the condition of the object in the image.

1. **Analyze the component:**
   - Main body is dark and glossy
   - There are distinct light patches on the surface
   - These patches indicate the outer coating has chipped off or peeled away
   - The edges of the damaged areas are jagged and uneven, suggesting 
     physical impact or degradation
   - The rest appears relatively intact but weathered

2. **Conclusion:** The component appears to be **damaged** — 
   chipped, peeling, or broken sections visible, revealing underlying 
   material. Would likely need inspection or replacement.
```

**Key observation:** The model didn't just describe — it *assessed*. It identified the damage pattern (chipping, peeling), characterized the severity (jagged edges suggesting impact), and even suggested action (needs inspection).

## Two Tests, Two Different Assessments

| Test | Equipment State | Model's Condition Assessment |
|------|-----------------|------------------------------|
| Test 1 | Good condition | "Intact, no obvious damage, uniformly weathered, connectors solid" |
| Test 2 | Damaged | "Chipped, peeling, light patches, jagged edges, needs attention" |

The model correctly differentiated between healthy and damaged states — without being told what to look for, and without resending the images in turn 2.

## Why This Matters

This capability unlocks conversational image analysis:

- **Defect detection:** The model doesn't just describe — it identifies damage, wear, and anomalies without explicit prompting
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

Here's the test code pattern:

```python
from PIL import Image
from transformers import AutoProcessor, Qwen2_5_VLForConditionalGeneration
import torch

# --- CONFIG ---
image_path = "test_image.jpg"
model_name = "Qwen/Qwen2.5-VL-72B-Instruct"  # Or smaller: 7B, 32B

# --- LOAD MODEL ---
processor = AutoProcessor.from_pretrained(model_name, trust_remote_code=True)
model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16,
    device_map="auto",
    trust_remote_code=True,
).eval()

image = Image.open(image_path).convert("RGB")

# --- CHAT TURN FUNCTION ---
def chat_turn(messages, image=None, max_new_tokens=512):
    prompt_text = processor.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )
    
    # Image only needed for first turn — reuse context after
    inputs = processor(
        text=prompt_text,
        images=image,
        padding=True,
        return_tensors="pt"
    ).to("cuda")
    
    with torch.no_grad():
        generated_ids = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=False,
        )
    
    # Decode only new tokens
    generated_ids = generated_ids[:, inputs.input_ids.shape[1]:]
    return processor.batch_decode(generated_ids, skip_special_tokens=True)[0].strip()

# --- TURN 1: Image + Question ---
messages = [
    {
        "role": "user",
        "content": [
            {"type": "image", "image": image},
            {"type": "text", "text": "What do you see in this image? Describe it concisely."}
        ]
    }
]

response1 = chat_turn(messages, image=image)
print(f"Turn 1: {response1}")

# --- TURN 2: Follow-up WITHOUT resending image ---
messages.append({
    "role": "assistant",
    "content": [{"type": "text", "text": response1}]
})
messages.append({
    "role": "user",
    "content": [{"type": "text", "text": "What is the condition?"}]  # Text only!
})

response2 = chat_turn(messages, image=None)  # 👈 image=None — context persists
print(f"Turn 2: {response2}")
# Model still "sees" the original image ✓
```

**Key insight:** In turn 2, we pass `image=None` to `chat_turn()`. The image tokens from turn 1 are already in the message history — they persist in the context window automatically.

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
1. Upload scan
2. "Describe what you see"
3. "Is there anything abnormal in the upper right quadrant?"
4. "Compare the density to the left side"

**Document Analysis:**
1. Upload complex form/diagram
2. "What type of document is this?"
3. "Extract the values from section 3"
4. "Is the signature present?"

**Quality/Asset Inspection:**
1. Upload equipment photo
2. "Describe what you see"
3. "What is the condition?"
4. "Any damage that needs immediate attention?"
5. Model assesses: intact vs. damaged, identifies specific defects

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

For applications requiring iterative visual analysis — inspection workflows, document review, medical imaging, design feedback — this changes what's possible with a single image upload.

---

*Testing VLMs for production use cases? I'd love to hear what you're building — reach out on [X @themedcave](https://x.com/themedcave).*
