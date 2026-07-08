---
title: "Hardware Journeys: Starting From Absolute Zero"
date: 2026-07-02
tags: [hardware-journeys, hardware]
description: Kicking off a new series. A software person learning hardware from nothing, in public, badly. Why physics is a better teacher than any framework, and the one project I'm not ready to talk about yet.
---

New series, hi. If you remember the old *Linux Journeys* posts (ricing, bootsplashes, tiling window managers), this is that same energy pointed at a thing I am genuinely, embarrassingly bad at: hardware.

Not "bad" like modest-brag bad. Bad like I have made the magic smoke come out. Bad like I have spent forty minutes debugging a circuit that was not plugged in. That kind of bad. And I've decided to do it *in public*, on purpose, because the alternative is doing it in private and pretending later that I always knew what a pull-up resistor was for.

## Why hardware, why now

Because software started to feel a little too... comfortable? And a little too crowded. Everything is an AI wrapper of an AI wrapper right now, and I spend my whole day in that world already (agent memory, the whole Engrammic thing, more on that elsewhere). I wanted a corner where the thing either works or it doesn't and no amount of vibing gets you past it.

Hardware is that corner. Physics does not do `try/except`. There's no `console.log` that saves you from a bad ground. You can't `npm install` your way out of not understanding what current actually is. The universe just quietly refuses to cooperate and it will not tell you why, and I find that weirdly *honest*. It's the most patient, least flattering teacher I've had since I stopped being a first-year who thought he could take 3rd-year courses (I did that, it went about as well as you'd think).

## The stuff that is obvious to everyone except me

An incomplete list of things that have humbled me so far:

- Voltage and current are not the same thing and treating them like they are will cost you a component and your dignity.
- "It should work" is not a thing hardware respects. It works or it doesn't, and it doesn't care about your mental model.
- The datasheet had the answer the whole time. The datasheet always had the answer. Read the datasheet.
- A loose wire looks *exactly* like a profound conceptual failure until you jiggle it.

Every one of these is obvious to anyone with an actual EE background. That's kind of the point of writing them down. Somebody starting where I started might feel a little less alone knowing that yes, a person who builds AI systems for a living also spent a full evening defeated by a breadboard.

## Where this is going

I have a direction. Some of it I'll be loud about: I care a *lot* about privacy and anti-surveillance, and there's a hardware-shaped version of that itch I've been circling. If you've seen **ØCLOAK** floating around my site, that's the neighborhood. Building things that put a little bit of power back on the side of the person, not the people watching them.

And then there's another one. A project that lives at the intersection of hardware and the brain-shaped stuff I think about all day, and I'm not going to talk about it yet. Not being coy for the aesthetic (ok, a little for the aesthetic), it's just genuinely early and half-formed and I'd rather show you a thing that works than describe a thing that might. You'll know when it's ready. It'll be obvious.

This series is a *log*, not a tutorial. I am not qualified to teach you hardware. I am qualified to fail at hardware in an entertaining and educational-by-accident way and write it down. Expect wrong turns. Expect me to confidently state something in one post and quietly correct it three posts later. That's the deal. That's the whole point.

If you're also starting from zero on something scary, come do it badly alongside me. Misery loves a breadboard.

More soon, probably after I replace the component I killed.

~ A.
