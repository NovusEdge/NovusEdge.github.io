---
title: How Do You Know What's True?
date: 2026-07-10
tags: [ai, epistemics, misinformation, essay]
description: Generation is now free. Verification still costs what it always did. That asymmetry breaks everything.
thumbnail: truth-power.jpeg
draft: true
---

## The Wrong Apocalypse

Most AI risk discourse is about deception - scheming models, superintelligences that tell evaluators exactly what they want to hear until the day they don't need to anymore. And look, serious people spend careers on those questions and I'm not waving them away.

But there's a quieter failure mode that needs no scheming, no superintelligence, no malice. All it needs is volume.

In January 2026, researchers showed people AI-generated deepfake videos of crimes while telling them *explicitly and in advance* that the videos were fake. The warning barely mattered - even participants who consciously accepted that it was fake remained influenced by what they'd seen. What that experiment reveals isn't that deepfakes are convincing but something weirder: knowing a thing is fake no longer reliably protects you from it. The machinery in your head that turns perception into belief evolved for a world where seeing something meant it had probably happened, and that machinery was never built for an environment where most of what reaches your eyes might be manufactured.

Scale that up to the size of the internet and the picture gets grim fast. By mid-2025 there were over 1,200 AI-generated "news" sites publishing under plausible mastheads in sixteen languages. The EU counted AI involvement in 27% of foreign information-manipulation attempts, nearly triple the previous year. AI-generated misleading posts were going disproportionately viral despite mostly originating from small accounts. And none of this required a single misaligned model anywhere in the pipeline - all it required was that generating content became cheap.

The danger isn't that people will be fooled. It's that they'll stop trying to figure out what's true, not because they're gullible but because they're exhausted.

![The Death of Truth](https://youtu.be/8MLbOulrLA0?si=wlYvcAwkuS-mWCIk)

## Four Problems That Are Actually One Problem

The term "epistemic collapse" is floating around in at least four different research communities right now, and they don't quite mean the same thing by it. But I think they're describing stages of a single cascade rather than four separate problems.

**Technical: model collapse.** Train a model on the outputs of a previous model, repeat a few times, and the tails of the original distribution vanish while each generation drifts further from whatever ground truth it was anchored to. This has been proven mathematically - collapse can't be avoided when training solely on synthetic data. And the ecosystem version is worse: when researchers tested 27 LLMs across 155 topics, every single one was less epistemically diverse than a basic web search, with larger models producing *less* diverse claims rather than more. Monoculture isn't just a market concern, it's an epistemic accelerant.

**Infrastructural: validation overload.** Peer reviewers, fact-checkers, editors, courts, teachers - these are all rate-limited systems trying to keep pace with a generation process that is no longer rate-limited by anything human. The mechanisms feed each other: epistemic inflation (more claims than anyone can verify), recursive drift (synthetic content feeding on itself), and validation fatigue (the humans doing the checking just wearing down).

**Epistemological: misrecognition.** A model neither knows nor claims to know the content of what it produces - its outputs are necessarily non-epistemic, just statistical distributions. When a reader treats that output as a knowledge claim anyway, they're performing the epistemics on the model's behalf, quietly lending their own credibility to something that has none of its own. Multiply that small act of misrecognition by billions of daily interactions and you get a society that systematically miscounts how much verified knowledge it actually possesses.

**Social: fragmentation.** The one that makes the news - disconnected information realities, lost common ground, radicalization inside silos. Usually treated as its own phenomenon, a "social media problem" or a "polarization problem," but I think it's better understood as the surface expression of everything underneath it.

The cascade runs in order: technical collapse degrades the tools, which overwhelms the validation infrastructure, which normalizes misrecognition because unverified content is increasingly all there is, which finally fragments the shared reality that deliberation depends on.

## The Asymmetry

The obvious pushback is that misinformation is ancient - forged letters, yellow journalism, wartime propaganda. Humanity has never lived in an epistemically clean environment, which is exactly why we evolved journals, courts, editorial desks, and peer review.

But what's new isn't deception, it's the unit economics of deception.

Every verification institution we have quietly assumes that producing a credible-looking claim costs *something* - time, expertise, reputation, printing presses. Verification could afford to be slower than generation because generation was expensive too.

That assumption just stopped being true. Producing a plausible claim now costs approximately nothing while checking one costs what it always did. Recent work calls the result "industrialized deception" - automated production of misleading content at a scale no verification system was ever engineered for.

There's a paradox here that's been formalized: as synthetic media becomes indistinguishable from authentic media, the individually rational move is to discount *all* digital evidence rather than sort the true from the false. The result isn't a world full of successful lies but a world where evidence stops working altogether. The right analogy isn't counterfeiting, it's debasement - what loses value is the currency itself.

![AI and the Collapse of Trust](https://youtu.be/QyAqZQeR8V8?si=utHi4TTf30Q-tMXb)

## Why Alignment Doesn't Fix This

The AI safety community hasn't entirely ignored epistemics. The most detailed governance proposal out there (AI Futures Project's "Plan A") is admirably concrete about compute verification - optical network taps, chip supply chain audits, mutually assured compute destruction as a deterrence backstop. Hundreds of pages of modeling.

On epistemics? A two-page appendix that names a useful idea (the "basin of sanity" - a self-reinforcing equilibrium where truth-seeking AI tools make society saner) and then gestures at a handful of interventions before moving on. Nothing about how a society enters that basin, how to measure distance from its boundary, or what keeps it stable against actors who profit from the other basin.

The working assumption seems to be that if we control the compute and align the models, the epistemic environment will mostly take care of itself.

The research says otherwise. A perfectly aligned model still floods the commons. Alignment constrains intent, and this cascade doesn't run on intent - it runs on volume. Honest models trained on increasingly synthetic corpora still drift. Validators still burn out under content produced in complete good faith. Readers still mistake statistical output for knowledge even when the statistics are benign.

Alignment is necessary for the deception problem. It's nearly irrelevant to the exhaustion problem.

And there's a deeper structural mismatch: alignment is a property of an artifact, which means somebody can own it - a lab, a safety team, a regulator certifying a model before release. Verification capacity is a property of an ecosystem, living in the coupling between models, institutions, incentives, and habits of mind. Our institutions are good at assigning responsibility for artifacts and notably bad at assigning responsibility for ecosystems. So the tractable, ownable problem absorbs the funding and talent while the binding constraint absorbs neither.

## Building For Verification

If verification capacity is the constraint, the design goal follows directly: engineer the epistemic infrastructure so that verification scales with generation. The pieces of a research program already exist scattered through the literature - what's missing is anyone treating them as one agenda.

**Instrument the commons.** Build an early-warning observatory for epistemic health - one that tracks claim-to-verification ratios, diversity indices, and validator backlogs across science, journalism, and law. This would be both feasible with today's tools and entirely novel because nobody currently computes these numbers for any real knowledge domain.

**Mandate diversity where monoculture accelerates collapse.** If homogeneous model ecosystems demonstrably amplify degradation, then model diversity stops being an antitrust nicety and becomes an epistemic safety property with an optimal level that can in principle be estimated per domain.

**Distribute epistemic authority.** Keep the authority to say "this is known" distributed and revisable rather than consolidated inside a handful of opaque systems. Provenance belongs at this layer too - not as watermarking bolted on after the fact but as chains of epistemic custody treated as a first-class property of published content.

**Fund verification the way we fund generation.** The asymmetry is economic, so attack it economically. Nearly all AI investment currently subsidizes the generation side. There's no structural reason capital couldn't flow toward automated fact-verification, reproducibility tooling, and institutional adjudication capacity instead - except that nobody has framed that side as the complement the market is missing.

These are directions rather than solutions. The optimal-diversity question is open. Whether early-warning signals generalize across domains is open. How epistemic authority should be distributed without the distribution itself being captured is very open. But that openness is exactly the point - these problems are tractable, measurable, and largely unclaimed.

## Nobody Owns This Problem

Here's the strange sociological fact that motivated this whole thing: the ML community has proven collapse theorems, the AI-ethics community has formalized validation failure, philosophers of technology have diagnosed the misrecognition, social scientists have measured the fragmentation, and the most ambitious AI governance proposal in circulation concedes in an appendix that keeping society inside the "basin of sanity" should be a top governmental priority during AI takeoff.

And yet there is no field here. No shared benchmarks, no observatory, no funding stream, no institution anywhere whose mandate is the verification capacity of the knowledge commons. Alignment has labs, fellowships, and conferences. Epistemic infrastructure has scattered arXiv postings that only occasionally cite across disciplinary lines.

That's the opportunity and also the warning. With every year the generation-verification gap widens, the institutions that would need to build this infrastructure operate with less credibility and more fatigue than the year before. Epistemic collapse is the rare risk that erodes our ability to respond to it as a direct consequence of the risk materializing - a society that can no longer agree on how to verify claims cannot verify the claim that it should fix its verification systems.

The race to build more capable AI has a thousand entrants. The race to keep truth checkable has almost none.

Worth asking which one is actually the bottleneck.

~ A.
