---
title: "Finjustering av OpenJev på 62 695 A/B-tester"
date: 2026-09-23
updated: 2026-09-24
tags: [ml, decision-models, calibration, open-weights, benchmarks]
draft: false
description: "Tränar en rubrikrankare på Upworthys A/B-tester, fixar utvärderingen och kollar hur den står sig mot Gemini och överförs till Reddit."
---

Jag gick igenom de 26 "scoring and ranking"-projekten bland ungefär 300 publika projekt byggda på de nya beslutsmodellerna. Alla 26 fick sina poäng genom att fråga en modell: betygsätt den här artikeln, bedöm den här texten, avgör om det här dokumentet är relevant.

Jag ville prova detta med uppmätta utfall. På sikt vill jag poängsätta ämnesrader i mejl, så att förutsäga vilken rubrik som fick flest klick kändes som en bra startpunkt.

Resultatet är **[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)**, en rubrikrankare med 435 miljoner parametrar släppt under Apache 2.0. Den poängsätter text i en enda forward pass. Basen är [`com-kotobalabs/open-jev-deberta-v3-large`](https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large), en DeBERTa-v3-large förtränad på typade beslut. Vikterna finns uppe om du vill testa.

| Mått | Denna modell | Slump |
|---|---|---|
| Alla par inom samma test, osedd split | **0.689** | 0.524 |
| Par där testet faktiskt avgjordes (p<0.05) | **0.843** | 0.547 |
| Rena par, inget som liknar träningsdata | **0.671** | 0.524 |
| Väljer bäst av 4–5 varianter | **47.7%** | 24.9% |
| Undviker den sämsta varianten | 90.3% | 75.1% |
| Reddit-titelpar, out-of-domain | 0.522 | 0.500 |

Bara 29 % av paren når statistisk signifikans vid 5 %. Första raden inkluderar alla par, även de där den observerade skillnaden i klickfrekvens kan bero på brus. Den andra begränsar utvärderingen till signifikanta par.

Modellen anpassades på 47 168 armar över 16 129 randomiserade rubrikexperiment. Resultaten ovan använder data som den inte tränats på. De flesta körningarna nedan använde en snävare utvärdering: ett bäst-mot-sämst-par per test. Jag upptäckte det misstaget senare; rättelseavsnittet förklarar det, och tabellen ovan rapporterar all-pairs-träffsäkerhet.

## Data och metod

[Upworthy Research Archive](https://osf.io/jd64p/) har varit offentligt sedan 2021 under CC BY. Det innehåller 32 487 randomiserade A/B-tester för rubriker som kördes mellan januari 2013 och april 2015, med 538 miljoner tilldelningar samt visnings- och klickantal för varje variant. Ja, det är "du anar inte vad som hände sen"-folket. Deras rubriker är en ganska specifik typ av texter, men arkivet låter mig jämföra varianter mot faktiska klick.

Jag började med ModernBERT-large och ett regressionshuvud. Målet var den krympta logit-klickfrekvensen centrerad kring varje tests eget medelvärde. Själva artikeln står för en stor del av variansen i klickfrekvens, så jag ville förutsäga hur en rubrik presterade i förhållande till de andra rubrikerna för samma artikel. Beta-binomial shrinkage drar estimat mot testets medelvärde, starkare för en arm med 600 visningar än en med 20 000.

Körningen tog tjugofem minuter på en enda L4 och kostade runt fyrtio cent. Jag tränade på 2013–2014-delen av confirmatory-splitten, höll undan dess 2015-tester och fick **0.704 i parvis träffsäkerhet.**

Vid den tidpunkten jämförde jag detta med [0.544](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682), från en Toronto-grupp som använde handgjorda lingvistiska särdrag. Deras artikel kallar problemet "i grunden svårt, inte bara en fråga om urvalsstorlek". Den jämförelsen hade också problem: deras parval och forskningsfråga skilde sig från min, vilket jag förklarar under tidigare arbete.

Jag sammanfattade det första resultatet som "Headline signal survives two years of drift".

## Utvärdering över splits

Jag trodde att 2015-resultatet visade att modellen kunde hantera förändringar i rubrikstil över tid. Eftersom jag i slutändan vill använda detta för mejl var jag intresserad av hur väl den fungerade bortom datan den tränats på.

Arkivet har tre splits: exploratory, confirmatory och holdout. Jag hade bara använt confirmatory hittills. Att köra samma vikter på de andra två gav mig:

```
confirmatory 2015:  0.704
holdout:            0.637
exploratory:        0.624
```

Holdout och exploratory låg inom 0.013 från varandra på varje effektstorleksnivå jag undersökte. Båda presterade långt under confirmatory-mängden för 2015.

![Parvis träffsäkerhet över tre splits i Upworthy-arkivet. Confirmatory 2015-linjen ligger långt över holdout och exploratory, som följer varandra tätt.](/assets/img/blog/decision-models/splits.png)

## Split-struktur

Arkivets dokumentation förklarar att testerna fördelas slumpmässigt mellan de tre splitarna. Varje split täcker nästan hela tidsperioden:

![Två staplar. Den första visar en ren kronologisk split, träning sedan test. Den andra visar den verkliga strukturen: tränings- och testblock inflätade över hela perioden.](/assets/img/blog/decision-models/split-structure.png)

| Split | Armar | Datumintervall | Andel före 2015 |
|---|---|---|---|
| confirmatory | 51,891 | 2013-01-24 → 2015-04-30 | 83.5% |
| holdout | 11,231 | 2013-01-24 → 2015-04-29 | 82.8% |
| exploratory | 10,804 | 2013-01-26 → 2015-04-29 | 83.8% |

Ungefär 83 % av holdout kom från träningsperioden, men ändå var träffsäkerheten där sju procentenheter under 2015-svansen. Så skillnaden förklarades inte av att nyare rubriker var svårare. Min datumbaserade utvärdering inom confirmatory räckte inte för att belägga den tidsmässiga generalisering jag hade hävdat.

## Dataläckage och etikettbrus

Härnäst undersökte jag dataläckage. Upworthy återanvände artiklar över flera tester, så slumpmässig tilldelning kunde placera snarlika rubriker i både träning och utvärdering.

Min första kontroll letade bara efter exakta matchningar och hittade fem delade rubriker av 650. Det missade nästan-dubbletter. Jag använde ett inverterat index för att mäta maximal Jaccard-tokenöverlappning mellan varje utvärderingsrubrik och de 47 168 träningsrubrikerna.

| Utvärderingsmängd | n | ≥0.9 överlapp | median |
|---|---|---|---|
| confirmatory 2015 | 1,300 | 0.5% | 0.227 |
| holdout | 4,274 | **30.5%** | 0.300 |

Holdout hade proportionellt sett ungefär sextio gånger fler nästan-dubbletter, trots sin lägre träffsäkerhet. Att ta bort dem gav 0.646, strax över 0.637. Den här kontrollen förklarade inte gapet och visade ingen träffsäkerhetsvinst från nästan-dubbletterna.

Jag kollade också om holdout hade färre visningar eller mer brusiga etiketter:

| Utvärderingsmängd | medianvisningar | median-z | median för CTR-kvot |
|---|---|---|---|
| confirmatory 2015 | 2,462 | 2.37 | 2.24 |
| holdout | 3,096 | 2.64 | 1.99 |

Holdout hade fler visningar och högre z-poäng. 2015-paren hade visserligen en större median-CTR-kvot, 2.24 mot 1.99, vilket kunde göra dem lättare att skilja åt. Jag kunde fortfarande inte förklara hela gapet, så jag noterade det som oförklarat och använde ungefär 0.63 som baslinjen som stöddes av de två andra splitarna.

## Ablationer

Därefter jämförde jag att lägga till träningsdata med att byta förlustfunktion. Att inkludera exploratory ökade det tillgängliga träningssetet till 62 695 armar. Jag utvärderade varje konfiguration på samma 2 137 holdout-par, ett bäst-mot-sämst-par per test.

```
Phase 0        confirmatory       MSE              0.637
more-data      expl+confirmatory  MSE              0.724
rank           confirmatory       Bradley-Terry    0.775
rank+more      expl+confirmatory  Bradley-Terry    0.787
```

![Ablationsresultat. Att lägga till data ger 0.087 över baslinjen; att byta till Bradley-Terry ger 0.138, och den bästa körningen når 0.812.](/assets/img/blog/decision-models/ablations.png)

Att lägga till data förbättrade träffsäkerheten med **0.087**. Att byta till Bradley-Terry förbättrade den med **0.138**, med det mindre träningssetet och två epoker i stället för tre.

Jag hade tränat en klickfrekvensregressor och utvärderat om den rankade par korrekt. En rankingförlustfunktion passade den utvärderingen bättre.

[Bradley-Terry](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) tränar på parvisa preferenser. För varje par av armar inom ett test maximerade jag `logsigmoid(score_winner - score_loser)`, viktat med log-visningarna för armen med färre visningar. De 47 168 träningsarmarna genererade 76 892 par inom samma test.

ModernBERT-*base* nådde 0.761 med en tredjedel av parametrarna, vilket gör den till ett alternativ för att köra på CPU.

DeBERTa-v3-large-varianten som förtränats på beslutsuppgifter misslyckades först med att lära sig. Dess förlustfunktion låg kvar på `-log(0.5)` under alla 4 804 steg, och den fick 0.519.

Den platta förlustkurvan fick mig att kontrollera träningskonfigurationen. Enkodern hade laddats korrekt; bara klassificeraren och poolern var nyinitierade.

Jag hade återanvänt ModernBERTs inlärningstakt på 2e-5. Efter att ha hittat rapporter om [instabilitet vid träning av DeBERTa](https://github.com/microsoft/DeBERTa/issues/77) provade jag 6e-6.

Vid 6e-6 sjönk förlusten: 0.709 → 0.682 → 0.620 → 0.360. Träffsäkerheten nådde **0.812**, två och en halv procentenheter över ModernBERT, och 0.913 på nivån med högst konfidens.

På par som klarade nästan-dubblettfiltret fick den **0.797** mot ModernBERTs 0.769. Dess träffsäkerhet sjönk dessutom mindre efter filtreringen.

## Kalibrering och realiserat lyft

Parvis träffsäkerhet säger ingenting om hur många extra klick modellens val faktiskt skulle ge. Det beror på storleken på skillnaderna mellan varianterna.

För varje test jämförde jag den observerade klickfrekvensen för armen som modellen gav högst poäng med medelvärdet över testets alla armar. Medelvärdet representerar att välja en variant helt slumpmässigt; det representerar inte en redaktörs val.

| | CTR |
|---|---|
| Testets medelvärde, utan modell | 1.20% |
| Modellens val | 1.42% |
| Orakel, perfekt val | 1.60% |

Det är **+18.3% relativ klickfrekvens** över 2 140 tester.

### Vad detta säger om andra målgrupper

De 18.3 % beror på Upworthys basfrekvens på 1.20 % och spridningen mellan deras rubrikvarianter. Jag vet inte vad lyftet skulle bli för ett B2B-nyhetsbrev med 2.5 % klickfrekvens och mer likartade ämnesrader.

Jag mätte också hur ofta modellen gjorde användbara val inom ett test. Dessa mått är mindre bundna till den absoluta klickfrekvensen, men de behöver ändå testas på andra målgrupper:

| Mått | Värde |
|---|---|
| Undviker den sämsta varianten | **90.3%** |
| Slår testets genomsnitt | 76.6% |
| Väljer den faktiskt bästa varianten | 47.7% |
| Fångat utrymme (headroom), mediantest | 89.2% |
| Spearman, poäng mot klickfrekvens | 0.526 |

Att undvika den sämsta varianten 90.3 % av gångerna är användbart här, jämfört med 75.1 % vid slumpmässigt val. Träffsäkerheten på 47.7 % för bästa variant är ungefär 1.9× slumpbaslinjen på 24.9 %. Inget av resultaten visar hur den skulle prestera på mejl.

Fångat utrymme varierar mycket: medianen är 89.2 %, kvartilavståndet är 5 % till 100 %, och det sammanslagna värdet är 55.4 %. Den höga medianen betyder inte att modellen fångar så mycket av den totala tillgängliga vinsten.

Jag anpassade en [isoton regression](https://en.wikipedia.org/wiki/Isotonic_regression) för att mappa poäng till förväntat lyft. Den anpassar ett monotont samband utan att tvinga fram en viss kurvform. Bradley-Terry lär sig en ordning; den gör inte råpoängen till kalibrerade klickfrekvenser. Jag bootstrappade över tester eftersom armar inom ett test delar artikel och inte är oberoende.

| Poäng | mot bas | 90% intervall |
|---|---|---|
| −2.72 | **−19.1%** | [−0.252, −0.209] pp |
| −1.06 | −8.2% | [−0.111, −0.086] pp |
| −0.20 | −0.7% | [−0.023, −0.000] pp |
| +0.56 | +3.7% | [+0.030, +0.056] pp |
| +1.62 | +11.1% | [+0.115, +0.147] pp |
| +2.82 | **+21.8%** | [+0.231, +0.274] pp |

![Kalibreringskurva. Uppskattad skillnad i klickfrekvens från baslinjen stiger monotont med modellpoängen, med 90 % intervall.](/assets/img/blog/decision-models/calibration.png)

Mellanpoängen mappar till små uppskattade skillnader från baslinjen. Dessa intervall beskriver kalibrerat lyft, inte huruvida två specifika rubriker är likvärdiga.

## Tidigare arbete på detta arkiv

Andra arbeten på detta arkiv använder andra uppgifter, indata och utvärderingsdelmängder:

| Källa | Uppgift | Mått | Värde | Slump |
|---|---|---|---|---|
| LOLA, människor (n=4,571) | top-1 av k | träffsäkerhet | ~slump | 0.330 |
| LOLA, GPT-4 in-context | top-1 av k | träffsäkerhet | 0.400 | 0.330 |
| LOLA, LoRA Llama-3-8B | top-1 av k | träffsäkerhet | 0.469 | 0.330 |
| LOLA, finjusterad GPT-4o | top-1 av k | träffsäkerhet | 0.488 | 0.330 |
| [arXiv:2506.00152](https://arxiv.org/abs/2506.00152), Pythia-12B | signifikanta par, + ingress + tidsstämpel | ROC AUC | 0.82 | 0.50 |
| [PLOS ONE 0281682](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682) | par matchade på artikel+bild+vecka, K≤15 | träffsäkerhet | 0.544 | ~0.50 |
| **VERA** | alla par inom samma test, endast rubrik | träffsäkerhet | **0.689** | 0.524 |

Artikeln med 0.544 matchar par på artikel, bild och testvecka, och gör sedan ett slumpmässigt delurval av experiment med fler än 15 par. Den tränar på 5 048 par. Det är en registrerad rapport som testar om förutsägelser kan slå slumpen, så att jämföra den siffran rakt av med min modells träffsäkerhet överskattar vad jag har visat.

Belöningsmodellen Pythia-12B rapporterar ROC AUC på 0.82. Den tränar på par där CTR-skillnaden är signifikant vid 5 %, ungefär 28 % av paren, och läser artikelns ingress och inläggets tidsstämpel utöver rubriken. Dess AUC och min träffsäkerhet är inte utbytbara, så de siffrorna avgör inte vilken modell som är bättre.

Jag har inte hittat något publicerat resultat som rapporterar parvis träffsäkerhet från en finjusterad enkoder på ofiltrerade par inom samma test med enbart rubriktext. Det gör detta till en användbar kompletterande utvärdering, men det fastställer inte något state-of-the-art-resultat.

## Baslinjer uppmätta här

Jag körde Gemini 3.1 Pro och Laya på mina utvärderingspar för att få en direkt jämförelse.

Jag presenterade varje par två gånger och växlade rubrikernas ordning, och behöll en förutsägelse bara när båda ordningarna valde samma rubrik. Detta kontrollerar för position bias. Tabellen visar träffsäkerhet på matchade par och andelen förutsägelser som var konsekventa i båda ordningarna; träffsäkerhet i sig utelämnar hur ofta ett system misslyckades med den kontrollen.

| System | Parametrar | Matchade par | Självkonsekvent |
|---|---|---|---|
| **VERA** | 435M | **0.823** | — |
| Gemini 3.1 Pro | frontier | 0.751 | 83.7% |
| Laya typed-decisions | 421M | 0.504 | 52.9% |

VERA fick ungefär sju procentenheter högre än Gemini på de matchade paren, till ungefär en tusendel av kostnaden per anrop. Gemini-utvärderingen kostade 5,60 dollar. Jag hade tidigare hänvisat till människors slumpmässiga resultat som ett bevis på att detta skulle vara svårt även för modeller; Geminis 0.751 stödjer inte det antagandet.

Laya fick 0.504 och gav konsekventa svar på 52.9 % av paren. Dess model card täcker fakturahantering, säkerhetsincidenter, kundtjänst och agentspår. Denna utvärdering testar den utanför dessa domäner, så jag skulle inte använda resultatet för att bedöma dess prestanda på de uppgifterna.

Gemini fick också 0.641 på par där skillnaden i klickfrekvens inte var signifikant vid 5 %, mot en slumpbaslinje på 0.500. VERA fick 0.696 på det stratumet. Jag hade kallat de paren för brus, men att inte nå en signifikanströskel betyder inte att det saknas prediktiv signal. Gemini var inte finjusterad på dessa etiketter; dess resultat stödjer den distinktionen, även om det inte utesluter läckage i VERAs utvärdering.

## Domänöverföring

Upworthy-resultaten kommer från en enda publicists virala rubriker på sociala medier 2013–2015. Jag vill fortfarande poängsätta ämnesrader i mejl.

Ett B2B-nyhetsbrev till 4 000 prenumeranter är en helt annan miljö, och att lyckas bra på Upworthy säger ingenting om ifall det fungerar där.

För ett första överföringstest använde jag SNAPs Reddit-dataset: 132 308 inlägg fördelade på 16 242 bilder, där varje bild postades under olika titlar ungefär åtta gånger i genomsnitt.

Dessa inlägg var inte randomiserade. Jag skapade par inom samma bild och subreddit, anpassade prestandafallet mot återpostningsindex per subreddit och rankade residualerna. Jag behöll bara par där residualgapet var tillräckligt stort för att utse en vinnare.

117 118 par. VERA får **0.522**. Slumpen är 0.500. En regel om att "längre titel vinner" får 0.507.

Att behandla par som oberoende ger ett standardfel på 0.0015, ungefär femton standardfel över slumpen. Paren delar dock bilder, så den beräkningen ensam räcker inte för att fastställa signifikans. Träffsäkerheten stiger från 0.508 till 0.531 över kvartiler för residualgap och varierar från 0.495 på r/WTF till 0.558 på r/fffffffuuuuuuuuuuuu. Hur som helst är 0.522 inte tillräckligt användbart för det jag vill bygga.

Reddit-uppröster är inte klickfrekvenser, och jag har inte kontrollerat för tid på dygnet eller postarens rykte. Det svaga resultatet kan bero på dålig överföring, dessa störfaktorer eller båda delarna. Det ger mig ingen grund för att lova användbar prestanda utanför Upworthy.

För att testa mejl direkt behöver jag ämnesrader med uppmätta utfall från utskick. Jag hittade inget offentligt dataset som passade för träning:

| Källa | Storlek | Tillgänglighet |
|---|---|---|
| Return Path ämnesradsstudie | 9M ämnesrader | Proprietär, 2015, släpptes aldrig |
| Belkins B2B-korpus | 5.5M mejl | Endast aggregerad statistik |
| Yahoo (IEEE 7004277) | 100k+ rader, miljarder visningar | Proprietär |
| Oracles NLORP-artikel | 300 rader | Skrapade från Google, frekvenser ej mätta |
| Diverse Kaggle-"e-postkampanj"-set | varierar | Mock eller syntetiska |

Oracle-artikeln använder till exempel "300+ different subject lines of special deal emails, picked up from multiple internet sources via google search". De saknar uppmätta frekvenser. Aggregerade rön om ämnesraders längd eller ordval ger mig inte heller de etiketter per utskick som det här träningsupplägget kräver.

## Datatillgänglighet

Träningsdatan är offentlig och vikterna kostade mig ungefär fyra dollar att ta fram. Detta är ett reproducerbart experiment, och jag behöver fortfarande ta reda på om metoden fungerar på mejl.

E-postleverantörer och nyhetsbrevsutgivare med loggar från A/B-tester skulle kunna bidra med relevant data. Jag skulle behöva varianter av ämnesrader och deras uppmätta utfall, och sedan ett sätt att utvärdera förutsägelser på nya utskick. Jag har inte den infrastrukturen än.

## Generalisering

Jag skulle vilja testa detta på andra beslut med registrerade utfall. Om du använder en experimentplattform som Optimizely, Statsig eller LaunchDarkly kanske du redan har kandidatvarianter och resultat att arbeta med. Några möjliga uppgifter:

| Beslut | Etiketten du redan har |
|---|---|
| Ämnesrader, rubriker, push-notistexter | öppningar, klick |
| Val av supportmakro | löst utan eskalering |
| Retrieval-omrankning | vilket resultat användaren valde |
| Formulering av felmeddelanden | löste själv, eller skapade ett ärende |
| Titlar på produktlistningar | konverteringar |
| Val av agentverktyg | lyckades trajektorian |

Jag är särskilt intresserad av agenters verktygsval. Jevs tre primitiver är `choice`, `score` och `noul`; det här experimentet använder `score`. Att prova det med `choice` skulle kräva loggar över tillgängliga alternativ, det valda verktyget och vad som hände efteråt. De loggarna skulle fortfarande behöva kontrolleras för att se om de medger en rättvis jämförelse.

Hittills har jag testat utfallsträning mot zero-shot-bedömningar på en uppgift. Jag vet inte om fördelen håller för någon av de andra.

## VERA

**V**ariant **E**valuation from **R**eal **A**nalytics.

**[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)**, Apache 2.0.

```python
from transformers import AutoModelForSequenceClassification, AutoTokenizer

tok = AutoTokenizer.from_pretrained("NovusEdge/vera-deberta-v3-large")
model = AutoModelForSequenceClassification.from_pretrained(
    "NovusEdge/vera-deberta-v3-large")

# Score a set of candidates for ONE piece of content. Higher wins.
enc = tok(candidates, padding=True, truncation=True, max_length=64,
          return_tensors="pt")
scores = model(**enc).logits.squeeze(-1)
```

Använd poängen för att jämföra kandidater för samma innehåll, till exempel 3 till 6 varianter för ett utskick. Den slutgiltiga modellen lärde sig rankningar inom samma test, så en råpoäng är varken ett absolut kvalitetsmått eller en klicksannolikhet. Vikterna inkluderar även en kalibrator anpassad till Upworthy-resultaten.

Det finns också en mindre ModernBERT-base-modell för CPU-användning. Den når 0.761 i bäst-mot-sämst-utvärderingen med en tredjedel av parametrarna.

## Begränsningar

Jag har inte testat detta på mejl, och Reddit-resultatet var svagt. Upworthy-poängen ska inte ses som förväntad prestanda för ett nyhetsbrev.

Om du driver ett och har tidigare utskick med uppmätta öppnings- eller klickfrekvenser, hör av dig. Jag testar det gärna, och datan förblir din.

## Rättelser

Den 2026-09-24 upptäcktes flera problem vid en granskning av utvärderingskoden.

Min utvärdering anropade `pairs_from`, som sparar ett par per test: den bästa armen mot den sämsta. Träningen byggde alla par. Resultatet 0.812 mätte därför bara paret med störst gap i varje test. Över alla 18 485 par inom samma test är träffsäkerheten **0.689** mot en baslinje på 0.524.

| Parmängd | n | Längdbaslinje | VERA |
|---|---|---|---|
| alla par inom samma test | 18,485 | 0.524 | **0.689** |
| bästa armen mot sämsta, ett per test | 2,137 | 0.546 | 0.812 |

Jag körde också vanliga `microsoft/deberta-v3-large` genom det identiska receptet. Den får 0.805 mot 0.812 på samma set, en skillnad som är mindre än det rapporterade standardfelet på 0.009. Detta visar ingen påvisbar fördel med förträning på typade beslut. Att sänka inlärningstakten löste träningen för båda basmodellerna.

Ablationerna ovan använder alla det ursprungliga setet med 2 137 par, så de kan jämföras med varandra i den utvärderingen. De är inte all-pairs-resultat.

Också åtgärdat: kalibratorn som följde med vikterna hade anpassats på en annan körning, min bootstrap använde `.isin()` på ett urval draget med återläggning och tappade därmed dubbletterna, och slumpbaslinjerna diffade på två procentenheter eftersom jag inte hade beräknat dem från de faktiska armantalen.

Den inledande tabellen rapporterar de korrigerade resultaten. De tidigare körningarna finns kvar i redogörelsen ovan med sin utvärderingsdelmängd angiven.

---

*Data: [The Upworthy Research Archive](https://osf.io/jd64p/). Matias, J., Munger, K., Le Quere, M.A., Ebersole, C. (2021), Nature Scientific Data. CC BY 4.0. Experiment som kördes mellan 25 juni 2013 och 10 januari 2014 är exkluderade rakt igenom på grund av det randomiseringsfel som underhållarna offentliggjorde 2024. Vikternas DOI: [10.57967/hf/10573](https://doi.org/10.57967/hf/10573).*
