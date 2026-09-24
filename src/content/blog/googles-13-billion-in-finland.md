---
title: Google's €13 Billion in Finland
date: 2026-09-12
tags: [energy, grid, datacenters, finland, ai, essay]
description: A room of investors spent a morning working out where to put money in energy. They covered generation and regulation. Storage came up about twice, and the grid operator has had a moratorium on connecting it since last year.
toc: true
---

## The Room

On Thursday morning I was at an investor event where the subject was the next big investment opportunity in energy. A visiting sustainability researcher gave the main talk, and the room was mostly investors, the kind who actually write cheques, thinking out loud about where money should go next.

Two days before that, Google had committed at least [€13 billion to Finnish AI infrastructure](https://blog.google/innovation-and-ai/infrastructure-and-cloud/global-network/google-ai-commitment-to-finland/), spread across Hamina, Kajaani, Muhos and Vaala, to be built through 2027 and 2028. Largest single investment Google has ever made in Europe.

So the timing was good and the room was the right room. They talked about generation, about production capacity, and at some length about regulation and regulatory capture, which is fair enough because that side of it does eat projects alive. Grids, distribution and storage came up about twice, and I spent the rest of the morning wondering if that was the actual problem.

## Where I Stand

I support the buildout if the energy infrastructure grows alongside it and the environmental costs are dealt with. I work in AI and use this compute myself, so I want it built well. The announcement doesn't tell me enough about how that will happen.

## The Jobs Number

Google's figure is 37,000 jobs supported, around 16,000 of those in construction, plus €3.6 billion a year added to Finnish GDP.

I want to know how much of that employment lasts beyond construction, which here ends in 2028. Operating a finished datacenter takes far fewer people than building it. The headline jobs figure should make that distinction clear.

## Storage

`Fingrid`, the transmission system operator here, has been [restricting the connection of new grid energy storage facilities in southern Finland](https://www.fingrid.fi/en/news/news/2025/fingrid-secures-transmission-capacity-for-growth-in-electricity-consumption-and-new-industrial-investments--restrictions-on-new-energy-storage-facility-connections-continued-in-southern-finland/) since last year, until 2029. Storage came up about twice during that morning's discussion. I wanted to hear more about those restrictions, especially with new demand arriving in the same region.

I can see why the discussion focused on generation: a turbine or plant is a recognisable investment with a stated capacity. But adding generation doesn't settle how electricity gets to the places that need it, at the hours they need it. The connection restrictions deserve attention in an investment discussion too.

I had a related concern in [the Plan A post](/blog/plan-a-ai): counting one resource can leave other constraints out of the discussion.

## How Much Power

The scale is hard to hold in your head. Fingrid has fielded [more than 50,000 MW of datacenter connection inquiries](https://yle.fi/a/74-20145574), against a Finnish peak consumption of roughly 15,000 MW. Not all of that gets built obviously, inquiries are cheap and speculative and everyone shops around.

But by mid-August, [projects that had already signed connection agreements came to nearly 5 GW](https://www.fingrid.fi/en/news/news/2026/electricity-consumption-is-set-to-increase-sharply--more-balancing-power-will-also-be-needed), and electric boiler projects under construction or already running add more than 3 GW on top of that. If only the signed datacenter pipeline gets built, Finnish electricity consumption goes up by something like 40% against 2025.

Fingrid's own investment plan enables about 10 GW of new industrial consumption and involves close to €1 billion of transmission reinforcement in southern Finland alone. Their study also found that siting facilities closer to generation would unlock [up to 20 GW of additional connection capacity](https://www.fingrid.fi/en/news/news/2026/fingrids-study-locating-industrial-facilities-close-to-electricity-generation-increases-overall-connectability-of-the-transmission-grid) from the same programme, which is a polite way of saying that where people currently want to build is the wrong place.

## Who Pays

Prices have already moved. The January to June average spot price went from €38.7/MWh in 2025 to €71.7/MWh in 2026, about 85% up year on year. Finland has noticed, too. Since the 1st of July this year, electricity used in datacenters moved out of the lower excise category into the general one, so the state has already decided these are not the same thing as a paper mill.

Winter futures point to monthly averages a little over 10 c/kWh at the highest. The projection I found is around a 10% annual rise by 2030 from datacenter growth, with hourly spikes reaching maybe 90 c/kWh across roughly 30 hours a year. Those estimates suggest higher household costs; they don't support my initial worry that people would be unable to heat their homes.

I think operators should cover the additional infrastructure and balancing costs their demand creates. I don't want those costs spread across household bills while the investment returns go to the operators.

If Google is putting €13 billion into buildings here, I'd like to see a substantial contribution to energy infrastructure too. One arrangement I'd support is co-ownership with the Finnish state, with the infrastructure becoming publicly owned over time. The country would then retain something beyond the datacenters themselves.

## Hamina

Google's Hamina site already does some of what I want. They bought a former paper mill in 2009, cool the site with seawater, and have heat recovery designed to cover up to 80% of the annual heat demand of the town's district heating network. Using the waste heat locally is the kind of integration I was arguing for in the Plan A piece.

Where I'm still skeptical is everything after the ribbon cutting. Which sites get built as participants and which get built as islands, who decides that, and whether anybody is checking in 2031 when the announcement has stopped being news. Hamina is a twenty year old site with a paper mill's worth of existing infrastructure and a coastline attached. Muhos and Vaala are not Hamina. So what I'd want to know before anyone celebrates is whether the other three get the same treatment, or whether Hamina is just the one you get shown.

## The Heat Doesn't Come Back

On the way home I wondered whether the waste heat could generate electricity and reduce the facility's grid demand. The problem is its low temperature.

Datacenter waste heat comes out at roughly 15 to 70°C, typically around 38°C. That's low grade heat, and converting low grade heat into electricity is thermodynamically hopeless. The efficiency you get from a temperature difference that small is tiny, and the kit needed to capture it costs more than the electricity is worth. Which is why [the reviews all land on district heating instead](https://www.sciencedirect.com/science/article/pii/S1364032125005362). A municipal heat network wants something around 66°C, a heat pump can lift 38 to 66 fairly cheaply, and then the heat gets used as heat, which is the thing it's actually good at.

That makes district heating a more practical use of the heat than generating electricity from it.

The bigger version of the thought still bugs me though. In 2026 we are still mostly making electricity by boiling water to spin a turbine, which is a 19th century machine with better metallurgy. There's work on supercritical CO2 cycles that are more efficient and a good deal more compact, and I don't know enough to say whether it goes anywhere, but every time I read about the energy side of this buildout I notice how much of it is steam.

## Regulation

I raised regulation in the discussion because I think coordination between municipalities deserves more attention.

Helsinki, Espoo and Vantaa are physically one continuous built-up area. You can drive across the boundary without noticing it. They're separate municipalities with separate politics and they compete with each other for the same development, in a country of 5.5 million people. Every bit of that competition is a delay on something that was going to happen anyway, and everyone pays for the delay.

I'm not anti-regulation here. Regulation is how the environmental side gets stopped from turning to shit, and I want more of it in the places where it's currently missing. What I'm against is procedural friction that protects nothing and slows everything, and a small country dividing itself into competing fiefdoms over the same patch of land is exactly that.

A proposal needs a way to handle disagreements between the municipalities involved. Otherwise a shared infrastructure project can stall even when each municipality supports the general idea.

## LUMI Is Right There

I only found this afterwards and I really wish the room had known about it.

[LUMI](https://lumi-supercomputer.eu/) sits in CSC's datacenter in Kajaani. It's one of the most powerful machines in Europe at more than 550 petaflops, owned by the European Commission's EuroHPC Joint Undertaking and hosted by a consortium of eleven countries. Half the capacity belongs to EuroHPC and gets allocated to European researchers by peer review, the other half belongs to the consortium countries, and up to 20% of the EuroHPC share is set aside for industry and smaller companies. EuroHPC signed the contract for a LUMI-AI machine on the 31st of August this year.

Kajaani is one of the four towns in Google's announcement.

I'd have liked to discuss that alongside the €13 billion announcement. LUMI offers an existing example of public compute allocation in one of the same towns, but it didn't come up in the room.

## My Stake

My interest, since it shapes everything above. I work in this industry and I build on this compute. I've spent the last year on agent memory, competing with companies that have a hundred times my funding, and the thing I keep noticing is that the resource everyone is pouring billions into isn't really available to me, or to most developers, or to most small companies. It's available at a price, and the price sorts people.

That's the part I'd change before anything else in this piece. There should be compute provision that ordinary developers can actually get. Large companies can buy around it, which is fine and normal, but some of it should be reserved, the way LUMI reserves a share for researchers and a share for smaller companies. And anything publicly funded should carry real delivery obligations so it doesn't just turn into a slower cloud.

50 GW of inquiries, and I still can't get a decent allocation without raising a round. That's the thing that genuinely annoys me, and a fair amount of my suspicion about this buildout starts right there.

## Water

I also wondered about cooling water and what happens in a dry year. Finland is water-rich and Hamina uses seawater, so I'd need site-specific information to judge the effect on local lakes and water supplies.

Where it does bite is everywhere else. Arizona, Texas, Spain, Chile. Places where datacenter water draw runs into agriculture and municipal supply, and where there's no seawater to fall back on. And the thing people say, that the water just rains back down again, is not an answer. Water taken from one basin rains somewhere else, which means a drought in one place and a flood in another, and agriculture sits in the middle of that.

Conditions in Finland don't settle the water question for datacenters elsewhere.

## What I've Got

I'd like a published account of the grid upgrades these sites need, who pays for them, and how progress will be checked through 2029. People affected by the buildout should have a part in those decisions, including people who don't work in energy or AI.

Hamina and LUMI are useful examples to start from. Before the next investment discussion, I'd want to know which new sites can reuse heat in the same way and whether any new compute capacity will be available through a public allocation process.

~ A.
