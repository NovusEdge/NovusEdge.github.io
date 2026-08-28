---
title: "Puhutaanpa EU:n Chat Control -laista"
date: 2026-07-14
tags: [privacy, surveillance, eu, encryption, p2p, essay]
description: "Chat Controlista, joka puolelta kiristyvästä valvontakoneistosta ja siitä, miksi ainoa kestävä ratkaisu on tehdä massavalvonnasta arkkitehtonisesti mahdotonta."
toc: true
---

## 314 > 276, mutta kukapa näitä laskisi

Euroopan parlamentti [äänesti 9. heinäkuuta 2026 Chat Control 1.0:n jatkamisesta](https://andreafortuna.org/2026/07/10/chatcontrol-survives/). Hylkäysesitys sai *enemmän* ääniä kuin hyväksyntä: 314 '_ei_'-ääntä vastaan 276 '_kyllä_'-ääntä. Missä tahansa järkevässä järjestelmässä tämän pitäisi tarkoittaa hylkäystä.

Mutta kyseessä oli toinen käsittely, ja niille jotka eivät ole perillä kuvioista: toisessa käsittelyssä hylkäämiseen vaaditaan 361 äänen *ehdoton enemmistö*. Joten 314 > 276 -äänestystulos ei merkinnyt yhtään hevonvittua, ja jatkoaika meni läpi, koska paikalle saapui vähemmän väkeä kuin sen pysäyttämiseen olisi tarvittu.

Näin se nykyään toimii: ei valtuutuksen vaan menettelytapojen kautta; ei siksi, että kansa sitä haluaisi, vaan siksi, että vastustajat eivät yllä mielivaltaiseen kynnykseen, joka suunniteltiin aivan toisenlaisen parlamentaarisen politiikan aikakaudella.

Homman juju on siinä, että tämä koski vasta *vapaaehtoista* skannausta. Chat Control 1.0 antaa alustoille mahdollisuuden skannata viestejäsi, jos ne haluavat, mutta pysyvästä sääntelystä eli Chat Control 2.0:sta neuvotellaan edelleen. Se _määrää_ viestien valvonnan pakolliseksi, ja kolmikantaneuvottelut jatkuvat tänä syyskuussa.

## Kyse ei ole vain yksityisviesteistäsi
Jos luulet, että tämä loppuu tähän, älä huoli, homma muuttuu paljon pahemmaksi (shoutout @HowMoneyWorks, 100 pistettä Puuskupuhille jos tajuat viittauksen lmao). Chat Control on vain yksi kerros tässä valvontapinossa. Tiedonkeruun saralla on tapahtunut paljon muutakin, mikä _vaatisi_ julkista huomiota – mutta koska me ihmiset olemme aivan törkeän huonoja pysymään kärryillä monimutkaisista järjestelmistä, joita meille pakotetaan järjestelmällisesti samalla kun "pöyristymme" jostain paljon banaalimmasta, siitä tulee entistä vaikeampaa. Tässä on mitä kaikkea seurataan:


### Mitä sanot
Chat Control tähtää viestintäsi sisältöön. Heinäkuun äänestys rajasi päästä päähän salatut palvelut (WhatsApp, Signal, Telegram jne.) vapaaehtoisen järjestelyn ulkopuolelle, mikä lienee pieni voitto.

Mutta Chat Control 2.0 sisältää kirjauksia **client-side scanningistä**, mikä tarkoittaa, että puhelimesi tutkii viestin *ennen* kuin se salataan. Salauksella ei ole mitään merkitystä, jos laite itsessään toimii vitun vasikkana. Apple yritti tätä vuonna 2021 CSAM-skannauksellaan ja perääntyi massiivisen vastareaktion jälkeen, mutta EU on vain... tekemässä sen silti? Just joo, hienoa.

Ja tässä on se juju: hajauttaminen ei oikeastaan korjaa tätä. Voit reitittää sipuliverkkojen läpi, pomputtaa tuhannen solmun kautta, salata kvanttiturvallisilla algoritmeilla – millään näistä ei ole väliä, jos puhelimesi sovellukselta vaaditaan lain mukaan skannaus ennen lähettämistä. Hyökkäys on siirtynyt verkosta päätelaitteisiin. Puhelimeesi. Läppäriisi. Laitteeseen, johon luotat eniten.

### Missä nukut
[`802.11bf`](https://www.ieee802.org/11/Reports/tgbf_update.htm) ratifioitiin syyskuussa 2025. Se on WiFi sensing -standardi, mikä tarkoittaa, että ensi vuodesta alkaen (ja uutta standardia noudattavien uusien mallien myötä) **sinun** reitittimesi voi havaita ihmisen läsnäolon, liikkeen, hengitysrytmin ja kehon asennot. Seinien läpi. Sinun seiniesi läpi.

Tämäkään ei ole mikään teoreettinen suunnitelma, vaan teknologiaa, jota on ollut olemassa jo jonkin aikaa. Vodafone julkaisi "Who's Home" -palvelun joulukuussa 2025. [Carnegie Mellon demonstroi koko kehon asennon rekonstruointia](https://www.spatialintelligence.ai/p/your-wifi-can-see-you-heres-how) tavallisen reitittimen signaaleista. 9 dollarin ESP32 näkee seinien läpi. [Gamgee](https://newatlas.com/around-the-home/gamgee-wifi-home-security-system/) toimittaa jo tähän perustuvia WiFi-turvajärjestelmiä kuluttajille. Tunnenpa jopa tyypin Aallossa (@ Aalto), joka tekee koneoppimiseen pohjautuvaa WiFi sensing -ilmaisinta armeijalle.

Eikä se muuten ole pelkkää WiFiä – älytelevisiosi pyörittää lähes varmasti ACR-toimintoa (automatic content recognition), joka luo katsomastasi sisällöstä sormenjäljen ruutu ruudulta ja soittelee kotiin. Älykaiuttimesi kuuntelee jatkuvasti herätyssanoja, mikä tarkoittaa, että se *kuuntelee* koko ajan. BLE-majakat seuraavat sinua kauppakeskuksissa ja lentokentillä. Mainoksiin upotetut ultraäänimajakat voivat yhdistää televisionkatselusi puhelimesi toimintaan. "Älykoti" on vain valvontakoti paremmalla markkinoinnilla.

Vuoteen 2027 mennessä WiFi sensing on vakiovaruste useimmissa uusissa reitittimissä. Ympäristön aistimisen infrastruktuuria globaalissa mittakaavassa standardoidaan *juuri nyt*, eikä useimmilla ihmisillä ole aavistustakaan.

### Missä liikut
[Flock Safetylla](https://www.aclu.org/campaigns-initiatives/get-the-flock-out) on käytössä noin 75 000–100 000 ALPR-kameraa eri puolilla Yhdysvaltoja, ja ne skannaavat yli 150 miljoonaa ajoneuvoa päivittäin. Ne luovat haettavia tietokantoja siitä, minne kukin auto liikkuu ja milloin, ilman etsintälupaa tai perusteltua syytä. Pelkillä fiiliksillä ja riskipääomalla.

![The Invasion of Flock Cameras](https://youtu.be/A3cMU55dIIc?si=8BPTtjEkvlUURSpG)

Alle 1 % näistä skannauksista liittyy mihinkään todelliseen rikokseen. Loput 99 %+ on vain... dataa. Minne menit. Milloin. Kuinka usein. Kuka muu oli paikalla. Kenen muun auto oli pysäköitynä omasi viereen.

Eikä kyse ole vain autoista – puhelimesi lähettää signaalia jatkuvasti. Tukiasemakolmiomittaus antaa karkean sijainnin, mutta sovellukset, joilla on sijaintiluvat (eli rehellisesti sanottuna useimmat niistä), saavat GPS-tarkkuuden. Googlen sijaintihistoria, Applen "tärkeät paikat", aktiivisuusrannekkeesi, valokuvat joissa on paikkatieto päällä – tästä kaikesta muodostuu varsin kattava kokonaiskuva jokaisesta paikasta, jossa olet ikinä käynyt. Datavälittäjät ostavat tätä tavaraa tukkuna ja myyvät kenelle tahansa maksavalle asiakkaalle, mukaan lukien poliiseille, jotka eivät jaksa vaivautua hankkimaan etsintälupaa.

ACLU laski [82 irtisanottua Flock-sopimusta](https://mrsc.org/stay-informed/mrsc-insight/april-2026/restrictions-flock-cameras) 28 osavaltiossa vuosien 2021 ja toukokuun 2026 välillä, joista 39 pelkästään vuoden 2026 viiden ensimmäisen kuukauden aikana. Ihmiset laittavat hanttiin, mikä on mahtavaa! Mutta infrastruktuuri on jo rakennettu, ja vaikka Flock kaatuisi huomenna, pelikirja on valmiina seuraavalle firmalle.

### Mitä ajattelet
Meta julkaisi kesäkuussa 2026 [Brain2Qwerty v2:n](https://www.marktechpost.com/2026/06/30/meta-ai-releases-brain2qwerty-v2-a-non-invasive-meg-brain-to-text-pipeline-decoding-typed-sentences-at-61-word-accuracy/). Se purkaa aivotoiminnasta kirjoitettuja lauseita 61–78 %:n sanatarkkuudella käyttäen ei-invasiivista MEG-skannausta. Ai niin, ja [TRIBE v2](https://ai.meta.com/blog/tribe-v2-brain-predictive-foundation-model/) puolestaan ennustaa aivojen reaktioita videoon, ääneen ja kieleen. Pakkohan se on ihailla sitä, miten Zucc väsää kaikkien aikojen dystooppisinta teknologiaa, eikö?

Samaan aikaan Neuralink asentaa siruja ihmisten aivoihin ja Synchronin Stentrode on jo ihmiskokeissa. Kehystys "lääketieteellisistä sovelluksista" on täysin pätevä (halvaantuneiden auttaminen kommunikoimaan on aidosti hyvä juttu), muuuutta kaksikäyttöisyysvaikutukset ovat... no, melkoisia (address me vro 🐘). Kun aikeen pystyy lukemaan, sen pystyy myös *tunnistamaan*. Ajatusrikos muuttuu Orwellin fiktiosta insinööriongelmaksi, ja POJAT, lyön melkein mistä tahansa vetoa, että iso siivu puolustus- ja turvallisuusalasta on tähän _jotenkin_ raskaasti investoinut.

Tällä hetkellä Brain2Qwerty vaatii toimiakseen tyyliin kahden miljoonan dollarin MEG-skannerin pultattuna magneettisuojatun huoneen sisälle, mutta kuka tahansa jolla on edes puolikas aivosolu näkee selvästi, mihin tämä johtaa: jokainen aistimistapa alkaa kalliina ja muuttuu halvaksi, ja on vain ajan kysymys, milloin meillä on puettavia aivoskannereita. Magneettikuvaus vaati ennen oman rakennuksensa, nyt on olemassa kannettavia laitteita. WiFi sensing alkoi tutkimuslabroista ennen kuin se päätyi 50 dollarin reitittimeesi. Anna sille 15–20 vuotta, ja jokin versio tästä on kuluttajatasoa, luultavasti markkinoituna jonain "hyvinvointi-" tai "keskittymislaitteena".

Ihmisen viimeinen turvapaikka – oma mieli – on muuttumassa haavoittuvaksi. Ja toisin kuin kaikkien muiden valvontakerrosten kohdalla, aivojasi et voi vain jättää kotiin.

## Toimijuus ja sen menetys

Tässä on se, mikä häiritsee minua enemmän kuin mikään yksittäinen teknologia: ihmiset *luopuvat tästä vapaaehtoisesti*, ei tietenkään kerralla vaan vähitellen, mukavuus mukavuudelta, ominaisuus ominaisuudelta.

"Ei minulla ole mitään salattavaa." "Se on vain metadataa." "Algoritmi tuntee minut paremmin kuin minä itse." "Äh, en jaksa välittää, anna mun kattoo vielä tää yks Reeli ennen nukkumaanmenoa"

Jokainen kompromissi tuntuu pieneltä – mitä nyt yksi lisälupa, yksi lisäanturi, yksi lisätietokanta tekee? Mutta nämä kaupat kertaantuvat, ja jossain vaiheessa heräät ja tajuat vaihtaneesi pois mahdollisuuden olla olemassa ilman, että sinua tarkkaillaan, luetteloidaan ja ennakoidaan.

Tämä ei ole edes mitään uutta tai ihmeellistä, jokainen sivilisaatio on tehnyt näin: Rooma vaihtoi tasavaltalaisen hallinnon keisarilliseen vakauteen, keskiajan Eurooppa vaihtoi paikallisen autonomian feodaaliseen suojeluun, ja _me_ vaihdamme yksityisyyden mukavuuteen. Kaava toistuu, koska se *toimii* (ja vieläpä todella hyvin) lyhyellä aikavälillä useimmille ihmisille suurimman osan ajasta – kunnes se ei enää toimikaan. Ja silloin kontrollin infrastruktuuri on jo rakennettu, ja on liian myöhäistä kääntyä takaisin.

## Heidän tarvitsee voittaa vain kerran

Voit taistella Chat Controlia vastaan. Voit marssia parlamenttiin, kirjoittaa mepillesi, järjestää kampanjoita, rahoittaa [EFF:ää](https://www.eff.org/deeplinks/2025/12/after-years-controversy-eus-chat-control-nears-its-final-hurdle-what-know), tukea digioikeusjärjestöjä (ja sinun ehdottomasti pitäisi, koska kaikella sillä on väliä), mutta tässä on se epämukava totuus, jota kukaan ei halua kuulla: poliittiset ratkaisut ovat melko väliaikaisia (ainakin tällä hetkellä).

Voitat yhden äänestyksen, ja he järjestävät toisen. Kaadat yhden asetuksen, ja he nimeävät sen uudelleen ja yrittävät taas. Heinäkuun 9. päivän äänestys ei todellakaan ollut edes ensimmäinen Chat Control -äänestys, eikä se jää viimeiseksi. Nämä paskiaiset ovat yrittäneet tämän eri variaatioita 2000-luvun alusta asti – tämä paska vain siirtyy nyt avoimesti näkyville, siinä kaikki. Valvontapuolella on pysyvät kannustimet (hallitukset haluavat nähdä, yritykset haluavat tietää), ja paine on jatkuvaa seuraavaa tilaisuutta kytäten. Yksityisyyspuolen on voitettava joka ikinen kerta, mutta valvontapuoli... _heidän_ tarvitsee voittaa vain kerran.

Tämä taistelu pysyy epäreiluna niin kauan kuin valvonta on *arkkitehtonisesti mahdollista*. Joten ainoa kunnollinen ja mahdollinen tapa voittaa peukaloitu peli on _muuttaa koko peli täysin_.

Jos massavalvonta on teknisesti mahdollista, se tapahtuu ennen pitkää – ei ehkä tämän parlamentin, ei ehkä tämän hallinnon aikana, mutta lopulta kyllä. Se johtuu siitä, rakas lukijani, että kannustimet ovat liian vahvat ja sen ikuiseen estämiseen vaadittava valppaus on kestämätöntä. Kukaan ei jaksa pysyä raivoissaan vuosikymmeniä. Katsopa vaikka koko tätä Israel/Palestiina-sotkua: ihmiset olivat raivoissaan tyyliin mitä, pari kuukautta? Mutta ajan kuluessa tulee aina seuraava pöyristymissyötti, seuraava huolenaihe. Eikä tässä edes oteta huomioon sitä, että varallisuuskuilu pakottaa ihmiset pitämään päänsä niin syvällä työnteossa, että heillä ei _kirjaimellisesti_ ole varaa ajatella mitään toimeentulonsa ulkopuolista.

Ratkaisu on siis tehdä valvonnasta *arkkitehtonisesti mahdotonta* – ei laitonta tai säänneltyä, vaan käytännössä *mahdotonta*. Rakenna järjestelmiä, joissa vaikka hallitus marssisi paikalle etsintäluvan kanssa, ei ole mitään luovutettavaa, koska dataa ei ole olemassa luettavassa muodossa missään.

Tämä tarkoittaa:
- **Päästä päähän -salausta (E2E)**, jossa palveluntarjoajat *eivät voi* lukea sisältöä edes määrättäessä
- **Hajautettuja verkkoja**, joissa ei ole keskitettyä pistettä valvottavaksi tai haastettavaksi oikeuteen
- **Asiakasohjelmistoja**, joita hallitsevat käyttäjät, eivät yritykset tai valtiot
- **Avointa lähdekoodia**, jotta koodi voidaan auditoida eikä meidän tarvitse luottaa pelkkiin pikkusormivaloihin

Meillä on palasia tästä jo kasassa – Signal on olemassa, Tor on olemassa, [Briar](https://briarproject.org/), [Session](https://getsession.org/) ja [SimpleX](https://simplex.chat/) ovat olemassa – mutta mikään niistä ei ole voittanut. Ja syy on tuskallisen yksinkertainen: **mukavuus**.

## Mukavuus voittaa aina
Yksityisyysteknologia häviää, koska sitä on vaikeampi käyttää kuin valvottua vaihtoehtoa, eikä tämä ole bugi vaan eräänlainen tämänkaltaisen teknologian ydinhaaste. Keskitetyt järjestelmät ovat *luonnostaan* mukavampia, koska ne voivat optimoida käyttäjäkokemusta ilman rajoitteita, kun taas hajautettujen järjestelmien täytyy koordinoida toimintaansa ilman koordinaattoria, mikä lisää kitkaa.

Numerot ovat myös aivan vitun karuja:
- Mastodonin vuoden 2022 Twitter-pako (3,5 milj. → 6 milj. rekisteröitymistä) luhistui kuukausissa. Lataukset putosivat 99 % ja pysyvyys oli tyyliin 37 %.
- Torin keskinopeus on ~5 Mbps verrattuna VPN-palveluiden ~250 Mbps:iin. 50 kertaa hitaampi.
- Web3-dAppeilla on 7 %:n vuosittainen pysyvyys. 75 % käyttäjistä luovuttaa ennen ensimmäisen transaktionsa suorittamista.

Kaava on selvä: kun yksityisyys (tai oikeastaan mikä tahansa) vaatii vaivannäköä, ihmiset valitsevat mukavuuden. Koska meillä on taipumus valita kognitiivinen helppous kuormituksen sijaan, ja olemme pohjimmiltamme laiskoja paskoja.

Mutta poikkeuksiakin on:
- **Signal** voitti, koska se on yhtä helppo kuin iMessage. Salaukseen ei vaadita käyttäjältä mitään toimenpiteitä.
- **WhatsApp** otti Signal Protocolin käyttöön 3 miljardille käyttäjälle ilman, että kenenkään tarvitsee hallita avaimia.
- **Passkeyt** ovat *nopeampia* kuin salasanat – 8 sekuntia vastaan 69 sekuntia salasanalla + 2FA:lla.

Opetus: **yksityisyysteknologia voittaa silloin, kun käyttäjien ei tarvitse erikseen valita sitä**. Kun yksityinen polku on myös helpoin polku.

## Toinen puoli: Kaivon myrkyttäminen
Puolustus on siis yksi asia, mutta mielessäni on ollut _toinenkin_ näkökulma: entä jos pelkän valvonnalta piiloutumisen sijaan teetkin valvonnan *tuloksesta* epäluotettavaa?

Jos kaikkien data myrkytetään (huojutetut sijainnit, satunnaistetut sormenjäljet tai satunnaistetut/hämärretyt hakukyselyt), tietojoukoista, joilla valvontamalleja koulutetaan, tulee hyödyttömiä. Vanhaa kunnon "roskaa sisään -> roskaa ulos" -settiä. Kenestäkään ei voi rakentaa profiilia, jos profiili on enimmäkseen pelkkää hevonpaskakohinaa.

Ongelma on se, että naiivi saastuttaminen on havaittavissa. WWW'25-tutkimuspaperi ["Breaking the Shield"](https://dl.acm.org/doi/10.1145/3696410.3714713) onnistui murtamaan KAIKKI sormenjälkien satunnaistamismekanismit 18 lisäosassa ja 5 selaimessa. Tällöin satunnaistajasta itsestään tulee sormenjälki, koska satunnaistajia käyttävä joukko on tarpeeksi pieni erottuakseen. Jos vain 0,1 % käyttäjistä käyttää sormenjäljen satunnaistajaa, tuohon 0,1 %:iin kuuluminen on jo itsessään tunnistetieto lmao. Eli tämä tapa ei yksinään tule kuuloonkaan.

TrackMeNot, hakukyselyiden hämärtäjä, on käytännössä koomassa. [Koneoppimisluokittelijat pystyvät erottamaan aidot haut valehauista](https://link.springer.com/chapter/10.1007/978-3-642-14527-8_2) ~48–52 %:n tarkkuudella lähes nollan väärien positiivisten tasolla, koska ihmisten hakukäyttäytyminen on *outoa* ja sitä on vaikea väärentää vakuuttavasti. Myös naiivi satunnaisen kohinan syöttäminen on todistettavasti riittämätöntä.

[HARPO](https://arxiv.org/pdf/2111.05792), vahvistusoppimiseen perustuva hämärtäjä, saavuttaa 16-kertaisesti paremman yksityisyyden syötetyn liikenteen yksikköä kohden, mikä on oikeasti aika siistiä, mutta se vaatii jatkuvia koneoppimismallien päivityksiä pysyäkseen tunnistamisen edellä – mikä tarkoittaa, että tämä tie on jatkuvaa varustelukierrettä eikä ratkaistu ongelma.

Torin lähestymistapa, jossa kaikista tehdään identtisen näköisiä satunnaistamisen sijaan, on vahvempi, koska silloin piiloudutaan joukkoon sen sijaan, että erotuttaisiin "tyyppinä, joka yrittää piiloutua". Mutta siihen liittyy karuja UX-kompromisseja, joista suurin osa jengistä ei diggaa.

Todellinen vastaus on siis luultavasti yhdistelmä puolustusta (tehdään valvonnasta mahdotonta) + hyökkäystä (tehdään valvonnasta epäluotettavaa). Olen itse asiassa [kehittämässä jotain tähän liittyvää](https://github.com/NovusEdge/ocloak) ja kerron siitä lisää myöhemmin, mutta perusajatus on, että kehittynyt saastutus, joka on persoonan mukaisesti johdonmukaista, ihmismäisesti ajoitettua ja mukautuvaa, voisi nostaa valvonnan kustannuksia niin paljon, ettei se ole enää taloudellisesti kannattavaa.

## Suuntia, ei vastauksia
Minulla ei ole valmista vastausta, ja suoraan sanottuna epäilen, ettei kellään muullakaan ole, mutta suunta, johon tämä kaikki on menossa, on selvä, joten yritän valottaa sitä hieman:

**Hajauta luottamus, älä välttämättä infrastruktuuria.** Tämä on Signalin malli – he käyttävät keskitettyjä palvelimia viestien välittämiseen (nopea, luotettava, hyvä UX), mutta hajauttavat kryptografisen luottamuksen (he eivät kirjaimellisesti pysty lukemaan viestejäsi). Tämä on pragmaattista ja se toimii. Puristinen lähestymistapa, jossa kaikki hajautetaan, tarkoittaa usein vain sitä, että myös ongelmat hajautetaan.

**Tee yksityisyydestä oletusarvo.** Ei valikon syövereihin haudattu asetus. Ei mikään erikseen päälle kytkettävä "yksityisyystila". Oletusarvo. WhatsApp teki näin E2E-salauksella – 3 miljardia käyttäjää sai salatun viestinnän tietämättä tai välittämättä avaintenhallinnasta hevonkukkua. Se on malliesimerkki.

**Ratkaise kylmäkäynnistysongelma.** Verkostovaikutukset tappavat uudet yksityisyystyökalut heti kättelyssä. Voit rakentaa maailman turvallisimman viestisovelluksen, mutta jos kaverisi eivät ole siellä, et tule käyttämään sitä. Tarvitaan yhteentoimivuutta (Matrix-federaatio, sillat olemassa oleville alustoille) tai pitää ratsastaa olemassa olevalla aallolla (Signal kasvoi, koska WhatsAppista tuli hämärä).

**Panosta käyttäjäkokemukseen (UX) kuin se olisi koko tuote.** Koska se on. Ketään ei kiinnosta uhkamallisi, jos sovellusta on raivostuttava käyttää. Krypto- ja yksityisyysyhteisö on historiallisesti ollut tässä aivan surkea – sellaista "käytä vain PGP:tä" -asennetta, vaikka PGP on UX-painajainen, jota tietoturvatutkijatkin kusevat.

P2P-viestinnässä on vaihtoehtoja – Session, SimpleX, Briar, Matrix – mutta niissä kaikissa on omat kompromissinsa. Session muutti Sveitsiin Australian poliisin tietopyynnön jälkeen (hyvä), mutta viestien toimitus on silti hitaampaa kuin keskitetyllä push-ilmoituksella (huono). SimpleXissä ei ole pysyviä tunnisteita (hyvä), mutta sillä on vain kaksi ydinkehittäjää (huolestuttavaa pitkän aikavälin ylläpidon kannalta). Briar toimii Torin ja Bluetooth-meshin kautta (hyvä), mutta on vain Androidille ja pelkkää tekstiä (rajoittavaa). [Veilid](https://veilid.com/) näyttää lupaavalta, mutta on vielä varhaisessa vaiheessa.

Mesh-verkot, kuten [Meshtastic](https://meshtastic.org/), ovat käyttökelpoisia jo tänään noin 30 dollarin laitteistolla, mikä on todella siistiä verkon ulkopuoliseen koordinointiin ja katastrofitilanteisiin, mutta ei tietenkään korvaa mobiiliverkon mittakaavan viestintää.

Hajautettu identiteetti on saamassa kunnolla tuulta alleen – EU:n eIDAS 2.0 velvoittaa DID-lompakoiden hyväksymiseen tammikuusta 2026 alkaen – mutta Block/Square kuoppasi Web5 DID -hankkeensa lompakon UX-kitkan vuoksi. Mukavuusongelma tappaa satojen miljoonien dollarien taustoituksella varustettuja projekteja. Kukaan ei ole sille immuuni.

## Mistä tässä pelataan
Haluan tehdä selväksi, mistä tässä on kyse: tässä ei ole kyse rikosten piilottelusta eikä minkään meitä kaikkia vahingoittavan aivottoman laittoman/ääritoiminnan lietsomisesta. Ei, _tässä_ on kyse vallan epäsymmetriasta yksilöiden ja instituutioiden välillä.

Hallitus, joka näkee kaiken, voi hallita kaikkea – ei voimankäytöllä (se on kallista ja herättää vastarintaa), vaan ennustamisella ja ennakoinnilla. Jos tiedät, mitä joku aikoo tehdä ennen kuin hän tekee sen, voit muovata hänen vaihtoehtojaan huomaamattomasti. Yritys, joka tietää kaiken, voi manipuloida kaikkea – ei pakolla (se on laitonta), vaan optimoinnilla, mikä tarkoittaa, että jos tiedät mitä joku haluaa ennen kuin hän tietää sen itse, voit tuottaa tuon halun ja myydä ratkaisun.

Totaalisen valvonnan päätepiste ei ole poliisivaltio, vaan jotain paljon hienovaraisempaa ja vaikeammin vastustettavaa: maailma, jossa poikkeaminen ennustetusta käyttäytymisestä tulee yhä kalliimmaksi, jossa mukautuminen on pienimmän vastuksen tie ja jossa tila aidoille valinnoille supistuu hitaasti. Tämä on se maailma, jota olemme rakentamassa, mukavuus kerrallaan.

## Loppusanat
Kuules, en minä käske sinua poistamaan Facebookia ja muuttamaan mökkiin keskelle korpea tai pitämään jokaista sovellusta salakuuntelulaitteena. Se ei ole pointti, eikä se ole useimmille meistä edes realistista.

Tarkoitan sitä, että infrastruktuuri, jota ympärillesi juuri nyt rakennetaan – seinien läpi näkevä WiFi, jokaisen rekkarin kirjaavat kamerat, sovellukset jotka saattavat pian skannata ennen salausta, ajatuksia lukemaan opettelevat BCI-aivoliitännät – mitään näistä ei rakenneta sinun etusi vuoksi. Se rakennetaan, koska se on mahdollista, koska joku maksaa siitä ja koska sen rakentajien ei tarvitse elää seurausten kanssa samalla tavalla kuin sinun.

Poliittiset taistelut ovat tärkeitä ja niihin kannattaa osallistua aina kun voi, mutta ne ovat parhaimmillaankin vain jälkijoukkotaisteluja. Ainoa tie ulos tästä kierteestä on tehdä valvonnasta itsestään teknisesti mahdotonta – ei säänneltyä, ei laitonta, vaan *mahdotonta* – ja tehdä yksityisestä polusta niin kitkaton, ettei sen valitseminen tunnu uhraukselta.

**Mitä voit siis oikeasti tehdä?** Käytä Signalia – se on ilmainen, se toimii, ja jokainen uusi käyttäjä tekee verkosta vahvemman. Tue järjestöjä kuten EFF, ACLU, Access Now ja noyb, jotka käyvät poliittisia taisteluita, vaikka nuo taistelut olisivatkin pohjimmiltaan väliaikaisia. Kiinnitä huomiota oletusasetuksiin, ja kun uusi palvelu pyytää lupia, kysy miksi. Ja puhu näistä asioista ihmisille, sillä valvonnan suurin valttikortti tällä hetkellä on välinpitämättömyys. Useimmilla ei ole harmainta aavistustakaan siitä, mitä heidän ympärilleen parhaillaan rakennetaan.

**Entä jos rakennat asioita?** Tee yksityisyydestä oletusarvo. Panosta UX:ään kuin se olisi koko tuote, koska sitä se käytännössä on. Mieti arkkitehtuuritasolla, voidaanko järjestelmäsi pakottaa tai vaarantaa ja mitä tapahtuu silloin kun (ei jos) lainsäädäntöympäristö muuttuu.

Emme ole vielä siellä, emme lähelläkään. Mutta uskon, että voimme päästä sinne, jos tarpeeksi moni alkaa rakentaa siihen suuntaan pelkän nykytilasta valittamisen sijaan.

Pysykää valppaina siellä.

~ A.
