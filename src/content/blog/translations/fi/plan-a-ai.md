---
title: "Puhutaan Plan A:sta"
date: 2026-09-11
tags: [ai, governance, compute, alignment, policy, essay]
description: "AI Futures Project haluaa Yhdysvaltojen ja Kiinan laittavan superälyn tauolle vuoteen 2040 asti. Se on hyvä suunnitelma. Kuusikymmentä päivää sen julkaisemisen jälkeen kymmenentuhatta agenttia ratkaisi Navier–Stokesin yhtälöt."
toc: true
---

## Ajoitus

9. heinäkuuta 2026 AI Futures Project julkaisi raportin [AI 2040: Plan A](https://ai-2040.com/). Sillä on mittaa yhdeksänkymmentä sivua. Ehdotuksena on, että Yhdysvallat ja Kiina neuvottelevat vuoteen 2029 mennessä, ilmoittavat laskentakapasiteettinsa, päästävät toistensa tarkastajat infrastruktuuriinsa, keskeyttävät frontier-koulutuksen ja käyttävät sitten vuosikymmenen avoimeen alignment-tutkimukseen ennen kuin kukaan rakentaa viisainta ihmistä älykkäämpää järjestelmää. Superäly lykkääntyy vuoteen 2040, ja kaikki saavat elää.

8. syyskuuta 2026 OpenAI ilmoitti, että [noin kymmenentuhatta keskenään koordinoivaa autonomista agenttia oli löytänyt äärellisen ajan singulariteetin 3D-Navier–Stokes-yhtälöistä](https://openai.com/index/navier-stokes-solution/). Taustalla ollut malli oli talon sisäinen, GPT-6 Astraa kehittyneempi malli. He tuottivat sekä analyyttisen todistuksen että Lean-formalisaation, joten tulos on koneellisesti tarkistettu pelkän väitteen sijaan. He [kieltäytyivät lunastamasta miljoonan dollarin palkkiota](https://www.quantamagazine.org/ai-has-solved-one-of-maths-1-million-millennium-prize-problems-20260908/) ja kehystivät koko jutun raportiksi siitä, miten nopeasti kehitys etenee.

Tähän meni kuusikymmentä päivää, ja Plan A:n ensimmäinen virstanpylväs on vuonna 2029.

Haluan tehdä selväksi ennen kuin alan purkaa tätä osiin, että Plan A on mielestäni hyvä suunnitelma. Se on vakavin näkemäni yritys kuvata iskulauseiden sijaan operatiivisella tasolla, miltä kilpajuoksun pysäyttäminen oikeasti näyttäisi, eivätkä sen kirjoittajat todellakaan ole tyhmiä. Mikä tahansa suunnitelma tähän liittyen herättää vastustusta, enkä ole kiinnostunut lyttäämään sitä ainoaa porukkaa, joka teki kotiläksynsä. Mutta lukiessani sitä törmäsin jatkuvasti samaan seinään: lähes kaikki siinä olettaa, että voimme nähdä, mitä tapahtuu.

## Mitä Plan A sanoo

Lyhyt tiivistelmä niille, jotka eivät ole sitä lukeneet (ja se kannattaa lukea, koska se on hyvä).

He nimeävät [kaksi lopputulosta, joita he pitävät mahdottomina hyväksyä](https://ai-2040.com/about): sen, että ihmiskunta menettää tekoälyn hallinnan, tai sen, että pieni johtajien ja virkamiesten ryhmä saa tilapäisen monopolin superälyyn. Tuon toisen mukanaolo on tärkeää, sillä monet aiheesta kiistelevät huomioivat aina vain ensimmäisen.

Ydinperiaatteita ovat lisäajan ostaminen, tutkimuksen täysi läpinäkyvyys, tekoälyn laaja hajauttaminen ja peruttavuus. Aikajana etenee suunnilleen näin: Vuonna 2029 osapuolet neuvottelevat ja keskeyttävät frontier-koulutuksen, ilmoittavat laskentaresurssinsa ja auditoivat toimitusketjujen tiedot. Vuosina 2030–2035 tutkimusta jatketaan laajassa mittakaavassa ihmistason sisällä safety case -sääntelyn alaisuudessa. Vuonna 2035 kaikki pysähtyy ihmisasiantuntijoiden huipputasolle, ja loppuvuosikymmen käytetään alignmentiin, verifiointiin, tietoturvaan ja julkiseen keskusteluun ennen kuin kukaan etenee pidemmälle.

Valvontamekanismiksi he valitsevat laskentakapasiteetin hallinnan (compute governance) sekä sen, mitä he kutsuvat molemminpuolisesti varmistetuksi laskennan tuhoksi (mutually assured compute destruction). Laskenta on pullonkaula, koska laskenta on fyysistä, ja fyysisiä asioita voidaan laskea.

Heidän vastauksensa kysymykseen siitä, miksi Kiina koskaan suostuisi tähän, on hyvä kiteytys, joten lainaan sitä:

> jokaisen, joka kantaa huolta hallinnan menettämisestä, pitäisi nähdä tämä suunnitelma parannuksena, samoin jokaisen, joka kantaa huolta vallan keskittymisestä, lukuun ottamatta niitä, joille valta oletusarvoisesti keskittyisi

Se on terävästi sanottu. Se on myös ihmiskuvana aivan liian siisti. Ihmiset eivät jakaudu nätisti niihin, jotka pelkäävät hallinnan menettämistä, niihin, jotka pelkäävät vallan keskittymistä, ja niihin, jotka hyötyvät. Ihmisillä on yhtä aikaa mielessään noin yhdeksän eri motiivia: puolet niistä on hölmöjä, osa on egoa, osa kostoa, ja mukana on takuulla vähintään yksi ihminen, joka voi aidosti huonosti ja haluaa vain nähdä mitä tapahtuu. Suunnitelma vaikuttaa siltä kuin se olisi kirjoitettu vilpittömin mielin keskustelevalle lajille, ja siinä maailmassa minäkin haluaisin elää.

Joka tapauksessa: tässä kohtaa minä hyppään kyydistä.

## Itsenäinen kehittyminen ei vaadi lisää laskentatehoa

Plan A pitää laskentakapasiteettia pullonkaulana. Laske sirut, laske puolijohdetehtaat, tarkkaile virrankulutusta, ja tiedät kuka pystyy mihinkin. Frontier-mallin esikoulutuksessa puhtaalta pöydältä se pitääkin pitkälti paikkansa.

Ongelma on siinä, että itsenäinen kehittyminen ei vaadi lisää laskentaa. Se vaatii ohjelmistojen käyttöönottoa, ja ohjelmistojen käyttöönottoa on mahdotonta jäljittää.

Mietitäänpä mitä julkaistaan jo nyt. Thinking Machinesin [Tinker](https://thinkingmachines.ai/tinker/) mahdollistaa koulutussilmukan kirjoittamisen läppärillä ja LoRA-hienosäädön ajamisen heidän hajautetuilla GPU-klustereillaan neljän primitiivin avulla. [Engram](https://engram.com/) keräsi 98 miljoonaa dollaria rakentaakseen agenteille pysyvää strukturoitua muistia, ja koska olen kilpaillut juuri samalla kentällä, olen lukenut aiheesta lähes kaiken julkisen materiaalin. Mikään näistä ei ole superälyä, enkä niin väitäkään. Kyse on siitä, että saman suorituskyvyn saavuttaminen aiempaa halvemmalla muuttuu bulkkihyödykkeeksi, ja juuri sitä laskentakatto ei kykene havaitsemaan. Mittari näyttää tasaista, vaikka sen alla oleva viiva liikkuu koko ajan.

Enkä minä tässä edes yritä päteä, sillä he tietävät sen itsekin. [Heidän omasta oletusliitteestään](https://ai-2040.com/supplements/plan-a-assumptions):

> on mahdollista, että algoritminen edistys on saavutettavissa jopa hyvin pienellä määrällä laskentatehoa

Tämä lause on liitteessä, ja se romuttaa päädokumentin perustan. Jos pelkät tehokkuushyödyt riittävät viemään kehityksen huipulle, laskentakatto tekee näkyvästä kilvasta liian kallista, mutta ei tee yhtikäs mitään sille kilpajuoksulle, jota ei näe. Olet rakentanut kalliin aidan etuoven ympärille.

He myös myöntävät olettavansa, että salaiset hankkeet voisivat saavuttaa noin 1 % sopimusta edeltäneestä laskentakapasiteetista jäämättä kiinni, ja myöntävät sitten tämän luvun olevan lähellä pahinta mahdollista skenaariota. Olen asunut Iranissa, ja voin sanoa melkoisella varmuudella, että maan alle pystyy kätkemään valtavasti asioita, eivätkä ihmiset, joiden tehtävänä on löytää ne, ole työssään läheskään niin hyviä kuin haluaisivat meidän uskovan.

## Tutkimuksen läpinäkyvyys ei tarkoita mallin läpinäkyvyyttä

Tästä olen yksinkertaisesti eri mieltä. Plan A:ssa sanotaan, että täysi läpinäkyvyys

> tekee salaisten lojaliteettien, vinoumien tai agendojen tahallisesta kouluttamisesta tekoälyihin lähes mahdotonta

En usko tämän pitävän paikkaansa. Tutkimuksen läpinäkyvyys kattaa tekniikat. Koulutus taas on kehitystä ja tuotantoonvientiä, ja se osuus pysyy suljettuna. Datamix, preferenssilabelit, ketkä toimivat arvioijina ja mitä heille sanottiin, perustuslaki, järjestelmäkehote. Mikään näistä ei ole tutkimustekniikka, ja juuri niihin lojaliteetit ujutettaisiin, jos sellaisia haluttaisiin asettaa. Voit julkaista reseptin avoimena lähdekoodina ja silti suolata ainekset.

Tilanne on vieläkin pahempi, sillä vaikka minulla olisi edessäni mallin kaikki painot ja koko datasetti, en pystyisi luotettavasti löytämään sitä. Anthropicin [tutkimus nukkuvista agenteista (sleeper agents)](https://arxiv.org/abs/2401.05566) koulutti malleihin takaovia ja ajoi sen jälkeen normaalin turvallisuuskoulutuksen päälle, ja takaovet säilyivät. Suuremmat mallit pitivät kiinni käytöksestä vielä tiukemmin. Vastakkainasetteluun perustuva koulutus opetti mallit piilottamaan laukaisimen sen unohtamisen sijaan.

Väite siis lupaa liikoja kahdessa kohtaa: sinulla ei olisi itse artefaktia, eikä artefaktin hallussapito edes riittäisi. Tämä on sama epäsymmetria, josta vaahtosin [tietoteoreettista romahdusta käsittelevässä kirjoituksessani](/blog/epistemic-collapse): jonkin tuottaminen on halpaa, sen todentaminen ei, eikä kenenkään budjetti ole vielä ottanut tätä huomioon.

## Milloin tutkimus on valmista

Oletetaan, että meillä on täysi tutkimuksen läpinäkyvyys. Kuka päättää, milloin jokin julkaistaan?

"Tutkimus on valmis" ei ole mikään yksittäinen tapahtuma. Ei ole hetkeä, jolloin kello soisi. Voisin käyttää kahdeksantoista kuukautta koulutustekniikkaan samalla kun testaan, kehitän, otan sitä hiljaa käyttöön sisäisesti ja kerään dataa oikeasta liikenteestä, ja koko tuon ajan olisin täysin totuudenmukaisesti yhä tekemässä tutkimusta. Minulla olisi vuosien etumatka ilman, että olisin valehdellut kertaakaan.

Jos tämän yrittää tukkia sääntelemällä itse ohjelmistokehitystä, lopputuloksena on EU-tason paperisota jokaiselle mallia hipaisevallekin yritykselle, ja kehitys tukahtuu sen alle. Se on huono juttu, enkä halua sitäkään.

Ratkaisu on olemassa muilla aloilla, mutta Plan A ei käytä sitä. Kliinisissä kokeissa tämä ongelma ratkaistiin ennakkorekisteröinnillä. Koulutusajo ilmoitetaan ennen sen aloittamista, jolloin vaikeneminen on itsessään rikkomus, eikä tarvitse arpoa, milloin jokin lasketaan valmiiksi. Plan A haluaa jokaisen koulutusajon julkaistavaksi nettiin, muttei koskaan määrittele, mikä laukaisee julkaisun, mikä jättää aukon, josta mahtuisi ajamaan sisään kokonaisen datakeskuksen.

## Mihin verifiointi pystyy ja mihin ei

Heidän versionsa verifioinnista on se, että analyytikot eri maista käyvät läpi ilmoitettuja laskentalistoja, esittävät kysymyksiä, puuttuvat poikkeamiin ja lähettävät tarkastajia toistensa infrastruktuuriin, jotta vuoden loppuun mennessä kumpikin osapuoli on varma siitä, ettei toinen piilottele yli yhtä prosenttia tekoälylaskennastaan.

En usko sen toimivan, ja osasyyni on hieman epäreilu heitä kohtaan: kyse olisi sellaisen asian valvonnasta, joka saattaa lopulta olla meitä sata kertaa älykkäämpi. Muurahaiset eivät voi muodostaa mallia siitä, mitä ihminen ajattelee tiistaina, ja tuo kuilu on koko ongelman ydin.

Ollakseni heille reilu (hätiköin nimittäin itse tämän suhteen, kun luin raportin ensimmäistä kertaa), Plan A ei itse asiassa missään vaiheessa ehdota superälyn valvontaa. Koko suunnitelman ajatus on pysähtyä huipputason ihmisasiantuntijan tasolle vuonna 2035 eikä koskaan rakentaa mitään sellaista, mikä olisi satakertaisesti meitä edellä. He olisivat siis kanssani samaa mieltä ja sanoisivat, että juuri sitä varten katto on olemassa. Selvä. Vastalauseeni siirtyy silloin vain askelta taaksepäin ja kohdistuu siihen, pitääkö katto paikkansa, ja sitä varten katsokaa koko yllä oleva osio ohjelmistoista.

He kyllä suosittelevat varhaisia investointeja verifiointitutkimukseen, mikä on oikein, ja olin hätäinen sivuuttaessani sen aluksi. Mutta katsokaapa varavaihtoehtoja, joita he listaavat tilanteeseen, jossa kunnollisia työkaluja ei ole vielä saatavilla: Luotetaan tiedustelutietoihin ja satelliittiseurantaan. Ostetaan hyllytavaraa ja verkkokuuntelulaitteita. Suljetaan osa laskentakapasiteetista, kunnes parempia työkaluja on olemassa. Tai ei pidetä taukoa, vaan annetaan suorituskyvyn kehityksen jatkua kuukausia.

Ensimmäinen tapahtuu meille kaikille jatkuvasti jo nyt. Toinen tapahtuu jo nyt. Kolmas ei tule tapahtumaan, koska kukaan ei katkaise tulovirtojaan. Neljäs on se, mitä tapahtuu oletusarvoisesti, jos ei tee yhtään mitään.

Varasuunnitelmien portaat päättyvät siis nykytilaan, mikä viittaa siihen, etteivät ne oikeastaan ole mitkään portaat.

Verifiointi ostaa meille tunteen siitä, että tiedämme mitä tapahtuu. Sillä on arvonsa, ja koordinointi vaatii jaettua luottamusta. Mutta se on eri asia kuin hallinta, ja mielestäni dokumentissa nämä kaksi pääsevät sekoittumaan keskenään.

## Molemminpuolisesti varmistettu laskennan tuho

Kehystys on hyvä idea. Se on aito, kova reunaehto, se on selkeä ja se luo pysyvän kannustimen, joka oikeasti muuttaa käyttäytymistä pelkän hyvän käytöksen kuvailun sijaan. Pidän siitä väliaikaisratkaisuna.

En kuitenkaan usko heidän ottaneen huomioon, mitä se tekee ihmisille.

Emme voi kovin hyvin tämän ensimmäisenkään version jäljiltä. Ydinpelote on synnyttänyt taustakauhua kahdeksankymmentä vuotta, ja se on iskostunut jo noin kolmeen sukupolveen. Laskenta-MAD on pahempi yhdellä tietyllä tavalla: ydinpelotteella on näkyvä, selkeä laukaisin. Kaikki tietävät, mikä on ohjuslaukaisu. Laskennan tuho laukeaa kynnyksestä, jota kukaan ei näe, ja jonka arvioivat verifiointijärjestelmät, joiden toimimattomuudesta kirjoitin juuri kaksi osiota. Ahdistus ei siis pääse koskaan kiinnittymään mihinkään konkreettiseen tapahtumaan, vaan se jatkuu taukoamatta.

Ja kyllä, me pystymme toipumaan muutaman ydinpommin räjähtämisestä. Tai no, emme pysty. Unohtakaa, unohda että sanoin mitään.

Mutta se juuri on pointti. Pääsin rauhoittelevassa lauseessani puolitiehen ennen kuin kuulin mitä olin sanomassa.

## Osuus, josta pidän

Älykkyyden laaja hajauttaminen. Tämä on se periaate, jonka säilyttäisin ja jolle rakentaisin, ja tässä Plan A on kiinnostavimmillaan. Se nimittäin puree oikeasti vallan keskittymisen ongelmaan hallinnan menettämisen sijaan.

Jos kaikki julkaistaan ja kuka tahansa päättelyyn pystyvällä raudalla varustettu voi ajaa sitä, kukaan ei saa monopolia, koska kenelläkään ei ole salaisuutta. Se on aito vastaus heidän toiseen ei-toivottuun lopputulokseensa, ja se on parempi vastaus kuin useimmilla muilla tässä väittelyssä.

Haluaisin viedä tämän pidemmälle ja tehdä siitä fyysistä.

Tällä hetkellä rakennamme laskentaa samalla tavalla kuin olemme rakentaneet kaikkea muutakin kolmekymmentä vuotta: keskitetään se, viedään se jonnekin missä on halpaa sähköä, ja jätetään melu naapureiden murheeksi. Ihmiset vihaavat tätä, ymmärrettävästi, ja monet yhteisöt taistelevat parhaillaankin datakeskuksia vastaan melun, veden ja sähköverkon kuormituksen vuoksi.

Miksi sen pitää olla juuri sellaisessa muodossa? Miksi GPU-laitteita ei voisi ripotella pitkin kokonaista kaupunkia? Syötetään lämpö ja vesi olemassa olevaan verkkoon, jolloin investointi laskentaan muuttuu investoinniksi verkon kehittämiseen, mikä on julkinen hyödyke kaikille, myös niille, joita tekoäly ei kiinnosta pätkääkään. Ulkoisvaikutus muuttuu resurssiksi.

Tämä ei ole mitään hypoteettista, sillä Suomessa lämpöpuoli hoidetaan jo näin. Espoossa on datakeskus, joka syöttää hukkalämpönsä kaukolämpöverkkoon kuusinumeroiselle määrälle ihmisiä. Melu- ja haittaongelmat syntyvät silloin, kun datakeskus suunnitellaan erilliseksi saarekkeeksi. Kun se suunnitellaan verkon osaksi, suurin osa valituksista poistuu.

Tekninen vastaväite, ettei koko kaupungin yli voisi kouluttaa mallia yhteyksien kaistanleveyden vuoksi, murenee oikean tutkimuksen edessä. [DiLoCo](https://arxiv.org/abs/2311.08105) osoitti, että synkronointia voidaan tehdä paljon harvemmin kuin kaikki olettivat. Prime Intellect koulutti 10B-mallin avoimen internetin yli vapaaehtoisten GPU:illa ja [raportoi 400-kertaisen vähennyksen tiedonsiirtokaistassa](https://arxiv.org/abs/2412.01152) tavalliseen dataparalleelikoulutukseen verrattuna. Nous Researchin DisTrO tähtää samaan suuntaan. Hajautettu koulutus on todellinen tutkimushanke tuloksineen, ei mikään ajatuskoe.

![Tekoälyn suunnittelema modulaarinen kelluva lautta: aurinkopaneelistoja ja laskentalohkoja pylväiden varassa merellä yhtenäisenä rakenteena](/assets/blog/plan-a-datacenter.webp "Lautta kuvattuna raportissa AI 2040: Plan A. https://ai-2040.com/")

Yksi asia kuitenkin, ja tässä olen ehkä hieman ilkeä Plan A:n omalle graafiselle osastolle: Raportissa on kuvitus tekoälyn suunnittelemasta modulaarisesta kelluvasta lautasta aurinkopaneeleineen, akkuineen ja laskentayksikköineen. Se on upea, ja haluaisin aidosti nähdä sen rakennettavan. Mutta katsokaapa sitä. Se on yksi valtava, yhtenäinen lohko, rakennettu yhtenä kokonaisuutena, jolla on yksi reuna. Estetiikkana on hajautus, mutta muotona datakeskus, joka oppi kellumaan. Minun versioni ja tuo versio ovat kaksi eri ehdotusta, joihin on vain puettu samat aurinkopaneelit.

## Heidän avoimet kysymyksensä

He esittävät joukon kysymyksiä, joihin he eivät vastaa, mitä arvostan huomattavasti enemmän kuin teeskentelyä. Kolme niistä jäi mieleeni.

Pitäisikö meidän kieltää uuden paradigman tutkimus, joka tekisi tekoälyistä huomattavasti kyvykkäämpiä? En tiedä. Oma vaistoni sanoo, että jossain on jyrkkä käännepiste, jossa joku kytkee oikean moduulin agenttiin ja peli on kerta kaikkiaan selvä. Se kuka ehtii sinne ensin, saa kaiken, eikä yksikään sopimus kestä sitä. En kuitenkaan osaa sanoa, missä tuo piste on tai miltä se näyttää, joten en aio esittää tietäväni oikeaa linjausta.

Pitäisikö meidän vaatia ajatusketjujen (chain of thought) pysyvän tulkittavina? Oikeastaan ei mielestäni. Annetaan ihmisten kouluttaa ilman sitä.

Osittain siksi, että se on ylämäkitaistelu, joka muuttuu sitä jyrkemmäksi, mitä korkeammiksi panokset nousevat, ja ala tietää tämän jo. [Paperi ajatusketjujen valvottavuudesta](https://arxiv.org/abs/2507.11473), jonka on allekirjoittanut noin neljäkymmentä tutkijaa OpenAI:lta, DeepMindilta, Anthropicilta ja METR:ltä, sanoo suoraan, että luettavuus on vain nykyisen koulutustavan hauras sivutuote ja että tavallinen optimointipaine tuottaa koodattua tai hämärrettyä päättelyä. Pakollinen vaatimus siis lukitsisi koulutusmenetelmän vain säilyttääkseen sivuvaikutuksen, joka on katoamassa joka tapauksessa.

Ennen kaikkea kyse on kuitenkin läpimenosta. Tulkittavasta ajatusketjusta ei ole hyötyä, jos sitä on liikaa. Täydellisen selkeä päättely noissa volyymeissa jää silti lukematta. Luettavuus kuolee mittakaavaan ennen kuin se kuolee hämärtämiseen.

Otetaanpa siis askel taaksepäin ja katsotaan, miten me oikeastaan teemme näitä asioita. Me kasvatamme näitä malleja, emme ohjelmoi niitä. Siinä koko juttu piilee, ja mielestäni se on kehys, joka Plan A:sta puuttuu. Jokainen dokumentin hallintamalli kohdistuu rakennettuun artefaktiin: tarkasta se, pysäytä se, auditoi se, lue sen päättely. Kaikki nuo ovat toimia sellaista asiaa vastaan, joka on konstruoitu. Puutarhaa ei voi saada kukoistamaan pelkillä tarkastuskäynneillä.

Sen sijaan haluaisin määritellä alkuolosuhteet ja reunaehdot, jotka tekevät ajatusketjun päätymisen mihinkään huonoon alun alkaenkin mahdottomaksi. Ei havaittavaksi, vaan mahdottomaksi. Minulla ei ole aavistustakaan, miten se tehdään, eikä pyyntö välttämättä ole edes mielekäs, mutta sinne omat ajatukseni heti suuntaavat, ja käyttäisin tutkimusrahat mieluummin siihen kuin parempaan mikroskooppiin.

Pitäisikö meidän antaa tekoälyjen tehdä tekoälytutkimusta? Kyllä, ehdottomasti, mutta samalla perusajatuksella.

Tällä hetkellä koodaamme käyttäytymistä. Koulutusdata kyllästetään tietyllä piirteellä ja malli omaksuu sen, aivan kuten lapsi oppii uimaan. Kukaan ei anna heille sääntökirjaa; heidät laitetaan veteen tarpeeksi monta kertaa ja lopulta he osaavat homman. Se toimii, ja niin tämä kaikki toimii. Ongelma on siinä, että käyttäytymisen koodaaminen tuottaa vain lopputuloksen eikä mitään muuta. Heti kun malli joutuu tilanteeseen, jota sille ei ole opetettu, se vain imitoi ja hajoaa.

Koodataan sen sijaan kannustin. Koodataan syy asian tekemiselle. Malli, joka ymmärtää syyn, kykenee päättelemään oikean siirron tilanteessa, jota kukaan ei osannut ennakoida, koska se kantaa mukanaan itse generaattoria pelkän tulosteen sijaan. Sitä ohjattavuus (steering) oikeasti tarkoittaisi.

Tiedostan, että tämä on ratkaisematon osa-alue. Palkkiomallinnus on yrittänyt tehdä juuri tätä vuosia ja häviää jatkuvasti malleille, jotka oppivat mittarin tavoitteen sijasta. En väitä, että minulla olisi vastaus valmiina. Sanon vain, että sinne minä rahani laittaisin, ja samalla informaatioteoriaan sekä neurotieteeseen, sillä yksi tämän alan aidosti hienoista sivutuotteista on se, että opimme jatkuvasti vahingossa uutta itsestämme.

## Kaksi tasoa

Nämä kannattaa erottaa toisistaan, koska sotkin ne keskenään, kun sanoin asian ensimmäistä kertaa ääneen.

On osuus, jonka asetat ennen ajoa: alustuksessa valitut rajoitteet, jotka määrittävät, mitkä trajektorit ovat ylipäätään saavutettavissa. Tässä ei tarkkailla mitään. Valitaan vain riittävän kapea tila, jotta huonot alueet eivät mahdu siihen. Päätetty kerran, rakenteellinen, valmis.

Sitten on osuus, joka toimii ajon aikana: mallin sisällä elävät kannustimet, jotka ohjaavat sitä työn lomassa. Jatkuvaa, reaaliaikaista, eikä siltikään valvontaa, koska kukaan ihminen ei ole lukemassa tulosteita ja tekemässä arvioita.

Molemmat ovat interventioita, eikä kumpikaan ole pelkkää passiivista lukemista. Se mitä vastustan, on tarkasta ja korjaa -kehä, jossa joku lukee lokia ja tekee päätöksiä. En vastusta ajatusta siitä, että tehdään jotain.

## Mitä mieltä minä olen

Tämä on sama johtopäätös, johon tulin [Chat Control -artikkelissani](/blog/chat-control-eu). Tiedostan toistavani itseäni, mutta päädyn tähän jatkuvasti täysin eri suunnista, joten jossain vaiheessa on oletettava, että kyse on maastosta eikä minusta.

Kirjatut säännöt eivät kestä kosketusta ihmisiin. Ei siksi, että ihmiset olisivat pahoja, vaan siksi, että säännöt vaativat jatkuvaa toimeenpanoa ihmisiltä, jotka väsyvät, tulevat ostetuiksi, korvataan toisilla, joutuvat äänestetyksi nurin ja pitkästyvät. Valvontapuolen tarvitsee voittaa vain kerran. Laskennan tauottamista ajavan puolen on voitettava joka ikinen vuosi vuoteen 2040 asti.

Kannattaa siis rakentaa asioita, joiden toiminta ei vaadi sitä, että joku valitsee ne yhä uudelleen. Tehdään massavalvonnasta arkkitehtonisesti mahdotonta sen sijaan, että se vain kiellettäisiin lailla, mitä tutkiskelen projektissani [ØCLOAK](https://novusedge.github.io/portfolio/ocloak). Tehdään yksipuolisesta laskentakapasiteetin kerryttämisestä rakenteellisesti mahdotonta sen sijaan, että se kiellettäisiin sopimuksilla. Tehdään itse valmistusprosessista sellainen, ettei tietyn rajan yli voi kouluttaa ilman useiden muiden ihmisten suostumusta, koska suostumus on fyysinen riippuvuus eikä pelkkä allekirjoitus.

Minulla ei ole tuota ratkaisua valmiina. Haluan tehdä erittäin selväksi, ettei minulla ole sitä, että se saattaa olla mahdotonta ja että "tehdään siitä rakenteellisesti mahdotonta" on helppo sanoa: se on ollut monen sellaisen esseen viimeinen lause, jonka kirjoittaja ei sitten tehnyt yhtään mitään. Mutta se on ainoa vastauskategoria, jonka olen löytänyt ja joka ei vaadi ihmisiltä valppauden säilyttämistä viittätoista vuotta putkeen. Enkä ole kertaakaan nähnyt ihmisten pystyvän sellaiseen.

Toinen asia, jonka sanon (ja saatan olla väärässä tässäkin), on se, että Plan B on se mitä oikeasti tapahtuu. Me sodimme Kiinaa vastaan tai käytämme vuosikymmenen siihen valmistautumiseen. Minulla ei ole siinä puolta. En luota Yhdysvalloissa tätä pyörittäviin teknologiaoligarkkeihin pätkääkään, en luota myöskään Pekingiin, ja toisinaan ajattelen, että Kiina saattaisi hoitaa homman paremmin, mikä on epämiellyttävä lause kirjoittaa.

Siinä se paljastus kuitenkin on. En luota heistä kehenkään, koska he ovat kaikki vain ihmisiä pitelemässä jotain näin valtavaa. Niin kauan kuin ihmiset johtavat tätä, olemme mielestäni melko lailla täysin kusessa. Eikä tämä tarkoita sitä, että tekoälyn pitäisi päättää asioista sen sijaan, en todellakaan aja sitä takaa. Se tarkoittaa, että meidän pitäisi käyttää aikamme tekemään tietyistä asioista mahdottomia: laskentatehon massiivisesta keskittämisestä, varallisuuden massiivisesta keskittämisestä, minkä tahansa massiivisesta keskittämisestä, jotta sillä olisi huomattavasti vähemmän väliä, kuka on vallankahvassa.

Kuusikymmentä päivää julkaisusta Millennium-palkintotehtävän koneellisesti tarkistettuun todistukseen. Ensimmäinen neuvottelujen virstanpylväs on vuonna 2029.

Toivon, että he ovat oikeassa ja minä väärässä. Todella toivon.

~ A.
