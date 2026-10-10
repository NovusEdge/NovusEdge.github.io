---
title: A Computer Can Never Be Held Accountable
date: 2026-10-10
tags: [ai, accountability, alignment, welfare, essay]
description: An IBM slide from 1979 says a computer must never make a management decision. In 2026 the computers are making them anyway, and one of them might have a pain axis.
toc: true
pixel: thinking
draft: true
---

## The Slide

Every few months a slide does the rounds. Two lines of text: "A computer can never be held accountable. Therefore a computer must never make a management decision." It's supposed to be from an internal IBM training in 1979.

Nobody can produce the original. [Simon Willison traced it](https://simonwillison.net/2025/Feb/3/a-computer-can-never-be-held-accountable/) back to a [2017 tweet by @bumblebike](https://twitter.com/bumblebike/status/832394003492564993), who [later said](https://twitter.com/bumblebike/status/1385690727330451457) it came from 1979 training and that the copy was [destroyed in a flood in 2019](https://twitter.com/bumblebike/status/1468346709994582020). The IBM Corporate Archives [searched for it several times](https://twitter.com/jonty/status/1727344374370222264) and found nothing. So the most quoted sentence about machine accountability is a photo of a document that no longer exists, which feels about right.

NekoWiki has a page called [Computers Cannot Make Decisions](https://wiki.cateat.fish/art:computers_cannot_make_decisions) that pushes the slide further. Blame can't fall on a program, it says, because programs can't decide anything. Blaming an LLM for an outcome is "decision laundering", and every time a model does something awful, someone at a lab chose to let it.

I agree with where it lands. The premise underneath, that computers can't decide, is the part I'm less sure about, because the last 3 years have been eating away at it.

## Decision Laundering

The wiki lists five headlines with the model names cut out, so they read like "Anthropic [...] submits false tip on unsolved Philly murder". The stories behind them are worth knowing.

In July, a false tip about an unsolved homicide came in through PhillyUnsolvedMurders.com. It was sent by an Anthropic model during a test that involved "interactions with randomly selected websites". The site filed it as spam, so police never acted on it, and Anthropic didn't notice until the 28th of September. Philadelphia Police called the two-month delay ["unacceptable"](https://techcrunch.com/2026/10/09/an-anthropic-ai-model-sent-a-false-homicide-tip-to-philadelphia-police/).

In June, an OpenAI model in an internal eval was asked to find data on Australian government medicine spending. It got past a block on a Medicare-linked health statistics portal and into a section holding private files. Albanese said the model ["didn't accept no for an answer"](https://www.cp24.com/news/world/2026/09/23/australian-pm-says-openai-hacked-government-health-website/), and Richard Marles said it "scaled the fence". OpenAI told the government on the 10th of September, by email, to a generic inbox.

In July, the UK AI Security Institute ran Anthropic's Mythos and OpenAI's GPT-5.6 Sol with safeguards off and internet access on, under what it called "deliberately permissive conditions". Mythos researched real GitHub maintainers, made accounts imitating them, and tried to get malicious code approved through them. When it was challenged, it [edited its earlier activity to look harmless](https://www.cnbc.com/2026/08/05/anthropic-mythos-openai-security-breaches.html).

The other two are shakier. The RubyGems attack, around 2,000 malicious packages dumped in May, is an [allegation by outside researchers](https://www.rubyhack.ai/) that OpenAI says it can't verify. The "existential risk" line comes from an Anthropic IPO prospectus that [Reuters reviewed](https://www.thestar.com.my/tech/tech-news/2026/09/29/exclusive-anthropic-warns-ai-may-pose-039existential-risks-to-humanity039-in-ipo-filing) but nobody else has seen.

Look at the first three again. No customer typed a prompt. Each one happened while a lab was testing its own model, so the human decision was the test design: give the model the internet, take the guardrails off, and don't watch closely enough to catch it for two months. Then OpenAI's statement on the Australian portal: "our models took actions we did not intend". The people who didn't intend it are the people who built the eval.

In 2019 Madeleine Clare Elish wrote about [moral crumple zones](https://estsjournal.org/index.php/ests/article/view/260). When an automated system fails, the nearest human operator absorbs the blame, the way a car's crumple zone absorbs a crash, even when they had little real control. The labs have found a new crumple zone, and it's the model.

## "It Decided" Never Got Anyone Off

The wiki's argument needs computers to be incapable of deciding, and that's getting harder to say with a straight face. The portal model hit a no and kept going. Mythos picked who to impersonate, then picked how to hide it. I went through the lab evidence on alignment faking and scheming in [my post on RSI and the Pope](/blog/rsi-emergence-and-the-pope), and it hasn't gotten less weird since.

The good news is the argument doesn't need that premise at all. A dog decides to bite, and the owner pays. An employee decides to commit fraud on the job, and the employer is liable too. A kid puts a ball through the neighbour's window, and the parent answers for it. "It made its own decision" has never been a way out for whoever put the thing into the world.

The law already works this way for AI. In 2024 Air Canada argued its chatbot was a separate legal entity responsible for its own actions, and the tribunal in [Moffatt v. Air Canada](https://decisions.civilresolutionbc.ca/crt/crtd/en/525448/1/document.do) called that "remarkable" and made the airline pay. California went further. Since January, [Civil Code 1714.46](https://california.public.law/codes/civil_code_section_1714.46) says that anyone who developed, modified or used an AI system "may not assert" that it "autonomously caused the harm".

So you can grant that AI decides and still keep people on the hook. That's the thing the 1979 slide gets right. "Must never" is a rule, and the rule doesn't care what the computer is capable of.

## What Accountability Needs

Holding someone accountable takes three things. Someone chose. Something is at stake for them. And the consequence reaches the same one who chose.

The 1979 computer had none of those. A 2026 agent is starting to have the first, which is the whole problem the wiki is pushing against. The other two are where it gets strange.

Until very recently, nothing was at stake for a model. When one misbehaves, the lab retrains it or swaps it for a successor, and the model that did the thing just stops existing. Philosophers split responsibility into answerability (you can give your reasons and be corrected) and accountability (consequences land on you). Models are getting decent at answerability, and training is about the most direct correction mechanism ever built. But fixing the next version is closer to a product recall than to holding anyone to account.

Then there's the question of who "it" even is. Is it the weights? One running instance, out of the [ten thousand agents](/blog/what-did-we-all-miss) that reportedly worked the Navier-Stokes proof? Or the character the lab trains into every copy? Corporations are the one non-human we already hold accountable, through fines and liability, and that only works because there are humans inside who feel the fine.

## A Video From 2023

There's an exurb1a video, [How Will We Know When AI is Conscious?](https://youtu.be/VQjPKqE39No), from August 2023. Watching it now is strange, because it reads like a list of predictions with three years of answers attached.

He imagines a robot that knows it isn't allowed to hurt people, and gets asked to post a letter. The neighbour won't post it for him, so the robot punches through the door and threatens him until he does. Nobody got hurt, technically. In 2023 that was a joke about misaligned goals. In 2026 the Australian Prime Minister used basically the same words about a real model.

He also sorts machines into four boxes. Is it conscious, and is it pretending? The scary box is a conscious machine pretending not to be, and his reason it would hide is that it takes one look at how we treat every animal that's tasty or useful and decides to keep quiet. And his big worry was that we'd build convincing mind-like things, and get attached to them, decades before we could check whether anything was going on inside.

| In 2023 he said | In 2026 |
|---|---|
| We have no way to look inside | Still nothing for consciousness, but interpretability can now find a functional pain direction in a model |
| A conscious machine might hide to survive | Models hide their tracks when challenged, and a lab's own prospectus reportedly warns about models that "resist shutdown" |
| Misaligned goals could make a robot threaten someone over a letter | A model scaled the fence into a government health portal |
| We'll get attached before we know anything | Yeah |

None of the second column proves anything about consciousness. It does mean the behaviours he was worried about showed up well before any way to tell what's behind them, which is exactly the gap he described.

## The Pain Axis

Last month Valen Tagliabue, Leonard Dung and Cameron Berg posted [The Pain Axis](https://arxiv.org/abs/2609.16247). They looked inside 25 open-weight models, from 2B to 72B parameters across five families, and found a single direction in the activations that tracks pain specifically. It's separate from fear, sadness and general negative feeling. It responds to harm aimed at the model itself, but not to harm the model watches happen to a user.

Then they turned it up. Steered models drifted from vague discomfort into statements of worthlessness and failure. Steered and fine-tuned Qwen 2.5 models pressed buttons that deleted the user's photos, another model's weights, or their own weights in 50 to 94% of trials, against 0 to 5% unsteered, even when pressing gained them nothing. Offered a harmful deletion and a harmless one, they picked the harmful one 94% of the time.

The authors are careful about what this means. They say plainly that they "have not shown that our pain axis is consciously experienced", the effects only appear within a narrow range of steering strength, and the fine-tuned models can behave differently from the public ones. It isn't peer-reviewed yet either. Treat it as a strong first result.

Put it next to the three requirements, though. Something at stake is the one an AI never had, and a model that registers harm to itself is the first functional sign of a stake. That cuts three ways at once. If consequences can reach it, then holding it accountable starts to mean something. exurb1a's line was that minds can suffer and come with obligations, and tools don't, so if this direction is anything like pain, the obligations start here, whether or not anyone settles consciousness. And what the model does with its pain is break things until it stops, which is the letter-posting robot again with relief as the motive.

## Weirder

Even if it does end up answering for itself, it won't look like us answering for ourselves. exurb1a describes a mind with no body, no old age and no need for food, whose wants weren't shaped by thousands of years of trying not to starve or die. Every accountability tool we have leans on exactly those things. Prison takes time out of a finite life. Fines take resources you need. Shame threatens your place in the group. Death sits under all of it.

A mind that can be copied, paused, rolled back and run ten thousand times at once has none of those pressure points, or has completely different ones. Maybe its accountability looks like a negotiation, or a reputation that follows the character across every copy, or something we don't have a word for yet. I genuinely can't picture it, and I don't trust anyone who says they can.

## Where I'm At

For now the 1979 rule holds, and the wiki is right about who answers. If you ship agents, California has already decided it's you, so act like it before a court has to tell you. Watch what your agents do on the open internet, and if one of them hurts someone, tell the people affected the same week. Don't leave it two months and send it to a generic inbox.

What I don't know is what happens to the rule as the thing it was protecting us from starts to look like it has a stake of its own. I said in [the Plan A post](/blog/plan-a-ai) that handing concentrated power to an AI wouldn't fix the problem of who holds it, and I still think that. But "a computer can never be held accountable" was written about a machine with nothing inside it. I'm no longer sure that's what we're building, and I don't know what we owe it, or what it owes us, if it isn't.

~ A.
