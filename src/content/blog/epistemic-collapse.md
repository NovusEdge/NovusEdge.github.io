---
title: How Do You Know What's True?
date: 2026-07-11
tags: [ai, epistemics, misinformation, essay]
description: Generation is now free. Verification still costs what it always did. That asymmetry breaks everything.
thumbnail: truth-power.jpeg
---

Okay so lately I've been getting absolutely bombarded with this stuff, death-of-truth video essays, dead internet theory threads, it's everywhere on my feeds, and it keeps coming up with my friends too, the same conversation on repeat where someone shares a thing and someone else goes "wait is that even real?" and nobody can actually answer, and with GenAI making it easier and easier to churn out plausibly believable slop it's genuinely getting harder to tell wtf is true and what's not. So I finally sat down and dug into what the actual research says, and I need to get this out of my system, because the more I read the more I'm convinced that most of the AI risk conversation is staring at the wrong apocalypse.

Here's what's interesting – the discourse has positioned itself around deception. Scheming models. Superintelligences gaming their evaluators until they no longer need to. And look, serious people have built entire careers on those questions, one can hardly dismiss them. But there's a quieter failure mode that requires no scheming, no superintelligence, no malice whatsoever. All it requires is volume.

In January 2026 some researchers showed people AI-generated deepfake videos of crimes, and they told them *explicitly, in advance* that the videos were fake and it did NOT matter. Even the participants who consciously accepted "yes this is fake" stayed influenced by what they'd seen, which is so much *weirder* than "deepfakes are convincing", because it means knowing a thing is fake no longer reliably protects you from it, the machinery in your head that turns seeing into believing evolved for a world where seeing something meant it probably happened, and that machinery was never *built* for an environment where most of what reaches your eyes might be manufactured.

(I'm starting to hate this fucking timeline more and more gng)

If you scale that up to the size of *the internet*, well, shit gets grim FAST. By mid-2025 there were over 1,200 AI-generated "news" sites publishing under plausible mastheads in sixteen languages, the EU counted AI involvement in 27% of foreign information-manipulation attempts, nearly triple the year before, and AI-generated misleading posts were going disproportionately viral despite mostly coming from small accounts. Thus do we start seeing the enslopification of the internet. `⊙﹏⊙`

Now, it was all fun and games until the dead internet theory started to *really* kinda maybe be 100% overwhelmingly correct. I still recall there being some study that I came across during COVID mentioning something along the lines of: *Starting this year bot traffic represents the majority of internet traffic*. "slop farms" (fuck that's one dystopian term if I've ever heard one) figured out that engagement-bait images cost pretty much next to nothing to mass-produce and the recommendation algorithms will happily shovel them at boomers by the millions (shrimp Jesus, my beloved)

Like bruh there's literal "authors" and "musicians" and "photographers" that now exist that are just a fucking prompt loop with a payout account attached.

The shit part isn't quite that the people are getting fooled, there's always been suckers on the internet, but like people have kinda given up on figuring out what's true on their feeds (I'm tired boss ToT) Hank had a very nice point in this one vid of his btw check it out it's kinda nice:

![The Death of Truth](https://youtu.be/8MLbOulrLA0?si=wlYvcAwkuS-mWCIk)

Anyways, back to the point: "epistemic collapse". The term is floating around in at least four different research communities right now and they don't quite mean the same thing by it, which annoyed me at first, but the more I sat with it the more I think they're describing stages of one cascade rather than four separate problems.

The ML people mean **model collapse** where you train a model on the outputs of a previous model, repeat a few times, and the tails of the original distribution disappear while each generation drifts further from whatever ground truth it was anchored to, and this has been *proven* mathematically btw. Model collapse can't be avoided when training solely on synthetic data. The ecosystem version is worse: when researchers tested 27 LLMs across 155 topics every single one was less epistemically diverse than a basic web search and the larger models produced *less* diverse claims.

The AI-ethics people mean validation overload, peer reviewers, fact-checkers, editors, courts, teachers, all rate-limited systems trying to keep pace with a generation process that is no longer rate-limited by anything human, more claims than anyone can verify, synthetic content feeding on itself, and the humans doing the checking just... wearing down.

The philosophers mean something they call 'misrecognition', which sounds fancy but personally it's the most haunting thing. So, a model neither knows nor claims to know the content of what it produces. Its outputs are just statistical distributions, and when a reader treats that output as a knowledge claim anyway they're doing the epistemics on the model's behalf which means they're lending their own credibility to something that has none of its own, and now multiply that tiny act by billions of daily interactions and you get a society that systematically miscounts how much verified knowledge it actually has.

And the social scientists mean the one that makes the news, disconnected information realities, lost common ground, radicalization inside silos, usually treated as its own thing, a "social media problem" or a "polarization problem", but I think it's just the surface expression of everything underneath it.

The cascade, one begins to notice, runs in a sort of *sequence*. While **technical collapse** degrades the tools, the **validation infrastructure** gets fucking *inundated* in slop, These systems were never designed for this level of throughput. Misrecognition becomes normalized because unverified content is increasingly all there is. And finally, the shared reality that any kind of collective decision-making depends on simply... fragments.

Now, the obvious pushback would be something like: misinformation has been a problem since ancient times. Humanity has never lived in an epistemically clean environment, which is exactly why  we have journals and courts and editorial desks and peer review in the first place. What's new is the unit economics of deception. Every verification institution we have assumes that producing a credible-looking claim costs *something*, be it time or expertise or reputation or printing presses or whatever tf, but the idea was that verification could afford to be slower than generation because generation was expensive too, which is no longer true. Producing a plausible claim now costs approximately fuck all while checking one costs just the same, if not more in this broken ass economy.

There's also this paradox that's been formalized which comes to my mind now that I think about it: ***as synthetic media becomes indistinguishable from authentic media, the individually rational move is to discount *all* digital evidence rather than sort the true from the false, so the endgame is a world where evidence stops working altogether***. In all this shit it's the *currency* which ends up losing its value.

The flip side is the "liar's dividend", once everyone knows convincing fakes exist, anyone caught doing something real on camera can just shrug and go "that's AI", and the more slop is out there the more plausible that defense gets. Let's take some of the AI slop text that's getting generated these days or patterns like: "It's not X it's Y". It's valid english, true, but since we see so much AI slop we tend to start associating that pattern with "AI generated content" and then before long, NOBODY can fucking use that cause even if it's hand written they'd be assumed to have used AI.

Oh and this doesn't include the fact that we humans write similarly to the type of language we use/hear/read and see more of. Which means that over time more PEOPLE will start sounding like AI. (LinkedIn endgame fr)

So at this point you might be going "but surely the AI safety people are on this?" and yeah, kinda. Sorta. Not really. The most detailed governance proposal out there right now (AI Futures Project's "Plan A") is admirably concrete about compute verification, optical network taps, chip supply chain audits, mutually assured compute destruction as a deterrence backstop, hundreds of pages of modeling, and on epistemics? A two-page appendix. To their credit they do have a banger idea called the "basin of sanity", which is a self-reinforcing equilibrium where truth-seeking AI tools make society saner. It gestures at a handful of interventions, and moves on, nothing about how a society *enters* that basin, how to measure distance from its boundary, or what keeps it stable against actors who profit from the other basin.

The working assumption seems to be that if we control the compute and align the models the epistemic environment will mostly take care of itself, and the research says "fuck no, it won't". A perfectly aligned model still floods the commons, alignment constrains intent and this cascade doesn't run on intent, it runs on volume, honest models trained on increasingly synthetic corpora still drift, validators still burn out under content produced in complete good faith, readers still mistake statistical output for knowledge even when the statistics are benign. Alignment is necessary for the deception problem and nearly irrelevant to the exhaustion problem. Matter of the fact is that we *just can't keep up with this shit gng*.

There's also a deeper structural mismatch here that I think explains why nobody's touching this topic as much, alignment is a property of an artifact, which means somebody can *own* it, a lab, a safety team, a regulator certifying a model before release, but verification capacity is a property of an ecosystem, it lives in the coupling between models and institutions and incentives and habits of mind, and our institutions are good at assigning responsibility for artifacts and notoriously shit at assigning responsibility for ecosystems. So the tractable, ownable problem absorbs all the funding and talent while the binding constraint absorbs neither.

So what's the play here? Honestly? I have no fucking clue (Actually I *do* have ideas but not good ones). I'm not going to stand here with a five-point remediation strategy for the epistemic commons. That's not what this is. There are ideas floating around like: ecosystem health metrics, diversity mandates for model training, verification tooling funded at even a fraction of what we pour into generation. But whether any of it actually works? Nobody knows. Nobody's running the experiment. One would think, given the stakes, that *someone* might be.

This is both the opportunity and the warning. Every fuckin year the generation-verification gap will widen, the institutions that would need to build this stuff operate with less credibility and more fatigue than the year before, and a society that can no longer agree on how to verify claims can't verify the claim that it should fix its verification systems.

The race to build more capable AI has a thousand entrants, the race to keep truth checkable has almost none, and honestly? I think the second one is the actual bottleneck.

Anyways, that's the rant. imma fuck of to sleep, gn people.

~ A.
