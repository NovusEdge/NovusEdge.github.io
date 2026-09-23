---
title: "Munasin oman benchmarkini kahdesti"
date: 2026-09-23
updated: 2026-09-24
tags: [ml, decision-models, calibration, open-weights, benchmarks]
draft: false
description: "Koulutin päätöksentekomallin A/B-testeillä, joita ihmiset oikeasti ajoivat, sen sijaan että olisin kysynyt toiselta mallilta sen mielipidettä. Sitten huomasin paisutelleeni lukuja, korjasin asian, julkaisin sen ja tajusin tehneeni saman virheen uudestaan vielä pahemmassa paikassa."
---

> **Oikaisu, 24.9.2026.** Tässä kirjoituksessa ilmoitettiin alun perin 0,812:n parikohtainen
> tarkkuus ja sitä kutsuttiin termillä "kaikki testin sisäiset parit". Kyseessä oli kuitenkin vain yksi pari per testi: korkeimman ja matalimman
> CTR:n variantti, mikä on suurin mahdollinen ero testin sisällä.
> Oikea luku kaikille pareille on **0,689**. Kirjoituksessa annettiin myös päätöksentekomallin
> pohjamallille kunnia parannuksesta, joka kontrolliajon perusteella johtuikin oppimisnopeudesta.
> Alla olevat luvut on korjattu, ja [viimeinen
> osio](#the-part-i-got-wrong-again) kertoo, miten asia selvisi.

Uusien päätöksentekomallien päälle on rakennettu suurin piirtein 300 julkista projektia. Kävin läpi "pisteytys- ja rankkausprojektit" (26 kpl), ja jokainen niistä pisteyttää asioita vain kysymällä mallilta, mitä se on mieltä. Pisteytä tämä artikkeli kahdeksalla laatuasteikolla, arvioi tämän tekstin tyyliä, arvioi onko tämä dokumentti relevantti – tiedättehän idean.

Eikä tuo oikeastaan ole dataa, eihän? Se on vain mallin mielipide, johon on lätkäisty numero kylkeen, ja rehellisesti sanottuna koko kategoria on rakennettu tämän päälle.

Joten koulutin sellaisen lopputuloksilla, joita joku oli oikeasti mitannut, ja painot ovat jaossa jos haluat kokeilla sitä: **[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)**, Apache 2.0, 435M parametria, yksi forward pass, se pisteyttää lyhyttä suostuttelevaa tekstiä. Pohjana on [`com-kotobalabs/open-jev-deberta-v3-large`](https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large), DeBERTa-v3-large esikoulutettuna tyypitetyillä päätöksillä (typed decisions) – mikä, spoilerina mainittakoon, osoittautui kontrolliajon perusteella täysin hyödyttömäksi.

| Mittari | Tämä malli | Satunnainen |
|---|---|---|
| Jokainen testin sisäinen pari, uusi datajako | **0.689** | 0.524 |
| Parit, joissa testi todella ratkesi (p<0.05) | **0.843** | 0.547 |
| Puhtaat parit, ei mitään opetusdataa muistuttavaa | **0.671** | 0.524 |
| Valitsee parhaan 4–5 variantista | **47.7%** | 24.9% |
| Välttää huonoimman variantin | 90.3% | 75.1% |
| Reddit-otsikkoparit, eri aihealue | 0.522 | 0.500 |

Suurimmassa osassa tämän arkiston pareista ei ole todellista eroa – vain 29 % saavuttaa merkitsevyyden 5 % tasolla. Ensimmäisellä rivillä nämä ovat mukana, minkä vuoksi käytän sitä pääasiallisena lukuna. Toinen rivi kertoo, miten malli suoriutuu tapauksissa, joissa koe oikeasti ratkaisi jotain.

Se sovitettiin 47 168 varianttiin 16 129 satunnaistetussa otsikkokokeessa, ja jokainen yllä oleva luku tulee datajaosta, jota malli ei koskaan nähnyt. Miten tähän päästiin, selviää alta – mukaan lukien kaksi erillistä kertaa, jolloin benchmarkini mittasi jotain aivan muuta kuin olin väittänyt.

## Asetelma

Kävi ilmi, että tähän on olemassa täydellinen datajoukko, joka on ollut vapaasti saatavilla vuodesta 2021 lähtien. Tammikuun 2013 ja huhtikuun 2015 välillä Upworthy (kyllä, juuri *se* Upworthy, se "et ikinä arvaa mitä tapahtui seuraavaksi" -porukka) ajoi 32 487 satunnaistettua A/B-testiä otsikoillaan: oikeaa liikennettä, aito satunnaistus, 538 miljoonaa näyttökertajakoa. Sitten Cornell meni ja julkaisi koko roskan nimellä [the Upworthy Research Archive](https://osf.io/jd64p/) CC BY -lisenssillä. Jokainen otsikkovariantti, jokainen näyttökerta, jokainen klikkaus.

Tämä on suurin piirtein niin lähellä pohjatotuutta kuin lyhyen vakuuttavan tekstin kohdalla voi päästä.

Joten: ModernBERT-large regressiopäällä, ja kohdemuuttujana on kutistettu logit-klikkausprosentti, joka on keskitetty kunkin testin omaan keskiarvoon. Keskittäminen on muuten tärkeää: itse *artikkeli* selittää suurimman osan klikkausprosentin varianssista eikä otsikko voi sitä selittää, joten oikeasti halutaan ennustaa sitä, kuinka kaukana variantti on sen testin keskiarvosta, jossa se oli mukana. Sen jälkeen beeta-binomiaalinen kutistus kohti kyseistä keskiarvoa, jolloin 600 näyttökerran variantti lasketaan lähinnä aiemmaksi oletukseksi ja 20 000 näyttökerran variantti todisteeksi.

25 minuuttia yhdellä L4-GPU:lla, hintaa noin 40 senttiä. Jätin kaiken tammikuun 2015 jälkeisen datan sivuun testijoukoksi, testasin sillä ja sain tulokseksi **0.704 parikohtaisen tarkkuuden.**

Mittakaavan vuoksi: lähin julkaistu luku suodattamattomille pareille on [0.544](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682) Toronton yliopiston ryhmältä, joka käytti käsin laadittuja kielellisiä piirteitä. Heidän tutkimusartikkelinsa toteaa ongelman olevan "luonnostaan vaikea, eikä kyse ole vain otoskoosta". Palaan myöhemmin siihen, miksi tuo 0.544 on huonompi vertailukohta kuin miltä se näyttää, ja myöhemmin lopetan muiden lukujen lainaamisen ja ajan vertailun itse.

Kuusitoista prosenttiyksikköä parempi, neljälläkymmenellä sentillä. Joten tietenkin kirjoitin siitä postauksen: "Otsikkosignaali selviää kahden vuoden ajautumasta."

## Ja kuitenkin

Otsikon väite oli, että signaali kestää *ajautumaa*, koska opetusdata oli vuosilta 2013–2014, testidata vuodelta 2015 ja tarkkuus tuskin liikahti – ikään kuin kaksi vuotta muuttuvaa internet-kulttuuria ei olisi heilauttanut mallia lainkaan. Se olisi merkittävä löydös, jos se pitäisi paikkansa. Se on tärkeää siksi, että koko homman pointti on lopulta soveltaa mallia sähköpostien otsikkoriveihin. Jos se ei kestä kahta vuotta yhden julkaisijan sisällä, se ei todellakaan kestä hyppyä täysin toiseen viestintäkanavaan.

Arkisto toimitetaan kolmessa datajaossa (exploratory, confirmatory, holdout), ja olin kouluttanut ja testannut confirmatory-jaolla. Joten lähinnä huolellisuudesta – ja täysin odottaen vahvistusta sille, minkä jo "tiesin" – ajoin samat mallipainot kahdella muulla jaolla.

```
confirmatory 2015:  0.704
holdout:            0.637
exploratory:        0.624
```

Kiva.

Kaksi jakoa, joihin en ollut koskaan koskenut, olivat keskenään linjassa 0.013:n sisällä *jokaisessa efektikokoluokassa*, ja molemmat kertoivat, että pääasiallinen tuloslukuni oli paisunut seitsemän prosenttiyksikköä liian suureksi.

![Parikohtainen tarkkuus Upworthy-arkiston kolmessa datajaossa. Confirmatory 2015 -viiva on selvästi holdout- ja exploratory-viivojen yläpuolella, jotka seuraavat toisiaan läheisesti.](/assets/img/blog/decision-models/splits.png)

## Aikakone, joka kulkee vain sivuttain

Luin sitten tällä kertaa arkiston dokumentaation kunnolla, ja kävi ilmi, että arkisto jakaa testit datajakoihin **satunnaisesti**. Ei aikajärjestyksessä, vaan satunnaisesti.

![Kaksi palkkia. Ensimmäinen näyttää siistin kronologisen jaon, ensin opetus ja sitten testi. Toinen näyttää todellisen rakenteen: opetus- ja testilohkot limittäin koko ajanjakson yli.](/assets/img/blog/decision-models/split-structure.png)

| Jako | Variantit | Päivämääräväli | Osuus ennen vuotta 2015 |
|---|---|---|---|
| confirmatory | 51,891 | 2013-01-24 → 2015-04-30 | 83.5% |
| holdout | 11,231 | 2013-01-24 → 2015-04-29 | 82.8% |
| exploratory | 10,804 | 2013-01-26 → 2015-04-29 | 83.8% |

Kaikki kolme jakoa kattavat samat päivämäärät samoissa suhteissa, mikä tarkoittaa, että kun testasin holdout-datalla, 83 % testattavasta materiaalista oli peräisin *opetusjakson sisältä*. Sama aikakausi, sama talon tyyli, sama kaikki, vain testejä joita malli ei ollut koskaan nähnyt – ja silti se suoriutui siinä *huonommin* kuin vuoden 2015 loppuhännässä.

Toisinpäin käännettynä tämä on suoraan sanottuna aika koomista: aika ei heikennä mallia juuri lainkaan, kun taas saman ajanjakson näkemättömät testit pudottavat tulosta seitsemän pistettä. Huolella rakentamani ajautumatesti oli koko ajan mitannut vain testien identiteettiä, se oli vain pukeutunut ajallisen yleistämisen valepukuun.

Olin rakentanut aikakoneen, joka kulkee vain sivuttain.

## Kaksi hypoteesia, molemmat nurin päin

Seuraava ajatus oli tietenkin datavuoto. Upworthy kirjoitti saman artikkelin kymmenillä eri otsikkovariaatioilla, joten jos *testit* jaetaan satunnaisesti, yhden artikkelin eri versiot hajoavat kaikkiin kolmeen jakoon, jolloin holdout-joukon pitäisi olla täynnä opetusdatan tekstien lähes-kopioita.

Koodasin nopean inverted index -virityksen mitatakseni Jaccardin maksimitoken-päällekkäisyyttä kunkin arviointiotsikon ja niiden 47 168 otsikon välillä, joilla malli oikeasti opetettiin (tarkka merkkijonovertailu oli löytänyt viisi jaettua otsikkoa 650:stä, ja kyllä, olin sen perusteella julistanut datavuodon "poissuljetuksi").

| Arviointijoukko | n | ≥0.9 päällekkäisyys | mediaani |
|---|---|---|---|
| confirmatory 2015 | 1,300 | 0.5% | 0.227 |
| holdout | 4,274 | **30.5%** | 0.300 |

Kolmekymmentä prosenttia – kuusikymmentä kertaa enemmän saastunutta dataa kuin vuoden 2015 loppuhännässä – ja malli sai **huonomman** tuloksen.

Datavuoto ei siis selitä eroa, se toimii täysin väärään suuntaan. Jos jotain, rehellisen holdout-luvun pitäisi olla *huonompi* kuin 0.637, kun lähes-kopiot karsitaan pois. Tarkistin tämänkin dumppaamalla parikohtaiset pisteet ja viipaloimalla ne: aidosti puhtailla pareilla malli sai 0.646 eli hieman *paremman* tuloksen, joten lähes-kaksoiskappaleista ei ollut sille mitään hyötyä.

No entä kohinan määrä leimoissa? Ehkä holdout-pareilla on vain vähemmän näyttökertoja.

| Arviointijoukko | mediaaninäyttökerrat | z-mediaani | CTR-suhteen mediaani |
|---|---|---|---|
| confirmatory 2015 | 2,462 | 2.37 | 2.24 |
| holdout | 3,096 | 2.64 | 1.99 |

Tämäkin meni nurin päin, lol. Holdout-pareilla on *enemmän* näyttökertoja ja *korkeammat* z-pisteet. Vuoden 2015 joukossa CTR-suhteen mediaani on tosin laajempi (2.24 vs. 1.99), joten sen parit ovat aidosti helpompia erottaa toisistaan – mikä on totta, mutta ei selitä läheskään seitsemän pisteen eroa.

Joten kirjoitin dokumenttiin "selittämätön" ja siirryin eteenpäin. 0.63 on oikea luku, kaksi riippumatonta jakoa ovat siitä samaa mieltä, poikkeava jako on poikkeusyksilö, enkä osaa sanoa miksi.

**!! Nörtti-infopläjäysvaroitus :3 !!**

## Osa, jolla oli oikeasti merkitystä

Murskattuani oman otsikkotulokseni ajattelin, että minun pitäisi ainakin ajaa ablaatiotestit kunnolla.

Odotin datan määrän voittavan, koska se on tylsä perusoletus: käytettävissä on 62 695 varianttia, heitetään kolmas jako mukaan ja saadaan enemmän. Asetin siis kaksi ajoa: toisessa exploratory-jako lisättiin opetusdataan ja toisessa vaihdettiin häviöfunktio, ja molemmat arvioitiin samoilla 2 137 holdout-parilla.

Jokainen tämän osion luku perustuu noihin 2 137 pariin, mikä – kuten ylhäällä oleva oikaisu kertoo ja viimeinen osio selittää – on se helppo osajoukko. Ne ovat keskenään täysin vertailukelpoisia, koska jokainen ajo pisteytettiin samalla tavalla. Mikään niistä ei ole kaikkien parien tulosluku.

```
Phase 0        confirmatory       MSE              0.637
more-data      expl+confirmatory  MSE              0.724
rank           confirmatory       Bradley-Terry    0.775
rank+more      expl+confirmatory  Bradley-Terry    0.787
```

![Ablaation tulokset. Datan lisääminen tuo 0.087 parannuksen perustasoon; Bradley-Terryyn vaihtaminen tuo 0.138, ja paras ajo saavuttaa tuloksen 0.812.](/assets/img/blog/decision-models/ablations.png)

28 % enemmän opetusdataa toi **+0.053**, ja häviöfunktion vaihtaminen toi **+0.107** kahdella epookilla kolmen sijaan ja pienemmällä opetusdatalla – ja se voitti silti kaksinkertaisesti.

Mikä on jälkikäteen ajateltuna ilmiselvää, sitä pahinta lajia ilmiselvää. Benchmarkina on *parikohtainen tarkkuus* (kahdesta otsikosta valitaan voittaja), ja minä tein regressiota klikkausprosenttiin – eli optimoin mittarin korviketta ja arvioin itseäni sitten varsinaisella mittarilla.

[Bradley-Terry](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) optimoi itse asiaa. Jokaiselle saman testin varianttiparille maksimoidaan `logsigmoid(score_winner - score_loser)`, painotettuna harvemmin näytetyn variantin näyttökertojen logaritmilla. Opetusdatan 47 168 varianttia muuttui 76 892 testinsisäiseksi pariksi.

Sama malli. Sama data. Eri tavoitefunktio. Neljätoista pistettä.

Ajoin uteliaisuuttani myös ModernBERT-*base* -mallin (kolmasosa parametreista), ja se ylsi tulokseen 0.761. Suurin osa suorituskyvystä tulee siis tavoitefunktiosta ja datasta eikä mallin koosta, mikä on mukavaa, jos haluaa joskus ajaa tätä prosessorilla.

Sitten oli se tapaus, joka oli vähällä mennä ohi suun. Kokeilin DeBERTa-v3-large-varianttia, joka oli esikoulutettu päätöksentekotehtävillä. Se pysyi tasan arvossa `-log(0.5)` kaikkien 4 804 askeleen ajan ja sai tulokseksi 0.519 – eli pelkkää puhdasta sattumaa, täysin flätti käyrä.

Tämä olisi helppo tulkita niin, että "DeBERTa on huonompi" ja siirtyä eteenpäin, ja melkein teinkin niin. Mutta häviökäyrä, joka on *täydellisen* tasainen juuri sillä arvolla, joka tarkoittaa "arvaan vain", on todella omalaatuinen signaali, eikä huonosti oppiva malli näytä tuolta. Enkooderi oli myös latautunut aivan oikein, vain luokittelija ja pooleri oli alustettu tyhjästä.

Kyse oli oppimisnopeudesta. DeBERTa-v3-large on [tunnetusti epävakaa](https://github.com/microsoft/DeBERTa/issues/77) arvolla 2e-5, jolla ModernBERT toimii hienosti, ja se vaatii jotain lähempänä arvoa 6e-6 – ja olin käyttänyt samaa konfiguraatiota molemmille, koska miksipä ei.

Ajoin sen uudelleen arvolla 6e-6, häviö meni 0.709 → 0.682 → 0.620 → 0.360, ja lopputulokseksi tuli **0.812** – kaksi ja puoli pistettä parempi kuin ModernBERT, ja korkeimman luottamusvälin luokassa 0.913.

Ajoin silläkin lähes-kaksoiskappaleiden viipaleen, koska tässä vaiheessa en luota enää itseeni, ja aidosti puhtailla pareilla (ei mitään opetusdataa muistuttavaa) se saa **0.797** vastaan ModernBERTin 0.769. Sen ulkoaoppimiskuilu on myös *pienempi* kuin ModernBERTin, vaikka se saa paremmat pisteet – mikä on täysin päinvastaista sille, miltä pelkällä ulkomuistilla pärjäävä malli näyttäisi.

Järjestelmä siis toimi koko ajan hienosti, minulla oli vain yksi luku väärin.

Tuossa viimeisessä lauseessa osoittautui olevan melkoinen lataus. Pitäkää siitä kiinni.

## Mutta mitä 0.812 oikeasti *tarkoittaa*

Rehellisesti sanottuna ihmiselle ei yhtään mitään. Se on parikohtaisen tarkkuuden ongelma väitteenä: se kertoo vain järjestyksen olevan oikein, muttei sano mitään suuruusluokasta. Kahden otsikon järjestäminen oikein 81.2 % ajasta voi olla omaisuuden arvoinen asia tai täysin merkityksetöntä riippuen siitä, kuinka kaukana ne todellisuudessa ovat toisistaan.

Joten mittasin, miltä tulos tuntuisi jollekin, joka oikeasti lähettää viestin. Otetaan kussakin testissä mallin parhaat pisteet saanut variantti ja verrataan sen todellista klikkausprosenttia testin kaikkien varianttien keskiarvoon. Ilman malliahan ei ole mitään syytä suosia yhtä tiettyä varianttia, joten potentiaalisten vaihtoehtojen keskiarvo on rehellinen kontrafaktuaali.

| | CTR |
|---|---|
| Testin keskiarvo, ei mallia | 1.20% |
| Mallin valinta | 1.42% |
| Oraakkeli, täydellinen valinta | 1.60% |

Se tarkoittaa **+18.3 % suhteellista klikkausprosenttia** 2 140 testin yli – ja joudun heti vetämään sen teiltä takaisin.

### Parannusluku ei siirry muualle

18.3 % on Upworthya koskeva fakta. Se riippuu heidän 1.20 % perusprosentistaan ja siitä, kuinka suuria eroja heidän kirjoittajansa saivat aikaan varianttien välille. Jos tämän kohdistaa B2B-uutiskirjeeseen, jonka klikkausprosentti on 2.5 % ja jonka variantit ovat lähempänä toisiaan, luku muuttuu suuntaan, jota en aidosti pysty ennustamaan.

Se mikä *siirtyy*, on mikä tahansa yksittäisen testin sisäinen suhdeluku:

| Mittari | Arvo |
|---|---|
| Välttää huonoimman variantin | **90.3%** |
| Voittaa testin keskiarvon | 76.6% |
| Valitsee todellisen parhaan variantin | 47.7% |
| Saavutettu potentiaali, testien mediaani | 89.2% |
| Spearman, pisteet vs. klikkausprosentti | 0.526 |

**90.3% on se luku, jonka takana oikeasti seison.** Malli ei juuri koskaan anna sinun lähettää huonointa kirjoittamaasi vaihtoehtoa, ja tämä ominaisuus kestää perusprosentin, yleisön ja viestintäkanavan muutokset toisin kuin "+18.3%". Ja 47.7% top-1-tarkkuus tyypillisesti 4–5 variantin joukosta on noin 2.2-kertainen satunnaiseen arvaukseen verrattuna.

Yksi luvuista tosin hämää hieman. Saavutetun potentiaalin mediaani on 89.2 % (kvartiiliväli 5 % – 100 %), ja kaikkien testien yli yhdistettynä se on 55.4 %. Malli on bimodaalinen: useimmissa testeissä se nappaa lähes kaiken saatavilla olevan hyödyn, ja vähemmistössä se ei saa juuri mitään, mikä vetää kokonaistulosta alas.

Sovitin päälle vielä [isotonisen regression](https://en.wikipedia.org/wiki/Isotonic_regression), jotta pisteillä olisi pelkän mutu-tuntuman sijaan oikeat yksiköt. Isotoninen malli sopii tähän, koska se olettaa vain monotonisuutta (korkeammat pisteet, korkeampi klikkausprosentti) – mikä on täsmälleen se, mitä Bradley-Terry takaa ja kirjaimellisesti ainoa asia mitä se takaa. Mikä tahansa parametrinen malli keksisi rakenteita, joita malli ei ole koskaan luvannut. Luottamusvälit saatiin bootstrap-otannalla *testeistä* eikä varianteista, koska saman testin variantit jakavat saman artikkelin eivätkä ole toisistaan riippumattomia.

| Pisteet | vs. perustaso | 90% luottamusväli |
|---|---|---|
| −2.72 | **−19.1%** | [−0.252, −0.209] %-yks. |
| −1.06 | −8.2% | [−0.111, −0.086] %-yks. |
| −0.20 | −0.7% | [−0.023, −0.000] %-yks. |
| +0.56 | +3.7% | [+0.030, +0.056] %-yks. |
| +1.62 | +11.1% | [+0.115, +0.147] %-yks. |
| +2.82 | **+21.8%** | [+0.231, +0.274] %-yks. |

![Kalibrointikäyrä. Klikkausprosentti suhteessa perustasoon nousee monotonisesti mallin pisteiden myötä, ja 90 % luottamusvälit leikkaavat nollan vain lähellä keskikohtaa.](/assets/img/blog/decision-models/calibration.png)

Katsokaa keskimmäisiä rivejä: luottamusvälit ylittävät siinä nollan, mikä tarkoittaa mallin fiksusti toteavan: "nämä kaksi ovat käytännössä sama otsikko, heitä kolikkoa".

## Siitä luvusta 0.544

Sanoin palaavani tähän. Kun ryhdyin tutkimaan kunnolla, mitä muuta tämän arkiston pohjalta on tehty, vertailukohta johon olin nojannut heikkeni huomattavasti, ja eräs väliin jäänyt asia muuttui paljon oleellisemmaksi.

| Lähde | Tehtävä | Mittari | Arvo | Satunnainen |
|---|---|---|---|---|
| LOLA, ihmiset (n=4,571) | paras k:sta | tarkkuus | ~sattuma | 0.330 |
| LOLA, GPT-4 in-context | paras k:sta | tarkkuus | 0.400 | 0.330 |
| LOLA, LoRA Llama-3-8B | paras k:sta | tarkkuus | 0.469 | 0.330 |
| LOLA, hienosäädetty GPT-4o | paras k:sta | tarkkuus | 0.488 | 0.330 |
| [arXiv:2506.00152](https://arxiv.org/abs/2506.00152), Pythia-12B | merkitsevät parit, + ingressi + aikaleima | ROC AUC | 0.82 | 0.50 |
| [PLOS ONE 0281682](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682) | parit täsmäytetty artikkeli+kuva+viikko, K≤15 | tarkkuus | 0.544 | ~0.50 |
| **VERA** | jokainen testin sisäinen pari, vain otsikko | tarkkuus | **0.689** | 0.524 |

Yksikään noista riveistä ei ole suoraan vertailukelpoinen omani kanssa, mikä onkin koko jutun ydin.

0.544-tutkimusartikkeli täsmäyttää parit artikkelin, kuvan *ja* testiviikon mukaan ja poimii sitten satunnaisotoksen kaikista yli 15 parin kokeista. Se kouluttaa mallin 5 048 parilla. Lisäksi se on rekisteröity raportti, jonka ensimmäinen hypoteesi on "voidaanko tätä ylipäätään ennustaa satunnaisuutta paremmin" – eli kyse on merkitsevyystestistä. Kukaan ei yrittänyt maksimoida tarkkuutta. Sen voittaminen 27 prosenttiyksiköllä 435M parametrin mallilla ja kertaluokkaa suuremmalla datamäärällä ei ole sellainen saavutus, jona sitä pidin.

Se, minkä olin oikeasti missannut, on Pythia-12B-palkkiomalli, ja se on selvästi vahvin neuroverkkotulos tällä datajoukolla. ROC AUC 0.82. Se opettaa vain pareilla, joiden CTR-ero on tilastollisesti merkitsevä 5 % tasolla – eli karkeasti arvioituna helpoimmalla 28 prosentilla – ja se lukee otsikon ohella artikkelin ingressin ja julkaisun aikaleiman. Kyseessä on siis helpompi leimajoukko laajemmalla syötteellä eri mittarilla, eikä se voita lukua 0.812. Mutta jos näitä kahta lukua vilkaisee rinnakkain, ne näyttävät identtisiltä, ja haluan mieluummin huomauttaa tästä itse kuin antaa jonkun muun huomauttaa minulle.

Se mikä tästä kaikesta jää käteen: kukaan ei ole raportoinut parikohtaista tarkkuutta hienosäädetyllä enkooderilla suodattamattomista testinsisäisistä pareista pelkän otsikkotekstin perusteella. Se on huomattavasti suppeampi väite kuin "voittaa alan kärkituloksen", ja pystyn oikeasti puolustamaan sitä.

## Joten ajoin vertailun itse

Jokainen yllä oleva luku on jonkun muun mittaama jonkun muun pareilla. Joten ajoin kaksi nykyistä järjestelmää omalla datallani.

Jokainen pari kysytään kahdesti: kerran voittaja ensimmäisenä ja kerran toisena, ja tulos lasketaan vain silloin, kun molemmat järjestykset nimeävät saman otsikon. Tämä protokolla on tärkeä: mallit valitsevat vaihtoehdon A useammin kuin sattumalta riippumatta sisällöstä, joten yhden järjestyksen ajo pisteyttää itseään sen itsensä valitsemalla osajoukolla.

| Järjestelmä | Parametrit | Täsmätyt parit | Itsekonsistentti |
|---|---|---|---|
| **VERA** | 435M | **0.823** | — |
| Gemini 3.1 Pro | frontier | 0.751 | 83.7% |
| Laya typed-decisions | 421M | 0.504 | 52.9% |

Ja siinä meni taas yksi väite, johon olin nojannut. Olin sanonut ihmisten osuvan tässä vain sattumanvaraisesti, vihjaten samalla että tehtävä olisi vaikea myös tekoälymalleille. Ei se ole. Gemini saa 0.751. Ihmisten tulos kertoo ihmisistä eikä sano mitään koneista, ja käytin sitä väittämään jotain, mitä se ei tarkoita.

Rehellinen versio on joka tapauksessa parempi: 435 miljoonan parametrin malli voittaa huipputason päättelymallin seitsemällä pisteellä noin tuhannesosalla kutsukohtaisista kustannuksista. Tämän selvittämiseen meni 5,60 dollarin edestä Gemini-kutsuja.

Laya on avoin päätöksentekomalli, josta kaikki tulevat kysymään, ja se vastaa tässä kolikonheiton tarkkuudella. Se kuulostaa huonolta jos asian jättää siihen, joten tarkennetaan: sen mallikortti kattaa laskujen käsittelyn, tietoturvapoikkeamat, asiakaspalvelun ja agenttien toimintalokit. Otsikoiden klikkausprosentti on näiden kaikkien neljän ulkopuolella. Kyse on toimialasopivuudesta, ja odottaisin VERAn näyttävän aivan yhtä tyhmältä laskujen käsittelyssä.

Tästä paljastui vielä yksi asia. Gemini saa tuloksen 0.641 pareilla, joiden CTR-ero ei ole tilastollisesti merkitsevä 5 % tasolla – eli niillä, joita olin kutsunut kohinaksi. Se ei ole koskaan nähnyt näitä leimoja. Malli, jolla ei ole pääsyä tulosdataan, voittaa siis sekin tason 0.500, mikä tarkoittaa, että näissä pareissa on todellisia eroja, joita kokeen tilastollinen voima ei vain riittänyt todistamaan. VERAn saama 0.696 samassa osajoukossa ei vaadi selitykseksi datavuotoa, ja ennen kuin ajoin Geminin, en aidosti osannut erottaa näitä kahta tulkintaa toisistaan.

## Selvä, tässä kohtaa pilaan kaiken

Jokainen yllä oleva luku perustuu yhden julkaisijan viraaleihin someotsikoihin vuosilta 2013–2015, ja se mitä oikeasti haluan rakentaa, pisteyttää sähköpostien otsikkorivejä.

4 000 tilaajan B2B-uutiskirjeellä ei ole juuri mitään yhteistä otsikon "This Kid Just Destroyed The Entire Argument Against Vaccines In One Sentence" kanssa.

Joten testasin asiaa. Redditissä on oikeasta kulmasta katsottuna sama rakenne kuin arkistossa: SNAP julkaisi 132 308 postausta, joissa sama kuva postattiin uudelleen eri otsikolla keskimäärin kahdeksan kertaa. Yksi kohde, useita tekstivariantteja, mitattu lopputulos. 16 242 kuvaa.

Mikään ei ollut satunnaistettua, joten kolme asiaa piti korjata ensin. Parit muodostetaan saman kuvan *ja* saman subredditin sisällä, joten yhteisötason erot kumoutuvat. Myöhäinen uudelleenpostaus pärjää huonommin pelkästään myöhäisyyttään, joten sovitin heikkenemän uudelleenpostausindeksiä vastaan per subreddit ja rankkasin jäännökset. Pari hyväksytään vain, jos jäännösten välinen ero on tarpeeksi suuri selvän voittajan nimeämiseksi.

117 118 paria. VERA saa tuloksen **0.522**. Sattuma on 0.500. Sääntö "pidempi otsikko voittaa" saa 0.507.

Tällä otoskoolla keskivirhe on 0.0015, joten 0.522 on noin viisitoista keskivirhettä satunnaisuuden yläpuolella – eli todellinen, mutta niin pieni että se on hyödytön. Tarkkuus kyllä kasvaa jäännöseron kasvaessa, kvartiilien yli 0.508 → 0.531, mikä kertoo pienen ilmiön olevan aitoa signaalia eikä mittausvirhe. Vaihteluväli on r/WTF:n 0.495:stä r/fffffffuuuuuuuuuuuu:n 0.558:aan.

Signaali kuuluu siis puhtaasti Upworthylle. Kaikki mitä VERA oppi, on yhden julkaisijan ääni vuodelta 2013, eikä se siirry mukana muualle.

Lisään varaukseen vielä oman varaukseni: Redditin ylä-äänet eivät ole klikkausprosentti, eikä kellonaikaa tai postaajan mainetta kontrolloida. Nollatulos tässä ei pysty puhtaasti erottamaan toisistaan sitä, ettei malli siirry, ja sitä, että sekoittavat tekijät söivät tuloksen. Mutta se on halvin saatavilla oleva rehellinen testi ja tulos oli negatiivinen, ja ajan sen mieluummin kuin kirjoitan "siirrettävyyttä ei ole testattu" ja annan lukijan olettaa parasta.

Testi, jonka oikeasti halusin tehdä, vaatii sähköpostidataa. Lähdin siis etsimään julkista sähköpostidataa oikeilla mitatuilla lähetystuloksilla, eikä sellaista ole.

| Lähde | Koko | Saatavuus |
|---|---|---|
| Return Pathin otsikkorivitutkimus | 9M otsikkoriviä | Suljettu, 2015, ei koskaan julkaistu |
| Belkinsin B2B-korpus | 5.5M sähköpostia | Vain koontitilastot |
| Yahoo (IEEE 7004277) | 100k+ riviä, miljardeja näyttökertoja | Suljettu |
| Oraclen NLORP-tutkimus | 300 riviä | Kaavittu Googlesta, tulosprosentteja ei mitattu |
| Erilaiset Kagglen "email campaign" -setit | vaihtelee | Keinotekoisia tai synteettisiä |

Yksi noista on arXiv-paperi kahdelta Oraclen johtavalta datatieteilijältä, joiden koko datajoukko koostuu "yli 300 erilaisesta erikoistarjoussähköpostin otsikkorivistä, jotka on kerätty useista internet-lähteistä Google-haulla". En muuten dissaa heitä, tuo vain aidosti on parasta mitä on tarjolla.

Koontitulokset pyörivät vapaasti verkossa (6–10 sanaa toimii parhaiten, 21–40 merkkiä avauksille, numerot tuovat pari lisäpistettä), mutta mikään niistä ei ole lähetyskohtaista tulosdataa eikä mikään niistä kouluta yhtään mitään.

## Mikä asettaa koko harjoituksen uuteen valoon

Olin uskotellut itselleni mukavaa pientä tarinaa, kunnes toinen mielipide kaatoi sen. Tarina kuului näin: *arkkitehtuuri on bulkkia, pysyvä arvo on omisteisissa tulosleimoissa*. Ensimmäinen puolisko pitää paikkansa, mutta toinen on täyttä pötyä, koska minulla ei *ole* omisteisia leimoja. Upworthy on julkinen, kuka tahansa jolla on GPU voi toistaa tämän viikonlopussa kahvikupin hinnalla – mikä on osasyy siihen, miksi painot ovat suoraan jaossa. Ne maksoivat minulle neljä dollaria, enkä voi teeskennellä niiden olevan mikään vallihaudallinen kilpailuetu.

Se mitä minulla oikeasti on, on näyttö osaamisesta. Todellinen arvokas voimavara olisi jatkuva mittaussilmukka oikeassa tuotantoliikenteessä, eikä sellaista vielä ole olemassa.

Tarvitsemani data makaa toimettomana sähköpostipalveluntarjoajien (ESP) palvelimilla. Jokaisella A/B-testausta tarjoavalla palvelulla on miljoonia otsikkorivikokeita mitatuilla tuloksilla, ja suunnilleen yksikään niistä ei kouluta sillä mitään. En siis tarvitse uutta mallipäätä tai uutta benchmarkia, tarvitsen vain yhden ihmisen, jolla on pääsy lokitietoihin.

## Se, mihin tämä yleistyy

Resepti on suoraan sanottuna niin tylsä, että se mahtuu yhdelle riville: jos mitattu lopputulos on olemassa, kouluta malli sillä ja lopeta mielipiteen kysyminen tekoälymallilta.

Jokainen yrityksesi koskaan ajama A/B-testi lojuu jollain testausalustalla leimattuna, tulokset liitettyinä, tekemättä mitään. Optimizely, Statsig, LaunchDarkly, mitä ikinä käytätkään – vuosikausien dataa siitä kuinka "kokeilimme näitä viittä ja tämä voitti", eikä kukaan ole kouluttanut sillä mitään.

Aina kun sinulla on joukko vaihtoehtoja ja tulosmittari prosessin loppupäässä, sama pätee:

| Päätös | Leima, joka sinulla on jo valmiina |
|---|---|
| Otsikkorivit, otsikot, push-viestit | avaukset, klikkaukset |
| Asiakaspalvelun makron valinta | ratkaistu ilman eskalointia |
| Tiedonhaun uudelleenrankkaus | minkä tuloksen käyttäjä hyväksyi |
| Virheilmoituksen muotoilu | ratkaisi itse, vai teki tukipyynnön |
| Tuotesivujen otsikot | konversiot |
| Agentin työkalun valinta | onnistuiko toimintaketju |

Viimeinen rivi on se mielenkiintoisin, jos rakennat agentteja. Jevin kolme primitiiviä ovat choice, score ja noul, ja kaikki tässä kirjoituksessa käsittelee `score`-primitiiviä. Sama temppu toimii kuitenkin `choice`-primitiiville aina kun joku on lokittanut, mitä päätöksen jälkeen tapahtui – mikä useimpien agenttien reitityksessä tarkoittaa toistaiseksi ei ketään.

Tässä on kuitenkin yksi rehellinen rajoitus: minulla on tasan yksi datapiste. Lopputuloksilla kouluttaminen voitti nollalaukaus-arvioinnin selvästi *yhdessä tehtävässä*, ja sitä, päteekö tämä ero missään muualla, ei ole testattu. Löisin siis vetoa suunnan, en tarkan luvun puolesta.

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

Lue pisteitä joukkona, älä koskaan yksittäisenä lukuna. Opetuksen kohteena oli poikkeama testin omasta keskiarvosta, joten yksittäinen pistemäärä ei yksinään tarkoita mitään: anna mallille yhtä lähetystä varten kirjoittamasi 3–6 varianttia, ja se laittaa ne järjestykseen. Mukana on myös kalibroija, joka muuntaa pistemäärän odotetuksi tulosparannukseksi.

Ja jos 435M on liian järeä, tarjolla on myös prosessorille sopiva versio: ModernBERT-base yltää tulokseen 0.761 kolmasosalla parametreista.

## Mitä se ei tee

Siirry sähköpostiin – tai ainakaan minulla ei ole aavistustakaan, siirtyykö se.

Joten jos pyörität uutiskirjettä ja sinulla on aiemmilta lähetyskerroilta mitattuja avaus- tai klikkausprosentteja, haluaisin aidosti selvittää asian. Ota yhteyttä, ja data pysyy sinun omasi.

## Tärkein opetus

Eräs tämän aihealueen avoimista malleista saa omassa typed-decisions-benchmarkissaan zero-shot-tulokseksi 0.362, mikä on alle enemmistöluokan 0.461-perustason.

Eikä saavutettu etu johtunut mistään nerokkaasta mallinnuksesta: suurin osa tuli mittaria vastaavan häviöfunktion valinnasta ja loput niistä 47 168 rivistä, joilla joku oli mitannut, mitä oikeasti tapahtui. Joten joo, jos leimaat dataasi kysymällä tekoälyltä, kannattaa ehkä ensin etsiä pohjatotuutta – se todennäköisesti lojuu jo jossain valmiina.

## Se osa, jonka tein taas väärin

Olin juuri postaamassa tätä HN:ään. Ennen kuin tein niin, laitoin tekoälymallin lukemaan koko tekstin vihamielisen kommentoijan näkökulmasta ja käskin sen hyökätä koodin eikä leipätekstin kimppuun. Se löysi kahdessakymmenessä minuutissa asian, joka oli ollut silmieni edessä kaksi päivää.

Arviointini kutsui funktiota nimeltä `pairs_from`. Tässä on mitä se tekee:

```python
g = g.assign(ctr=...).sort_values("ctr", ascending=False)
best, worst = g.iloc[0], g.iloc[-1]
out.append((best.headline, worst.headline))
```

**Yksi pari per testi. Paras variantti huonointa vastaan.** Opetus käytti eri funktiota, joka rakensi jokaisen parin. Olin kirjoittanut molemmat kuukausien välein enkä koskaan huomannut niiden olevan ristiriidassa.

Tuo yksi pari on suurin ero, mitä testillä on tarjota. 70 % näistä pareista ylittää tilastollisen merkitsevyyden 5 % tasolla. Kaikkien todellisten testinsisäisten parien kohdalla luku on 29 %. Olin siis arvioinut mallia datan helpoimmalla 11,6 prosentilla ja kutsunut sitä nimellä "kaikki testin sisäiset parit" mallikortissa, julkisessa datajoukossa ja tässä kirjoituksessa.

| Parijoukko | n | Pituusperustaso | VERA |
|---|---|---|---|
| jokainen testin sisäinen pari | 18,485 | 0.524 | **0.689** |
| paras variantti huonointa vastaan, yksi per testi | 2,137 | 0.546 | 0.812 |

Kaksitoista pistettä. Mikä on pahempi kuin ne seitsemän pistettä, joiden kiinnisaamisesta olin tämän tekstin ensimmäisellä puoliskolla niin tyytyväinen.

Ja tämä kirpaisee aivan erityisellä tavalla. Aiemmin ohitin Pythia-12B:n tuloksen siksi, että se "opettaa vain pareilla, joiden CTR-ero on merkitsevä 5 % tasolla – eli karkeasti arvioituna helpoimmalla 28 prosentilla". Oma arviointijoukkoni oli 70-prosenttisesti merkitsevä. Arvostelin suodatinta, jota olin itse soveltanut vieläkin rankemmin lauseessa, jonka olin kirjoittanut huolellisuudesta.

Sitten sama tarkastelu kysyi, miksi en ollut koskaan ajanut kontrollia pohjamallille. `openjev2`-ajo muutti pohjamallia *ja* oppimisnopeutta yhdellä kertaa, ja olin antanut tuloksesta kunnian päätöksentekomallin esikoulutukselle. Ajoin siis puhtaan `microsoft/deberta-v3-large`-mallin täsmälleen samalla reseptillä.

| Pohjamalli | Holdout, sama parijoukko |
|---|---|
| open-jev-deberta-v3-large | 0.812 |
| microsoft/deberta-v3-large | 0.805 |

Seitsemän tuhannesosaa, kun keskivirhe on lähellä yhdeksää. Päätöksentekomallin esikoulutus ei tehnyt mitään, mitä pystyisin mittaamaan. Hyppy tasolta 0.519 johtui oppimisnopeudesta, ja se pätee kumpaankin pohjamalliin. Tämän kirjoituksen otsikko oli aiemmin "Fine-tuning OpenJev on 62,695 A/B Tests", ja sen molemmat puoliskot olivat väärin.

Muutamia pienempiä huomioita samasta katselmuksesta, kaikki täyttä totta: painojen mukana toimitettu kalibroija oli sovitettu *eri mallilla*; bootstrap-otantani käytti `.isin()`-metodia takaisinpanolla poimitussa otoksessa, mikä pudottaa duplikaatit äänettömästi pois ja muuttaa sen 63 % aliotokseksi; satunnaiset perustasoni heittivät kaksi pistettä, koska en ollut koskaan laskenut niitä todellisista varianttimääristä; ja tulostaulussani oli yhden mallin tulos 2 137 parilla toisen mallin 1 788 parin vieressä ilman mitään mainintaa asiasta.

Kaikki on korjattu ja mitattu uudelleen 24.9.2026. Mallikortti, datajoukko ja tämä kirjoitus sisältävät kaikki korjatut luvut.

Mitä tästä jäi käteen, ilmiselvän lisäksi: huomasin ensimmäisen virheen, koska kaksi jakoa olivat eri mieltä keskenään – minkä data teki pyytämättä. Toista virhettä en huomannut, enkä olisi huomannutkaan, koska kaikki tuosta funktiosta eteenpäin oli sisäisesti johdonmukaista. Jokainen ablaatio käytti samaa joukkoa, joten ne asettuivat keskenään oikeaan järjestykseen. Tasot nousivat monotonisesti. Lähes-kaksoiskappaleiden osajoukko käyttäytyi odotetusti. Mikään ei näyttänyt väärältä, koska mikään ei *ollut* väärin lukuun ottamatta akselin otsikkoa.

Vastakkainasetteleva katselmointi löysi sen kahdessakymmenessä minuutissa käytännössä ilmaiseksi. Julkaisen tämän osion paljon mieluummin itse kuin luen jonkun toisen kirjoittamana kommenttikentästä.

---

*Data: [The Upworthy Research Archive](https://osf.io/jd64p/). Matias, J., Munger, K., Le Quere, M.A., Ebersole, C. (2021), Nature Scientific Data. CC BY 4.0. Kokeet väliltä 25.6.2013 – 10.1.2014 on jätetty kokonaan pois ylläpitäjien vuonna 2024 ilmoittaman satunnaistusvirheen vuoksi. Painojen DOI: [10.57967/hf/10573](https://doi.org/10.57967/hf/10573).*
