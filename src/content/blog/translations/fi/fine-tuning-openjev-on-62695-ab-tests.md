---
title: "OpenJevin hienosäätö 62 695 A/B-testillä"
date: 2026-09-23
tags: [ml, decision-models, calibration, open-weights, benchmarks]
draft: false
description: "Koulutin päätöksentekomallin A/B-testeillä, joita ihmiset oikeasti ajoivat, sen sijaan että kysyisin toiselta mallilta mielipidettä. Se väistää huonoimman varianttisi 90 % ajasta, ja ensimmäinen suorituskykytestini mittasi kirjaimellisesti ei yhtikäs mitään lol"
---

Uusien päätöksentekomallien päälle on rakennettu suunnilleen 300 julkista projektia, ja kävin läpi niistä "pisteytys ja järjestäminen" -kategoriassa olevat (26 kpl). Jokainen niistä pisteyttää asioita vain kysymällä mallilta, mitä se on mieltä. Pisteytä tämä artikkeli kahdeksalla laatuasteikolla, arvioi tämän tekstin tyylikkyys, tuomitse onko tämä dokumentti relevantti, tiedättehän idean.

Ja siis, eihän se ole dataa? Se on mallin mielipide, johon on nidottu numero kylkeen, ja koko kategoria on rakennettu sen päälle, suoraan sanottuna.

Joten koulutin mallin tuloksilla, joita joku oikeasti mittasi, ja painot ovat jaossa jos haluat kokeilla: **[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)**, Apache 2.0, 435M parametria, yksi eteenpäinvienti (forward pass), pisteyttää lyhyttä suostuttelevaa tekstiä. Pohjana on [`com-kotobalabs/open-jev-deberta-v3-large`](https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large), joka itsessään on tyypitettyihin päätöksiin esikoulutettu DeBERTa-v3-large.

| Mittari | Tämä malli | Sattuma | Gemini 3.1 Pro |
|---|---|---|---|
| Parittainen tarkkuus, näkemätön jako | **0,812** | 0,546 | 0,751 |
| Vain puhtaat parit | **0,797** | 0,546 | - |
| Valitsee parhaan 4–5 variantista | **47,7 %** | 23,0 % | - |
| Välttää huonoimman variantin | **90,3 %** | 77,0 % | - |
| Reddit-otsikkoparit, toiselta aihealueelta | 0,522 | 0,500 | - |

Malli on koulutettu 62 695 todellisella A/B-haaralla 32 487 satunnaistetusta otsikkokokeesta, ja jokainen yllä oleva numero tulee jaosta, jota malli ei koskaan nähnyt. Miten tähän päästiin, selviää alta, mukaan lukien se kohta, jossa ensimmäinen suorituskykymittaukseni ei mitannut yhtikäs mitään (kyllä, se kismittää minua edelleen vähän).

## Asetelma

Tähän löytyykin täydellinen datajoukko, ja se on ollut vapaasti saatavilla vuodesta 2021 asti. Tammikuun 2013 ja huhtikuun 2015 välillä Upworthy (kyllä, *se* Upworthy, "et usko mitä tapahtui seuraavaksi" -tyypit) ajoi 32 487 satunnaistettua A/B-testiä otsikoillaan: oikeaa liikennettä, oikea satunnaistus, 538 miljoonaa kohdistusta, ja sitten Cornell meni ja julkaisi koko roskan [Upworthy Research Archive](https://osf.io/jd64p/) -nimellä CC BY -lisenssillä. Jokainen otsikkovariantti, jokainen näyttökerta, jokainen klikkaus.

Se on suunnilleen niin lähellä pohjatotuutta (ground truth) kuin lyhyt suostutteleva teksti voi päästä.

Eli: ModernBERT-large regressiopäällä, ja kohteena kutistettu (shrunk) logit-klikkaussuhde keskitettynä kunkin testin omaan keskiarvoon. Keskityksellä on muuten väliä: *artikkeli* selittää suurimman osan klikkaussuhteen varianssista eikä otsikko voi sitä selittää, joten se mitä oikeasti halutaan ennustaa, on kuinka kaukana tietty haara on sen testin keskiarvosta, jossa se pyöri. Sitten beeta-binomiaalinen kutistus (shrinkage) kohti kyseistä keskiarvoa, jolloin 600 näyttökerran haara lasketaan pääasiassa aiemmaksi oletukseksi (prior) ja 20 000 näyttökerran haara pääasiassa suoraksi näytöksi.

Kaksikymmentäviisi minuuttia yhdellä L4-kortilla, noin neljäkymmentä senttiä. Jätin kaiken tammikuun 2015 jälkeisen datan sivuun, testasin sillä ja sain **0,704 parittaisen tarkkuuden.**

Mittakaavan vuoksi: lähin julkaistu luku suodattamattomille pareille on [0,544](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682) torontolaiselta ryhmältä, joka käytti käsin tehtyjä kielellisiä piirteitä, ja heidän tutkimuksensa toteaa ongelman olevan "luonnostaan vaikea, eikä pelkkä otoskokokysymys". Palaan myöhemmin siihen, miksi tuo 0,544 on huonompi vertailukohta miltä se näyttää, ja myöhemmin lopetan muiden lukujen lainaamisen ja ajan vertailun itse.

Kuusitoista pistettä sen yli neljälläkymmenellä sentillä. Joten tietenkin kirjoitin siitä: "Otsikkosignaali kestää kahden vuoden ryömynnän (drift)."

## Ja silti

Tuon otsikon väite oli, että signaali kestää *ryömintää*, koska koulutusdata oli vuosilta 2013–2014, testijoukko vuodelta 2015, ja tarkkuus tuskin liikahti, ikään kuin kahden vuoden muuttuva internet-kulttuuri ei olisi kiinnostanut mallia pätkääkään. Se olisi oikea löydös jos se pitäisi paikkansa, ja sillä on väliä, koska koko homman pointti on lopulta suunnata se sähköpostien otsikkoriveihin, ja jos se ei kestä kahta vuotta yhden ainoan julkaisijan sisällä, se ei taatusti kestä hyppyä täysin toiseen mediaan.

Arkisto toimitetaan kolmessa jaossa (exploratory, confirmatory, holdout), ja olin kouluttanut ja testannut confirmatory-jaolla. Joten enimmäkseen huolellisuuttani ja täysin olettaen vahvistavani sen, minkä jo "tiesin", pisteytin samat painot kahdella muulla jaolla.

```
confirmatory 2015:  0.704
holdout:            0.637
exploratory:        0.624
```

Kiva.

Kaksi jakoa, joihin en ollut koskenutkaan, olivat samaa mieltä keskenään 0,013 tarkkuudella *jokaisella efektikokotasolla*, ja molemmat kertoivat pääotsikkotulokseni olleen seitsemän pistettä liian korkea.

![Parittainen tarkkuus Upworthy-arkiston kolmessa jaossa. Confirmatory 2015 -viiva on selvästi holdout- ja exploratory-jakojen yläpuolella, jotka seuraavat toisiaan läheisesti.](/assets/img/blog/decision-models/splits.png)

## Aikakone, joka liikkuu vain sivuttain

Luinkin arkiston dokumentaation tällä kertaa kunnolla, ja kävi ilmi, että arkisto jakaa testit osioihin **satunnaisesti**. Ei aikajärjestyksessä, vaan satunnaisesti.

![Kaksi palkkia. Ensimmäinen näyttää puhtaan aikajärjestyksen mukaisen jaon, ensin koulutus sitten testi. Toinen näyttää todellisen rakenteen: koulutus- ja testilohkot lomittain koko ajanjaksolla.](/assets/img/blog/decision-models/split-structure.png)

| Jako | Haarat | Päivämääräväli | Osuus ennen vuotta 2015 |
|---|---|---|---|
| confirmatory | 51 891 | 2013-01-24 → 2015-04-30 | 83,5 % |
| holdout | 11 231 | 2013-01-24 → 2015-04-29 | 82,8 % |
| exploratory | 10 804 | 2013-01-26 → 2015-04-29 | 83,8 % |

Kaikki kolme jakoa kattavat samat päivät samoissa suhteissa, mikä tarkoittaa, että kun pisteytin holdout-jaolla, 83 % testaamastani datasta tuli *koulutusjakson sisältä*. Sama aikakausi, sama talon tyyli, sama kaikki, vain testejä, joita malli ei ollut koskaan nähnyt, ja silti se pärjäsi siellä *huonommin* kuin vuoden 2015 häntäpäässä.

Toisinpäin käännettynä se on rehellisesti sanottuna aika koomista: aika ei maksa tälle mallille juuri mitään, kun taas saman ajanjakson näkemättömät testit maksavat sille seitsemän pistettä. Huolella rakentamani ryömintätesti oli koko ajan mitannut vain testien identiteettiä, se oli vain pukeutunut ajallisen yleistämisen valepukuun.

Olin rakentanut aikakoneen, joka liikkuu vain sivuttain.

## Kaksi hypoteesia, molemmat väärinpäin

Seuraava ajatus oli tietenkin vuoto (leakage). Upworthy kirjoitti saman artikkelin kymmenillä eri otsikkovariaatioilla, joten jos jaat *testit* satunnaisesti, yhden artikkelin uudelleenkirjoitukset leviävät kaikkiin kolmeen jakoon, ja holdout-joukon pitäisi olla täynnä koulutustekstin melkein-kopioita.

Kirjoitin nopean käänteisindeksivirityksen mittaamaan maksimaalisen Jaccard-token-päällekkäisyyden jokaisen arviointiotsikon ja niiden 38 950 otsikon välillä, joihin malli todellisuudessa sovitettiin (tarkka merkkijonovertailu oli löytänyt viisi jaettua otsikkoa 650:stä, ja kyllä, olin sen perusteella todennut vuodon "poissuljetuksi").

| Arviointijoukko | n | ≥0,9 päällekkäisyys | mediaani |
|---|---|---|---|
| confirmatory 2015 | 1 300 | 0,5 % | 0,227 |
| holdout | 4 274 | **30,5 %** | 0,300 |

Kolmekymmentä prosenttia, kuusikymmentä kertaa enemmän saastunut kuin vuoden 2015 häntä, ja malli sai **huonommat** pisteet.

Vuoto ei siis selitä eroa, se toimii täysin väärään suuntaan. Jos mitään, se tarkoittaa, että rehellisen holdout-luvun pitäisi olla *huonompi* kuin 0,637, kunhan melkein-kopiot siivotaan pois. Tarkistin senkin dumppaamalla parikohtaiset pisteet ja siivuttamalla ne, ja aidosti puhtailla pareilla malli sai 0,646, hieman *paremmin*, joten melkein-kopiot eivät tuoneet sille yhtään mitään etua.

Selvä, kohinaa nimikkeissä (label noise) sitten? Ehkä holdout-pareilla on vain vähemmän näyttökertoja.

| Arviointijoukko | mediaaninäyttökerrat | mediaani-z | mediaani-CTR-suhde |
|---|---|---|---|
| confirmatory 2015 | 2 462 | 2,37 | 2,24 |
| holdout | 3 096 | 2,64 | 1,99 |

Tämäkin väärinpäin lol. Holdout-pareilla on *enemmän* näyttökertoja ja *korkeammat* z-pisteet. Vuoden 2015 setissä on kyllä laajempi mediaani-CTR-suhde (2,24 vs. 1,99), joten sen parit on aidosti helpompi erottaa toisistaan, mikä on totta, mutta se ei ole lähelläkään seitsemän pisteen arvoista.

Joten kirjoitin dokumenttiin "selittämätön" ja siirryin eteenpäin. 0,63 on se luku, kaksi toisistaan riippumatonta jakoa on siitä samaa mieltä, eri mieltä oleva on poikkeama, enkä osaa sanoa miksi.

**!! Nörtti-infopläjäysvaroitus :3 !!**

## Osa, jolla oli oikeasti merkitystä

Kun olin murskannut oman otsikkotulokseni, ajattelin, että pitäisi ainakin ajaa ablaatiot kunnolla.

Odotin datan voittavan, koska se on se tylsä perusoletus: sinulla on 62 695 haaraa, heitä kolmas jako mukaan, saat enemmän. Joten pystytin kaksi ajoa, toisessa lisättiin exploratory-jako koulutukseen ja toisessa vaihdettiin häviöfunktio (loss function), molemmat arvioituna samoilla 2 137 holdout-parilla.

```
Phase 0        confirmatory       MSE              0.637
more-data      expl+confirmatory  MSE              0.724
rank           confirmatory       Bradley-Terry    0.775
rank+more      expl+confirmatory  Bradley-Terry    0.787
```

![Ablaatioiden tulokset. Datan lisääminen tuo 0,087 parannuksen perustasoon; vaihtaminen Bradley-Terryyn tuo 0,138 parannuksen, ja paras ajo saavuttaa arvon 0,812.](/assets/img/blog/decision-models/ablations.png)

Kaksikymmentäkahdeksan prosenttia enemmän koulutusdataa toi **+0,053**, ja häviöfunktion vaihtaminen toi **+0,107**, kahdella aikakaudella (epoch) kolmen sijaan ja pienemmällä koulutussetillä, ja se voitti silti tuplasti.

Mikä on jälkikäteen ajateltuna ilmiselvää, sitä pahinta lajia ilmiselvää. Vertailukohtana on *parittainen tarkkuus*, eli valitse voittaja kahdesta otsikosta, ja minä tein regressiota klikkaussuhteeseen. Optimoin siis mittarin sijaismuuttujaa (proxy) ja arvostelin sitten itseni varsinaisella mittarilla.

[Bradley-Terry](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) optimoi itse asiaa. Jokaiselle testin sisäiselle haaraparille maksimoidaan `logsigmoid(score_winner - score_loser)`, painotettuna ohuemman haaran logaritmisilla näyttökerroilla. Omat 38 950 koulutushaaraani muuttuivat 63 597:ksi testinsisäiseksi pariksi.

Sama malli. Sama data. Eri tavoitefunktio. Neljätoista pistettä.

Ajoin uteliaisuudesta myös ModernBERT-*basen* (kolmasosa parametreista) ja se osui arvoon 0,761, joten suurin osa tästä asuu tavoitteessa ja datassa eikä mallin koossa, mikä on kiva juttu, jos haluaa joskus ajaa tätä prosessorilla.

Sitten on se, joka oli vähällä mennä ohi suun. Kokeilin päätöstehtäviin esikoulutettua DeBERTa-v3-large-varianttia, ja sen häviö pysyi tasan arvossa `-log(0.5)` kaikki 4 804 askelta ja tulos oli 0,519, mikä on puhdasta sattumaa, täysin tasapaksu.

Se on helppo tulkita niin, että "DeBERTa on huonompi", ja siirtyä eteenpäin, ja melkein teinkin niin. Mutta häviökäyrä, joka on *täydellisen* tasainen juuri sillä arvolla, joka tarkoittaa "arvailen vain", on todella spesifi signaali, eikä se näytä siltä, miltä huonosti oppiva malli näyttää. Enkooderi oli myös latautunut aivan hyvin, vain luokittelija ja yhdistäjä (pooler) oli alustettu puhtaalta pöydältä.

Kyse oli oppimisnopeudesta (learning rate). DeBERTa-v3-large on [tunnetusti epävakaa](https://github.com/microsoft/DeBERTa/issues/77) arvolla 2e-5, johon ModernBERT on tyytyväinen, ja se haluaa jotain lähempänä arvoa 6e-6, ja olin käyttänyt samaa konfiguraatiota molemmille, koska miksipä ei.

Ajoin sen uudelleen arvolla 6e-6, häviö meni 0,709 → 0,682 → 0,620 → 0,360, ja lopputulos oli **0,812**, kaksi ja puoli pistettä yli ModernBERTin, ja 0,913 korkeimman luottamustason ryhmässä.

Ajoin sillekin melkein-kaksoiskappaleiden siivutuksen, koska tässä vaiheessa en enää luota itseeni, ja aidosti puhtailla pareilla (ei mitään koulutusdataa muistuttavaa) se saa **0,797** vastaan ModernBERTin 0,769. Sen ulkoaoppimisrako (memorization gap) on myös *pienempi* kuin ModernBERTin samalla kun tulos on parempi, mikä on täysin päinvastaista sille, miltä ulkomuistilla voittava malli näyttää.

Järjestelmä siis toimi koko ajan hienosti, minulla oli vain yksi luku väärin.

## Mutta mitä 0,812 oikeasti *tarkoittaa*

Rehellisesti sanottuna ihmiselle ei mitään. Se on parittaisen tarkkuuden ongelma väitteenä: se kertoo, että järjestys on oikea, muttei kerro mitään suuruusluokasta. Kahden otsikon oikea järjestäminen 81,2 % ajasta voi olla omaisuuden arvoista tai täysin arvotonta riippuen siitä, kuinka kaukana ne todellisuudessa ovat toisistaan.

Joten mittasin sitä, mitä joku tekstiä oikeasti lähettävä kokisi. Otetaan jokaisesta testistä mallin parhaat pisteet saanut haara ja verrataan sen todellista klikkaussuhdetta kaikkien kyseisen testin haarojen keskiarvoon. Ilman mallia ei nimittäin ole mitään syytä suosia mitään tiettyä varianttia, joten sen keskiarvo, mitä olisit saattanut lähettää, on rehellinen vertailukohta (counterfactual).

| | CTR |
|---|---|
| Testin keskiarvo, ei mallia | 1,20 % |
| Mallin valinta | 1,42 % |
| Oraakkeli, täydellinen valinta | 1,60 % |

Se tekee **+18,3 % suhteellisen klikkaussuhteen parannuksen** 2 140 testin yli, ja minun on heti otettava se teiltä pois.

### Nostoluku ei siirry mukana

18,3 % on fakta Upworthysta. Se riippuu heidän 1,20 % perussuhteestaan ja siitä, miten paljon hajontaa heidän kirjoittajansa saivat aikaan varianttien välille. Suuntaa tämä B2B-uutiskirjeeseen, jonka klikkaussuhde on 2,5 % ja variantit tiukempia, ja luku muuttuu suuntaan, jota en aidosti pysty ennustamaan.

Se mikä *siirtyy*, on kaikki, mikä on suhdelukua yksittäisen testin sisällä:

| Mittari | Arvo |
|---|---|
| Välttää huonoimman variantin | **90,3 %** |
| Voittaa testin keskiarvon | 76,6 % |
| Valitsee oikeasti parhaan variantin | 47,7 % |
| Saavutettu potentiaali (headroom), mediaanitesti | 89,2 % |
| Spearman, pisteet vs. klikkaussuhde | 0,526 |

**90,3 % on se luku, jonka takana oikeasti seison.** Se ei melkein koskaan anna sinun lähettää huonointa kirjoittamaasi juttua, ja se kestää perussuhteen, yleisön ja median vaihtumisen tavalla, jota "+18,3 %" ei vain tee. Ja 47,7 % ykkösvalinnan osuus yleensä neljän tai viiden haaran joukosta on noin 2,2-kertainen sattumaan verrattuna.

Yksi noista tosin huijaa hieman. Saavutetun potentiaalin mediaani on 89,2 %, kvartiilivälillä 5 % – 100 %, ja kaikkien testien yli yhdistettynä se on 55,4 %. Malli on bimodaalinen: useimmissa testeissä se nappaa lähes kaiken saatavilla olevan hyödyn ja vähemmistössä se ei nappaa lähes mitään, ja nuo vetävät kokonaisuutta alas.

Sitten sovitin päälle [isotonisen regression](https://en.wikipedia.org/wiki/Isotonic_regression), jotta pisteillä olisi yksiköt pelkän fiiliksen sijaan. Isotoninen sopii tähän, koska se olettaa vain monotonisuutta (korkeammat pisteet, korkeampi klikkaussuhde), mikä on juuri se mitä Bradley-Terry takaa ja kirjaimellisesti kaikki mitä se takaa. Mikä tahansa parametrinen malli keksisi rakennetta, jota malli ei koskaan luvannut. Luottamusvälit tulevat bootstrap-otannasta *testeittäin* pikemminkin kuin haaroittain, koska saman testin haarat jakavat artikkelin eivätkä ole toisistaan riippumattomia.

| Pisteet | vs. perustaso | 90 % väli |
|---|---|---|
| −2,72 | **−19,1 %** | [−0,252, −0,209] pp |
| −1,06 | −8,2 % | [−0,111, −0,086] pp |
| −0,20 | −0,7 % | [−0,023, −0,000] pp |
| +0,56 | +3,7 % | [+0,030, +0,056] pp |
| +1,62 | +11,1 % | [+0,115, +0,147] pp |
| +2,82 | **+21,8 %** | [+0,231, +0,274] pp |

![Kalibrointikäyrä. Klikkaussuhde suhteessa perustasoon nousee monotonisesti mallin pisteiden myötä, ja 90 % välit leikkaavat nollan vain lähellä keskikohtaa.](/assets/img/blog/decision-models/calibration.png)

Ja katsokaa noita keskirivejä: välit leikkaavat nollan siinä kohdassa, missä malli aivan oikein toteaa "nämä kaksi ovat sama otsikko, heitä kolikkoa".

## Siitä 0,544:stä

Sanoin palaavani siihen. Kun aloin tutkia kunnolla mitä muuta tämän arkiston parissa on tehty, vertailukohta johon olin nojannut heikkeni huomattavasti, ja eräs asia jonka olin ohittanut muuttui paljon olennaisemmaksi.

| Lähde | Tehtävä | Mittari | Arvo | Sattuma |
|---|---|---|---|---|
| LOLA, ihmiset (n=4 571) | paras k:sta | tarkkuus | ~sattuma | 0,330 |
| LOLA, GPT-4 kontekstissa | paras k:sta | tarkkuus | 0,400 | 0,330 |
| LOLA, LoRA Llama-3-8B | paras k:sta | tarkkuus | 0,469 | 0,330 |
| LOLA, hienosäädetty GPT-4o | paras k:sta | tarkkuus | 0,488 | 0,330 |
| [arXiv:2506.00152](https://arxiv.org/abs/2506.00152), Pythia-12B | merkitsevät parit, + ingressi + aikaleima | ROC AUC | 0,82 | 0,50 |
| [PLOS ONE 0281682](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682) | parit sovitettu artikkeliin+kuvaan+viikkoon, K≤15 | tarkkuus | 0,544 | ~0,50 |
| **VERA** | kaikki testinsisäiset parit, vain otsikko | tarkkuus | **0,812** | 0,546 |

Yksikään noista riveistä ei ole suoraan vertailukelpoinen omani kanssa, mikä on koko homman ydin.

0,544-paperi sovittaa parit artikkeliin, kuvaan *ja* testiviikkoon, ja tekee sitten satunnaisotannan kaikista kokeista, joissa on yli 15 paria. Se koulutetaan 5 048 parilla. Lisäksi se on rekisteröity raportti (registered report), jonka ensimmäinen hypoteesi on "voidaanko tätä ennustaa lainkaan sattumaa paremmin" — merkitsevyystesti. Kukaan ei yrittänyt siellä maksimoida tarkkuutta. Sen voittaminen 27 pisteellä 435 miljoonan parametrin mallilla kertalukua suuremmalla datamäärällä ei ole sellainen saavutus, jona sitä pidin.

Se minkä olin oikeasti ohittanut, on Pythia-12B-palkkiomalli, ja se on kirkkaasti vahvin neuraalinen tulos tällä datajoukolla. ROC AUC 0,82. Se koulutetaan vain pareilla, joiden CTR-ero on merkitsevä 5 % tasolla — karkeasti helpoin 28 % — ja se lukee artikkelin ingressin ja julkaisun aikaleiman otsikon rinnalla. Kyseessä on siis helpompi nimikejoukko, jossa on enemmän syötettä eri mittarilla, eikä se silti voita lukua 0,812. Mutta jos vilkaiset kahta lukua vierekkäin, ne näyttävät identtisiltä, ja osoitan sen mieluummin itse kuin annan jonkun muun huomauttaa siitä.

Mikä tästä kaikesta jää käteen: kukaan ei ole raportoinut hienosäädetyn enkooderin parittaista tarkkuutta suodattamattomista testinsisäisistä pareista pelkän otsikkotekstin perusteella. Se on kapeampi väite kuin "voittaa huipputason (SOTA)", ja sitä pystyn oikeasti puolustamaan.

## Joten ajoin vertailun itse

Jokainen yllä oleva luku on jonkun muun mittaama jonkun muun pareilla. Joten laitoin kaksi nykyistä järjestelmää omien parieni kimppuun.

Kumpaakin paria kysytään kahdesti, kerran voittaja ensin ja kerran toisena, ja tulos lasketaan vain, kun molemmat järjestykset nimeävät saman otsikon. Tällä protokollalla on väliä: mallit valitsevat vaihtoehdon A sattumaa useammin sisällöstä riippumatta, joten yhdellä järjestyksellä ajettu testi pisteyttää itsensä itse valitsemallaan osajoukolla.

| Järjestelmä | Parametrit | Vastatut parit | Johdonmukainen itsensä kanssa |
|---|---|---|---|
| **VERA** | 435M | **0,823** | — |
| Gemini 3.1 Pro | frontier | 0,751 | 83,7 % |
| Laya typed-decisions | 421M | 0,504 | 52,9 % |

Ja siihen meni väite, johon olin nojannut. Olin sanonut, että ihmiset osuvat tässä sattuman tasolle, vihjaten samalla että tehtävä on vaikea myös malleille. Ei se ole. Gemini saa 0,751. Ihmistulos kertoo ihmisistä eikä sano koneista mitään, ja käytin sitä väittämään jotain mitä se ei tarkoita.

Rehellinen versio on joka tapauksessa parempi: 435M-malli voittaa frontier-tason päättelymallin seitsemällä pisteellä suunnilleen tuhannesosalla kutsukohtaisesta hinnasta. 5,60 dollarilla Gemini-kutsuja tämän selvittämiseksi.

Laya on avoin päätöksentekomalli, josta kaikki tulevat kysymään, ja se vastaa tässä kolikonheiton johdonmukaisuudella. Se näyttää pahalta jos asian jättää siihen, joten: sen mallikortti kattaa laskujen käsittelyn, tietoturvaloukkaukset, asiakaspalvelun ja agenttijäljet. Otsikoiden klikkaussuhde on kaikkien neljän ulkopuolella. Kyse on toimialasopivuusluvusta, ja olettaisin VERAn näyttävän aivan yhtä typerältä laskujen käsittelyssä.

Tästä paljastui vielä yksi juttu. Gemini saa 0,641 pareilla, joiden klikkaussuhteen ero ei ole tilastollisesti merkitsevä 5 % tasolla — niillä, joita olin kutsunut kohinaksi. Se ei ole koskaan nähnyt näitä nimikkeitä. Malli, jolla ei ole pääsyä tulosdataan, voittaa siis arvon 0,500 myös siellä, mikä tarkoittaa että näissä pareissa on todellisia eroja, joita kokeen tilastollinen voima ei vain riittänyt todistamaan. VERAn saavuttama 0,696 samassa ryhmässä ei vaadi vuotoselitystä, enkä ennen Geminin ajamista aidosti osannut erottaa näitä kahta tulkintaa toisistaan.

## No niin, tässä kohtaa pilaan kaiken

Jokainen yllä oleva luku tulee yhden julkaisijan vuosien 2013–2015 viraaleista some-otsikoista, ja se mitä oikeasti haluan rakentaa, pisteyttää sähköpostien otsikkorivejä.

B2B-uutiskirje, joka menee 4 000:lle mukaan liittyneelle ihmiselle, ei jaa juuri mitään sellaisen kanssa kuin "Tämä lapsi tuhosi koko rokotevastaisen argumentin yhdellä lauseella".

Joten testasin sitä. Reddit on rakenteeltaan samanlainen kuin arkisto, jos siristää silmiään sopivasti: SNAP julkaisi 132 308 postausta, joissa sama kuva postattiin uudelleen eri otsikolla noin kahdeksan kertaa. Yksi kohde, useita tekstivariantteja, mitattu lopputulos. 16 242 kuvaa.

Mikään ei satunnaistanut sitä, joten kolme asiaa piti siivota pois ensin. Parit muodostuvat yhden kuvan *ja* yhden aliredditin sisällä, joten yhteisötaso kumoutuu. Myöhäinen uudelleenpostaus pärjää huonommin pelkästään myöhäisyyttään, joten sovitin vaimenemisen suhteessa uudelleenpostausindeksiin aliredditeittäin ja järjestin jäännökset (residuals). Ja pari säilyy vain, jos jäännöksen ero on tarpeeksi suuri voittajan nimeämiseksi.

117 118 paria. VERA saa **0,522**. Sattuma on 0,500. Sääntö "pidempi otsikko voittaa" saa 0,507.

Tällä otoskoolla keskivirhe on 0,0015, joten 0,522 on noin viisitoista keskivirhettä sattuman yläpuolella — todellinen, ja tarpeeksi pieni ollakseen hyödytön. Tarkkuus kyllä nousee jäännöseron myötä, 0,508 → 0,531 kvartiilien yli, mikä kertoo pienen efektin olevan signaalia eikä artefakti. Se vaihtelee r/WTF:n 0,495:stä r/fffffffuuuuuuuuuuuu:n 0,558:aan.

Joten 0,812 kuuluu Upworthylle. Se mitä VERA oppi, on yhden julkaisijan vuoden 2013 ääni, eikä se siirry mukanasi.

Lisään varauman omaan varaumaani: Redditin ylä-äänet eivät ole klikkaussuhde, ja kellonaika sekä postaajan maine jäävät vakioimatta. Nollatulos ei pysty puhtaasti erottamaan toisistaan tilannetta "ei siirry" ja "sekoittavat tekijät söivät sen". Mutta se on halvin rehellinen testi mikä oli saatavilla ja tulos oli negatiivinen, ja ajan sen mieluummin kuin kirjoitan "siirtovaikutusta ei ole testattu" ja annan lukijan olettaa parasta.

Testi, jonka oikeasti halusin, vaatii sähköpostidataa. Niinpä lähdin etsimään julkista sähköpostidataa oikeilla mitatuilla lähetystuloksilla, eikä sitä ole olemassa.

| Lähde | Koko | Saatavuus |
|---|---|---|
| Return Path -otsikkorivitutkimus | 9M otsikkoriviä | Suljettu, 2015, ei koskaan julkaistu |
| Belkins B2B -korpus | 5,5M sähköpostia | Vain aggregoituja tilastoja |
| Yahoo (IEEE 7004277) | 100k+ riviä, miljardeja näyttökertoja | Suljettu |
| Oraclen NLORP-tutkimus | 300 riviä | Kaavittu Googlesta, suhteita ei mitattu |
| Erilaiset Kaggle-"email campaign" -setit | vaihtelee | Keinotekoisia tai synteettisiä |

Yksi noista on kahden Oraclen johtavan datatieteilijän arXiv-paperi, jonka koko datajoukko on "yli 300 erilaista tarjoussähköpostien otsikkoriviä, poimittu useista internet-lähteistä Google-haulla." En muuten kuittaile heille, tuota vain aidosti on tarjolla.

Aggregoituja löydöksiä pyörii vapaana pilvin pimein (kuudesta kymmeneen sanaa toimii parhaiten, 21–40 merkkiä avauksille, numerot tuovat muutaman pisteen), mutta mikään siitä ei ole lähetyskohtaista tulosdataa eikä sillä kouluteta yhtään mitään.

## Mikä asettaa koko harjoituksen uuteen valoon

Olin kertonut itselleni mukavaa pientä tarinaa, kunnes toinen mielipide kaatoi sen. Tarina oli, että *arkkitehtuuri on bulkkia, pysyvä arvo on omistetuissa tulosnimikkeissä*, ja ensimmäinen puolisko on oikeassa mutta toinen puolisko on hölynpölyä, koska minulla ei *ole* omistettuja nimikkeitä. Upworthy on julkinen, kuka tahansa jolla on GPU voi toistaa 0,812-tulokseni viikonlopussa kahvikupin hinnalla. Se on osasyy siihen miksi painot ovat suoraan jaossa: ne maksoivat minulle neljä dollaria enkä voi väittää niiden olevan mikään vallihauta.

Se mitä minulla oikeasti on, on näyttö osaamisesta. Todellinen voimavara olisi jatkuva mittaussilmukka elävässä liikenteessä, eikä sellaista ole vielä olemassa.

Tarvitsemani data makaa sähköpostipalveluntarjoajien (ESP) sisällä tekemättä mitään. Jokaisella palvelulla, jossa on A/B-testausominaisuus, on miljoonia otsikkorivikokeita mitatuilla tuloksilla, ja suunnilleen yksikään niistä ei kouluta sillä mitään. En siis tarvitse uutta päätä tai uutta vertailukohtaa, tarvitsen yhden ihmisen, jolla on lokit.

## Mihin tämä yleistyy

Resepti on rehellisesti sanottuna tarpeeksi tylsä mahtuakseen yhdelle riville: jos mitattu lopputulos on olemassa, kouluta sillä, ja lakkaa kysymästä mallilta sen mielipidettä.

Jokainen A/B-testi, jonka yrityksesi on koskaan ajanut, makaa jollain testausalustalla nimikoituna, tulos liitettynä, tekemättä mitään. Optimizely, Statsig, LaunchDarkly, mitä ikinä käytätkään, siellä on vuosikausien edestä "kokeilimme näitä viittä ja tämä voitti" -dataa, eikä kukaan ole kouluttanut sillä mitään.

Missä tahansa sinulla on ehdokasjoukko ja numero, joka ilmestyy myöhemmin putkessa, sama pätee:

| Päätös | Nimike, joka sinulla jo on |
|---|---|
| Otsikkorivit, pääotsikot, push-tekstit | avaukset, klikkaukset |
| Tukimakron valinta | ratkaistu ilman eskalointia |
| Tiedonhaun uudelleenjärjestäminen | minkä tuloksen käyttäjä hyväksyi |
| Virheilmoituksen muotoilu | hoiti itse, tai teki tukipyynnön |
| Tuotelistausten otsikot | konversiot |
| Agentin työkalun valinta | onnistuiko toimintaketju |

Tuo viimeinen rivi on se hauska, jos rakennat agentteja. Jevin kolme primitiiviä ovat choice, score ja noul, ja kaikki tässä postauksessa koskettaa `score`-osaa, mutta sama liike toimii `choice`-primitiiville missä tahansa, missä joku logitti mitä päätöksen jälkeen tapahtui — mikä useimmissa agenttien reitityksissä tarkoittaa toistaiseksi: ei kukaan.

Yksi rehellinen rajoitus tähän kaikkeen tosin: minulla on tasan yksi datapiste. Tuloksilla kouluttaminen voitti nollalaukaus-arvion (zero-shot) reilusti *yhdessä tehtävässä*, ja se, pitääkö tuo marginaali missään muualla, on testaamatta, joten löisin vetoa suunnan, en luvun puolesta.

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

Lue pisteet aina joukkona, älä koskaan yhtenä ainoana numerona. Koulutuksen kohteena oli poikkeama testin omasta keskiarvosta, joten yksi pistemäärä yksinään ei tarkoita mitään: annat sille ne 3–6 varianttia jotka kirjoitit yhtä lähetystä varten, ja se laittaa ne järjestykseen. Mukana on myös kalibroija, joka muuntaa pisteet odotetuksi nosteeksi (lift).

Ja jos 435M on liian järeä, saatavilla on myös prosessorikokoinen malli: ModernBERT-base saa 0,761 kolmasosalla parametreista.

## Mitä se ei tee

Siirry sähköpostiin, tai minulla ei ainakaan ole aavistustakaan siirtyykö se.

Joten jos pyörität uutiskirjettä ja sinulla on aiempia lähetyksiä mitatuilla avaus- tai klikkaussuhteilla, haluaisin aidosti selvittää asian. Ota yhteyttä, ja data pysyy sinun.

## Opetus

Yksi tämän alan avoimen painotuksen malleista saa omassa tyypitettyjen päätösten vertailutestissään tuloksen 0,362 nollalaukauksena, mikä on alle enemmistöluokan 0,461-perustason.

Eikä hyppy 0,637:stä 0,812:een ollut mitään nokkelaa mallinnusta sekään: kaksi kolmasosaa siitä tuli valitsemalla häviöfunktio, joka vastasi mittaria, ja loput tulivat 62 695 rivistä, joilla joku mittasi mitä oikeasti tapahtui. Joten joo, jos nimikoit dataasi kysymällä mallilta, kannattaa ehkä ensin etsiä pohjatotuutta, se nimittäin todennäköisesti lojuu jo jossain.

---

*Data: [The Upworthy Research Archive](https://osf.io/jd64p/). Matias, J., Munger, K., Le Quere, M.A., Ebersole, C. (2021), Nature Scientific Data. CC BY 4.0. Kokeet väliltä 25. kesäkuuta 2013 – 10. tammikuuta 2014 on jätetty pois ylläpitäjien vuonna 2024 ilmoittaman satunnaistusvirheen vuoksi. Painojen DOI: [10.57967/hf/10573](https://doi.org/10.57967/hf/10573).*
