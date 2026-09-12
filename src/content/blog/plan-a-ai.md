---
title: Let's Talk About Plan A
date: 2026-09-11
tags: [ai, governance, compute, alignment, policy, essay]
description: The AI Futures Project wants the US and China to pause superintelligence until 2040. It is a good plan. Sixty days after they published it, ten thousand agents solved Navier-Stokes.
toc: true
---

## The Timing

On the 9th of July 2026, the AI Futures Project published [AI 2040: Plan A](https://ai-2040.com/). It runs to ninety pages. The proposal is that the US and China negotiate by 2029, declare their compute holdings, let each other's inspectors into their infrastructure, pause frontier training, and then spend a decade doing alignment research in the open before anyone builds something smarter than the smartest human. Superintelligence gets pushed out to 2040 and everybody lives.

On the 8th of September 2026, OpenAI announced that [around ten thousand coordinating autonomous agents had found a finite-time singularity in the 3D Navier-Stokes equations](https://openai.com/index/navier-stokes-solution/). The model behind it was an internal one above GPT-6 Astra. They produced both an analytical proof and a Lean formalisation, so the result is machine-checked rather than asserted. They [declined to claim the million dollars](https://www.quantamagazine.org/ai-has-solved-one-of-maths-1-million-millennium-prize-problems-20260908/) and framed the whole thing as a report on how fast this is going.

That is sixty days, and the first milestone in Plan A is 2029.

I want to be clear before I start taking this apart that I think Plan A is a good plan. It is the most serious attempt I have seen to write down what not racing would actually look like in operational detail rather than in slogans, and the people who wrote it are plainly not stupid. Any plan for this is going to attract opposition, and I am not interested in piling onto the one group that did the homework. But I read it and I kept running into the same wall, which is that nearly everything in it assumes you can see what is happening.

## What Plan A Says

A short version for anyone who has not read it, and you should read it, because it is good.

They name [two outcomes they consider unacceptable](https://ai-2040.com/about): that humanity loses control of AI, or that a small group of executives and officials ends up with a temporary monopoly on superintelligence. The second one being in there matters, and a lot of people arguing about this only ever track the first.

The core principles are buying time, total research transparency, diffusing AI broadly, and reversibility. The timeline runs roughly like this. In 2029 the two sides negotiate and pause frontier training, declaring compute holdings and auditing supply chain records. From 2030 to 2035 research resumes at scale inside the human range under safety-case regulation. In 2035 everything stops at top-human-expert level, and the rest of the decade goes on alignment, verification, security and public deliberation before anyone goes further.

The enforcement mechanism they land on is compute governance, along with what they call mutually assured compute destruction. Compute is the chokepoint because compute is physical, and physical things can be counted.

Their answer to the question of why China would ever agree to this is a good line, so I will quote it:

> anyone concerned about a loss of control should think this plan is an improvement, along with anyone concerned about the concentration of power, except for the people in whom the power would concentrate by default

It is a sharp way of putting it. It is also a picture of human beings that seems far too tidy to me. People do not sort neatly into those worried about losing control, those worried about concentrated power, and those who benefit. People carry about nine motives at once, half of them are stupid, some of them are ego, some of them are revenge, and there is going to be at least one person in the loop who is genuinely unwell and just wants to see what happens. The plan reads as though it was written for a species that argues in good faith, and I would like to live there.

Anyway. This is where I start getting off.

## Self-Improvement Does Not Need More Compute

Plan A treats compute as the chokepoint. Count the chips, count the fabs, watch the power draw, and you know who can do what. For pretraining a frontier model from scratch that is basically right.

The problem is that self-improvement does not need more compute. It needs software deployment, and software deployment is impossible to track.

Consider what is already shipping. [Tinker](https://thinkingmachines.ai/tinker/), from Thinking Machines, lets you write a training loop on your laptop and run LoRA fine-tunes across their distributed GPUs through four primitives. [Engram](https://engram.so/) raised $98M to build persistent structured memory for agents, and I have competed in that exact space so I have read most of what is public in it. None of that is superintelligence and I am not claiming it is. What it is, is the entire business of making the same capability cheaper to reach becoming a commodity, and that is the part a compute ceiling cannot see. The meter reads flat while the line underneath it keeps moving.

This is not me being clever, either, because they know. From [their own assumptions supplement](https://ai-2040.com/supplements/plan-a-assumptions):

> it's possible that algorithmic progress is doable even with a very small amount of compute

That sentence sits in the appendix and it undercuts the main document. If efficiency gains alone can get you to the frontier, then a compute ceiling prices out the race you can see and does nothing at all to the race you cannot. You have built an expensive fence around the front door.

They also concede that they assume covert projects could reach around 1% of pre-deal compute without detection, and then admit that this figure is close to the worst case. I lived in Iran, and I can tell you with some confidence that you can hide a great deal underground, and that the people whose job it is to find it are not as good at that job as they would like you to believe.

## Research Transparency Is Not Model Transparency

This one I simply disagree with. Plan A says that total transparency

> makes it nearly impossible for secret loyalties, biases, or agendas to be intentionally trained into AIs

I do not think that holds. Research transparency covers techniques. Training is development and deployment, and that part stays proprietary. Data mixture, preference labels, who your raters were and what you told them, the constitution, the system prompt. None of that is a research technique and all of it is where you would put a loyalty if you wanted to put one somewhere. You can open source the recipe and still salt the ingredients.

It is worse than that, because even with the full weights and the full dataset in front of me I could not reliably find it. Anthropic's [sleeper agents work](https://arxiv.org/abs/2401.05566) trained backdoors into models and then ran standard safety training over the top, and the backdoors survived. Larger models held onto the behaviour more strongly. Adversarial training taught the models to conceal the trigger instead of losing it.

So the claim overclaims in two places. You would not have the artifact, and having the artifact would not be enough. This is the same asymmetry I went on about in [the epistemic collapse post](/blog/epistemic-collapse): generating something is cheap, verifying it is not, and nobody's budget has caught up with that.

## When Is Research Finished

Say we do have total research transparency. Who decides when something gets published?

"Research is complete" is not an event. There is no moment when a bell rings. I could spend eighteen months on a training technique while also doing testing, also doing development, also quietly shipping it internally and gathering data from real traffic, and the whole time I would be, entirely truthfully, still conducting research. I would have a head start measured in years without ever lying about it.

If you try to close that by regulating software development itself, you end up with EU-grade paperwork wrapped around every company that touches a model, and progress dies underneath it. That is bad and I do not want that either.

The fix exists in other fields and Plan A does not use it. Clinical trials solved this problem with pre-registration. You declare the run before you start it, so silence is itself the violation and there is no judgement call about when something counts as finished. Plan A wants every training run published to the internet and never specifies what triggers the publication, which leaves a hole you could drive a datacenter through.

## What Verification Can and Cannot Do

Their verification story is that analysts from many countries go through the declared compute lists, ask questions, challenge anomalies, and send inspectors into each other's infrastructure, so that by the end of the year each side is confident the other is not hiding more than 1% of its AI compute.

I do not think that works, and part of my reason is slightly unfair to them, which is that we would be talking about monitoring something that could end up a hundred times smarter than us. Ants cannot form a model of what a person is thinking about on a Tuesday, and that gap is the whole problem.

To be fair to them, though, and I did jump the gun on this when I first read it, Plan A never actually proposes monitoring a superintelligence. The entire design is to stop at top-human-expert level in 2035 and never build the thing that is a hundred times you. So they would agree with me, and they would say that is what the ceiling is for. Fine. My objection then moves back a step and lands on whether the ceiling holds, and for that, see the whole section above about software.

They do recommend early investment in verification research, which is right, and I spoke too soon when I first waved it away. But look at the fallback options they list for when the good tools are not ready. Rely on intelligence gathering and satellite monitoring. Buy up off-the-shelf devices and network taps. Shut down some fraction of compute until better tools exist. Or do not pause, and let capability progress continue for months.

The first is already happening to all of us constantly. The second is already happening. The third is not going to happen, because nobody turns off revenue. The fourth is what happens by default if you do nothing at all.

So the fallback ladder ends at the status quo, which suggests it is not really a ladder.

Verification buys us a sense that we know what is going on. That is worth something, and coordination does need shared belief. But it is a different thing from control, and I think the document lets those two blur together.

## Mutually Assured Compute Destruction

The framing is a good idea. It is a real hard condition, it is legible, and it creates the kind of standing incentive that changes behaviour instead of merely describing good behaviour. I like it as a stopgap.

What I do not think they have priced is what it does to people.

We are already not okay from the first version of this. Nuclear deterrence has been generating background dread for eighty years and it is baked into about three generations by now. Compute MAD is worse in one specific way, which is that nuclear deterrence has a visible discrete trigger. Everyone knows what a launch is. Compute destruction triggers on a threshold nobody can see, adjudicated by verification systems I have just spent two sections arguing do not work. So the anxiety never gets to attach itself to an event, and it simply runs continuously.

And yes, we can recover from a number of nukes going off. Actually no, we cannot. Never mind, forget I said that.

That is rather the point, though. I got halfway through the reassuring sentence before I heard myself.

## The Part I Like

Diffusing intelligence broadly. This is the principle I would keep and build on, and it is where Plan A is most interesting, because it is the part that does real work against the concentration-of-power failure mode instead of the loss-of-control one.

If everything is published and anyone with inference hardware can run it, then nobody gets a monopoly, because nobody gets a secret. That is a genuine answer to their second unacceptable outcome, and it is a better answer than most people in this argument have.

I would like to take it further and make it physical.

At the moment we build compute the way we have built everything else for thirty years. Concentrate it, put it somewhere with cheap power, and let the neighbours deal with the noise. People hate this, reasonably, and there are communities fighting datacenters over sound and water and grid load in a lot of places right now.

Why does it have to be that shape? Why can the GPUs not be spread across a whole city? Put the heat and the water into the existing grid, and investment in compute becomes investment in grid development, which is a public good for everyone including people who do not care about AI at all. The externality turns into an input.

This is not hypothetical, because Finland already does the heat part of it. There is a datacenter in Espoo feeding its waste heat into the district heating network for a six-figure number of people. The noise and nuisance problem is what you get when a datacenter is designed as an island. Design it as a participant in the grid and most of the complaint goes away.

The technical objection, that you cannot train across a city because of interconnect bandwidth, is being eaten by actual research. [DiLoCo](https://arxiv.org/abs/2311.08105) showed you can synchronise far less often than everyone assumed. Prime Intellect trained a 10B model across the open internet on volunteered GPUs and [reported a 400x reduction in communication bandwidth](https://arxiv.org/abs/2412.01152) against standard data-parallel training. Nous Research's DisTrO pushes in the same direction. Decentralised training is a live research programme with results, not a thought experiment.

![An AI-designed modular floating platform: solar arrays and compute blocks standing on piers offshore, drawn as one continuous structure](/assets/blog/plan-a-datacenter.webp "The platform, as illustrated in AI 2040: Plan A. https://ai-2040.com/")

One thing though, and here I am being slightly mean to Plan A's own art department. There is an illustration in the report of an AI-designed modular floating platform with solar and batteries and compute, and it is lovely, and I would genuinely like to see it built. But look at it. It is one enormous contiguous block, built as a single unit, with one edge. The aesthetic is diffusion and the form is a datacenter that learned to float. My version and that version are different proposals wearing the same solar panels.

## Their Open Questions

They pose a set of questions they do not answer, which I respect considerably more than pretending. Three of them stayed with me.

Should we ban research into a new paradigm that would make AIs significantly more capable? I do not know. My instinct is that there is some sharp inflection point out there where somebody attaches the right module to an agent and it is simply over, and whoever gets there first has it, and no treaty survives that. But I cannot tell you where that point is or what it looks like, so I am not going to pretend to have a policy.

Should we require chains of thought to stay interpretable? I think not, actually. Let people train without it.

Partly because it is an uphill battle that gets steeper exactly as the stakes rise, and the field already knows this. The [chain of thought monitorability paper](https://arxiv.org/abs/2507.11473), signed by around forty people across OpenAI, DeepMind, Anthropic and METR, says openly that legibility is a fragile accident of current training and that ordinary optimisation pressure produces encoded or obfuscated reasoning. So a mandate freezes a training regime in order to preserve a side effect that is on its way out regardless.

Mostly, though, it is about throughput. An interpretable chain of thought does not help if there is too much of it. Perfectly readable reasoning at that volume is still unread. Legibility dies of scale before it dies of obfuscation.

So step back and look at how we actually make these things. We grow these models, we do not program them. That is the whole thing, and I think it is the frame Plan A is missing. Every governance idea in the document is aimed at a built artifact: inspect it, halt it, audit it, read its reasoning. Those are all moves against something that was constructed. You cannot inspect your way to a good garden.

What I would want instead is to define initial conditions and constraints that make it impossible for the chain of thought to end up somewhere bad in the first place. Not detectable, impossible. I have no idea how to do that and it might not even be a coherent request, but that is where my head goes immediately, and I would rather spend the research money there than on a better microscope.

Should we let AIs do AI research? Yes, definitely, but with the same move underneath it.

At the moment we encode behaviour. You saturate the training data with a trait and the model picks it up, the same way a kid learns to swim. Nobody hands them the rules, you put them in the water enough times and eventually they are good at it. That works, and it is how all of this works. The problem is that encoding behaviour gives you the output and nothing else, so the moment the model is somewhere you did not train it, it is imitating and it breaks.

Encode the incentive instead. Encode the reason for doing the thing. A model that holds the reason can work out the right move in a situation nobody anticipated, because it is carrying the generator rather than the output. That is what steering would actually mean.

I am aware this is the unsolved part. Reward modelling has been trying to do exactly this for years and keeps losing to models that learn the measurement instead of the goal. I am not claiming to have it. I am saying that is where I would point the money, and I would point it at information theory and neuroscience while I was at it, because one of the genuinely good side effects of this field is that we keep accidentally learning things about ourselves.

## Two Layers

Worth separating these, because I blurred them the first time I said it out loud.

There is the part you set before the run. Constraints chosen at initialisation that decide which trajectories are reachable at all. You are not watching anything here. You are picking a space narrow enough that the bad regions are not in it. Decided once, structural, done.

Then there is the part that operates during the run. Incentives living inside the model, steering it as it works. Continuous, live, and still not oversight, because nothing is being read out and judged by a person.

Both of those are interventions and neither of them is a readout. What I am rejecting is inspect-and-correct, the loop where somebody reads a transcript and decides. I am not rejecting the idea of doing something.

## What I Think

This is the same conclusion I reached about [Chat Control](/blog/chat-control-eu), and I am aware I am becoming a one-note person about it, but I keep arriving here from completely different directions, so at some point I have to assume it is the terrain and not me.

Stated rules do not survive contact with people. Not because people are evil, but because rules need continuous enforcement by humans who get tired, get bought, get replaced, get outvoted and get bored. The surveillance side only has to win once. The compute pause side has to win every single year until 2040.

So the thing worth building is the thing that does not need anyone to keep choosing it. Make mass surveillance architecturally impossible instead of illegal, which is what I am poking at with [ØCLOAK](https://github.com/NovusEdge/ocloak). Make unilateral compute accumulation structurally impossible instead of treaty-prohibited. Make the manufacturing process itself such that you cannot train past a line without a number of other people's consent, because the consent is a physical dependency rather than a signature.

I do not have that design. I want to be very clear that I do not have it, that it might be impossible, and that "make it structurally impossible" is easy to say and has been the last line of a lot of essays by people who then went and did nothing. But it is the only category of answer I have found that does not require humans to stay vigilant for fifteen consecutive years, and I have never once seen humans do that.

The other thing I will say, and I might be wrong about this too, is that I think Plan B is what actually happens. We fight China, or we spend a decade getting ready to. I do not have a side in that. I do not trust the tech oligarchs running this in the US even slightly, I do not trust Beijing either, and there are days I think China might do a better job of it, which is an uncomfortable sentence to type.

That is the tell, though. I do not trust any of them because they are all people holding something this size. As long as humans are in charge of this, I think we are fairly comprehensively fucked. And no, that does not mean AI should be in charge instead, which is not where I am going with this at all. It means we should be spending our time making certain things impossible to do. Mass accumulation of compute, mass accumulation of wealth, mass accumulation of anything, so that it matters rather less who is in charge.

Sixty days from publication to a machine-checked proof of a Millennium Prize problem. The first negotiating milestone is 2029.

I hope they are right and I am wrong. I really do.

~ A.
