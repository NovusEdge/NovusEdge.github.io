---
title: Two Millennium Problems in One Day (Probably)
date: 2026-11-21
tags: [ai, math, lean, commentary]
description: On the 20th of November, AI-assisted proofs of the Riemann Hypothesis and Navier–Stokes blowup both dropped, three weeks after two labs independently broke the Exponential Time Hypothesis. A look at the last few months of AI math, and what's actually been checked.
toc: true
pixel: thinking
---

## Friday

Terry Tao put up a [blog post](https://terrytao.wordpress.com/2026/11/20/unforced-euler-singularity-unforced-navier-stokes-singularity-and-the-generalized-riemann-hypothesis/) on the 20th of November with a title that reads like a list of things that weren't supposed to happen in my lifetime: "Unforced Euler singularity, unforced Navier-Stokes singularity, and the Generalized Riemann Hypothesis". All three came out that day, all three were made with heavy AI use, and one name is on all three: Levent Alpöge, a number theorist at Anthropic.

Two of those are Clay Millennium Prize problems. There are seven of them, the prize for each is a million dollars, and in 26 years exactly one has been solved (Perelman, Poincaré, turned the money down). Now there might be three, and two of them showed up within a few hours of each other.

None of it is confirmed yet, and I'll get to what "confirmed" means here. But this didn't come out of nowhere either. The last few months have been building to it, and it's worth going through the whole run.

## How we got here

This is the short version. Most of it comes from the Wikipedia [list of AI math discoveries](https://en.wikipedia.org/wiki/List_of_mathematical_discoveries_made_with_artificial_intelligence), which now has an embarrassing number of 2026 entries.

{{timeline}}

Blue has been checked by people or Lean, amber is waiting on a check, and red means disputed or partly walked back. The Ehrhart result only covers the upper bound, and the equality case is still open. About half of the October papers came with Lean, and three were retracted within a day.

The 6th of October one deserves its own post. OpenAI put out 722 manuscripts across a few hundred topics from one unreleased model. Alpöge called it "obviously the most significant moment in mathematical history", Sarnak said he wouldn't call any of it a theorem until humans had checked it, and some of the Lean turned out to prove weaker things than the papers said. Six weeks later "the most significant moment" might already be third.

## ETH

The Exponential Time Hypothesis says, roughly, that 3-SAT can't be solved meaningfully faster than brute force. If you have n variables, you need something like 2^(cn) time. It's not as famous as P vs NP, but a lot of complexity theory is built on top of it, since "assuming ETH, this problem needs at least X time" is how you prove a ton of lower bounds.

{{eth_figure}}

On the 16th of October, two labs found it was false on the same day. OpenAI's write-up is titled "The Exponential Time Hypothesis Is False" and says "our system has recently proved that the ETH is false", with a [Lean proof](https://openai.com/index/building-scientific-understanding-with-academic-communities/) done the next day. Anthropic's paper, "A 2^o(n) Time Algorithm for 3-SAT", came out around the same time, calls the two results "independent and concurrent", and says ["Claude found the core algorithm with no human input"](https://www.datacamp.com/blog/ai-exponential-time-hypothesis). Anthropic also claims it kills the Strong ETH.

Russell Impagliazzo, who's one of the people who *came up with* ETH, called it "deeply surprising". He's now co-leading the group checking it with Ramamohan Paturi and Ryan Williams. Williams said most of it looks routine, apart from a few bits:

> “Two or three alien-looking parts.”
>
> — Ryan Williams, on the ETH proof

"Alien-looking" is the most 2026 thing a complexity theorist has ever said about a proof.

To be clear about the scope, this isn't P = NP, and the speedup reportedly only matters in practice for formulas with millions of variables. But two separate AI systems finding the same thing in the same week is its own kind of evidence. It's the kind of overlap you'd expect if the idea was sitting right there and the models were finally strong enough to see it.

## Navier–Stokes

The Navier–Stokes Millennium problem asks whether smooth initial conditions for a 3D fluid always stay smooth, or whether the solution can blow up in finite time. Proving either one wins.

{{ns_figure}}

In September, OpenAI claimed blowup, but for a *forced* version, meaning there's an external force pushing on the fluid. Scientific American called that force "unrealistic, finely tuned", and it isn't the version Clay asks about. It also came with a fight. Tristan Buckmaster, who'd been working on the same problem with Alpöge, says OpenAI's first prompt went out [days after information about their work reached the company](https://www.unite.ai/buckmaster-and-alpoge-post-ai-fluid-blowup-proofs-dispute-openai-contact/). When he asked on a call whether the model had trained on their Codex sessions, he says: "I did not get an answer." By his account OpenAI also pushed twice to drop Alpöge from the authorship because he works at Anthropic. OpenAI denies any foul play, and that's all from Buckmaster's side, but it's quite the backstory.

On the 20th, Alpöge and Buckmaster posted their own result: finite-time blowup for the *unforced* 3D equations, the real one, as a 79-page paper plus [Lean](https://github.com/tristanbuckmaster/navier-stokes/). Tao says the strategy is "broadly clear": a numerical, approximately self-similar solution plus rigorous perturbation theory around it. He also says "more work needs to be done to create a proper, professionally written proof." Two practical gaps remain. The numerical certificate the proof depends on isn't released yet, only its hash. And the README itself says "the patched package was not rebuilt when this repository was assembled", so the Lean build isn't confirmed.

## The Riemann Hypothesis

{{rh_figure}}

This is the one everyone's posting about. Alpöge put a four-page PDF called [Remark](https://alpo.ge/remark.pdf) on his website:

> I believe I have, working with Claude, discovered a proof of the Riemann Hypothesis. In fact, the method easily extends much further, resolving the so-called Generalized Riemann Hypothesis, and I expect, with more time, the Extended Riemann Hypothesis too.

The proof is a footnote linking to fourteen tarball parts, together 239 MB and about 175,000 Lean files. There is no paper. He says a human-readable version is "routine to produce", and in another footnote that he did produce one, which "hit 250,000+ pages". When he opened Claude's "book" to Theorem 1, it began by noting that because the reals are totally ordered, if σ ≠ ½ then σ > ½ or σ < ½. He decided that posting it would be "some massive unreadable travesty of 'slop'" and released only the Lean.

{{proof_scale}}

The note is also the most excited I've ever seen a mathematician sound in writing. He says he'd been planning for this problem since he was a student, steered the work into the right setting, and then:

> “Claude far outpaced me near the finish line. No, Claude flew, and danced, and sparkled near that finish line.”
>
> — Levent Alpöge, Remark

His one concrete example is the idea of chaining theta lifts to imitate the "multiplicity" trick from Stepanov's proof of RH over function fields. For a prime sum of length X, Claude suggested a chain of length √X. "(And yet, what else could it be?)" He admits he has "little mastery of automorphic forms on higher rank groups", which is where a lot of the argument lives. The 20-step timeline on page 3 is a Claude summary that he warns "might make zero sense". It runs from the 6th of October to a final step on the 16th of November that just says "GRH".

There's a nice cross-lab bit in there too. He credits OpenAI's "good taste" with problems. Working out the equality case of their Ehrhart result is where he says he "immediately understood Navier-Stokes was going to fall". He also recognised their Siegel argument as "Stepanov without multiplicity", which is the exact gap the theta lifts fill. So the AI-for-math race isn't neatly one lab against another. People are reading each other's model output and building on it.

## Is it real

As of writing, it's looking good. The Lean's top-level theorem is stated against Mathlib's own definition of `RiemannHypothesis`, with GRH for Dirichlet L-functions alongside it, per the [independent mirror](https://github.com/Deicyde/riemann-hypothesis) set up to check it. Andrew Sutherland at MIT compiled it himself and told Scientific American ["honestly the chance that anything is fishy here is approximately zero"](https://www.scientificamerican.com/article/the-ai-riemann-hypothesis-proof-is-almost-certainly-true-independent-mathematicians-attest/). Kevin Buzzard's response was "we still await a successful comparator run."

{{lean_statement}}

Buzzard's caveat is the one that matters. Comparator checks the proof against theorem statements written separately and lists every axiom it uses. Lean will compile a file that quietly assumes what it's trying to prove, as long as the assumption is declared. A clean run means only Lean's three standard axioms are used, which would leave a Mathlib definition bug or a Lean kernel bug as the only ways out. Both are very unlikely for a statement this well-read.

If Comparator comes back clean, we're in a strange place. The Riemann Hypothesis would be a theorem, and the only complete proof would be one that no human has read and possibly no human can. Clay's prize rules want a refereed publication and two years of acceptance, and nobody wrote those with a 239 MB tarball in mind.

## Where this goes (speculation)

Everything above is what's been claimed and checked. This section is me guessing, so weigh it accordingly.

**The pattern.** Line the results up and the same shape keeps showing up. A human picks the problem and steers toward the right setting, and then the model does the technical heavy lifting in exactly the area the human knows least. Alpöge says this outright about automorphic forms on higher rank groups. The output is too big to read: 175,000 Lean files for RH, around 2,270 files and 600,000 lines for Navier–Stokes, and a 250,000-page "book" nobody will open. So Lean ends up doing the refereeing. And when two labs land on the same ETH algorithm on the same day, it looks less like genius and more like a capability threshold getting crossed. The ideas were sitting there waiting for something strong enough to reach them.

**The cadence.** In July it was a counterexample to one conjecture. By November it was two Millennium problems. That's five months. I'm not going to extrapolate a curve from nine data points, but there are four Millennium problems left (P vs NP, Hodge, Yang–Mills and Birch–Swinnerton-Dyer), and I'd be less surprised than I was a year ago to see another one claimed in 2027.

**What changes if it holds.**

- Every "assuming GRH" in the literature turns into a plain theorem. The textbook example is Miller's primality test, which has been deterministic and polynomial-time *if* GRH holds since the 70s.
- The hard part of checking a proof moves from the proof to the statement. Once Lean accepts a proof, the remaining question is whether the theorem it proves is the one we meant. Reading 30 lines of definitions very carefully becomes the new refereeing.
- Understanding starts lagging behind truth. We may spend years knowing RH is true before anyone can explain why in a way that fits in a human head, and Alpöge's "short arguments to follow" is a bet that this gap closes fast.
- Credit gets messy. The Buckmaster dispute is a preview: whose idea was it, whose model, whose data. Clay's rules, refereeing norms and authorship conventions were all written for a world where the author could explain the proof.
- What a mathematician does shifts toward choosing problems, judging taste and building understanding. Alpöge's note keeps praising "good taste", from both labs. That might be the job now.

None of this needs the RH proof to survive Comparator. Even if it falls over, ETH, the zeta-zeros result and the July results are still there, and the pattern was visible before Friday.

## What's next

- The Comparator verdict on RH, and a second independent build.
- The Navier–Stokes certificate release and a clean Lean rebuild.
- The Impagliazzo–Paturi–Williams verdict on ETH.
- Alpöge's promised proper write-up, and the shorter proof he expects to follow "fairly quickly".

Alpöge's note ends with "In a time of revolution in mathematics I hope the argument provides a glimpse towards the miracles that lie ahead." A year ago that would have read as a crank's sign-off, and now it reads as a reasonable forecast.
