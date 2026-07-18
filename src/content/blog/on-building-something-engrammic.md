---
title: On Building Something... Engrammic
date: 2026-05-06
tags: [ai-memory, epistemics, engrammic, agents, founder-log]
description: First thoughts on the problem that got me here. Why agent memory is treated as a retrieval problem when it's really a question of belief, and what it means to build externalized epistemics.
---

I want to tell you about the moment I knew something was deeply broken.

Last December I was building an AI SEO pipeline. We had an extensive "LLM Wiki" in a `context/` directory: structured architecture docs, a function index the agent could `grep`, the works. Now credit where credit's due, it _was_ a nice system until... context pollution kicked in. Agents started recalling stale info we'd updated *that same session*. New agents spawned with fresh context would immediately start spewing the same outdated nonsense. My context window filled up twice as fast with the agent re-reading files it had already seen, trying to reconcile contradictions that shouldn't have existed. Meanwhile my ass was constantly frustrated cussing out the agent and getting back the prescient: "*You're absolutely right!*" (holy shit do I hate that phrase more than anything).

The agent wasn't even necessarily lying, it wasn't even wrong in the way you'd normally think about wrongness. It was doing exactly what we'd built it to do: retrieve relevant context and use it. The problem was that "**relevant context**" included garbage it had made up, and there was no mechanism anywhere in the system to distinguish observed facts from concluded guesses from outright fabrications.

This happens constantly. Every agent system I've seen does some version of this and the more I dug into why, the more I realized we're all building on a fundamental assumption that's quite incomplete. The assumption is that memory is a *retrieval problem*. Find the right chunks, stuff them in the context window, let the model figure it out. RAG, vector stores, semantic search, the whole ecosystem oriented around one question: how do we find relevant information? But that's the wrong question. The right question is: how do we know if the information is *true*? And nobody's really asking that. And it's killing agents.

This is what the industry calls context rot.

And the fact is that the standard fixes are kinda like bandaid fixes. They work until they just... *don't*. Sure, you can [RAG](https://en.wikipedia.org/wiki/Retrieval-augmented_generation) it, but cosine similarity will find you the *closest* chunk, which is not the same as the *correct* chunk, and when the closest chunk happens to be a hallucination from six weeks ago you've just automated the process of confidently being wrong.

You can use one of the vector memory products like `Mem0` or `Zep` where sessions persist, great, but the memories are flat notes accumulating forever with no expiry and no revision, no... **nuance**. If the agent said "uses OAuth" on Monday and "uses API keys" on Tuesday, both statements live in memory eternally, neither one questioned, both retrieved with full confidence depending on which one's embedding happens to be closer to the query and even with timestamps for temporal context it's still *extra* tokens spent on reasoning which one's the latest. None of these approaches track what was *concluded*, from *what evidence*, and *whether it still holds*; and this doesn't include the quality and filtering on the *recall* aspect of it all. This is the gap, this is what everyone is missing, and I think I finally understand why.

The mental model we inherited from search just doesn't work for agents. Search is stateless (and LLMs too if I didn't suddenly contract dimentia): you query -> you get results -> you're done. The *index* doesn't care what you did with the results or whether they were accurate for your purpose. But agents are... (kinda) stateful. They reason over time and build up beliefs through sequences of observations and inferences. If you don't track that provenance, if you just dump everything into a vector store and call it memory, you get exactly what we have now: systems that retrieve confidently and understand nothing.

The research community is starting to figure this out. There's a [paper from Google DeepMind](https://arxiv.org/abs/2603.02960) this year talking about "epistemic drift," how miscalibrated AI systems actually degrade human judgment over time by confidently providing unreliable information. There's [work on "belief deviation"](https://arxiv.org/abs/2510.12264) in multi-turn reasoning showing you can get 30-point performance improvements just by detecting when an agent's internal state has drifted too far from coherence. Multiple groups are independently converging on formal models of belief revision because the informal approach of just storing stuff and retrieving it demonstrably doesn't scale.

The funny thing is that biology figured this out ages ago. You've got the [hippocampus](https://en.wikipedia.org/wiki/Hippocampus) doing rapid, sparse encoding of specific episodes and the neocortex doing slow consolidation of generalized knowledge, and the whole system runs a nightly process to decide what gets promoted from "thing that happened" to "thing I know." [Sharp-wave ripples](https://en.wikipedia.org/wiki/Sharp_waves_and_ripples) during sleep, explicit mechanisms for forgetting.

The brain doesn't try to remember everything, it tries to remember what *matters*, and it has architecture specifically designed to tell the difference. We don't have that architecture. Nobody's building it. The $6 billion agent memory market is 100% focused on retrieval quality and approximately 0% focused on belief coherence.

**!! Nerd Infodump Alert :3 !!**

There's been some movement in the right direction though. [HippoRAG](https://arxiv.org/abs/2405.14831) explicitly models the hippocampal indexing theory with knowledge graphs and PageRank, getting 20% improvements on multi-hop QA by taking the biology seriously. There's [work on surprise-gated episodic memory](https://arxiv.org/abs/2606.03787) in robotics where only novel observations get stored, which is exactly the kind of salience filtering brains do.

[Zep](https://arxiv.org/abs/2501.13956) built temporal knowledge graphs with episodic and semantic layers. [Hindsight](https://arxiv.org/abs/2512.12818) goes further with four distinct memory networks and conflict resolution policies, but contradictions are still *preserved* with timestamps rather than *resolved* before storage, and there's [no concrete method](https://hindsight.vectorize.io/blog/2026/05/21/agent-memory-consolidation) for tracing exactly why the agent said what it said.

These are all steps toward the architecture we need but they're still fundamentally retrieval systems. They make retrieval smarter but they don't track belief status, they don't handle contradiction at write time, they don't maintain provenance chains you can audit. The hard part isn't finding the right memory, it's knowing whether what you found is still true and how it relates to everything else you believe. So that's what we're building.

But wait, what do I even mean by "belief"?

Well it's not necessarily a memory. A memory is: "she left me on read." However a *belief* is "she's mad at me, because she left me on read and she never does that, and I'm pretty sure until she texts back." See the difference? It's mostly about placing a memory in the *context* (no pun intended) of past experiences or related memories and interpreting it.

Now here's the thing: agents can't do really this naturally. What the agent believes has to live outside the model itself. You can't store durable, auditable, correctable beliefs in neural network weights. The capacity just isn't there, [roughly 3.6 bits per parameter](https://arxiv.org/abs/2505.24832) shared between generalization and memorization, and the interpretability isn't there either since superposition means neurons encode mixtures, not facts.

The question "what does this model believe about X" is literally unanswerable by construction. If you need to ask "why does the agent believe this?" and get a real answer, not a generated confabulation but an actual evidence chain you can audit, that evidence chain has to exist *somewhere*. It has to be explicit, queryable, and it has to support revision because beliefs change.

We're calling this externalized epistemics, which is just a fancy way of saying the memory system itself needs to know what it knows. The name "Engrammic" comes from engrams, the hypothetical physical traces of memory in the brain, and the difference I keep coming back to is that most agent memory today is flat, just text sitting in a database with no structure beyond what embedding it lands near, but what we're building has a... shape to it. Provenance and meaning baked into how it's stored. Memory is flat, but meaning, my dear reader... meaning is ✨ *engrammic* ✨.

It needs to track *why* it believes things, catch conflicts when they happen, and sort them out before they get stored instead of finding out later that half your memory is contradicting the other half.

Concretely that means when an agent tries to store "she texted back, we're good" and "she's mad at me" already exists, the system doesn't just append another row. It flags a conflict and forces you to sort it out. Either the old belief gets superseded with an explicit link to what replaced it, or the new observation gets rejected, or both get held in suspension pending human input. But what *doesn't* happen is silent accumulation of contradictory facts that will inevitably resurface to confuse everything.

It means every belief has a trace, not "the model generated this" but "this came from observations X, Y, Z, recorded at times A, B, C, with confidence that decayed over time." When an enterprise asks "why did your agent tell our customer this" you can answer by walking the graph, not with a shrug. It means forgetting is a real thing you actually design for. Old observations decay, stale context fades, and the system actively decides what matters enough to keep. The goal here is not to design some kinda "perfect" recall, it's to design good *judgment* about relevance.

This is harder to build than a vector store but it's also the only thing that actually works once your agent runs for more than a week on real tasks with real users with messy data.

I think the next decade of AI is about trust, not capability. We've proven models can be capable but we haven't proven they can be trusted, and every deployment I've seen fails on trust eventually because the memory layer isn't designed for it.

Multi-agent systems make this worse. When five agents write to shared state you get the cache-coherence problem but for beliefs. What does `agent 3` think when `agents 1 and 2` wrote conflicting observations? Nobody knows and the architectures don't support internal reconcilation.

World models make this worse too, LeCun's [JEPA](https://openreview.net/forum?id=BZ5a1r-kVsf) work explicitly specifies external memory for a reason and the VLA papers in robotics all implement external retrieval, but none of them have epistemic structure: no belief status, no provenance, no contradiction handling. It's retrieval all the way down.

We publish our research openly because this problem is bigger than one company. The technical papers are at [engrammic.ai/research](https://engrammic.ai/research) and the core architecture is open source. I'd rather this get built correctly than get built by us so if you're working on agent memory, belief revision, multi-agent coordination, or anything adjacent to this problem space. We. Want. To. Hear. From. You.

We're actively looking for collaborators on the research side. There's a lot of ground to cover and not enough people thinking about it seriously. Reach out, poke around the papers, open issues on the repo. This stuff matters and it's more fun to figure it out together.

Am I qualified to solve this? Honestly, probably not. Will I try anyway? Hell yes. Someone has to build it, might as well be me. The current trajectory where we keep scaling retrieval and hoping coherence emerges doesn't lead anywhere good. It leads to agents that are fluent and confident and wrong in ways you can't debug and can't audit and can't explain to the regulator asking why your system told someone something false. There's also the question of alignment but I'll save it for another blog, tldr; human-aligned intelligence can emerge from systems that think in the same shape as humans do: epistemically.

For a closing note I'd like to say that: **Before intelligence can be trusted, it must learn to doubt. That's what we're building... *doubt*.**

_Header image via [cosmos.so](https://www.cosmos.so/e/948956014)._
