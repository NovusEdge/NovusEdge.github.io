---
title: Text != Tone
date: 2026-11-15
tags: [ai, interfaces, voice, agents, essay]
description: Seven words that mean seven different things depending on which one you lean on. Typing to an AI throws that part away, and that matters a lot more now that AI acts on what we type.
pixel: thinking
---

"I didn't say she stole the money." Try saying that out loud a few times, leaning on a different word each time. It's an example linguists and English teachers love, because it's seven words and it means seven different things depending on which one you stress:

{{stress_list}}

Now type it. It's the same sentence all seven times, and unless I bother with italics (I usually don't, and I'm guessing you don't either) you're left guessing which one I meant. And that's how we talk to pretty much every AI assistant right now, through a little box that keeps the words and throws everything else away.

{{typed_line}}

## So... what'd get lost?

The stress is one thing. Tone is the bigger one. There's a great story about the philosopher J. L. Austin giving a lecture where he said that in English a double negative can make a positive, but no language uses a double positive to make a negative. Sidney Morgenbesser, sitting in the audience, went "Yeah, *yeah*." Written down, that's two people agreeing. Out loud, he'd just disproved the whole point in two words.

And we're worse at noticing this than we think. In a [2005 study](https://pubmed.ncbi.nlm.nih.gov/16393025/) on email, people reading sarcastic or serious lines picked the right one about as often as chance, while people who *heard* the same lines got nearly three-quarters right. That's a coin flip, and the people sending had no idea: in another experiment from the same paper, senders expected their tone to land about [89%](#stat) of the time over email, and it landed about [63%](#stat).

The internet did come up with workarounds: /s, "lol" on the end of a sentence so it doesn't read as mean, all caps for yelling. Models have read the whole internet, so they get those just fine. The problem is that you only add them when you already suspect you'll be misread, and that study says we're bad at knowing when that is. Nobody types "ok fine /tired".

Then there's interrupting. Talking to someone, you say "mhm" so they keep going, or "no wait, not that" the second they start heading the wrong way. In a chat you write a whole message, wait for a whole reply, and only find out it misunderstood you once it's done. If you've ever watched an AI confidently write 600 words about the wrong thing, you know the feeling.

{{forty_sheets}}

## What if it's NOT English?

English uses pitch mostly for attitude, which is exactly why writing it down loses so much. Other languages draw that line in different places, and honestly it's kind of fascinating.

In Mandarin, pitch is part of the word itself. *mā* said flat is 妈, mother. *má*, rising, is 麻, hemp. *mǎ*, dipping, is 马, horse. *mà*, falling, is 骂, to scold. Same syllable, four different words, and the only difference is the shape of your voice. The writing keeps it though, because each one gets its own character. The linguist Yuen Ren Chao took this to the extreme with a poem, "Lion-Eating Poet in the Stone Den", where every single syllable is some version of *shi*. It opens with 石室诗士施氏，嗜狮，誓食十狮 (*Shíshì shīshì Shī Shì, shì shī, shì shí shí shī*): a poet called Shi, in a stone den, who loved lions and swore to eat ten of them. Read in characters it makes sense. Read out loud it's *shi shi shi shi* for a whole paragraph and nobody can follow it.

{{tones}}

Arabic goes the other way. Short vowels usually aren't written at all, so كتب is just the consonants k-t-b. With the vowel marks put back it could be كَتَبَ (*kataba*, he wrote), كُتِبَ (*kutiba*, it was written) or كُتُب (*kutub*, books), and fluent readers fill in the right one from context without even thinking about it.

{{harakat}}

Spoken languages also pack information at different densities. A [2019 study in Science Advances](https://www.science.org/doi/10.1126/sciadv.aaw2594) compared 17 languages and found that fast ones like Spanish and Japanese pack less into each syllable and slower ones like Vietnamese pack more, and they all end up carrying about [39 bits a second](#stat).

So every writing system makes a call about what to keep and what to leave for the reader. Chinese keeps the tones in the characters. Arabic leaves out the vowels and trusts you with context. English keeps every letter and throws away stress and tone completely, and leaves you to guess.

## Typing is just kinda slow

The biggest typing study I could find [looked at 136 million keystrokes](https://userinterfaces.aalto.fi/136Mkeystrokes/) and the average was [52 words a minute](#stat), about [1 token a second](#stat), and that's from people who *volunteered* for a typing test. Speaking is around [150 words a minute](#stat), a bit over [3 tokens a second](#stat). The model on the other end writes back at [50 to 200 tokens a second](#stat). So the slowest part of the whole loop is your fingers.

{{rate_cards}}

People who type fast are fine. Most people don't type fast though, and a lot of people can't type comfortably at all: kids, older people, anyone with a motor impairment, anyone who's more at home speaking a language than spelling it. Everyone learns to talk years before they learn to write. If we actually want AI to be usable by more than the people who already live at a keyboard, speech is the obvious way in.

## Can't we just use voice then?

The annoying bit is that a lot of voice modes still throw the tone away. They transcribe what you say into text, send the text to the model, and read the reply back out loud. The stress is gone at step one, and you're back to the little box with extra steps.

Models that take audio directly should do better, right? A [2025 paper called StressTest](https://arxiv.org/abs/2505.22765) checked exactly that with sentences like the one up top, and most speech models barely did better than guessing which meaning was intended. gpt-4o-audio got [59%](#stat). The best one, Gemini 2.5 Pro, got [78%](#stat). People got [93%](#stat). So even when the model can literally hear you, it often can't tell which word you leaned on.

## Why tho?

For a while none of this was a big deal. A chatbot misread you, you got a bad answer, you rolled your eyes and asked again.

That's not how it works anymore. Assistants edit code, open pull requests, send emails, and run for hours on their own. I build some of these myself, [flocc](/portfolio/flocc/) picks up an issue and works on it without me in the loop. When something like that misreads you, you don't get a bad paragraph, a file changes or an email goes out.

Say an agent asks whether it should go ahead with a big refactor and you type "ok fine". If you meant *yes*, great. If you meant "I'm too tired to argue about this", you probably wanted it to stop, and there's nothing in those two words that tells it so.

I'm not saying text should go away. You can edit before you send, you can take your time, you can use it in a library. And sometimes you don't *want* a machine picking up on how you feel, which is fair.

But if we're going to let these things act for us, they need more than the words. They need to hear *how* you said yes and not just that you said it, they need to let you cut them off early, and when they genuinely can't tell which of the seven you meant, they should do what a person would do and ask.
