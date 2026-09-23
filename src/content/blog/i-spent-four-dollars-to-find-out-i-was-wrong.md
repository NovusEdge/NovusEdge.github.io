---
title: I Spent $4 on GPUs to Find Out My Model Was Worse Than I Said
date: 2026-09-23
tags: [ml, decision-models, calibration, benchmarks, founder-log]
description: I trained a decision model on 62,695 real A/B tests, got a number that beat published state of the art by 16 points, wrote it up, and then discovered the benchmark I'd built was measuring nothing. What actually mattered turned out to be the loss function, and a learning rate I nearly wrote off as a dead model.
---

The number was 0.704 and I was extremely pleased with myself.

Some context. There's a new category of model going around — the "System One" thing, decision models, whatever you want to call them. The pitch is that you take the classification head off an LLM, calibrate it, and serve typed questions in a single forward pass instead of paying for autoregressive generation to answer a yes/no. Pick one of these 255 options. Score this thing. Is this true. Seventy milliseconds instead of two seconds.

Fine. Good, even. But here's what I noticed poking around the ecosystem that's sprung up around it: something like 300 projects, and every single one in the "scoring and ranking" category is using the model's own zero-shot judgment as the score. Score this article on eight quality axes. Rate this copy for taste. Judge whether this document is relevant.

Which is... asking a model what it thinks and calling the answer data.

So I wondered what happens if you train one of these on outcomes somebody actually measured.

## The setup

Turns out there's a perfect dataset for this and it's been sitting in the open since 2021. Between January 2013 and April 2015, Upworthy — yes, *that* Upworthy, the "you won't believe what happened next" people — ran 32,487 randomized A/B tests on their headlines. Real traffic, real randomization, 538 million assignments. Then Cornell published the whole thing as [the Upworthy Research Archive](https://osf.io/jd64p/) under CC BY.

Every headline variant. Every impression. Every click.

This is as close to ground truth as short persuasive text gets. You have the thing that was written, and you have what happened when real humans saw it, and the assignment was random so the comparison actually means something.

So: ModernBERT-large, a regression head, target is the shrunk logit click rate centred on each test's own mean. That centring matters — the *article* drives most of the click-rate variance and a headline can't explain it, so what you want to predict is how far an arm deviates from the mean of the test it ran in. Beta-binomial shrinkage toward that mean so an arm with 600 impressions counts as mostly prior and one with 20,000 counts as mostly evidence.

Twenty-five minutes on a single L4. About forty cents.

Held out everything after January 2015, tested there. **0.704 pairwise accuracy.**

For scale: the published state of the art on this exact dataset is [0.544](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682), from a Toronto group using hand-crafted linguistic features on 24,333 pairs. Their paper concludes the problem is "inherently hard, not merely a sample size issue." Humans given the same task score at chance. There's a LoRA'd Llama-3-8B in the literature that gets 0.469, which is *below* chance.

I beat the published number by sixteen points for the price of a sandwich. I wrote it up. "Headline signal survives two years of drift." I was insufferable about it for approximately ninety minutes.

## And yet

Here's the thing about that writeup — the claim in the title was that signal survives *drift*. Training data was 2013–2014, test set was 2015, and the accuracy barely moved. Two years of shifting internet culture and the model didn't care. That's a real finding if it's true, because the whole point of this exercise is eventually pointing it at email subject lines, and if a model can't survive two years inside one publisher it definitely won't survive the jump to a different medium entirely.

The archive ships in three splits: exploratory, confirmatory, holdout. I'd trained and tested on confirmatory. So — mostly out of diligence, mostly expecting to confirm what I already knew — I scored the same weights on the other two.

```
confirmatory 2015:  0.704
holdout:            0.637
exploratory:        0.624
```

Cool. Cool cool cool.

Two splits I'd never touched, agreeing with each other within 0.013 at *every single effect-size tier*, and both of them saying my headline number was inflated by seven points.

![Pairwise accuracy across three splits of the Upworthy archive. The confirmatory 2015 line sits well above holdout and exploratory, which track each other closely.](/assets/img/blog/decision-models/splits.png)

That red line is the one I posted about. The two underneath it are the truth.

## The time machine that only travels sideways

So I went and actually read the archive documentation instead of skimming it, which, you know. Should have been step one.

The archive assigns tests to splits **at random**. Not chronologically. At random.

| Split | Arms | Date range | Share before 2015 |
|---|---|---|---|
| confirmatory | 51,891 | 2013-01-24 → 2015-04-30 | 83.5% |
| holdout | 11,231 | 2013-01-24 → 2015-04-29 | 82.8% |
| exploratory | 10,804 | 2013-01-26 → 2015-04-29 | 83.8% |

All three splits cover the same dates in the same proportions. Which means when I scored on holdout, 83% of what I was testing came from *inside the training period*. Same era. Same house style. Same everything — just tests the model had never seen.

And it scored *worse* there than on the 2015 tail.

Flip that around and it's genuinely interesting: time costs this model almost nothing. Unseen tests from the same period cost it seven points. My carefully constructed drift test had been measuring test identity the whole time, dressed up as temporal generalization.

I'd built a time machine that only travels sideways.

## Two hypotheses, both backwards

Obviously the next thought is leakage. Upworthy rewrote the same article under dozens of headline variants, and if you're splitting *tests* at random then one article's rewrites scatter across all three splits. So holdout should be full of near-copies of the training text.

I wrote a quick inverted-index thing to measure maximum Jaccard token overlap between each evaluation headline and the 38,950 headlines the model actually fit on. Exact string matching had found five shared headlines out of 650 and I'd called leakage "ruled out," which in retrospect was adorable.

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

So I wrote "unexplained" in the doc and moved on, which felt cowardly and is also just what you do. 0.63 is the number. Two independent splits agree on it. The one that disagrees is the outlier and I can't tell you why.

**!! Nerd Infodump Alert :3 !!**

## The part that actually mattered

Right, so. Having demolished my own headline result I figured I'd at least run the ablations properly.

I expected data to win. That's the boring prior — you've got 62,695 arms, throw the third split in, get more. I set up two runs: one adding the exploratory split to training, one swapping the loss function. Both evaluated on the same 2,137 holdout pairs.

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

And obviously this is the worst kind of obvious in hindsight. The benchmark is *pairwise accuracy* — given two headlines, pick the winner. I was regressing on click rate. Which is to say: I was optimizing a proxy for the metric and then measuring myself on the metric, like a man training for a marathon by getting really good at buying running shoes.

[Bradley-Terry](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) optimizes the actual thing. For every pair of arms inside one test, maximize `logsigmoid(score_winner - score_loser)`, weighted by the thinner arm's log impressions because the comparison is only as trustworthy as the side with fewer impressions. My 38,950 training arms expanded into 63,597 within-test pairs.

Same model. Same data. Different objective. Fourteen points.

I also ran ModernBERT-*base* out of curiosity — a third the parameters — and it hit 0.761. So most of this lives in the objective and the data, not in the model size, which is good news if you ever want to run the thing on a CPU.

Then there's the one that nearly got away. I tried a DeBERTa-v3-large variant that had been pretrained on decision tasks, and it sat at exactly `-log(0.5)` for all 4,804 steps and scored 0.519. Chance. Dead flat.

Easy to read that as "DeBERTa is worse" and move on, which is what I almost did. But the loss curve being *perfectly* flat at the value that means "the model is guessing" is a very specific signature, and it isn't what a model that's learning-but-badly looks like. The encoder had loaded fine — only the classifier and pooler were newly initialized, which is exactly what you expect.

It was the learning rate. DeBERTa-v3-large is [notoriously unstable](https://github.com/microsoft/DeBERTa/issues/77) at the 2e-5 that ModernBERT is happy with; it wants something nearer 6e-6. I'd used one config for both because why wouldn't you.

Reran it at 6e-6. Loss went 0.709 → 0.682 → 0.620 → 0.360 and it finished at **0.812**, which is the best number in the whole project. It beat ModernBERT by two and a half points, and 0.913 on the highest-confidence tier.

The system is functioning as designed. The system was functioning as designed the entire time. I just had one number wrong.

## But what does 0.787 actually *mean*

Nothing, to a human. That's the problem with pairwise accuracy as a product claim: it tells you the ordering is right and carries zero information about magnitude. Ordering two headlines correctly 78.7% of the time could be worth a fortune or worth nothing depending on how far apart they actually are.

So I measured the thing an operator would actually experience. For each test, take the model's top-scored arm and compare its real click rate against the mean of all arms in that test — because without a model you have no reason to prefer any particular variant, so the mean of what you might have sent is the honest counterfactual.

| | CTR |
|---|---|
| Test mean (no model) | 1.20% |
| Model's pick | 1.41% |
| Oracle (perfect pick) | 1.60% |

**+17.4% relative click rate.** Across 2,140 tests. That's 52.6% of the entire headroom between picking blind and picking perfectly.

Concretely, if you're running a 5,000-person newsletter at a 2.5% click rate and sending weekly: 125 clicks per send becomes 147. Call it eleven hundred extra clicks a year, for choosing differently among subject lines you already wrote.

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

I had been telling myself a comforting story, and it took an adversarial second opinion to knock it over. The story was: *the architecture is commodity, the durable asset is proprietary outcome labels.* First half's right. Second half is nonsense, because I don't *have* proprietary labels. Upworthy is public. Anyone with a GPU reproduces my 0.787 in a weekend for less than a coffee.

What I have is a credential. The asset would be an ongoing measurement loop on live traffic, and that doesn't exist yet.

Which is actually clarifying, because it tells you where the real thing is: the data I need is sitting inside email service providers, doing nothing. Every ESP with an A/B testing feature has millions of subject-line experiments with measured outcomes, and approximately none of them are training anything on it.

That's the move. Not another head, not another benchmark. One relationship with somebody who has the logs.

## The takeaway, if you want one

If you're building on decision models: the entire ecosystem is training on synthetic decision tasks and using the model's own judgment as the label. One of the open-weight models in this space scores 0.362 on its own typed-decisions benchmark zero-shot, which is *below* the 0.461 majority-class baseline. It needs task-specific fine-tuning to get anywhere. The architecture without ground truth doesn't do much.

The gap between 0.544 and 0.812 was not clever modeling. Two-thirds of it came from picking a loss function that matched the metric, and the rest from 62,695 rows where somebody measured what actually happened.

Go find some ground truth.

---

*Data: [The Upworthy Research Archive](https://osf.io/jd64p/) — Matias, J., Munger, K., Le Quere, M.A., Ebersole, C. (2021), Nature Scientific Data. CC BY 4.0. Experiments conducted between June 25 2013 and January 10 2014 are excluded throughout for the randomization failure the maintainers disclosed in 2024.*
