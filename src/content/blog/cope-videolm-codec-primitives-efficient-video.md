---
title: "CoPE-VideoLM: How Video Codecs Could Solve the Long Video Problem"
description: "A clever approach that uses motion vectors and residuals from video codecs to achieve 93% fewer tokens and 86% faster inference — enabling 8-hour videos in a 1M context window."
date: "2026-02-26"
tags: ["video-llm", "multimodal", "efficiency", "research"]
---

Video LLMs have a fundamental problem: videos have *a lot* of frames.

A 1-hour video at 30 FPS contains 108,000 frames. Even at a sparse 1 FPS, that's 3,600 images to encode. With each frame producing hundreds of tokens, you quickly blow past any context window. Current solutions? Sample keyframes aggressively and hope you don't miss anything important.

CoPE-VideoLM takes a different approach: stop treating video as a sequence of images. Treat it as a *video* — specifically, the way video codecs have been treating it for decades.

## The Key Insight

Video codecs like H.264 don't store every frame as a full image. That would be absurdly wasteful. Instead, they store:

- **I-frames**: Full reference images (keyframes)
- **P-frames**: Just the *changes* from the previous frame — motion vectors and residuals

This is how a 2-hour movie fits in 4GB instead of 4TB. The codec exploits temporal redundancy: most of frame N looks exactly like frame N-1, just slightly moved or changed.

CoPE-VideoLM asks: why aren't Video LLMs doing the same thing?

## The Architecture

The system processes videos using the native GOP (Group of Pictures) structure:

**For I-frames**: Use a standard frozen vision encoder (like SigLIP). These are your full reference frames — dense RGB tokens, just like existing VideoLMs.

**For P-frames**: Skip the expensive vision encoder entirely. Instead, feed the raw codec primitives (motion vectors and residuals) into a lightweight **Δ-Encoder** — a small transformer that produces compact "Δ-tokens."

The Δ-Encoder has two branches:
- One for motion vectors (where did pixels move?)
- One for residuals (what actually changed?)

These get concatenated into a tiny token representation that's aligned with the RGB token space during pre-training. The key is that P-frames never need full image encoding — they just describe deltas from the reference.

## The Numbers

The results are striking:

- **93% fewer tokens** compared to standard VideoLMs
- **86% faster time-to-first-token** (TTFT)
- **8-hour videos** can fit in a 1M token context at 1 FPS
- **Maintains or exceeds performance** on 14 video benchmarks

That last point is crucial. This isn't a quality-for-speed tradeoff — they actually *improve* on several benchmarks, likely because dense temporal coverage (even with compressed P-frame representations) beats sparse keyframe sampling.

The benchmarks span general video QA, temporal reasoning, long-form understanding, and spatial scene understanding. It's a comprehensive evaluation that shows the approach generalizes.

## Why This Matters

Video understanding has been stuck in a local maximum. We keep throwing more compute at frame encoding and more sophisticated keyframe selection, when the fundamental bottleneck is treating video as "many images" instead of "compressed temporal signal."

Video codecs solved this problem 30 years ago. CoPE-VideoLM finally brings that insight to multimodal LLMs.

This also has implications beyond efficiency:

**Dense temporal coverage**: Instead of sampling 64 frames from a 1-hour video (and missing most of it), you can process every frame's motion and changes. This matters for tasks requiring fine-grained temporal reasoning — sports analysis, procedure understanding, anomaly detection.

**Scaling to long-form content**: 8 hours of video in a single context window opens up new applications: full movie understanding, day-long surveillance analysis, multi-episode narrative comprehension.

**Inference cost**: 86% faster TTFT means real-time-ish video understanding becomes practical on commodity hardware.

## The Catch

Code isn't released yet (TBA), and this builds on LLaVA-Video-7B, so you'll need their stack when it drops. The approach also assumes you have access to the raw codec representation — decoded video loses this information. In practice, most video files store this natively, but there's pipeline complexity.

Still, the core insight is implementable independently. If you're building video understanding systems, the architecture is well-documented in the paper, and motion vectors / residuals are extractable from most video containers with FFmpeg.

## The Bottom Line

CoPE-VideoLM is the kind of paper that makes you wonder why we weren't doing this already. Video codecs have been exploiting temporal redundancy forever. Bringing that efficiency to Video LLMs feels obvious in hindsight — which usually means it's a good idea.

Watch this space. When the code drops, this could become the standard approach for video understanding.

---

**Links:**
- [Project page](https://sayands.github.io/cope/)
- [Paper (arXiv)](https://arxiv.org/abs/2602.13191)
- Code: TBA
