---
title: Fine-tuning OpenJev on 62,695 A/B Tests
date: 2026-09-23
tags: [ml, decision-models, calibration, open-weights, benchmarks]
draft: false
description: I trained a decision model on A/B tests people actually ran instead of asking another model what it thinks, it dodges your worst variant 90% of the time, and my first benchmark was measuring literally nothing lol
---

So there's roughly 300 public projects built on the new decision models, and I went through the "scoring and ranking" ones (26 of them) and every single one of them scores stuff by just asking the model what it thinks. Score this article on eight quality axes, rate this copy for taste, judge whether this doc is relevant, you get the idea.

And like, that's not data? That's a model's opinion with a number stapled to it, and the whole category is built on top of that ngl.

So I trained one on outcomes somebody actually measured, and the weights are up if you wanna poke at it: **[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)**, Apache 2.0, 435M params, one forward pass, it scores short persuasive text. The base is [`com-kotobalabs/open-jev-deberta-v3-large`](https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large), which is itself DeBERTa-v3-large pretrained on typed decisions.

| Measure | This model | Published SOTA | Humans |
|---|---|---|---|
| Pairwise accuracy, unseen split | **0.812** | 0.544 | ~chance |
| Clean pairs only | **0.797** | - | - |
| Avoids the worst variant | **90.3%** | - | - |

It's trained on 62,695 real A/B arms from 32,487 randomized headline experiments, and every number up there comes from a split the model never saw. How it got there is below, including the bit where my first benchmark was measuring absolutely nothing (yes I'm still a bit salty about it).

## The setup

Turns out there's a perfect dataset for this and it's been sitting out in the open since 2021. Between January 2013 and April 2015 Upworthy (yes, *that* Upworthy, the "you won't believe what happened next" people) ran 32,487 randomized A/B tests on their headlines, real traffic, real randomization, 538 million assignments, and then Cornell went and published the whole thing as [the Upworthy Research Archive](https://osf.io/jd64p/) under CC BY. Every headline variant, every impression, every click.

That's about as close to ground truth as short persuasive text gets.

So: ModernBERT-large with a regression head, and the target is the shrunk logit click rate centred on each test's own mean. The centring matters btw, the *article* drives most of the click-rate variance and a headline can't explain that, so what you actually wanna predict is how far an arm sits from the mean of the test it ran in. Then beta-binomial shrinkage toward that mean, so an arm with 600 impressions counts as mostly prior and one with 20,000 counts as mostly evidence.

Twenty-five minutes on a single L4, about forty cents. I held out everything after January 2015, tested there, and got **0.704 pairwise accuracy.**

For scale, the published state of the art on this exact dataset is [0.544](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682), from a Toronto group using hand-crafted linguistic features on 24,333 pairs, and their paper concludes the problem is "inherently hard, not merely a sample size issue." Humans given the same task score at chance, and there's a LoRA'd Llama-3-8B in the literature that gets 0.469 lmao.

Sixteen points over the published number, for forty cents. So obviously I wrote it up: "Headline signal survives two years of drift."

## And yet

The claim in that title was that signal survives *drift*, since training data was 2013 to 2014, the test set was 2015, and accuracy barely moved, like two years of shifting internet culture and the model just didn't care. That'd be a real finding if it's true, and it matters because the whole point of this is eventually pointing it at email subject lines, and if it can't survive two years inside one publisher it's definitely not surviving the jump to a completely different medium.

The archive ships in three splits (exploratory, confirmatory, holdout) and I'd trained and tested on confirmatory, so mostly out of diligence, and fully expecting to confirm what I already "knew", I scored the same weights on the other two.

```
confirmatory 2015:  0.704
holdout:            0.637
exploratory:        0.624
```

Cool.

Two splits I'd never touched, agreeing with each other within 0.013 at *every single effect-size tier*, and both of them telling me my headline number was inflated by seven points.

![Pairwise accuracy across three splits of the Upworthy archive. The confirmatory 2015 line sits well above holdout and exploratory, which track each other closely.](/assets/img/blog/decision-models/splits.png)

## The time machine that only travels sideways

So I actually read the archive documentation properly this time, and it turns out the archive assigns tests to splits **at random**. Not chronologically, at random.

![Two bars. The first shows a clean chronological split, train then test. The second shows the real structure: train and test blocks interleaved across the whole period.](/assets/img/blog/decision-models/split-structure.png)

| Split | Arms | Date range | Share before 2015 |
|---|---|---|---|
| confirmatory | 51,891 | 2013-01-24 → 2015-04-30 | 83.5% |
| holdout | 11,231 | 2013-01-24 → 2015-04-29 | 82.8% |
| exploratory | 10,804 | 2013-01-26 → 2015-04-29 | 83.8% |

All three splits cover the same dates in the same proportions, which means when I scored on holdout, 83% of what I was testing came from *inside the training period*. Same era, same house style, same everything, just tests the model had never seen, and it still scored *worse* there than on the 2015 tail.

Flip that around and it's kinda funny tbh, time costs this model almost nothing, while unseen tests from the same period cost it seven points. My carefully built drift test had been measuring test identity the whole time, it was just wearing a temporal generalization costume.

I'd built a time machine that only travels sideways.

## Two hypotheses, both backwards

Obviously the next thought is leakage. Upworthy rewrote the same article under dozens of headline variants, so if you split *tests* at random then one article's rewrites scatter across all three splits and holdout should be full of near-copies of the training text.

I wrote a quick inverted-index thing to measure the max Jaccard token overlap between each eval headline and the 38,950 headlines the model actually fit on (exact string matching had found five shared headlines out of 650, and yes, I had called leakage "ruled out" off that).

| Evaluation set | n | ≥0.9 overlap | median |
|---|---|---|---|
| confirmatory 2015 | 1,300 | 0.5% | 0.227 |
| holdout | 4,274 | **30.5%** | 0.300 |

Thirty percent, sixty times more contaminated than the 2015 tail, and it scored **lower**.

So leakage doesn't explain the gap, it runs the complete wrong direction, if anything it means the honest holdout number should be *worse* than 0.637 once you strip the near-copies out. I checked that too by dumping per-pair scores and slicing them, and on genuinely clean pairs the model got 0.646, slightly *better*, so the near-duplicates were buying it nothing at all.

Fine, label noise then? Maybe holdout pairs just have fewer impressions.

| Evaluation set | median impressions | median z | median CTR ratio |
|---|---|---|---|
| confirmatory 2015 | 2,462 | 2.37 | 2.24 |
| holdout | 3,096 | 2.64 | 1.99 |

Also backwards lol. Holdout pairs carry *more* impressions and *higher* z-scores. The 2015 set does have a wider median CTR ratio (2.24 against 1.99) so its pairs are genuinely easier to separate, which is real, but it's nowhere near seven points' worth.

So I wrote "unexplained" in the doc and moved on. 0.63 is the number, two independent splits agree on it, the one that disagrees is the outlier, and I cannot tell you why.

**!! Nerd Infodump Alert :3 !!**

## The part that actually mattered

After demolishing my own headline result I figured I should at least run the ablations properly.

I expected data to win, cause that's the boring prior, you've got 62,695 arms, throw the third split in, get more. So I set up two runs, one adding the exploratory split to training and one swapping the loss function, both evaluated on the same 2,137 holdout pairs.

```
Phase 0        confirmatory       MSE              0.637
more-data      expl+confirmatory  MSE              0.724
rank           confirmatory       Bradley-Terry    0.775
rank+more      expl+confirmatory  Bradley-Terry    0.787
```

![Ablation results. Adding data gains 0.087 over the baseline; switching to Bradley-Terry gains 0.138, and the best run reaches 0.812.](/assets/img/blog/decision-models/ablations.png)

Twenty-eight percent more training data got **+0.053**, and changing the loss function got **+0.107**, on two epochs instead of three and on the smaller training set, and it still won by double.

Which is obvious in hindsight, the worst kind of obvious. The benchmark is *pairwise accuracy*, given two headlines pick the winner, and I was regressing on click rate, so I was optimizing a proxy for the metric and then grading myself on the metric.

[Bradley-Terry](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) optimizes the actual thing. For every pair of arms inside one test you maximize `logsigmoid(score_winner - score_loser)`, weighted by the thinner arm's log impressions. My 38,950 training arms turned into 63,597 within-test pairs.

Same model. Same data. Different objective. Fourteen points.

I also ran ModernBERT-*base* out of curiosity (a third the parameters) and it hit 0.761, so most of this lives in the objective and the data and not in model size, which is nice if you ever wanna run the thing on a CPU.

Then there's the one that nearly got away. I tried a DeBERTa-v3-large variant pretrained on decision tasks, and it sat at exactly `-log(0.5)` for all 4,804 steps and scored 0.519, which is chance, dead flat.

It's easy to read that as "DeBERTa is worse" and move on, and I almost did, but a loss curve that's *perfectly* flat at the exact value that means "I'm guessing" is a really specific signature, and it's not what a model that's learning badly looks like. The encoder had loaded fine too, only the classifier and pooler were freshly initialized.

It was the learning rate. DeBERTa-v3-large is [notoriously unstable](https://github.com/microsoft/DeBERTa/issues/77) at the 2e-5 that ModernBERT is happy with and it wants something closer to 6e-6, and I'd used one config for both cause why wouldn't you.

Reran it at 6e-6, the loss went 0.709 → 0.682 → 0.620 → 0.360, and it finished at **0.812**, two and a half points over ModernBERT, and 0.913 on the highest-confidence tier.

I ran the near-duplicate slice on it too, cause at this point I don't trust myself, and on genuinely clean pairs (nothing resembling anything in training) it gets **0.797** against ModernBERT's 0.769. Its memorization gap is also *smaller* than ModernBERT's while scoring higher, which is the opposite of what a model winning by recall looks like.

So the system was working fine the whole time, I just had one number wrong.

## But what does 0.812 actually *mean*

Honestly, nothing, to a human. That's the problem with pairwise accuracy as a claim, it says the ordering is right and tells you nothing about magnitude, and ordering two headlines correctly 81.2% of the time could be worth a fortune or worth nothing depending on how far apart they actually are.

So I measured what somebody actually sending the thing would feel. For each test, take the model's top-scored arm and compare its real click rate against the mean of all the arms in that test, since without a model you've got no reason to prefer any one variant, so the mean of what you might have sent is the honest counterfactual.

| | CTR |
|---|---|
| Test mean, no model | 1.20% |
| Model's pick | 1.42% |
| Oracle, perfect pick | 1.60% |

That's **+18.3% relative click rate** across 2,140 tests, and I'm gonna have to take it straight back off you.

### The lift number does not travel

18.3% is a fact about Upworthy. It depends on their 1.20% base rate and on how much spread their writers put between variants, so point this at a B2B newsletter with a 2.5% click rate and tighter variants and the number changes, in a direction I genuinely can't predict.

What *does* travel is anything that's a ratio inside a single test:

| Measure | Value |
|---|---|
| Avoids the worst variant | **90.3%** |
| Beats the test average | 76.6% |
| Picks the actual best variant | 47.7% |
| Headroom captured, median test | 89.2% |
| Spearman, score vs click rate | 0.526 |

**90.3% is the one I'd actually stand behind.** It almost never lets you send the worst thing you wrote, and that survives a change of base rate, audience and medium in a way "+18.3%" just doesn't. And 47.7% top-1 against usually four or five arms is about 2.2× chance.

One of those is being a little sneaky tho. Median headroom captured is 89.2%, with an interquartile range of 5% to 100%, and pooled across all tests it's 55.4%. The model's bimodal, on most tests it grabs nearly all the available gain and on a minority it grabs almost none, and those drag the aggregate down.

Then I fitted an [isotonic regression](https://en.wikipedia.org/wiki/Isotonic_regression) on top so the score has units instead of vibes. Isotonic fits here cause it only assumes monotonicity (higher score, higher click rate), which is exactly what Bradley-Terry guarantees and literally all it guarantees, anything parametric would be inventing structure the model never promised. The intervals come from bootstrapping over *tests* rather than arms, since arms inside one test share an article and aren't independent.

| Score | vs base | 90% interval |
|---|---|---|
| −2.72 | **−19.1%** | [−0.252, −0.209] pp |
| −1.06 | −8.2% | [−0.111, −0.086] pp |
| −0.20 | −0.7% | [−0.023, −0.000] pp |
| +0.56 | +3.7% | [+0.030, +0.056] pp |
| +1.62 | +11.1% | [+0.115, +0.147] pp |
| +2.82 | **+21.8%** | [+0.231, +0.274] pp |

![Calibration curve. Click rate versus baseline rises monotonically with model score, with 90% intervals that cross zero only near the middle.](/assets/img/blog/decision-models/calibration.png)

And look at the middle rows, the intervals cross zero there, which is the model correctly going "these two are the same headline, flip a coin".

## Okay here's where I ruin it

Every single number above comes from 2013 to 2015 viral social headlines at one publisher, and the thing I actually wanna build scores email subject lines.

A B2B newsletter going to 4,000 people who opted in shares almost nothing with "This Kid Just Destroyed The Entire Argument Against Vaccines In One Sentence".

So I went looking for public email data with real measured send outcomes, and there is none.

| Source | Size | Availability |
|---|---|---|
| Return Path subject-line study | 9M subject lines | Proprietary, 2015, never released |
| Belkins B2B corpus | 5.5M emails | Aggregate statistics only |
| Yahoo (IEEE 7004277) | 100k+ lines, billions of impressions | Proprietary |
| Oracle's NLORP paper | 300 lines | Scraped off Google, rates not measured |
| Various Kaggle "email campaign" sets | varies | Mock or synthetic |

One of those is an arXiv paper from two Oracle principal data scientists whose entire dataset is "300+ different subject lines of special deal emails, picked up from multiple internet sources via google search." I'm not dunking on them btw, that's just genuinely what's out there.

The aggregate findings float around freely (six to ten words performs best, twenty-one to forty characters for opens, numbers are worth a few points) but none of it is per-send outcome data and none of it trains anything.

## Which reframes the whole exercise

I'd been telling myself a comfy little story until a second opinion knocked it over. The story was *the architecture is commodity, the durable asset is proprietary outcome labels*, and the first half's right but the second half is nonsense, cause I don't *have* proprietary labels. Upworthy is public, anyone with a GPU can reproduce my 0.812 in a weekend for less than a coffee, which is partly why the weights are just up there, they cost me four dollars and I can't pretend they're a moat.

What I actually have is a credential. The real asset would be an ongoing measurement loop on live traffic, and that doesn't exist yet.

The data I need is sitting inside email service providers doing nothing, every ESP with an A/B testing feature has millions of subject-line experiments with measured outcomes, and approximately none of them are training anything on it. So I don't need another head or another benchmark, I need one person who has the logs.

## The thing this generalises to

The recipe is honestly dull enough to fit in one line: if a measured outcome exists, train on it, and stop asking a model for its opinion.

Every A/B test your company has ever run is sitting in some experimentation platform, labelled, result attached, doing nothing. Optimizely, Statsig, LaunchDarkly, whatever you use, it's years of "we tried these five and this one won" and nobody's trained anything on it.

Anywhere you've got a candidate set and a number that shows up downstream, the same thing applies:

| Decision | The label you already have |
|---|---|
| Subject lines, headlines, push copy | opens, clicks |
| Support macro selection | resolved without escalation |
| Retrieval reranking | which result the user accepted |
| Error message wording | self-served, or filed a ticket |
| Product listing titles | conversions |
| Agent tool choice | did the trajectory succeed |

That last row's the fun one if you're building agents. Jev's three primitives are choice, score and noul, and everything in this post touches `score`, but the same move works for `choice` wherever somebody logged what happened after the decision, which for most agent routing is nobody, yet.

One honest limit on all of this tho: I've got exactly one data point. Outcome-training beat zero-shot judgment by a lot *on one task*, and whether that margin holds anywhere else is untested, so I'd bet on the direction, not the number.

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

Read the scores as a set, never as a single number. The training target was deviation from a test's own mean, so one score on its own means nothing, you give it the 3 to 6 variants you wrote for one send and it ranks them. There's a calibrator that maps score to expected lift in there too.

And if 435M is too chunky, there's a CPU-sized one up as well: ModernBERT-base gets 0.761 at a third the parameters.

## What it will not do

Transfer to email, or at least I have no idea whether it does.

So if you run a newsletter and you've got past sends with measured open or click rates, I'd genuinely love to find out, hit me up, and the data stays yours.

## The takeaway

One of the open-weight models in this space scores 0.362 on its own typed-decisions benchmark zero-shot, which is below the 0.461 majority-class baseline.

And the gap between 0.544 and 0.812 wasn't clever modeling either, two-thirds of it came from picking a loss that matched the metric and the rest came from 62,695 rows where somebody measured what actually happened. So yeah, if you're labelling your data by asking a model, maybe go look for the ground truth first, it's probably sitting somewhere already.

---

*Data: [The Upworthy Research Archive](https://osf.io/jd64p/). Matias, J., Munger, K., Le Quere, M.A., Ebersole, C. (2021), Nature Scientific Data. CC BY 4.0. Experiments run between June 25 2013 and January 10 2014 are excluded throughout for the randomization failure the maintainers disclosed in 2024. Weights DOI: [10.57967/hf/10573](https://doi.org/10.57967/hf/10573).*
