---
title: What Did We All Miss?
date: 2026-09-12
tags: [ai, epistemics, robotics, industry, essay]
description: Thye done did it boys, it's jover y'all ToT
draft: false
toc: true
---

## The Million Dollar Joke

When OpenAI announced they had resolved the [Navier-Stokes Millennium Prize problem](https://www.claymath.org/millennium/navier-stokes-equation/), it was quite funny to see that most people kept bringing up the fact that OAI ended up spending [something like twenty two million dollars of compute](https://techcrunch.com/2026/09/08/openai-fought-dirty-on-career-making-math-problem-says-nyu-mathematician/) spent chasing a one million dollar prize. But then the conversation moved on.

So, around ten thousand coordinating agents produced a proof and a Lean formalisation, so that the result is machine-checked rather than asserted in a press release, which means original mathematics at the hardest tier we have was done by a machine and verified by a machine in a field where a single human result can take a decade, quite neat, right? The mfs @ OAI then declined the prize money and framed the whole thing as a status report on the pace of progress.

I want to be careful here because I nearly got this wrong myself. My first instinct was to say that this unlocks fluid dynamics, and that fluid dynamics unlocks propulsion and modelling and a dozen industries downstream in widening ripples, which is the version I would have written a week ago before I was a grown wise boy. And for you lovely readers here's what I understand: The proof found a finite-time singularity, which is a negative answer, and what it tells you is that smooth solutions can break down. That matters enormously for numerical methods and for how we model turbulence, and it hands nobody a better rocket.

So the significance sits somewhere other than the applications, and it is simply that a machine did the mathematics, which is the whole thing.

## Whose Definition

On the 6th of September, Jensen Huang [declared that AGI has arrived](https://www.forbes.com/sites/timbajarin/2026/09/08/jensen-huangs-agi-claim-is-a-business-case-not-settled-fact/) and credited [GPT-6 Astra](https://openai.com/index/gpt-6-astra/) trained on _more than a 100,000 Nvidia Grace Blackwell GPUs_, and just 2 days later the proof was released (although unverified). He had form, since back in March he told Lex Fridman ["I think we've achieved AGI"](https://www.forbes.com/sites/antoniopequenoiv/2026/03/23/nvidias-jensen-huang-says-he-thinks-weve-achieved-agi/) while answering a question about how soon AI could build and run a billion dollar company, though on the August earnings call he was noticeably more careful, saying that for many tasks we could say we have already achieved AGI before pivoting smartly to economics.

Sam Altman has been running a version of the same play, declaring that the current state of the art meets OpenAI's own definition of AGI, which is highly autonomous systems that outperform humans at most economically valuable work, while separately saying he is not quite there yet and expects an internal system he would call AGI by the end of this year.

After all this fantastic and honestly tiring amount of doublespeak and hype marketing, some average joe reads the headline, opens the app, asks it to do their actual job, watches it fail at something a competent human would not fail at, and concludes they were lied to. They were not lied to exactly, they were sold a shitty definition, but the consumer/user already has a seed of mistrust sown into them regardless.

Huang crediting it to a hundred thousand of his own GPUs is the part I would hang a frame around honestly, like it can _not_ get any funnier.

## Everyone Is Tired

Initially I just thought that people had stopped evaluating claims, that they had picked a blanket position that either it's all a bubble or it's all slop or then we're making a literal god and we should buckle our britches because _OH BOY this is gonna get wild_  ( which just might partially be true and tbh that's how our monkey brains are, if you dont agree read [this](https://www.researchgate.net/publication/333673884_Tribalism_Is_Human_Nature), one of _many_ works on human tribal psychology and how polarization is a natural tendency ), and stopped doing the work of judging anything specific. That is true as a description and completely wrong about the cause, and describing it that way is also fairly contemptuous of people imo but it's still something I wanna get out there.

It is fatigue, and that's all there is to it.

You cannot open anything these days without AI in it istg, whether that is a product announcement, an ad, a LinkedIn post, a news segment, or a tool you already used that has since grown a sparkle icon in the corner. It's fucking everywhere. And it kinda starts to feel like you're eating the same meal every day; so after enough of it the human response stops being analysis and becomes a reflexive flinch/aversion and so when people hear "AI" they try to shut the conversation down before it has started. They're not necessarily being stupid when they do it, they're just sorta protecting themselves from something that has been shoved into every corner of their attention for the better part since 2023.

I have watched this happen with friends who are not in tech, who study business or do other things entirely. What I see there is not _disinterest_, it's a sort of _exhaustion_.

I' also gonna be honest that I do not experience this myself, and the only thing that stops me is being physically tired. (I might just also be autistic but idk) but it _is_ an observation that i've made over and over again with friends and family. Which probably makes me close to the worst person to be lecturing anyone about it, and maybe it is just my friend group.

## Two Kinds of Company

The way I hold this in my head comes roughly from Thiel's "0 -> 1" framing: i.e. there are companies making something that _did not exist_, opening a market that was not there and _pushing_ the actual frontier of human technological development, and there are companies whose entire function is extracting value from something somebody else built.

I do not think extraction is inherently evil, since businesses extract value and that is what they are, and a company making a decent margin reselling something useful is fine. What I object to is extraction being the only incentive in the room, and AI has produced an enormous number of companies whose whole existence is a thin layer over somebody else's model charging a subscription for a prompt, which is where a great deal of the noise comes from, and it is the noise that teaches people to flinch.

There is a worse tier underneath that, made up of companies building things that work perfectly well and should probably not exist, like surveillance tooling with a friendly onboarding flow, or dual use work where the second use is killing people and the first use is what goes in the brochure. Nobody in that category thinks of themselves as the villain and the money is extremely good.

PS: I kinda forgot what point I was gonna make here but this is important context as well, just some food for thought with this distinction of companies.

## The Robots

You want a measure of how badly attention is allocated right now? Look at robotics.

[AMI Labs](https://techcrunch.com/2026/03/09/yann-lecuns-ami-labs-raises-1-03-billion-to-build-world-models/) raised \$1.03 B in a seed round, the largest in European history, with Yann LeCun leaving Meta in November to chair it, and they are building world models on the `JEPA` approach, which is a genuinely different bet from scaling language models and one that physical intelligence probably requires. [Generalist AI](https://techcrunch.com/2026/08/25/robotics-startup-generalist-reaches-3b-valuation-sources-say/) was founded in 2024 by people out of Google DeepMind robotics and Boston Dynamics, and their [GEN-1.5 model](https://generalistai.com/blog/gen-1.5) [learns a new physical task in seconds from a single demonstration](https://youtu.be/1cllCVK-9lo) with no gradient updates and no fine tuning, off the back of \$400M raised in June and reported talks at a $3B valuation in August.

I'd assumed these places were starved next to OpenAI and Anthropic. They're not, the capital is obviously there. What's missing is attention, because a billion dollar seed round and a robot that learns from watching once are both basically absent from the discourse anywhere.

Some of that is just structural. Robotics is hard to follow when it isn't your field, and these companies don't spend much on explaining themselves, partly because the money is better spent on the actual work and partly because nobody chases public attention until they have something to sell. It's also _really_ geographically lopsided in a way I think people underrate: SF runs current while Europe, Asia and India sit months behind on the same information, and nobody involved thinks of themselves as behind. I'm behind too btw. There's just too much of it, and if you genuinely tried to read everything you'd lose your mind, so I keep up by consuming an unhealthy amount of media and still missing most of it.

The bit I actually care about: if physical labour starts going the way cognitive labour has been going, we get the industrial revolution question again with a lot less warning. Do we end up reserving certain work for humans by sanction, like therapy or medicine or the trades? I genuinely don't know if that's a good idea or a deeply stupid one, and I can't argue myself out of it either. What I am fairly sure of is that the social contract and the economics under it were not built for any of this, and nobody is rewriting them at the speed the robots are improving.

It's gonna be scary, it's gonna be wild, and some of it is going to be genuinely fun.

## Half the Internet

And the room you'd be having this conversation in is steadily filling up with things that are not people. [Imperva's 2026 report](https://www.imperva.com/blog/bad-bot-report-2026-bots-agentic-age/) puts automated traffic above 53% of the web, up from 51% the year before, humans down to 47%. Bad bots alone are 40% of everything, seventh year straight that number has climbed, and AI enabled bot attacks are up 12.5x year over year. So dead internet theory is measurably the majority case now, not just a vibe you reach for when your feed feels fake.

The tooling for it got much better too. Jones and Bergen published a study in PNAS where GPT-4.5, prompted to adopt a human persona, [was judged to be the human 73% of the time](https://arxiv.org/abs/2503.23674) in three party Turing tests. Read that again: picked as the human _more often than the actual human_ in the conversation. LLaMA-3.1 managed 56%, and the unprompted ELIZA and GPT-4o baselines came in below chance at 23 and 21.

There's still a smell to AI generated text and AI generated code and I can usually catch it, but I don't expect that to last and I shouldn't be building anything on the assumption that it will. Stack that on the fatigue and it gets genuinely bleak: people are tired of the conversation, and a growing share of the conversation isn't with people anyway.

## Play With It

So what do you actually do? Telling a tired person to think harder is useless, so not that.

Entertain the idea instead. Hold it for a minute without deciding whether you're for it or against it, and just play with it in your head, which is a thing I think a lot of people have quietly stopped doing. Have a stupid idea on purpose. Build a thing nobody asked for, make some ridiculous piece of software to annoy your uni professor, follow the dumb thought about what would happen if X. Not because it's going to become a company, but because thinking is supposed to be one of the genuinely fun parts of being a person and a lot of people seem to have stopped doing it for fun.

I notice this even among people in tech, which surprises me more than the rest of it, where perfectly capable people won't try something because the attempt might not go anywhere. I suspect the polarisation in most media has something to do with it since every topic now arrives pre-sorted into a side you're meant to pick, and I suspect short form video has more to do with it than anyone wants to admit. Guessing on both counts though.

The other half of this is where you put the anger, because there's plenty worth being angry about and it's landing in the wrong place. Be angry at the people driving it: at a definition quietly swapped out so a claim clears a bar it would otherwise fail, at surveillance tooling with a pleasant onboarding flow, at attention getting allocated by marketing budget so a model that learns from one demonstration gets less airtime than a sparkle icon on a note taking app. Stay curious about the tech though. The technology didn't do any of that to you, people did.

## Where I'm At

I'm not writing this for anyone in particular, this is my place and these are my thoughts, and if I'm talking to anybody it's other devs and other people generally. So here's what I'm fairly confident of.

A machine did research grade mathematics while the discourse spent that week on a compute bill. Two of the most powerful people in this industry declared general intelligence using definitions they wrote themselves. More than half of web traffic is no longer human, and a model prompted to seem human now beats actual humans at seeming human. A billion dollar robotics seed round went by almost unremarked. And the people who most need to be part of these decisions are too worn down to want to hear about any of it.

I don't have the fix. Just a small and slightly embarrassing suggestion: go be curious about one specific thing this week instead of holding a position about all of it. Pick something, sit with it for ten minutes, build something stupid with it. That's not a policy but it's about the size of what I've got.

~ A.
