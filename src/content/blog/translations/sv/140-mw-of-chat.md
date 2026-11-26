---
title: "140 MW chatt"
date: 2026-11-20
tags: [energy, grid, datacenters, finland, ai, inference]
draft: true
description: "Jag räknade ihop vad alla konsumentchattassistenter drar, baserat på publicerade siffror för användning och energi. Det landar på ungefär 140 MW i snitt, en kvarts procent av datacenterelen. Energi per meddelande är det stora frågetecknet, och användningen femdubblades förra året."
toc: true
pixel: thinking
---

## Siffran

Hundratals miljoner människor använder chattbottar varje vecka, och AI-campus planeras i gigawattskala. Bara Fingrid hanterar över 100 GW i anslutningsförfrågningar mot en finsk förbrukningstopp på under 16 GW, och de flesta av dem gäller datacenter ([Fingrid](https://www.fingrid.fi/globalassets/dokumentit/fi/ajankohtaista-tapahtumat/webinaari-liittymissopimushakemuksista-18.5.2026-esitysmateriaali.pdf)). De förfrågningarna är inte bindande, och de datacenteravtal som faktiskt har skrivits under landar på runt 5 GW. I Storbritannien består cirka 73 GW av den 125 GW stora anslutningskön av datacenter ([Ofgem](https://www.ofgem.gov.uk/sites/default/files/2026-07/Proposed-data-centre-connection-reforms-curate-consultation-document.pdf)).

Jag ville veta hur mycket av det som chattbottarna själva behöver, så jag räknade på det utifrån publicerade siffror. Min huvudsakliga uppskattning är att ChatGPT, Gemini, Claude, Meta AI och resten tillsammans drar ungefär **140 MW i snitt och 233 MW som mest**. Det snittet motsvarar runt 0,25 % av elen som datacenter använde 2025.

Tänk på att det där är dagens chattbelastning jämfört med campus som planeras till mellan 2027 och 2030, och chattandet ökar snabbt. Men i dag är konsumentchatt en liten del av datacentrens belastning. Resten är träning, företags- och API-trafik, konsument-AI som inte är chatt samt vanliga molntjänster. Ingen publicerad källa delar upp den återstoden, så jag kan inte säga hur stor varje del är.

## Så fungerar uppskattningen

Uppskattningen bygger på fyra tal multiplicerade med varandra, med en toppfaktor ovanpå.

| Parameter | Låg | Central | Hög | Källa |
|---|---|---|---|---|
| Veckovisa ChatGPT-användare | 900M | 900M | 900M | [OpenAI via TechCrunch](https://techcrunch.com/2026/02/27/chatgpt-reaches-900m-weekly-active-users) |
| Meddelanden per användare och dag | 3,67 | 5,5 | 11 | [OpenAI/NBER](https://cdn.openai.com/pdf/a253471f-8260-40c6-a2cc-aa93fe9f142e/economic-research-chatgpt-usage-paper.pdf) |
| Energi per meddelande | 0,24 Wh | 0,34 Wh | 1,0 Wh | [Google](https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference), Altman, [Epoch AI](https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use) |
| Alla assistenter ÷ ChatGPT | 1,5 | 2,0 | 3,0 | Antaget; [Similarweb via Momentic](https://momenticmarketing.com/blog/top-ai-chatbots) |
| Topp ÷ medel | 1,66 | 1,66 | 2,0 | Azure 2024 konversationstrace |

Här är vad varje parameter baseras på:

- **Användare.** 900 miljoner är från februari 2026, och det är den senaste siffran OpenAI har bekräftat. Alla resultat skalar linjärt med den.
- **Meddelanden.** Det låga värdet är vad OpenAI rapporterade: 18 miljarder meddelanden i veckan från 700 miljoner användare i juli 2025. Centralt och högt antar att användningen per person fortsatte att öka.
- **Energi.** Det låga värdet är Googles median för en Gemini-textprompt, inklusive datacenteromkostnader. Centralt är snittet Sam Altman har uppgett, utan angiven metod eller avgränsning. Högt är mitt eget antagande för en mix med viss reasoning och lång kontext.
- **Andra assistenter.** ChatGPT hade 56,6 % av webbesöken bland sju assistenter i oktober 2026, vilket ger 1,77. Den siffran missar appar, Meta AI inuti Metas appar och inhemska kinesiska assistenter.
- **Topp.** Beräknad i timvisa intervall från en veckas LLM-konversationstrace från Azure under 2024, vilket är API-trafik från företag. Det höga värdet är ett antagande.

| Scenario | Medel | Topp | Snitt som andel av datacenterelen 2025 |
|---|---|---|---|
| Lågt | 50 MW | 82 MW | 0,09 % |
| Centralt | 140 MW | 233 MW | 0,25 % |
| Mitt höga scenario | 1 238 MW | 2 475 MW | 2,2 % |

![Dra i reglagen för att se megawatten](/figures/chat-power-calculator)

Siffran för datacenter är IEA:s 485 TWh för 2025, vilket motsvarar ungefär 55 GW i genomsnitt ([IEA](https://iea.org/reports/key-questions-on-energy-and-ai/executive-summary)). [Skriptet](/assets/blog/consumer-chat-demand.py) är runt 55 rader ren Python, så du kan stoppa in dina egna siffror.

Energi per meddelande är den parameter jag litar minst på, och det är den som påverkar resultatet mest. Tredjepartsmodellering uppskattar en medellång GPT-5-prompt till 2,33 Wh med minimal reasoning och 17,15 Wh med hög reasoning ([Jegham et al.](https://arxiv.org/abs/2505.09598)). Låt alla andra parametrar ligga kvar på centralvärdet så ger det runt 1 GW respektive 7 GW i snitt. Så om det genomsnittliga chattmeddelandet liknar en reasoning-prompt är konsumentchatt redan en belastning i gigawattskala.

## Ett grovt golv från Googles tokens

I maj 2026 uppgav Google att de hanterar över 3,2 biljarder tokens i månaden "across our surfaces" ([Google](https://blog.google/innovation-and-ai/sundar-pichai-io-2026/)). De definierar inte räkningen, som omfattar AI-funktioner i Search, Workspace och API:et såväl som Gemini-appen. Det motsvarar ungefär 1,2 miljarder tokens per sekund.

DeepSeek har publicerat sin produktionsgenomströmning: cirka 73 700 input-tokens per sekund per H800-nod med 8 GPU:er under prefill, eller cirka 14 800 output-tokens per sekund under decode ([DeepSeek](https://github.com/deepseek-ai/open-infra-index/blob/main/202502OpenSourceWeek/day_6_one_more_thing_deepseekV3R1_inference_system_overview.md)). Räknar man med Epochs 1,5 kW per GPU inklusive overhead landar Googles tokenflöde på cirka 240–360 MW i snitt om 80–95 % av alla tokens är input. DeepSeeks egen mix var 78 % input, vilket ger 370 MW. Vid 50 % input blir det runt 590 MW.

Jag skulle se det här som ett golv. DeepSeeks siffror är ett bästa tänkbara scenario: en hårt optimerad modell med stor batchstorlek, 56 % av alla input-tokens serverade från cache och en maskinpark som flyttar sysslolösa noder till träning nattetid. Dessutom mäter det något annat än chattuppskattningen, eftersom det täcker alla Googles ytor inklusive företagskunder. Men vad det faktiskt visar är att även Googles totala tokenflöde, kört med DeepSeeks effektivitet, landar på hundratals megawatt.

## Tillväxt

ChatGPT-meddelanden femdubblades mellan juli 2024 och juli 2025. Mitt centrala scenario antar en tillväxt på ungefär 1,9 gånger sedan juli 2025. I fjolårets takt skulle snittet passera 700 MW inom ett år. I motsatt riktning uppger Google att energiåtgången för deras mediantextprompt minskade med en faktor 33 mellan maj 2024 och maj 2025. Vilken av de två krafterna som vinner avgör om konsumentchatt stannar på hundratals megawatt.

## Finland behöver en halv megawatt

Sett till sin andel av användarna behöver Finlands konsumentchatt ungefär **0,55 MW** vid belastningstoppen i det centrala scenariot, och upp till runt 18 MW i det höga. Effektmässigt räcker det med en anläggning på 1–5 MW i en stad. Tyskland behöver runt 6 MW. USA behöver cirka 24 MW, eller runt 71 MW om man räknar på besök på chatgpt.com, där USA står för ungefär 22 % av trafiken mot 7 % av användarna. Att drifta 15 % av världens konsumentchatt, vilket är Europas andel av den globala datacenterelen, skulle kräva runt 35 MW. Det är mindre än 5 % av vad Irlands datacenter redan drar.

Effekt är dock inte hela historien. En anläggning som betjänar varje finsk användare skulle behöva hosta alla leverantörers modeller, och varje modell kräver sin egen serveringspool. Flera små pooler på en och samma plats skulle var och en gå delvis på tomgång.

Det här slår åt båda hållen för argumentet jag började med. Konsumentchatt behöver inte jättecampus. Men att flytta ut den därifrån avlastar knappt elnätet heller, eftersom det är en så liten last från början. Argumenten för att köra den från små stadsanläggningar måste alltså bygga på något annat.

## Varför ens städer?

Jag skriver på en artikel som jämför ett campus på 100–300 MW med en stadsanläggning på 1–5 MW, utifrån finska prislistor och regler. Så här ser den tidiga bilden ut.

### Byggnaden spelar mindre roll än nyttjandegraden

I Epochs modell för ett amerikanskt campus på 1 GW står servrar och nätverk för runt 73 % av den totala ägandekostnaden och själva anläggningen för cirka 16 % ([Epoch AI](https://epoch.ai/data-insights/ai-datacenter-cost-breakdown)). En mindre anläggning som kostar 50 % mer per MW att bygga ökar alltså kostnaden per token med ungefär 8 %. De där 50 procenten är i överkant av mitt antagna intervall, eftersom ingen publicerar den verkliga siffran.

Haken är nyttjandegraden. En nationell maskinpark kan inte samla efterfrågan över tidszoner. Finlands uppmätta toppfaktor är cirka 2,33, jämfört med 1,66 för globalt samlad chatt, så en maskinpark dimensionerad för sin topp körs på i snitt runt 43 % i stället för 60 %. Det är det glappet som små anläggningar måste ta igen, och det spelar större roll än själva byggnaden.

### Små anläggningar kan få el snabbare

Finsk lag sätter en rimlig anslutningstid på 6 månader från påskrivet avtal för distributionsnätet, och 24 månader för högspänning ([Finlex](https://www.finlex.fi/fi/lainsaadanto/2013/588)). Jag kunde inte hitta några faktiska tider publicerade för laster på 1–5 MVA.

Elnäten i städerna är också ansträngda. Esbos elnätsbolag uppger att deras egna nya ledningar tar 6–8 år, och 30 av deras 35 huvudtransformatorer är fulla när man räknar in reservkapacitet.

### Befintliga byggnader tar ingen ny mark i anspråk

Finska campus tar 0,07–0,22 hektar mark i anspråk per MW IT-last, utifrån de fyra projekt som har publicerade siffror. En anläggning i en befintlig byggnad tar ingen.

Googles anläggning i Muhos, en av de finska platserna jag [skrev om i september](/blog/googles-13-billion-in-finland), fick runt 330 hektar avverkat eller förberett innan miljökonsekvensbeskrivningen var klar. I oktober uppmanade Tillstånds- och tillsynsverket företaget att pausa förberedelserna tills bedömningarna är klara, vilket företaget också gjorde ([LVV](https://www.sttinfo.fi/tiedote/72390663/lupa-ja-valvontavirasto-kehottaa-tuike-finland-oyta-keskeyttamaan-muhoksen-ja-kajaanin-datakeskushankkeiden-valmistelutoimet)).

### Vad som inte hjälper

- **Latens.** Helsingfors till Stockholm tar cirka 7 ms tur och retur, och MLPerfs gräns för time-to-first-token är 450 ms.
- **Resiliens.** När kablarna i Östersjön kapades blev ungefär en fjärdedel av de omdirigerade rutterna mellan Finland och Tyskland mer än 3 ms långsammare, utan någon extra paketförlust.
- **Koldioxid.** Finsk fjärrvärme har redan låga utsläpp, så att sälja servervärme dit sparar inte mycket.

## Reglerna avgör utanför Finland

En anläggning räknas som en "stor last" vid allt från 1 MVA i Irland till 50 MW i PJM och 75 MW i Texas. Ovanför den gränsen möts man av någon kombination av köer, avgifter, säkerhetskrav, egen elproduktion eller rent avslag, beroende på land. Irland och Danmark har redan regler mot att dela upp en operatörs last i flera små anslutningar, och PJM räknar närstående anläggningar från samma operatör inom en engelsk mil som en enda last. Fingrid har bett om att finska anslutningar ska bedömas per projekt eller område som helhet, vilket skulle kunna få samma effekt. Där sådana regler gäller kan en uppsättning små anläggningar behandlas som en enda stor last.

## Vad som kan vara fel

- **Energi per meddelande är mestadels siffror från leverantörerna själva.** Googles 0,24 Wh är en median för textprompter på deras egna TPU:er och har inte verifierats oberoende. En median underskattar medelvärdet när fördelningen är skev, så det låga scenariot är sannolikt för lågt. Altmans 0,34 Wh anges utan någon metod.
- **Det täcker bara chatt.** Agenter, kodverktyg, bild- och videogenerering samt AI-funktionerna inbyggda i sök och sociala flöden är inte medräknade. De kan redan vara större än chatten.
- **Inhemska kinesiska assistenter saknas i underlaget.** Ingen av källorna jag använde täcker dem.
- **Veckovisa aktiva användare räknar konton, inte människor.** Det tar ut sig självt i den globala totalsumman, som använder meddelanden per konto, men det kan snedvrida ländernas andelar.
- **Finlands toppfaktor kommer från ett litet urval** på runt 500 finska användare i ett offentligt chattdataset.

## Vad som skulle hjälpa

Om du har bättre siffror tar jag gärna emot dem. Det som skulle påverka artikelns modell mest är tomgångseffekten för ett serverrack vid inferens, byggkostnad per MW för vätskekylda anläggningar på 1–5 MW, faktisk nyttjandegrad i verkliga maskinparker för inferens samt faktiska anslutningstider för laster på 1–5 MVA var som helst.

Artikeln kommer att publiceras på Zenodo med den fullständiga kostnadsmodellen, källor och data.
