---
title: "OpenJevin hienosäätö 62 695 A/B-testillä"
date: 2026-09-23
tags: [ml, decision-models, calibration, open-weights, benchmarks]
draft: false
description: "Koulutin päätöksentekomallin oikeasti ajetuilla A/B-testeillä sen sijaan, että olisin kysynyt toiselta mallilta sen mielipidettä; se väistää huonoimman variantin 90 % ajasta, ja eka benchmarkkini mittasi kirjaimellisesti ei yhtään mitään lol"
---

Uusien päätöksentekomallien päälle on rakennettu suunnilleen 300 julkista projektia, ja kävin läpi pisteytykseen ja rankkaukseen keskittyvät (niitä oli 26). Jokainen niistä pisteyttää asioita vain kysymällä mallilta, mitä se on mieltä. Pisteytä tämä artikkeli kahdeksalla laatuasteikolla, arvioi tämän tekstin tyyli, päätä onko dokumentti relevantti, tiedät kyllä idean.

Eikä se nyt oikein ole dataa? Se on mallin mielipide, johon on lätkäisty numero perään, ja koko kategoria on rakennettu sen varaan tbh.

Joten koulutin mallin tuloksilla, jotka joku oikeasti mittasi, ja painot ovat jaossa jos haluat kokeilla sitä: **[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)**, Apache 2.0, 435M parametria, yksi forward pass, pisteyttää lyhyttä suostuttelevaa tekstiä. Pohjana on [`com-kotobalabs/open-jev-deberta-v3-large`](https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large), joka itsessään on tyypitetyillä päätöksillä esikoulutettu DeBERTa-v3-large.

| Mittari | Tämä malli | Julkaistu SOTA | Ihmiset |
|---|---|---|---|
| Parittainen tarkkuus, näkemätön jako | **0.812** | 0.544 | ~sattuma |
| Vain puhtaat parit | **0.797** | - | - |
| Välttää huonoimman variantin | **90.3%** | - | - |

Se on koulutettu 62 695 todellisella A/B-haaralla 32 487 satunnaistetusta otsikkokokeesta, ja jokainen yllä oleva luku tulee jaosta, jota malli ei koskaan nähnyt. Miten tähän päädyttiin selviää alta, mukaan lukien kohta, jossa ensimmäinen benchmarkkini mittasi täysin ei mitään (kyllä, olen siitä edelleen vähän katkera).

## Asetelma

Kävi ilmi, että tähän on olemassa täydellinen datasetti, joka on ollut vapaasti saatavilla vuodesta 2021 asti. Tammikuun 2013 ja huhtikuun 2015 välillä Upworthy (kyllä, *se* Upworthy, "et usko mitä tapahtui seuraavaksi" -tyypit) ajoi otsikoillaan 32 487 satunnaistettua A/B-testiä: oikeaa liikennettä, oikea satunnaistus, 538 miljoonaa jakoa, ja sitten Cornell julkaisi koko roskan nimellä [the Upworthy Research Archive](https://osf.io/jd64p/) CC BY -lisenssillä. Jokainen otsikkovariaatio, jokainen näyttökerta, jokainen klikkaus.

Tämä on suunnilleen niin lähellä perustotuutta kuin lyhyt suostutteleva teksti voi päästä, koska meillä on kirjoitettu teksti, tieto siitä mitä tapahtui kun oikeat ihmiset näkivät sen, ja kohdistus oli satunnainen, joten niiden vertailu oikeasti merkitsee jotain.

Siispä: ModernBERT-large regressiopäällä, ja kohteena kutistettu logit-klikkausprosentti keskitettynä kunkin testin omaan keskiarvoon. Keskittäminen muuten merkitsee, sillä itse *artikkeli* selittää valtaosan klikkausprosentin vaihtelusta eikä otsikko voi selittää sitä, joten todellisuudessa halutaan ennustaa sitä, kuinka kaukana haara on sen testin keskiarvosta, jossa se oli mukana. Sitten beta-binomiaalinen kutistus kohti tuota keskiarvoa, jolloin 600 näyttökerran haara lasketaan enimmäkseen prioriksi ja 20 000 näyttökerran haara enimmäkseen todisteeksi.

25 minuuttia yhdellä L4-kortilla, noin 40 senttiä. Jätin sivuun kaiken tammikuun 2015 jälkeen, testasin sillä ja sain **0.704 parittaisen tarkkuuden.**

Mittakaavaksi: julkaistu SOTA tällä nimenomaisella datasetillä on [0.544](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682), Toronton tutkimusryhmältä käsin tehtyjä kielellisiä piirteitä käyttäen 24 333 parilla, ja heidän paperinsa toteaa ongelman olevan "luonnostaan vaikea, ei vain otoskokokysymys". Saman tehtävän saaneet ihmiset suoriutuvat arvaustasolla, ja alan kirjallisuudessa on LoRA-koulutettu Llama-3-8B, joka saa 0.469, mikä on *alle* arvaustason lmao.

16 prosenttiyksikköä yli julkaistun tuloksen, 40 sentillä. Joten totta kai kirjoitin siitä: "Otsikkosignaali kestää kahden vuoden ryöminnän."

## Ja silti

Otsikon väite oli, että signaali kestää *ryömintää*, koska koulutusdata oli vuosilta 2013–2014, testidata vuodelta 2015 ja tarkkuus tuskin liikahti; ikään kuin kaksi vuotta muuttuvaa internet-kulttuuria ei olisi mallia kiinnostanut pätkääkään. Se olisi oikea löydös jos se pitäisi paikkansa, ja sillä on väliä, koska koko homman pointti on lopulta soveltaa tätä sähköpostien otsikkoriveihin, ja jos se ei kestä kahta vuotta yhden julkaisijan sisällä, se ei taatusti kestä hyppyä täysin toiseen mediaan.

Arkisto toimitetaan kolmessa jaossa (exploratory, confirmatory, holdout), ja olin kouluttanut ja testannut confirmatory-jaolla. Joten lähinnä huolellisuuttani, ja täysin odottaen vahvistavani sen minkä jo "tiesin", pisteytin samat painot kahdella muulla.

```
confirmatory 2015:  0.704
holdout:            0.637
exploratory:        0.624
```

Hienoa.

Kaksi jakoa, joihin en ollut koskenutkaan, olivat samaa mieltä keskenään 0.013:n tarkkuudella *jokaisessa efektikokoluokassa*, ja molemmat kertoivat pääotsikkotulokseni olleen seitsemän prosenttiyksikköä liian korkea.

![Pairwise accuracy across three splits of the Upworthy archive. The confirmatory 2015 line sits well above holdout and exploratory, which track each other closely.](/assets/img/blog/decision-models/splits.png)

Punainen viiva on se, josta kirjoitin, ja kaksi sen alla ovat totuus.

## Aikakone, joka kulkee vain sivusuunnassa

Luin sitten arkiston dokumentaation kunnolla tällä kertaa, ja kävi ilmi, että arkisto jakaa testit jakoihin **satunnaisesti**. Ei aikajärjestyksessä, vaan satunnaisesti.

![Two bars. The first shows a clean chronological split, train then test. The second shows the real structure: train and test blocks interleaved across the whole period.](/assets/img/blog/decision-models/split-structure.png)

| Jako | Haarat | Päivämääräväli | Osuus ennen vuotta 2015 |
|---|---|---|---|
| confirmatory | 51,891 | 2013-01-24 → 2015-04-30 | 83.5% |
| holdout | 11,231 | 2013-01-24 → 2015-04-29 | 82.8% |
| exploratory | 10,804 | 2013-01-26 → 2015-04-29 | 83.8% |

Kaikki kolme jakoa kattavat samat päivämäärät samoissa suhteissa, mikä tarkoittaa, että kun pisteytin holdoutilla, 83 % testattavasta datasta tuli *koulutusjakson sisältä*. Sama aikakausi, sama talon tyyli, sama kaikki, vain testejä joita malli ei ollut koskaan nähnyt, ja silti se sai siinä *huonomman* tuloksen kuin vuoden 2015 hännässä.

Toisinpäin käännettynä se on tbh aika huvittavaa: aika ei maksa tälle mallille juuri mitään, kun taas saman ajanjakson näkemättömät testit maksavat siltä seitsemän prosenttiyksikköä. Huolella rakentamani ryömintätesti oli koko ajan mitannut testien identiteettiä, se vain pukeutui ajallisen yleistyvyyden valepukuun.

Olin rakentanut aikakoneen, joka kulkee vain sivusuunnassa.

## Kaksi hypoteesia, molemmat väärinpäin

Seuraava ajatus oli luonnollisesti datavuoto. Upworthy kirjoitti saman artikkelin kymmenillä eri otsikkovariaatioilla, joten jos *testit* jaetaan satunnaisesti, yhden artikkelin uudelleenkirjoitukset leviävät kaikkiin kolmeen jakoon, ja holdoutin pitäisi olla täynnä koulutustekstin lähes-kopioita.

Koodasin nopean inverted-index-virityksen mittaamaan maksimaalista Jaccard-token-päällekkäisyyttä kunkin arviointiotsikon ja niiden 38 950 otsikon välillä, joihin malli todellisuudessa sovitettiin (tarkka merkkijonovertailu oli löytänyt viisi jaettua otsikkoa 650:stä, ja kyllä, olin sen perusteella julistanut datavuodon "poissuljetuksi").

| Arviointijoukko | n | ≥0.9 päällekkäisyys | mediaani |
|---|---|---|---|
| confirmatory 2015 | 1,300 | 0.5% | 0.227 |
| holdout | 4,274 | **30.5%** | 0.300 |

30 prosenttia, 60 kertaa enemmän kontaminoitunut kuin vuoden 2015 häntä, ja se sai **heikomman** tuloksen.

Vuoto ei siis selitä eroa, se toimii täysin väärään suuntaan. Jos jotain, se tarkoittaa, että rehellisen holdout-tuloksen pitäisi olla *huonompi* kuin 0.637, kun lähes-kopiot karsitaan pois. Tarkistin senkin dumppaamalla parikohtaiset pisteet ja viipaloimalla ne: aidosti puhtailla pareilla malli sai 0.646, eli hieman *paremman*, joten lähes-kaksoiskappaleet eivät auttaneet sitä yhtään.

No, nimikekohinaa sitten? Jos holdout-pareilla on vähemmän näyttökertoja, havaittu voittaja ei useammin ole todellinen voittaja, ja se asettaa katon sille, miten hyvän tuloksen mikään voi saada.

| Arviointijoukko | näyttökertojen mediaani | mediaani z | mediaani CTR-suhde |
|---|---|---|---|
| confirmatory 2015 | 2,462 | 2.37 | 2.24 |
| holdout | 3,096 | 2.64 | 1.99 |

Tämäkin meni väärinpäin lol. Holdout-pareilla on *enemmän* näyttökertoja ja *korkeammat* z-pisteet, joten niiden labelit ovat luotettavampia. Vuoden 2015 setissä on kyllä laajempi mediaani CTR-suhde (2.24 vs. 1.99), joten sen parit ovat aidosti helpompia erottaa toisistaan, mikä on totta, mutta se ei selitä läheskään seitsemää prosenttiyksikköä.

Joten kirjoitin dokumenttiin "selittämätön" ja siirryin eteenpäin. 0.63 on se luku, kaksi itsenäistä jakoa on siitä samaa mieltä, eri mieltä oleva on poikkeama, enkä osaa sanoa miksi.

**!! Nörtti-infopläjäysvaroitus :3 !!**

## Osuus, jolla oli oikeasti väliä

Tuhottuani oman otsikkotulokseni ajattelin, että pitäisi ainakin ajaa ablaatiot kunnolla.

Odotin datan määrän voittavan, koska se on se tylsä perusoletus: sinulla on 62 695 haaraa, heitä kolmas jako mukaan ja saa lisää. Joten laitoin pystyyn kaksi ajoa: toisessa lisättiin exploratory-jako koulutukseen ja toisessa vaihdettiin häviöfunktio, molemmat arvioituna samoilla 2 137 holdout-parilla.

```
Phase 0        confirmatory       MSE              0.637
more-data      expl+confirmatory  MSE              0.724
rank           confirmatory       Bradley-Terry    0.775
rank+more      expl+confirmatory  Bradley-Terry    0.787
```

![Ablation results. Adding data gains 0.087 over the baseline; switching to Bradley-Terry gains 0.138, and the best run reaches 0.812.](/assets/img/blog/decision-models/ablations.png)

28 prosenttia enemmän koulutusdataa toi **+0.053**, ja häviöfunktion vaihtaminen toi **+0.107** kahdella epookilla kolmen sijaan ja pienemmällä koulutusdatalla, ja se voitti silti tuplasti.

Mikä on jälkikäteen ajateltuna ilmiselvää, sitä pahinta lajia. Benchmark on *parittainen tarkkuus*, eli valitse kahdesta otsikosta voittaja, ja minä tein regressiota klikkausprosenttiin; optimoin siis mittarin sijaismuuttujaa ja arvostelin itseäni varsinaisella mittarilla.

[Bradley-Terry](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) optimoi sitä itseään. Jokaiselle saman testin sisäiselle haaraparille maksimoidaan `logsigmoid(score_winner - score_loser)`, painotettuna ohuemman haaran log-näyttökerroilla, koska vertailu on vain niin luotettava kuin sen vähemmän näyttöjä saanut puoli. Minun 38 950 koulutushaaraani muuttui 63 597 testinsisäiseksi pariksi.

Sama malli. Sama data. Eri optimointitavoite. 14 prosenttiyksikköä.

Ajoin uteliaisuudesta myös ModernBERT-*basen* (kolmasosa parametreista) ja se ylsi tulokseen 0.761, joten suurin osa tehosta piilee tavoitefunktiossa ja datassa eikä mallin koossa, mikä on kiva juttu jos tätä haluaa joskus ajaa CPU:lla.

Sitten oli se, joka melkein pääsi karkuun. Kokeilin päätöstehtävillä esikoulutettua DeBERTa-v3-large-varianttia, ja sen häviö pysyi tasan arvossa `-log(0.5)` kaikkien 4 804 askeleen ajan ja tulos oli 0.519, eli arvaustasolla, täysin vaakasuorassa.

Tuon voisi helposti tulkita niin, että "DeBERTa on huonompi" ja jatkaa matkaa, ja melkein teinkin niin. Mutta häviökäyrä, joka on *täydellisen* tasainen juuri sillä arvolla, joka tarkoittaa "arvaan vain", on todella spesifi signaali eikä se näytä siltä, miltä huonosti oppiva malli näyttää. Kooderi oli latautunut ihan oikein, vain luokittelija ja pooleri oli alustettu puhtaalta pöydältä, kuten odottaa sopii.

Kyse oli oppimisnopeudesta. DeBERTa-v3-large on [tunnetusti epävakaa](https://github.com/microsoft/DeBERTa/issues/77) arvolla 2e-5, johon ModernBERT on tyytyväinen, ja se vaatii lähempänä 6e-6 olevaa arvoa. Minä olin tietysti käyttänyt samaa konfiguraatiota molemmille, koska miksipä ei.

Ajoin sen uudelleen arvolla 6e-6, häviö meni 0.709 → 0.682 → 0.620 → 0.360, ja lopputulos oli **0.812**, koko projektin paras luku: kaksi ja puoli prosenttiyksikköä yli ModernBERTin ja 0.913 korkeimman luottamustason luokassa.

Ajoin sillekin lähes-kaksoiskappaleiden leikkauksen, koska tässä vaiheessa en enää luottanut itseeni, ja aidosti puhtailla pareilla (ei mitään koulutusdataa muistuttavaa) se saa **0.797** verrattuna ModernBERTin 0.769:ään. Sen memorization gap on myös *pienempi* kuin ModernBERTillä vaikka tulos on parempi, mikä on täysin päinvastaista kuin miltä pelkällä muistamisella pärjäävä malli näyttäisi.

Systeemi toimi siis koko ajan hienosti, minulla oli vain yksi numero pielessä.

## Mutta mitä 0.812 oikeastaan *tarkoittaa*

Ihmiselle rehellisesti sanottuna ei yhtään mitään. Se on parittaisen tarkkuuden ongelma väitteenä: se kertoo järjestyksen olevan oikein, mutta ei kerro mitään suuruusluokasta. Kahden otsikon järjestäminen oikein 81.2% ajasta voi olla omaisuuden arvoista tai täysin arvotonta riippuen siitä, miten kaukana ne todellisuudessa ovat toisistaan.

Joten mittasin sen, mitä joku viestiä oikeasti lähettävä kokisi. Otetaan jokaisesta testistä mallin parhaat pisteet saanut haara ja verrataan sen todellista klikkausprosenttia kaikkien kyseisen testin haarojen keskiarvoon; ilman malliahan ei ole mitään syytä suosia yhtä varianttia toisen yli, joten lähetettävissä olleiden keskiarvo on rehellinen kontrafaktuaali.

| | CTR |
|---|---|
| Testin keskiarvo, ei mallia | 1.20% |
| Mallin valinta | 1.42% |
| Oraakkeli, täydellinen valinta | 1.60% |

Tuo on **+18.3% suhteellinen klikkausprosentin kasvu** 2 140 testissä, ja joudun heti ottamaan sen teiltä pois.

### Parannusluku ei siirry sellaisenaan

18.3% on Upworthya koskeva fakta. Se riippuu heidän 1.20% perussuhteestaan ja siitä, miten suuren hajonnan heidän kirjoittajansa saivat aikaan varianttien välille. Jos tämän suuntaa B2B-uutiskirjeeseen, jonka klikkausprosentti on 2.5% ja variantit lähempänä toisiaan, luku muuttuu suuntaan, jota en aidosti osaa ennustaa.

Se mikä *siirtyy*, on mikä tahansa yksittäisen testin sisäinen suhdeluku:

| Mittari | Arvo |
|---|---|
| Välttää huonoimman variantin | **90.3%** |
| Voittaa testin keskiarvon | 76.6% |
| Valitsee todellisen parhaan variantin | 47.7% |
| Hyödynnetty parannusvara, mediaanitesti | 89.2% |
| Spearman, pisteet vs klikkausprosentti | 0.526 |

**90.3% on se luku, jonka takana voin oikeasti seisoa.** Se ei melkein koskaan anna sinun lähettää huonointa kirjoittamaasi versiota, ja se kestää perussuhteen, yleisön ja median vaihtumisen tavalla, johon "+18.3%" ei pysty. Ja 47.7% top-1-tulos yleensä neljää tai viittä haaraa vastaan on noin 2.2× arvaustasoon nähden.

Yksi noista on tosin vähän ovela. Mediaani hyödynnetystä parannusvarasta on 89.2% kvartiilivälin ollessa 5%–100%, ja kaikkien testien yli yhdistettynä se on 55.4%. Malli on bimodaalinen: useimmissa testeissä se nappaa lähes kaiken saatavilla olevan hyödyn ja vähemmistössä tuskin mitään, ja ne vetävät kokonaistulosta alas. Pelkän mediaanin mainitseminen siis kaunistelisi tulosta ja pelkän yhdistetyn luvun mainitseminen aliarvioisi tyypillistä tapausta.

Sovitin sitten [isotonisen regression](https://en.wikipedia.org/wiki/Isotonic_regression) päälle, jotta pisteillä olisi fiilispohjan sijaan selkeät yksiköt. Isotoninen regressio sopii tähän, koska se olettaa vain monotonisuutta (korkeammat pisteet, korkeampi klikkausprosentti), mikä on juuri se mitä Bradley-Terry takaa ja kirjaimellisesti ainoa asia mitä se takaa; mikä tahansa parametrinen malli keksisi rakennetta, jota malli ei ole koskaan luvannut. Luottamusvälit saadaan bootstrap-otannalla *testeistä* haarojen sijaan, koska saman testin haarat jakavat saman artikkelin eivätkä ole toisistaan riippumattomia.

| Pisteet | vs perustaso | 90% väli |
|---|---|---|
| −2.72 | **−19.1%** | [−0.252, −0.209] pp |
| −1.06 | −8.2% | [−0.111, −0.086] pp |
| −0.20 | −0.7% | [−0.023, −0.000] pp |
| +0.56 | +3.7% | [+0.030, +0.056] pp |
| +1.62 | +11.1% | [+0.115, +0.147] pp |
| +2.82 | **+21.8%** | [+0.231, +0.274] pp |

![Calibration curve. Click rate versus baseline rises monotonically with model score, with 90% intervals that cross zero only near the middle.](/assets/img/blog/decision-models/calibration.png)

Se tekee 41 prosenttiyksikön eron huonoimman ja parhaan otsikkorivin välille, jonka voisit lähettää. Ja katsopa noita keskirivejä: välit leikkaavat nollan siellä, mikä tarkoittaa mallin fiksusti toteavan "nämä kaksi ovat sama otsikko, heitä kolikkoa". Pisteyttäjä, joka osaa sanoa *en tiedä*, on huomattavasti arvokkaampi kuin sellainen, joka ei osaa.

## No niin, tässä kohtaa pilaan kaiken

Jokainen yllä oleva numero on peräisin vuosien 2013–2015 viraaleista someotsikoista yhdeltä ainoalta julkaisijalta, ja se mitä oikeasti haluan rakentaa, pisteyttää sähköpostien otsikkorivejä.

Nämä eivät ole lainkaan sama asia. 4 000 tilaajalle menevä B2B-uutiskirje ei jaa juuri mitään yhteistä otsikon "This Kid Just Destroyed The Entire Argument Against Vaccines In One Sentence" kanssa: eri media, eri yleisö, eri vuosikymmen, eri kaikki.

Lähdin siis etsimään julkista sähköpostidataa, jossa olisi oikeita mitattuja lähetystuloksia, eikä sitä ole olemassa.

| Lähde | Koko | Saatavuus |
|---|---|---|
| Return Path -otsikkorivitutkimus | 9M otsikkoriviä | Suljettu, 2015, ei koskaan julkaistu |
| Belkins B2B -korpus | 5.5M sähköpostia | Vain aggregoituja tilastoja |
| Yahoo (IEEE 7004277) | 100k+ riviä, miljardeja näyttökertoja | Suljettu |
| Oraclen NLORP-paperi | 300 riviä | Kaavittu Googlesta, tuloksia ei mitattu |
| Erilaiset Kagglen "email campaign" -setit | vaihtelee | Testidataa tai synteettistä |

Yksi noista on kahden Oraclen Principal Data Scientistin arXiv-paperi, joiden koko datasetti on "300+ erilaista erikoistarjoussähköpostien otsikkoriviä, kerätty useista verkkolähteistä Google-haulla". En muuten dissaa heitä, tuo vain aidosti on se, mitä on tarjolla.

Aggregoituja löydöksiä pyörii kyllä vapaasti (6–10 sanaa toimii parhaiten, 21–40 merkkiä avauksille, numerot tuovat muutaman pisteen lisää), mutta mikään niistä ei ole lähetyskohtaista tulosdataa eikä millään niistä kouluteta mitään.

## Mikä asettaa koko harjoituksen uuteen valoon

Olin uskotellut itselleni mukavaa pientä tarinaa, kunnes toinen mielipide kaatoi sen. Tarina kuului: *arkkitehtuuri on bulkkia, pysyvä arvo on omassa suljetussa tulosdatassa*. Ensimmäinen puolisko pitää paikkansa, mutta jälkimmäinen on täyttä puppua, koska minulla ei *ole* omaa suljettua dataa. Upworthy on julkinen, kuka tahansa GPU:n omistava voi toistaa 0.812-tulokseni viikonlopussa kahvikupin hinnalla. Se onkin osasyy siihen, miksi painot ovat vapaasti jaossa: ne maksoivat minulle neljä dollaria enkä voi väittää niiden olevan mikään vallihauta.

Se mitä minulla oikeasti on, on näyttö osaamisesta. Todellinen valttikortti olisi jatkuva mittaussilmukka oikeassa liikenteessä, eikä sellaista vielä ole olemassa.

Tämä on tavallaan selkeyttävää, koska se osoittaa, missä todellinen arvo piilee. Tarvitsemani data makaa sähköpostipalveluntarjoajien sisällä tekemättä mitään: jokaisella A/B-testausta tukevalla ESP:llä on miljoonia otsikkorivikokeita mitatuilla tuloksilla, eikä suunnilleen kukaan heistä kouluta niillä mitään. En siis tarvitse uutta päätä malliin enkä uutta benchmarkkia, tarvitsen yhden ihmisen, jolla on lokit.

## Mihin tämä yleistyy

Resepti on rehellisesti sanottuna niin tylsä, että se mahtuu yhdelle riville: jos mitattu lopputulos on olemassa, kouluta sillä äläkä kysele mallilta sen mielipidettä.

Mainitsemisen arvoista on se, missä nuo tulokset jo valmiiksi lymyilevät. Jokainen yrityksesi koskaan ajama A/B-testi lojuu jollain kokeilualustalla merkittynä, tulos mukana, tekemättä mitään. Optimizely, Statsig, LaunchDarkly, mitä ikinä käytätkään: vuosikausien edestä "kokeilimme näitä viittä ja tämä voitti" -dataa, eikä kukaan ole kouluttanut sen pohjalta mitään.

Sama pätee kaikkialla, missä on joukko kandidaatteja ja myöhemmin syntyvä mitattava numero:

| Päätös | Label, joka sinulla on jo |
|---|---|
| Otsikkorivit, otsikot, push-viestit | avaukset, klikkaukset |
| Tukitiimin makrojen valinta | ratkaistu ilman eskalointia |
| Tiedonhaun uudelleenjärjestäminen | minkä tuloksen käyttäjä valitsi |
| Virheilmoitusten sanamuoto | ratkaisi itse vai teki tukipyynnön |
| Tuotelistauksen otsikot | konversiot |
| Agentin työkalun valinta | onnistuiko toimintaketju |

Tuo viimeinen rivi on se hauska, jos rakennat agentteja. Jevin kolme primitiiviä ovat choice, score ja noul, ja kaikki tässä kirjoituksessa koskee primitiiviä `score`, mutta sama temppu toimii primitiiville `choice` aina kun joku on lokittanut mitä päätöksen jälkeen tapahtui (mikä agenttien reitityksessä tarkoittaa toistaiseksi ei ketään).

Yksi rehellinen rajoitus tälle kaikelle tosin on: minulla on tasan yksi datapiste. Tulosdataan perustuva koulutus voitti zero-shot-arvioinnin reilusti *yhdessä tehtävässä*, ja sitä, päteekö sama ero missään muualla, ei ole testattu. Löisin siis vetoa suunnan, en tarkan luvun puolesta.

## VERA

**V**ariant **E**valuation from **R**eal **A**nalytics, koska jokainen malli tarvitsee typerän bakronyymin.

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

Lue pisteitä joukkona, älä koskaan yksittäisenä numerona. Koulutuksen kohteena oli poikkeama testin omasta keskiarvosta, joten yksittäinen pistemäärä ei itsessään tarkoita mitään: annat sille yhtä lähetystä varten kirjoittamasi 3–6 varianttia ja se laittaa ne järjestykseen. Mukana on myös kalibroija, joka mäppää pisteet odotettuun parannukseen.

Ja jos 435M on liian tuhti, tarjolla on myös prosessorille sopiva versio: ModernBERT-base saa 0.761 kolmasosalla parametreista.

## Mitä se ei tee

Siirry sähköposteihin, tai ainakaan minulla ei ole aavistustakaan siirtyykö se. Kaikki tässä on peräisin vuosien 2013–2015 viraaleista someotsikoista yhdeltä julkaisijalta, ja uutiskirjeelläsi on todennäköisesti hyvin vähän yhteistä otsikon "This Kid Just Destroyed The Entire Argument Against Vaccines In One Sentence" kanssa.

Joten jos pyörität uutiskirjettä ja sinulla on aiempia lähetyksiä mitatuilla avaus- tai klikkausprosenteilla, haluaisin aidosti selvittää asian: laita viestiä, ja data pysyy sinun.

## Opetus

Yksi tämän alan avoimien painojen malleista saa omassa tyypitettyjen päätösten benchmarkissaan zero-shotina 0.362, mikä on alle enemmistöluokan 0.461-perustason. Se siis vaatii tehtäväkohtaista hienosäätöä päästäkseen mihinkään, pelkkä arkkitehtuuri itsessään tekee hyvin vähän.

Eikä ero 0.544:n ja 0.812:n välillä johtunut mistään nerokkaasta mallinnuksesta: kaksi kolmasosaa siitä tuli mittaria vastaavan häviöfunktion valitsemisesta ja loput 62 695 rivistä, joissa joku oli mitannut mitä oikeasti tapahtui. Joten joo, jos annotoit dataasi kyselemällä mallilta, kannattaa ehkä ensin etsiä perustotuutta, se nimittäin todennäköisesti lojuu jo jossain valmiina.

---

*Data: [The Upworthy Research Archive](https://osf.io/jd64p/). Matias, J., Munger, K., Le Quere, M.A., Ebersole, C. (2021), Nature Scientific Data. CC BY 4.0. Kokeet aikavälillä 25. kesäkuuta 2013 – 10. tammikuuta 2014 on poissuljettu kautta linjan ylläpitäjien vuonna 2024 ilmoittaman satunnaistusvirheen vuoksi. Painojen DOI: [10.57967/hf/10573](https://doi.org/10.57967/hf/10573).*
