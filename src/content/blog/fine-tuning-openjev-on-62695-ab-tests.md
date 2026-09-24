---
title: Fine-tuning OpenJev on 62,695 A/B Tests
date: 2026-09-23
updated: 2026-09-24
tags: [ml, decision-models, calibration, open-weights, benchmarks]
draft: false
description: Training a headline ranker on Upworthy's A/B tests, fixing the evaluation, and checking how it compares with Gemini and transfers to Reddit.
---

I went through the 26 "scoring and ranking" projects among roughly 300 public projects built on the new decision models. All 26 got their scores by asking a model: rate this article, judge this copy, decide whether this document is relevant.

I wanted to try this with measured outcomes. Eventually I'd like to score email subject lines, so predicting which headline got more clicks seemed like a useful place to start.

The result is **[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)**, a 435M-parameter headline ranker released under Apache 2.0. It scores text in one forward pass. The base is [`com-kotobalabs/open-jev-deberta-v3-large`](https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large), a DeBERTa-v3-large pretrained on typed decisions. The weights are up if you wanna try it.

| Measure | This model | Chance |
|---|---|---|
| Every within-test pair, unseen split | **0.689** | 0.524 |
| Pairs where the test actually resolved (p<0.05) | **0.843** | 0.547 |
| Clean pairs, nothing resembling training text | **0.671** | 0.524 |
| Picks the best of 4-5 variants | **47.7%** | 24.9% |
| Avoids the worst variant | 90.3% | 75.1% |
| Reddit title pairs, out of domain | 0.522 | 0.500 |

Only 29% of pairs reach statistical significance at 5%. The first row includes all pairs, including those where the observed click-rate difference could be noise. The second restricts evaluation to significant pairs.

The model fit 47,168 arms across 16,129 randomized headline experiments. The results above use data it wasn't trained on. Most of the runs below used a narrower evaluation: one best-versus-worst pair per test. I found that mistake later; the corrections section explains it, and the table above reports all-pairs accuracy.

## Data and method

The [Upworthy Research Archive](https://osf.io/jd64p/) has been public since 2021 under CC BY. It contains 32,487 randomized headline A/B tests run between January 2013 and April 2015, with 538 million assignments and impression and click counts for each variant. Yes, it's the "you won't believe what happened next" people. Their headlines are a pretty specific kind of writing, but the archive lets me compare variants against actual clicks.

I started with ModernBERT-large and a regression head. The target was the shrunk logit click rate centred on each test's own mean. The article itself drives much of the click-rate variance, so I wanted to predict how a headline did relative to the other headlines for that article. Beta-binomial shrinkage pulls estimates toward the test mean, more strongly for an arm with 600 impressions than one with 20,000.

The run took twenty-five minutes on a single L4 and cost about forty cents. I trained on the 2013–2014 portion of the confirmatory split, held out its 2015 tests, and got **0.704 pairwise accuracy.**

At the time I was comparing this with [0.544](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682), from a Toronto group using hand-crafted linguistic features. Their paper calls the problem "inherently hard, not merely a sample size issue." That comparison had problems too: their pair selection and research question differed from mine, as I explain under prior work.

I wrote up the first result as "Headline signal survives two years of drift."

## Cross-split evaluation

I thought the 2015 result showed that the model could handle changes in headline style over time. Since I eventually want to use this for email, I was interested in how well it worked beyond the data it trained on.

The archive has three splits: exploratory, confirmatory, and holdout. I'd only used confirmatory so far. Running the same weights on the other two gave me:

```
confirmatory 2015:  0.704
holdout:            0.637
exploratory:        0.624
```

Holdout and exploratory were within 0.013 of each other at every effect-size tier I checked. Both scored well below the confirmatory 2015 set.

![Pairwise accuracy across three splits of the Upworthy archive. The confirmatory 2015 line sits well above holdout and exploratory, which track each other closely.](/assets/img/blog/decision-models/splits.png)

## Split structure

The archive documentation explains that tests are assigned to its three splits at random. Each split covers almost the entire period:

![Two bars. The first shows a clean chronological split, train then test. The second shows the real structure: train and test blocks interleaved across the whole period.](/assets/img/blog/decision-models/split-structure.png)

| Split | Arms | Date range | Share before 2015 |
|---|---|---|---|
| confirmatory | 51,891 | 2013-01-24 → 2015-04-30 | 83.5% |
| holdout | 11,231 | 2013-01-24 → 2015-04-29 | 82.8% |
| exploratory | 10,804 | 2013-01-26 → 2015-04-29 | 83.8% |

About 83% of holdout came from inside the training period, yet accuracy there was seven points below the 2015 tail. So the gap wasn't explained by newer headlines being harder. My date-based evaluation inside confirmatory wasn't enough to establish the temporal generalisation I'd claimed.

## Leakage and label noise

I checked for leakage next. Upworthy reused articles across tests, so random assignment could put similar headlines in both training and evaluation.

My first check only looked for exact matches and found five shared headlines out of 650. That missed near-duplicates. I used an inverted index to measure the maximum Jaccard token overlap between each evaluation headline and the 47,168 training headlines.

| Evaluation set | n | ≥0.9 overlap | median |
|---|---|---|---|
| confirmatory 2015 | 1,300 | 0.5% | 0.227 |
| holdout | 4,274 | **30.5%** | 0.300 |

Holdout had about sixty times as many near-duplicates proportionally, despite its lower accuracy. Removing them gave 0.646, slightly above 0.637. This check didn't explain the gap or show an accuracy benefit from the near-duplicates.

I also checked whether holdout had fewer impressions or noisier labels:

| Evaluation set | median impressions | median z | median CTR ratio |
|---|---|---|---|
| confirmatory 2015 | 2,462 | 2.37 | 2.24 |
| holdout | 3,096 | 2.64 | 1.99 |

Holdout had more impressions and higher z-scores. The 2015 pairs did have a wider median CTR ratio, 2.24 against 1.99, which could make them easier to separate. I still couldn't account for the full gap, so I recorded it as unexplained and used roughly 0.63 as the baseline supported by the two other splits.

## Ablations

I then compared adding training data with changing the loss function. Including exploratory brought the available training set to 62,695 arms. I evaluated each configuration on the same 2,137 holdout pairs, one best-versus-worst pair per test.

```
Phase 0        confirmatory       MSE              0.637
more-data      expl+confirmatory  MSE              0.724
rank           confirmatory       Bradley-Terry    0.775
rank+more      expl+confirmatory  Bradley-Terry    0.787
```

![Ablation results. Adding data gains 0.087 over the baseline; switching to Bradley-Terry gains 0.138, and the best run reaches 0.812.](/assets/img/blog/decision-models/ablations.png)

Adding data improved accuracy by **0.087**. Switching to Bradley-Terry improved it by **0.138**, using the smaller training set and two epochs instead of three.

I'd been training a click-rate regressor and evaluating whether it ranked pairs correctly. A ranking loss was a better fit for that evaluation.

[Bradley-Terry](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) trains on pairwise preferences. For every pair of arms inside one test, I maximized `logsigmoid(score_winner - score_loser)`, weighted by the log impressions of the arm with fewer impressions. The 47,168 training arms produced 76,892 within-test pairs.

ModernBERT-*base* reached 0.761 with a third of the parameters, making it an option for running on a CPU.

The DeBERTa-v3-large variant pretrained on decision tasks initially failed to learn. Its loss stayed at `-log(0.5)` for all 4,804 steps, and it scored 0.519.

The flat loss made me check the training setup. The encoder had loaded correctly; only the classifier and pooler were freshly initialized.

I'd reused ModernBERT's learning rate of 2e-5. After finding reports of [DeBERTa training instability](https://github.com/microsoft/DeBERTa/issues/77), I tried 6e-6.

At 6e-6, the loss went 0.709 → 0.682 → 0.620 → 0.360. Accuracy reached **0.812**, two and a half points above ModernBERT, and 0.913 on the highest-confidence tier.

On pairs that passed the near-duplicate filter, it scored **0.797** against ModernBERT's 0.769. Its accuracy dropped less after filtering, too.

## Calibration and realised lift

Pairwise accuracy doesn't tell me how many extra clicks the model's choices would get. That depends on the size of the differences between variants.

For each test, I compared the observed click rate of the model's top-scored arm with the mean across that test's arms. The mean represents choosing a variant uniformly at random; it doesn't represent an editor choosing one.

| | CTR |
|---|---|
| Test mean, no model | 1.20% |
| Model's pick | 1.42% |
| Oracle, perfect pick | 1.60% |

That's **+18.3% relative click rate** across 2,140 tests.

### What this says about other audiences

The 18.3% depends on Upworthy's 1.20% base rate and the spread between its headline variants. I don't know what the lift would be for a B2B newsletter with a 2.5% click rate and more similar subject lines.

I also measured how often the model made useful choices within a test. These measures are less tied to the absolute click rate, but they still need testing on other audiences:

| Measure | Value |
|---|---|
| Avoids the worst variant | **90.3%** |
| Beats the test average | 76.6% |
| Picks the actual best variant | 47.7% |
| Headroom captured, median test | 89.2% |
| Spearman, score vs click rate | 0.526 |

Avoiding the worst variant 90.3% of the time is useful here, compared with 75.1% for random selection. The 47.7% best-variant accuracy is about 1.9× the 24.9% chance baseline. Neither result establishes how it would perform on email.

Headroom captured varies a lot: the median is 89.2%, the interquartile range is 5% to 100%, and the pooled value is 55.4%. The high median doesn't mean the model captures that much of the total available gain.

I fitted an [isotonic regression](https://en.wikipedia.org/wiki/Isotonic_regression) to map scores to expected lift. It fits a monotonic relationship without imposing a particular curve shape. Bradley-Terry learns an ordering; it doesn't make the raw scores calibrated click rates. I bootstrapped over tests because arms within a test share an article and aren't independent.

| Score | vs base | 90% interval |
|---|---|---|
| −2.72 | **−19.1%** | [−0.252, −0.209] pp |
| −1.06 | −8.2% | [−0.111, −0.086] pp |
| −0.20 | −0.7% | [−0.023, −0.000] pp |
| +0.56 | +3.7% | [+0.030, +0.056] pp |
| +1.62 | +11.1% | [+0.115, +0.147] pp |
| +2.82 | **+21.8%** | [+0.231, +0.274] pp |

![Calibration curve. Estimated click-rate difference from baseline rises monotonically with model score, with 90% intervals.](/assets/img/blog/decision-models/calibration.png)

The middle scores map to small estimated differences from baseline. These intervals describe calibrated lift, not whether two particular headlines are equivalent.

## Prior work on this archive

Other work on this archive uses different tasks, inputs, and evaluation subsets:

| Source | Task | Metric | Value | Chance |
|---|---|---|---|---|
| LOLA, humans (n=4,571) | top-1 of k | accuracy | ~chance | 0.330 |
| LOLA, GPT-4 in-context | top-1 of k | accuracy | 0.400 | 0.330 |
| LOLA, LoRA Llama-3-8B | top-1 of k | accuracy | 0.469 | 0.330 |
| LOLA, fine-tuned GPT-4o | top-1 of k | accuracy | 0.488 | 0.330 |
| [arXiv:2506.00152](https://arxiv.org/abs/2506.00152), Pythia-12B | significant pairs, + lede + timestamp | ROC AUC | 0.82 | 0.50 |
| [PLOS ONE 0281682](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682) | pairs matched on article+image+week, K≤15 | accuracy | 0.544 | ~0.50 |
| **VERA** | every within-test pair, headline only | accuracy | **0.689** | 0.524 |

The 0.544 paper matches pairs on article, image, and testing week, then randomly subsamples experiments with more than 15 pairs. It trains on 5,048 pairs. It's a registered report testing whether prediction can beat chance, so comparing that number directly with my model's accuracy overstates what I've shown.

The Pythia-12B reward model reports ROC AUC of 0.82. It trains on pairs whose CTR difference is significant at 5%, roughly 28% of pairs, and reads the article lede and post timestamp as well as the headline. Its AUC and my accuracy aren't interchangeable, so those numbers don't establish which model is better.

I haven't found a published result reporting pairwise accuracy from a fine-tuned encoder on unfiltered within-test pairs using headline text alone. That makes this a useful additional evaluation, but it doesn't establish a state-of-the-art result.

## Baselines measured here

I ran Gemini 3.1 Pro and Laya on my evaluation pairs to get a direct comparison.

I presented each pair twice, swapping the headline order, and kept a prediction only when both orders selected the same headline. This checks for position bias. The table reports accuracy on matched pairs and the fraction of predictions that were consistent across both orders; accuracy alone leaves out how often a system failed that check.

| System | Params | Matched pairs | Self-consistent |
|---|---|---|---|
| **VERA** | 435M | **0.823** | — |
| Gemini 3.1 Pro | frontier | 0.751 | 83.7% |
| Laya typed-decisions | 421M | 0.504 | 52.9% |

VERA scored about seven percentage points above Gemini on the matched pairs, at roughly a thousandth of the cost per call. The Gemini evaluation cost $5.60. I'd previously cited human chance-level performance as evidence this would be hard for models too; Gemini's 0.751 doesn't support that assumption.

Laya scored 0.504 and gave consistent answers on 52.9% of pairs. Its model card covers invoice processing, security incidents, customer service, and agent traces. This evaluation tests it outside those domains, so I wouldn't use the result to judge its performance on those tasks.

Gemini also scored 0.641 on pairs whose click-rate gap wasn't significant at 5%, against a 0.500 chance baseline. VERA scored 0.696 on that stratum. I'd been calling those pairs noise, but failing a significance threshold doesn't mean there's no predictive signal. Gemini wasn't fine-tuned on these labels; its result supports that distinction, though it doesn't rule out leakage in VERA's evaluation.

## Domain transfer

The Upworthy results come from one publisher's viral social headlines in 2013–2015. I still want to score email subject lines.

A B2B newsletter going to 4,000 subscribers is a different setting, and doing well on Upworthy doesn't tell me whether this will work there.

For an initial transfer test, I used SNAP's Reddit dataset: 132,308 submissions across 16,242 images, with each image submitted under different titles about eight times on average.

These submissions weren't randomized. I formed pairs within the same image and subreddit, fitted the decline in performance against resubmission index per subreddit, and ranked the residuals. I only kept pairs with a residual gap large enough to call a winner.

117,118 pairs. VERA scores **0.522**. Chance is 0.500. A "longer title wins" rule gets 0.507.

Treating pairs as independent gives a standard error of 0.0015, about fifteen standard errors above chance. Pairs share images, though, so that calculation alone isn't enough to establish significance. Accuracy rises from 0.508 to 0.531 across residual-gap quartiles and ranges from 0.495 on r/WTF to 0.558 on r/fffffffuuuuuuuuuuuu. Either way, 0.522 isn't useful enough for what I want to build.

Reddit upvotes aren't click rates, and I haven't controlled for time of day or submitter reputation. The weak result could reflect poor transfer, those confounds, or both. It gives me no basis for promising useful performance outside Upworthy.

To test email directly, I need subject lines with measured send outcomes. I couldn't find a public dataset suitable for training:

| Source | Size | Availability |
|---|---|---|
| Return Path subject-line study | 9M subject lines | Proprietary, 2015, never released |
| Belkins B2B corpus | 5.5M emails | Aggregate statistics only |
| Yahoo (IEEE 7004277) | 100k+ lines, billions of impressions | Proprietary |
| Oracle's NLORP paper | 300 lines | Scraped off Google, rates not measured |
| Various Kaggle "email campaign" sets | varies | Mock or synthetic |

The Oracle paper, for example, uses "300+ different subject lines of special deal emails, picked up from multiple internet sources via google search." Those don't come with measured rates. Aggregate findings about subject-line length or wording don't give me the per-send labels this training setup needs either.

## Data availability

The training data is public and the weights cost me about four dollars to produce. This is a reproducible experiment, and I still need to find out whether the approach works on email.

Email providers and newsletter operators with A/B testing logs could supply the relevant data. I'd need subject-line variants and their measured outcomes, then a way to evaluate predictions on new sends. I don't have that setup yet.

## Generalisation

I'd like to try this on other decisions with recorded outcomes. If you use an experimentation platform such as Optimizely, Statsig, or LaunchDarkly, you may already have candidate variants and results to work with. Some possible tasks:

| Decision | The label you already have |
|---|---|
| Subject lines, headlines, push copy | opens, clicks |
| Support macro selection | resolved without escalation |
| Retrieval reranking | which result the user accepted |
| Error message wording | self-served, or filed a ticket |
| Product listing titles | conversions |
| Agent tool choice | did the trajectory succeed |

I'm particularly interested in agent tool choice. Jev's three primitives are `choice`, `score`, and `noul`; this experiment uses `score`. Trying it with `choice` would require logs of the available options, the selected tool, and what happened afterward. Those logs would still need checking for whether they support a fair comparison.

So far I've tested outcome training against zero-shot judgment on one task. I don't know whether the advantage holds for any of these others.

## VERA

**V**ariant **E**valuation from **R**eal **A**nalytics.

**[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)**, Apache 2.0.

```python
from transformers import AutoModelForSequenceClassification, AutoTokenizer

tok = AutoTokenizer.from_pretrained("NovusEdge/vera-deberta-v3-large")
model = AutoModelForSequenceClassification.from_pretrained(
    "NovusEdge/vera-deberta-v3-large")

# Score a set of candidates for ONE piece of content. Higher wins.
enc = tok(candidates, padding=True, truncation=True, max_length=64,
          return_tensors="pt")
scores = model(**enc).logits.squeeze(-1)
```

Use the scores to compare candidates for the same piece of content, for example 3 to 6 variants for one send. The final model learned within-test rankings, so a raw score isn't an absolute measure of quality or a click probability. The weights also include a calibrator fitted to the Upworthy results.

There's also a smaller ModernBERT-base model for CPU use. It gets 0.761 on the best-versus-worst evaluation with a third of the parameters.

## Limitations

I haven't tested this on email, and the Reddit result was weak. The Upworthy scores shouldn't be treated as expected performance for a newsletter.

If you run one and have past sends with measured open or click rates, hit me up. I'd like to test it, and the data stays yours.

## Corrections

On 2026-09-24, a review of the evaluation code found several problems.

My evaluation called `pairs_from`, which keeps one pair per test: the best arm against the worst. Training built every pair. The 0.812 result therefore measured only the widest-gap pair in each test. Across all 18,485 within-test pairs, accuracy is **0.689** against a 0.524 baseline.

| Pair set | n | Length baseline | VERA |
|---|---|---|---|
| every within-test pair | 18,485 | 0.524 | **0.689** |
| best arm against worst, one per test | 2,137 | 0.546 | 0.812 |

I also ran plain `microsoft/deberta-v3-large` through the identical recipe. It scores 0.805 against 0.812 on the same set, a difference smaller than the reported standard error of 0.009. This doesn't establish a benefit from typed-decision pretraining. Lowering the learning rate fixed training for either base.

The ablations above all use the original 2,137-pair set, so they can be compared with each other on that evaluation. They aren't all-pairs results.

Also fixed: the calibrator shipped in the weights had been fitted on a different run, my bootstrap used `.isin()` on a sample drawn with replacement and so dropped the duplicates, and the chance baselines were two points off because I had not computed them from the actual arm counts.

The opening table reports the corrected results. The earlier runs remain in the account above with their evaluation subset identified.

---

*Data: [The Upworthy Research Archive](https://osf.io/jd64p/). Matias, J., Munger, K., Le Quere, M.A., Ebersole, C. (2021), Nature Scientific Data. CC BY 4.0. Experiments run between June 25 2013 and January 10 2014 are excluded throughout for the randomization failure the maintainers disclosed in 2024. Weights DOI: [10.57967/hf/10573](https://doi.org/10.57967/hf/10573).*
