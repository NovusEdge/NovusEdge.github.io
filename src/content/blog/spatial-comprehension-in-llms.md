---
title: Spatial Comprehension in LLMs
date: 2026-11-25
tags: [ai, llms, game-dev, spatial-reasoning, architecture]
draft: true
toc: true
description: Getting language models to place things in 3D scenes more reliably and for less, by keeping the geometry out of the model.
pixel: thinking
---

This year I spent a good while thinking about different modalities, and about how lossy language is as a way of describing things. That led me down a couple of rabbit holes, and one of them was spatial comprehension in LLMs. One of the easiest ways to work on this and test stuff out is by having LLMs make games :)

Let's take an example, let's say you ask claude or codex or clawhatever for a nice house on a hill. It could (a) just use a pre-existing asset, or (b) build a house asset on its own, which in and of itself is a big fucking pain in the ass to figure out. The model needs to figure out where to place the walls, how far apart, what dimensions, how big the hill is, where the roof sits, if there's a tilt to the house, where the windows would sit on the walls, and so so much more. Models are good at the first part of that, working out what you want. They're surprisingly bad (either inaccurate or _very_ inefficient if not both) at the latter.

Now for like a basic test I fired up godot, gave opus 5.5 basic access to the engine to make spatial edits on the scene and let it build me a simple house. Turns out it was a fucking mess; the roof was lopsided and the walls didn't meet at their edges and one of the window assets was outside the fucking wall lol. GPT Astra was better, but then again the engineer in me wasn't quite satisfied at just calling it a limitation of some models and calling it a day, nah fuck that.

If you've spent the last year watching models write working code, this is a bit confusing. Like how tf can a model that can build a _very_ nice react app in the right hands not get object placement in a scene? I mean aren't both of those tasks relatively the same kinda? It's easy to assume a better prompt or a better model would fix it. A better model would fix some of it, but not most.

Turns out that there's a _lot_ of components that went into harnesses and model tools that made it possible for LLMs to actually get better at web design.

## Placing objects in 3D scenes

**[FIGURE valid-broken: the broken house (a recreation) next to the scene file lines for its roof, which load without a single error]**

Code is text, and the loop around it catches mistakes. If the model writes something broken, the build fails, a test goes red or the page doesn't render, and the model gets another go with the error in front of it. A lot of what makes coding agents work is that loop.

Placement doesn't have a loop like that. A lopsided roof is still a valid transform, so nothing throws or goes red, the scene file looks exactly like one where the roof is in the right place, and you only find out when someone opens the editor and looks.

**[FIGURE two-loops: the two loops side by side: code (write, build, test, error, fix) and placement (write, nothing, someone opens the editor)]**

The model getting no signal is only part of it though. When I went through the failures they fell into three groups, and each one needs a different fix.

## Problems

### What gets left out

Most setups hand the model the scene as a list of objects, each with a position, a rotation and a scale, and that's kinda it. A scene has _way_ more going on though: there's meshes, colliders, trigger volumes, physics settings, materials, scripts that decide what happens when two things touch, sometimes sound. And a lot of it only means something relative to other stuff: the roof sits _on_ the walls, the plate opens _that_ door.

It's also spread all over the place. In Godot a crate is a node in the scene file with a transform, its mesh is a child node, its collision shape is another child node with its own shape and its own offset, and whatever makes it actually do anything lives in a script somewhere else. So every bit of it gets described separately, in a different context, and text is a pretty bad way to describe most of it anyway. The parts the physics depends on are usually the parts that get left out, and a smarter model can't use stuff that was never in the prompt.

**[FIGURE object-facts: where one object's facts live: transform in the scene file, collider in a component, behaviour in a script]**

Say you've got a puzzle with a crate and a pressure plate, and the door opens while the crate is on the plate. In a screenshot the crate is sitting right on the plate and everything looks fine. But the plate's trigger volume, the invisible box that actually detects the crate, is offset from the plate's visible mesh, so as far as the engine is concerned nothing is touching anything and the door stays shut. The mesh, the collider and the trigger are three different shapes, and a description of the scene usually mentions one of them if you're lucky.

**[FIGURE plate-layers: the crate on the plate, with the mesh, collider and trigger as layers you can toggle]**

Unity also doesn't fire an exit event when a collider gets destroyed or deactivated while it's inside a trigger ("Deactivating or destroying a Collider while it is inside a trigger volume will not register an on exit event", straight from [the docs](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Collider.OnTriggerExit.html)). So if the crate gets destroyed while it's on the plate, a plate written the obvious way just stays pressed forever, and nothing about the layout tells you that because it's down to how the script was written.

Two plates controlling one door is another fun one: does the door need both, or either? Two "controls" links in a scene graph look identical either way. Or the door stays open for five seconds after the last time something stepped on the plate, so two playthroughs with the exact same objects in the exact same places can have the door in different states, and you'd only know why by reading the script and checking the timer.

Screenshots don't help much either. If the door's shut in an image, the image can't tell you whether the rule failed, whether the crate isn't the kind of thing the plate counts, or whether the door is just still moving. Each of those lives in a different record (the render, a physics sample, the behaviour trace, sometimes even the audio of the door motor), so to properly describe even one moment of a game you kinda need all of them lined up in time.

### Setting up the math

Arithmetic itself is trivial for these models, you just give them a Python runtime and they'll add floats as well as anything else does. Being able to do arithmetic doesn't mean the model understands the numbers though, or what they say about a particular object: how big it is, where its edges are, which side is its top. The hard part is knowing which numbers go into the sum in the first place.

To put a roof on four walls you need the wall positions and heights, which face of a wall counts as its top, the roof's own size, where its pivot is, maybe a rotation, and which way is up in this engine. Which way is up isn't even the same between engines: Godot and Unity are $+y$ up, Unreal is $+z$ up and works in centimetres, and Godot calls $-z$ forward while Unity calls $+z$ forward. Godot's primitive meshes are centred on their origin too, so a box you want sitting on the ground needs lifting by half its height, and a roof dropped at wall height sinks halfway into the walls.

Python will add all of that up exactly, but if the model assumes the pivot is in the centre when it's actually at a corner, the roof ends up off by the same amount every single time and the math is still technically correct.

**[FIGURE pivot-sum: the same sum with the pivot assumed in the centre and actually at a corner]**

Structured data doesn't fix that on its own. [FloorplanQA](https://arxiv.org/abs/2507.07644) gave 15 models indoor floor plans as JSON, text in and text out with no tools. Distances and angles were fine on simple layouts but dropped to 35–60% on real ones, and the tasks that need planning, like finding free space or a shortest path, landed somewhere between 5 and 45%. When they gave GPT-4.1 a Python interpreter, distances went from 56% to 99%, but the shortest-path and box-fitting tasks actually got worse. And most of the numbers a placement depends on aren't in the scene description anyway, which is the same problem as before.

### People are vague

The third group comes from the person asking. Nobody tells a level editor to move a chair 0.35 units along $+x$ lol. They say "a bit to the right", or "next to the window", or "further from the wall".

There's a lot missing from that. It doesn't say whose right it is (the camera's, the chair's own, or the world's), though in an editor people almost always mean right on their screen. "A bit" isn't a distance either, for a mug and for a building those are wildly different, so it has to scale with something, like the object's size or the gap to its neighbour. And there's often a target in there too, "a bit to the right" actually means "until it lines up with the window", with the window left unsaid.

**[FIGURE frames: "a bit to the right" drawn in the camera's, the chair's and the world's frame]**

Working that out is the model's job, and it's the kind of job models are good at because it's about language and context, but turning "line it up with the window" into an actual coordinate is the bit they're bad at.

## Design approaches

In all three of those the model ends up guessing at geometry, whether it's the parts of the scene nobody gave it, which numbers go into the sum, or how much "a bit" is. So the design I went with just keeps the model out of the geometry entirely. The rule in my notes was "generate by constraint, describe by relation, verify by invariant", and most of the system falls out of that. Maybe we over-engineered it a bit (you've got a Python runtime right there after all), but for results you can actually rely on it was pretty important.

**[FIGURE pipeline: the pipeline: voxel map, relations, model, abstract actions, solver, checks, and the loop back]**

The voxel map, the relations and the abstract actions definitely got built, and the scaling ideas further down didn't. I can't quite recall which of the rest made it in, so treat everything else in this chapter as the design.

### What the model sees

Underneath everything there's a voxel map of the scene, built from the colliders and meshes. The model never actually sees it, it's there so code can answer spatial questions exactly (what touches what, what's holding what up, what's inside what, does this thing fit here) without a model guessing at any of it.

From that map, whatever object the model is working on gets described in relations instead of coordinates, so the roof is `on` the walls, the chair is `near` the window and `facing` the table, and the door is somewhere behind the chair about two metres away. Directions and distances get bucketed into words a person would actually use, and they're measured from the object's own point of view, which is what lets "the door is behind me" make sense to the model.

For one chair, what the model reads looks something like this:

```text
chair_03   living_room/W-wall, by window_01
  on       floor
  facing   table_01
  near     window_01 (close), sofa_01 (medium)
  around   ahead: table_01 1-2m · left: window_01 <1m · behind: door_02 2-3m
```

The first line is the chair's address in the level and the rest is its neighbourhood, with every direction measured from the way the chair faces.

The model also got the camera's pose, since "a bit to the right" usually means right on your screen, so it could read a direction from the object's point of view or from the camera's depending on what the request meant.

Computing all that gets expensive on big scenes though. A relation is a fact about two objects, so for $n$ objects there are

$$
\binom{n}{2} = \frac{n(n-1)}{2}
$$

possible pairs, which is about 5,000 for a 100-object scene and about 500,000 for a 1,000-object one, and a large level with a lot going on needs them recomputed whenever something changes. Doing that efficiently is the part I didn't get to build, but these are the ideas I'd start from:

- One sparse voxel octree for the whole scene instead of a grid per object, so nothing is stored twice and a change re-voxelizes only the cells it touched.
- Relations only to an object's $k$ nearest neighbours and to whatever holds it up or contains it, never every pair, so the count grows like $n \cdot k$ instead of $n^2$, with a filter so only the ones that matter reach the prompt.
- Precision that falls off with distance, a bit like render distance in a game. The object being edited gets its full set of relations, its neighbours get a list and the important relations, a room further out gets a cached summary that's recomputed only when something in it changes, and beyond that it's just an address like `kitchen/NE-corner`.

**[FIGURE lod-rings: render-distance rings around the object being edited: full relations, neighbour list, room summary, address]**

The whole thing comes out at roughly 200 tokens per object, where the raw transforms of a 100-object scene run to thousands, and every relation in it is something code can check.

**[FIGURE relation-view: the same scene as raw transforms, next to the relation view the model reads]**

### What the model does

The model doesn't output coordinates either, it gets a set of abstract actions as tools (things like `attach(roof, walls.top)`, `place_on(lamp, desk)` or `align(chair, window.center)`) and a solver turns those into exact positions.

For the roof that works because prefabs carry sockets, which are attachment points with a position, an orientation and a tag saying what can attach there (a wall's top edge accepts a roof edge, say). When the model says `attach(roof, walls.top)` the solver snaps the roof onto those sockets, and as long as the sockets are right a misaligned roof just can't happen. That's pretty much how level designers work already, they use grid snapping, align tools and modular kits with snap points way more than they type in coordinates, so this is giving the model the same tools they use.

Sizes work the same way. One of the failures I saw early on was terrain that was the wrong size for the stuff that was meant to go on it, so instead of the model guessing a size, the container gets sized from what has to fit in it, something like `fit_contents(hill, house + spacing)`, and the solver does the numbers.

**[FIGURE sockets: a wall's top socket and the roof's edge socket snapping together]**

How high-level the actions are matters a lot too. `set_position(x, y, z)` is too low, it puts the model straight back into working out coordinates. `build_house()` is too high, at that point you've written a procedural generator and the model just picks which one to call. `attach(roof, walls.top)` sits in between: the model still decides which roof goes on which walls, and code does the math.

**[FIGURE action-ladder: the action ladder: set_position too low, attach in the middle, build_house too high]**

Every change the model could make went through one of these actions, and each kind of change comes with its own problems. Editing moves things that are already there, but deleting has to cascade (take out a wall and something has to decide what happens to the roof on it and the door in it). In the design `attach(roof, walls.top)` gets stored as a constraint, so deleting the wall shows up at the checks as a broken reference instead of a roof floating in mid-air.

Adding stuff is harder when the scene has moving parts, because the new object changes what they do, and it's a pretty complicated problem that I don't think has a definitive solution yet. What we could do was track the state of everything, hand it to the model and see what it did with it.

It's more manageable than it sounds though, because a level is mostly at rest while you're editing it. Plenty of it moves once the game runs, but most moving parts have a starting position, so for the model the scene is kinda semi-deterministic and most of the work was in describing it well. Predicting what happens once things actually move is a different problem, which I'll get to at the end.

Vague instructions mostly get handled by the relations. When someone says "a bit to the right", the model already has the chair's neighbours with directions and distances, so it's got a frame, a scale and a list of things the chair might be meant to line up with, and it just picks a relation and lets the solver work out the distance. So "move the chair a bit to the right" with a window on that side comes out as `align(chair, window_01.center)` instead of a made-up 0.35.

The same predicates show up three times too: the model reads `on(roof, walls)`, asks for `place_on(roof, walls)`, and afterwards a check confirms `supported(roof)`, so it's reasoning in the same vocabulary the checks use. Those checks only run on the cells near a change, following what supports what, so moving a roof doesn't re-check the whole level.

A new predicate only gets added if there's a deterministic function that computes it with a stated tolerance. Something like "cluttered" can't be computed exactly, so it stays a learned score until someone pins it down (object density per cell, say), and that way everything the solver and the checks rely on stays exact.

### Pointing at things

No model gets every placement right, so a lot comes down to how easily a person can correct it, and in games that's pretty hard to do in a chat box. "Can you move that platform" leaves the model to figure out which platform "that" is, and in a level full of platforms the words alone don't tell it which one.

So we took inspiration from [Agentation](https://agentation.dev), which lets you click an element on a web page and hand it to a coding agent as a precise reference instead of a description. In the editor you can click an object, an area or just a point in the scene, and the model gets that as a reference. "Move that up a bit" then has a definite "that", and the relations around it give "a bit" a scale. Each click passed the model the object's id, the exact point in the world that was clicked (so areas and empty spots work too), the relations around it, and a screenshot of the view at that moment.

**[FIGURE click-reference: click an object in the scene and watch the reference the model receives]**

Clicking still means stopping what you're doing to give feedback though, so the idea I'd take further is letting people give feedback while they play. You walk through the level and talk: "this jump's too far", "put a crate here", "move that one back a bit". The transcript has a timestamp on every word, and the engine knows what was on screen and what you were looking at in each moment. So every "this", "that" and "here" can be matched to the object or point it meant, and passed to the model as a reference along with a screenshot of the moment.

Pairing voice with pointing isn't new, Richard Bolt's [Put-that-there](https://www.media.mit.edu/publications/put-that-there-voice-and-gesture-at-the-graphics-interface/) did it on a wall display back in 1980, but it only understood a small fixed vocabulary, whereas now the thing on the other end can actually work out what "a bit further" means.

### Specialist models

Some questions just don't have an exact answer, like does this look like a kitchen, or is this arrangement kinda weird, and for those specialist models were exposed as tools too. There was a layout proposer that suggested arrangements, a visual critic that looked at renders and scored them, and a style scorer for things like clutter and whether everything looks like it belongs together. They propose and score, the solver does the placing, and the checks decide whether a placement stays.

## Early results

Placement reliability went from about 40% to 89%, and that changes the cost too. If each attempt succeeds with probability $p$ and retries are independent, an accepted placement takes $1/p$ attempts on average:

$$
\frac{1}{0.40} = 2.5 \qquad \frac{1}{0.89} \approx 1.12 \qquad 1 - \frac{1.12}{2.5} \approx 55\%\ \text{fewer attempts}
$$

What actually matters is the cost per accepted placement, not per attempt. Edit costs did drop a lot back then, though I don't remember by how much, so I ran it again for this post with real numbers below.

**[FIGURE attempts: attempts per accepted placement, 2.5 against 1.1]**

### Running it again

The 40% to 89% is from back then, so for this post I rebuilt a small version of the abstract actions and ran some tests on Godot myself. Same model (Opus 5.5 on xhigh), same prompt, a fresh session every time, and the only thing that changed was the interface: a generic Godot MCP that edits nodes directly, or the abstract actions.

There were four tests: the house from the intro, a living room with three vague follow-ups ("move the lamp a bit to the right", "put the armchair by the window", "move the coffee table a bit closer to the sofa"), the crate-and-plate puzzle from chapter 2, and a platformer with a staircase and at least four jumps up to a goal. A checker in Godot scored every scene (overlaps, floating stuff, whether the sofa faces the TV, whether the door actually opens when the crate gets pushed onto the plate, whether every jump is makeable with the player's real controller), and none of it was a model.

**[FIGURE runs: same model, same prompt, two interfaces: a carousel of the four tests, generic MCP and abstract actions side by side, with each run's time, output tokens, cost and checker result]**

The abstract runs were 3.6 to 6.4 times faster, used 3.9 to 6.6 times fewer output tokens, and cost $0.59 to $0.99 a run against $1.84 to $2.84. On correctness the two were closer. Opus got the house right with the generic MCP this time, but mostly by not using it: the MCP's `add_node` quietly drops vector properties, so the generic house and platformer runs read its source, figured that out and wrote the scene file by hand (the platformer run made 3 MCP calls and 41 regular ones).

Each interface failed one test. The generic run on the plate puzzle left the trigger covering 18% of the plate's mesh, in both of its runs, which is exactly the mismatch from chapter 2, and the puzzle still worked because the crate still reached the trigger, so nothing in play would have told you. The abstract run on the platformer passed every jump check the tools had and still let the player skip platforms (two jumps where the prompt asked for four), because the tools only check one jump at a time and nobody had written down a rule about the whole route. That level is also pretty much the definition of slop, which I get into in chapter 5.

It's one run per interface per test though, so it's a demo and not a benchmark, and the abstract tools were built with these tests in mind (a purpose-built abstraction against a general editor, which is kinda the argument anyway). Neither side could run its own Godot test scripts during a run either, because of how I'd locked down permissions, so they were equally blind there.

## Mechanics, UI and vibes

Placement was one part of it. The other was getting models to design mechanics that feel good, which is a different problem, because a mechanic can work and still feel bad.

A jump is the easy example, since gravity plus an upward impulse gives you a jump that works. What makes the jump in Celeste feel good is a pile of small forgiveness tricks on top, and since Celeste's developers published the [player code](https://github.com/NoelFB/Celeste/blob/master/Source/Player/Player.cs) in 2018, you can see them. `JumpGraceTime = 0.1f` lets you jump for a tenth of a second after running off a ledge, and `UpwardCornerCorrection = 4` nudges you up to 4 pixels sideways around a ceiling corner you'd otherwise bump your head on. None of that is needed for the jump to work, but it's a big part of why it feels fair.

**[FIGURE celeste-jump: a jump from Celeste's launch trailer with the 0.1 s grace window drawn past the plank, beside a drawing of the 4 px corner nudge]**

A model writing a jump from scratch will probably get the first part right and skip the rest. **[GAP: did you see implementer models do this before the reference classes?]** So we reverse-engineered mechanics from games known to get this right, Hollow Knight, Celeste, Ori and a few others, and wrote each one up as an abstract reference class. **[GAP: what a reference class contained, e.g. inputs, state, tuning values, and why each forgiveness trick exists.]** The model implementing a mechanic starts from that instead of from nothing.

**[FIGURE: anatomy of a reference class: inputs, state, tuning values, and why each trick exists]**

The UI side worked the same way. Menus, HUDs and inventories from popular games were taken apart with Ghidra and similar tools and written up as the same kind of reference. **[GAP: what was extracted for UI, and from which games?]** **[NOTE: describe the patterns only, no decompiled code from commercial games.]**

It's the same move as the abstract actions. Rather than asking the model to work out a jump or a placement from first principles, you give it building blocks that are known to work, and it spends its effort choosing between them.

### What makes a game slop

**[GAP: what makes a game "slop" beyond graphical fidelity, and the mechanisms you've thought of to make agent-made games less slop-y.]**

**[FIGURE slop-platformer: the platformer from our abstract-actions run: a line of identical 3 × 3 m platforms that passes the per-jump checks and has no pacing]**

### Capturing intent

**[GAP: good UX for the person driving the game loop: getting as much information out of them as possible without being annoying, and how to capture their intent reliably and keep track of it across a session.]**

## It runs, but does it scale?

There's a thin runtime layer under the abstract actions. `attach(roof, walls.top)` doesn't know which engine it's running in, the layer maps it onto Unity, Godot or Unreal. **[GAP: which engines actually had adapters?]** The level of abstraction that helps the model turned out to be the one that makes the system portable too.

**[FIGURE adapters: one attach call fanning out to Unity, Godot and Unreal]**

**[FIGURE scaling: relations to compute as a scene grows: every pair against nearest neighbours only]**

Most of the cost savings came from moving checks out of models. Every check a deterministic function can do is a model call you don't pay for, and it gives the same answer every time. Generated C# went through [Roslyn](https://github.com/dotnet/roslyn), the .NET compiler platform, before it got anywhere near Unity, so **[GAP: what Roslyn checked]** without keeping a Unity instance running for it. The reference classes cut cost in a similar way, since a model adapting a known design tends to need fewer attempts than one starting from nothing.

**[FIGURE check-costs: where each check runs: model calls against deterministic checks, and what each costs]**

## Open problems

### The other 11%

My guess is that most of the last 11% comes down to how objects interact once something moves: things that are placed fine but clip as soon as something pushes them, stacks that look stable and fall, a door that swings into a shelf.

Part of that is cheap to fix, since the physics engine already knows when colliders overlap and leaning on it more for clipping is mostly a matter of asking it.

The rest goes back to the scene being at rest. The relations describe a level well before anything moves, but predicting what it does once things move needs a model of the dynamics, so the next step I'd take is a world model, either a VLA or a JEPA-style model that predicts what happens next in a scene.

You could say the engine already simulates the colliders exactly, and a learned model of the same physics is a less exact copy of it. I don't think they compete though, the engine gives the exact answer for a setup you've already picked, and a world model gives the planner a sense of what will happen before it picks.

**[FIGURE world-model: the engine answers after you pick a setup; a world model predicts before you pick]**

I'd use one in three places:

- When a collider doesn't match its mesh. The engine reports no overlap while the meshes visibly clip, and a model looking at a render could catch it.
- When there are too many candidate placements to simulate each one, a learned model could screen them first.
- When the task needs a look, act, look again loop. That's what VLAs are built for, but they're trained mostly on robot demonstrations, so pointing one at editor actions would be a research project of its own.

**[CHECK: "they don't compete" is my reading of your voice note. Keep it if it's yours.]**

### JIT steering

The piece I didn't get to finish was steering the model while it works. **[GAP: what JIT steering injected, and when: a failed check fed back mid-run, fresh relations when the model moves to a new object, or something else?]** A long edit can go wrong halfway through, and the engine often knows before the model does.

### Reading the scene directly

The relation view exists because raw coordinates don't tell an off-the-shelf model what it needs to know. The other route is to train a model that reads scene state directly. On my own I've been looking at packing scene state, positions, physics state and so on, into compact bit sequences, and fine-tuning a Qwen model to read those instead of JSON.

There's precedent for this. [SpatialLM](https://arxiv.org/abs/2506.07491) reads point clouds through an encoder and outputs structured layouts, and [GraphToken](https://arxiv.org/abs/2402.05862) trains graph encodings that a language model learns to read. Pasting a list of numbers into a prompt doesn't train that connection, which is the part the fine-tune does.

Tokenization decides whether it actually saves anything. Qwen's tokenizer splits numbers into single digits, so a 32-bit float written out as 0s and 1s costs exactly 32 tokens, where "3.14159" costs 7. For a small scene (10 objects, each with a position, a rotation and a velocity, so 100 floats) that's 811 tokens as JSON, 704 as plain numbers and about 3,300 as bits, so written out as text the bits cost about 4 times more than the JSON, and any saving depends on how the bits get tokenized. **[GAP: how the bits were tokenized, and how the fine-tune did against JSON with the same content.]**

**[FIGURE token-count: tokens for the same scene state as JSON, as digits and as bits, counted with the Qwen tokenizer]**

The split I'd keep is the one from the start. The engine answers anything that has an exact answer, learned models propose and score, and the language model works out what the person wants. **[CHECK: closing in your words?]**

~ A.
