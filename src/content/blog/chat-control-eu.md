---
title: Let's Talk About the EU Chat Control Act
date: 2026-07-14
tags: [privacy, surveillance, eu, encryption, p2p, essay]
description: Why Chat Control bothers me, what other forms of surveillance have to do with it, and the privacy tools I want people to build.
toc: true
---

## 314 > 276, But Who's Counting

On July 9th, 2026, the European Parliament [voted on extending Chat Control 1.0](https://andreafortuna.org/2026/07/10/chatcontrol-survives/). In the initial vote, 314 MEPs supported rejecting the Council's position and 276 opposed rejection. It still didn't clear the threshold.

At second reading, rejection requires an absolute majority of Parliament's members: 361 votes. A majority of those voting wasn't enough. [Parliament's account of the vote](https://www.europarl.europa.eu/news/en/press-room/20260706IPR46318) sets out that distinction. I understand the rule; I still find the outcome frustrating.

This vote concerned the temporary regime allowing voluntary scanning. The proposed permanent regulation, usually called Chat Control 2.0, is a separate negotiation. I care about both, especially any proposal that would require inspection of private messages.

## It's Not Just Your DMs

Chat Control is one of several ways private activity becomes available to institutions. I keep coming across others while working on privacy hardware. They have different capabilities and limits, but together they affect where a person can go and what they can do without leaving a searchable record.

### What You Say

Client-side scanning inspects content on a device before encryption or after decryption. End-to-end encryption protects the message in transit, but it doesn't prevent software on either endpoint from examining the plaintext.

Changing the network doesn't address that problem by itself. An app can use a decentralised network and still scan a message before sending it. I want users to control the client as well as having protection against interception.

### Where You Sleep

[802.11bf](https://www.ieee802.org/11/Reports/tgbf_update.htm) standardises WiFi sensing. IEEE [published it in September 2025](https://www.ieee802.org/11/email/stds-802-11/msg09024.html). Research systems can infer motion and, under particular conditions, breathing or body pose from changes in radio signals. Those capabilities depend on the equipment, placement, environment, and model; publication of a standard doesn't give every router all of them.

[Carnegie Mellon's pose-reconstruction work](https://www.spatialintelligence.ai/p/your-wifi-can-see-you-heres-how) and consumer systems such as [Gamgee](https://newatlas.com/around-the-home/gamgee-wifi-home-security-system/) are examples worth distinguishing. A research demonstration and a home motion detector don't necessarily measure the same thing. Vodafone's [Who's Home](https://www.vodafone.co.uk/help/account/how-do-i-use-whos-home), for example, watches devices connect to the home WiFi. It isn't evidence of through-wall sensing.

I also know someone at Aalto working on an ML-based WiFi sensing detector for the military. That's part of why I keep following this area.

Other devices collect information more directly. A TV with automatic content recognition can identify what's playing. Apps can collect location data, and radio or audio beacons can be used to associate devices. A speaker listening locally for a wake word isn't the same as continuously uploading a room's conversations. The useful questions are what gets collected, where it goes, and who can retrieve it.

### Where You Go

[Flock Safety's licence-plate camera network](https://www.aclu.org/campaigns-initiatives/get-the-flock-out) makes vehicle sightings searchable across locations. My concern is that routine journeys become records that can later be queried for a purpose the driver never knew about.

![The Invasion of Flock Cameras](https://youtu.be/A3cMU55dIIc?si=8BPTtjEkvlUURSpG)

A phone can add other records through apps with location access, fitness tracking, and geotagged photos. Their privacy properties differ, but combining records can reveal much more than one permission prompt suggests.

There is resistance. An account of [restrictions on Flock cameras](https://mrsc.org/stay-informed/mrsc-insight/april-2026/restrictions-flock-cameras) reports 82 terminated contracts across 28 states between 2021 and May 2026, including 39 in the first five months of 2026. I want those fights to succeed. I also want limits on collection and retention that apply when the next vendor comes along.

### What You Think

Brain interfaces raise a more speculative concern. Reports on Meta's [Brain2Qwerty v2](https://www.marktechpost.com/2026/06/30/meta-ai-releases-brain2qwerty-v2-a-non-invasive-meg-brain-to-text-pipeline-decoding-typed-sentences-at-61-word-accuracy/) describe decoding typed sentences from MEG recordings. [TRIBE v2](https://ai.meta.com/blog/tribe-v2-brain-predictive-foundation-model/) predicts brain responses to stimuli. Neither result amounts to remotely reading arbitrary thoughts.

Helping someone communicate through a brain interface is a worthwhile application. I still want to know who controls the recordings and whether access can become a condition of employment, treatment, or using a product.

The MEG setup also matters: expensive equipment in a shielded room is a long way from a consumer wearable. I don't know whether these particular capabilities will become portable or cheap, let alone on what schedule. My concern is how consent and control are handled as the technology develops.

## Agency and it's loss

Most people encounter data collection through small decisions: allow a permission, turn on a useful feature, accept a default so they can get on with something else.

The accumulated record is harder to see. A person may understand why a map needs their location without agreeing to a broker selling a history of their movements. Consent to one use shouldn't quietly become permission for every later use.

I don't think explaining every risk more loudly will solve that. People have jobs, families, and other things to care about. Privacy tools need to work without requiring constant attention.

## They Only Need to Win Once

Write your MEP, organise, and support groups such as [EFF](https://www.eff.org/deeplinks/2025/12/after-years-controversy-eus-chat-control-nears-its-final-hurdle-what-know). Those efforts can stop proposals and constrain what institutions do.

What worries me is how much continuing work that requires. A defeated proposal can return, a government can change, and a company can revise its terms. I want technical protections that remain useful through those changes.

My aim is to make particular forms of mass surveillance architecturally impossible: for example, a provider cannot hand over plaintext it never had. That doesn't prevent every attack on an endpoint, or every form of metadata collection. It does remove one place where access might otherwise be compelled.

End-to-end encryption, clients people can inspect and control, and reduced collection all help. Decentralisation can remove some central points of access, though it also introduces design and usability problems. Open source makes inspection possible; someone still has to do the inspection.

We have working projects to learn from, including Signal, Tor, [Briar](https://briarproject.org/), [Session](https://getsession.org/), and [SimpleX](https://simplex.chat/). Getting people to use them consistently is another part of the work.

## Convenience Always Wins

I don't want privacy to require maintaining a second hobby. If a messenger is hard to install, delivers unreliably, or has none of your friends on it, the cryptography won't make it useful to you.

Defaults can do a lot. Signal and WhatsApp let people send encrypted messages without managing keys for every conversation. The protection is part of the ordinary action.

That is the kind of experience I want to build toward. A person should be able to choose a private tool because it does the job well, without having to tolerate an inferior version of everything they already use.

## The Other Side: Poisoning the Well

I'm also interested in whether we can make collected data less useful. Decoy searches, locations, or device signals could interfere with profiling if the collector cannot cheaply separate them from real activity.

That condition is difficult. The WWW'25 paper [“Breaking the Shield”](https://dl.acm.org/doi/10.1145/3696410.3714713) attacks fingerprint randomisation across 18 extensions and five browsers. A distinctive randomiser can itself help identify its user.

Earlier [work on separating real searches from TrackMeNot decoys](https://link.springer.com/chapter/10.1007/978-3-642-14527-8_2) raises a similar problem. Adding noise doesn't establish that the adversary will be confused by it.

[HARPO](https://arxiv.org/pdf/2111.05792) uses reinforcement learning for obfuscation and reports better efficiency than its baselines. I'd want to know how that benefit holds as the collector adapts. Making users look alike, as Tor Browser tries to do, is another approach, with its own usability constraints.

I'm [working on ØCLOAK](https://github.com/NovusEdge/ocloak) in this area. The hypothesis is that coherent, well-timed decoys and changes to sensing conditions could make collection more expensive or less reliable. Whether that works at a useful cost has to be measured.

## Directions, Not Answers

A few practical choices seem worth pursuing.

Keep encryption and collection limits in the normal flow. A privacy setting that most people never find won't protect them. Signal's central delivery servers also show why the topology of a network and access to message contents need to be considered separately.

Help people bring their contacts with them. Federation and bridges can help with adoption, but a bridge also changes who can access a message. That needs to be clear to the person using it.

Treat installation, delivery, recovery, and accessibility as part of the privacy work. PGP's difficulty is a useful warning: even a strong mechanism can fail people who cannot operate it reliably.

Projects such as [Veilid](https://veilid.com/) and [Meshtastic](https://meshtastic.org/) explore other ways to communicate. A small radio mesh can be useful for local or off-grid coordination without replacing a cellular network. I want more experiments like these, evaluated for the situations they actually support.

## What We're Playing For

What bothers me is the difference in power between a person and an institution holding years of records about them. The person may not know the records exist, may be unable to correct them, and may never learn that they influenced a decision.

That can affect behaviour before anyone uses force. People avoid conversations, associations, or places when they expect those choices to be recorded and judged later. I want room to live without having to justify every ordinary action to a database I cannot inspect.

## Closing Remarks

For my own work, the questions are fairly concrete: what information does the system need, how long does it keep it, and what can a provider or attacker learn from it? I want to remove unnecessary collection before trying to secure a larger archive.

Using private tools and supporting digital-rights groups both help. So does making those tools usable enough that friends will actually keep them installed.

I don't have a design that makes all surveillance impossible. I want to work on the parts we can prevent, and measure whether the more experimental defenses do what we hope.

~ A.
