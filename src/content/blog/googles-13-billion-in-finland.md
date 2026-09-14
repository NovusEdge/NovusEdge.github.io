---
title: Google's €13 Billion in Finland
date: 2026-09-12
tags: [energy, grid, datacenters, finland, ai, essay]
description: A room of investors spent a morning working out where to put money in energy. They covered generation and regulation. Storage came up about twice, and the grid operator has had a moratorium on connecting it since last year.
toc: true
---

## The Room

On Thursday morning I was at a Finnish business angels event where the subject was the next big investment opportunity in energy. A visiting sustainability researcher gave the main talk, and the room was mostly investors, the kind who actually write cheques, thinking out loud about where money should go next.

Two days before that, Google had committed at least [€13 billion to Finnish AI infrastructure](https://blog.google/innovation-and-ai/infrastructure-and-cloud/global-network/google-ai-commitment-to-finland/), spread across Hamina, Kajaani, Muhos and Vaala, to be built through 2027 and 2028. Largest single investment Google has ever made in Europe.

So the timing was good and the room was the right room. They talked about generation, and about production capacity, and at some length about regulation and regulatory capture, which is fair enough because that side of it does eat projects alive.

Grids, distribution and storage came up about twice, and I spent the rest of the morning wondering if that was the actual problem.

## Where I Stand

Up front: I think the buildout is a good thing. For a country this size it's obviously good economically, and I'm not going to do the thing where someone who works in AI and builds on this exact compute suddenly decides datacenters are evil the week one gets built near him.

It's good _conditionally_ though. Good if the rollout method is right, if there are real stopgaps on the environmental side, and if the energy infrastructure grows alongside it instead of trailing behind it. None of that happens automatically and most of it isn't in the announcement.

## The Jobs Number

Google's figure is 37,000 jobs supported, around 16,000 of those in construction, plus €3.6 billion a year added to Finnish GDP.

The word doing all the work in that sentence is "supported". Construction jobs end when the construction ends, which here means 2028, and a finished datacenter is one of the least labour-intensive large buildings we know how to make. That's not really a criticism of datacenters, it's just what they are: a building full of racks and a small number of people keeping the racks alive.

I'm not saying the investment is bad because of this. I'm saying that if the case for it rests on employment then the case is thin, and anyone repeating the jobs figure should know which part of it disappears in 2029.

## Storage

Here's the part that actually got my attention.

Fingrid, the Finnish transmission system operator, has been [restricting the connection of new grid energy storage facilities in southern Finland](https://www.fingrid.fi/en/news/news/2025/fingrid-secures-transmission-capacity-for-growth-in-electricity-consumption-and-new-industrial-investments--restrictions-on-new-energy-storage-facility-connections-continued-in-southern-finland/), and that restriction runs until 2029.

So a room of people deciding where to put energy money spent a morning on generation, mentioned storage about twice, and meanwhile the grid operator already has an active moratorium on connecting storage in the region where all of the new demand is landing.

I don't think anyone in that room was being careless. Generation is the part you can see: a turbine or a panel field or a plant, something with a nameplate capacity that goes in a spreadsheet, an asset somebody can own. Distribution and storage are wires and cabinets and the fairly boring physics of getting electricity to the right place at the right hour. They're the constraint, and constraints are much harder to sell than assets are.

Same shape as the thing I was complaining about in [the Plan A post](/blog/plan-a-ai). Everyone watches the meter that reads the countable thing, and the limit that actually binds sits somewhere the meter doesn't reach.

## How Much Power

The scale is hard to hold in your head.

Fingrid has fielded [more than 50,000 MW of datacenter connection inquiries](https://yle.fi/a/74-20145574), against a Finnish peak consumption of roughly 15,000 MW. Not all of that gets built, obviously. Inquiries are cheap and speculative and everyone shops around.

By mid-August though, [datacenter projects that had already signed connection agreements came to nearly 5 GW](https://www.fingrid.fi/en/news/news/2026/electricity-consumption-is-set-to-increase-sharply--more-balancing-power-will-also-be-needed), and electric boiler projects under construction or already running add more than 3 GW on top of that. If only the signed datacenter pipeline gets built, Finnish electricity consumption rises by something like 40% against 2025.

Fingrid's own investment plan enables about 10 GW of new industrial consumption and involves close to €1 billion of transmission reinforcement in southern Finland alone. Their study also found that siting facilities closer to generation would unlock [up to 20 GW of additional connection capacity](https://www.fingrid.fi/en/news/news/2026/fingrids-study-locating-industrial-facilities-close-to-electricity-generation-increases-overall-connectability-of-the-transmission-grid) from the same investment programme, which is a polite way of saying that where people currently want to build is the wrong place.

## Who Pays

Prices have already moved. The January to June average spot price went from €38.7/MWh in 2025 to €71.7/MWh in 2026, about 85% up year on year.

Finland has noticed. Since the 1st of July this year, electricity used in datacenters has moved out of the lower excise category into the general one, so the state has already decided these are not the same thing as a paper mill.

I was going to write a paragraph here about people not being able to heat their homes, and then I checked, and I can't support it. Winter futures point to monthly averages a little over 10 c/kWh at the highest. The projection people actually use is around a 10% annual rise by 2030 from datacenter growth, with hourly spikes reaching maybe 90 c/kWh across roughly 30 hours a year. Thirty expensive hours is a real cost to real households. It's not people dying in the cold, and the argument doesn't need it to be.

The argument is about who absorbs that cost.

My answer is the operators. If your load is what moves the curve then you should be the one paying for the curve, not as a punishment but because it's the accurate price. At the moment a good share of the cost of this buildout gets spread across every household bill in the country while the returns stay entirely private, and nobody was asked whether they wanted that trade.

If Google is putting €13 billion into buildings here then it seems reasonable to put a serious amount into energy infrastructure as well. Co-own that infrastructure with the Finnish state, let it become publicly owned over time. Google gets its datacenters, the country gets a grid it didn't have to fund on its own, and local prices go down instead of up. _That_ would be a deal. What's on the table at the moment is an announcement.

## Hamina

Here's where I have to be fair, and it costs me something.

I've been arguing for a while, including in the Plan A piece, that compute should be built as a participant in the grid instead of as an island sitting on top of it. Put the heat into the district network, let the water and power flows go both ways, and the externality stops being an externality.

Google already does this at Hamina. They bought a former paper mill in 2009, they cool the site with seawater, and the heat recovery there is designed to cover up to 80% of the annual heat demand of the Hamina district heating network.

So the model I want already exists, the company I'm being suspicious of built it, it's in this country, and it works.

That changes what the argument is about. It's now about which ones get built as participants and which get built as islands, who decides that, and whether anybody is checking. Hamina is a twenty year old site with a paper mill's worth of existing infrastructure and a coastline attached. Muhos and Vaala are not Hamina. What I'd want to know before celebrating is whether the other three sites get the same treatment, or whether Hamina is simply the one you get shown.

## The Heat Doesn't Come Back

I had an idea on the way home: if the datacenter produces all this heat anyway, you could run it through something and generate electricity, so the facility partly feeds itself and its effective load on the grid comes down.

Then I looked it up. It doesn't work, and I'm leaving it here instead of quietly deleting it because the reason it doesn't work is the interesting part.

Datacenter waste heat comes out at roughly 15 to 70°C, typically around 38°C. That's low grade heat, and converting low grade heat into electricity is thermodynamically hopeless. The efficiency available from a temperature difference that small is tiny, and the kit needed to capture it costs more than the electricity is worth. Which is why [the reviews all land on district heating instead](https://www.sciencedirect.com/science/article/pii/S1364032125005362). A municipal heat network wants something in the region of 66°C, a heat pump can lift 38 to 66 fairly cheaply, and then the heat gets used as heat, which is the thing it's good at.

So the feedback loop I wanted doesn't exist. The district heating loop does, it's better, and Hamina is already running one. I'd rather be wrong in a direction that has a working answer sitting in it.

The larger version of the thought still bothers me though. In 2026 we are still mostly making electricity by boiling water to spin a turbine, which is a 19th century machine with better metallurgy. There's work on supercritical CO2 cycles that are more efficient and a good deal more compact, and I don't know enough to say whether it gets anywhere, but every time I read about the energy side of this buildout I notice how much of it is steam.

## Regulation

I said in the room, and I'll say here, that regulation is holding back the energy side of this. Everyone says that and almost nobody names anything, so here's mine.

Helsinki, Espoo and Vantaa are physically one continuous built-up area. You can drive across the boundary without noticing it. They're separate municipalities with separate politics, and they compete with each other for the same development, in a country of 5.5 million people. Each bit of that competition is a delay on something that was going to happen anyway, and everyone pays for the delay.

I'm not against regulation. Regulation is how the environmental side gets stopped from turning to shit, and I want more of it in the places where it's currently missing. What I'm against is procedural friction that protects nothing and slows everything, and a small country dividing itself into competing fiefdoms over the same patch of land is exactly that.

This is also the part that connects back to Plan A. You can design a perfect system on paper, but deploying it goes through people, and people are messy and territorial and locally self-interested. A design that only works if everyone behaves well isn't really a design. The messiness has to be accounted for in the structure, or the structure doesn't survive contact with the people who have to run it.

## LUMI Is Right There

This is the thing I only found afterwards, and the part I most wish the room had known.

[LUMI](https://lumi-supercomputer.eu/) sits in CSC's datacenter in Kajaani. It's one of the most powerful machines in Europe at more than 550 petaflops. It's owned by the European Commission's EuroHPC Joint Undertaking and hosted by a consortium of eleven countries. Half the capacity belongs to EuroHPC and is allocated to European researchers by peer review, the other half belongs to the consortium countries, and up to 20% of the EuroHPC share is set aside for industry and smaller companies. EuroHPC signed the contract for a LUMI-AI machine on the 31st of August this year.

Kajaani is one of the four towns in Google's announcement.

So the model already exists. Publicly owned compute, same country, one of the same towns, allocated by a process rather than by a price. Nobody framed the €13 billion news against it, and nobody in that room mentioned it either, which I think is a miss, because it's the only working answer anyone has to the question I care most about.

## My Stake

I should declare my interest here, because it shapes everything above.

I work in this industry and I build on this compute. I've spent the last year on agent memory, competing with companies that have a hundred times my funding, and the thing I keep noticing is that the resource everyone is pouring billions into isn't really available to me, or to most developers, or to most small companies. It's available at a price, and the price sorts people.

That's the part I'd change before anything else in this piece. There should be compute provision that ordinary developers can actually get. Large companies can buy around it, which is fine and normal. But some of it should be reserved, the way LUMI reserves a share for researchers and a share for smaller companies, and anything publicly funded should carry real delivery obligations so that it doesn't just turn into a slower cloud.

50 GW of inquiries, and I still can't get a decent allocation without raising a round. That's the thing that genuinely annoys me, and a fair amount of my suspicion about this buildout starts right there.

## Water

I want to flag this rather than argue it, because I'm not confident and I'd rather say so.

My instinct was to worry about water. Lakes, cooling draw, what happens in a dry year. Then I looked at it, and Finland is water-rich, and Hamina uses seawater, and the version of the worry I was carrying doesn't really bite here. I'm also not Finnish, so I'm the wrong person to have strong feelings about Finnish lakes.

Where it does bite is everywhere else. Arizona, Texas, Spain, Chile. Places where datacenter water draw runs into agriculture and municipal supply, and where there's no seawater to fall back on. And the thing people say, that the water just rains back down again, is not an answer. Water taken from one basin rains somewhere else, which means a drought in one place and a flood in another, and agriculture sits in the middle of that.

So it doesn't look like a Finland problem to me. It is very much a problem, and the Finnish version of the story is the one where it looks easy, which might be exactly why it's the version being told.

## What I've Got

This is usually where I'd give you the fix. I don't have one. I'm not an energy person. I spent one morning in a room with people who do this for a living, and what I came away with was that the gap I noticed is real and that I don't know enough to close it.

What I think, tentatively, is that this needs public involvement, including from people who aren't experts, because the experts are mostly employed by one side of it. It also needs a published forecast of how this gets handled, something with numbers in it that somebody can be held to in 2029, instead of a press release with a jobs figure in it.

Past that I'd be making things up, and there's already enough of that in this conversation.

The things I'm fairly sure of are smaller. The storage gap is real and Fingrid has already said so. The jobs number is softer than it looks. The price rise is already in the data. The model everyone should be copying is sitting in Hamina and in Kajaani, and it took me a week of reading to find that out, which suggests nobody is putting it in front of the people writing the cheques.

It's also not only Finland. People tend not to care much about things that aren't happening near them, and this is happening near a lot of people now, in places with less water and worse grids and no district heating network to put the heat into. One planet, one ecosystem, and the bill lands unevenly.

I don't know whether I'm right. I'm worried, and I'd rather be worried in public where somebody can correct me.

~ A.
