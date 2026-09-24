---
title: "Jotain... Engrammicia rakentamassa"
date: 2026-05-06
tags: [ai-memory, epistemics, engrammic, agents, founder-log]
description: "Toistuvat vanhentuneet väitteet AI-putkessa saivat minut kehittämään agenttimuistia, joka tallentaa todisteet, seuraa korjauksia ja käsittelee ristiriitaisia havaintoja."
---

Viime joulukuussa olin rakentamassa AI SEO -putkea. Meillä oli laaja "LLM Wiki" `context/`-hakemistossa: strukturoidut arkkitehtuuridokkarit, funktioindeksi josta agentti saattoi tehdä `grep`-hakuja, koko setti. Ja kunnia sille, jolle kunnia kuuluu: se _oli_ hieno systeemi, kunnes... kontekstin saastuminen iski. Agentit alkoivat muistella vanhentunutta tietoa, jonka olimme päivittäneet *saman session aikana*. Uudet agentit, jotka luotiin puhtaalla kontekstilla, alkoivat heti suoltaa samaa vanhentunutta tuubaa. Konteksti-ikkunani täyttyi kaksi kertaa nopeammin, kun agentti luki uudestaan tiedostoja, jotka se oli jo nähnyt, yrittäen sovitella yhteen ristiriitoja, joita ei olisi pitänyt edes olla olemassa. Samaan aikaan olin itse jatkuvasti hiilenä kiroilemassa agentille ja saamassa vastaukseksi ainaisen: "*You're absolutely right!*" (luoja että vihaan tuota lausetta yli kaiken).

Haettu konteksti sisälsi asioita, joita agentti oli keksinyt omasta päästään. Järjestelmämme ei erottanut havaittuja faktoja arvauksista tai sepitteistä, joten seuraava agentti saattoi käyttää niitä kaikkia todisteina.

Olin käyttänyt paljon vaivaa tiedonhakuun: olennaisten palasten löytämiseen ja niiden tuomiseen konteksti-ikkunaan. En ollut antanut järjestelmälle keinoa tarkistaa, oliko haettu väite perusteltu tai yhä ajantasainen. Siitä tuli se muistiongelma, jota halusin lähteä ratkomaan.

Tätä alalla kutsutaan nimellä context rot.

[RAG](https://en.wikipedia.org/wiki/Retrieval-augmented_generation)-menetelmässä samankaltaisuus auttaa löytämään olennaisen tekstin. Se ei kuitenkaan määrittele, onko kyseinen teksti oikeassa. Kuusi viikkoa sitten tallennettu perusteeton väite voi silti olla hyvinkin osuva osuma tämän päivän kyselylle.

Tuotteet kuten `Mem0` ja `Zep` ratkovat sessioiden välistä muistia, mutta pelkkä pysyvyys ei ratkaise ristiriitaisia muistiinpanoja. Jos agentti tallentaa maanantaina "käyttää OAuthia" ja tiistaina "käyttää API-avaimia", minun on tiedettävä, muuttuiko järjestelmä, koskevatko väitteet eri komponentteja vai oliko toinen väärässä. Aikaleimat auttavat, mutta uusin väite ei välttämättä ole parhaiten perusteltu. Haluan säilyttää todisteet jokaiselle väitteelle ja kirjata ylös, miten ristiriita ratkaistiin.

Agentti saattaa käyttää hakutulosta tehdäkseen päätöksen ja käyttää sitten kyseistä päätöstä kontekstina myöhemmälle päätökselle. Haluan jäljittää nämä riippuvuudet. Jos jokin havainto osoittautuu vääräksi, meidän pitäisi pystyä löytämään siitä riippuneet johtopäätökset.

Tutkijayhteisö alkaa vähitellen tajuta tämän. Tältä vuodelta on [Google DeepMindin tutkimuspaperi](https://arxiv.org/abs/2603.02960), jossa puhutaan "episteemisestä ajautumisesta" (epistemic drift), eli siitä, miten väärin kalibroidut AI-järjestelmät itse asiassa heikentävät ihmisen omaa harkintakykyä ajan myötä tarjoamalla itsevarmasti epäluotettavaa tietoa. Monivaiheisesta päättelystä on tehty [tutkimusta "uskomusten poikkeamasta"](https://arxiv.org/abs/2510.12264) (belief deviation), joka osoittaa, että suorituskykyä voi parantaa 30 prosenttiyksikköä pelkästään tunnistamalla, milloin agentin sisäinen tila on ajautunut liian kauas koherenssista. Useat ryhmät ovat toisistaan riippumatta päätyneet uskomusten korjaamisen (belief revision) muodollisiin malleihin, koska epämuodollinen lähestymistapa, jossa asioita vain tallennetaan ja haetaan, ei todistetusti skaalaudu.

Hauskinta on, että biologia keksi tämän jo aikoja sitten. [Hippokampus](https://en.wikipedia.org/wiki/Hippocampus) hoitaa yksittäisten tapahtumien nopean ja harvan koodauksen, ja neokorteksi tekee yleistetyn tiedon hidasta konsolidointia. Koko järjestelmä pyörittää öistä prosessia päättääkseen, mikä ylennetään kategoriasta "asia joka tapahtui" kategoriaan "asia jonka tiedän". [Sharp-wave ripples](https://en.wikipedia.org/wiki/Sharp_waves_and_ripples) -aallot unen aikana, eksplisiittiset mekanismit unohtamiselle.

Minua kiinnostaa tässä vertailussa valikoiva säilyttäminen: mitä pidetään, mitä muokataan ja mitä unohdetaan. Nämä ovat kysymyksiä, joita haluan soveltaa agenttimuistiin.

**!! Nörtti-infodumppivaroitus :3 !!**

Oikeaan suuntaan on kuitenkin jo otettu askeleita. [HippoRAG](https://arxiv.org/abs/2405.14831) mallintaa suoraan hippokampuksen indeksöintiteoriaa tietograafeilla ja PageRankilla saavuttaen 20 %:n parannuksia moniaskelisessa QA-päättelyssä ottamalla biologian tosissaan. Robotiikassa on tehty [tutkimusta yllätysportitetusta episodisesta muistista](https://arxiv.org/abs/2606.03787) (surprise-gated episodic memory), jossa vain uudet havainnot tallennetaan, mikä on juuri sellaista merkityksellisyyden suodatusta jota aivotkin tekevät.

[Zep](https://arxiv.org/abs/2501.13956) rakensi ajallisia tietograafeja episodisilla ja semanttisilla kerroksilla. [Hindsight](https://arxiv.org/abs/2512.12818) menee pidemmälle neljällä erillisellä muistiverkolla ja konfliktinratkaisukäytännöillä, mutta ristiriidat silti vain *säilytetään* aikaleimoilla sen sijaan, että ne *ratkaistaisiin* ennen tallennusta, eikä tarjolla ole [mitään konkreettista menetelmää](https://hindsight.vectorize.io/blog/2026/05/21/agent-memory-consolidation) sen jäljittämiseen, miksi agentti tarkalleen ottaen sanoi mitä sanoi.

Engrammicin kohdalla haluan uskomuksen tilan, ristiriitojen käsittelyn kirjoitushetkellä ja alkuperätiedot (provenance), joita voidaan tarkastella yhdessä. Tavoitteena on mahdollistaa sen tarkistaminen, pitääkö haettu väite yhä paikkansa ja mitkä muut väitteet ovat siitä riippuvaisia.

Sanalla "uskomus" tarkoitan havaintojen tukemaa tulkintaa. "Hän jätti viestini luetuksi vastaamatta" on havainto. "Hän on vihainen minulle, koska hän jätti viestini luetuksi eikä tee koskaan niin" on tulkinta, ja se saattaa muuttua, kun hän vastaa viestiin. Haluan järjestelmän säilyttävän tämän eron.

Tässä arkkitehtuurissa haluan tietueet mallin painotusten ulkopuolelle, missä niitä voidaan tarkastaa ja muokata. Tutkimukset, joissa arvioidaan kapasiteetiksi [noin 3,6 bittiä parametria kohden](https://arxiv.org/abs/2505.24832), tarkastelevat mallin tallennuskapasiteettia, mutta pelkkä kapasiteetti ei tarjoa auditoitavaa tietuetta jokaiselle väitteelle. Juuri tämän vaatimuksen yritän täyttää.

Mallilta kysyminen, miksi se esitti tietyn väitteen, ei anna minulle riippumattomasti tarkistettavissa olevaa tietoa siitä, miten se päätyi siihen. Sitä varten tarvitsen tallennettuja havaintoja ja linkkejä, jotka osoittavat, mitkä johtopäätökset käyttivät niitä. Näiden linkkien on myös säilyttävä korjausten yli.

Kutsumme tätä ulkoistetuksi epistemologiaksi (externalized epistemics). Nimi "Engrammic" tulee engrameista, aivojen hypoteettisista fyysisistä muistijäljistä. Ohjelmistossa ideana on tallentaa väitteet todisteineen, tiloineen ja suhteineen, jotta voimme tarkastaa ja korjata niitä.

Käytännössä tämä tarkoittaa sitä, että kun agentti yrittää tallentaa "hän vastasi viestiin, kaikki on hyvin" ja "hän on vihainen minulle" on jo olemassa, järjestelmä ei vain lisää uutta riviä perään. Se merkitsee ristiriidan ja pakottaa selvittämään sen. Joko vanha uskomus korvataan eksplisiittisellä linkillä siihen, mikä sen korvasi, uusi havainto hylätään tai molemmat asetetaan odotustilaan ihmisen väliintuloa varten. Mutta se mitä *ei* tapahdu, on ristiriitaisten faktojen hiljainen kasaantuminen, joka väistämättä nousee myöhemmin pintaan sekoittamaan kaiken.

Se tarkoittaa, että jokaisella uskomuksella on jälki: sen sijaan että "malli generoi tämän", sanotaankin "tämä tuli havainnoista X, Y, Z, jotka kirjattiin aikoina A, B, C, ja joiden luottamusarvo laski ajan myötä". Kun yritysasiakas kysyy, "miksi agenttinne sanoi asiakkaallemme näin", voit vastata kulkemalla graafia pitkin olankohautuksen sijaan. Se tarkoittaa, että unohtaminen on todellinen asia, jota varten järjestelmä suunnitellaan. Vanhat havainnot heikkenevät, vanhentunut konteksti haihtuu ja järjestelmä päättää aktiivisesti, mikä on riittävän tärkeää säilytettäväksi. Jonkinlaisen "täydellisen" muistin sijaan tavoitteena on hyvä *arviointikyky* olennaisuudesta.

Tämä vaatii enemmän koneistoa kuin pelkkä tekstin tallentaminen ja hakeminen. Mielestäni se on kokeilemisen arvoista agenteille, joiden päätökset riippuvat monien sessioiden aikana kertyneistä tiedoista.

Jaettu muisti tekee ristiriitojen käsittelystä erityisen tärkeää. Jos `agentit 1 ja 2` kirjoittavat ristiriitaisia havaintoja, mitä `agentti 3`:n pitäisi saada? Se tarvitsee riittävästi kontekstia tunnistaakseen erimielisyyden ja tavan kirjata ratkaisu menettämättä alkuperäisiä todisteita.

Olen kiinnostunut myös siitä, miten tämä soveltuisi maailmamalleihin ja robotiikkaan, mukaan lukien ulkoisen muistin rooli, jota käsitellään LeCunin [JEPA](https://openreview.net/forum?id=BZ5a1r-kVsf)-tutkimuksessa. Tallennettujen havaintojen perusteella toimivien järjestelmien kohdalla haluaisin esittää samat kysymykset alkuperästä, ristiriitaisista tietueista ja korjaamisesta.

Tekniset paperit löytyvät osoitteesta [engrammic.ai/research](https://engrammic.ai/research), ja ydinarkkitehtuuri on avointa lähdekoodia. Jos työskentelet agenttimuistin, uskomusten korjaamisen tai agenttien välisen koordinaation parissa, vaihdan mielelläni ajatuksia. Etsimme tutkimuskumppaneita; myös kysymykset ja issuet repositoriossa ovat tervetulleita.

Minulle todellinen testi on ongelma, josta tämä kaikki alkoi: kun agentti toistaa vanhentuneen väitteen, pystynkö löytämään mistä se tuli, korjaamaan sen ja estämään seuraavaa agenttia toistamasta sitä?

_Otsikkokuva: [cosmos.so](https://www.cosmos.so/e/948956014)._
