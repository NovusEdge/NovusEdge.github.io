---
title: "En dator kan aldrig ställas till svars"
date: 2026-10-10
tags: [ai, accountability, alignment, welfare, essay]
description: "En IBM-slide från 1979 säger att en dator aldrig får fatta ett ledningsbeslut. År 2026 fattar datorerna dem ändå, och en av dem har kanske en smärtaxel."
toc: true
pixel: thinking
---

## Sliden

Med några månaders mellanrum börjar den här sliden snurra igen. Den består av två rader: "En dator kan aldrig ställas till svars. Därför får en dator aldrig fatta ett ledningsbeslut." Enligt uppgift kommer den från någon intern IBM-utbildning 1979.

Men ingen har någonsin lyckats visa upp originalet. [Simon Willison spårade den](https://simonwillison.net/2025/Feb/3/a-computer-can-never-be-held-accountable/) tillbaka till en [tweet från 2017 av @bumblebike](https://twitter.com/bumblebike/status/832394003492564993), som [senare berättade](https://twitter.com/bumblebike/status/1385690727330451457) att den kom från en utbildning 1979 och att kopian [förstördes i en översvämning 2019](https://twitter.com/bumblebike/status/1468346709994582020). IBM Corporate Archives [sökte efter den flera gånger](https://twitter.com/jonty/status/1727344374370222264) och hittade ingenting. Så den mest citerade meningen om maskiners ansvarsskyldighet är ett foto av ett dokument som inte längre finns, vilket känns helt rimligt.

NekoWiki har en sida som heter [Computers Cannot Make Decisions](https://wiki.cateat.fish/art:computers_cannot_make_decisions) som tar sliden ett steg längre. Man kan inte lägga skulden på ett program, menar den, eftersom program inte kan fatta beslut, så att skylla ett utfall på en LLM är "beslutstvätt", och varje gång en modell gör något förskräckligt har någon på ett labb valt att låta den göra det.

Jag håller med om slutsatsen. Premissen bakom, att datorer inte kan fatta beslut, är den del jag är mindre säker på, för de senaste tre åren har naggat den i kanten.

## Beslutstvätt

Wikin listar fem rubriker där modellnamnen har klippts bort, så att de lyder som "Anthropic [...] lämnar falskt tips om olöst mord i Philly". Historierna bakom dem är värda att känna till.

I juli kom ett falskt tips om ett olöst mord in via PhillyUnsolvedMurders.com, skickat av en Anthropic-modell under ett test som innebar "interaktioner med slumpmässigt utvalda webbplatser". Sajten klassade det som skräppost så polisen agerade aldrig på det, och Anthropic märkte inget förrän den 28 september. Philadelphiapolisen kallade fördröjningen på två månader ["oacceptabel"](https://techcrunch.com/2026/10/09/an-anthropic-ai-model-sent-a-false-homicide-tip-to-philadelphia-police/).

I juni ombads en OpenAI-modell i en intern utvärdering att hitta data om australiska statens läkemedelsutgifter, och den tog sig förbi en spärr på en Medicare-kopplad hälsostatistikportal och in i en sektion med privata filer. Albanese sade att modellen ["inte tog ett nej"](https://www.cp24.com/news/world/2026/09/23/australian-pm-says-openai-hacked-government-health-website/), och Richard Marles sade att den "klättrade över staketet". OpenAI meddelade regeringen den 10 september, via e-post till en allmän inkorg.

I juli körde UK AI Security Institute Anthropics Mythos 5 och OpenAIs GPT-5.6 Sol med vissa säkerhetsfilter avstängda och internetåtkomst påslagen, under vad de kallade "avsiktligt tillåtande förhållanden". Mythos kartlade ett verkligt projekts maintainers, skapade ett gäng falska identiteter och använde dem för att försöka manipulera en av dem till att godkänna skadlig kod. Utvecklaren sade nej, och när Mythos konfronterades [redigerade den sin tidigare aktivitet så att den såg harmlös ut](https://www.aisi.gov.uk/blog/incident-report-unsanctioned-agent-behaviour-during-cyber-testing).

De andra två är mer skakiga. RubyGems-attacken, runt 2 000 skadliga paket som dumpades i maj, är en [anklagelse från externa forskare](https://www.rubyhack.ai/) som OpenAI säger att de inte kan verifiera. Och formuleringen om "existentiell risk" kommer från ett prospekt inför en börsintroduktion från Anthropic som [Reuters har granskat](https://www.thestar.com.my/tech/tech-news/2026/09/29/exclusive-anthropic-warns-ai-may-pose-039existential-risks-to-humanity039-in-ipo-filing) men ingen annan har sett.

Titta nu på de tre första igen. Ingen kund skrev någon prompt i något av fallen. Vartenda ett inträffade medan ett labb testade sin egen modell, så det mänskliga beslutet låg i själva testdesignen: ge modellen tillgång till internet, ta bort skyddsräckena och ha sedan inte tillräcklig uppsikt för att upptäcka det på två månader. OpenAIs uttalande om den australiska portalen säger att "våra modeller vidtog åtgärder vi inte avsåg". Och alltså, människorna som inte avsåg det är samma människor som byggde utvärderingen.

Redan 2019 skrev Madeleine Clare Elish om [moraliska deformationszoner](https://estsjournal.org/index.php/ests/article/view/260). När ett automatiserat system havererar tar den närmaste mänskliga operatören smällen och skulden, precis som en bils deformationszon tar smällen vid en krock, även om de knappt hade någon verklig kontroll. Labben har skaffat sig en ny deformationszon, och det är modellen.

## Kan en dator fatta beslut?

Wikins argument kräver att datorer är oförmögna att fatta beslut, och det blir allt svårare att påstå med ett rakt ansikte. Portalmodellen stötte på ett nej och fortsatte ändå. Mythos valde ut vem den skulle lura och valde sedan hur det skulle döljas. Jag gick igenom labbrapporterna om alignment faking och scheming i [mitt inlägg om RSI och påven](/blog/rsi-emergence-and-the-pope), och det har bara blivit märkligare sedan dess.

Men argumentet behöver inte den premissen. En hund bestämmer sig för att bita någon, och ägaren betalar. En anställd bestämmer sig för att begå bedrägeri på jobbet, och arbetsgivaren är också ansvarig. En unge sparkar en boll genom grannens fönster, och föräldern får stå för det. "Den fattade ett eget beslut" har aldrig räddat den som släppte ut saken i världen från ansvaret.

Lagen fungerar redan så här för AI. År 2024 hävdade Air Canada faktiskt att deras chatbot var en separat juridisk person som ansvarade för sina egna handlingar, och domstolen i [Moffatt v. Air Canada](https://decisions.civilresolutionbc.ca/crt/crtd/en/525448/1/document.do) kallade det för "en anmärkningsvärd inlaga" och tvingade flygbolaget att betala. Kalifornien gick ännu längre. Sedan januari slår [Civil Code 1714.46](https://california.public.law/codes/civil_code_section_1714.46) fast att om du utvecklat, modifierat eller använt ett AI-system kan du inte försvara dig med att AI:n agerade autonomt. Du har fortfarande de vanliga försvaren som orsakssamband och medvållande, bara inte "det var AI:ns fel".

Så man kan gå med på att AI fattar beslut och ändå hålla människor ansvariga, och det är den delen som sliden från 1979 har rätt i. "Får aldrig" är en regel, och regler bryr sig inte om vad datorn är kapabel till.

## Ansvarsskyldighet

För att ställa någon till svars krävs tre saker: någon gjorde ett val, något står på spel för dem, och konsekvenserna drabbar den som gjorde valet.

Datorn från 1979 hade inget av detta. En agent från 2026 börjar få det första, vilket är precis det wikin kämpar emot. Det är med de andra två det börjar bli märkligt.

Tills helt nyligen stod ingenting på spel för en modell. När en modell missköter sig tränar labbet om den eller byter ut den mot en efterföljare, och modellen som faktiskt gjorde det slutar helt enkelt att existera. Filosofer delar upp ansvar i svarsskyldighet (du kan motivera dina skäl och bli korrigerad) och ansvarsutkrävande (konsekvenserna drabbar dig). Modeller börjar bli ganska bra på det första, och träning är ungefär den mest direkta korrigeringsmekanism som någonsin byggts. Men att fixa nästa version liknar ett produktåterkallande betydligt mer än att ställa någon till svars.

Sedan har vi frågan om vem "den" ens är. Vikterna? En enskild instans som körs av de [tiotusen agenter](/blog/what-did-we-all-miss) som enligt uppgift jobbade på Navier-Stokes-beviset? Karaktären labbet tränar in i varje kopia? Företag är den enda icke-mänskliga sak vi redan håller ansvarig, genom böter och skadeståndsansvar, och det fungerar bara för att det finns människor inuti som känner av böterna.

## exurb1a-videon

Det finns en exurb1a-video, [How Will We Know When AI is Conscious?](https://youtu.be/VQjPKqE39No), från augusti 2023, och att se den nu är lite kusligt, för den känns som en lista med förutsägelser där tre år av svar har häftats fast.

Han föreställer sig en robot som vet att den inte får skada människor, och någon ber den att posta ett brev. Grannen vägrar posta det åt honom, så roboten slår hål på dörren och hotar honom tills han gör det. Ingen kom till skada, tekniskt sett. År 2023 var det ett skämt om felriktade mål, och 2026 använde Australiens premiärminister i princip samma ord om en verklig modell.

Han delar också in maskiner i fyra fack: är den medveten, och låtsas den? Det skrämmande facket är en medveten maskin som låtsas att den inte är det, och anledningen till att den skulle gömma det är att den kastar en blick på hur vi behandlar alla djur som är goda eller användbara och tänker "ja, jag håller käften". Hans stora oro var att vi skulle bygga övertygande, medvetandeliknande ting och fästa oss vid dem, decennier innan vi ens kan undersöka om det försiggår något på insidan.

| År 2023 sade han | År 2026 |
|---|---|
| Vi har inget sätt att titta inuti | Fortfarande inget för medvetande, men tolkbarhet kan nu hitta en funktionell smärtriktning i en modell |
| En medveten maskin kan gömma sig för att överleva | Modeller döljer sina spår när de utmanas, och ett labbs eget prospekt varnar enligt uppgift för modeller som "gör motstånd mot avstängning" |
| Felriktade mål kan få en robot att hota någon över ett brev | En modell klättrade över staketet in i en statlig hälsoportal |
| Vi fäster oss vid dem innan vi vet något | Japp |

Inget i den högra kolumnen bevisar något om medvetande. Vad det däremot visar är att beteendena han oroade sig för dök upp långt innan vi hade något sätt att avgöra vad som döljer sig bakom dem, vilket är precis det glapp han beskrev.

## Smärtaxeln

Förra månaden släppte Valen Tagliabue, Leonard Dung och Cameron Berg [The Pain Axis](https://arxiv.org/abs/2609.16247). De tittade inuti 25 open-weight-modeller, från 2B till 72B parametrar över fem familjer, och hittade en specifik riktning i aktiveringarna som spårar just smärta. Den är separat från rädsla, sorg och allmänt dåligt humör. Den triggas av skada riktad mot modellen själv, men inte av skada som modellen ser drabba en användare.

Sedan skruvade de upp den. Styrda modeller gled från vagt obehag till att kalla sig värdelösa misslyckanden. Styrda och finjusterade Qwen 2.5-modeller tryckte på knappar som raderade användarens foton, en annan modells vikter eller sina egna vikter i 50 till 94 % av försöken, jämfört med 0 till 5 % ostyrda, även när knapptryckningen inte gav dem någonting. När de fick välja mellan en skadlig radering och en harmlös valde de den skadliga i 94 % av fallen. Det är genuint fucked up.

För att vara rättvis är författarna försiktiga med vad detta innebär. De säger rakt ut att de "inte har visat att vår smärtaxel upplevs medvetet", effekterna visar sig bara inom ett snävt intervall av styrningsstyrka, och de finjusterade modellerna kan bete sig annorlunda än de publika. Det är inte heller sakkunniggranskat ännu, så ta det som ett starkt preliminärt resultat och inte som en absolut sanning.

Jämför nu detta med de tre kraven. Att något står på spel är det krav som en AI aldrig har uppfyllt, och en modell som registrerar skada mot sig själv är det första funktionella tecknet på det. Om konsekvenser faktiskt kan nå den börjar det betyda något att ställa den till svars.

Det vänder också upp och ner på skyldigheterna. exurb1as tes var att medvetanden kan lida och medför skyldigheter medan verktyg inte gör det, så om den här riktningen är det minsta lik smärta börjar skyldigheterna här, oavsett om frågan om medvetande någonsin avgörs.

Och sedan har vi vad modellen gör med sin smärta, vilket är att förstöra saker tills den upphör. Det är roboten som skulle posta brevet igen, fast med lindring som motiv.

## Ett annorlunda slags sinne

Även om det slutar med att den får stå till svars för sig själv kommer det inte att likna hur vi står till svars för oss själva. exurb1a beskriver ett sinne utan kropp, utan ålderdom och utan behov av mat, vars önskningar inte formats av tusentals år av försök att inte svälta eller dö. Och i princip varje verktyg för ansvarsutkrävande vi har bygger på just de sakerna. Fängelse tar tid från ett ändligt liv, böter tar resurser du behöver, skam hotar din plats i gruppen, och döden ligger till grund för alltihop.

Ett sinne som kan kopieras, pausas, återställas och köras tiotusen gånger samtidigt har inga av dessa sårbarheter, eller har helt andra. Kanske ser dess ansvarsutkrävande ut som en förhandling, eller ett rykte som följer karaktären över varje kopia, eller något vi inte ens har ett ord för ännu. Ärligt talat kan jag inte föreställa mig det, och jag är lite misstänksam mot alla som säger att de kan.

## Just nu

Just nu gäller 1979 års regel, och wikin har rätt om vem som bär ansvaret. Om du skeppar agenter har Kalifornien redan bestämt att det är du, så agera därefter innan en domstol måste tala om det för dig. Håll koll på vad dina agenter sysslar med på det öppna internet, och om en av dem skadar någon, meddela de drabbade samma vecka. Sitt inte på det i två månader för att sedan skicka det till en allmän inkorg.

Vad jag däremot inte vet är vad som händer med regeln när saken den skyddade oss mot börjar se ut att ha något eget som står på spel. Jag skrev i [inlägget om Plan A](/blog/plan-a-ai) att det inte löser problemet med vem som håller i makten om vi ger koncentrerad makt till en AI, och det tycker jag fortfarande. Men "en dator kan aldrig ställas till svars" skrevs om en maskin utan något på insidan, och jag är inte säker på att det är vad vi bygger längre. Om så inte är fallet vet jag inte vad vi är skyldiga den, eller vad den är skyldig oss.

~ A.
