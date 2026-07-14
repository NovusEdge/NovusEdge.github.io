---
title: Let's Talk About the EU Chat Control Act
date: 2026-07-14
tags: [privacy, surveillance, eu, encryption, p2p, essay]
description: On Chat Control, the surveillance stack closing in from all sides, and why the only durable fix is making mass surveillance architecturally impossible.
toc: true
draft: true
---

## 314 > 276, But Who's Counting

On July 9th, 2026, the European Parliament [voted on extending Chat Control 1.0](https://andreafortuna.org/2026/07/10/chatcontrol-survives/). The rejection motion got *more* votes than the approval: 314 '_no_' versus 276 '_yes_'. In any sane system, this should be a 'no' overall.

But this was a second reading, and for people who don't know much about this, second readings require an *absolute majority* of 361 votes to reject. So the 314 > 276 vote really didn't mean jack shit and the extension passed because fewer people showed up than needed to stop it.

This is how it works now: not through mandate but through procedure, not because the people want it but because the people who don't want it can't clear an arbitrary threshold designed for a different era of parliamentary politics.

The thing is, this was the *voluntary* scanning regime. Chat Control 1.0 lets platforms scan your messages if they choose to but the permanent regulation, Chat Control 2.0, is still being negotiated. That one _mandates_ chat monitoring and the trilogue resumes this September.

## It's Not Just Your DMs
If you think this is the end of it, don't worry it gets much worse (shoutout to @HowMoneyWorks, 100 points to hufflepuff if yk this ball lmao). Chat Control is only one layer of this monitoring stack, there's quite a lot more that's been happening in the data collection space that _requires_ public attention, but since we humans are absolute horseshit at keeping track of complex systems that are systemically enforced upon us while we're "outraged" at something much banal, it becomes way more difficult to do just that. Here's what's been tracked:


### What You Say
Chat Control targets the content of your communications. The July vote carved out end-to-end encrypted services (WhatsApp, Signal, Telegram, etc) from the voluntary regime which is a small victory I guess.

But Chat Control 2.0 contains language for **client-side scanning** which means your phone inspects the message *before* it's encrypted. The encryption is irrelevant if the fucking device itself is the snitch. Apple tried this in 2021 with their CSAM scanning thing and backed off after massive backlash, but the EU is just... doing it anyway? Cool cool cool.

And here's the kicker: decentralization doesn't really fix this. You can route through onion networks, bounce off a thousand nodes, encrypt with quantum-resistant algorithms - none of it matters if the app on your phone is legally required to scan before send. The attack isn't on the network anymore, it's on the endpoints. Your phone. Your laptop. The thing you trust most.

### Where You Sleep
[`802.11bf`](https://www.ieee802.org/11/Reports/tgbf_update.htm) was ratified in September 2025. It's a WiFi sensing standard which means that starting next year (and for new models that follow the new standard) **your** router can now detect human presence, motion, breathing patterns, and body poses. Through walls. Your walls.

This isn't some kinda theoretical plan or something either, it's been tech that's been around for some time now. Vodafone shipped "Who's Home" in December 2025. [Carnegie Mellon demonstrated full body pose reconstruction](https://www.spatialintelligence.ai/p/your-wifi-can-see-you-heres-how) from standard router signals. A $9 ESP32 can see through walls. [Gamgee](https://newatlas.com/around-the-home/gamgee-wifi-home-security-system/) is already shipping consumer WiFi security systems based on this. Heck I have a person I know @ Aalto who's making a ML based WiFi sensing detector for the military.

Oh and it's not just WiFi btw - your smart TV is almost certainly running ACR (automatic content recognition) which fingerprints what you're watching frame by frame and phones home. Your smart speaker is always listening for wake words which means it's always *listening*. BLE beacons track you through malls and airports. Ultrasonic beacons embedded in ads can link your TV viewing to your phone activity. The "smart home" is just a surveillance home with better marketing.

By 2027, WiFi sensing will be standard in most new routers. The infrastructure for ambient sensing at global scale is being standardized *right now* and most people have no idea.

### Where You Go
[Flock Safety](https://www.aclu.org/campaigns-initiatives/get-the-flock-out) has around 75,000-100,000 ALPR cameras deployed across the US, scanning 150+ million vehicles daily. They create searchable databases of where every car goes, when, without warrant or probable cause. Just vibes and venture capital.

![The Invasion of Flock Cameras](https://youtu.be/A3cMU55dIIc?si=8BPTtjEkvlUURSpG)

Under 1% of these scans connect to an actual crime. The other 99%+ is just... data. Where you went. When. How often. Who else was there. Who else's car was parked next to yours.

And it's not just cars - your phone is constantly broadcasting. Cell tower triangulation gives rough location, but apps with location permissions (which is most of them lbr) get GPS precision. Google's location history, Apple's "significant locations", your fitness tracker, the photos you take with geotagging on - it all adds up to a pretty complete picture of everywhere you've ever been. Data brokers buy this stuff in bulk and sell it to whoever's paying, including cops who can't be bothered to get a warrant.

The ACLU counted [82 Flock contracts terminated](https://mrsc.org/stay-informed/mrsc-insight/april-2026/restrictions-flock-cameras) across 28 states between 2021 and May 2026, with 39 of those in the first five months of 2026 alone. People are pushing back which is good! But the infrastructure is already built and even if Flock dies tomorrow the playbook exists for the next company.

### What You Think
Meta released [Brain2Qwerty v2](https://www.marktechpost.com/2026/06/30/meta-ai-releases-brain2qwerty-v2-a-non-invasive-meg-brain-to-text-pipeline-decoding-typed-sentences-at-61-word-accuracy/) in June 2026. It decodes typed sentences from brain activity with 61-78% word accuracy using non-invasive MEG scanning. Oh and also [TRIBE v2](https://ai.meta.com/blog/tribe-v2-brain-predictive-foundation-model/) predicts brain responses to video, audio, and language. Gotta love zucc fucking making the most dystopian pieces of tech ever huh?

Meanwhile Neuralink is implanting chips in people's brains and Synchron's Stentrode is already in human trials. The "medical applications" framing is quite valid (helping paralyzed people communicate is genuinely good) buuuuut the dual-use implications are... yeah, they're something (address me vro 🐘). Once you can read out intent, you can also *detect* intent. Thought crime goes from Orwell to engineering problem, and BOY I will bet almost anything that a big chunk of the defense/security sector is heavily invested in this _somehow_. 

Right now Brain2Qwerty requires like a $2 million MEG scanner bolted inside a magnetically shielded room to actually use, but anyone with half a braincell can clearly see where this is going: every sensing modality starts expensive and becomes cheap and it's only a matter of time before we have wearable brain-scanners. MRI used to require a dedicated building, now there are portable ones. WiFi sensing started in research labs before ending up in your $50 router. Give it 15-20 years and some version of this will be consumer grade, probably marketed as a "wellness" or "focus" device.

The last refuge of a human being - their own mind - is becoming violable. And unlike every other layer of surveillance, you can't just leave your brain at home.

## Agency and it's loss

Here's what bothers me more than any specific technology: people *give this up willingly*, not all at once ofc but incrementally, convenience by convenience, feature by feature.

"I have nothing to hide." "It's just metadata." "The algorithm knows me better than I know myself." "Eh, I can't be bothered just lemme watch this one last reel before sleeping"

Each trade seems small - what's one more permission, one more sensor, one more database? But the trades compound, and at some point you look up and realize you've traded away the ability to exist without being observed, catalogued, and predicted.

This isn't even anything new or novel, and every civilization has does this: Rome traded republican governance for imperial stability, Medieval Europe traded local autonomy for feudal protection, and _we_ are trading privacy for convenience. The pattern repeats because it *works* (and really well at that) in the short term for most people most of the time, until it doesn't. And by then the infrastructure of control is already built and then it's too late to turn back. 

## They Only Need to Win Once

You can fight Chat Control. You can show up at Parliament, write your MEP, organize campaigns, fund [EFF](https://www.eff.org/deeplinks/2025/12/after-years-controversy-eus-chat-control-nears-its-final-hurdle-what-know), support digital rights groups (and you absolutely should because all of that matters), but like here's the uncomfortable truth that nobody wants to hear: political solutions are pretty temporary (atleast atm).

You win one vote and they schedule another. You'll kill one regulation and they rename it and try again. The July 9th vote wasn't really even the first Chat Control vote and it won't be the last. These fucks have been trying variants of this since the early 2000s, this shit is just moving out into the open that's all. The surveillance side has permanent incentives (governments want to see, corporations want to know) and the pressure is always there looking for the next opening. The privacy side has to win every single time but the surveillance side... _they_ only need to win once. 

This fight will remain unfair as long as surveillance is *architecturally possible*. So the only proper and possible way to win a rigged game is to _change the game entirely_.

If mass surveillance is technically possible it will eventually happen - maybe not this Parliament, maybe not this administration, but eventually. That's because, my dear reader, the incentives are too strong and the vigilance required to prevent it forever is unsustainable. Nobody can stay outraged for decades, heck look at the whole israel/palestine debacle that's been going on, yeah people were outraged for like what, a couple of months? But as time passes, there's always the next outrage-bait, the next concern. And this doesn't even take into account the fact that the wealth gap is forcing people to have their heads down in work so much so that they cant _literally_ afford to think about anything outside of their income. 

The fix, therefore, is to make surveillance *architecturally impossible* not illegal or regulated, but effectively *impossible*. Build systems where even if the government shows up with a warrant, there's nothing to hand over because the data doesn't exist in a readable form anywhere.

This means:
- **End-to-end encryption** where providers *cannot* read content even if ordered to
- **Decentralized networks** where there's no central point to surveil or subpoena
- **Client software** that users control, not corporations or governments
- **Open source** so the code can be audited and we don't have to just trust pinky promises

We have pieces of this already - Signal exists, Tor exists, [Briar](https://briarproject.org/) and [Session](https://getsession.org/) and [SimpleX](https://simplex.chat/) exist - but none of them have won. And the reason is painfully simple: **convenience**.

## Convenience Always Wins
Privacy tech loses because it's harder to use than the surveilled alternative, and this isn't a bug but kinda the core challenge around this kinda tech. Centralized systems are *inherently* more convenient because they can optimize for user experience without constraint, while decentralized systems have to coordinate without a coordinator which adds friction.

The numbers are also fucking brutal:
- Mastodon's 2022 Twitter exodus (3.5M → 6M signups) collapsed within months. Downloads dropped 99% and retention was like 37%.
- Tor averages ~5 Mbps versus ~250 Mbps for VPNs. 50x slower.
- Web3 dApps see 7% yearly retention. 75% of users abandon before completing their first transaction.

The pattern is clear: when privacy (or really anything) requires effort, people choose convenience. Because we have a tendency on picking out cognitively ease over loads, and we're inherently lazy fucks.

But there are exceptions:
- **Signal** won because it's as easy as iMessage. Zero user action required for encryption.
- **WhatsApp** deployed Signal Protocol to 3 billion users without anyone managing keys.
- **Passkeys** are *faster* than passwords - 8 seconds vs 69 seconds for password+2FA.

The lesson: **privacy tech wins when users don't have to choose it**. When the private path is also the easiest path.

## The Other Side: Poisoning the Well
So defense is one thing but there's _another_ angle I've been thinking about: what if instead of just hiding from surveillance, you make the *output* of surveillance unreliable?

If everyone's data is poisoned (jittered locations or randomized fingerprints or randomized/obfuscated search queries) the datasets on which the surveillance models are trained become useless. Good ol' garbage in -> garbage out type shit. You can't build a profile on someone if their profile is mostly bullshit noise.

The problem is that naive pollution is detectable. The WWW'25 paper ["Breaking the Shield"](https://dl.acm.org/doi/10.1145/3696410.3714713) successfully attacked ALL fingerprint randomization mechanisms across 18 extensions and 5 browsers. In this case the randomizer itself becomes a fingerprint because the population running randomizers is small enough to be distinctive. If only 0.1% of users run a fingerprint randomizer, being in that 0.1% is itself identifying information lmao. Ok so this one's outta question on it's own.

TrackMeNot, the search query obfuscator, is basically comatose. [ML classifiers can separate real queries from decoys](https://link.springer.com/chapter/10.1007/978-3-642-14527-8_2) with ~48-52% accuracy at near-zero false positive rates because human search patterns are *weird* and hard to fake convincingly. The naive approach of injecting random noise is also provably insufficient.

[HARPO](https://arxiv.org/pdf/2111.05792), the reinforcement learning obfuscator, achieves 16x better privacy per unit of injected traffic which is actually pretty cool, but it requires continuous ML model updates to stay ahead of detection which means that this path's an ongoing arms race, not a solved problem.

The Tor approach of making everyone look identical rather than randomizing is stronger because you're hiding in a crowd rather than standing out as "the person trying to hide". But it comes with brutal UX tradeoffs that most people don't fw.

So the real answer is probably a mix of defense (make surveillance impossible) + offense (make surveillance unreliable). I'm [working on something in this space](https://github.com/NovusEdge/ocloak) actually and will have more to share later but the basic idea is that sophisticated pollution that's persona-coherent, human-timed, and adaptive could raise the cost of surveillance to the point where it's just not worth it economically.

## Directions, Not Answers
I don't have a complete answer and i honestly doubt anyone does if I'm gonna be honest, but there's a clear direction all this is kinda headed towards so I'll try and shed some light on this: 

**Decentralize trust, not necessarily infrastructure.** This is the Signal model - they use central servers for delivery (fast, reliable, good UX) but decentralize the cryptographic trust (they literally cannot read your messages). This is pragmatic and it works. The purist approach of decentralizing everything often just means decentralizing the problems too.

**Make privacy the default.** Not a setting buried in a menu. Not a "privacy mode" you have to enable. The default. WhatsApp did this with E2E encryption - 3 billion users got encrypted messaging without knowing or caring about key management. That's the model.

**Solve the cold-start problem.** Network effects kill new privacy tools dead. You can build the most secure messenger in the world but if your friends aren't on it, you're not gonna use it. You need interoperability (Matrix federation, bridges to existing platforms) or you need to ride an existing wave (Signal growing because WhatsApp got sketchy).

**Invest in UX like it's the whole product.** Because it is. Nobody cares about your threat model if the app is annoying to use. The crypto/privacy community has historically been terrible at this - "just use PGP" energy when PGP is a UX nightmare that even security researchers fuck up.

The P2P messaging landscape has options - Session, SimpleX, Briar, Matrix - but they all have tradeoffs. Session moved to Switzerland after an Australian police data request (good) but still has slower delivery than centralized push (bad). SimpleX has no persistent identifiers (good) but only two core engineers (concerning for long-term maintenance). Briar works over Tor and Bluetooth mesh (good) but is Android-only and text-only (limiting). [Veilid](https://veilid.com/) looks promising but is still early.

Mesh networks like [Meshtastic](https://meshtastic.org/) are usable today with ~$30 hardware which is pretty cool for off-grid coordination and disaster scenarios, but not a replacement for cellular-scale communication obviously.

Decentralized identity is getting real momentum - EU eIDAS 2.0 forces acceptance of DID wallets starting January 2026 - but Block/Square killed their Web5 DID initiative over wallet UX friction. The convenience problem kills projects with hundred-million-dollar backing. Nobody is immune.

## What We're Playing For
I want to be clear about what's at stake here because this isn't about hiding crimes, and neither is this to fuel retarded illegal/extremist activity that harms us all. No _this_ is about the asymmetry of power between individuals and institutions.

A government that can see everything can control everything, not through force (that's expensive and creates resistance) but through prediction and preemption. If you know what someone will do before they do it you can shape their options invisibly. A corporation that knows everything can manipulate everything, not through coercion (that's illegal) but through optimization meaning that if you know what someone wants before they know it you can manufacture the desire and sell the solution.

The endpoint of total surveillance is not a police state but something subtler and harder to resist: a world where deviation from predicted behavior is increasingly costly, where conformity is the path of least resistance, where the space for genuine choice slowly contracts. This is the world we're building, one convenience at a time.

## Closing Remarks
Look, I'm not telling you to delete Facebook and move to a cabin in the woods or treat every app as a wiretap. That's not the point here and it's not realistic for most of us anyway.

What I am saying is that the infrastructure being built around you right now - the WiFi that sees through walls, the cameras that log every plate, the apps that might soon scan before they encrypt, the BCIs that are learning to read thought itself - none of this is being built with your interests at heart. It's being built because it can be, because someone will pay for it, and because the people building it don't have to live with the consequences the way you will.

The political fights matter and you should show up for them when you can, but they're rearguard actions at best. The only way out of this loop is to make surveillance itself technically impossible - not regulated, not illegal, but *impossible* - and to make the private path so frictionless that choosing it doesn't feel like a sacrifice.

**So what can you actually do?** Use Signal - it's free, it works, and every additional user makes the network stronger. Support orgs like EFF, ACLU, Access Now, and noyb who are fighting the political battles even if those battles are ultimately temporary. Pay attention to defaults and when a new service asks for permissions, ask why. And talk about this stuff with people because the biggest advantage surveillance has right now isn't technology, it's apathy. Most people have no idea what's being built around them.

**And if you build things?** Make privacy the default. Invest in UX like it's the entire product because it basically is. Think architecturally about whether your system can be compelled or compromised and what happens when (not if) the legal environment changes.

We're not there yet, not even close. But I think we can get there if enough people start building in that direction instead of just complaining about the status quo.

Stay sharp out there.

~ A.
