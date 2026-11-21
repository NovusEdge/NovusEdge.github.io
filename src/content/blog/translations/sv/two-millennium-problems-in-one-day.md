---
title: "Två millennieproblem på en dag (förmodligen)"
date: 2026-11-21
tags: [ai, math, lean, commentary]
description: "Den 20 november dök det upp AI-assisterade bevis för både Riemannhypotesen och Navier–Stokes-blowup, tre veckor efter att två labb oberoende av varandra knäckte Exponential Time Hypothesis. En titt på de senaste månadernas AI-matematik, och vad som faktiskt har kontrollerats."
toc: true
pixel: thinking
---

## Fredag

Terry Tao lade upp ett [blogginlägg](https://terrytao.wordpress.com/2026/11/20/unforced-euler-singularity-unforced-navier-stokes-singularity-and-the-generalized-riemann-hypothesis/) den 20 november med en rubrik som mest liknar en lista över saker som inte borde hända under min livstid: "Unforced Euler singularity, unforced Navier-Stokes singularity, and the Generalized Riemann Hypothesis". Alla tre kom samma dag, alla tre togs fram med tung AI-användning, och ett namn finns med på alla tre: Levent Alpöge, en talteoretiker på Anthropic.

Två av dem är Clay Millennium Prize-problem. Det finns sju stycken, prissumman för varje är en miljon dollar, och på 26 år har exakt ett lösts (Perelman, Poincaré, tackade nej till pengarna). Nu kan det finnas tre, och två av dem dök upp med bara några timmars mellanrum.

Inget av det är bekräftat än, och jag återkommer till vad "bekräftat" betyder i det här sammanhanget. Men det kom inte heller från ingenstans. De senaste månaderna har byggt upp mot detta, och det är värt att gå igenom hela förloppet.

## Hur vi hamnade här

Det här är den korta versionen. Det mesta kommer från Wikipedias [lista över AI-matematikupptäckter](https://en.wikipedia.org/wiki/List_of_mathematical_discoveries_made_with_artificial_intelligence), som numera har ett nästan pinsamt stort antal poster från 2026.

{{timeline}}

Blått har kontrollerats av människor eller Lean, gult väntar på granskning och rött betyder ifrågasatt eller delvis tillbakadraget. Ehrhart-resultatet täcker bara den övre gränsen, och likhetsfallet är fortfarande öppet. Ungefär hälften av artiklarna från oktober kom med Lean-kod, och tre drogs tillbaka inom ett dygn.

Den från den 6 oktober förtjänar ett eget inlägg. OpenAI släppte 722 manuskript över ett par hundra ämnen från en och samma icke släppta modell. Alpöge kallade det "uppenbarligen det mest betydelsefulla ögonblicket i matematikens historia", Sarnak sade att han inte tänkte kalla något av det för en sats förrän människor hade granskat det, och en del av Lean-koden visade sig bevisa svagare påståenden än vad artiklarna hävdade. Sex veckor senare är "det mest betydelsefulla ögonblicket" kanske redan på tredje plats.

## ETH

Exponential Time Hypothesis säger grovt räknat att 3-SAT inte kan lösas märkbart snabbare än brute force. Har man n variabler behöver man ungefär 2^(cn) tid. Hypotesen är inte lika känd som P vs NP, men en stor del av komplexitetsteorin vilar på den, eftersom "under antagande om ETH kräver detta problem minst X tid" är hur man bevisar massor av undre gränser.

{{eth_figure}}

Den 16 oktober fann två labb samma dag att hypotesen var falsk. OpenAI:s text bär titeln "The Exponential Time Hypothesis Is False" och förklarar att "vårt system nyligen har bevisat att ETH är falsk", med ett [Lean-bevis](https://openai.com/index/building-scientific-understanding-with-academic-communities/) klart dagen därpå. Anthropics artikel, "A 2^o(n) Time Algorithm for 3-SAT", kom ut ungefär samtidigt, beskriver de två resultaten som "oberoende och samtida", och uppger att ["Claude hittade kärnalgoritmen helt utan mänsklig inblandning"](https://www.datacamp.com/blog/ai-exponential-time-hypothesis). Anthropic hävdar dessutom att den sänker Strong ETH.

Russell Impagliazzo, en av dem som faktiskt *formulerade* ETH, kallade det "djupt överraskande". Han leder nu gruppen som granskar beviset tillsammans med Ramamohan Paturi och Ryan Williams. Williams sade att det mesta ser rutinmässigt ut, bortsett från några få bitar:

> “Two or three alien-looking parts.”
>
> — Ryan Williams, on the ETH proof

"Alien-looking" är det mest 2026-mässiga en komplexitetsteoretiker någonsin har sagt om ett bevis.

För att vara tydlig med omfattningen: detta är inte P = NP, och hastighetsökningen spelar enligt uppgift bara roll i praktiken för formler med miljontals variabler. Men att två separata AI-system hittar samma sak under samma vecka är ett bevis i sig. Det är precis det slags överlappning man kan förvänta sig om idén låg precis framför näsan på oss och modellerna till slut blev tillräckligt starka för att se den.

## Navier–Stokes

Millennieproblemet för Navier–Stokes frågar om glatta begynnelsevillkor för en 3D-fluid alltid förblir glatta, eller om lösningen kan få en blowup på ändlig tid. Att bevisa vilket som ger vinst.

{{ns_figure}}

I september hävdade OpenAI blowup, men för en *forced* version, vilket innebär att det finns en yttre kraft som påverkar fluiden. Scientific American kallade kraften "orealistisk, finjusterad", och det är inte den versionen Clay frågar efter. Det hela ledde också till bråk. Tristan Buckmaster, som hade arbetat på samma problem med Alpöge, uppger att OpenAI:s första prompt skickades [dagar efter att information om deras arbete nådde företaget](https://www.unite.ai/buckmaster-and-alpoge-post-ai-fluid-blowup-proofs-dispute-openai-contact/). När han under ett samtal frågade om modellen hade tränats på deras Codex-sessioner säger han: "Jag fick inget svar." Enligt honom försökte OpenAI dessutom två gånger stryka Alpöge från författarlistan för att han jobbar på Anthropic. OpenAI förnekar alla oegentligheter, och allt detta kommer från Buckmasters håll, men det är minst sagt en laddad bakgrund.

Den 20:e lade Alpöge och Buckmaster upp sitt eget resultat: blowup på ändlig tid för de *unforced* 3D-ekvationerna, den äkta varianten, i form av en 79-sidig artikel plus [Lean](https://github.com/tristanbuckmaster/navier-stokes/). Tao menar att strategin "i stora drag är tydlig": en numerisk, approximativt självlikformig lösning plus rigorös störningsteori kring den. Han påpekar också att "mer arbete krävs för att skapa ett ordentligt, professionellt skrivet bevis." Två praktiska luckor kvarstår. Det numeriska certifikat som beviset bygger på är inte släppt än, bara dess hash. Och i själva README-filen står det att "the patched package was not rebuilt when this repository was assembled", så Lean-bygget är inte bekräftat.

## Riemannhypotesen

{{rh_figure}}

Det här är den alla skriver om. Alpöge lade upp en fyrsidig PDF med titeln [Remark](https://alpo.ge/remark.pdf) på sin hemsida:

> I believe I have, working with Claude, discovered a proof of the Riemann Hypothesis. In fact, the method easily extends much further, resolving the so-called Generalized Riemann Hypothesis, and I expect, with more time, the Extended Riemann Hypothesis too.

Beviset utgörs av en fotnot som länkar till fjorton tarball-delar, totalt 239 MB och runt 175 000 Lean-filer. Det finns ingen artikel. Han skriver att en version läsbar för människor vore "rutinarbete att producera", och i en annan fotnot att han faktiskt tog fram en sådan, som "landade på över 250 000 sidor". När han slog upp Claudes "bok" på Sats 1 inleddes den med att konstatera att eftersom de reella talen är linjärt ordnade gäller att om σ ≠ ½ så är σ > ½ eller σ < ½. Han kom fram till att publiceringen skulle bli "en massiv oläsbar travesti av 'slop'" och släppte bara Lean-koden.

{{proof_scale}}

Anteckningen är också det mest exalterade jag någonsin sett en matematiker uttrycka sig i text. Han berättar att han planerat för det här problemet sedan studietiden, styrt in arbetet i rätt ramverk, och sedan:

> “Claude far outpaced me near the finish line. No, Claude flew, and danced, and sparkled near that finish line.”
>
> — Levent Alpöge, Remark

Hans enda konkreta exempel är idén att kedjekoppla thetaliftningar för att efterlikna "multiplicitetstricket" från Stepanovs bevis av Riemannhypotesen över funktionskroppar. För en primtalssumma av längd X föreslog Claude en kedja av längd √X. "(Och ändå, vad annars skulle det kunna vara?)" Han medger att han "har dålig koll på automorfa former på grupper av högre rang", vilket är där en stor del av resonemanget håller till. Den 20 steg långa tidslinjen på sida 3 är en Claude-sammanfattning som han varnar "kanske är helt obegriplig". Den löper från den 6 oktober fram till ett sista steg den 16 november där det bara står "GRH".

Det finns också en fin detalj om samarbete mellan labben där. Han ger OpenAI beröm för "god smak" när det gäller problem. Det var när han löste likhetsfallet i deras Ehrhart-resultat som han "omedelbart förstod att Navier-Stokes skulle falla". Han kände också igen deras Siegel-argument som "Stepanov utan multiplicitet", vilket är precis den lucka som thetaliftningarna fyller. Så AI-racet inom matematiken är inte en ren kamp mellan labb. Folk läser varandras modelloutput och bygger vidare på den.

## Är det på riktigt

I skrivande stund ser det lovande ut. Bevisets toppnivåsats i Lean är formulerad mot Mathlibs egen definition av `RiemannHypothesis`, tillsammans med GRH för Dirichlets L-funktioner, enligt den [oberoende spegel](https://github.com/Deicyde/riemann-hypothesis) som satts upp för att kontrollera det. Andrew Sutherland vid MIT kompilerade det själv och sade till Scientific American att ["ärligt talat är chansen att något är skumt här i princip noll"](https://www.scientificamerican.com/article/the-ai-riemann-hypothesis-proof-is-almost-certainly-true-independent-mathematicians-attest/). Kevin Buzzards kommentar var "vi väntar fortfarande på en lyckad körning av Comparator."

{{lean_statement}}

Buzzards förbehåll är det som verkligen spelar roll. Comparator kontrollerar beviset mot separat skrivna satspåståenden och listar alla axiom det använder. Lean kan kompilera en fil som i det tysta förutsätter det den försöker bevisa, så länge antagandet deklareras. En ren körning innebär att enbart Leans tre standardaxiom används, vilket gör en definitionsbugg i Mathlib eller en bugg i Lean-kärnan till de enda kryphålen. Båda är ytterst osannolika för en sats som granskats så noga.

Om Comparator ger grönt ljus hamnar vi i en märklig sits. Riemannhypotesen vore då en sats, och det enda fullständiga beviset vore ett som ingen människa har läst och som ingen människa kanske ens kan läsa. Clays prisregler kräver en referentgranskad publicering och två års allmänt erkännande, och ingen formulerade de reglerna med en 239 MB stor tarball i åtanke.

## Vart det här är på väg (spekulation)

Allt ovanstående är vad som har hävdats och kontrollerats. Det här avsnittet är mina egna gissningar, så ta det för vad det är.

**Mönstret.** Rada upp resultaten och samma mönster återkommer hela tiden. En människa väljer problemet och styr mot rätt ramverk, och sedan gör modellen det tekniska grovjobbet inom precis det område människan kan minst om. Alpöge säger detta rakt ut om automorfa former på grupper av högre rang. Resultatet är för stort för att läsas: 175 000 Lean-filer för RH, runt 2 270 filer och 600 000 rader för Navier–Stokes, och en 250 000 sidor lång "bok" som ingen kommer att öppna. Så det slutar med att Lean sköter fackgranskningen. Och när två labb landar i samma ETH-algoritm på samma dag ser det mindre ut som genialitet och mer som att en förmågetröskel har passerats. Idéerna låg bara där och väntade på något som var starkt nog att nå dem.

**Takten.** I juli var det ett motexempel till en förmodan. I november var det två millennieproblem. Det är fem månader. Jag tänker inte extrapolera en kurva från nio datapunkter, men det finns fyra millennieproblem kvar (P vs NP, Hodge, Yang–Mills och Birch–Swinnerton-Dyer), och jag skulle bli mindre förvånad nu än för ett år sedan om ytterligare ett påstås vara löst under 2027.

**Vad som förändras om det håller.**

- Varje "under antagande om GRH" i litteraturen förvandlas till en ren sats. Läroboksexemplet är Millers primalitetstest, som har varit deterministiskt och i polynomiell tid *om* GRH gäller ända sedan 70-talet.
- Den svåra biten med att granska ett bevis flyttas från beviset till påståendet. När Lean väl godkänner ett bevis återstår frågan om satsen som bevisas faktiskt är den vi avsåg. Att läsa 30 rader definitioner väldigt noggrant blir den nya fackgranskningen.
- Förståelsen börjar släpa efter sanningen. Vi kan få leva i åratal med vetskapen om att RH stämmer innan någon kan förklara varför på ett sätt som ryms i ett mänskligt huvud, och Alpöges "korta argument följer" är en vadslagning om att den klyftan sluts snabbt.
- Vem som ska ha äran blir rörigt. Buckmaster-konflikten är en försmak: vems idé var det, vems modell, vems data. Clays regler, granskningsnormer och författarkonventioner skrevs alla för en värld där författaren kunde förklara beviset.
- Vad en matematiker gör skiftar mot att välja problem, bedöma fingertoppskänsla och bygga förståelse. Alpöges anteckning fortsätter att berömma "god smak", från båda labben. Det kanske är det som är jobbet nu.

Inget av detta kräver att RH-beviset klarar Comparator. Även om det faller samman finns ETH, zeta-nollställeresultatet och juliresultaten fortfarande kvar, och mönstret syntes redan före fredagen.

## Vad som händer härnäst

- Domen från Comparator gällande RH, och ett andra oberoende bygge.
- Släppet av Navier–Stokes-certifikatet och ett rent ombygge i Lean.
- Domen från Impagliazzo–Paturi–Williams gällande ETH.
- Alpöges utlovade ordentliga rapport, och det kortare bevis han förväntar sig ska följa "ganska snart".

Alpöges anteckning avslutas med: "In a time of revolution in mathematics I hope the argument provides a glimpse towards the miracles that lie ahead." För ett år sedan hade det låtit som en virrpannas avslutning, men nu framstår det som en rimlig prognos.
