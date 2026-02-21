---
title: "TimesFM 2.5: Google's Open-Source Time Series Foundation Model"
description: "Google Research just open-sourced a 200M parameter foundation model for time series forecasting. It works zero-shot on any data—no training required."
date: "2026-02-21"
tags: ["google", "time-series", "foundation-models", "forecasting", "open-source"]
---

# TimesFM 2.5: Google's Open-Source Time Series Foundation Model

Time series forecasting has traditionally required training models from scratch for each dataset. Different domains—finance, weather, energy, retail—each demanded custom models tuned to their specific patterns. Google Research just changed that equation.

[TimesFM](https://github.com/google-research/timesfm) (Time Series Foundation Model) is a pretrained foundation model that performs zero-shot forecasting on any time series data. No fine-tuning. No domain-specific training. Just plug in your data and get predictions.

## What Makes TimesFM Different

The key insight behind TimesFM is treating time series forecasting like language modeling. Just as GPT learned patterns across billions of text sequences, TimesFM learned patterns across massive amounts of time series data. The result is a model that generalizes across domains without ever seeing your specific data before.

Version 2.5, [released in September 2025](https://github.com/google-research/timesfm), represents a significant upgrade:

- **200M parameters** (down from 500M in v2.0)—smaller but smarter
- **16K context length** (up from 2,048)—can see much longer historical windows
- **Continuous quantile forecasting** up to 1,000 steps ahead
- **No frequency indicator needed**—the model figures out your data's periodicity automatically

The architecture is decoder-only, similar to modern LLMs. The [ICML 2024 paper](https://arxiv.org/abs/2310.10688) details how they trained it on a diverse corpus of real-world and synthetic time series, creating a model that understands fundamental patterns of temporal data.

## Zero-Shot in Practice

The usage is remarkably simple:

```python
import torch
import numpy as np
import timesfm

model = timesfm.TimesFM_2p5_200M_torch.from_pretrained(
    "google/timesfm-2.5-200m-pytorch"
)

model.compile(
    timesfm.ForecastConfig(
        max_context=1024,
        max_horizon=256,
        normalize_inputs=True,
        use_continuous_quantile_head=True,
    )
)

# Feed it any time series—no training needed
point_forecast, quantile_forecast = model.forecast(
    horizon=12,
    inputs=[
        np.linspace(0, 1, 100),
        np.sin(np.linspace(0, 20, 67)),
    ],
)
```

That's it. No fitting. No hyperparameter tuning. The model has already learned what time series patterns look like from its pretraining.

## Enterprise Ready

This isn't just a research artifact. Google has productionized TimesFM as an [official BigQuery ML feature](https://cloud.google.com/bigquery/docs/timesfm-model), meaning enterprises can run forecasts directly in their data warehouse without managing model infrastructure.

The combination of open-source weights (via Hugging Face) and cloud integration gives teams flexibility: prototype locally, deploy at scale in BigQuery, or self-host in your own infrastructure.

## Practical Applications

Foundation models for time series open up use cases that were previously impractical:

**Rapid prototyping**: Test forecasting on new datasets instantly without the training loop. See if a time series is even forecastable before investing in custom model development.

**Cross-domain transfer**: A model trained on energy data can forecast retail sales. TimesFM's pretraining covers enough domains that it's likely seen patterns similar to yours.

**Long-horizon forecasting**: The 16K context window and 1K forecast horizon mean you can look far back and predict far forward—useful for strategic planning, capacity forecasting, and seasonal businesses.

**Uncertainty quantification**: The quantile head provides prediction intervals out of the box, critical for decision-making under uncertainty.

## The Foundation Model Pattern

TimesFM follows a now-familiar pattern: pretrain a large model on diverse data, release it open-source, and let the community fine-tune or use it zero-shot. We've seen this with language (GPT, LLaMA), vision (CLIP, SAM), and now time series.

The implication is that time series forecasting is shifting from a craft (custom models per dataset) to an infrastructure (foundation models as a base layer). Teams can start with TimesFM and only invest in custom development if their use case truly demands it.

For most forecasting needs, that day may never come.

**Links:**
- [GitHub Repository](https://github.com/google-research/timesfm)
- [Hugging Face Models](https://huggingface.co/collections/google/timesfm-release-66e4be5fdb56e960c1e482a6)
- [ICML 2024 Paper](https://arxiv.org/abs/2310.10688)
- [Google Research Blog](https://research.google/blog/a-decoder-only-foundation-model-for-time-series-forecasting/)
- [BigQuery Integration](https://cloud.google.com/bigquery/docs/timesfm-model)
