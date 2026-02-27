---
title: "Rethinking What 'AI-Assisted' Actually Means in Radiology"
description: "A recent Radiology editorial challenges our assumptions about human-AI collaboration. The nuances matter: AI doesn't uniformly improve performance, and the real goal isn't preserving radiologist tasks—it's preserving what makes radiology work."
date: "2026-02-27"
tags: ["healthcare", "radiology", "human-ai", "clinical-ai", "automation-bias", "medical-imaging"]
---

There's a phrase that's become almost liturgical in healthcare AI discussions: "AI-assisted diagnosis." It sounds clean and obvious—the AI assists, the human decides. Everyone wins.

A recent editorial in *Radiology* by Shirangi, Pittinsky, and Gichoya challenges this comfortable framing. Their argument, titled "Rethinking Human-AI Collaboration in Radiology," cuts to something we've been dancing around: **the goal of human-AI interaction in radiology is not to preserve every radiologist's task, but to preserve what makes radiology valuable in the first place.**

That distinction matters enormously. And getting it wrong has consequences we're only beginning to understand.

## The Seductive Simplicity of "AI Assists, Human Decides"

The dominant narrative goes like this: AI systems detect potential abnormalities, flag them for attention, and the radiologist—armed with clinical context and years of training—makes the final call. The AI is a second pair of eyes, catching things the human might miss. Efficiency improves. Accuracy improves. Everyone stays in their lane.

It's a compelling story. Studies consistently show that AI systems can match or exceed radiologist performance on specific tasks: detecting lung nodules, identifying fractures, flagging pneumothorax. A 2022 JAMA Network Open study demonstrated that AI-aided chest radiograph interpretation improved efficiency while maintaining diagnostic performance. These results are real, and they're driving billions in healthcare AI investment.

But here's what the simple narrative misses: **assistance isn't always assistive**.

## When AI Makes Radiologists Worse

The literature on automation bias in medicine is growing, and it's concerning. When clinicians work with AI systems, they don't simply add AI's capabilities to their own. They change how they think.

A 2025 study in *Epidemiology and Health Data Insights* examined what happens when diagnostic physicians become accustomed to AI support. The findings documented "automation bias"—a tendency to defer to AI recommendations even when clinical judgment should override them. More troubling: over time, some physicians showed signs of "diagnostic deskilling," a degradation of the independent reasoning abilities they'd spent years developing.

This isn't hypothetical. Research has demonstrated that when AI systems make errors—and they do, often in systematic and predictable ways—radiologists who've been working with AI assistance are *more likely* to adopt those errors than radiologists working independently. The AI isn't just a tool; it's reshaping the cognitive environment.

The phenomenon isn't unique to radiology. A 2025 preprint studying large language model use among AI-trained physicians found that exposure to incorrect AI predictions significantly impaired diagnostic reasoning. The effect was strongest among clinicians who had the most positive prior experiences with AI assistance. Trust, it turns out, can be a vulnerability.

## The Nuance We Keep Missing

So when does AI actually help? The emerging picture is more conditional than the marketing suggests.

AI appears most beneficial when:
- **The task is well-defined and the AI is highly accurate** — screening for specific, discrete findings where the AI's training data closely matches the clinical population
- **Radiologists maintain active skepticism** — treating AI outputs as hypotheses to be verified rather than conclusions to be confirmed
- **Cognitive load is high** — busy emergency departments, high-volume screening programs, fatigue-prone late shifts
- **The AI catches what humans systematically miss** — subtle findings at the edge of perceptibility, patterns humans haven't learned to recognize

AI appears most problematic when:
- **Radiologists over-rely on it** — checking AI outputs without independent assessment, developing "automation complacency"
- **The AI fails in unfamiliar ways** — novel pathology, demographic shifts, equipment changes that push cases outside the training distribution
- **Clinical context is crucial** — situations where the right interpretation depends on patient history, clinical presentation, or information the AI can't access
- **Training creates dependence** — residents and fellows who learn radiology *with* AI may never develop robust independent skills

The Shirangi editorial captures this tension precisely: we need to maintain clinical judgment and supervise AI performance. But that requires radiologists who *can* exercise judgment—who haven't outsourced their pattern recognition to algorithms.

## Preserving What Makes Radiology Work

Here's where the editorial's framing becomes genuinely useful. The question isn't "how do we keep radiologists busy?" or "how do we make AI play nicely with humans?" The question is: **what is radiology actually *for*, and how do we preserve that function?**

Radiology isn't just pattern matching. It's the integration of imaging findings with clinical context. It's the judgment call about what additional workup to recommend. It's the differential diagnosis that changes management. It's the communication with referring physicians that translates pixels into patient care.

If AI systems excel at the pattern-matching component but degrade radiologists' ability to do the integration, we haven't improved anything. We've created a system that's locally optimal and globally broken.

The Radiology editorial suggests we've been asking the wrong question. Instead of "how do we add AI to radiology?", we should ask "what are the essential human capabilities in radiology, and how do we preserve them while incorporating AI where it genuinely helps?"

That's a harder question. It requires acknowledging that some AI integration might make things worse. It requires studying not just whether AI improves accuracy on narrow tasks, but whether human-AI systems maintain the full scope of radiological judgment over time. It requires humility about what we don't yet know.

## Implications for Healthcare AI Builders

For those of us building healthcare AI systems, the Shirangi editorial is a call to intellectual honesty.

We need to stop treating "AI-assisted" as inherently positive and start measuring what actually happens to clinical decision-making when AI is in the loop. That means:

- **Longitudinal studies** that track radiologist performance over months and years of AI use, not just immediate accuracy on test sets
- **Cognitive assessment** that examines whether independent reasoning skills are maintained, degraded, or enhanced
- **Failure mode analysis** that maps how AI errors propagate through human-AI systems, not just how often they occur
- **Training design** that actively builds independent capability alongside AI-augmented capability

The goal isn't to slow down AI adoption. It's to make AI adoption actually work—not just in demos and pilot studies, but in the sustained clinical reality where radiologists interpret thousands of studies, year after year, with AI systems shaping how they see.

## The Path Forward

The honest assessment is that we don't yet know how to do human-AI collaboration well in radiology. We have promising tools and concerning signals. We have efficiency gains and automation bias. We have studies showing AI helps and studies showing AI hurts, often depending on factors we don't fully understand.

What we need is the intellectual framework the Shirangi editorial proposes: a focus not on preserving radiologist tasks, but on preserving radiological judgment. Not on adding AI, but on integrating AI in ways that maintain the human capabilities that make radiology valuable.

That's a harder problem than building better detection algorithms. But it's the problem that actually matters.

---

*The editorial "Rethinking Human-AI Collaboration in Radiology" by Shirangi A, Pittinsky T, and Gichoya J was published in Radiology, February 2026 (DOI: 10.1148/radiol.252760).*
