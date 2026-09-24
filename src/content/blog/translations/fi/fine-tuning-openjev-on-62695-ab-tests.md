---
title: "OpenJevin hienosäätö 62 695 A/B-testillä"
date: 2026-09-23
updated: 2026-09-24
tags: [ml, decision-models, calibration, open-weights, benchmarks]
draft: false
description: "Otsikoiden rankkaajan kouluttaminen Upworthyn A/B-testeillä, evaluoinnin korjaaminen ja vertailu Geminiin sekä siirrettävyys Redditiin."
---

Kävin läpi 26 "scoring and ranking" -projektia noin 300 julkisen projektin joukosta, jotka oli rakennettu uusien päätösmallien päälle. Kaikki 26 hakivat pisteytyksensä kysymällä mallilta: arvioi tämä artikkeli, arvostele tämä teksti, päätä onko tämä dokumentti relevantti.

Halusin kokeilla tätä mitattujen tulosten pohjalta. Aikeenani on lopulta pisteyttää sähköpostien otsikkorivejä, joten paremmin klikkauksia keränneen otsikon ennustaminen tuntui hyvältä paikalta aloittaa.

Tuloksena on **[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)**, 435 miljoonan parametrin otsikoiden rankkaaja, joka on julkaistu Apache 2.0 -lisenssillä. Se pisteyttää tekstin yhdellä eteenpäinmenolla (forward pass). Pohjana on [`com-kotobalabs/open-jev-deberta-v3-large`](https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large), eli tyypitetyillä päätöksillä esikoulutettu DeBERTa-v3-large. Painot löytyvät verkosta, jos haluat kokeilla.

| Mittari | Tämä malli | Sattuma |
|---|---|---|
| Jokainen testin sisäinen pari, uusi split | **0.689** | 0.524 |
| Parit, joissa testi ratkesi tilastollisesti (p<0.05) | **0.843** | 0.547 |
| Puhtaat parit, ei mitään opetusdataa muistuttavaa | **0.671** | 0.524 |
| Valitsee parhaan 4–5 variantista | **47.7%** | 24.9% |
| Välttää huonoimman variantin | 90.3% | 75.1% |
| Reddit-otsikkoparit, domenin ulkopuolelta | 0.522 | 0.500 |

Vain 29 % pareista saavuttaa tilastollisen merkitsevyyden 5 % tasolla. Ensimmäinen rivi sisältää kaikki parit, myös ne, joissa havaittu klikkiprosentin ero saattaa olla pelkkää kohinaa. Toinen rivi rajaa evaluoinnin merkitseviin pareihin.

Malli sovitettiin 47 168 haaraan (arm) 16 129 satunnaistetussa otsikkokokeessa. Yllä olevat tulokset käyttävät dataa, jolla sitä ei koulutettu. Suurin osa alla olevista ajoista käytti kapeampaa evaluointia: yhtä paras vastaan huonoin -paria testiä kohden. Huomasin tämän virheen myöhemmin; korjaukset-osio selittää sen, ja yllä oleva taulukko raportoi kaikkien parien tarkkuuden.

## Data ja menetelmä

[Upworthy Research Archive](https://osf.io/jd64p/) on ollut julkinen vuodesta 2021 lähtien CC BY -lisenssillä. Se sisältää 32 487 satunnaistettua otsikoiden A/B-testiä tammikuun 2013 ja huhtikuun 2015 väliltä, sisältäen 538 miljoonaa jakoa sekä näyttö- ja klikkausmäärät jokaiselle variantille. Kyllä, kyseessä on se "et ikinä usko mitä tapahtui seuraavaksi" -porukka. Heidän otsikkonsa ovat melko omaleimaista tekstiä, mutta arkiston avulla pystyin vertailemaan variantteja todellisiin klikkauksiin.

Aloitin ModernBERT-largella ja regressiopäällä. Kohdemuuttujana oli kutistettu logit-klikkiprosentti, joka oli keskitetty kunkin testin omaan keskiarvoon. Itse artikkeli selittää suuren osan klikkiprosentin varianssista, joten halusin ennustaa, miten otsikko pärjäsi suhteessa kyseisen artikkelin muihin otsikoihin. Beta-binomikutistus vetää estimaatteja kohti testin keskiarvoa, voimakkaammin 600 näyttökerran haaralle kuin 20 000 näyttökerran haaralle.

Ajo kesti 25 minuuttia yhdellä L4-GPU:lla ja maksoi noin neljäkymmentä senttiä. Koulutin confirmatory-splitin vuosien 2013–2014 osuudella, jätin sen vuoden 2015 testit sivuun ja sain **0.704 parittaisen tarkkuuden.**

Silloin vertasin tätä tulokseen [0.544](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682), jonka torontolainen ryhmä oli saanut käsin tehdyillä kielellisillä piirteillä. Heidän artikkelinsa kutsuu ongelmaa "luonnostaan vaikeaksi, eikä kyse ole vain otoskoosta". Tuossakin vertailussa oli ongelmia: heidän parien valintansa ja tutkimuskysymyksensä poikkesivat omastani, kuten selitän aiempaa työtä käsittelevässä osiossa.

Kirjoitin ensimmäisen tuloksen otsikolla "Headline signal survives two years of drift."

## Evaluointi splittien välillä

Lulin vuoden 2015 tuloksen osoittavan, että malli kesti otsikkotyylin muutokset ajan myötä. Koska haluan lopulta käyttää tätä sähköposteihin, minua kiinnosti, miten hyvin se toimii koulutusdatansa ulkopuolella.

Arkistossa on kolme splittiä: exploratory, confirmatory ja holdout. Olin toistaiseksi käyttänyt vain confirmatory-osaa. Samojen painojen ajaminen kahdella muulla antoi seuraavat tulokset:

```
confirmatory 2015:  0.704
holdout:            0.637
exploratory:        0.624
```

Holdout ja exploratory olivat 0.013:n sisällä toisistaan jokaisella tarkastelemallani efektikokotasolla. Molemmat jäivät selvästi confirmatory 2015 -setin tuloksista.

![Parittainen tarkkuus Upworthy-arkiston kolmen splitin yli. Confirmatory 2015 -viiva on selvästi holdoutin ja exploratoryn yläpuolella, jotka seuraavat toisiaan läheisesti.](/assets/img/blog/decision-models/splits.png)

## Splittien rakenne

Arkiston dokumentaatio kertoo, että testit jaetaan sen kolmeen splittiin satunnaisesti. Jokainen splitti kattaa lähes koko ajanjakson:

![Kaksi palkkia. Ensimmäinen näyttää puhtaan kronologisen jaon, ensin opetus ja sitten testi. Toinen näyttää todellisen rakenteen: opetus- ja testilohkot lomittain koko ajanjakson yli.](/assets/img/blog/decision-models/split-structure.png)

| Split | Haarat | Päivämääräväli | Osuus ennen vuotta 2015 |
|---|---|---|---|
| confirmatory | 51,891 | 2013-01-24 → 2015-04-30 | 83.5% |
| holdout | 11,231 | 2013-01-24 → 2015-04-29 | 82.8% |
| exploratory | 10,804 | 2013-01-26 → 2015-04-29 | 83.8% |

Noin 83 % holdoutista oli peräisin koulutusjakson ajalta, mutta tarkkuus oli silti seitsemän prosenttiyksikköä huonompi kuin vuoden 2015 häntäpäässä. Ero ei siis selittynyt sillä, että uudemmat otsikot olisivat olleet vaikeampia. Päivämääriin perustuva evaluointini confirmatory-setin sisällä ei riittänyt todistamaan väittämääni ajallista yleistymistä.

## Vuoto ja leimakohina

Tarkistin seuraavaksi datavuodon mahdollisuuden. Upworthy käytti samoja artikkeleita uudelleen eri testeissä, joten satunnainen jako saattoi viedä samankaltaisia otsikoita sekä opetus- että evaluointidataan.

Ensimmäinen tarkistukseni etsi vain täydellisiä osumia ja löysi viisi jaettua otsikkoa 650:stä. Se ei kuitenkaan huomannut melkein identtisiä otsikoita. Käytin käänteistä indeksiä mitatakseni kunkin evaluointiotsikon ja 47 168 opetusotsikon välisen maksimaalisen Jaccard-token-päällekkäisyyden.

| Evaluointisetti | n | ≥0.9 päällekkäisyys | mediaani |
|---|---|---|---|
| confirmatory 2015 | 1,300 | 0.5% | 0.227 |
| holdout | 4,274 | **30.5%** | 0.300 |

Holdoutissa oli suhteellisesti noin kuusikymmentä kertaa enemmän lähes identtisiä pareja huonommasta tarkkuudestaan huolimatta. Niiden poistaminen antoi tulokseksi 0.646, hieman yli arvon 0.637. Tämä tarkistus ei selittänyt eroa eikä osoittanut tarkkuushyötyä lähes identtisistä pareista.

Tarkistin myös, oliko holdoutissa vähemmän näyttökertoja tai kohinaisemmat leimat:

| Evaluointisetti | näyttökertojen mediaani | z-mediaani | CTR-suhteen mediaani |
|---|---|---|---|
| confirmatory 2015 | 2,462 | 2.37 | 2.24 |
| holdout | 3,096 | 2.64 | 1.99 |

Holdoutissa oli enemmän näyttökertoja ja korkeammat z-arvot. Vuoden 2015 pareilla oli tosin suurempi mediaani CTR-suhde, 2.24 vastaan 1.99, mikä saattoi tehdä niistä helpompia erottaa toisistaan. En silti pystynyt selittämään koko eroa, joten kirjasin sen selittämättömäksi ja käytin noin 0.63:a kahden muun splitin tukemana perustasona.

## Ablaatiot

Seuraavaksi vertasin opetusdatan lisäämistä häviöfunktion vaihtamiseen. Exploratory-setin mukaan ottaminen kasvatti käytettävissä olevan opetusdatan 62 695 haaraan. Evaluoin jokaisen konfiguraation samoilla 2 137 holdout-parilla, yksi paras vastaan huonoin -pari testiä kohden.

```
Phase 0        confirmatory       MSE              0.637
more-data      expl+confirmatory  MSE              0.724
rank           confirmatory       Bradley-Terry    0.775
rank+more      expl+confirmatory  Bradley-Terry    0.787
```

![Ablaatiotulokset. Datan lisääminen parantaa tulosta 0.087 perustasoon nähden; Bradley-Terryyn vaihtaminen parantaa tulosta 0.138, ja paras ajo yltää arvoon 0.812.](/assets/img/blog/decision-models/ablations.png)

Datan lisääminen paransi tarkkuutta **0.087**. Bradley-Terryyn vaihtaminen paransi sitä **0.138**, käyttäen pienempää opetussettiä ja kahta epookkia kolmen sijaan.

Olin kouluttanut klikkausprosenttiregressoria ja evaluoinut, järjestikö se parit oikein. Järjestämiseen tarkoitettu ranking loss -häviöfunktio sopi paremmin kyseiseen evaluointiin.

[Bradley-Terry](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) koulutetaan parittaisilla preferensseillä. Maksimoin jokaiselle yhden testin sisäiselle haaraparille arvon `logsigmoid(score_winner - score_loser)`, painotettuna vähemmän näyttöjä saaneen haaran logaritmisilla näyttökerroilla. Opetuksen 47 168 haaraa tuottivat 76 892 testin sisäistä paria.

ModernBERT-*base* saavutti arvon 0.761 kolmasosalla parametreista, mikä tekee siitä varteenotettavan vaihtoehdon CPU-ajoon.

Päätöstehtävillä esikoulutettu DeBERTa-v3-large-variantti ei aluksi oppinut lainkaan. Sen häviö pysyi arvossa `-log(0.5)` kaikkien 4 804 askeleen ajan, ja tulokseksi tuli 0.519.

Tasainen häviö sai minut tarkistamaan opetusasetukset. Enkooderi oli latautunut oikein; vain luokittelija ja pooleri oli alustettu puhtaalta pöydältä.

Olin käyttänyt uudelleen ModernBERTin oppimisnopeutta 2e-5. Löydettyäni raportteja [DeBERTa-koulutuksen epävakaudesta](https://github.com/microsoft/DeBERTa/issues/77), kokeilin arvoa 6e-6.

Arvolla 6e-6 häviö eteni 0.709 → 0.682 → 0.620 → 0.360. Tarkkuus nousi **0.812:een**, kaksi ja puoli prosenttiyksikköä ModernBERTin yläpuolelle, ja 0.913:een korkeimman luottamusvälin tasolla.

Lähes identtiset parit suodattavalla testillä se sai tuloksen **0.797** ModernBERTin 0.769:ää vastaan. Sen tarkkuus myös laski vähemmän suodatuksen jälkeen.

## Kalibrointi ja toteutunut noste

Parittainen tarkkuus ei kerro, kuinka monta lisäklikkausta mallin valinnoilla saataisiin. Se riippuu varianttien välisten erojen suuruudesta.

Vertasin kussakin testissä mallin korkeimmalle pisteyttämän haaran havaittua klikkiprosenttia testin haarojen keskiarvoon. Keskiarvo vastaa variantin valitsemista täysin satunnaisesti; se ei edusta toimittajan tekemää valintaa.

| | CTR |
|---|---|
| Testin keskiarvo, ei mallia | 1.20% |
| Mallin valinta | 1.42% |
| Oraakkeli, täydellinen valinta | 1.60% |

Tämä tarkoittaa **+18.3 % suhteellista klikkausprosentin kasvua** 2 140 testin yli.

### Mitä tämä kertoo muista yleisöistä

18.3 % riippuu Upworthyn 1.20 %:n perustasosta ja sen otsikkovarianttien välisestä hajonnasta. En tiedä, millainen noste olisi B2B-uutiskirjeelle, jolla on 2.5 %:n klikkiprosentti ja toisiaan enemmän muistuttavat otsikkorivit.

Mittasin myös, kuinka usein malli teki hyödyllisiä valintoja testin sisällä. Nämä mittarit ovat vähemmän sidoksissa absoluuttiseen klikkiprosenttiin, mutta nekin vaativat testausta muilla yleisöillä:

| Mittari | Arvo |
|---|---|
| Välttää huonoimman variantin | **90.3%** |
| Voittaa testin keskiarvon | 76.6% |
| Valitsee todellisen parhaan variantin | 47.7% |
| Saavutettu potentiaali, testien mediaani | 89.2% |
| Spearman, pisteytys vs. klikkiprosentti | 0.526 |

Huonoimman variantin välttäminen 90.3 % ajasta on tässä hyödyllistä verrattuna satunnaisvalinnan 75.1 %:iin. Parhaan variantin 47.7 %:n tarkkuus on noin 1.9-kertainen 24.9 %:n sattumatasoon verrattuna. Kumpikaan tulos ei kuitenkaan kerro, miten malli suoriutuisi sähköposteissa.

Saavutetun potentiaalin määrä vaihtelee paljon: mediaani on 89.2 %, kvartiiliväli 5 % – 100 % ja yhdistetty arvo 55.4 %. Korkea mediaani ei tarkoita, että malli nappaisi niin suuren osan kaikesta saatavilla olevasta kokonaishyödystä.

Sovitin [isotonisen regression](https://en.wikipedia.org/wiki/Isotonic_regression) kartoittamaan pisteet odotettuun nosteeseen. Se sovittaa monotonisen suhteen pakottamatta tiettyä käyrän muotoa. Bradley-Terry oppii järjestyksen; se ei tee raakapisteistä kalibroituja klikkiprosentteja. Tein bootstrap-otannan testien yli, koska saman testin haarat jakavat saman artikkelin eivätkä ole riippumattomia.

| Pisteet | vs. perustaso | 90 % väli |
|---|---|---|
| −2.72 | **−19.1%** | [−0.252, −0.209] pp |
| −1.06 | −8.2% | [−0.111, −0.086] pp |
| −0.20 | −0.7% | [−0.023, −0.000] pp |
| +0.56 | +3.7% | [+0.030, +0.056] pp |
| +1.62 | +11.1% | [+0.115, +0.147] pp |
| +2.82 | **+21.8%** | [+0.231, +0.274] pp |

![Kalibrointikäyrä. Arvioitu klikkiprosentin ero perustasoon kasvaa monotonisesti mallin pisteiden myötä, 90 % väleillä.](/assets/img/blog/decision-models/calibration.png)

Keskivaiheen pisteet vastaavat pieniä arvioituja eroja perustasoon. Nämä välit kuvaavat kalibroitua nostetta, eivät sitä, ovatko kaksi tiettyä otsikkoa samanarvoisia.

## Aiempi työ tämän arkiston parissa

Muut tätä arkistoa käyttävät tutkimukset soveltavat erilaisia tehtäviä, syötteitä ja evaluoinnin osajoukkoja:

| Lähde | Tehtävä | Metriikka | Arvo | Sattuma |
|---|---|---|---|---|
| LOLA, ihmiset (n=4,571) | k:n paras (top-1) | tarkkuus | ~sattuma | 0.330 |
| LOLA, GPT-4 in-context | k:n paras (top-1) | tarkkuus | 0.400 | 0.330 |
| LOLA, LoRA Llama-3-8B | k:n paras (top-1) | tarkkuus | 0.469 | 0.330 |
| LOLA, hienosäädetty GPT-4o | k:n paras (top-1) | tarkkuus | 0.488 | 0.330 |
| [arXiv:2506.00152](https://arxiv.org/abs/2506.00152), Pythia-12B | merkitsevät parit, + ingressi + aikaleima | ROC AUC | 0.82 | 0.50 |
| [PLOS ONE 0281682](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682) | parit sovitettu artikkelin+kuvan+viikon mukaan, K≤15 | tarkkuus | 0.544 | ~0.50 |
| **VERA** | jokainen testin sisäinen pari, vain otsikko | tarkkuus | **0.689** | 0.524 |

Artikkeli, jossa saatiin 0.544, täsmää parit artikkelin, kuvan ja testausviikon mukaan ja tekee sitten satunnaisen alaotannan kokeista, joissa on yli 15 paria. Se koulutetaan 5 048 parilla. Kyseessä on rekisteröity tutkimusraportti (registered report), jossa testataan, voiko ennustaminen voittaa sattuman, joten kyseisen luvun vertaaminen suoraan oman mallini tarkkuuteen liioittelee tuloksiani.

Pythia-12B-palkkiomalli raportoi ROC AUC -arvoksi 0.82. Se koulutetaan pareilla, joiden CTR-ero on merkitsevä 5 % tasolla (noin 28 % pareista), ja se lukee otsikon lisäksi artikkelin ingressin ja julkaisun aikaleiman. Sen AUC ja minun tarkkuuteni eivät ole keskenään vaihtokelpoisia, joten nämä luvut eivät kerro, kumpi malli on parempi.

En ole löytänyt julkaistua tulosta, joka raportoisi hienosäädetyn enkooderin parittaisen tarkkuuden suodattamattomille testin sisäisille pareille pelkän otsikkotekstin perusteella. Se tekee tästä hyödyllisen lisäevaluoinnin, muttei todista uutta huipputulosta (state-of-the-art).

## Tässä mitatut perustasot

Ajoin Gemini 3.1 Pron ja Layan evaluointipareillani saadakseni suoran vertailukohdan.

Esitin jokaisen parin kahdesti vaihtamalla otsikoiden järjestystä ja hyväksyin ennusteen vain, kun molemmat järjestykset valitsivat saman otsikon. Tämä tarkistaa sijaintiharhan (position bias). Taulukko raportoi tarkkuuden täsmäävillä pareilla sekä osuuden ennusteista, jotka olivat yhdenmukaisia kummassakin järjestyksessä; pelkkä tarkkuus jättää huomiotta sen, miten usein järjestelmä reputti tämän testin.

| Järjestelmä | Parametrit | Täsmäävät parit | Sisäisesti johdonmukaiset |
|---|---|---|---|
| **VERA** | 435M | **0.823** | — |
| Gemini 3.1 Pro | frontier | 0.751 | 83.7% |
| Laya typed-decisions | 421M | 0.504 | 52.9% |

VERA sai täsmäävissä pareissa noin seitsemän prosenttiyksikköä paremman tuloksen kuin Gemini, noin tuhannesosalla kutsukohtaisista kustannuksista. Gemini-evaluointi maksoi 5,60 dollaria. Olin aiemmin viitannut ihmisten sattumatasoiseen suoritukseen todisteena siitä, että tämä olisi vaikeaa myös malleille; Geminin 0.751 ei tue tätä oletusta.

Laya sai tulokseksi 0.504 ja antoi johdonmukaisen vastauksen 52.9 %:ssa pareista. Sen model card kattaa laskujen käsittelyn, tietoturvapoikkeamat, asiakaspalvelun ja agenttien lokit. Tämä evaluointi testaa sitä näiden osa-alueiden ulkopuolella, joten en käyttäisi tulosta sen suorituskyvyn arvioimiseen kyseisissä tehtävissä.

Gemini sai myös tuloksen 0.641 pareilla, joiden klikkiprosentin ero ei ollut merkitsevä 5 % tasolla, kun sattumataso oli 0.500. VERA sai kyseisessä osajoukossa tuloksen 0.696. Olin pitänyt näitä pareja pelkkänä kohinana, mutta merkitsevyyskynnyksen alittaminen ei tarkoita, etteikö ennustesignaalia olisi. Geminiä ei ollut hienosäädetty näillä leimoilla; sen tulos tukee tätä erottelua, vaikkei se suljekaan pois vuotoa VERAn evaluoinnissa.

## Siirto toiseen domeeniin

Upworthy-tulokset ovat peräisin yhden julkaisijan viraaleista some-otsikoista vuosilta 2013–2015. Haluan silti edelleen pisteyttää sähköpostien otsikkorivejä.

4 000 tilaajalle lähtevä B2B-uutiskirje on täysin eri ympäristö, eikä hyvä menestys Upworthyssa kerro, toimiiko tämä siellä.

Alustavaa siirtotestiä varten käytin SNAPin Reddit-datasettiä: 132 308 postausta 16 242 kuvan yli, joista jokainen kuva oli postattu keskimäärin noin kahdeksan kertaa eri otsikoilla.

Nämä postaukset eivät olleet satunnaistettuja. Muodostin parit saman kuvan ja subredditin sisällä, sovitin suorituskyvyn heikkenemisen suhteessa uudelleenpostausindeksiin subredditeittäin ja järjestin residuaalit. Pidin vain parit, joiden residuaaliero oli tarpeeksi suuri voittajan julistamiseen.

117 118 paria. VERA saa tuloksen **0.522**. Sattumataso on 0.500. Sääntö "pidempi otsikko voittaa" saa tuloksen 0.507.

Parien käsitteleminen riippumattomina antaa keskivirheeksi 0.0015, noin viisitoista keskivirhettä sattumatason yläpuolella. Parit kuitenkin jakavat kuvia, joten pelkkä laskelma ei riitä tilastollisen merkitsevyyden vahvistamiseen. Tarkkuus nousee 0.508:sta 0.531:een residuaalieron kvartiilien yli ja vaihtelee r/WTF:n 0.495:stä r/fffffffuuuuuuuuuuuu:n 0.558:aan. Oli miten oli, 0.522 ei ole riittävän hyödyllinen siihen, mitä haluan rakentaa.

Redditin ylä-äänet eivät ole klikkiprosentteja, enkä ole vakioinut vuorokaudenaikaa tai postaajan mainetta. Heikko tulos voi johtua huonosta siirrettävyydestä, näistä sekoittavista tekijöistä tai molemmista. Se ei anna perusteita luvata hyödyllistä suorituskykyä Upworthyn ulkopuolella.

Jotta voisin testata sähköpostia suoraan, tarvitsen otsikkorivejä, joille on mitattu lähetystulokset. En löytänyt opettamiseen sopivaa julkista datasettiä:

| Lähde | Koko | Saatavuus |
|---|---|---|
| Return Pathin otsikkorivitutkimus | 9M otsikkoriviä | Suljettu, 2015, ei koskaan julkaistu |
| Belkinsin B2B-korpus | 5.5M sähköpostia | Vain koottuja tilastoja |
| Yahoo (IEEE 7004277) | 100k+ riviä, miljardeja näyttökertoja | Suljettu |
| Oraclen NLORP-tutkimus | 300 riviä | Kaavittu Googlesta, lukuja ei mitattu |
| Erilaiset Kagglen "email campaign" -setit | vaihtelee | Keinotekoisia tai synteettisiä |

Esimerkiksi Oraclen tutkimus käyttää "yli 300 erilaista erikoistarjoussähköpostien otsikkoriviä, jotka on poimittu useista internet-lähteistä Google-haun kautta". Niiden mukana ei tule mitattuja klikkiprosentteja. Yhteen kootut havainnot otsikkorivin pituudesta tai sanavalinnoista eivät myöskään anna lähetyskohtaisia leimoja, joita tämä opetusasetelma vaatii.

## Datan saatavuus

Opetusdata on julkista, ja painojen tuottaminen maksoi minulle noin neljä dollaria. Tämä on toistettavissa oleva koe, ja minun on edelleen selvitettävä, toimiiko lähestymistapa sähköposteissa.

Sähköpostipalveluntarjoajat ja uutiskirjeiden ylläpitäjät, joilla on A/B-testauslogeja, voisivat tarjota tarvittavaa dataa. Tarvitsisin otsikkorivivariantteja ja niiden mitattuja tuloksia sekä tavan evaluoida ennusteita uusissa lähetyksissä. Minulla ei vielä ole tällaista järjestelmää pystyssä.

## Yleistyminen

Haluaisin kokeilla tätä muihin päätöksiin, joista on tallennettu tuloksia. Jos käytät kokeilualustaa, kuten Optimizelya, Statsigia tai LaunchDarklya, sinulla saattaa jo olla ehdokasvariantteja ja tuloksia valmiina. Muutamia mahdollisia tehtäviä:

| Päätös | Leima, joka sinulla jo on |
|---|---|
| Otsikkorivit, otsikot, push-viestit | avaukset, klikkaukset |
| Tukipalvelun makron valinta | ratkaistu ilman eskalointia |
| Hakutulosten uudelleenjärjestäminen (reranking) | minkä tuloksen käyttäjä valitsi |
| Virheilmoitusten muotoilu | ratkaisi itse tai teki tukipyynnön |
| Tuotelistauksen otsikot | konversiot |
| Agentin työkalun valinta | onnistuiko suorituspolku (trajectory) |

Olen erityisen kiinnostunut agentin työkalun valinnasta. Jevin kolme primitiiviä ovat `choice`, `score` ja `noul`; tämä koe käyttää `score`-primitiiviä. Sen kokeileminen `choice`-primitiivillä vaatisi lokeja tarjolla olleista vaihtoehdoista, valitusta työkalusta ja siitä, mitä sen jälkeen tapahtui. Lokeista pitäisi silti tarkistaa, mahdollistavatko ne reilun vertailun.

Toistaiseksi olen testannut tuloksiin perustuvaa opetusta zero-shot-arviointia vastaan yhdessä tehtävässä. En tiedä, päteekö tämä etu mihinkään näistä muista.

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

Käytä pisteitä saman sisällön ehdokkaiden vertailuun, esimerkiksi 3–6 variantille yhtä lähetystä kohden. Lopullinen malli oppi testin sisäisiä järjestyksiä, joten raakapisteet eivät ole absoluuttinen laadun mittari tai klikkaustodennäköisyys. Painoihin sisältyy myös Upworthy-tuloksiin sovitettu kalibraattori.

CPU-käyttöä varten on myös pienempi ModernBERT-base-malli. Se saa tuloksen 0.761 paras vastaan huonoin -evaluoinnissa kolmasosalla parametreista.

## Rajoitukset

En ole testannut tätä sähköposteilla, ja Reddit-tulos oli heikko. Upworthy-tuloksia ei pitäisi pitää uutiskirjeiden odotettuna suorituskykynä.

Jos pyörität uutiskirjettä ja sinulla on aiemmista lähetyksistä mitattuja avaus- tai klikkiprosentteja, ota yhteyttä. Haluaisin testata tätä, ja data pysyy sinun omana tietonasi.

## Korjaukset

Evaluointikoodin katselmoinnissa 24.9.2026 löytyi useita ongelmia.

Evaluointini kutsui `pairs_from`-funktiota, joka säilyttää vain yhden parin testiä kohden: parhaan haaran huonointa vastaan. Opetus sen sijaan rakensi kaikki parit. Tulos 0.812 mittasi siten vain kunkin testin suurimman eron paria. Kaikkien 18 485 testin sisäisen parin yli tarkkuus on **0.689** perustason 0.524 rinnalla.

| Parisetti | n | Pituuden perustaso | VERA |
|---|---|---|---|
| jokainen testin sisäinen pari | 18,485 | 0.524 | **0.689** |
| paras haara huonointa vastaan, yksi per testi | 2,137 | 0.546 | 0.812 |

Ajoin myös tavallisen `microsoft/deberta-v3-large` -mallin täsmälleen samalla reseptillä. Se saa samassa setissä tuloksen 0.805 verrattuna arvoon 0.812, mikä on raportoitua 0.009:n keskivirhettä pienempi ero. Tämä ei todista tyypitetyillä päätöksillä tehdyn esikoulutuksen hyötyä. Oppimisnopeuden laskeminen korjasi opetuksen kummallakin pohjamallilla.

Yllä olevat ablaatiot käyttävät kaikki alkuperäistä 2 137 parin settiä, joten ne ovat keskenään vertailukelpoisia kyseisessä evaluoinnissa. Ne eivät ole kaikkien parien tuloksia.

Muita korjauksia: painojen mukana toimitettu kalibraattori oli sovitettu eri ajossa, bootstrap-otantani käytti `.isin()`-metodia takaisinpanolla poimittuun otokseen ja siten pudotti duplikaatit pois, ja sattumatasot heittivät kaksi prosenttiyksikköä, koska en ollut laskenut niitä todellisista haaramääristä.

Aloitustaulukko raportoi korjatut tulokset. Aiemmat ajot pysyvät yllä olevassa tekstissä evaluointiosajoukkonsa kera.

---

*Data: [The Upworthy Research Archive](https://osf.io/jd64p/). Matias, J., Munger, K., Le Quere, M.A., Ebersole, C. (2021), Nature Scientific Data. CC BY 4.0. Kokeet väliltä 25.6.2013 – 10.1.2014 on jätetty pois koko analyysistä ylläpitäjien vuonna 2024 ilmoittaman satunnaistusvirheen vuoksi. Painojen DOI: [10.57967/hf/10573](https://doi.org/10.57967/hf/10573).*
