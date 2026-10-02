---
title: "Om att bygga något... Engrammic"
date: 2026-05-06
tags: [ai-memory, epistemics, engrammic, agents, founder-log]
description: "Upprepade inaktuella påståenden i en AI-pipeline fick mig att börja jobba på agentminne som sparar bevis, spårar revideringar och hanterar motstridiga observationer."
---

I december förra året byggde jag en pipeline för AI-SEO. Vi hade en omfattande "LLM-wiki" i en `context/`-katalog: strukturerad arkitekturdokumentation, ett funktionsindex som agenten kunde `grep`a, hela faderullan. All heder åt det, det _var_ ett trevligt system tills... kontextförorening slog till. Agenter började minnas inaktuell info som vi hade uppdaterat *under samma session*. Nya agenter som spawnades med fräsch kontext började genast spy ur sig samma förlegade nonsens. Mitt kontextfönster fylldes dubbelt så snabbt av att agenten läste om filer den redan sett, i ett försök att jämka ihop motsägelser som inte borde ha funnits där. Samtidigt satt jag själv konstant frustrerad och svor åt agenten, bara för att få det förutseende svaret: "*You're absolutely right!*" (helvete vad jag hatar den frasen mer än allt annat).

Den hämtade kontexten innehöll saker som agenten hade hittat på. Vårt system skilde inte på observerade fakta och gissningar eller påhitt, så nästa agent kunde använda alltsammans som bevis.

Jag hade lagt massor av energi på hämtning (retrieval): att hitta relevanta textstycken och få in dem i kontextfönstret. Jag hade inte gett systemet något sätt att kontrollera om ett hämtat påstående hade stöd eller fortfarande var aktuellt. Det blev minnesproblemet jag ville ta mig an.

Det här är vad branschen kallar context rot.

Med [RAG](https://en.wikipedia.org/wiki/Retrieval-augmented_generation) hjälper likhet till att hitta relevant text. Det avgör inte om texten faktiskt stämmer. Ett ogrundat påstående som sparades för sex veckor sedan kan fortfarande vara en bra matchning för dagens fråga.

Produkter som `Mem0` och `Zep` hanterar minne över sessioner, men enbart persistens löser inte motstridiga anteckningar. Om en agent sparar "använder OAuth" på måndagen och "använder API-nycklar" på tisdagen måste jag veta om systemet ändrades, om påståendena gäller olika komponenter eller om ett av dem var felaktigt. Tidsstämplar hjälper, men det nyaste påståendet har inte nödvändigtvis bäst stöd. Jag vill behålla bevisen för varje påstående och spara hur en konflikt löstes.

En agent kan använda ett sökresultat för att fatta ett beslut och sedan använda det beslutet som kontext för ett senare. Jag vill kunna spåra de beroendena. Om en observation visar sig vara felaktig borde vi kunna hitta de slutsatser som byggde på den.

Forskarvärlden börjar inse detta. Det finns ett [paper från Google DeepMind](https://arxiv.org/abs/2603.02960) i år som pratar om "epistemic drift", hur felkalibrerade AI-system i själva verket försämrar mänskligt omdöme över tid genom att självsäkert leverera opålitlig information. Det finns [forskning om "belief deviation"](https://arxiv.org/abs/2510.12264) vid resonemang över flera turer som visar att man kan få 30 procents prestandaförbättringar bara genom att upptäcka när en agents interna tillstånd har glidit för långt ifrån koherens. Flera grupper närmar sig oberoende av varandra formella modeller för trosrevidering (belief revision), eftersom den informella metoden att bara spara grejer och hämta dem bevisligen inte skalar.

Det komiska är att biologin kom på det här för evigheter sedan. Du har [hippocampus](https://en.wikipedia.org/wiki/Hippocampus) som gör en snabb, gles kodning av specifika episoder och neocortex som långsamt konsoliderar generaliserad kunskap, och hela systemet kör en nattlig process för att bestämma vad som ska befordras från "sak som hände" till "sak jag vet". [Sharp-wave ripples](https://en.wikipedia.org/wiki/Sharp_waves_and_ripples) under sömnen, explicita mekanismer för glömska.

Det som intresserar mig med den jämförelsen är selektiv kvarhållning: vad som behålls, vad som revideras och vad som glöms bort. Det är de frågorna jag vill applicera på agentminne.

**!! Varning för nördig infodump :3 !!**

Det har dock rört sig i rätt riktning. [HippoRAG](https://arxiv.org/abs/2405.14831) modellerar explicit hippocampus-indexeringsteorin med kunskapsgrafer och PageRank, och uppnår 20 % förbättring på flerstegs-QA genom att ta biologin på allvar. Det finns [forskning om överraskningsstyrt episodiskt minne (surprise-gated episodic memory)](https://arxiv.org/abs/2606.03787) inom robotik där bara nya observationer sparas, vilket är precis den sorts relevansfiltrering som hjärnor ägnar sig åt.

[Zep](https://arxiv.org/abs/2501.13956) byggde temporala kunskapsgrafer med episodiska och semantiska lager. [Hindsight](https://arxiv.org/abs/2512.12818) går längre med fyra separata minnesnätverk och strategier för konflikthantering, men motsägelser *bevaras* fortfarande med tidsstämplar i stället för att *lösas* före lagring, och det finns [ingen konkret metod](https://hindsight.vectorize.io/blog/2026/05/21/agent-memory-consolidation) för att spåra exakt varför agenten sa vad den sa.

För Engrammic vill jag ha status för antaganden (belief status), konflikthantering vid skrivning och ursprung (provenance) som kan granskas tillsammans. Målet är att göra det möjligt att kontrollera om ett hämtat påstående fortfarande gäller och vilka andra påståenden som beror på det.

Med "belief" menar jag en tolkning som stöds av observationer. "Hon lämnade mig på read" är en observation. "Hon är arg på mig eftersom hon lämnade mig på read och det gör hon aldrig" är en tolkning, och den kan ändras när hon svarar. Jag vill att systemet ska upprätthålla den skillnaden.

För den här designen vill jag ha posterna utanför modellens vikter, där de kan inspekteras och redigeras. Forskning som uppskattar [ungefär 3,6 bitar per parameter](https://arxiv.org/abs/2505.24832) undersöker modellens lagringskapacitet, men kapacitet i sig ger oss inte en granskningsbar historik för varje påstående. Det är det kravet jag försöker uppfylla.

Att fråga en modell varför den gjorde ett påstående ger mig ingen oberoende verifierbar dokumentation över hur den kom fram till det. För det behöver jag sparade observationer och kopplingar som visar vilka slutsatser som använde dem. De kopplingarna måste dessutom överleva revideringar.

Vi kallar detta externaliserad epistemik (externalized epistemics). Namnet "Engrammic" kommer från engram, de hypotetiska fysiska minnesspåren i hjärnan. I mjukvaran är tanken att lagra påståenden tillsammans med deras bevis, status och relationer så att vi kan inspektera och revidera dem.

Konkret innebär det att när en agent försöker spara "hon messade tillbaka, allt är lugnt" och "hon är arg på mig" redan finns, lägger systemet inte bara till ytterligare en rad. Det flaggar en konflikt och tvingar en att reda ut den. Antingen ersätts den gamla övertygelsen med en explicit länk till det som ersatte den, eller så avvisas den nya observationen, eller så pausas båda i väntan på mänsklig input. Men det som *inte* händer är en tyst ackumulering av motsägelsefulla fakta som oundvikligen kommer att dyka upp igen och ställa till det.

Det innebär att varje antagande har ett spår: i stället för "modellen genererade det här" är det "det här kom från observationerna X, Y, Z, sparade vid tidpunkterna A, B, C, med en konfidensgrad som avtagit över tid". När ett företag frågar "varför sa er agent detta till vår kund?" kan man svara genom att stega igenom grafen, inte med en axelryckning. Det innebär att glömska är något verkligt som man faktiskt designar för. Gamla observationer klingar av, inaktuell kontext bleknar bort och systemet avgör aktivt vad som är viktigt nog att behålla. I stället för något slags "perfekt" minne är målet här ett gott *omdöme* gällande relevans.

Det kräver mer maskineri än att bara lagra och hämta text. Jag tycker att det är värt att pröva för agenter vars beslut beror på information som samlats över många sessioner.

Delat minne gör konflikthantering särskilt viktig. Om `agents 1 and 2` skriver motstridiga observationer, vad ska `agent 3` ta emot? Den behöver tillräckligt med kontext för att upptäcka oenigheten, och ett sätt att spara en lösning utan att förlora de ursprungliga bevisen.

Jag är också intresserad av hur detta kan tillämpas på världsmodeller och robotik, inklusive den externa minnesroll som diskuteras i LeCuns [JEPA](https://openreview.net/forum?id=BZ5a1r-kVsf)-arbete. För system som agerar utifrån sparade observationer vill jag ställa samma frågor om ursprung, motstridiga poster och revidering.

De tekniska rapporterna finns på [engrammic.ai/research](https://engrammic.ai/research), och kärnarkitekturen är öppen källkod. Om du jobbar med agentminne, trosrevidering (belief revision) eller samordning mellan agenter vill jag gärna utbyta tankar. Vi söker forskningssamarbeten; frågor och issues i repot är också välkomna.

För mig är testet problemet som startade alltihop: när en agent upprepar ett inaktuellt påstående, kan jag då hitta var det kom ifrån, korrigera det och hindra nästa agent från att upprepa det?

_Headerbild via [cosmos.so](https://www.cosmos.so/e/948956014)._
