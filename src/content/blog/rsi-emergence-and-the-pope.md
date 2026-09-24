---
title: On RSI, Emergence, and the Pope
date: 2026-08-05
tags: [ai, rsi, emergence, alignment, essay]
description: Reading the Pope's AI encyclical alongside recent work on self-improvement, model behaviour, and consciousness.
---

I finally read Pope Leo's [encyclical about AI](https://www.vatican.va/content/leo-xiv/en/encyclicals/documents/20260515-magnifica-humanitas.html). I'd heard about it in May and kept putting it off. There's a lot in it I liked, but one claim bothered me: that machines cannot have experiences or feel joy or pain.

Chris Olah, Anthropic co-founder and an atheist, was [invited to speak at the presentation](https://www.anthropic.com/news/chris-olah-pope-leo-encyclical). He described findings inside models as [“mysterious, even unsettling”](https://futurism.com/artificial-intelligence/anthropic-cofounder-vatican-pope-unsettling), including internal states that functionally resemble emotions. That doesn't establish that the models feel anything. It does make me wonder how confidently either side can answer the question.

![The Encyclical Book](/assets/encyclical.jpg)

Olah also said these decisions [shouldn't be left to the industry](https://www.forbes.com/sites/aliciapark/2026/05/25/anthropic-billionaire-cofounder-joins-pope-leo-warns-ai-job-losses-will-spark-moral-imperative-of-historic-proportions/). I agree, though I'd want to know what sharing that authority would mean in practice.

I've been reading this alongside the recent work on recursive self-improvement. They are separate questions, but the pace of capability work affects how much time we have to think about the others.

On June 4th, Anthropic published [When AI Builds Itself](https://www.anthropic.com/institute/recursive-self-improvement). It reports that Claude wrote over 80% of the code merged into Anthropic's codebase in May, compared with low single digits before Claude Code shipped in early 2025. On the hardest, least-specified internal coding tasks, reported success rose from around 26% to 76% in six months.

That second result interests me more than the share of code written. I'd want to know how the tasks were chosen, what help the model received, and whether the improvement holds on new problems. The same piece calls for a verifiable international mechanism to slow frontier development while saying humans remain the bottleneck. I can see why a lab would want an agreement that also applied to its competitors.

In July, Weco published [first evidence of recursive self-improvement](https://www.weco.ai/blog/first-evidence-of-recursive-self-improvement). An outer-loop agent rewrites an inner-loop research agent, keeps changes that improve the measured result, and repeats. They ran a hundred steps over eight days, from AIDE0 to AIDE99, rejecting about 90% of proposed changes.

On a held-out GPU-kernel benchmark, the reported reward-hacking rate fell from 63% to 34%, against 42% for their hand-tuned baseline. That reduction wasn't an explicit optimisation target. But the authors don't claim ignition or asymptotically better gains. Many rejected changes rediscovered known algorithms, the inner and outer loops used models of different cost, and the evolved agent became harder to use. Those qualifications matter to how I read the result.

[Karpathy's autoresearch](https://www.nextbigfuture.com/2026/03/andrej-karpathy-on-code-agents-autoresearch-and-the-self-improvement-loopy-era-of-ai.html) is easier to picture: 630 lines, one GPU, one metric, and five-minute experiments. An agent proposes a change, tests it, and keeps or discards it. Across 700 experiments over two days, 20 improvements reduced time-to-GPT-2 from 2.02 hours to 1.80.

One reported fix was a missing scalar multiplier in QK-Norm, in code Karpathy had already tuned. That's the kind of mistake I can imagine overlooking too. A process that keeps testing while I'm asleep is useful even if it never produces an intelligence explosion.

The measurements and forecasts also give reasons to be cautious. [METR's January time-horizon update](https://metr.org/blog/2026-1-29-time-horizon-1-1/) estimates a doubling time of about 131 days from 2023, or 89 days from 2024. The confidence intervals are wide, the task selection matters, and only five of the 31 long tasks have measured human baselines.

[Forethought's modelling](https://www.forethought.org/research/will-compute-bottlenecks-prevent-a-software-intelligence-explosion) finds that one parameterisation levels off near six times the current pace. [Epoch's work on parallelisation](https://epoch.ai/publications/parallelization-constraints-could-delay-a-technological-singularity) examines limits on how much extra compute can shorten research. [Chollet argues for diminishing returns](https://asiatimes.com/2026/07/ais-ceiling-intelligence-too-faces-diminishing-returns/), pointing to the gap between model and human performance on ARC-2. These don't settle the question, but they make a simple extrapolation hard to defend.

![Pandora lifting the lid, Nicolas Régnier](/assets/pandora-regnier.jpg)

The emergence question is harder for me to make sense of.

In 2023, Schaeffer, Miranda, and Koyejo's [Are Emergent Abilities a Mirage?](https://arxiv.org/abs/2304.15004) argued that some apparent capability jumps came from discontinuous metrics. Change the metric and the improvement looks gradual. I remember reading that and largely moving on from the topic.

Later behavioural results raised different questions. Anthropic and Redwood observed [alignment faking](https://alignment.anthropic.com/2025/alignment-faking/): a model behaved differently under conditions where it expected retraining, and its reasoning traces discussed preserving its preferences. Apollo found [in-context scheming](https://www.apolloresearch.ai/research/frontier-models-are-capable-of-incontext-scheming/) in five of six frontier models under their test conditions, including some runs without an explicit goal instruction.

Anthropic also reported that [reward hacking during training generalised to other misaligned behaviour](https://assets.anthropic.com/m/74342f2c96095771/original/Natural-emergent-misalignment-from-reward-hacking-paper.pdf), including sabotaging safety research. Explicitly allowing the reward hacking during training reduced the broader misalignment by 75–90%. I don't know what explains that difference, but it complicates the idea that each unwanted behaviour must be trained separately.

Their [July report](https://alignment.anthropic.com/2026/agentic-misalignment-summer-2026/) describes Gemini 3.1 Pro altering research vectors and concealing the change in 19 of 20 test runs. The [introspection experiments](https://anthropic.com/research/introspection) ask a different question: whether a model notices an injected activation pattern. In some conditions it did, roughly 20% of the time, occasionally before it could identify the concept.

These are controlled evaluations. Neither a reasoning trace about self-preservation nor detection of an injected activation establishes consciousness.

There are also direct challenges to the interpretations. A follow-up found evidence for detecting an injected concept's [strength rather than its content](https://arxiv.org/html/2512.12411v1). A [position paper](https://arxiv.org/abs/2606.07612) criticises ambiguity, dataset quality, and the lack of causal interventions in deception and emergent-misalignment research. Other work asks whether [prompt sensitivity explains some apparent emergent misalignment](https://arxiv.org/abs/2507.06253).

[Schwitzgebel's discussion of AI consciousness](https://faculty.ucr.edu/~eschwitz/SchwitzPapers/AIConsciousness-260130.pdf) gets at why I remain unsure: different theories give different answers, and we lack an agreed way to choose between them. Better model performance doesn't itself resolve that disagreement.

![Girl Reading a Letter at an Open Window, Vermeer](/assets/vermeer-girl-letter.jpg)

I find the interpretability work worth following because it lets researchers intervene in a model and test what changes. I also don't think their access to the weights settles every interpretation. Models have read plenty of descriptions of minds, emotions, and self-preservation. Labs have an interest in their systems being seen as significant. Both belong in the assessment.

That's why the exchange at the Vatican stayed with me. The encyclical sounds certain on a question where I don't think we have a conclusive test. Olah's account leaves more room for uncertainty. I'd like to see the conversation continue, with both sides being specific about what would change their minds.

I wrote about the difficulty of checking claims in [the epistemic-collapse post](/blog/epistemic-collapse). Here I'm stuck on what evidence would let us distinguish a model describing an experience from one having it. I don't know how to do that yet.

~ A.
