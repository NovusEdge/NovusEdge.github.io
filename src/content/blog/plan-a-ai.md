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

Plan A is the most detailed proposal I've read for how countries could agree to slow AI development. I think it's worth taking seriously. My main objection is how much depends on being able to observe what other parties are doing.

## What Plan A Says

They name [two outcomes they consider unacceptable](https://ai-2040.com/about): that humanity loses control of AI, or that a small group of executives and officials ends up with a temporary monopoly on superintelligence. The second one being in there matters, and a lot of people arguing about this only ever track the first.

The core principles are buying time, total research transparency, diffusing AI broadly, and reversibility. The timeline runs roughly like this. In 2029 the two sides negotiate and pause frontier training, declaring compute holdings and auditing supply chain records. From 2030 to 2035 research resumes at scale inside the human range under safety-case regulation. In 2035 everything stops at top-human-expert level, and the rest of the decade goes on alignment, verification, security and public deliberation before anyone goes further.

The enforcement mechanism they land on is compute governance, along with what they call mutually assured compute destruction. Compute is the chokepoint because compute is physical, and physical things can be counted.

On why China would agree, they write:

> anyone concerned about a loss of control should think this plan is an improvement, along with anyone concerned about the concentration of power, except for the people in whom the power would concentrate by default

I don't think shared concern about those risks is enough to secure agreement. The people negotiating would also have domestic political pressures, institutional interests, and reasons to distrust each other. I'd want to know how the deal holds when those motives conflict with its stated goals.

## Self-Improvement Does Not Need More Compute

Plan A treats compute as the chokepoint. Count the chips, count the fabs, watch the power draw, and you know who can do what. For pretraining a frontier model from scratch that is basically right.

The problem is that self-improvement does not need more compute. It needs software deployment, and software deployment is impossible to track.

Consider what is already shipping. [Tinker](https://thinkingmachines.ai/tinker/), from Thinking Machines, lets you write a training loop on your laptop and run LoRA fine-tunes across their distributed GPUs through four primitives. [Engram](https://engram.com/) raised $98M to build persistent structured memory for agents, a field I've worked in myself. These aren't examples of superintelligence. They interest me because better training tools and memory can change what a system does without a corresponding increase in its hardware allocation.

The authors acknowledge this possibility in [their assumptions supplement](https://ai-2040.com/supplements/plan-a-assumptions):

> it's possible that algorithmic progress is doable even with a very small amount of compute

If efficiency gains can produce much stronger systems within an existing allocation, a compute ceiling won't by itself bound capability. I'd want the agreement to explain how it handles that possibility.

They also concede that they assume covert projects could reach around 1% of pre-deal compute without detection, and then admit that this figure is close to the worst case. I lived in Iran, and I can tell you with some confidence that you can hide a great deal underground, and that the people whose job it is to find it are not as good at that job as they would like you to believe.

## Research Transparency Is Not Model Transparency

This one I simply disagree with. Plan A says that total transparency

> makes it nearly impossible for secret loyalties, biases, or agendas to be intentionally trained into AIs

I don't think publishing techniques establishes that. Training and deployment involve choices about the data mixture, preference labels, raters' instructions, constitutions, and system prompts. If those choices remain proprietary, publishing the research won't tell an inspector what behaviour the developer tried to train.

It is worse than that, because even with the full weights and the full dataset in front of me I could not reliably find it. Anthropic's [sleeper agents work](https://arxiv.org/abs/2401.05566) trained backdoors into models and then ran standard safety training over the top, and the backdoors survived. Larger models held onto the behaviour more strongly. Adversarial training taught the models to conceal the trigger instead of losing it.

I see two separate requirements: access to the relevant model and training records, and methods that can detect the behaviour you're concerned about. Transparency needs both to support this claim. The cost of checking is also part of what worried me in [the epistemic collapse post](/blog/epistemic-collapse).

## When Is Research Finished

Say we do have total research transparency. Who decides when something gets published?

Research, testing, and deployment can overlap. I could spend eighteen months developing a training technique while using it internally and collecting data from real traffic. A publication requirement tied to "completion" could let me keep that work private while I still considered the research ongoing.

If you try to close that by regulating software development itself, you end up with EU-grade paperwork wrapped around every company that touches a model, and progress dies underneath it. That is bad and I do not want that either.

I'd look at pre-registration, as used in clinical trials: declare the run before starting it. That would give the publication requirement a defined trigger. I couldn't find an equivalent trigger in Plan A's requirement to publish training runs.

## What Verification Can and Cannot Do

Their verification story is that analysts from many countries go through the declared compute lists, ask questions, challenge anomalies, and send inspectors into each other's infrastructure, so that by the end of the year each side is confident the other is not hiding more than 1% of its AI compute.

Plan A proposes stopping at top-human-expert level in 2035, so an objection about monitoring a superintelligence would miss its intended limit. My concern is whether the capability ceiling holds, including when software improves within the permitted compute budget.

They recommend early investment in verification research, which I support. Their fallback options include intelligence gathering and satellite monitoring, off-the-shelf devices and network taps, shutting down some compute until better tools exist, or allowing capability progress to continue for months.

I'd expect considerable resistance to shutting down revenue-producing compute. If verification tools arrive late and the parties won't accept that shutdown, the fallback allows the progress the pause was meant to stop.

Verification buys us a sense that we know what is going on. That is worth something, and coordination does need shared belief. But it is a different thing from control, and I think the document lets those two blur together.

## Mutually Assured Compute Destruction

The framing is a good idea. It is a real hard condition, it is legible, and it creates the kind of standing incentive that changes behaviour instead of merely describing good behaviour. I like it as a stopgap.

I'm also concerned about how people would live with that threat.

We are already not okay from the first version of this. Nuclear deterrence has been generating background dread for eighty years and it is baked into about three generations by now. Compute MAD is worse in one specific way, which is that nuclear deterrence has a visible discrete trigger. Everyone knows what a launch is. Compute destruction triggers on a threshold nobody can see, adjudicated by verification systems I have just spent two sections arguing do not work. So the anxiety never gets to attach itself to an event, and it simply runs continuously.

## The Part I Like

Diffusing intelligence broadly. This is the principle I would keep and build on, and it is where Plan A is most interesting, because it is the part that does real work against the concentration-of-power failure mode instead of the loss-of-control one.

If everything is published and anyone with inference hardware can run it, then nobody gets a monopoly, because nobody gets a secret. That is a genuine answer to their second unacceptable outcome, and it is a better answer than most people in this argument have.

I would like to take it further and make it physical.

At the moment we build compute the way we have built everything else for thirty years. Concentrate it, put it somewhere with cheap power, and let the neighbours deal with the noise. People hate this, reasonably, and there are communities fighting datacenters over sound and water and grid load in a lot of places right now.

I'd like to explore spreading compute across a city and connecting it to existing power, water, and heating infrastructure. Reusing the heat could benefit residents who don't use the compute themselves.

Finland already does the heat-reuse part: a datacenter in Espoo feeds waste heat into the district heating network for a six-figure number of people. That doesn't settle the other siting problems, but it's an example of a local use for the heat.

The technical objection, that you cannot train across a city because of interconnect bandwidth, is being eaten by actual research. [DiLoCo](https://arxiv.org/abs/2311.08105) showed you can synchronise far less often than everyone assumed. Prime Intellect trained a 10B model across the open internet on volunteered GPUs and [reported a 400x reduction in communication bandwidth](https://arxiv.org/abs/2412.01152) against standard data-parallel training. Nous Research's DisTrO pushes in the same direction. Decentralised training is a live research programme with results, not a thought experiment.

![An AI-designed modular floating platform: solar arrays and compute blocks standing on piers offshore, drawn as one continuous structure](/assets/blog/plan-a-datacenter.webp "The platform, as illustrated in AI 2040: Plan A. https://ai-2040.com/")

The report's illustration combines solar, batteries, and compute on one large floating platform. I'd like to see that built, but it still concentrates the hardware at one site. What I'm suggesting would distribute it across a city and connect it to existing infrastructure.

## Their Open Questions

Three of the report's open questions stayed with me.

Should we ban research into a new paradigm that would make AIs significantly more capable? I do not know. My instinct is that there is some sharp inflection point out there where somebody attaches the right module to an agent and it is simply over, and whoever gets there first has it, and no treaty survives that. But I cannot tell you where that point is or what it looks like, so I am not going to pretend to have a policy.

Should we require chains of thought to stay interpretable? I think not, actually. Let people train without it.

Partly because it is an uphill battle that gets steeper exactly as the stakes rise, and the field already knows this. The [chain of thought monitorability paper](https://arxiv.org/abs/2507.11473), signed by around forty people across OpenAI, DeepMind, Anthropic and METR, says openly that legibility is a fragile accident of current training and that ordinary optimisation pressure produces encoded or obfuscated reasoning. So a mandate freezes a training regime in order to preserve a side effect that is on its way out regardless.

I'm also worried about review capacity. A readable chain of thought is useful only if someone or something can check it. At large volumes, the proposal needs an account of how that checking scales and how failures get detected.

I'd rather put more research into constraints imposed during training that could rule out particular unsafe behaviours. I don't know how to make those guarantees, or whether a sufficiently general version is possible. But I'd like to investigate that alongside methods for inspecting what a trained model does.

Should we let AIs do AI research? Yes, definitely, but with the same move underneath it.

I want models to learn reasons for choosing an action that still apply in unfamiliar situations. Training examples that reward the right behaviour don't, by themselves, establish that the model has learned those reasons. It might learn a shortcut that works in training and fails elsewhere.

Reward modelling already faces this problem: a model can learn to satisfy the measurement without achieving the intended goal. I don't have a solution. It's a research direction I'd fund, including work drawing on information theory and neuroscience.

## Two Layers

I'm interested in two kinds of intervention. One would constrain the behaviours reachable from the initial setup. The other would shape the incentives that guide the model as it works.

Both would need validation. My aim is to reduce dependence on a person reading transcripts and correcting the system after it has acted, but describing these interventions doesn't establish that we can build them.

## What I Think

I had a similar concern when writing about [Chat Control](/blog/chat-control-eu): how much can a safeguard depend on people continuing to enforce it?

Stated rules do not survive contact with people. Not because people are evil, but because rules need continuous enforcement by humans who get tired, get bought, get replaced, get outvoted and get bored. The surveillance side only has to win once. The compute pause side has to win every single year until 2040.

So the thing worth building is the thing that does not need anyone to keep choosing it. Make mass surveillance architecturally impossible instead of illegal, which is what I am poking at with [ØCLOAK](https://novusedge.github.io/portfolio/ocloak). Make unilateral compute accumulation structurally impossible instead of treaty-prohibited. Make the manufacturing process itself such that you cannot train past a line without a number of other people's consent, because the consent is a physical dependency rather than a signature.

I don't have that design, and it may be impossible. I want to investigate it because maintaining an international agreement for fifteen years also depends on sustained enforcement through changes of government, personnel, and incentives.

The other thing I will say, and I might be wrong about this too, is that I think Plan B is what actually happens. We fight China, or we spend a decade getting ready to. I do not have a side in that. I do not trust the tech oligarchs running this in the US even slightly, I do not trust Beijing either, and there are days I think China might do a better job of it, which is an uncomfortable sentence to type.

I don't want control over this much compute and wealth concentrated in a few hands. I'd like safeguards that constrain whoever holds power, including limits they can't remove on their own. Handing the same power to an AI wouldn't answer that concern.

The first negotiating milestone is 2029. Before then, I'd want clearer answers about how the agreement handles software improvements, when disclosure becomes mandatory, and what happens if verification tools aren't ready.

~ A.
