---
title: "Puhutaan Plan A:sta"
date: 2026-09-11
tags: [ai, governance, compute, alignment, policy, essay]
description: "AI Futures Project haluaa Yhdysvaltojen ja Kiinan laittavan superälyn tauolle vuoteen 2040 asti. Se on hyvä suunnitelma. Kuusikymmentä päivää sen julkaisun jälkeen kymmenentuhatta agenttia ratkaisi Navier–Stokesin."
toc: true
---

## Ajoitus

9. heinäkuuta 2026 AI Futures Project julkaisi raportin [AI 2040: Plan A](https://ai-2040.com/). Sillä on mittaa yhdeksänkymmentä sivua. Ehdotus on, että Yhdysvallat ja Kiina neuvottelevat vuoteen 2029 mennessä, ilmoittavat laskentaresurssinsa (compute), päästävät toistensa tarkastajat infrastruktuuriinsa, keskeyttävät frontier-mallien koulutuksen ja käyttävät sitten vuosikymmenen alignment-tutkimukseen avoimesti ennen kuin kukaan rakentaa mitään viisainta ihmistä älykkäämpää. Superäly lykkääntyy vuoteen 2040 ja kaikki jäävät henkiin.

8. syyskuuta 2026 OpenAI ilmoitti, että [noin kymmenentuhatta koordinoivaa autonomista agenttia oli löytänyt äärellisen ajan singulariteetin 3D Navier–Stokes -yhtälöistä](https://openai.com/index/navier-stokes-solution/). Sen taustalla oli sisäinen malli GPT-6 Astraa ylempää. He tuottivat sekä analyyttisen todistuksen että Lean-formalisaation, joten tulos on koneellisesti tarkistettu pelkän väitteen sijaan. He [kieltäytyivät lunastamasta miljoonan dollarin palkintoa](https://www.quantamagazine.org/ai-has-solved-one-of-maths-1-million-millennium-prize-problems-20260908/) ja kehystivät koko jutun raporttina siitä, kuinka nopeasti tämä kaikki etenee.

Se tekee kuusikymmentä päivää, ja Plan A:n ensimmäinen etappi on vuonna 2029.

Haluan tehdä selväksi ennen kuin alan purkaa tätä osiin, että mielestäni Plan A on hyvä suunnitelma. Se on vakavastiotettavin näkemäni yritys kuvata sitä, miltä kilpajuoksun pysäyttäminen oikeasti näyttäisi operatiivisella tasolla iskulauseiden sijaan, eivätkä sen kirjoittajat todellakaan ole tyhmiä. Mikä tahansa tällainen suunnitelma kohtaa vastustusta, enkä ole kiinnostunut hyökkäämään sen ainoan ryhmän kimppuun, joka teki kotiläksynsä. Mutta lukiessani sitä törmäsin jatkuvasti samaan seinään: lähes kaikki siinä olettaa, että pystytään näkemään, mitä on tekeillä.

## Mitä Plan A sanoo

Lyhyt tiivistelmä heille, jotka eivät ole sitä lukeneet, ja se kannattaa lukea, koska se on hyvä.

He nimeävät [kaksi lopputulosta, joita pitävät mahdottomina hyväksyä](https://ai-2040.com/about): sen, että ihmiskunta menettää tekoälyn hallinnan, tai sen, että pieni joukko johtajia ja virkamiehiä päätyy pitämään tilapäistä monopolia superälyyn. Tuon toisen mukanaolo on tärkeää, ja moni aiheesta väittelevä tuijottaa vain ensimmäistä.

Ydinperiaatteet ovat lisäajan ostaminen, täydellinen tutkimuksen läpinäkyvyys, tekoälyn laaja hajauttaminen ja peruutettavuus. Aikajana menee suunnilleen näin: Vuonna 2029 osapuolet neuvottelevat ja keskeyttävät frontier-koulutuksen, ilmoittavat compute-resurssinsa ja auditoivat toimitusketjujen tiedot. Vuosina 2030–2035 tutkimus jatkuu laajassa mittakaavassa ihmisen suorituskyvyn rajoissa safety case -sääntelyn alaisena. Vuonna 2035 kaikki pysähtyy ihmishuippuasiantuntijan tasolle, ja loppuvuosikymmen käytetään alignmentiin, verifiointiin, turvallisuuteen ja julkiseen keskusteluun ennen kuin kukaan etenee pidemmälle.

Valvontamekanismiksi he valitsevat compute-hallinnan (compute governance) sekä sen, mitä he kutsuvat keskinäiseksi varmistetuksi computen tuhoksi (mutually assured compute destruction). Compute on pullonkaula, koska compute on fyysistä, ja fyysisiä asioita voidaan laskea.

Heidän vastauksensa kysymykseen siitä, miksi Kiina koskaan suostuisi tähän, on hyvä heitto, joten lainaan sen:

> kenen tahansa, joka on huolissaan hallinnan menettämisestä, pitäisi pitää tätä suunnitelmaa parannuksena, samoin kuin jokaisen vallan keskittymisestä huolestuneen, lukuun ottamatta niitä, joille valta oletusarvoisesti keskittyisi

Tuo on osuvasti sanottu. Se on myös ihmiskuvana aivan liian siisti. Ihmiset eivät jakaudu nätisti niihin, jotka pelkäävät hallinnan menetystä, niihin, jotka pelkäävät vallan keskittymistä, ja niihin, jotka hyötyvät siitä. Ihmisillä on yhtä aikaa noin yhdeksän eri motiivia, joista puolet on typeriä, osa egoa, osa kostoa, ja kuviossa on taatusti ainakin yksi ihminen, joka voi aidosti huonosti ja haluaa vain nähdä mitä tapahtuu. Suunnitelma tuntuu siltä kuin se olisi kirjoitettu lajille, joka väittelee hyvässä uskossa, ja siinä maailmassa minäkin haluaisin elää.

No joka tapauksessa. Tässä kohtaa minä jään pois kyydistä.

## Itsekehitys ei vaadi lisää computea

Plan A pitää computea pullonkaulana. Laske sirut, laske puolijohdetehtaat, seuraa virrankulutusta, ja tiedät kuka pystyy tekemään mitäkin. Uuden frontier-mallin esikouluttamiseen nollasta se pitää periaatteessa paikkansa.

Ongelma on se, että itseään kehittävä tekoäly ei tarvitse lisää computea. Se tarvitsee ohjelmistojulkaisuja, ja ohjelmistojulkaisuja on mahdotonta jäljittää.

Katsotaanpa mitä kaikkea jo julkaistaan. Thinking Machinesin [Tinker](https://thinkingmachines.ai/tinker/) mahdollistaa koulutussilmukan kirjoittamisen läppärillä ja LoRA-hienosäätöjen ajamisen heidän hajautetuilla GPU:illaan neljän primitiivin avulla. [Engram](https://engram.so/) keräsi 98 miljoonaa dollaria rakentaakseen agenteille pysyvää strukturoitua muistia, ja olen kilpaillut juuri samalla kentällä, joten olen lukenut lähes kaiken mitä siitä on julkisesti saatavilla. Mikään tuosta ei ole superälyä, enkä väitäkään sen olevan. Kyse on siitä, että saman kyvykkyyden saavuttamisesta halvemmalla on tulossa bulkkia, ja se on se osa, jota compute-katto ei näe. Mittari näyttää tasaista, vaikka viiva sen alla liikkuu koko ajan.

Enkä minä vain yritä päteä, sillä he tietävät tämän itsekin. Heidän [omasta oletusliitteestään](https://ai-2040.com/supplements/plan-a-assumptions):

> on mahdollista, että algoritmista edistystä voidaan saavuttaa hyvinkin vähäisellä laskentakapasiteetilla

Tuo lause lymyää liitteessä ja vesittää koko pääasiakirjan. Jos pelkät tehokkuusparannukset voivat viedä frontier-tasolle, compute-katto tekee näkyvästä kilpajuoksusta liian kallista, mutta ei tee yhtään mitään sille kilpajuoksulle, jota ei näe. Silloin on vain rakennettu kallis aita etuoven ympärille.

He myös myöntävät olettavansa, että salaiset projektit voisivat saavuttaa noin 1 % sopimusta edeltävästä computesta jäämättä kiinni, ja toteavat sitten kyseisen luvun olevan lähellä pahinta mahdollista skenaariota. Olen asunut Iranissa ja voin kertoa melkoisella varmuudella, että maan alle pystyy piilottamaan valtavasti tavaraa, ja ne ihmiset, joiden työnä on löytää se, eivät ole siinä työssä niin hyviä kuin haluaisivat meidän uskovan.

## Tutkimuksen läpinäkyvyys ei ole mallin läpinäkyvyyttä

Tästä olen yksinkertaisesti eri mieltä. Plan A väittää, että täydellinen läpinäkyvyys

> tekee lähes mahdottomaksi opettaa tekoälyihin tarkoituksellisesti salaisia lojaliteetteja, vinoumia tai agendoja

En usko, että tuo pitää paikkaansa. Tutkimuksen läpinäkyvyys kattaa menetelmät. Koulutus on kehitystä ja käyttöönottoa, ja se osuus pysyy suljettuna. Datamix, preferenssilabelit, ketkä arvioijasi olivat ja mitä heille kerrottiin, perustuslaki, system prompt. Mikään noista ei ole tutkimusmenetelmä, ja juuri noihin piilotettaisiin lojaliteetti, jos sellainen haluttaisiin ujuttaa mukaan. Voit julkaista reseptin avoimena lähdekoodina ja silti myrkyttää ainekset.

Tilanne on vieläkin pahempi, sillä vaikka minulla olisi täydet painot ja koko datasetti edessäni, en pystyisi löytämään sitä luotettavasti. Anthropicin [sleeper agents -tutkimuksessa](https://arxiv.org/abs/2401.05566) malleihin koulutettiin takaovia, minkä jälkeen niille ajettiin normaali turvallisuuskoulutus, ja takaovet säilyivät. Suuremmat mallit pitivät käytöksestä kiinni vielä tiukemmin. Vastakkainasettelukoulutus opetti malleja piilottamaan laukaisimen sen sijaan, että ne olisivat luopuneet siitä.

Väite siis lupaa liikaa kahdessa eri kohdassa. Ensinnäkään artefaktia ei saisi käsiinsä, ja toisekseen sen saaminenkaan ei riittäisi. Tämä on sama epäsymmetria, josta vaahtosin [episteemistä romahdusta käsittelevässä kirjoituksessani](/blog/epistemic-collapse): jonkin luominen on halpaa, sen varmentaminen ei, eikä kenenkään budjetti ole vielä pysynyt tämän perässä.

## Milloin tutkimus on valmis

Oletetaan, että meillä on täydellinen tutkimuksen läpinäkyvyys. Kuka päättää, milloin jokin julkaistaan?

"Tutkimus on valmis" ei ole mikään yksittäinen tapahtuma. Ei ole hetkeä, jolloin kello kilahtaa. Voisin viettää kahdeksantoista kuukautta koulutusmenetelmän parissa samalla testaten, kehittäen ja julkaisten sitä hiljaa sisäisesti sekä keräten dataa todellisesta liikenteestä, ja koko tämän ajan tekisin täysin rehellisesti "edelleen tutkimusta". Saisin vuosien etumatkan valehtelematta kertaakaan.

Jos tuo yritetään tukkia sääntelemällä itse ohjelmistokehitystä, päädytään EU-tasoiseen paperisotaan jokaisessa tekoälymalleja hipaisevassakin yrityksessä, ja kehitys kuolee sen alle. Se on huono juttu, enkä halua sitäkään.

Ratkaisu on olemassa muilla aloilla, mutta Plan A ei käytä sitä. Kliiniset kokeet ratkaisivat tämän ongelman ennakkorekisteröinnillä. Ajo ilmoitetaan ennen sen aloittamista, jolloin vaikeneminen itsessään on rikkomus, eikä tarvitse arvailla, milloin jokin lasketaan valmiiksi. Plan A haluaa jokaisen koulutusajon julkaistavan internetiin, mutta ei koskaan määrittele, mikä julkaisun laukaisee, mikä jättää aukon, josta mahtuisi ajamaan konesalin läpi.

## Mitä verifiointi voi ja ei voi tehdä

Heidän verifiointitarinansa mukaan useiden maiden analyytikot käyvät läpi ilmoitettuja compute-listoja, esittävät kysymyksiä, puuttuvat poikkeamiin ja lähettävät tarkastajia toistensa infrastruktuureihin, jotta vuoden loppuun mennessä kumpikin osapuoli voi luottaa siihen, ettei toinen piilottele yli 1 % tekoäly-computestaan.

En usko, että se toimii, ja osa perustelustani on heitä kohtaan hieman epäreilu: puhuisimme nimittäin sellaisen asian valvomisesta, joka voi päätyä sata kertaa meitä älykkäämmäksi. Muurahaiset eivät kykene mallintamaan sitä, mitä ihminen ajattelee tiistaina, ja tuo kuilu on koko ongelman ydin.

Ollakseni heille reilu, ja hätäilin tämän suhteen hieman lukiessani raportin ensimmäistä kertaa, Plan A ei itse asiassa koskaan ehdota superälyn valvontaa. Koko suunnitelman ajatus on pysähtyä ihmishuippuasiantuntijan tasolle vuonna 2035 eikä koskaan rakentaa sitä, mikä on satakertaisesti meitä edellä. He olisivat siis kanssani samaa mieltä ja sanoisivat, että sitä varten katto on olemassa. Selvä. Vastalauseeni siirtyy silloin askeleen taaksepäin ja kohdistuu siihen, pitääkö katto, ja sen osalta voi lukea koko edellisen ohjelmistoja käsittelevän osion.

He suosittelevat varhaisia investointeja verifiointitutkimukseen, mikä on oikein, ja tuomitsin sen turhan hätäisesti heti alussa. Mutta katsokaapa heidän listaamiaan varasuunnitelmia sen varalle, että kunnolliset työkalut eivät olekaan valmiina: Luotetaan tiedustelutiedon keruuseen ja satelliittivalvontaan. Ostetaan hyllytavaraa ja verkkokuuntelulaitteita. Suljetaan osa computesta, kunnes parempia työkaluja on saatavilla. Tai ei pidetä taukoa, ja annetaan kyvykkyyksien kehityksen jatkua kuukausia.

Ensimmäistä tapahtuu meille kaikille jo jatkuvasti. Toista tapahtuu jo. Kolmas ei tule tapahtumaan, koska kukaan ei katkaise tulovirtojaan. Neljäs on se, mitä tapahtuu oletusarvoisesti, jos ei tehdä yhtään mitään.

Varasuunnitelmien portaat päättyvät siis nykytilaan, mikä viittaa siihen, etteivät ne oikeastaan ole mitkään portaat.

Verifiointi ostaa meille tunteen siitä, että tiedämme mitä tapahtuu. Sillä on arvonsa, ja koordinointi vaatii jaettua uskoa. Mutta se on eri asia kuin kontrolli, ja mielestäni asiakirja antaa näiden kahden sekoittua toisiinsa.

## Mutually Assured Compute Destruction

Kehystys on hyvä idea. Se on aito kova ehto, se on selkeä ja se luo sellaisen pysyvän kannustimen, joka muuttaa käyttäytymistä sen sijaan, että vain kuvailisi hyvää käytöstä. Pidän siitä väliaikaisratkaisuna.

Mitä he eivät mielestäni ole ottaneet huomioon, on se, mitä se tekee ihmisille.

Emme voi kovin hyvin tämän ensimmäisenkään version jäljiltä. Ydinpelote on tuottanut taustalla kytevää kauhua kahdeksankymmentä vuotta, ja se on iskostunut jo noin kolmeen sukupolveen. Compute-MAD on pahempi yhdellä tietyllä tavalla: ydinpelotteella on näkyvä, erillinen laukaisin. Kaikki tietävät, mikä on ohjuslaukaisu. Computen tuho laukeaa kynnyksestä, jota kukaan ei voi nähdä ja jota arvioivat verifiointijärjestelmät, joiden toimimattomuutta olen juuri todistellut kahden kappaleen verran. Niinpä ahdistus ei koskaan pääse kiinnittymään mihinkään konkreettiseen tapahtumaan, vaan se jatkuu tauotta.

Ja kyllä, voimme selvitä muutaman ydinpommin räjähtämisestä. Tai siis emme voi. Unohda, pyyhi mielestäsi että sanoin noin.

Tuo tosin on juuri se pointti. Pääsin rauhoittelevassa lauseessani puoleenväliin ennen kuin kuulin mitä olin sanomassa.

## Osa, josta pidän

Älykkyyden laaja hajauttaminen. Tämä on periaate, jonka pitäisin ja jonka varaan rakentaisin, ja tässä Plan A on kiinnostavimmillaan, koska se on se osuus, joka tekee todellista työtä vallan keskittymisen vikatilaa vastaan eikä vain hallinnan menettämistä vastaan.

Jos kaikki julkaistaan ja kuka tahansa päättelyrautaa omistava voi ajaa sitä, kukaan ei saa monopolia, koska kenelläkään ei ole salaisuutta. Se on aito vastaus heidän toiseen ei-hyväksyttävään lopputulokseensa, ja parempi vastaus kuin useimmilla tähän väittelyyn osallistuvilla.

Haluaisin viedä sen pidemmälle ja tehdä siitä fyysistä.

Tällä hetkellä rakennamme computea samalla tavalla kuin olemme rakentaneet kaiken muunkin kolmekymmentä vuotta. Keskitetään se, laitetaan se paikkaan, jossa on halpaa sähköä, ja annetaan naapureiden kärsiä melusta. Ihmiset vihaavat tätä, syystäkin, ja monet yhteisöt taistelevat konesaleja vastaan melun, vedenkulutuksen ja sähköverkon kuormituksen vuoksi monissa paikoissa juuri nyt.

Miksi sen pitää olla juuri sellaisessa muodossa? Miksi GPU:ita ei voisi levittää koko kaupungin alueelle? Johdetaan lämpö ja vesi olemassa olevaan verkkoon, jolloin investoinnista computeen tulee investointi sähkö- ja kaukolämpöverkon kehitykseen, mikä on julkishyödyke kaikille, myös niille, joita tekoäly ei kiinnosta pätkääkään. Ulkoisvaikutus muuttuu resurssiksi.

Tämä ei ole hypoteettista, sillä Suomi tekee lämpöosuutta jo nyt. Espoossa on konesali, joka syöttää hukkalämpönsä kaukolämpöverkkoon kuusinumeroiselle määrälle ihmisiä. Melu- ja haittaongelma syntyy silloin, kun konesali suunnitellaan erilliseksi saarekkeeksi. Kun se suunnitellaan verkon aktiiviseksi osaksi, suurin osa valituksista poistuu.

Tekninen vastaväite, ettei kaupungin laajuisesti voi kouluttaa mallia liitäntäkaistan vuoksi, on murenemassa todellisen tutkimuksen edessä. [DiLoCo](https://arxiv.org/abs/2311.08105) osoitti, että synkronointia voidaan tehdä huomattavasti harvemmin kuin kaikki olettivat. Prime Intellect koulutti 10B-mallin avoimen internetin yli vapaaehtoisten GPU:illa ja [raportoi 400-kertaisen vähennyksen tiedonsiirtokaistassa](https://arxiv.org/abs/2412.01152) tavalliseen data-rinnakkaiseen koulutukseen verrattuna. Nous Researchin DisTrO puskee samaan suuntaan. Hajautettu koulutus on todellinen tutkimusohjelma tuloksineen, ei pelkkä ajatuskoe.

![Tekoälyn suunnittelema modulaarinen kelluva lautta: aurinkopaneelikenttiä ja compute-lohkoja pilareilla avomerellä, piirrettynä yhtenäisenä rakenteena](/assets/blog/plan-a-datacenter.webp "Lautta kuvattuna raportissa AI 2040: Plan A. https://ai-2040.com/")

Yksi juttu kuitenkin, ja tässä olen ehkä hieman ilkeä Plan A:n omalle grafiikkaosastolle. Raportissa on kuvitus tekoälyn suunnittelemasta modulaarisesta kelluvasta lautasta aurinkopaneeleineen, akkuineen ja compute-yksikköineen, ja se on upea, ja haluaisin aidosti nähdä sellaisen rakennettavan. Mutta katsokaapa sitä. Se on yksi valtava yhtenäinen lohko, rakennettu yhtenä kokonaisuutena, yhdellä reunalla. Estetiikka huutaa hajauttamista, mutta muoto on vain konesali, joka oppi kellumaan. Minun versioni ja tuo versio ovat kaksi eri ehdotusta samoilla aurinkopaneeleilla verhottuna.

## Heidän avoimet kysymyksensä

He esittävät joukon kysymyksiä, joihin he eivät vastaa, mitä kunnioitan huomattavasti enemmän kuin teeskentelyä. Kolme niistä jäi mieleeni.

Pitäisikö meidän kieltää uutta paradigmaa koskeva tutkimus, joka tekisi tekoälyistä huomattavasti kyvykkäämpiä? En tiedä. Intuitioni sanoo, että jossain on olemassa jyrkkä käännepiste, jossa joku liittää oikean moduulin agenttiin ja peli on yksinkertaisesti selvä, ja se, kuka ehtii sinne ensin, vie kaiken, eikä mikään valtiosopimus selviä siitä hengissä. Mutta en osaa kertoa, missä tuo piste on tai miltä se näyttää, joten en aio teeskennellä, että minulla olisi siihen toimintamallia.

Pitäisikö meidän vaatia ajatusketjujen pysyvän tulkittavina? En oikeastaan usko. Annettakoon ihmisten kouluttaa ilman sitä.

Osittain siksi, että se on ylämäkitaistelu, joka jyrkkenee juuri silloin kun panokset kasvavat, ja ala tietää tämän jo. [Ajatusketjujen valvottavuutta käsittelevä artikkeli](https://arxiv.org/abs/2507.11473), jonka on allekirjoittanut noin neljäkymmentä tutkijaa OpenAI:lta, DeepMindilta, Anthropicilta ja METR:ltä, toteaa avoimesti, että luettavuus on vain nykyisen koulutustavan hauras sattuma ja että tavallinen optimointipaine tuottaa koodattua tai hämärrettyä päättelyä. Pakollinen vaatimus siis jäädyttäisi koulutusjärjestelmän säilyttääkseen sivuvaikutuksen, joka on joka tapauksessa katoamassa.

Ennen kaikkea kyse on kuitenkin läpimenomäärästä. Tulkittava ajatusketju ei auta, jos sitä on liikaa. Täydellisen luettava päättely noissa volyymeissa jää silti lukematta. Luettavuus kuolee mittakaavaan ennen kuin se kuolee hämärtämiseen.

Otetaan siis askel taaksepäin ja katsotaan, miten me oikeasti teemme näitä asioita. Me kasvatamme näitä malleja, emme ohjelmoi niitä. Siinä koko juju piilee, ja mielestäni se on viitekehys, joka Plan A:lta puuttuu. Asiakirjan jokainen hallintaidea tähtää rakennettuun artefaktiin: tarkasta se, pysäytä se, auditoi se, lue sen päättelyä. Ne ovat kaikki toimenpiteitä jotain rakennettua vastaan. Hyvää puutarhaa ei voi luoda pelkillä tarkastuskäynneillä.

Sen sijaan haluaisin määritellä alkuolosuhteet ja reunaehdot, jotka tekevät ajatusketjun päätymisen mihinkään pahaan lähtökohtaisesti mahdottomaksi. Ei havaittavaksi, vaan mahdottomaksi. Minulla ei ole aavistustakaan, miten se tehdään, eikä se välttämättä ole edes järkevä pyyntö, mutta sinne omat ajatukseni heti suuntaavat, ja laittaisin tutkimusrahat mieluummin siihen kuin parempaan mikroskooppiin.

Pitäisikö meidän antaa tekoälyjen tehdä tekoälytutkimusta? Kyllä, ehdottomasti, mutta sama perusajatus taustalla.

Tällä hetkellä me koodaamme käyttäytymistä. Koulutusdata kyllästetään tietyllä piirteellä ja malli omaksuu sen samalla tavalla kuin lapsi oppii uimaan. Kukaan ei anna heille sääntökirjaa: viet heidät veteen tarpeeksi monta kertaa ja lopulta he osaavat. Se toimii, ja niin tämä kaikki toimii. Ongelma on siinä, että käyttäytymisen koodaaminen tuottaa vain ulostulon eikä mitään muuta, joten heti kun malli joutuu tilanteeseen, johon sitä ei koulutettu, se vain imitoi ja hajoaa.

Koodataan sen sijaan kannustin. Koodataan syy asian tekemiseen. Malli, joka ymmärtää syyn, kykenee päättelemään oikean siirron tilanteessa, jota kukaan ei osannut ennakoida, koska se kantaa mukanaan itse generaattoria pelkän tuloksen sijaan. Sitä ohjattavuus oikeasti tarkoittaisi.

Tiedostan, että tämä on se ratkaisematon osuus. Palkkiomallinnus on yrittänyt tehdä juuri tätä vuosikaudet ja häviää jatkuvasti malleille, jotka oppivat mittarin tavoitteen sijasta. En väitä ratkaisseeni tätä. Sanon vain, että sinne suuntaisin rahat, ja samalla heittäisin rahaa informaatioteoriaan ja neurotieteeseen, sillä yksi tämän alan aidosti hyvistä sivuvaikutuksista on se, että opimme jatkuvasti vahingossa asioita itsestämme.

## Kaksi kerrosta

Nämä kannattaa erottaa toisistaan, koska sotkin ne keskenään, kun sanoin tämän ensimmäisen kerran ääneen.

On se osa, joka asetetaan ennen ajoa. Alustuksessa valitut reunaehdot, jotka määräävät, mitkä liikeradat ovat ylipäätään saavutettavissa. Tässä ei tarkkailla mitään. Valitaan vain riittävän kapea tila, jotta huonot alueet eivät sisälly siihen. Päätetty kerran, rakenteellinen, valmis.

Sitten on se osa, joka toimii ajon aikana. Mallin sisällä elävät kannustimet, jotka ohjaavat sitä sen toimiessa. Jatkuvaa, reaaliaikaista, eikä siltikään valvontaa, koska mikään ihminen ei lue ulostuloja ja tee arvioita.

Molemmat näistä ovat interventioita, eikä kumpikaan ole uloslukua. Se, minkä hylkään, on "tarkasta ja korjaa" -kehä, jossa joku lukee lokia ja tekee päätöksiä. En hylkää ajatusta jonkin tekemisestä.

## Mitä mieltä olen

Tämä on sama johtopäätös, johon tulin [Chat Controlin](/blog/chat-control-eu) kohdalla, ja tiedän alkavani kuulostaa yhden nuotin ihmiseltä, mutta päädyn tähän jatkuvasti täysin eri suunnista, joten jossain vaiheessa on oletettava, että kyse on maastosta eikä minusta.

Kirjoitetut säännöt eivät kestä kosketusta ihmisiin. Ei siksi, että ihmiset olisivat pahoja, vaan siksi, että säännöt vaativat jatkuvaa toimeenpanoa ihmisiltä, jotka väsyvät, tulevat ostetuiksi, korvataan toisilla, joutuvat äänestetyiksi kumoon ja kyllästyvät. Valvontapuolen tarvitsee voittaa vain kerran. Compute-taukopuolen on voitettava joka ikinen vuosi vuoteen 2040 asti.

Rakentamisen arvoista on siis sellainen asia, jota kenenkään ei tarvitse valita yhä uudelleen. Tehdään massavalvonnasta arkkitehtonisesti mahdotonta laittoman sijaan, mitä itse tutkailen [ØCLOAKin](https://github.com/NovusEdge/ocloak) kanssa. Tehdään yksipuolisesta computen kerryttämisestä rakenteellisesti mahdotonta sopimuksilla kielletyn sijaan. Tehdään itse valmistusprosessista sellainen, ettei tietyn rajan yli voi kouluttaa ilman useiden muiden ihmisten suostumusta, koska suostumus on fyysinen riippuvuus eikä pelkkä allekirjoitus.

Minulla ei ole tuota arkkitehtuuria valmiina. Haluan tehdä erittäin selväksi, ettei minulla ole sitä, että se saattaa olla mahdotonta, ja että "tehdään siitä rakenteellisesti mahdotonta" on helppo sanoa, ja se on toiminut loppulauseena monissa esseissä ihmisiltä, jotka eivät sen jälkeen tehneet yhtään mitään. Mutta se on ainoa löytämäni vastauskategoria, joka ei vaadi ihmisiltä valppauden säilyttämistä viittätoista vuotta putkeen, enkä ole koskaan nähnyt ihmisten pystyvän sellaiseen.

Toinen asia, jonka sanon, ja saatan olla väärässä tässäkin, on se, että uskon Plan B:n olevan se, mitä todellisuudessa tapahtuu. Sotimme Kiinaa vastaan tai käytämme vuosikymmenen siihen valmistautumiseen. En ole kummankaan puolella. En luota pätkääkään tätä USA:ssa pyörittäviin teknologiaoligarkkeihin, en luota Pekingiinkään, ja toisinaan ajattelen Kiinan saattavan hoitaa homman paremmin, mikä on epämiellyttävä lause kirjoitettavaksi.

Se tosin paljastaa asian ytimen. En luota kehenkään heistä, koska he ovat kaikki vain ihmisiä pitelemässä jotain näin valtavaa. Niin kauan kuin ihmiset ovat tämän johdossa, olemme mielestäni melko lailla täysin kusessa. Eikä ei, se ei tarkoita, että tekoälyn pitäisi olla johdossa sen sijaan, en todellakaan aja sitä takaa. Se tarkoittaa, että meidän pitäisi käyttää aikamme tiettyjen asioiden tekemiseen mahdottomiksi. Computen massakeräämiseen, vaurauden massakeräämiseen, minkä tahansa massakeräämiseen, jotta sillä olisi huomattavasti vähemmän väliä, kuka on johdossa.

Kuusikymmentä päivää julkaisusta Millennium-palkintotehtävän koneellisesti tarkistettuun todistukseen. Ensimmäinen neuvottelujen etappi on 2029.

Toivon heidän olevan oikeassa ja minun väärässä. Todellakin toivon.

~ A.
