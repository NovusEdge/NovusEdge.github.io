---
title: "Vad missade vi alla?"
date: 2026-09-12
tags: [ai, epistemics, robotics, industry, essay]
description: "De gjorde det grabbar, det är jover hörni ToT"
draft: false
toc: true
---

## Skämtet för en miljon dollar

När OpenAI presenterade en lösning på [Millennieproblemet Navier-Stokes](https://www.claymath.org/millennium/navier-stokes-equation/) handlade mycket av diskussionen jag såg om att [bränna ungefär tjugotvå miljoner dollar på beräkningskraft](https://techcrunch.com/2026/09/08/openai-fought-dirty-on-career-making-math-problem-says-nyu-mathematician/) för ett pris på en miljon dollar. Rimligt nog, det är en rolig jämförelse. Jag var mer intresserad av hur arbetet faktiskt gjordes.

Runt tiotusen samordnade agenter ska enligt uppgift ha tagit fram ett bevis och en formalisering i Lean. OpenAI tackade nej till prispengarna. Ett maskinverifierat bevis på den nivån vore ett rejält forskningsresultat, även innan någon hittat en praktisk användning för det.

Det påstådda resultatet är en singularitet i ändlig tid: glatta lösningar kan kollapsa. Det ger oss ingen ny metod för att bygga raketer eller modellera turbulens. Det jag vill förstå är hur agenterna utförde matematiken, och hur mycket av den processen som går att överföra till andra problem.

## Vems definition

Den 6 september [förklarade Jensen Huang att AGI har anlänt](https://www.forbes.com/sites/timbajarin/2026/09/08/jensen-huangs-agi-claim-is-a-business-case-not-settled-fact/) och gav äran till [GPT-6 Astra](https://openai.com/index/gpt-6-astra/), tränad på fler än 100 000 Nvidia Grace Blackwell-GPU:er. Två dagar senare släpptes beviset. Redan i mars sa han till Lex Fridman [”I think we've achieved AGI”](https://www.forbes.com/sites/antoniopequenoiv/2026/03/23/nvidias-jensen-huang-says-he-thinks-weve-achieved-agi/) under en diskussion om huruvida AI skulle kunna bygga och driva ett miljardföretag. På rapportkonferensen i augusti var påståendet snävare: för många uppgifter skulle vi kunna säga att vi har uppnått AGI.

Sam Altmans uttalanden har också varit svåra att få ihop: att nuvarande system uppfyller OpenAI:s definition, men att han ändå förväntar sig ett internt system som han personligen skulle kalla AGI senare i år.

Jag tycker det här är utmattande. Någon läser en sådan rubrik, ber appen göra sitt jobb och ser den misslyckas med något som en kompetent kollega skulle klara av. En definition vald för en intervju hjälper dem inte att förstå vad systemet faktiskt kan göra.

Och ja, att Huang tillskriver AGI hundratusen av sina egna GPU:er är ganska kul.

## Alla är trötta

AI finns i produktlanseringar, annonser, LinkedIn-inlägg, nyhetsinslag och verktyg jag redan använde som sedan dess har fått en glitterikon. Det är fan överallt. Jag vill fortfarande läsa om det, men vänner utanför techbranschen vill ofta att samtalet ska ta slut innan det ens har börjat.

En del av detta påminner om [tendensen att bilda motstridiga läger](https://www.researchgate.net/publication/333673884_Tribalism_Is_Human_Nature): allt är en bubbla, allt är slop, eller så är vi på väg att skapa en gud. Men hos vänner som pluggar ekonomi eller jobbar inom andra områden märker jag mest trötthet. De har hört för många påståenden och vill inte ha ytterligare en sak att ta ställning till.

Det är en observation om folk jag känner. Jag delar inte den känslan särskilt ofta; oftast slutar jag läsa för att jag är fysiskt trött. Så jag tycker inte att jag har rätt att läxa upp dem om att hänga med mer.

## Två sorters företag

Thiels ramverk om ”0 → 1” är ungefär hur jag ser på det här: vissa företag skapar något som inte var möjligt tidigare, medan andra säljer tillgång till något som redan är byggt.

Att återförsälja något användbart är helt okej. Det som stör mig är en prenumeration paketerad runt en prompt som marknadsförs som ett tekniskt genombrott. När det blir tillräckligt många sådana tillkännagivanden blir det svårare att ta nästa på allvar.

Jag är mer oroad över produkter som fungerar bra och gör skada: övervakningsverktyg, till exempel, eller militära tillämpningar vars civila användning får all uppmärksamhet i broschyren. Min invändning där handlar om vad folk bygger och vem som får använda det.

## Robotarna

Robotik är ett område jag önskar att jag hörde mer om.

[AMI Labs](https://techcrunch.com/2026/03/09/yann-lecuns-ami-labs-raises-1-03-billion-to-build-world-models/) tog in 1,03 miljarder dollar i en såddrunda, med Yann LeCun som ordförande, för att arbeta med världsmodeller enligt JEPA-ansatsen. [Generalist AI](https://techcrunch.com/2026/08/25/robotics-startup-generalist-reaches-3b-valuation-sources-say/) tog in 400 miljoner dollar i juni och diskuterade enligt uppgift en värdering på 3 miljarder dollar i augusti. Deras [GEN-1.5-modell](https://generalistai.com/blog/gen-1.5) visas [lära sig en fysisk uppgift från en enda demonstration](https://youtu.be/1cllCVK-9lo), utan gradientuppdateringar eller finjustering.

De företagen har uppenbarligen tillgång till kapital. Ändå hör jag mycket mindre om deras arbete än om nästa språkmodellsläpp. Det speglar kanske delvis vad jag följer. Robotik är svårare för mig att utvärdera, och att hänga med i ens en del av det här fältet tar tid.

Om robotar blir mycket lättare att lära upp vill jag veta hur vi ska hantera förändringarna av fysiskt arbete. Borde vissa jobb förbli reserverade för människor, inklusive terapi, medicin eller vissa hantverksyrken? Jag har inte landat i något svar. Frågan handlar om inkomst, ansvar och vad folk vill ha av personen som utför arbetet, såväl som om en maskin faktiskt klarar av det.

## Halva internet

[Impervas rapport från 2026](https://www.imperva.com/blog/bad-bot-report-2026-bots-agentic-age/) uppskattar automatiserad trafik till över 53 % av webbtrafiken den mäter, där skadliga bottar står för 40 % av totalen och AI-drivna botattacker har ökat 12,5 gånger på årsbasis. Det är trafikmätningar. De säger inget om hur stor andel av inläggen eller konversationerna som är genererade.

Det finns separata belägg för hur övertygande genererade konversationer kan vara. I [Jones och Bergens Turingtest-studie](https://arxiv.org/abs/2503.23674) pratade deltagarna med en människa och en modell i fem minuter och valde sedan vem som var människa. GPT-4.5, med en prompt för en människolik persona, valdes 73 % av gångerna. LLaMA-3.1 nådde 56 %; baslinjerna ELIZA och GPT-4o nådde 23 % och 21 %.

Ibland tror jag att jag känner igen genererad text. Jag skulle inte vilja förlita mig på det omdömet, särskilt inte när jag är trött eller läser något utanför mitt område.

## Lek med det

Jag gillar fortfarande att testa saker utan att veta om det leder någonvart. Bygg någon löjlig mjukvara för att irritera din universitetsprofessor, eller följ en dum idé tillräckligt långt för att se vad som händer. Det behöver inte bli ett företag.

Jag har märkt att duktiga personer inom tech undviker att ens försöka eftersom de inte ser ett nyttigt resultat i förväg. Jag undrar om pressen att ta ställning till varje teknik bidrar till det. Kortformat på sociala medier kanske också spelar in, men jag gissar bara.

Jag vill ha utrymme att vara intresserad av tekniken samtidigt som jag har invändningar mot hur den säljs och används. Jag kan ogilla en övervakningsprodukt, eller ett AGI-påstående som nästan inte säger någonting, och ändå vilja förstå en ny modell eller ett nytt experiment.

## Var jag står

Forskningen intresserar mig tillräckligt för att fortsätta läsa. Marknadsföringen gör det svårare, och vänner som inte jobbar inom tech har betydligt mindre anledning att stå ut med den.

Jag skulle vilja att mer av diskussionen handlade om att testa konkreta saker och mindre om huruvida all AI är bra eller dålig. Robotik är ett av ämnena jag skulle vilja att den inkluderade.

~ A.
