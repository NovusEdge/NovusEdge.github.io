---
title: "OpenJevin hienosäätö 62 695 A/B-testillä"
date: 2026-09-23
updated: 2026-09-24
tags: [ml, decision-models, calibration, open-weights, benchmarks]
draft: false
description: "Koulutin päätöksentekomallin A/B-testeillä, joita ihmiset oikeasti ajoivat, sen sijaan että kysyisin toiselta mallilta mitä se tuumaa; se välttää huonoimman varianttisi 90 % ajasta, ja ensimmäinen benchmarkini mittasi kirjaimellisesti ei yhtään mitään lol"
---

Uusien päätöksentekomallien päälle on rakennettu suurin piirtein 300 julkista projektia, ja kävin läpi ”pisteytys ja ranking” -projektit (26 kpl). Jokainen niistä pisteyttää asioita vain kysymällä mallilta, mitä mieltä se on. Pistä tälle artikkelille arvosana kahdeksalla laatuakselilla, arvioi tämän mainostekstin maku, arvioi onko tämä dokumentti relevantti, tajusit varmaan idean.

Ja niinku, eihän tuo ole dataa? Se on mallin mielipide, johon on lätkäisty numero perään, ja koko kategoria on rakennettu sen varaan suoraan sanottuna.

Niinpä koulutin sellaisen tuloksilla, joita joku oikeasti mittasi, ja painot ovat jaossa jos haluat kokeilla: **[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)**, Apache 2.0, 435M parametria, yksi forward pass, pisteyttää lyhyttä suostuttelevaa tekstiä. Pohjana on [`com-kotobalabs/open-jev-deberta-v3-large`](https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large), tyypitetyillä päätöksillä esikoulutettu DeBERTa-v3-large.

| Mittari | Tämä malli | Sattuma |
|---|---|---|
| Jokainen testin sisäinen pari, näkemätön jako | **0,689** | 0,524 |
| Parit, joissa testi oikeasti ratkesi (p<0,05) | **0,843** | 0,547 |
| Puhtaat parit, ei mitään opetusdataa muistuttavaa | **0,671** | 0,524 |
| Valitsee parhaan 4–5 variantista | **47,7 %** | 24,9 % |
| Välttää huonoimman variantin | 90,3 % | 75,1 % |
| Reddit-otsikkoparit, out of domain | 0,522 | 0,500 |

Suurimmassa osassa tämän arkiston pareista ei ole todellista eroa, vain 29 % saavuttaa merkitsevyyden 5 % tasolla. Ensimmäinen rivi sekoittaa nämä mukaan, minkä vuoksi nostan sen kärkiluvuksi. Toinen rivi kertoo, miten malli pärjää silloin, kun kokeessa oikeasti ratkesi jotain.

Se sovitettiin 47 168 haaraan 16 129 satunnaistetussa otsikkokokeessa, ja jokainen yllä oleva luku on peräisin jaosta, jota malli ei koskaan nähnyt. Miten siihen päästiin, selviää alta, mukaan lukien se kohta, jossa ensimmäinen benchmarkini mittasi täysin ei yhtään mitään (kyllä, minua kismittää se yhä vähän).

## Asetelma

Kävi ilmi, että tähän on olemassa täydellinen datasetti, ja se on ollut vapaasti saatavilla vuodesta 2021. Tammikuun 2013 ja huhtikuun 2015 välillä Upworthy (kyllä, *se* Upworthy, ”et usko mitä tapahtui seuraavaksi” -tyypit) ajoi 32 487 satunnaistettua A/B-testiä otsikoillaan: oikeaa liikennettä, oikeaa satunnaistusta, 538 miljoonaa jakoa. Sitten Cornell julkaisi koko roskan nimellä [the Upworthy Research Archive](https://osf.io/jd64p/) CC BY -lisenssillä. Jokainen otsikkovariantti, jokainen näyttökerta, jokainen klikkaus.

Tuo on suunnilleen niin lähellä perustotuutta kuin lyhyt suostutteleva teksti voi päästä.

Eli: ModernBERT-large regressiopäällä, ja kohteena on kutistettu logit-klikkausprosentti keskitettynä kunkin testin omaan keskiarvoon. Keskittäminen on muuten tärkeää, sillä itse *artikkeli* selittää suurimman osan klikkausprosentin varianssista eikä otsikko voi sitä selittää. Haluat siis oikeasti ennustaa sitä, kuinka kaukana tietty haara on sen testin keskiarvosta, jossa se pyöri. Sitten beeta-binomikutistus kohti tätä keskiarvoa, jolloin haara 600 näyttökerralla lasketaan pääosin prioriksi ja 20 000 näyttökerran haara pääosin todisteeksi.

Kaksikymmentäviisi minuuttia yhdellä L4:llä, noin neljäkymmentä senttiä. Jätin kaiken tammikuun 2015 jälkeisen sivuun, testasin sillä ja sain **0,704 parittaisen tarkkuuden.**

Mittakaavaksi: lähin julkaistu luku suodattamattomille pareille on [0,544](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682) Toronton ryhmältä käsin tehtyjä kielellisiä piirteitä käyttäen, ja heidän artikkelinsa toteaa ongelman olevan ”luonnostaan vaikea, ei pelkkä otoskokokysymys”. Palaan myöhemmin siihen, miksi tuo 0,544 on huonompi vertailukohta miltä se näyttää, ja myöhemmin lopetan muiden lukujen lainaamisen ja ajan vertailun itse.

Kuusitoista pistettä sen yli neljälläkymmenellä sentillä. Joten tietenkin kirjoitin siitä: ”Otsikkosignaali kestää kahden vuoden ryöminnän.”

## Ja silti

Otsikon väite oli, että signaali kestää *ryömintää*, koska opetusdata oli vuosilta 2013–2014 ja testisetti vuodelta 2015, ja tarkkuus tuskin liikahti; ikään kuin kaksi vuotta muuttuvaa internet-kulttuuria ei olisi mallia kiinnostanut pätkääkään. Se olisi todellinen löydös jos se pitää paikkansa, ja sillä on väliä, koska koko homman pointti on lopulta suunnata se sähköpostien otsikkoriveihin. Jos se ei kestä kahta vuotta yhden julkaisijan sisällä, se ei taatusti kestä hyppyä täysin toiseen mediaan.

Arkisto toimitetaan kolmessa osassa (exploratory, confirmatory, holdout), ja olin opettanut ja testannut confirmatory-osalla. Joten lähinnä huolellisuudesta, ja täysin odottaen vahvistavani sen mitä jo ”tiesin”, pisteytin samat painot kahdella muulla.

```
confirmatory 2015:  0.704
holdout:            0.637
exploratory:        0.624
```

Kiva.

Kaksi jakoa, joihin en ollut koskenutkaan, olivat 0,013:n sisällä toisistaan *jokaisessa efektikokoluokassa*, ja molemmat kertoivat, että otsikkolukuni oli paisuteltu seitsemällä pisteellä.

![Parittainen tarkkuus Upworthy-arkiston kolmen jaon yli. Confirmatory 2015 -viiva on selvästi holdoutin ja exploratoryn yläpuolella, jotka seuraavat toisiaan läheisesti.](/assets/img/blog/decision-models/splits.png)

## Aikakone, joka kulkee vain sivuttain

Luin siis arkiston dokumentaation tällä kertaa kunnolla, ja kävi ilmi, että arkisto jakaa testit osioihin **satunnaisesti**. Ei kronologisesti, vaan satunnaisesti.

![Kaksi palkkia. Ensimmäinen näyttää siistin kronologisen jaon, ensin opetus ja sitten testi. Toinen näyttää todellisen rakenteen: opetus- ja testilohkot lomittain koko ajanjaksolta.](/assets/img/blog/decision-models/split-structure.png)

| Jako | Haarat | Päivämääräväli | Osuus ennen vuotta 2015 |
|---|---|---|---|
| confirmatory | 51 891 | 2013-01-24 → 2015-04-30 | 83,5 % |
| holdout | 11 231 | 2013-01-24 → 2015-04-29 | 82,8 % |
| exploratory | 10 804 | 2013-01-26 → 2015-04-29 | 83,8 % |

Kaikki kolme jakoa kattavat samat päivämäärät samoissa suhteissa. Tämä tarkoittaa, että kun ajoin arvioinnin holdout-setillä, 83 % testattavasta tavarasta tuli *opetusjakson sisältä*. Sama aikakausi, sama talon tyyli, sama kaikki, vain testejä, joita malli ei ollut koskaan nähnyt. Ja silti se suoriutui siellä *huonommin* kuin vuoden 2015 hännässä.

Käännäpä tuo toisinpäin, niin se on rehellisesti sanottuna aika koomista: aika ei maksa tälle mallille melkein mitään, kun taas saman ajanjakson näkemättömät testit maksavat sille seitsemän pistettä. Huolellisesti rakentamani ryömintätesti oli koko ajan mitannut testin identiteettiä, se vain käytti ajallisen yleistymisen valepukua.

Olin rakentanut aikakoneen, joka kulkee vain sivuttain.

## Kaksi hypoteesia, molemmat väärinpäin

Seuraava ajatus on tietenkin vuoto (leakage). Upworthy kirjoitti saman artikkelin kymmeninä eri otsikkovariantteina, joten jos jaat *testit* satunnaisesti, yhden artikkelin uudelleenkirjoitukset leviävät kaikkiin kolmeen jakoon, ja holdoutin pitäisi olla pullollaan opetusdatan tekstien lähes-kopioita.

Kirjoitin nopean invertoidun indeksin virityksen mitatakseni maksimi-Jaccard-tokenpäällekkäisyyden jokaisen arviointiotsikon ja niiden 47 168 otsikon välillä, joilla malli oikeasti sovitettiin (tarkka merkkijonovertailu oli löytänyt viisi jaettua otsikkoa 650:stä, ja kyllä, olin sen perusteella julistanut vuodon ”poissuljetuksi”).

| Arviointisetti | n | ≥0,9 päällekkäisyys | mediaani |
|---|---|---|---|
| confirmatory 2015 | 1 300 | 0,5 % | 0,227 |
| holdout | 4 274 | **30,5 %** | 0,300 |

Kolmekymmentä prosenttia, kuusikymmentä kertaa enemmän kontaminaatiota kuin vuoden 2015 hännässä, ja se sai **matalamman** tuloksen.

Vuoto ei siis selitä eroa, se menee täysin väärään suuntaan. Jos jotain, se tarkoittaa, että rehellisen holdout-luvun pitäisi olla *huonompi* kuin 0,637, kun lähes-kopiot karsitaan pois. Tarkistin senkin dumppaamalla parikohtaiset pisteet ja viipaloimalla niitä: aidosti puhtailla pareilla malli sai 0,646, hieman *paremman*, joten lähes-kaksoiskappaleet eivät auttaneet sitä yhtään.

No, olisiko kyse label-kohinasta? Ehkä holdout-pareilla on vain vähemmän näyttökertoja.

| Arviointisetti | näyttökertojen mediaani | z-arvon mediaani | CTR-suhteen mediaani |
|---|---|---|---|
| confirmatory 2015 | 2 462 | 2,37 | 2,24 |
| holdout | 3 096 | 2,64 | 1,99 |

Tämäkin meni väärinpäin lol. Holdout-pareilla on *enemmän* näyttökertoja ja *korkeammat* z-arvot. Vuoden 2015 setissä on tosin laajempi CTR-suhteen mediaani (2,24 vs. 1,99), joten sen parit on aidosti helpompi erottaa toisistaan. Tämä on todellinen ilmiö, mutta se ei selitä läheskään seitsemää pistettä.

Kirjoitin siis dokumenttiin ”selittämätön” ja jatkoin eteenpäin. 0,63 on se luku, kaksi toisistaan riippumatonta jakoa on siitä samaa mieltä, eri mieltä oleva on poikkeava yksilö, enkä osaa kertoa miksi.

**!! Nörtti-infodump-varoitus :3 !!**

## Se osa, jolla oli oikeasti väliä

Romutettuani oman otsikkotulokseni ajattelin, että minun pitäisi vähintäänkin ajaa ablaatiot kunnolla.

Odotin datan voittavan, koska se on se tylsä oletus: käytettävissä on 62 695 haaraa, heitetään kolmas jako mukaan ja saadaan enemmän. Niinpä tein kaksi ajoa: toisessa exploratory-jako lisättiin opetukseen ja toisessa vaihdettiin häviöfunktio (loss function), ja molemmat arvioitiin samoilla 2 137 holdout-parilla.

```
Phase 0        confirmatory       MSE              0.637
more-data      expl+confirmatory  MSE              0.724
rank           confirmatory       Bradley-Terry    0.775
rank+more      expl+confirmatory  Bradley-Terry    0.787
```

![Ablaatiotulokset. Datan lisääminen tuo +0,087 perussuoritukseen; Bradley-Terryyn vaihtaminen tuo +0,138, ja paras ajo yltää 0,812:een.](/assets/img/blog/decision-models/ablations.png)

28 % enemmän opetusdataa toi **+0,053**, ja häviöfunktion vaihtaminen toi **+0,107**, kahdella aikakaudella (epoch) kolmen sijaan ja pienemmällä opetussetillä, ja se voitti silti tuplasti.

Mikä on jälkikäteen ajateltuna ilmiselvää, sitä pahinta lajia ilmiselvää. Benchmark on *parittainen tarkkuus*, eli valitse voittaja kahdesta otsikosta, ja minä ajoin regressiota klikkausprosenttiin. Optimoin siis mittarin sijaismittaria (proxy) ja arvioin itseäni sitten itse mittarilla.

[Bradley-Terry](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) optimoi itse asiaa. Jokaiselle saman testin sisäiselle haaraparille maksimoidaan `logsigmoid(score_winner - score_loser)`, painotettuna ohuemman haaran log-näyttökerroilla. Omat 47 168 opetushaaraani muuttuivat 76 892 testinsisäiseksi pariksi.

Sama malli. Sama data. Eri tavoite. Neljätoista pistettä.

Ajoin uteliaisuudesta myös ModernBERT-*basen* (kolmasosa parametreista), ja se ylsi 0,761:een. Suurin osa tästä asuu siis tavoitteessa ja datassa eikä mallin koossa, mikä on mukavaa jos haluat joskus ajaa tätä CPU:lla.

Sitten on se, joka oli vähällä jäädä huomaamatta. Kokeilin päätöksentekotehtäviin esikoulutettua DeBERTa-v3-large-varianttia, ja se pysyi tasan arvossa `-log(0.5)` kaikki 4 804 askelta ja sai tulokseksi 0,519, mikä on puhdasta sattumaa, täysin flätti.

Tuon voisi helposti tulkita niin, että ”DeBERTa on huonompi”, ja siirtyä eteenpäin. Olin vähällä tehdä niin, mutta häviökäyrä, joka on *täydellisen* tasainen tasan siinä arvossa, joka tarkoittaa ”arvaan”, on todella spesifi signaali. Se ei näytä siltä, miltä huonosti oppiva malli näyttää. Enkooderi oli myös latautunut ongelmitta, vain luokittelija ja pooler oli alustettu puhtaalta pöydältä.

Kyse oli oppimisnopeudesta (learning rate). DeBERTa-v3-large on [tunnetusti epävakaa](https://github.com/microsoft/DeBERTa/issues/77) arvolla 2e-5, johon ModernBERT on tyytyväinen, ja se haluaa jotain lähempänä arvoa 6e-6. Olin käyttänyt samaa konfiguraatiota molemmille, koska miksipä ei.

Ajoin sen uudelleen arvolla 6e-6, häviö meni 0,709 → 0,682 → 0,620 → 0,360, ja lopputulos oli **0,812**, kaksi ja puoli pistettä ModernBERTin yli ja 0,913 korkeimman luottamustason luokassa.

Ajoin sille myös lähes-kaksoiskappaleiden viipaleen, koska tässä vaiheessa en luota itseeni, ja aidosti puhtailla pareilla (ei mitään opetusdataa muistuttavaa) se saa **0,797** vastaan ModernBERTin 0,769. Sen ulkomuistierokin on *pienempi* kuin ModernBERTillä samalla kun se saa korkeammat pisteet, mikä on päinvastaista sille, miltä ulkomuistilla voittava malli näyttää.

Järjestelmä siis toimi hienosti koko ajan, minulla oli vain yksi numero väärin.

## Mutta mitä 0,812 oikeasti *tarkoittaa*

Rehellisesti sanottuna ihmiselle ei yhtään mitään. Se on parittaisen tarkkuuden ongelma väitteenä: se kertoo, että järjestys on oikea, muttei kerro mitään suuruusluokasta. Kahden otsikon oikea järjestäminen 81,2 % ajasta voi olla omaisuuden arvoista tai täysin arvotonta riippuen siitä, miten kaukana ne todellisuudessa ovat toisistaan.

Niinpä mittasin sen, miltä asia tuntuisi jollekin, joka oikeasti lähettää viestin. Ota jokaiselle testille mallin korkeimmalle pisteyttämä haara ja vertaa sen todellista klikkausprosenttia kaikkien kyseisen testin haarojen keskiarvoon. Ilman mallia sinulla ei nimittäin ole syytä suosia mitään yksittäistä varianttia, joten sen keskiarvo, mitä olisit saattanut lähettää, on rehellinen kontrafaktuaali.

| | CTR |
|---|---|
| Testin keskiarvo, ei mallia | 1,20 % |
| Mallin valinta | 1,42 % |
| Oraakkeli, täydellinen valinta | 1,60 % |

Tuo on **+18,3 % suhteellinen klikkausprosentti** 2 140 testin yli, ja joudun ottamaan sen heti pois sinulta.

### Nostoluku ei siirry muualle

18,3 % on Upworthyyn sidottu fakta. Se riippuu heidän 1,20 % perusprosentistaan ja siitä, miten paljon hajontaa heidän kirjoittajansa saivat aikaan varianttien välille. Suuntaa tämä B2B-uutiskirjeeseen, jonka klikkausprosentti on 2,5 % ja variantit tiukempia, niin luku muuttuu, suuntaan jota en aidosti pysty ennustamaan.

Se mikä *siirtyy*, on kaikki, mikä on suhdelukua yhden testin sisällä:

| Mittari | Arvo |
|---|---|
| Välttää huonoimman variantin | **90,3 %** |
| Voittaa testin keskiarvon | 76,6 % |
| Valitsee todellisen parhaan variantin | 47,7 % |
| Saavutettu potentiaali (headroom), mediaanitesti | 89,2 % |
| Spearman, pisteet vs. klikkausprosentti | 0,526 |

**90,3 % on se, jonka taakse oikeasti asettuisin.** Se ei melkein koskaan anna sinun lähettää huonointa kirjoittamaasi asiaa, ja se kestää perusprosentin, yleisön ja median vaihtumisen tavalla, jolla ”+18,3 %” ei vain kestä. Ja 47,7 % top-1-tarkkuus yleensä neljää tai viittä haaraa vastaan on noin 2,2-kertainen sattumaan nähden.

Yksi noista tosin huijaa hieman. Saavutetun potentiaalin mediaani on 89,2 % kvartiilivälillä 5 % – 100 %, ja kaikkien testien yli yhdistettynä se on 55,4 %. Malli on bimodaalinen: useimmissa testeissä se nappaa melkein kaiken saatavilla olevan hyödyn ja vähemmistössä ei melkein mitään, ja nuo vetävät kokonaistulosta alas.

Sitten sovitin päälle [isotonisen regression](https://en.wikipedia.org/wiki/Isotonic_regression), jotta pisteillä olisi yksiköt pelkkien vibojen sijaan. Isotoninen sopii tähän, koska se olettaa vain monotonisuutta (korkeammat pisteet, korkeampi klikkausprosentti), mikä on juuri se mitä Bradley-Terry takaa ja kirjaimellisesti ainoa asia mitä se takaa; mikä tahansa parametrinen keksisi rakennetta, jota malli ei ole koskaan luvannut. Välit tulevat bootstrap-otannasta *testien* eikä haarojen yli, koska yhden testin sisäiset haarat jakavat saman artikkelin eivätkä ole toisistaan riippumattomia.

| Pisteet | vs. baseline | 90 % väli |
|---|---|---|
| −2,72 | **−19,1 %** | [−0,252, −0,209] pp |
| −1,06 | −8,2 % | [−0,111, −0,086] pp |
| −0,20 | −0,7 % | [−0,023, −0,000] pp |
| +0,56 | +3,7 % | [+0,030, +0,056] pp |
| +1,62 | +11,1 % | [+0,115, +0,147] pp |
| +2,82 | **+21,8 %** | [+0,231, +0,274] pp |

![Kalibrointikäyrä. Klikkausprosentti suhteessa perussuoritukseen nousee monotonisesti mallin pisteiden myötä, ja 90 % välit ylittävät nollan vain lähellä keskikohtaa.](/assets/img/blog/decision-models/calibration.png)

Ja katso keskimmäisiä rivejä: välit ylittävät nollan siinä kohdassa, mikä tarkoittaa mallin fiksusti sanovan ”nämä kaksi ovat sama otsikko, heitä kolikkoa”.

## Siitä 0,544-luvusta

Sanoin palaavani siihen. Kun lähdin kunnolla katsomaan, mitä muuta tällä arkistolla on ajettu, vertailukohta johon olin nojannut heikkeni huomattavasti, ja eräs väliin jäänyt asia muuttui paljon oleellisemmaksi.

| Lähde | Tehtävä | Mittari | Arvo | Sattuma |
|---|---|---|---|---|
| LOLA, ihmiset (n=4 571) | top-1 / k | tarkkuus | ~sattuma | 0,330 |
| LOLA, GPT-4 in-context | top-1 / k | tarkkuus | 0,400 | 0,330 |
| LOLA, LoRA Llama-3-8B | top-1 / k | tarkkuus | 0,469 | 0,330 |
| LOLA, hienosäädetty GPT-4o | top-1 / k | tarkkuus | 0,488 | 0,330 |
| [arXiv:2506.00152](https://arxiv.org/abs/2506.00152), Pythia-12B | merkitsevät parit, + ingressi + aikaleima | ROC AUC | 0,82 | 0,50 |
| [PLOS ONE 0281682](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682) | parit täsmätty artikkeli+kuva+viikko, K≤15 | tarkkuus | 0,544 | ~0,50 |
| **VERA** | jokainen testinsisäinen pari, vain otsikko | tarkkuus | **0,689** | 0,524 |

Yksikään noista riveistä ei ole suoraan vertailukelpoinen omani kanssa, mikä on koko homman pointti.

Tuo 0,544-paperi täsmää parit artikkelin, kuvan *ja* testausviikon mukaan ja tekee sitten satunnaisotannan kaikista yli 15 parin kokeista. Se opettaa 5 048 parilla. Ja kyseessä on rekisteröity raportti, jonka ensimmäinen hypoteesi on ”voidaanko tätä ennustaa lainkaan sattumaa paremmin” – siis merkitsevyystesti. Kukaan ei yrittänyt siinä maksimoida tarkkuutta. Sen voittaminen 27 pisteellä 435 miljoonan parametrin mallilla kertalukua suuremmalla datamäärällä ei ole mikään sellainen saavutus, jona sitä pidin.

Se, mikä minulta oli oikeasti mennyt ohi, on Pythia-12B-palkkiomalli, ja se on selvästi vahvin neuroverkkotulos tällä datasetillä: ROC AUC 0,82. Se opettaa vain pareilla, joiden CTR-ero on merkitsevä 5 % tasolla (karkeasti ottaen helpoin 28 %), ja se lukee artikkelin ingressin ja julkaisun aikaleiman otsikon rinnalla. Se on siis helpompi label-setti, jossa on enemmän syötettä eri mittarilla, eikä se voita lukua 0,812. Mutta jos silmäilee näitä kahta lukua rinnakkain, ne näyttävät identtisiltä, ja osoitan sen mieluummin itse kuin annan jonkun muun huomauttaa siitä.

Se mikä tästä kaikesta jää käteen: kukaan ei ole raportoinut parittaista tarkkuutta hienosäädetylle enkooderille suodattamattomilla testinsisäisillä pareilla pelkästä otsikkotekstistä. Se on kapeampi väite kuin ”voittaa SOTA:n”, ja se on sellainen, jota voin oikeasti puolustaa.

## Joten ajoin vertailun itse

Jokainen yllä oleva luku on jonkun muun, mitattuna jonkun muun pareilla. Niinpä laitoin kaksi nykyistä järjestelmää omilleni.

Jokainen pari kysytään kahdesti, kerran voittaja ensimmäisenä ja kerran toisena, ja se lasketaan vain silloin, kun molemmat järjestykset nimeävät saman otsikon. Tällä protokollalla on väliä: mallit valitsevat slotin A sattumaa useammin sisällöstä riippumatta, joten yhden järjestyksen ajo pisteyttää itsensä itse valitsemallaan osajoukolla.

| Järjestelmä | Parametrit | Täsmätyt parit | Itsejohdonmukainen |
|---|---|---|---|
| **VERA** | 435M | **0,823** | — |
| Gemini 3.1 Pro | frontier | 0,751 | 83,7 % |
| Laya typed-decisions | 421M | 0,504 | 52,9 % |

Ja siihen meni se perustelu, johon olin nojannut. Olin sanonut ihmisten suoriutuvan tässä sattumanvaraisesti, vihjaten samalla että tehtävä on vaikea myös malleille. Ei se ole. Gemini saa 0,751. Ihmisten tulos kertoo ihmisistä eikä sano mitään koneista, ja käytin sitä väittämään jotain, mitä se ei tarkoita.

Rehellinen versio on joka tapauksessa parempi: 435 miljoonan parametrin malli voittaa huipputason päättelymallin seitsemällä pisteellä noin tuhannesosalla kutsukohtaisista kustannuksista. 5,60 dollaria Gemini-kutsuja tämän selvittämiseen.

Laya on se avoin päätöksentekomalli, josta kaikki tulevat kysymään, ja se vastaa tässä kolikonheiton johdonmukaisuudella. Se näyttää pahalta jos asian jättää siihen, joten: sen esittelykortti kattaa laskujen käsittelyn, tietoturvapoikkeamat, asiakaspalvelun ja agenttien jäljet. Otsikoiden klikkausprosentti on kaikkien neljän ulkopuolella. Se on domain-sopivuusluku, ja odottaisin VERAn näyttävän aivan yhtä typerältä laskujen käsittelyssä.

Tästä paljastui vielä yksi asia. Gemini saa 0,641 pareilla, joiden klikkausprosentin ero ei saavuta merkitsevyyttä 5 % tasolla (ne, joita olin kutsunut kohinaksi). Se ei ole koskaan nähnyt näitä labeleita. Malli, jolla ei ole pääsyä tulosdataan, voittaa siis arvon 0,500 myös siellä, mikä tarkoittaa, että noissa pareissa on todellisia eroja, joita kokeella ei vain ollut tilastollista voimaa todistaa. Sille, että VERA saa 0,696 samassa kerroksessa, ei tarvita mitään vuotoselitystä, enkä ennen Geminin ajamista aidosti osannut erottaa näitä kahta tulkintaa toisistaan.

## Okei, tässä kohtaa pilaan kaiken

Jokainen yllä oleva luku tulee vuosien 2013–2015 viraaleista someotsikoista yhdeltä julkaisijalta, ja se mitä oikeasti haluan rakentaa, pisteyttää sähköpostien otsikkorivejä.

B2B-uutiskirje, joka menee 4 000 mukaan liittyneelle ihmiselle, ei jaa juuri mitään sellaisen kanssa kuin ”Tämä lapsi tuhosi juuri koko rokotevastaisen argumentin yhdellä lauseella”.

Joten testasin sitä. Redditillä on sama rakenne kuin arkistolla jos sitä katsoo sopivasti silmät sirillään: SNAP julkaisi 132 308 postausta, joissa sama kuva postattiin uudelleen eri otsikolla noin kahdeksan kertaa kukin. Yksi kohde, monta tekstivarianttia, mitattu tulos. 16 242 kuvaa.

Mikään ei ollut siinä satunnaistettua, joten kolme asiaa piti ottaa ensin huomioon. Parit muodostuvat yhden kuvan *ja* yhden subredditin sisällä, joten yhteisötaso kumoutuu. Myöhäinen uudelleenpostaus pärjää huonommin pelkästään siksi, että se on myöhässä, joten sovitin heikkenemisen uudelleenpostausindeksiä vastaan per subreddit ja rankkasin jäännöksen (residual). Pari säilyy vain, jos jäännöksen ero on riittävän suuri voittajan nimeämiseen.

117 118 paria. VERA saa **0,522**. Sattuma on 0,500. Sääntö ”pidempi otsikko voittaa” saa 0,507.

Tällä otoskoolla keskivirhe on 0,0015, joten 0,522 on noin viisitoista keskivirhettä sattuman yläpuolella: todellinen, ja riittävän pieni ollakseen hyödytön. Tarkkuus kyllä nousee jäännöseron myötä, 0,508 → 0,531 kvartiilien yli, mikä kertoo pienen efektin olevan signaalia eikä artefakti. Se vaihtelee r/WTF:n 0,495:stä r/fffffffuuuuuuuuuuuu:n 0,558:aan.

Se vähäinen signaali mitä löytyy, kuuluu siis Upworthylle. Se mitä VERA oppi, on yhden julkaisijan vuoden 2013 ääni, eikä se tule mukanasi.

Varaudunpa omaan varaukseeni: Reddit-ylä-äänet eivät ole klikkausprosentti, ja kellonaika sekä postaajan maine jäävät kontrolloimatta. Nollatulos tässä ei pysty puhtaasti erottamaan ”ei siirtovaikutusta” siitä, että ”sekoittavat tekijät söivät sen”. Mutta se on halvin saatavilla oleva rehellinen testi ja se oli negatiivinen, ja ajan sen mieluummin kuin kirjoitan ”siirtovaikutusta ei ole testattu” ja annan lukijan olettaa parasta.

Testi, jonka oikeasti halusin, vaatii sähköpostidataa. Lähdin siis etsimään julkista sähköpostidataa, jossa olisi oikeita mitattuja lähetystuloksia, eikä sitä ole olemassa.

| Lähde | Koko | Saatavuus |
|---|---|---|
| Return Path -otsikkorivitutkimus | 9M otsikkoriviä | Suljettu, 2015, ei koskaan julkaistu |
| Belkins B2B -korpus | 5,5M sähköpostia | Vain aggregoituja tilastoja |
| Yahoo (IEEE 7004277) | 100k+ riviä, miljardeja näyttökertoja | Suljettu |
| Oraclen NLORP-paperi | 300 riviä | Kaavittu Googlesta, prosentteja ei mitattu |
| Erilaiset Kaggle-sähköpostikampanjasetit | vaihtelee | Malleja tai synteettisiä |

Yksi noista on kahden Oraclen johtavan datatieteilijän arXiv-paperi, jonka koko datasetti on ”300+ erilaista erikoistarjoussähköpostien otsikkoriviä, poimittu useista internet-lähteistä Google-haulla”. En muuten dissaa heitä, tuo vain on aidosti sitä mitä on tarjolla.

Aggroidut havainnot pyörivät vapaasti saatavilla (kuudesta kymmeneen sanaa toimii parhaiten, 21–40 merkkiä avauksille, numerot tuovat muutaman pisteen), mutta mikään siitä ei ole lähetyskohtaista tulosdataa eikä mikään siitä opeta yhtään mitään.

## Mikä asettaa koko harjoituksen uuteen valoon

Olin kertonut itselleni mukavaa pientä tarinaa, kunnes toinen mielipide kaatoi sen. Tarina kuului niin, että *arkkitehtuuri on bulkkia, pysyvä arvo on omissa tuloslabeleissa*. Ensimmäinen puolisko on oikeassa, mutta toinen puolisko on hölynpölyä, koska minulla ei *ole* omia labeleita. Upworthy on julkinen, kuka tahansa jolla on GPU voi toistaa tämän viikonlopussa halvemmalla kuin kahvikupillinen. Se on osasyy siihen, miksi painot ovat vain jaossa: ne maksoivat minulle neljä dollaria enkä voi väittää niiden olevan mikään vallihauta.

Se mitä minulla oikeasti on, on näyttö osaamisesta. Todellinen voimavara olisi jatkuva mittaussilmukka elävässä liikenteessä, eikä sellaista vielä ole olemassa.

Tarvitsemani data makaa sähköpostipalveluntarjoajien (ESP) sisällä tekemättä mitään. Jokaisella ESP:llä, jolla on A/B-testausominaisuus, on miljoonia otsikkorivikokeita mitatuilla tuloksilla, ja suunnilleen yksikään niistä ei opeta sillä mitään. En siis tarvitse uutta päätä tai uutta benchmarkia, tarvitsen yhden ihmisen, jolla on lokit.

## Asia, johon tämä yleistyy

Resepti on suoraan sanottuna niin tylsä, että se mahtuu yhdelle riville: jos mitattu tulos on olemassa, opeta sillä, ja lopeta mallin mielipiteen kysyminen.

Jokainen A/B-testi, jonka yrityksesi on koskaan ajanut, makaa jollain kokeilualustalla, profiloituna, tulos liitettynä, tekemättä mitään. Optimizely, Statsig, LaunchDarkly, mitä ikinä käytätkin, se on vuosikausia koodia ”kokeiltiin näitä viittä ja tämä voitti” eikä kukaan ole opettanut sillä mitään.

Missä tahansa sinulla on ehdokasjoukko ja numero, joka näkyy myöhemmin putkessa, sama pätee:

| Päätös | Label, joka sinulla jo on |
|---|---|
| Otsikkorivit, otsikot, push-tekstit | avaukset, klikkaukset |
| Tukimakron valinta | ratkaistu ilman eskalointia |
| Tiedonhaun uudelleenjärjestäminen | minkä tuloksen käyttäjä hyväksyi |
| Virheilmoituksen muotoilu | hoiti itse, tai teki tukipyynnön |
| Tuotelistausten otsikot | konversiot |
| Agentin työkalun valinta | onnistuiko toimintaketju |

Viimeinen rivi on se hauska, jos rakennat agentteja. Jevin kolme primitiiviä ovat choice, score ja noul, ja kaikki tässä kirjoituksessa koskettaa kohtaa `score`. Sama liike toimii kuitenkin kohtaan `choice` missä tahansa, missä joku loggasi mitä päätöksen jälkeen tapahtui, mikä useimmissa agenttien reitityksissä tarkoittaa toistaiseksi ei ketään.

Yksi rehellinen rajoitus tälle kaikelle kuitenkin on: minulla on tasan yksi datapiste. Tuloksilla opettaminen voitti zero-shot-arvioinnin reilusti *yhdessä tehtävässä*, ja se, pitääkö tuo marginaali missään muualla, on testaamatta. Löisin siis vetoa suunnan, en luvun puolesta.

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

Lue pisteet joukkona, älä koskaan yksittäisenä numerona. Opetuskohde oli poikkeama testin omasta keskiarvosta, joten yksi pistemäärä yksinään ei tarkoita mitään. Annat sille ne 3–6 varianttia, jotka kirjoitit yhtä lähetystä varten, ja se laittaa ne järjestykseen. Mukana on myös kalibroija, joka muuntaa pisteet odotetuksi nostoksi.

Ja jos 435M on liian raskas, saatavilla on myös CPU-kokoinen versio: ModernBERT-base saa 0,761 kolmasosalla parametreista.

## Mitä se ei tee

Siirry sähköpostiin, tai ainakaan minulla ei ole aavistustakaan tekeekö se niin.

Joten jos pyörität uutiskirjettä ja sinulla on menneitä lähetyksiä mitatuilla avaus- tai klikkausprosenteilla, haluaisin aidosti ottaa selvää, ota yhteyttä, ja data pysyy sinun.

## Opetus

Yksi tämän alan avoimien painojen malleista saa omassa typed-decisions-benchmarkissaan nollalaukauksella (zero-shot) tuloksen 0,362, mikä on alle enemmistöluokan 0,461 perussuoritustason.

Eikä parannus tullut nokkelasta mallinnuksesta: suurin osa tuli siitä, että valittiin mittariin sopiva häviöfunktio, ja loput 47 168 rivistä, joissa joku mittasi mitä oikeasti tapahtui. Joten joo, jos labeloit dataasi kysymällä mallilta, kannattaa ehkä ensin etsiä perustotuutta, se luultavasti makaa jo jossain valmiina.

## Huomautus numeroista

Kaksi asiaa muuttui 24.9.2026 sen jälkeen, kun laitoin mallin lukemaan tämän kirjoituksen kriittisesti ja käymään koodin kimppuun.

Arviointini kutsui funktiota `pairs_from`, joka pitää yhden parin testiä kohden: parhaan haaran huonointa vastaan. Opetus taas muodosti jokaisen parin. Joten se 0,812 jota olin lainannut, olikin kunkin testin laajimman eron pari, ja todellinen kaikkien parien luku on **0,689**. Jokainen tämän kirjoituksen luku perustuu nyt täyteen 18 485 pariin.

Lisäksi olin antanut OpenJev-pohjalle kunnian hypystä arvosta 0,519 ajamatta koskaan kontrolliajoa. Tavallinen `microsoft/deberta-v3-large` saa tuloksen 0,805 verrattuna 0,812:een samalla setillä, joten pohja ei tehnyt mitään mitä voisin mitata ja parannus johtui oppimisnopeudesta.

Ablaatio-osion luvut perustuvat kaikki vanhaan 2 137 parin settiin. Ne asettuvat yhä oikeaan keskinäiseen järjestykseen, koska jokainen ajo pisteytettiin samalla tavalla.

---|---|---|---|
| jokainen testinsisäinen pari | 18 485 | 0,524 | **0,689** |
| paras haara huonointa vastaan, yksi per testi | 2 137 | 0,546 | 0,812 |

Kaksitoista pistettä. Mikä on pahempi kuin ne seitsemän pistettä, joiden kiinnisaamisesta olin mielissäni tämän kirjoituksen ensimmäisellä puoliskolla.

Tässä on vielä yksi tietty juttu, joka kirpaisee. Ylempänä hylkään Pythia-12B-tuloksen, koska se ”opettaa vain pareilla, joiden CTR-ero on merkitsevä 5 % tasolla – karkeasti ottaen helpoin 28 %”. Oma arviointisettini oli 70 % merkitsevä. Kritikoin suodatinta, jota olin itse soveltanut vielä kovemmin, lauseessa jonka kirjoitin huolellisuudesta.

Sitten sama arviointi kysyi, miksi en ollut koskaan ajanut kontrollia perusmallille. `openjev2`-ajo muutti perusmallin *ja* oppimisnopeuden yhdellä kertaa, ja olin pistänyt tuloksen päätöksentekomallin esikoulutuksen piikkiin. Ajoin siis tavallisen `microsoft/deberta-v3-large`-mallin täysin saman reseptin läpi.

| Pohja | Holdout, sama parisetti |
|---|---|
| open-jev-deberta-v3-large | 0,812 |
| microsoft/deberta-v3-large | 0,805 |

Seitsemän tuhannesosaa, kun keskivirhe on lähellä yhdeksää. Päätöksentekomallin esikoulutus ei tehnyt mitään mitä pystyisin mittaamaan. Hyppy arvosta 0,519 johtui oppimisnopeudesta, ja se pätee kumpaankin pohjaan. Tämän tekstin otsikko oli ”Fine-tuning OpenJev on 62,695 A/B Tests”, ja sen molemmat puoliskot olivat väärin.

Muutamia pienempiä asioita samasta katselmoinnista, kaikki todellisia: painojen mukana toimitettu kalibroija oli sovitettu *eri mallilla*; bootstrap-otantani käytti `.isin()`-metodia otokseen, joka oli poimittu palauttaen, mikä pudottaa kaksoiskappaleet hiljaa pois ja tekee siitä 63 % aliotoksen; sattumaperussuoritukseni heittivät kaksi pistettä, koska en ollut koskaan laskenut niitä todellisista haaramääristä; ja tulostaulussani oli yhden mallin tulos 2 137 parilla toisen 1 788 parin vieressä ilman mitään mainintaa asiasta.

Kaikki on korjattu ja uudelleenmitattu 24.9.2026. Mallikortti, datasetti ja tämä kirjoitus sisältävät kaikki korjatut luvut.

Mitä tästä ottaisin mukaan, ilmiselvän lisäksi: huomasin ensimmäisen virheen, koska kaksi jakoa olivat eri mieltä keskenään, minkä data teki pyytämättä. En huomannut toista virhettä, enkä olisi huomannutkaan, koska kaikki kyseisen funktion jälkeen oli sisäisesti johdonmukaista. Jokainen ablaatio käytti samaa settiä, joten ne asettuivat oikeaan keskinäiseen järjestykseen. Luokat nousivat monotonisesti. Lähes-kaksoiskappaleiden viipale käyttäytyi odotetusti. Mikään ei näyttänyt väärältä, koska mikään *ei ollut* väärin lukuun ottamatta akselin otsikkoa.

Kriittinen katselmointi löysi sen kahdessakymmenessä minuutissa käytännössä nollakustannuksella. Julkaisin tämän osion paljon mieluummin itse kuin annoin jonkun muun kirjoittaa sen kommenttikenttään.

---

*Data: [The Upworthy Research Archive](https://osf.io/jd64p/). Matias, J., Munger, K., Le Quere, M.A., Ebersole, C. (2021), Nature Scientific Data. CC BY 4.0. Kokeet väliltä 25. kesäkuuta 2013 ja 10. tammikuuta 2014 on jätetty kautta linjan pois ylläpitäjien vuonna 2024 ilmoittaman satunnaistusvirheen vuoksi. Painojen DOI: [10.57967/hf/10573](https://doi.org/10.57967/hf/10573).*
