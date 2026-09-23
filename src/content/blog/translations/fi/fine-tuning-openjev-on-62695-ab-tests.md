---
title: "OpenJevin hienosäätö 62 695 A/B-testillä"
date: 2026-09-23
tags: [ml, decision-models, calibration, open-weights, benchmarks]
draft: false
description: "Koulutin päätöksentekomallin oikeasti ajettujen A/B-testien perusteella sen sijaan, että olisin kysynyt toiselta mallilta sen mielipidettä. Se väistää huonoimman variantin 90 % ajasta, ja ensimmäinen vertailutestini ei mitannut kirjaimellisesti yhtään mitään lol"
---

Uusien päätöksentekomallien päälle on rakennettu suurin piirtein 300 julkista projektia. Kävin läpi "pisteytys ja järjestäminen" -kategoriasta 26 projektia, ja jokainen niistä pisteyttää asioita vain kysymällä mallilta sen mielipidettä. Pisteytä tämä artikkeli kahdeksalla laatuakselilla, arvioi tämän tekstin tyyli, päätä onko tämä dokumentti relevantti, tajusit varmaan idean.

Eikä se ole mitään dataa? Se on mallin mielipide, johon on lätkäisty numero perään, ja koko kategoria nojaa suoraan sanottuna siihen.

Niinpä koulutin mallin oikeasti mitattujen lopputulosten perusteella, ja painot ovat jaossa jos haluat kokeilla: **[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)**, Apache 2.0, 435M parametria, yksi eteenpäinvienti (forward pass), se pisteyttää lyhyttä suostuttelevaa tekstiä. Pohjamallina on [`com-kotobalabs/open-jev-deberta-v3-large`](https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large), joka itsessään on tyypitetyillä päätöksillä esikoulutettu DeBERTa-v3-large.

| Mittari | Tämä malli | Julkaistu SOTA | Ihmiset |
|---|---|---|---|
| Parittainen tarkkuus, näkemätön jako | **0.812** | 0.544 | ~sattuma |
| Vain puhtaat parit | **0.797** | - | - |
| Välttää huonoimman variantin | **90.3%** | - | - |

Se on koulutettu 62 695 todellisella A/B-haaralla 32 487 satunnaistetusta otsikkokokeesta, ja jokainen yllä oleva luku tulee jaosta, jota malli ei ole koskaan nähnyt. Alla kerron miten tähän päästiin, mukaan lukien kohta, jossa ensimmäinen vertailuni mittasi täysin olemattomia (kyllä, kismittää edelleen vähän).

## Asetelma

Osoittautui, että tähän on olemassa täydellinen datasetti, joka on lojunut avoimesti saatavilla vuodesta 2021 asti. Tammikuun 2013 ja huhtikuun 2015 välillä Upworthy (kyllä, *se* Upworthy, "et usko mitä seuraavaksi tapahtui" -tyypit) ajoi otsikoilleen 32 487 satunnaistettua A/B-testiä. Oikeaa liikennettä, oikeaa satunnaistusta, 538 miljoonaa jakoa, ja sitten Cornell meni ja julkaisi koko roskan nimellä [the Upworthy Research Archive](https://osf.io/jd64p/) CC BY -lisenssillä. Jokainen otsikkovariantti, jokainen näyttökerta, jokainen klikkaus.

Se on suunnilleen niin lähellä pohjatotuutta kuin lyhyt suostutteleva teksti voi päästä.

Joten: ModernBERT-large regressiopäällä, jossa tavoitteena on kutistettu logit-klikkausprosentti keskitettynä kunkin testin omaan keskiarvoon. Keskittäminen on muuten tärkeää: itse *artikkeli* selittää valtaosan klikkausprosentin vaihtelusta, eikä otsikko voi sitä selittää, joten oikeasti halutaan ennustaa sitä, kuinka kaukana tietty haara on sen testin keskiarvosta, jossa se ajettiin. Sitten beeta-binomiaalinen kutistus kohti tuota keskiarvoa, jolloin haara, jolla on 600 näyttökertaa, lasketaan enimmäkseen prioriksi ja haara, jolla on 20 000, enimmäkseen todistusaineistoksi.

Kaksikymmentäviisi minuuttia yhdellä L4:llä, noin 40 senttiä. Jätin kaiken tammikuun 2015 jälkeisen datan testaukseen, testasin sillä ja sain **0.704 parittaisen tarkkuuden**.

Mittakaavan vuoksi: julkaistu huipputulos tällä nimenomaisella datasetillä on [0.544](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682) Toronton yliopiston ryhmältä, joka käytti käsin tehtyjä kielellisiä piirteitä 24 333 parille. Heidän artikkelinsa toteaa ongelman olevan "luonnostaan vaikea, eikä pelkästään otoskokokysymys". Ihmiset saavat samassa tehtävässä sattumanvaraisia tuloksia, ja kirjallisuudesta löytyy LoRA-hienosäädetty Llama-3-8B, joka saa 0.469 lmao.

Kuusitoista pistettä yli julkaistun tuloksen 40 sentillä. Joten tietenkin kirjoitin siitä raportin: "Otsikkosignaali kestää kahden vuoden ryöminnän."

## Ja silti

Tuon otsikon väite oli, että signaali kestää *ryömintää*, koska opetusdata oli vuosilta 2013–2014, testijoukko vuodelta 2015 ja tarkkuus tuskin liikahti. Kuin kahden vuoden muuttuva internet-kulttuuri ei olisi mallia kiinnostanut pätkääkään. Se olisi oikea löydös jos se pitäisi paikkansa, ja sillä on väliä, koska koko homman perimmäinen tarkoitus on kohdistaa tämä lopulta sähköpostien otsikkoriveihin. Jos se ei kestä kahta vuotta edes yhden julkaisijan sisällä, se ei taatusti kestä hyppyä täysin toiseen mediaan.

Arkisto tulee kolmena jakona (exploratory, confirmatory, holdout), ja olin kouluttanut ja testannut confirmatory-jaolla. Lähinnä huolellisuudesta ja täysin olettaen vahvistavani sen, minkä jo "tiesin", pisteytin samat painot kahdella muulla.

```
confirmatory 2015:  0.704
holdout:            0.637
exploratory:        0.624
```

Kiva.

Kaksi jakoa, joihin en ollut koskenutkaan, olivat 0.013 sisällä toisistaan *jokaisessa efektikokoluokassa*, ja molemmat kertoivat, että kärkitulokseni oli seitsemän pistettä liian korkea.

![Parittainen tarkkuus Upworthy-arkiston kolmessa jaossa. Confirmatory 2015 -viiva on selvästi holdoutin ja exploratoryn yläpuolella, jotka seuraavat toisiaan tiiviisti.](/assets/img/blog/decision-models/splits.png)

## Aikakone, joka kulkee vain sivuttain

Luin siis arkiston dokumentaation kunnolla tällä kertaa, ja osoittautui, että arkisto jakaa testit ryhmiin **satunnaisesti**. Ei aikajärjestyksessä, vaan satunnaisesti.

![Kaksi palkkia. Ensimmäinen näyttää siistin kronologisen jaon, ensin opetus ja sitten testi. Toinen näyttää todellisen rakenteen: opetus- ja testilohkot lomittain koko ajanjaksolla.](/assets/img/blog/decision-models/split-structure.png)

| Jako | Haarat | Aikaväli | Osuus ennen vuotta 2015 |
|---|---|---|---|
| confirmatory | 51 891 | 2013-01-24 → 2015-04-30 | 83.5% |
| holdout | 11 231 | 2013-01-24 → 2015-04-29 | 82.8% |
| exploratory | 10 804 | 2013-01-26 → 2015-04-29 | 83.8% |

Kaikki kolme jakoa kattavat samat päivämäärät samoissa suhteissa. Tämä tarkoittaa, että kun pisteytin holdoutilla, 83 % testattavasta datasta oli peräisin *opetusjakson sisältä*. Sama aikakausi, sama talon tyyli, sama kaikki, vain testejä, joita malli ei ollut koskaan nähnyt. Ja silti se pärjäsi siinä *huonommin* kuin vuoden 2015 hännässä.

Käännetäänpä asia toisinpäin, niin se on rehellisesti sanottuna aika hauskaa: aika ei maksa tälle mallille melkein mitään, mutta saman ajanjakson näkemättömät testit maksavat sille seitsemän pistettä. Huolellisesti rakentamani ryömintätesti oli koko ajan mitannut vain testien identiteettiä, se oli vain pukeutunut ajallisen yleistämisen valepukuun.

Olin rakentanut aikakoneen, joka kulkee vain sivuttain.

## Kaksi hypoteesia, molemmat väärinpäin

Seuraava ajatus on luonnollisesti datavuoto. Upworthy kirjoitti saman artikkelin kymmenillä eri otsikkovariaatioilla, joten jos *testit* jaetaan satunnaisesti, yhden artikkelin uudelleenkirjoitukset leviävät kaikkiin kolmeen jakoon, ja holdoutin pitäisi olla täynnä opetusdatan tekstien lähes-kopioita.

Kirjoitin nopean käänteisindeksiviritelmän mitatakseni kunkin eval-otsikon ja mallin opetusdatana käyttämän 38 950 otsikon välisen maksimaalisen Jaccard-tokenpäällekkäisyyden (tarkka merkkijonomäppäys oli löytänyt viisi jaettua otsikkoa 650:stä, ja kyllä, olin sen perusteella julistanut datavuodon "poissuljetuksi").

| Arviointijoukko | n | ≥0.9 päällekkäisyys | mediaani |
|---|---|---|---|
| confirmatory 2015 | 1 300 | 0.5% | 0.227 |
| holdout | 4 274 | **30.5%** | 0.300 |

Kolmekymmentä prosenttia, kuusikymmentä kertaa enemmän kontaminoitunut kuin vuoden 2015 häntä, ja se sai **heikommat** pisteet.

Datavuoto ei siis selitä eroa, se toimii täysin väärään suuntaan. Pikemminkin se tarkoittaa, että rehellisen holdout-tuloksen pitäisi olla *huonompi* kuin 0.637, kun lähes-kopiot karsitaan pois. Tarkistin tämänkin dumppaamalla parikohtaiset pisteet ja viipaloimalla ne: aidosti puhtailla pareilla malli sai 0.646, eli hieman *paremman* tuloksen. Lähes-kopiot eivät siis tuoneet sille yhtään mitään etua.

No, entäs kohina leimoissa? Ehkä holdout-pareilla on vain vähemmän näyttökertoja.

| Arviointijoukko | mediaaninäytöt | mediaani z | mediaani CTR-suhde |
|---|---|---|---|
| confirmatory 2015 | 2 462 | 2.37 | 2.24 |
| holdout | 3 096 | 2.64 | 1.99 |

Tämäkin oli väärinpäin lol. Holdout-pareilla on *enemmän* näyttökertoja ja *korkeammat* z-pisteet. Vuoden 2015 joukossa on tosin laajempi mediaani CTR-suhde (2.24 vs. 1.99), joten sen parit ovat aidosti helpompia erottaa toisistaan, mikä on totta, mutta se ei ole lähelläkään seitsemän pisteen arvoista.

Kirjoitin siis dokumenttiin "selittämätön" ja siirryin eteenpäin. 0.63 on se luku, kaksi riippumatonta jakoa on siitä samaa mieltä, eri mieltä oleva on poikkeava yksilö, enkä osaa sanoa miksi.

**!! Nörtti-infopläjäysvaroitus :3 !!**

## Osuus jolla oli oikeasti väliä

Omien kärkitulosteni romuttamisen jälkeen ajattelin, että pitäisi ainakin ajaa ablaatiot kunnolla.

Odotin datan voittavan, koska se on se tylsä oletusarvo: sinulla on 62 695 haaraa, heitä kolmas jako mukaan ja saa enemmän. Pystytin siis kaksi ajoa: toisessa lisättiin exploratory-jako opetukseen ja toisessa vaihdettiin häviöfunktio. Molemmat arvioitiin samoilla 2 137 holdout-parilla.

```
Phase 0        confirmatory       MSE              0.637
more-data      expl+confirmatory  MSE              0.724
rank           confirmatory       Bradley-Terry    0.775
rank+more      expl+confirmatory  Bradley-Terry    0.787
```

![Ablaatiotulokset. Datan lisääminen tuo +0.087 perustasoon nähden; Bradley-Terryyn vaihtaminen tuo +0.138, ja paras ajo saavuttaa 0.812.](/assets/img/blog/decision-models/ablations.png)

Kaksikymmentäkahdeksan prosenttia enemmän opetusdataa toi **+0.053**, ja häviöfunktion vaihtaminen toi **+0.107** kahdella epookilla kolmen sijaan ja pienemmällä opetusdatalla, ja se voitti silti kaksinkertaisesti.

Mikä on jälkiviisaasti aivan ilmeistä, sitä pahinta sorttia. Vertailumittari on *parittainen tarkkuus* (kahdesta otsikosta valitaan voittaja), ja minä tein regressiota klikkausprosentille. Optimoin siis mittarin sijaismittaria ja arvostelin itseni sitten varsinaisella mittarilla.

[Bradley-Terry](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) optimoi itse asiaa. Jokaiselle saman testin sisäiselle haaraparille maksimoidaan `logsigmoid(score_winner - score_loser)`, painotettuna ohuemman haaran logaritmisilla näyttökerroilla. Minun 38 950 opetushaaraani muuttui 63 597 testinsisäiseksi pariksi.

Sama malli. Sama data. Eri tavoite. Neljätoista pistettä.

Ajoin uteliaisuudesta myös ModernBERT-*base*-mallin (kolmasosa parametreista), ja se saavutti 0.761. Suurin osa tästä perustuu siis tavoitefunktioon ja dataan eikä mallin kokoon, mikä on kiva jos haluaa joskus ajaa tätä prosessorilla.

Sitten oli se tapaus, joka meinasi mennä ohi suun. Kokeilin DeBERTa-v3-large-varianttia, joka oli esikoulutettu päätöstehtäviin. Se jumitti tasan arvossa `-log(0.5)` kaikki 4 804 askelta ja sai tulokseksi 0.519, eli puhdasta arvausta, täysin flätti.

Se on helppo tulkita niin, että "DeBERTa on huonompi", ja jatkaa eteenpäin. Olin vähällä tehdä niin, mutta häviökäyrä, joka on *täydellisen* tasainen juuri siinä arvossa, joka tarkoittaa "arvaan", on todella spesifi signaali. Se ei näytä mallilta, joka oppii huonosti. Enkooderi oli latautunut ongelmitta, vain luokittelija ja pooleri oli alustettu puhtaalta pöydältä.

Syynä oli oppimisnopeus. DeBERTa-v3-large on [tunnetusti epävakaa](https://github.com/microsoft/DeBERTa/issues/77) oppimisnopeudella 2e-5, jolla ModernBERT toimii sujuvasti, ja se haluaa jotain lähempänä arvoa 6e-6. Olin käyttänyt samaa konfiguraatiota molempiin, koska miksipä ei.

Ajoin sen uudelleen arvolla 6e-6, häviö meni 0.709 → 0.682 → 0.620 → 0.360, ja tulokseksi tuli **0.812**, kaksi ja puoli pistettä yli ModernBERTin, ja 0.913 korkeimman luottamustason luokassa.

Ajoin sillekin lähes-kaksoiskappaleiden viipaleen, koska tässä vaiheessa en enää luota itseeni. Aidosti puhtailla pareilla (ei mitään opetusdataa muistuttavaa) se saa **0.797** verrattuna ModernBERTin 0.769:ään. Sen ulkoaopettelurako on myös *pienempi* kuin ModernBERTin samalla kun tulos on parempi, mikä on täysin päinvastaista sille, miltä pelkällä muistilla pärjäävä malli näyttäisi.

Järjestelmä toimi siis koko ajan loistavasti, minulla oli vain yksi luku pielessä.

## Mutta mitä 0.812 oikeastaan *tarkoittaa*

Rehellisesti sanottuna ihmiselle ei yhtään mitään. Se on parittaisen tarkkuuden ongelma väitteenä: se kertoo, että järjestys on oikea, muttei mitään suuruusluokasta. Kahden otsikon oikea järjestäminen 81.2 % ajasta voi olla omaisuuden arvoista tai täysin arvotonta riippuen siitä, miten kaukana ne todellisuudessa ovat toisistaan.

Joten mittasin sen, miltä tämä tuntuisi oikeasti viestin lähettäjälle. Otetaan jokaisesta testistä mallin parhaat pisteet saanut haara ja verrataan sen todellista klikkausprosenttia kyseisen testin kaikkien haarojen keskiarvoon. Ilman mallia ei ole mitään syytä suosia mitään tiettyä varianttia, joten kaikkien mahdollisten lähetysten keskiarvo on rehellinen kontrafaktuaali.

| | CTR |
|---|---|
| Testin keskiarvo, ei mallia | 1.20% |
| Mallin valinta | 1.42% |
| Oraakkeli, täydellinen valinta | 1.60% |

Se on **+18.3 % suhteellinen klikkausprosentti** 2 140 testissä, ja joudun ottamaan sen heti takaisin.

### Nostoluku ei siirry muualle

18.3 % on fakta Upworthysta. Se riippuu heidän 1.20 % perusprosentistaan ja siitä, miten suuren hajonnan heidän kirjoittajansa saivat aikaan varianttien välille. Kohdista tämä B2B-uutiskirjeeseen, jonka klikkausprosentti on 2.5 % ja variantit tiukempia, niin luku muuttuu suuntaan, jota en aidosti pysty ennustamaan.

Se mikä *siirtyy*, on kaikki, mikä on suhdeluku yhden testin sisällä:

| Mittari | Arvo |
|---|---|
| Välttää huonoimman variantin | **90.3%** |
| Voittaa testin keskiarvon | 76.6% |
| Valitsee todellisen parhaan variantin | 47.7% |
| Hyödynnetty potentiaali, mediaanitesti | 89.2% |
| Spearman, pisteet vs. klikkausprosentti | 0.526 |

**90.3 % on se luku, jonka taakse voisin oikeasti mennä.** Se ei melkein koskaan anna sinun lähettää huonointa kirjoittamaasi vaihtoehtoa, ja se kestää perusprosentin, yleisön ja median vaihtumisen tavalla, jota "+18.3 %" ei tee. Ja 47.7 % top-1-tulos yleensä neljää tai viittä haaraa vastaan on noin 2.2× sattuma.

Yksi näistä tosin hämää hieman. Hyödynnetyn potentiaalin mediaani on 89.2 %, kvartiilivälillä 5 % – 100 %, ja yhdistettynä kaikkien testien yli se on 55.4 %. Malli on bimodaalinen: useimmissa testeissä se nappaa lähes kaiken saatavilla olevan hyödyn, ja vähemmistössä se ei nappaa melkein mitään, ja nämä vetävät kokonaistulosta alas.

Sovitin sitten päälle [isotonisen regression](https://en.wikipedia.org/wiki/Isotonic_regression), jotta pisteillä olisi yksiköt pelkän fiiliksen sijaan. Isotoninen malli sopii tähän, koska se olettaa vain monotonisuutta (korkeammat pisteet, korkeampi klikkausprosentti), minkä Bradley-Terry nimenomaan takaa ja kirjaimellisesti vain sen. Kaikki parametrinen keksisi rakenteita, joita malli ei koskaan luvannut. Luottamusvälit saadaan bootstrap-otannalla *testeistä* eikä haaroista, koska saman testin haarat jakavat artikkelin eivätkä ole toisistaan riippumattomia.

| Pisteet | vs. perustaso | 90 % luottamusväli |
|---|---|---|
| −2.72 | **−19.1%** | [−0.252, −0.209] pp |
| −1.06 | −8.2% | [−0.111, −0.086] pp |
| −0.20 | −0.7% | [−0.023, −0.000] pp |
| +0.56 | +3.7% | [+0.030, +0.056] pp |
| +1.62 | +11.1% | [+0.115, +0.147] pp |
| +2.82 | **+21.8%** | [+0.231, +0.274] pp |

![Kalibrointikäyrä. Klikkausprosentti suhteessa perustasoon kasvaa monotonisesti mallin pisteiden myötä, ja 90 % välit ylittävät nollan vain keskivaiheilla.](/assets/img/blog/decision-models/calibration.png)

Ja katsopa keskirivejä: välit leikkaavat siinä nollan, mikä tarkoittaa mallin fiksusti toteavan "nämä kaksi ovat sama otsikko, heitä kolikkoa".

## No niin, tässä kohtaa pilaan kaiken

Jokainen yllä oleva luku on peräisin vuosien 2013–2015 viraaleista someotsikoista yhdeltä julkaisijalta, ja se mitä oikeasti haluan rakentaa, pisteyttää sähköpostien otsikkorivejä.

B2B-uutiskirje 4 000:lle mukaan liittyneelle ihmiselle ei jaa juuri mitään yhteistä otsikon "This Kid Just Destroyed The Entire Argument Against Vaccines In One Sentence" kanssa.

Lähdin siis etsimään julkista sähköpostidataa oikeilla mitatuilla lähetystuloksilla, eikä sellaista ole.

| Lähde | Koko | Saatavuus |
|---|---|---|
| Return Path subject-line study | 9M otsikkoriviä | Suljettu, 2015, ei koskaan julkaistu |
| Belkins B2B corpus | 5.5M sähköpostia | Vain koontitilastoja |
| Yahoo (IEEE 7004277) | 100k+ riviä, miljardeja näyttöjä | Suljettu |
| Oracle NLORP -tutkimus | 300 riviä | Kaavittu Googlesta, tuloksia ei mitattu |
| Useat Kaggle "email campaign" -setit | vaihtelee | Keinotekoisia tai synteettisiä |

Yksi noista on arXiv-paperi kahdelta Oraclen johtavalta datatieteilijältä, joiden koko datasetti on "300+ different subject lines of special deal emails, picked up from multiple internet sources via google search." En muuten dissaa heitä, tuo vain aidosti on se mitä on tarjolla.

Koontitulokset pyörivät vapaasti netissä (6–10 sanaa toimii parhaiten, 21–40 merkkiä avauksille, numerot tuovat muutaman pisteen), mutta mikään niistä ei ole lähetyskohtaista lopputulosdataa eikä millään niistä kouluteta mitään.

## Mikä asettaa koko harjoituksen uuteen valoon

Olin uskotellut itselleni mukavaa pientä tarinaa, kunnes toinen mielipide kaatoi sen. Tarina kuului: *arkkitehtuuri on bulkkia, pysyvä arvo on omissa lopputulosleimoissa*. Ensimmäinen puolisko pitää paikkansa, mutta jälkimmäinen on hölynpölyä, koska minulla ei *ole* omia leimoja. Upworthy on julkinen. Kuka tahansa, jolla on GPU, voi toistaa minun 0.812-tulokseni viikonlopussa alle kahvikupin hinnalla. Se on osasyy siihen, miksi painot ovat vapaasti jaossa: ne maksoivat minulle neljä dollaria, enkä voi teeskennellä niiden olevan mikään vallihauta.

Se mitä minulla oikeasti on, on todiste osaamisesta. Todellinen voimavara olisi jatkuva mittaussilmukka tuotantoliikenteessä, eikä sellaista ole vielä olemassa.

Tarvitsemani data makaa sähköpostipalveluntarjoajien järjestelmissä tekemättä mitään. Jokaisella ESP:llä, jolla on A/B-testausominaisuus, on miljoonia otsikkorivikokeita mitatuilla lopputuloksilla, eikä suunnilleen yksikään niistä kouluta sen pohjalta mitään. En siis tarvitse uutta päätä tai uutta vertailutestiä, tarvitsen yhden ihmisen, jolla on lokit.

## Asia, johon tämä yleistyy

Resepti on rehellisesti sanottuna tarpeeksi tylsä mahtuakseen yhdelle riville: jos mitattu lopputulos on olemassa, kouluta sillä äläkä kysele mallilta sen mielipidettä.

Jokainen yrityksesi koskaan ajama A/B-testi lojuu jossain testausalustassa leimattuna, tulos kyljessä, tekemättä mitään. Optimizely, Statsig, LaunchDarkly, mitä ikinä käytätkään, siellä on vuosien edestä "kokeilimme näitä viittä ja tämä voitti" -dataa, eikä kukaan ole kouluttanut sen pohjalta mitään.

Missä tahansa sinulla on ehdokasjoukko ja numero, joka näkyy myöhemmin prosessissa, pätee sama asia:

| Päätös | Leima, joka sinulla on jo valmiina |
|---|---|
| Otsikkorivit, otsikot, push-tekstit | avaukset, klikkaukset |
| Tukitiimin makron valinta | ratkaistu ilman eskalointia |
| Hakutulosten uudelleenjärjestäminen | minkä tuloksen käyttäjä valitsi |
| Virheilmoituksen sanamuoto | ratkaisi itse vai teki tukipyynnön |
| Tuotesivujen otsikot | konversiot |
| Agentin työkalun valinta | onnistuiko toimintaketju |

Tuo viimeinen rivi on se hauska, jos rakennat agentteja. Jevin kolme primitiiviä ovat choice, score ja noul, ja kaikki tässä postauksessa koskee `score`-primitiiviä. Sama temppu toimii kuitenkin myös `choice`-primitiiville missä tahansa, missä joku on lokittanut mitä päätöksen jälkeen tapahtui – mikä useimmassa agenttireitityksessä ei ole vielä kenenkään tekemää.

Yksi rehellinen rajoitus tälle kaikelle kuitenkin: minulla on tasan yksi datapiste. Lopputuloksilla kouluttaminen voitti nollalaukausarvion kirkkaasti *yhdessä tehtävässä*, ja sitä, päteekö tuo ero missään muualla, ei ole testattu. Löisin siis vetoa suunnan, en tarkan luvun puolesta.

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

Lue pisteet aina joukkona, älä koskaan yksittäisenä numerona. Koulutustavoitteena oli poikkeama testin omasta keskiarvosta, joten yksittäinen pistemäärä ei itsessään tarkoita mitään. Annat sille 3–6 yhtä lähetystä varten kirjoittamaasi varianttia ja se laittaa ne järjestykseen. Mukana on myös kalibroija, joka muuntaa pistemäärän odotetuksi nostoksi.

Ja jos 435M on liian tuhti, tarjolla on myös CPU-kokoinen vaihtoehto: ModernBERT-base saa 0.761 kolmasosalla parametreista.

## Mitä se ei tee

Siirry suoraan sähköpostiin, tai ainakaan minulla ei ole aavistustakaan, toimiiko se siellä.

Joten jos pyörität uutiskirjettä ja sinulla on aiempia lähetyksiä mitatuilla avaus- tai klikkausprosenteilla, haluaisin aidosti selvittää asian. Ota yhteyttä, ja data pysyy sinun omana tietonasi.

## Opetus

Yksi tämän alueen avoimista malleista saa omassa tyypitettyjen päätösten vertailussaan zero-shot-tulokseksi 0.362, mikä on alle enemmistöluokan 0.461 perustason.

Eikä ero 0.544:n ja 0.812:n välillä johtunut myöskään mistään nokkelasta mallintamisesta: kaksi kolmasosaa siitä tuli mittaria vastaavan häviöfunktion valitsemisesta ja loput 62 695 rivistä, joissa joku oli mitannut, mitä oikeasti tapahtui. Joten joo, jos leimaat dataasi kyselemällä mallilta, kannattaa ehkä ensin etsiä pohjatotuus, se lojuu todennäköisesti jo jossain valmiina.

---

*Data: [The Upworthy Research Archive](https://osf.io/jd64p/). Matias, J., Munger, K., Le Quere, M.A., Ebersole, C. (2021), Nature Scientific Data. CC BY 4.0. Kokeet ajanjaksolta 25. kesäkuuta 2013 – 10. tammikuuta 2014 on jätetty pois ylläpitäjien vuonna 2024 paljastaman satunnaistusvirheen vuoksi. Painojen DOI: [10.57967/hf/10573](https://doi.org/10.57967/hf/10573).*
