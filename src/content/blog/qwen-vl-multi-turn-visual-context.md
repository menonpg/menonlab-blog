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

## Example: Used Car Photo Analysis

Imagine you're building a tool for used car marketplaces — buyers upload a photo and can have a conversation about it.

**Turn 1 — Image Analysis:**

```
User: [image of used car] What do you see in this image? Describe it concisely.

Model: The image shows a sedan, appears to be a mid-2010s Honda Accord 
or similar model.

1. **Exterior color:** Silver/grey metallic
2. **Body style:** 4-door sedan
3. **Visible features:** 
   - Alloy wheels (5-spoke design)
   - Side mirrors intact
   - Front bumper and hood visible
   - Parked in what looks like a driveway or parking lot
4. **Lighting:** Daytime, overcast sky
5. **Angle:** Front 3/4 view from driver's side
```

**Turn 2 — Follow-up Without Resending Image:**

```
User: What is the condition?

Model: Looking at the vehicle's condition:

1. **Paint/Body:**
   - Paint appears to be in decent shape, consistent color
   - No obvious major dents visible from this angle
   - Some minor scratches may be present near the wheel wells 
     (hard to confirm at this resolution)

2. **Wheels/Tires:**
   - Alloy wheels look clean, no visible curb rash
   - Tires appear to have adequate tread depth

3. **Glass:**
   - Windshield looks clear, no visible cracks

4. **Overall assessment:** The car appears to be in good cosmetic 
   condition for its age. Would recommend closer inspection of 
   the areas around door handles and bumper edges for wear.
```

**The model remembered the image.** It didn't ask for it again, didn't hallucinate a different car, and provided detailed condition assessment by examining specific parts of the original photo.

---

## Test 2: Can It Detect Damage?

Describing a clean car is easy. Can the model identify **problems**?

Same test, different image — this time a car with visible damage.

**Turn 1 — Image Analysis:**

```
User: [image of damaged car] What do you see in this image?

Model: This image shows a vehicle with visible damage:

1. **Vehicle type:** Appears to be a compact SUV or crossover
2. **Damage visible:** 
   - Significant dent on the rear quarter panel
   - Paint damage/scratches around the affected area
   - Possible cracked tail light housing
3. **Location:** Rear driver's side
4. **Setting:** Parked, appears to be in a service area or parking lot
```

The model immediately identified the damage without being prompted to look for it.

**Turn 2 — Condition Assessment (No Image Resent):**

```
User: What is the condition?

Model: Based on the damage visible in the image:

1. **Severity assessment:**
   - The dent appears to be moderate to significant
   - Paint is clearly compromised — bare metal may be exposed
   - The damage pattern suggests impact (collision or parking incident)

2. **Affected components:**
   - Rear quarter panel (body work required)
   - Possibly the tail light assembly
   - Paint will need respray at minimum

3. **Repair estimate considerations:**
   - Quarter panel damage is typically expensive to repair
   - May require paintless dent repair if metal isn't creased
   - If creased, likely needs panel work and repaint

4. **Overall:** This vehicle has meaningful cosmetic damage that 
   would affect resale value. The damage is repairable but not cheap.
```

The model didn't just describe — it **assessed severity**, identified **affected components**, and even provided **repair considerations**.

## Two Tests, Two Different Assessments

| Test | Vehicle State | Model's Assessment |
|------|---------------|-------------------|
| Test 1 | Clean | "Good cosmetic condition, no obvious dents, recommend closer inspection" |
| Test 2 | Damaged | "Moderate to significant dent, paint compromised, affects resale value" |

The model correctly differentiated between healthy and damaged — without being told what to look for, and without resending the images in turn 2.

## Why This Matters

This capability unlocks conversational image analysis:

- **Defect detection:** The model identifies damage, wear, and anomalies without explicit prompting
- **Iterative inspection:** "Describe this" → "What about the bumper?" → "Is that rust or shadow?"
- **Comparative analysis:** Upload two images, then ask questions referencing both
- **Expert workflows:** Send a complex image once, have a multi-turn discussion about different areas
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
image_path = "car_photo.jpg"
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
            {"type": "text", "text": "What do you see in this image? Describe it."}
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

This multi-turn visual context enables workflows across many domains:

**Used Car Marketplaces:**
1. Seller uploads photo
2. "Describe the vehicle"
3. "Any visible damage?"
4. "What's your assessment of the condition?"

**Real Estate Listings:**
1. Upload property photo
2. "What style of home is this?"
3. "What's the condition of the exterior?"
4. "Any maintenance concerns visible?"

**Medical Imaging Review:**
1. Upload scan
2. "Describe what you see"
3. "Is there anything abnormal in the upper right quadrant?"
4. "Compare the density to the left side"

**E-commerce Product QA:**
1. Upload product photo
2. "Describe this item"
3. "Any defects visible?"
4. "Rate the quality 1-10"

**Insurance Claims:**
1. Upload damage photo
2. "Describe the damage"
3. "Estimate severity"
4. "What repairs would be needed?"

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

For applications requiring iterative visual analysis — vehicle inspection, real estate, medical imaging, product QA — this changes what's possible with a single image upload.

---

*Testing VLMs for production use cases? I'd love to hear what you're building — reach out on [X @themedcave](https://x.com/themedcave).*
