---
title: 140 MW of Chat
date: 2026-11-20
tags: [energy, grid, datacenters, finland, ai, inference]
draft: true
description: I added up what every consumer chat assistant draws, using published usage and energy figures. It comes to about 140 MW on average, a quarter of a percent of data-centre electricity. Energy per message is the big unknown, and usage grew fivefold last year.
toc: true
pixel: thinking
---

## The Number

Hundreds of millions of people use chatbots every week, and AI campuses are being planned at gigawatt scale. Fingrid alone is holding over 100 GW of connection enquiries against a Finnish peak under 16 GW, and most of them are for data centres ([Fingrid](https://www.fingrid.fi/globalassets/dokumentit/fi/ajankohtaista-tapahtumat/webinaari-liittymissopimushakemuksista-18.5.2026-esitysmateriaali.pdf)). Those enquiries aren't binding, and the data-centre agreements that have actually been signed come to about 5 GW. In the UK, about 73 GW of the 125 GW demand queue is data centres ([Ofgem](https://www.ofgem.gov.uk/sites/default/files/2026-07/Proposed-data-centre-connection-reforms-curate-consultation-document.pdf)).

I wanted to know how much of that the chatbots themselves need, so I worked it out from published numbers. My central estimate is that ChatGPT, Gemini, Claude, Meta AI and the rest together draw about **140 MW on average and 233 MW at peak**. That average is about 0.25% of the electricity data centres used in 2025.

Keep in mind that's today's chat load next to campuses due between 2027 and 2030, and chat is growing fast. But today, consumer chat is a small part of data-centre load. The rest is training, enterprise and API traffic, consumer AI that isn't chat, and general cloud. No published source splits up that remainder, so I can't tell you how big each part is.

## How the Estimate Works

The estimate is four numbers multiplied together, with a peak factor on top.

| Input | Low | Central | High | Source |
|---|---|---|---|---|
| ChatGPT weekly users | 900M | 900M | 900M | [OpenAI via TechCrunch](https://techcrunch.com/2026/02/27/chatgpt-reaches-900m-weekly-active-users) |
| Messages per user per day | 3.67 | 5.5 | 11 | [OpenAI/NBER](https://cdn.openai.com/pdf/a253471f-8260-40c6-a2cc-aa93fe9f142e/economic-research-chatgpt-usage-paper.pdf) |
| Energy per message | 0.24 Wh | 0.34 Wh | 1.0 Wh | [Google](https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference), Altman, [Epoch AI](https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use) |
| All assistants ÷ ChatGPT | 1.5 | 2.0 | 3.0 | Assumed; [Similarweb via Momentic](https://momenticmarketing.com/blog/top-ai-chatbots) |
| Peak ÷ mean | 1.66 | 1.66 | 2.0 | Azure 2024 conversation trace |

Here's what each input rests on:

- **Users.** 900M is from February 2026, and it's the latest figure OpenAI has confirmed. Every result scales linearly with it.
- **Messages.** The low value is what OpenAI reported: 18 billion messages a week from 700 million users in July 2025. Central and high assume usage per person kept growing.
- **Energy.** The low value is Google's median for a Gemini text prompt, data-centre overhead included. Central is the average Sam Altman has stated, with no method or boundary given. High is my own assumption for a mix with some reasoning and long context.
- **Other assistants.** ChatGPT has 56.6% of web visits among seven assistants in October 2026, which gives 1.77. That count misses apps, Meta AI inside Meta's apps and Chinese domestic assistants.
- **Peak.** It's computed in hourly bins from one week of Azure's 2024 LLM conversation trace, which is enterprise API traffic. The high value is assumed.

| Case | Average | Peak | Average as share of 2025 data-centre electricity |
|---|---|---|---|
| Low | 50 MW | 82 MW | 0.09% |
| Central | 140 MW | 233 MW | 0.25% |
| My high case | 1,238 MW | 2,475 MW | 2.2% |

![Drag the inputs to see the megawatts](/figures/chat-power-calculator)

The data-centre figure is the IEA's 485 TWh for 2025, which is about 55 GW on average ([IEA](https://iea.org/reports/key-questions-on-energy-and-ai/executive-summary)). The [script](/assets/blog/consumer-chat-demand.py) is about 55 lines of plain Python, so you can swap in your own inputs.

Energy per message is the input I trust least, and it's the one that moves the answer most. Third-party modelling puts a medium-length GPT-5 prompt at 2.33 Wh with minimal reasoning and 17.15 Wh with high reasoning ([Jegham et al.](https://arxiv.org/abs/2505.09598)). Leave every other input at central and those give about 1 GW and 7 GW on average. So if the average chat message looks like a reasoning prompt, consumer chat is a gigawatt-scale load already.

## A Rough Floor from Google's Tokens

In May 2026 Google said it processes over 3.2 quadrillion tokens a month "across our surfaces" ([Google](https://blog.google/innovation-and-ai/sundar-pichai-io-2026/)). It doesn't define the count, which covers Search AI features, Workspace and the API as well as the Gemini app. That works out to about 1.2 billion tokens a second.

DeepSeek has published its production throughput: about 73,700 input tokens a second per 8-GPU H800 node during prefill, or about 14,800 output tokens a second during decode ([DeepSeek](https://github.com/deepseek-ai/open-infra-index/blob/main/202502OpenSourceWeek/day_6_one_more_thing_deepseekV3R1_inference_system_overview.md)). Take Epoch's 1.5 kW per GPU including overhead, and Google's token stream comes to about 240–360 MW on average if 80–95% of the tokens are input. DeepSeek's own mix was 78% input, which gives 370 MW. At 50% input it's about 590 MW.

I'd treat this as a floor. DeepSeek's numbers are a best case: a heavily optimised model at large batch, 56% of input tokens served from cache, and a fleet that moves idle nodes to training at night. It's also measuring something different from the chat estimate, because it covers all of Google's surfaces, enterprise included. What it does show is that even Google's whole token stream, served at DeepSeek's efficiency, comes to hundreds of megawatts.

## Growth

ChatGPT messages grew more than fivefold between July 2024 and July 2025. My central case assumes about 1.9 times growth since July 2025. At last year's pace, the average would pass 700 MW within a year. Pulling the other way, Google says the energy of its median text prompt fell 33-fold between May 2024 and May 2025. Whichever of the two wins decides whether consumer chat stays at hundreds of megawatts.

## Finland Needs Half a Megawatt

Going by its share of users, Finland's consumer chat needs about **0.55 MW** at peak in the central case, and up to about 18 MW in the high case. In power terms, one 1–5 MW site in a city covers it. Germany needs about 6 MW. The US needs about 24 MW, or about 71 MW if you count by chatgpt.com visits, where the US has about 22% of traffic against 7% of users. Hosting 15% of the world's consumer chat, which is Europe's share of global data-centre electricity, would take about 35 MW. That's under 5% of what Ireland's data centres already draw.

Power isn't the whole story, though. One site serving every Finnish user would have to host every vendor's models, and each model needs its own serving pool. Several small pools at one site would each run partly idle.

This cuts both ways for the argument I started with. Consumer chat doesn't need campuses. But moving it out of them barely relieves the grid either, because it's a small load to begin with. So the case for serving it from small city sites has to rest on something else.

## Why Cities Anyway

I'm writing a paper that compares a 100–300 MW campus with a 1–5 MW city site, using Finnish price lists and rules. This is the early picture.

### The Building Matters Less Than Utilisation

In Epoch's model of a 1 GW US campus, servers and networking are about 73% of total cost of ownership and the facility is about 16% ([Epoch AI](https://epoch.ai/data-insights/ai-datacenter-cost-breakdown)). So a small site that costs 50% more per MW to build adds about 8% to cost per token. That 50% is the top of my assumed range, because nobody publishes the real figure.

The catch is utilisation. A national fleet can't pool demand across time zones. Finland's measured peak factor is about 2.33, against 1.66 for globally pooled chat, so a fleet sized for its peak runs at about 43% on average instead of 60%. That gap is what small sites have to close, and it matters more than the building does.

### Small Sites May Get Power Sooner

Finnish law sets a reasonable connection time of 6 months from a signed agreement for the distribution grid, and 24 months at high voltage ([Finlex](https://www.finlex.fi/fi/lainsaadanto/2013/588)). I couldn't find observed times for 1–5 MVA loads published anywhere.

City grids are tight too. Espoo's distribution operator says its own new lines take 6–8 years, and 30 of its 35 main transformers are full once you count backup capacity.

### Existing Buildings Take No New Land

Finnish campuses take 0.07–0.22 hectares of site per MW of IT load, going by the four projects with published figures. A site inside an existing building takes none.

Google's Muhos site, one of the Finnish sites I [wrote about in September](/blog/googles-13-billion-in-finland), had about 330 ha felled or prepared before its environmental impact assessment was finished. In October the Permit and Supervision Agency asked the company to stop preparatory work until the assessments are done, and the company did ([LVV](https://www.sttinfo.fi/tiedote/72390663/lupa-ja-valvontavirasto-kehottaa-tuike-finland-oyta-keskeyttamaan-muhoksen-ja-kajaanin-datakeskushankkeiden-valmistelutoimet)).

### What Doesn't Help

- **Latency.** Helsinki to Stockholm is about 7 ms round trip, and MLPerf's time-to-first-token limit is 450 ms.
- **Resilience.** During the Baltic cable cuts, about a quarter of the rerouted Finland–Germany paths got more than 3 ms slower, with no extra packet loss.
- **Carbon.** Finnish district heat is already low-carbon, so selling server heat into it saves little.

## Rules Decide It Outside Finland

A site becomes a "large load" at anything from 1 MVA in Ireland to 50 MW in PJM and 75 MW in Texas. Above the line, it faces some mix of queues, fees, collateral, its own generation or refusal, depending on the country. Ireland and Denmark already have rules against splitting one operator's load into small connections, and PJM counts an operator's affiliated sites within a mile as one load. Fingrid has asked for Finnish connections to be assessed by project or area as a whole, which could have the same effect. Where rules like that apply, a fleet of small sites can be treated as one large load.

## Where This Could Be Wrong

- **Energy per message is mostly vendor-reported.** Google's 0.24 Wh is a median for text prompts on its own TPUs, and it isn't independently verified. A median understates the mean when the distribution is skewed, so the low case is probably too low. Altman's 0.34 Wh comes with no method.
- **It only covers chat.** Agents, coding tools, image and video generation, and the AI features built into search and social feeds are all left out. They may already be larger than chat.
- **Chinese domestic assistants are outside the evidence.** None of the sources I used covers them.
- **Weekly active users count accounts, not people.** That cancels out of the global total, which uses messages per account, but it can skew the country shares.
- **Finland's peak factor comes from a small sample** of about 500 Finnish users in a public chat dataset.

## What Would Help

If you have better numbers, I'd like them. The ones that would change the paper's model most are the idle power draw of a serving rack, build cost per MW for 1–5 MW liquid-cooled sites, utilisation of real serving fleets, and actual connection times for 1–5 MVA loads anywhere.

The paper will go on Zenodo with the full cost model, sources and data.
