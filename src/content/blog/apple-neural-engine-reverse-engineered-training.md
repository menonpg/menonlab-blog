---
title: "80× More Efficient Than A100? Someone Reverse-Engineered Apple's Neural Engine for Training"
description: "A developer reverse-engineered Apple's private ANE APIs to enable neural network training on the inference-only chip. Here's what they found and how you can try it."
date: "2026-03-04"
tags: ["apple-silicon", "machine-learning", "neural-engine", "reverse-engineering"]
---

Apple's Neural Engine (ANE) has always been a black box. It ships in every M-series Mac, delivers impressive inference performance, and is completely locked down for training. CoreML only supports inference. MLX ignores it entirely. Apple provides no public API for direct access.

Then [maderix](https://github.com/maderix) reverse-engineered the entire software stack and trained a transformer on it anyway.

## What Actually Happened

Over a weekend, maderix (working collaboratively with Claude) mapped the ANE's software architecture from CoreML down to the IOKit kernel driver. They discovered private Objective-C APIs (`_ANEClient`, `_ANECompiler`, `_ANEInMemoryModelDescriptor`) that allow direct compilation and execution of compute graphs on the ANE—without touching CoreML.

The result: a [working proof-of-concept](https://github.com/maderix/ANE) that runs transformer training (forward + backward pass) directly on Apple's Neural Engine. No GPU. No Metal. Pure ANE compute.

**Current benchmarks (M4, single transformer layer, dim=768, seq=512):**
- 9.3 ms/step
- 11.2% ANE utilization (1.78 TFLOPS sustained)
- 6 ANE kernel dispatches per training step
- Forward and backward passes on ANE; weight gradients on CPU

## The "80× More Efficient" Claim

Headlines have trumpeted "80× more efficient than A100." This is technically accurate but needs context—it's about **energy efficiency**, not raw throughput.

| Accelerator | Peak Performance | Efficiency (TFLOPS/W) |
|-------------|------------------|----------------------|
| M4 ANE | 19 TFLOPS FP16 | **6.6** |
| M4 GPU | ~3.5 TFLOPS | ~1.0 |
| A100 | 312 TFLOPS FP16 | ~0.08 |
| H100 | 990 TFLOPS FP16 | ~0.13 |

The ANE delivers roughly 80× more compute per watt than an A100. But the A100 has 16× more raw throughput. For battery-powered on-device inference, the ANE is extraordinary. For training large models, you still want datacenter GPUs.

**Another key finding:** Apple's "38 TOPS" marketing is misleading. The ANE dequantizes INT8 weights to FP16 before compute—there's no actual 2× INT8 speedup. The true peak is 19 TFLOPS FP16, regardless of quantization.

## How the ANE Actually Works

The ANE isn't a general-purpose accelerator—it's a **graph execution engine**. You don't issue individual matrix operations. You submit a compiled program describing an entire computation graph, and the hardware executes it atomically.

Key discoveries from the reverse engineering:

1. **It's fundamentally a convolution engine.** Expressing matmul as 1×1 convolution gives 3× higher throughput.
2. **~32MB on-chip SRAM.** Stay under this to avoid spilling to DRAM, which kills performance.
3. **Deep graphs win.** Single operations use only ~30% of capacity. Chain 16-64 ops to approach the theoretical peak.
4. **Zero idle power.** Hard power gating means 0 milliwatts when not in use—no leakage.

## How to Try It Yourself

The code is MIT licensed and available at [github.com/maderix/ANE](https://github.com/maderix/ANE).

**Requirements:**
- macOS 15+ on Apple Silicon (tested on M4)
- Xcode command line tools

**Build and run:**

```bash
# Clone the repo
git clone https://github.com/maderix/ANE.git
cd ANE

# Build the training program
xcrun clang -O2 -framework Foundation -framework IOSurface \
    -framework CoreML -framework Accelerate -ldl -lobjc \
    -o train_large training/train_large.m

# Run
./train_large
```

No external dependencies—just system frameworks and private ANE APIs resolved at runtime.

## Important Caveats

The author is refreshingly honest about limitations:

- **This is research code, not a production framework.** Don't expect it to replace PyTorch.
- **Utilization is low.** Even after optimization, only ~11% of peak ANE throughput is achieved.
- **Many operations fall back to CPU.** RMSNorm backward, residual connections, loss computation, and Adam updates all run on CPU.
- **~119 compile limit.** The ANE compiler leaks resources, requiring process restarts via `exec()`.
- **Private APIs.** These are undocumented and could break with any macOS update.

## Why This Matters

The technical achievement here isn't training a large model efficiently—it's proving that **the barrier to NPU training has always been software, not hardware.**

Apple's ANE is a 19 TFLOPS accelerator sitting in every MacBook, iMac, and Mac Mini. It's locked to inference-only use not because it can't do training, but because Apple hasn't chosen to expose the capability. This project demonstrates that backpropagation on ANE is entirely feasible with the right software layer.

For edge AI researchers, this opens interesting possibilities. For Apple, it might be a nudge toward first-party training support. For the rest of us, it's a fascinating look inside silicon that Apple would prefer to keep mysterious.

## References

- **GitHub Repository:** [maderix/ANE](https://github.com/maderix/ANE)
- **Part 1: Reverse Engineering:** [maderix.substack.com](https://maderix.substack.com/p/inside-the-m4-apple-neural-engine)
- **Part 2: ANE Benchmarks:** [maderix.substack.com](https://maderix.substack.com/p/inside-the-m4-apple-neural-engine-615)
- **Prior Work - hollance/neural-engine:** [GitHub](https://github.com/hollance/neural-engine) (community ANE documentation)
- **Prior Work - mdaiter/ane:** [GitHub](https://github.com/mdaiter/ane) (early ANE reverse engineering)
- **Apple's ANE Transformers Reference:** [apple/ml-ane-transformers](https://github.com/apple/ml-ane-transformers)

---

*This project uses Apple's private, undocumented APIs and is not affiliated with or endorsed by Apple Inc. The legal basis for this research falls under fair use and interoperability provisions (Sega v. Accolade, 1992; DMCA §1201(f)).*
