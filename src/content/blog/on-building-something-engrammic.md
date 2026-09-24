---
title: On Building Something... Engrammic
date: 2026-05-06
tags: [ai-memory, epistemics, engrammic, agents, founder-log]
description: Repeated stale claims in an AI pipeline led me to work on agent memory that records evidence, tracks revisions, and handles conflicting observations.
---

Last December I was building an AI SEO pipeline. We had an extensive "LLM Wiki" in a `context/` directory: structured architecture docs, a function index the agent could `grep`, the works. Now credit where credit's due, it _was_ a nice system until... context pollution kicked in. Agents started recalling stale info we'd updated *that same session*. New agents spawned with fresh context would immediately start spewing the same outdated nonsense. My context window filled up twice as fast with the agent re-reading files it had already seen, trying to reconcile contradictions that shouldn't have existed. Meanwhile my ass was constantly frustrated cussing out the agent and getting back the prescient: "*You're absolutely right!*" (holy shit do I hate that phrase more than anything).

The retrieved context included things the agent had made up. Our system didn't distinguish observed facts from guesses or fabrications, so the next agent could use all of them as evidence.

I'd spent a lot of effort on retrieval: finding relevant chunks and getting them into the context window. I hadn't given the system a way to check whether a retrieved claim was supported or still current. That became the memory problem I wanted to work on.

This is what the industry calls context rot.

With [RAG](https://en.wikipedia.org/wiki/Retrieval-augmented_generation), similarity helps find relevant text. It doesn't establish whether that text is correct. An unsupported claim stored six weeks ago can still be a close match for today's query.

Products such as `Mem0` and `Zep` address memory across sessions, but persistence alone doesn't resolve conflicting notes. If an agent stores "uses OAuth" on Monday and "uses API keys" on Tuesday, I need to know whether the system changed, the statements concern different components, or one was wrong. Timestamps help, but the newest statement isn't necessarily the best-supported one. I want to retain the evidence for each claim and record how a conflict was resolved.

An agent may use a search result to make a decision, then use that decision as context for a later one. I want to track those dependencies. If an observation turns out to be wrong, we should be able to find the conclusions that depended on it.

The research community is starting to figure this out. There's a [paper from Google DeepMind](https://arxiv.org/abs/2603.02960) this year talking about "epistemic drift," how miscalibrated AI systems actually degrade human judgment over time by confidently providing unreliable information. There's [work on "belief deviation"](https://arxiv.org/abs/2510.12264) in multi-turn reasoning showing you can get 30-point performance improvements just by detecting when an agent's internal state has drifted too far from coherence. Multiple groups are independently converging on formal models of belief revision because the informal approach of just storing stuff and retrieving it demonstrably doesn't scale.

The funny thing is that biology figured this out ages ago. You've got the [hippocampus](https://en.wikipedia.org/wiki/Hippocampus) doing rapid, sparse encoding of specific episodes and the neocortex doing slow consolidation of generalized knowledge, and the whole system runs a nightly process to decide what gets promoted from "thing that happened" to "thing I know." [Sharp-wave ripples](https://en.wikipedia.org/wiki/Sharp_waves_and_ripples) during sleep, explicit mechanisms for forgetting.

What interests me in that comparison is selective retention: what gets kept, what gets revised, and what is forgotten. Those are the questions I want to apply to agent memory.

**!! Nerd Infodump Alert :3 !!**

There's been some movement in the right direction though. [HippoRAG](https://arxiv.org/abs/2405.14831) explicitly models the hippocampal indexing theory with knowledge graphs and PageRank, getting 20% improvements on multi-hop QA by taking the biology seriously. There's [work on surprise-gated episodic memory](https://arxiv.org/abs/2606.03787) in robotics where only novel observations get stored, which is exactly the kind of salience filtering brains do.

[Zep](https://arxiv.org/abs/2501.13956) built temporal knowledge graphs with episodic and semantic layers. [Hindsight](https://arxiv.org/abs/2512.12818) goes further with four distinct memory networks and conflict resolution policies, but contradictions are still *preserved* with timestamps rather than *resolved* before storage, and there's [no concrete method](https://hindsight.vectorize.io/blog/2026/05/21/agent-memory-consolidation) for tracing exactly why the agent said what it said.

For Engrammic, I want belief status, contradiction handling at write time, and provenance that can be inspected together. The goal is to make it possible to check whether a retrieved claim still holds and which other claims depend on it.

By "belief" I mean an interpretation supported by observations. "She left me on read" is an observation. "She's mad at me because she left me on read and she never does that" is an interpretation, and it might change when she texts back. I want the system to keep that distinction.

For this design, I want the records outside the model's weights, where they can be inspected and edited. Work estimating [roughly 3.6 bits per parameter](https://arxiv.org/abs/2505.24832) examines model storage capacity, but capacity alone doesn't give us an auditable record for each claim. That's the requirement I'm trying to meet.

Asking a model why it made a claim doesn't give me an independently checkable record of how it got there. For that, I need stored observations and links showing which conclusions used them. Those links also need to survive revisions.

We're calling this externalized epistemics. The name "Engrammic" comes from engrams, the hypothetical physical traces of memory in the brain. In the software, the idea is to store claims with their evidence, status, and relationships so we can inspect and revise them.

Concretely that means when an agent tries to store "she texted back, we're good" and "she's mad at me" already exists, the system doesn't just append another row. It flags a conflict and forces you to sort it out. Either the old belief gets superseded with an explicit link to what replaced it, or the new observation gets rejected, or both get held in suspension pending human input. But what *doesn't* happen is silent accumulation of contradictory facts that will inevitably resurface to confuse everything.

It means every belief has a trace: rather than "the model generated this", it's "this came from observations X, Y, Z, recorded at times A, B, C, with confidence that decayed over time." When an enterprise asks "why did your agent tell our customer this" you can answer by walking the graph, not with a shrug. It means forgetting is a real thing you actually design for. Old observations decay, stale context fades, and the system actively decides what matters enough to keep. Rather than some kinda "perfect" recall, the goal here is good *judgment* about relevance.

That adds more machinery than storing and retrieving text. I think it's worth trying for agents whose decisions depend on records accumulated over many sessions.

Shared memory makes conflict handling particularly important. If `agents 1 and 2` write conflicting observations, what should `agent 3` receive? It needs enough context to recognise the disagreement, and a way to record a resolution without losing the original evidence.

I'm also interested in how this would apply to world models and robotics, including the external-memory role discussed in LeCun's [JEPA](https://openreview.net/forum?id=BZ5a1r-kVsf) work. For systems acting on stored observations, I'd want to ask the same questions about provenance, conflicting records, and revision.

The technical papers are at [engrammic.ai/research](https://engrammic.ai/research), and the core architecture is open source. If you're working on agent memory, belief revision, or coordination between agents, I'd like to compare notes. We're looking for research collaborators; questions and issues on the repo are welcome too.

For me, the test is the problem that started this: when an agent repeats an outdated claim, can I find where it came from, correct it, and stop the next agent from repeating it?

_Header image via [cosmos.so](https://www.cosmos.so/e/948956014)._
