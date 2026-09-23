---
title: Fine-tuning OpenJev on 62,695 A/B Tests
date: 2026-09-23
tags: [ml, decision-models, calibration, open-weights, benchmarks]
draft: false
description: Open weights for a decision model trained on measured A/B outcomes instead of another model's opinion. It avoids the worst of your variants 90% of the time. Plus the part where my first benchmark was measuring nothing.
---

There are roughly 300 public projects built on the new decision models. I went through the "scoring and ranking" category — 26 of them — and every single one scores things by asking the model what it thinks.

Score this article on eight quality axes. Rate this copy for taste. Judge whether this document is relevant.

That is not data. That is a model's opinion with a number attached to it, and the entire category is built on it.

So here are open weights for one trained on outcomes somebody actually measured.

**[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)** — Apache 2.0, 435M params, one forward pass, scores short persuasive text. Base is [`com-kotobalabs/open-jev-deberta-v3-large`](https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large), itself DeBERTa-v3-large pretrained on typed decisions.

| Measure | This model | Published SOTA | Humans |
|---|---|---|---|
| Pairwise accuracy, unseen split | **0.812** | 0.544 | ~chance |
| Clean pairs only | **0.797** | — | — |
| Avoids the worst variant | **90.3%** | — | — |

Trained on 62,695 real A/B arms from 32,487 randomized headline experiments. Every number above comes from a split the model never saw.

Below is how it got there, including the part where my first benchmark was measuring nothing at all.

## The setup

Turns out there's a perfect dataset for this and it's been sitting in the open since 2021. Between January 2013 and April 2015, Upworthy — yes, *that* Upworthy, the "you won't believe what happened next" people — ran 32,487 randomized A/B tests on their headlines. Real traffic, real randomization, 538 million assignments. Then Cornell published the whole thing as [the Upworthy Research Archive](https://osf.io/jd64p/) under CC BY.

Every headline variant. Every impression. Every click.

This is as close to ground truth as short persuasive text gets. You have the thing that was written, and you have what happened when real humans saw it, and the assignment was random so the comparison actually means something.

So: ModernBERT-large, a regression head, target is the shrunk logit click rate centred on each test's own mean. That centring matters — the *article* drives most of the click-rate variance and a headline can't explain it, so what you want to predict is how far an arm deviates from the mean of the test it ran in. Beta-binomial shrinkage toward that mean so an arm with 600 impressions counts as mostly prior and one with 20,000 counts as mostly evidence.

Twenty-five minutes on a single L4. About forty cents.

Held out everything after January 2015, tested there. **0.704 pairwise accuracy.**

For scale: the published state of the art on this exact dataset is [0.544](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682), from a Toronto group using hand-crafted linguistic features on 24,333 pairs. Their paper concludes the problem is "inherently hard, not merely a sample size issue." Humans given the same task score at chance. There's a LoRA'd Llama-3-8B in the literature that gets 0.469, which is *below* chance.

Sixteen points over the published number, for forty cents. I wrote it up: "Headline signal survives two years of drift."

## And yet

Here's the thing about that writeup — the claim in the title was that signal survives *drift*. Training data was 2013–2014, test set was 2015, and the accuracy barely moved. Two years of shifting internet culture and the model didn't care. That's a real finding if it's true, because the whole point of this exercise is eventually pointing it at email subject lines, and if a model can't survive two years inside one publisher it definitely won't survive the jump to a different medium entirely.

The archive ships in three splits: exploratory, confirmatory, holdout. I'd trained and tested on confirmatory. So — mostly out of diligence, mostly expecting to confirm what I already knew — I scored the same weights on the other two.

```
confirmatory 2015:  0.704
holdout:            0.637
exploratory:        0.624
```

Cool.

Two splits I'd never touched, agreeing with each other within 0.013 at *every single effect-size tier*, and both of them saying my headline number was inflated by seven points.

![Pairwise accuracy across three splits of the Upworthy archive. The confirmatory 2015 line sits well above holdout and exploratory, which track each other closely.](/assets/img/blog/decision-models/splits.png)

That red line is the one I posted about. The two underneath it are the truth.

## The time machine that only travels sideways

So I read the archive documentation properly.

The archive assigns tests to splits **at random**. Not chronologically. At random.

![Two bars. The first shows a clean chronological split, train then test. The second shows the real structure: train and test blocks interleaved across the whole period.](/assets/img/blog/decision-models/split-structure.png)

| Split | Arms | Date range | Share before 2015 |
|---|---|---|---|
| confirmatory | 51,891 | 2013-01-24 → 2015-04-30 | 83.5% |
| holdout | 11,231 | 2013-01-24 → 2015-04-29 | 82.8% |
| exploratory | 10,804 | 2013-01-26 → 2015-04-29 | 83.8% |

All three splits cover the same dates in the same proportions. Which means when I scored on holdout, 83% of what I was testing came from *inside the training period*. Same era. Same house style. Same everything — just tests the model had never seen.

And it scored *worse* there than on the 2015 tail.

Flip that around. Time costs this model almost nothing. Unseen tests from the same period cost it seven points. My carefully constructed drift test had been measuring test identity the whole time, dressed up as temporal generalization.

I'd built a time machine that only travels sideways.

## Two hypotheses, both backwards

Obviously the next thought is leakage. Upworthy rewrote the same article under dozens of headline variants, and if you're splitting *tests* at random then one article's rewrites scatter across all three splits. So holdout should be full of near-copies of the training text.

I wrote a quick inverted-index thing to measure maximum Jaccard token overlap between each evaluation headline and the 38,950 headlines the model actually fit on. Exact string matching had found five shared headlines out of 650. I had called leakage "ruled out" on that basis.

| Evaluation set | n | ≥0.9 overlap | median |
|---|---|---|---|
| confirmatory 2015 | 1,300 | 0.5% | 0.227 |
| holdout | 4,274 | **30.5%** | 0.300 |

Thirty percent. Sixty times more contaminated than the 2015 tail.

And it scored **lower**.

So leakage doesn't explain the gap. It runs the wrong direction entirely — if anything it means the honest holdout number should be *worse* than 0.637 once you strip the near-copies out. (I checked that too, by dumping per-pair scores and slicing them. On genuinely clean pairs the model got 0.646. Slightly *better*. The near-duplicates were buying it nothing at all.)

Fine. Label noise, then? If holdout pairs have fewer impressions, the observed winner is more often not the true winner, and that caps how well anything can score.

| Evaluation set | median impressions | median z | median CTR ratio |
|---|---|---|---|
| confirmatory 2015 | 2,462 | 2.37 | 2.24 |
| holdout | 3,096 | 2.64 | 1.99 |

Also backwards. Holdout pairs carry *more* impressions and *higher* z-scores. Their labels are the more trustworthy ones.

The 2015 set does have a wider median CTR ratio — 2.24 against 1.99 — so its pairs are genuinely easier to separate. That's real. It is also nowhere near seven points' worth.

I wrote "unexplained" in the doc and moved on. 0.63 is the number. Two independent splits agree on it. The one that disagrees is the outlier, and I cannot tell you why.

**!! Nerd Infodump Alert :3 !!**

## The part that actually mattered

Having demolished my own headline result, I ran the ablations properly.

I expected data to win. That is the boring prior: 62,695 arms, throw the third split in, get more. I set up two runs: one adding the exploratory split to training, one swapping the loss function. Both evaluated on the same 2,137 holdout pairs.

```
Phase 0        confirmatory       MSE              0.637
more-data      expl+confirmatory  MSE              0.724
rank           confirmatory       Bradley-Terry    0.775
rank+more      expl+confirmatory  Bradley-Terry    0.787
```

![Ablation results. Adding data gains 0.087 over the baseline; switching to Bradley-Terry gains 0.138, and the best run reaches 0.812.](/assets/img/blog/decision-models/ablations.png)

Twenty-eight percent more training data: **+0.053**.

Changing the loss function: **+0.107**.

Two epochs instead of three, on the smaller training set, and it still won by double.

Obvious in hindsight, which is the worst kind. The benchmark is *pairwise accuracy*: given two headlines, pick the winner. I was regressing on click rate. I optimized a proxy for the metric, then measured myself on the metric.

[Bradley-Terry](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) optimizes the actual thing. For every pair of arms inside one test, maximize `logsigmoid(score_winner - score_loser)`, weighted by the thinner arm's log impressions because the comparison is only as trustworthy as the side with fewer impressions. My 38,950 training arms expanded into 63,597 within-test pairs.

Same model. Same data. Different objective. Fourteen points.

I also ran ModernBERT-*base* out of curiosity — a third the parameters — and it hit 0.761. So most of this lives in the objective and the data, not in the model size, which is good news if you ever want to run the thing on a CPU.

Then there's the one that nearly got away. I tried a DeBERTa-v3-large variant that had been pretrained on decision tasks, and it sat at exactly `-log(0.5)` for all 4,804 steps and scored 0.519. Chance. Dead flat.

Easy to read that as "DeBERTa is worse" and move on, which is what I almost did. But the loss curve being *perfectly* flat at the value that means "the model is guessing" is a very specific signature, and it isn't what a model that's learning-but-badly looks like. The encoder had loaded fine — only the classifier and pooler were newly initialized, which is exactly what you expect.

It was the learning rate. DeBERTa-v3-large is [notoriously unstable](https://github.com/microsoft/DeBERTa/issues/77) at the 2e-5 that ModernBERT is happy with; it wants something nearer 6e-6. I'd used one config for both because why wouldn't you.

Reran it at 6e-6. Loss went 0.709 → 0.682 → 0.620 → 0.360 and it finished at **0.812**, which is the best number in the whole project. It beat ModernBERT by two and a half points, and hit 0.913 on the highest-confidence tier.

Ran the near-duplicate slice on it too, because at this point I don't trust myself. On genuinely clean pairs — nothing resembling anything in training — it gets **0.797**, against ModernBERT's 0.769. And its memorization gap is *smaller* than ModernBERT's while scoring higher, which is the opposite of what a model winning by recall looks like.

The system is functioning as designed. The system was functioning as designed the entire time. I just had one number wrong.

## But what does 0.812 actually *mean*

Nothing, to a human. That is the problem with pairwise accuracy as a claim: it says the ordering is right and carries no magnitude. Ordering two headlines correctly 81.2% of the time could be worth a fortune or worth nothing, depending on how far apart they actually are.

So I measured what an operator experiences. For each test, take the model's top-scored arm and compare its real click rate against the mean of all arms in that test. Without a model you have no reason to prefer any particular variant, so the mean of what you might have sent is the honest counterfactual.

| | CTR |
|---|---|
| Test mean, no model | 1.20% |
| Model's pick | 1.42% |
| Oracle, perfect pick | 1.60% |

**+18.3% relative click rate**, across 2,140 tests.

And now I have to immediately take that number away from you.

### The lift number does not travel

18.3% is a fact about Upworthy. It depends on their 1.20% base rate and on how much spread their writers put between variants. Point this at a B2B newsletter with a 2.5% click rate and tighter variants and the number changes, in a direction I cannot predict.

What *does* travel is anything shaped as a ratio inside a single test:

| Measure | Value |
|---|---|
| Avoids the worst variant | **90.3%** |
| Beats the test average | 76.6% |
| Picks the actual best variant | 47.7% |
| Headroom captured, median test | 89.2% |
| Spearman, score vs click rate | 0.526 |

**90.3% is the claim I would actually make.** It almost never lets you send the worst thing you wrote. That survives a change of base rate, audience and medium in a way that "+18.3%" does not.

47.7% top-1 against typically four or five arms is about 2.2× chance.

One number in there is doing something sneaky and deserves calling out. Median headroom captured is 89.2%, with an interquartile range of 5% to 100%. Pooled across all tests it is 55.4%. The model is bimodal: on most tests it takes nearly all the available gain, and on a minority it takes almost none, and those drag the aggregate down. Quoting the median alone would flatter it. Quoting the pooled figure alone would undersell the typical case.

Then I fitted an [isotonic regression](https://en.wikipedia.org/wiki/Isotonic_regression) on top so the score has units instead of vibes. Isotonic is the right call here specifically because it assumes only monotonicity — higher score means higher click rate — which is exactly what Bradley-Terry guarantees and precisely all it guarantees. Anything parametric would be inventing structure the model never promised. Intervals come from bootstrapping over *tests* rather than arms, since arms inside one test share an article and aren't independent.

| Score | vs base | 90% interval |
|---|---|---|
| −2.72 | **−19.1%** | [−0.252, −0.209] pp |
| −1.06 | −8.2% | [−0.111, −0.086] pp |
| −0.20 | −0.7% | [−0.023, −0.000] pp |
| +0.56 | +3.7% | [+0.030, +0.056] pp |
| +1.62 | +11.1% | [+0.115, +0.147] pp |
| +2.82 | **+21.8%** | [+0.231, +0.274] pp |

![Calibration curve. Click rate versus baseline rises monotonically with model score, with 90% intervals that cross zero only near the middle.](/assets/img/blog/decision-models/calibration.png)

Forty-one points of spread between the worst and best subject line you might send. And notice the middle rows — the intervals cross zero there, which is the model correctly reporting "these two are the same headline, flip a coin." A scorer that can say *I don't know* is worth considerably more than one that can't.

## Okay here's where I ruin it

Every single number above comes from 2013–2015 viral social headlines at one publisher.

The thing I actually want to build scores email subject lines.

These are not the same. A B2B newsletter going to 4,000 people who opted in shares almost nothing with "This Kid Just Destroyed The Entire Argument Against Vaccines In One Sentence." Different medium, different audience, different decade, different everything.

So I went looking for public email data with real measured send outcomes.

There is none.

| Source | Size | Availability |
|---|---|---|
| Return Path subject-line study | 9M subject lines | Proprietary, 2015, never released |
| Belkins B2B corpus | 5.5M emails | Aggregate statistics only |
| Yahoo (IEEE 7004277) | 100k+ lines, billions of impressions | Proprietary |
| Oracle's NLORP paper | 300 lines | Scraped off Google, rates not measured |
| Various Kaggle "email campaign" sets | varies | Mock or synthetic |

One of those is an arXiv paper from two Oracle principal data scientists whose entire dataset is "300+ different subject lines of special deal emails, picked up from multiple internet sources via google search." I'm not dunking — that's just what's available.

The aggregate findings float around freely. Six to ten words performs best. Twenty-one to forty characters for opens. Numbers are worth a few points. None of it is per-send outcome data and none of it trains anything.

## Which reframes the whole exercise

I had been telling myself a comforting story. An adversarial second opinion knocked it over. The story was: *the architecture is commodity, the durable asset is proprietary outcome labels.* First half's right. Second half is nonsense, because I don't *have* proprietary labels. Upworthy is public. Anyone with a GPU reproduces my 0.812 in a weekend for less than a coffee. Which is part of why the weights are up there — they cost me four dollars and I cannot pretend they are a moat.

What I have is a credential. The asset would be an ongoing measurement loop on live traffic, and that doesn't exist yet.

That is clarifying, because it says where the real thing is: the data I need is sitting inside email service providers, doing nothing. Every ESP with an A/B testing feature has millions of subject-line experiments with measured outcomes, and approximately none of them are training anything on it.

That's the move. Not another head, not another benchmark. One relationship with somebody who has the logs.

## The thing this generalises to

The recipe here is dull enough to state in one line: if a measured outcome exists, train on it, and stop asking a model for its opinion.

What makes that worth saying is where the outcomes already are. Every A/B test your company has ever run is sitting in an experimentation platform, labelled, with the result attached, doing nothing. Optimizely, Statsig, LaunchDarkly, whatever you use — years of "we tried these five and this one won," and nobody has trained anything on it.

Anywhere you have a candidate set and a downstream number, the same recipe applies:

| Decision | The label you already have |
|---|---|
| Subject lines, headlines, push copy | opens, clicks |
| Support macro selection | resolved without escalation |
| Retrieval reranking | which result the user accepted |
| Error message wording | self-served, or filed a ticket |
| Product listing titles | conversions |
| Agent tool choice | did the trajectory succeed |

That last row is the interesting one for anybody building agents. Jev's three primitives are choice, score and noul. Everything in this post touches `score`. The same move applies to `choice` wherever somebody logged what happened after the decision — which for most agent routing is nobody, yet.

One honest limit on all of this: I have exactly one data point. Outcome-training beat zero-shot judgment by a lot *on one task*. Whether that margin holds anywhere else is untested, and I would not bet the number, only the direction.

## VERA

**V**ariant **E**valuation from **R**eal **A**nalytics.

**[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)** — Apache 2.0.

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

Read it as a set, never as a single number. The training target was deviation from a test's own mean, so a lone score in isolation means nothing. Give it the 3–6 variants you wrote for one send and it ranks them. A calibrator mapping score to expected lift ships alongside.

A CPU-sized version is up too if 435M is too much: ModernBERT-base gets 0.761 at a third the parameters.

## What it will not do

Transfer to email. I have no idea whether it does. Everything here is 2013–2015 viral social headlines at one publisher, and a B2B newsletter shares close to nothing with "This Kid Just Destroyed The Entire Argument Against Vaccines In One Sentence."

If you run a newsletter and you have past sends with measured open or click rates, I would very much like to find out. That is an open offer and the data stays yours.

## The takeaway

One of the open-weight models in this space scores 0.362 on its own typed-decisions benchmark zero-shot, below the 0.461 majority-class baseline. It needs task-specific fine-tuning to get anywhere. The architecture on its own does very little.

The gap between 0.544 and 0.812 was not clever modeling. Two-thirds came from picking a loss that matched the metric. The rest came from 62,695 rows where somebody measured what actually happened.

Stop labelling your data with a model. Go find some ground truth.

---

*Data: [The Upworthy Research Archive](https://osf.io/jd64p/) — Matias, J., Munger, K., Le Quere, M.A., Ebersole, C. (2021), Nature Scientific Data. CC BY 4.0. Experiments conducted between June 25 2013 and January 10 2014 are excluded throughout for the randomization failure the maintainers disclosed in 2024.*
