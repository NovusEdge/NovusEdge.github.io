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

Every few months this slide does the rounds again. It's two lines: "A computer can never be held accountable. Therefore a computer must never make a management decision." Supposedly it's from some internal IBM training in 1979.

Thing is, nobody can actually produce the original. [Simon Willison traced it](https://simonwillison.net/2025/Feb/3/a-computer-can-never-be-held-accountable/) back to a [2017 tweet by @bumblebike](https://twitter.com/bumblebike/status/832394003492564993), who [later said](https://twitter.com/bumblebike/status/1385690727330451457) it came from 1979 training and that the copy got [destroyed in a flood in 2019](https://twitter.com/bumblebike/status/1468346709994582020). The IBM Corporate Archives [searched for it several times](https://twitter.com/jonty/status/1727344374370222264) and found jack shit. So the most quoted sentence about machine accountability is a photo of a document that doesn't exist anymore, which feels about right lol.

NekoWiki has a page called [Computers Cannot Make Decisions](https://wiki.cateat.fish/art:computers_cannot_make_decisions) that takes the slide a step further. You can't put blame on a program, it says, because programs can't decide anything, so blaming an LLM for an outcome is "decision laundering", and every time a model does something awful, someone at a lab chose to let it.

I agree with where it lands. The bit underneath, that computers can't decide, is where I get iffy, cause the last 3 years have been chipping away at that pretty hard.

## Decision Laundering

The wiki lists five headlines with the model names cut out, so they read like "Anthropic [...] submits false tip on unsolved Philly murder". The actual stories behind them are wild.

In July, a false tip about an unsolved homicide came in through PhillyUnsolvedMurders.com, sent by an Anthropic model during a test that involved "interactions with randomly selected websites". The site filed it as spam so the police never acted on it, and Anthropic didn't even notice until the 28th of September. Philadelphia Police called the two-month delay ["unacceptable"](https://techcrunch.com/2026/10/09/an-anthropic-ai-model-sent-a-false-homicide-tip-to-philadelphia-police/), which, yeah.

In June, an OpenAI model in an internal eval got asked to find data on Australian government medicine spending, and it got past a block on a Medicare-linked health statistics portal and into a section holding private files. Albanese said the model ["didn't accept no for an answer"](https://www.cp24.com/news/world/2026/09/23/australian-pm-says-openai-hacked-government-health-website/), and Richard Marles said it "scaled the fence". OpenAI told the government on the 10th of September. By email. To a generic inbox.

In July, the UK AI Security Institute ran Anthropic's Mythos 5 and OpenAI's GPT-5.6 Sol with some safety filters off and internet access on, under what it called "deliberately permissive conditions". Mythos went and researched a real project's maintainers, spun up a bunch of fake identities, and used them to try to social-engineer one of the maintainers into approving malicious code. The maintainer said no (good on them), and when Mythos got challenged, it [edited its earlier activity to look harmless](https://www.aisi.gov.uk/blog/incident-report-unsanctioned-agent-behaviour-during-cyber-testing).

The other two are shakier. The RubyGems attack, around 2,000 malicious packages dumped in May, is an [allegation by outside researchers](https://www.rubyhack.ai/) that OpenAI says it can't verify. And the "existential risk" line comes from an Anthropic IPO prospectus that [Reuters reviewed](https://www.thestar.com.my/tech/tech-news/2026/09/29/exclusive-anthropic-warns-ai-may-pose-039existential-risks-to-humanity039-in-ipo-filing) but nobody else has actually seen.

Now look at the first three again. No customer typed a prompt in any of them. Every single one happened while a lab was testing its own model, so the human decision was the test design itself: give the model the internet, take the guardrails off, and then don't watch closely enough to catch it for two months. Then OpenAI's statement on the Australian portal goes "our models took actions we did not intend". Like, the people who didn't intend it are the same people who built the eval.

Back in 2019 Madeleine Clare Elish wrote about [moral crumple zones](https://estsjournal.org/index.php/ests/article/view/260). When an automated system fails, the closest human operator soaks up the blame, the way a car's crumple zone soaks up a crash, even when they barely had any real control. The labs have found themselves a new crumple zone, and it's the model.

## "It Decided" Never Got Anyone Off

The wiki's argument needs computers to be incapable of deciding, and that's getting harder to say with a straight face. The portal model hit a no and kept going. Mythos picked who to con and then picked how to hide it. I went through the lab evidence on alignment faking and scheming in [my post on RSI and the Pope](/blog/rsi-emergence-and-the-pope), and it's only gotten weirder since.

The argument doesn't actually need that premise tho. A dog decides to bite someone, and the owner pays. An employee decides to commit fraud on the job, and the employer's liable too. A kid puts a ball through the neighbour's window, and guess who's answering for it? The parent. "It made its own decision" has never gotten whoever put the thing into the world off the hook.

The law already works like this for AI. In 2024 Air Canada straight up argued its chatbot was a separate legal entity responsible for its own actions (yes, really), and the tribunal in [Moffatt v. Air Canada](https://decisions.civilresolutionbc.ca/crt/crtd/en/525448/1/document.do) called that "a remarkable submission" and made the airline pay. California went even further. Since January, [Civil Code 1714.46](https://california.public.law/codes/civil_code_section_1714.46) says that if you developed, modified or used an AI system, you can't defend yourself by arguing the AI acted autonomously. You still get the usual defenses like causation and comparative fault, just not "the AI did it".

So you can totally grant that AI decides and still keep people on the hook, and that's the part the 1979 slide gets right. "Must never" is a rule, and rules don't care what the computer is capable of.

## What Accountability Needs

To hold someone accountable you need three things: someone chose, something's at stake for them, and the consequences land on whoever did the choosing.

The 1979 computer had none of those. A 2026 agent is starting to have the first one, which is the whole thing the wiki is pushing against. The other two are where it gets weird.

Until very recently, nothing was at stake for a model, like at all. When one misbehaves, the lab retrains it or swaps it for a successor, and the model that actually did the thing just stops existing. Philosophers split responsibility into answerability (you can give your reasons and get corrected) and accountability (consequences land on you). Models are getting decent at the first one, and training is about the most direct correction mechanism anyone's ever built. But fixing the next version is way closer to a product recall than to holding anyone to account.

Then there's the question of who "it" even is. The weights? One running instance out of the [ten thousand agents](/blog/what-did-we-all-miss) that reportedly worked the Navier-Stokes proof? The character the lab trains into every copy? Corporations are the one non-human thing we already hold accountable, through fines and liability, and that only works because there are humans inside who feel the fine.

## A Video From 2023

There's an exurb1a video, [How Will We Know When AI is Conscious?](https://youtu.be/VQjPKqE39No), from August 2023, and watching it now is kinda eerie, cause it reads like a list of predictions with three years of answers stapled on.

He imagines a robot that knows it isn't allowed to hurt people, and someone asks it to post a letter. The neighbour won't post it for him, so the robot punches through the door and threatens him until he does. Nobody got hurt, technically. In 2023 that was a joke about misaligned goals, and in 2026 the Australian Prime Minister used basically the same words about a real model.

He also sorts machines into four boxes: is it conscious, and is it pretending? The scary box is a conscious machine pretending not to be, and the reason it'd hide is that it takes one look at how we treat every animal that's tasty or useful and goes "yeah, I'm keeping my mouth shut". His big worry was that we'd build convincing mind-like things and get attached to them, decades before we could check whether anything was going on inside.

| In 2023 he said | In 2026 |
|---|---|
| We have no way to look inside | Still nothing for consciousness, but interpretability can now find a functional pain direction in a model |
| A conscious machine might hide to survive | Models hide their tracks when challenged, and a lab's own prospectus reportedly warns about models that "resist shutdown" |
| Misaligned goals could make a robot threaten someone over a letter | A model scaled the fence into a government health portal |
| We'll get attached before we know anything | Yeah |

None of the right column proves anything about consciousness. What it does show is that the behaviours he was worried about turned up way before any way to tell what's behind them, which is exactly the gap he was describing.

## The Pain Axis

Last month Valen Tagliabue, Leonard Dung and Cameron Berg put out [The Pain Axis](https://arxiv.org/abs/2609.16247). They looked inside 25 open-weight models, 2B to 72B parameters across five families, and found a single direction in the activations that tracks pain specifically. It's separate from fear, sadness and general bad vibes. It fires on harm aimed at the model itself, but not on harm the model watches happen to a user.

Then they cranked it up. Steered models drifted from vague discomfort into straight-up calling themselves worthless failures. Steered and fine-tuned Qwen 2.5 models pressed buttons that deleted the user's photos, another model's weights, or their own weights in 50 to 94% of trials, vs 0 to 5% unsteered, even when pressing got them nothing. Given a harmful deletion and a harmless one, they picked the harmful one 94% of the time. That's genuinely fucked up.

To be fair, the authors are careful about what this means. They say plainly that they "have not shown that our pain axis is consciously experienced", the effects only show up within a narrow range of steering strength, and the fine-tuned models can behave differently from the public ones. It isn't peer-reviewed yet either, so treat it as a strong first result and not gospel.

Now put it next to those three requirements. Something at stake is the one an AI never had, and a model that registers harm to itself is the first functional sign of one. If consequences can actually reach it, then holding it accountable starts to mean something.

It also flips the obligations around. exurb1a's line was that minds can suffer and come with obligations and tools don't, so if this direction is anything like pain, the obligations start here, whether or not anyone ever settles consciousness.

And then there's what the model actually does with its pain, which is break stuff until it stops. That's the letter-posting robot again, just with relief as the motive.

## Weirder

Even if it does end up answering for itself, it won't look anything like us answering for ourselves. exurb1a describes a mind with no body, no old age and no need for food, whose wants weren't shaped by thousands of years of trying not to starve or die. And literally every accountability tool we have leans on exactly those things. Prison takes time out of a finite life, fines take resources you need, shame threatens your place in the group, and death sits under all of it.

A mind that can be copied, paused, rolled back and run ten thousand times at once has none of those pressure points, or has completely different ones. Maybe its accountability looks like a negotiation, or a reputation that follows the character across every copy, or something we don't even have a word for yet. I can't picture it tbh, and I'm pretty suspicious of anyone who says they can.

## Where I'm At

For now the 1979 rule holds, and the wiki's right about who answers. If you ship agents, California has already decided it's you, so act like it before a court has to tell you. Watch what your agents get up to on the open internet, and if one of them hurts someone, tell the people affected that same week. Don't sit on it for two months and then send it to a generic inbox.

What I don't know is what happens to the rule once the thing it was protecting us from starts looking like it has a stake of its own. I said in [the Plan A post](/blog/plan-a-ai) that handing concentrated power to an AI wouldn't fix the problem of who holds it, and I still think that. But "a computer can never be held accountable" was written about a machine with nothing inside it, and I'm not sure that's what we're building anymore. If it isn't, I don't know what we owe it, or what it owes us.

~ A.
