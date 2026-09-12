---
title: What Did We All Miss?
date: 2026-09-12
tags: [ai, epistemics, robotics, industry, essay]
description: The joke about OpenAI spending more compute than the prize was worth went around for a week, and underneath it ten thousand agents had just done original mathematics that almost nobody was in a state to notice.
draft: false
toc: true
---

## The Joke About the Million Dollars

When OpenAI announced they had resolved the Navier-Stokes Millennium Prize problem, the thing that actually went around was the joke, something like twenty two million dollars of compute spent chasing a one million dollar prize, which is genuinely funny and I laughed at it too. Then the conversation moved on, and I kept turning over what the joke had quietly let everybody skip.

Around ten thousand coordinating agents produced a proof and a Lean formalisation of that proof, so the result is machine-checked rather than asserted in a press release, which means original mathematics at the hardest tier we have was done by a machine and verified by a machine in a field where a single human result can take a decade. OpenAI then declined the prize money and framed the whole thing as a status report on the pace of progress, which is probably the most telling part of it.

I want to be careful here because I nearly got this wrong myself. My first instinct was to say that this unlocks fluid dynamics, and that fluid dynamics unlocks propulsion and modelling and a dozen industries downstream in widening ripples, which is the version I would have written a week ago and it would have been wrong. The proof found a finite-time singularity, which is a negative answer, and what it tells you is that smooth solutions can break down. That matters enormously for numerical methods and for how we model turbulence, and it hands nobody a better rocket.

So the significance sits somewhere other than the applications, and it is simply that a machine did the mathematics, which is the whole thing, and the joke about the compute bill sailed straight past it.

## What a Definition Buys You

Part of why nobody noticed is that the same week was full of people saying much louder things that meant considerably less.

On the 6th of September, Jensen Huang [declared that AGI has arrived](https://www.forbes.com/sites/timbajarin/2026/09/08/jensen-huangs-agi-claim-is-a-business-case-not-settled-fact/) and credited GPT-6 Astra trained on more than a hundred thousand Nvidia Grace Blackwell GPUs, and two days after that the Navier-Stokes result landed without anybody framing one against the other. He had form, since back in March he told Lex Fridman ["I think we've achieved AGI"](https://www.forbes.com/sites/antoniopequenoiv/2026/03/23/nvidias-jensen-huang-says-he-thinks-weve-achieved-agi/) while answering a question about how soon AI could build and run a billion dollar company, though on the August earnings call he was noticeably more careful, saying that for many tasks we could say we have already achieved AGI before pivoting smartly to economics.

Sam Altman has been running a version of the same play, declaring that the current state of the art meets OpenAI's own definition of AGI, which is highly autonomous systems that outperform humans at most economically valuable work, while separately saying he is not quite there yet and expects an internal system he would call AGI by the end of this year.

Notice what both of those rest on, which is a definition the speaker supplied. Huang's is commercial and amounts to AI counting as general once it can help build a billion dollar business, and Altman's is his own company's economic wording, so neither is a claim about general intelligence in the sense a normal person hears the phrase, and both are technically defensible on their own terms.

Then somebody reads the headline, opens the app, asks it to do their actual job, watches it fail at something a competent human would not fail at, and concludes they were lied to. They were not lied to exactly, they were sold a definition, but the effect on trust is identical and the damage compounds, because the next real result gets read as more of the same.

Huang crediting it to a hundred thousand of his own GPUs is the part I would hang a frame around, since you do not need to speculate about anyone's motive when the sentence arrives with its own invoice attached.

## Everybody Is Just Tired

Here is where I started out wrong about people, so I will show my working.

My first read was that people had stopped evaluating claims, that they had picked a blanket position, either that it is all a bubble or it is all slop, and stopped doing the work of judging anything specific. That is true as a description and completely wrong about the cause, and describing it that way is also fairly contemptuous of people who have not earned it.

It is fatigue, and that is all it is.

You cannot open anything now without AI in it, whether that is a product announcement, an ad, a LinkedIn post, a news segment, or a tool you already used that has since grown a sparkle icon in the corner, and it is the same meal every single day, so after enough of it the human response stops being analysis and becomes a flinch. People hear the word and shut the conversation down before it has started, and they are not being stupid when they do it, they are protecting themselves from something that has been shoved into every corner of their attention for three years running.

I have watched this happen with friends who are not in tech, who study business or do other things entirely, and for whom the technology itself is genuinely hard to get a handle on. What I see there is not disinterest, it is exhaustion arriving before the conversation does.

I should be honest that I do not experience this myself, because somebody asked me where I shut down and I could not name anything, and the only thing that stops me is being physically tired. So I am describing something I watch rather than something I share, which makes me close to the worst person to be lecturing anyone about it, and maybe it is just my friend group. I keep saying that and I keep meaning it.

What makes the fatigue worse is that some of the noise is real, since actual progress arrives through the same pipe as the slop, wearing the same clothes and using the same words, and if you have trained yourself to flinch at the word then you flinch at all of it.

## The Two Kinds of Company

The way I hold this in my head comes roughly from Thiel's zero to one framing, and I will grant in advance that the split is crude. There are companies making something that did not exist, opening a market that was not there and pushing the actual frontier, and there are companies whose entire function is extracting value from something somebody else built.

I do not think extraction is evil, since businesses extract value and that is what they are, and a company making a decent margin reselling something useful is fine. What I object to is extraction being the only incentive in the room, and AI has produced an enormous number of companies whose whole existence is a thin layer over somebody else's model charging a subscription for a prompt, which is where a great deal of the noise comes from, and it is the noise that teaches people to flinch.

There is a worse tier underneath that, made up of companies building things that work perfectly well and should probably not exist, like surveillance tooling with a friendly onboarding flow, or dual use work where the second use is killing people and the first use is what goes in the brochure. Nobody in that category thinks of themselves as the villain and the money is extremely good.

## The Robots Nobody Is Watching

If you want a measure of how badly attention is currently allocated, look at robotics.

[AMI Labs](https://techcrunch.com/2026/03/09/yann-lecuns-ami-labs-raises-1-03-billion-to-build-world-models/) raised one point zero three billion dollars in a seed round, the largest in European history, with Yann LeCun leaving Meta in November to chair it, and they are building world models on the JEPA approach, which is a genuinely different bet from scaling language models and one that physical intelligence probably requires. [Generalist](https://techcrunch.com/2026/08/25/robotics-startup-generalist-reaches-3b-valuation-sources-say/) was founded in 2024 by people out of Google DeepMind robotics and Boston Dynamics, and their GEN-1.5 model learns a new physical task in seconds from a single demonstration with no gradient updates and no fine tuning, off the back of four hundred million raised in June and reported talks at a three billion valuation in August.

I had assumed these places were starved next to OpenAI and Anthropic, and they are not, because the capital is obviously there. What is missing is attention, since a billion dollar seed round and a robot that learns from watching once are both absent from common discourse anywhere.

Some of that is structural, in that robotics research is hard to follow when it is not your field, and robotics startups tend not to spend on explaining themselves, partly because the money is better spent on the work and partly because most founders do not treat public attention as urgent until they have something to sell. The discourse is also geographically lopsided in a way people underrate, with the San Francisco scene running current while Europe, Asia and India sit months behind on the same information, and nobody involved thinks of themselves as behind. I am behind too, for what it is worth, because there is simply too much, and if you genuinely tried to read everything you would lose your mind, so I keep up only by consuming an unhealthy amount of media and still missing most of it.

The implication is the part I actually care about, because if physical labour starts going the way cognitive labour has been going then we get the industrial revolution question again with rather less warning. Do we end up reserving certain work for humans by sanction, like therapy or medicine or the trades? I genuinely do not know whether that is a good idea or a deeply stupid one, and I notice I cannot argue myself out of it either, but what I am fairly sure of is that the social contract and the economics underneath it were not built for any of this, and nobody is rewriting them at the speed the robots are improving.

It is going to be scary, it is going to be wild, and some of it is going to be genuinely fun.

## More Than Half the Internet

The other thing making all of this harder is that the room you would have the conversation in is steadily filling up with things that are not people.

[Imperva's 2026 report](https://www.imperva.com/blog/bad-bot-report-2026-bots-agentic-age/) puts automated traffic above fifty three percent of the web, up from fifty one the year before, with human activity down to forty seven percent, bad bots alone accounting for forty percent of everything in the seventh consecutive year that number has climbed, and AI enabled bot attacks rising twelve and a half times year over year. So dead internet theory is not a mood I reach for when my feed feels fake, it is the majority case and it is measured.

The tools for it also got much better, since Jones and Bergen published a study in PNAS where GPT-4.5, prompted to adopt a human persona, [was judged to be the human seventy three percent of the time](https://arxiv.org/abs/2503.23674) in three party Turing tests, which is to say picked as the human more often than the actual human in the conversation, while LLaMA-3.1 managed fifty six percent and the unprompted baselines of ELIZA and GPT-4o came in below chance at twenty three and twenty one.

There is still a smell to AI generated text and to AI generated code, and I can usually catch it, but I do not expect that to last and I do not think I should be building anything on the assumption that it will. Stack that on top of the fatigue and you get something genuinely bleak, where people are tired of the conversation and an increasing share of the conversation is not with people anyway.

## Play With It

So what do you actually do instead of shutting down, given that telling a tired person to think harder is useless.

Entertain the idea, hold it for a minute without deciding whether you are for it or against it, and play with it in your head, which is a thing I think a lot of people have quietly stopped doing. Have a stupid idea on purpose, build a thing nobody asked for, make some ridiculous piece of software to annoy your university professor, follow the dumb thought about what would happen if X, and do it not because it is going to become a company but because thinking is supposed to be one of the genuinely fun parts of being a person and a lot of people seem to have stopped doing it for enjoyment.

I notice this even among people in tech, which surprises me more than the rest of it, where perfectly capable people will not try something because the attempt might not go anywhere. I suspect the polarisation in most media has something to do with it, since every topic now arrives pre-sorted into a side you are meant to pick, and I suspect short form video has more to do with it than anyone wants to admit, though I am guessing on both counts.

The other half of the prescription is about where to put the anger, because there is plenty worth being angry about and it is currently landing in the wrong place. Be angry at the people driving this, at a definition quietly swapped out so a claim clears a bar it would otherwise fail, at surveillance tooling with a pleasant onboarding flow, and at attention being allocated by marketing budget so that a model which learns from one demonstration gets less airtime than a sparkle icon on a note taking app. Stay curious about the technology though, because the technology did not do any of that to you and people did.

## Where This Leaves Me

I am not writing this for anyone in particular, since this is my place and these are my thoughts, and if I am talking to anybody it is other developers and other people generally.

What I am fairly confident of is that a machine did research grade mathematics while the discourse spent that week on a compute bill, that two of the most powerful people in this industry declared general intelligence using definitions they wrote themselves, that more than half of web traffic is no longer human, that a model prompted to seem human now beats actual humans at seeming human, that a billion dollar robotics seed round went by almost unremarked, and that the people who most need to be part of these decisions are too worn down to want to hear about any of it.

I do not have the fix, only a small and slightly embarrassing suggestion, which is to go and be curious about one specific thing this week instead of holding a position about all of it. Pick something, sit with it for ten minutes, and build something stupid with it.

That is not a policy, but it is about the size of what I have got.

~ A.
