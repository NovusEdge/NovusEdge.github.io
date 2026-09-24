---
title: "Puhutaanpa EU:n Chat Control -asetuksesta"
date: 2026-07-14
tags: [privacy, surveillance, eu, encryption, p2p, essay]
description: "Miksi Chat Control häiritsee minua, miten muut valvonnan muodot liittyvät siihen ja millaisia yksityisyystyökaluja toivoisin ihmisten rakentavan."
toc: true
---

## 314 > 276, mutta kukapa näitä laskisi

Euroopan parlamentti [äänesti Chat Control 1.0:n jatkamisesta](https://andreafortuna.org/2026/07/10/chatcontrol-survives/) 9. heinäkuuta 2026. Alustavassa äänestyksessä 314 meppiä kannatti neuvoston kannan hylkäämistä ja 276 vastusti hylkäämistä. Se ei silti ylittänyt vaadittua kynnystä.

Toisessa käsittelyssä hylkäämiseen vaaditaan parlamentin jäsenten ehdoton enemmistö: 361 ääntä. Äänestäneiden enemmistö ei riittänyt. [Parlamentin seloste äänestyksestä](https://www.europarl.europa.eu/news/en/press-room/20260706IPR46318) avaa tätä eroa. Ymmärrän säännön, mutta lopputulos turhauttaa silti.

Tämä äänestys koski väliaikaista järjestelyä, joka sallii vapaaehtoisen skannauksen. Ehdotettu pysyvä asetus, jota yleensä kutsutaan nimellä Chat Control 2.0, on erillinen neuvottelu. Välitän molemmista, ja erityisesti kaikista ehdotuksista, jotka vaatisivat yksityisviestien tarkastamista.

## Kyse ei ole vain yksityisviesteistäsi

Chat Control on vain yksi monista tavoista, joilla yksityinen toiminta päätyy instituutioiden saataville. Törmään jatkuvasti muihin tapoihin työskennellessäni yksityisyyteen keskittyvän laitteiston parissa. Niillä on erilaisia kykyjä ja rajoitteita, mutta yhdessä ne vaikuttavat siihen, minne ihminen voi mennä ja mitä tehdä jättämättä jälkeensä haettavissa olevaa merkintää.

### Mitä sanot

Client-side scanning tarkastaa sisällön laitteessa ennen salausta tai salauksen purkamisen jälkeen. Päästä päähän -salaus suojaa viestiä siirron aikana, mutta se ei estä kummankaan päätepisteen ohjelmistoa tutkimasta selväkielistä tekstiä.

Pelkkä verkon vaihtaminen ei ratkaise tätä ongelmaa. Sovellus voi käyttää hajautettua verkkoa ja silti skannata viestin ennen sen lähettämistä. Haluan käyttäjien hallitsevan asiakasohjelmaa sen lisäksi, että heillä on suoja salakuuntelua vastaan.

### Missä nukut

[802.11bf](https://www.ieee802.org/11/Reports/tgbf_update.htm) standardoi WiFi-aistinnan (WiFi sensing). IEEE [julkaisi sen syyskuussa 2025](https://www.ieee802.org/11/email/stds-802-11/msg09024.html). Tutkimusjärjestelmät pystyvät päättelemään liikettä ja tietyissä olosuhteissa jopa hengitystä tai kehon asentoa radiosignaalien muutoksista. Nämä ominaisuudet riippuvat laitteistosta, sijoittelusta, ympäristöstä ja mallista. Standardin julkaisu ei tarkoita, että jokainen reititin saisi tämän kaiken automaattisesti käyttöönsä.

[Carnegie Mellonin asennonmallinnustyö](https://www.spatialintelligence.ai/p/your-wifi-can-see-you-heres-how) ja [Gamgeen](https://newatlas.com/around-the-home/gamgee-wifi-home-security-system/) kaltaiset kuluttajajärjestelmät ovat esimerkkejä, jotka kannattaa erottaa toisistaan. Tutkimusdemonstraatio ja kodin liiketunnistin eivät välttämättä mittaa samaa asiaa. Esimerkiksi Vodafonen [Who's Home](https://www.vodafone.co.uk/help/account/how-do-i-use-whos-home) seuraa vain laitteiden liittymistä kodin WiFiin. Se ei ole todiste seinien läpi aistimisesta.

Tunnen myös Aallossa tutkijan, joka kehittää ML-pohjaista WiFi-aistinnan tunnistinta armeijalle. Se on osa syytä, miksi seuraan tätä aluetta jatkuvasti.

Muut laitteet keräävät tietoa suoremmin. Automaattisella sisällöntunnistuksella varustettu televisio tunnistaa, mitä ruudulla pyörii. Sovellukset voivat kerätä sijaintitietoa, ja radio- tai äänimajakoilla voidaan yhdistää laitteita toisiinsa. Kaiutin, joka kuuntelee herätyssanaa paikallisesti, ei ole sama asia kuin huoneen keskustelujen jatkuva lähettäminen verkkoon. Olennaisia kysymyksiä ovatkin: mitä kerätään, minne se menee ja kuka pääsee siihen käsiksi?

### Minne menet

[Flock Safetyn rekisterikilpikameraverkosto](https://www.aclu.org/campaigns-initiatives/get-the-flock-out) tekee ajoneuvohavainnoista haettavia eri sijaintien välillä. Olen huolissani siitä, että arkisista matkoista syntyy merkintöjä, joista voidaan myöhemmin tehdä hakuja tarkoituksiin, joista kuljettaja ei ole koskaan kuullutkaan.

![The Invasion of Flock Cameras](https://youtu.be/A3cMU55dIIc?si=8BPTtjEkvlUURSpG)

Puhelin voi kerryttää lisää tietoja sijaintioikeudella varustettujen sovellusten, kuntoiluseurannan ja paikkamerkittyjen kuvien kautta. Niiden yksityisyysominaisuudet eroavat toisistaan, mutta tietojen yhdistäminen voi paljastaa paljon enemmän kuin yksittäinen lupapyyntö antaa ymmärtää.

Vastustustakin löytyy. Selvitys [Flock-kameroihin kohdistuvista rajoituksista](https://mrsc.org/stay-informed/mrsc-insight/april-2026/restrictions-flock-cameras) raportoi 82 irtisanotusta sopimuksesta 28 osavaltiossa vuoden 2021 ja toukokuun 2026 välisenä aikana, joista 39 tehtiin vuoden 2026 ensimmäisen viiden kuukauden aikana. Toivon näiden taisteluiden onnistuvan. Haluan myös keräämiselle ja säilyttämiselle rajoituksia, jotka pätevät vielä silloin, kun seuraava toimittaja astuu kuvioihin.

### Mitä ajattelet

Aivo-tietokoneliitännät herättävät spekulatiivisemman huolenaiheen. Uutisoinnit Metan [Brain2Qwerty v2](https://www.marktechpost.com/2026/06/30/meta-ai-releases-brain2qwerty-v2-a-non-invasive-meg-brain-to-text-pipeline-decoding-typed-sentences-at-61-word-accuracy/) -mallista kuvaavat kirjoitettujen lauseiden purkamista MEG-mittauksista. [TRIBE v2](https://ai.meta.com/blog/tribe-v2-brain-predictive-foundation-model/) puolestaan ennustaa aivojen reaktioita ärsykkeisiin. Kumpikaan tulos ei tarkoita satunnaisten ajatusten lukemista etänä.

Ihmisen auttaminen kommunikoimaan aivoliitännän avulla on arvokas käyttökohde. Haluan silti tietää, kuka hallitsee tallenteita ja voiko pääsystä niihin tulla ehto työllistymiselle, hoidolle tai tuotteen käytölle.

Myös MEG-laitteistolla on väliä: kalliit laitteet suojatussa huoneessa ovat kaukana kuluttajille tarkoitetuista puettavista laitteista. En tiedä, tuleeko näistä nimenomaisista ominaisuuksista koskaan kannettavia tai halpoja, saati millä aikataululla. Huoleni koskee sitä, miten suostumusta ja hallintaa käsitellään teknologian kehittyessä.

## Toimijuus ja sen menettäminen

Useimmat ihmiset kohtaavat tiedonkeruun pienten päätösten kautta: hyväksy lupa, ota hyödyllinen ominaisuus käyttöön, hyväksy oletusasetus, jotta pääsee jatkamaan jotain muuta.

Kertynyttä kokonaiskuvaa on vaikeampi hahmottaa. Ihminen saattaa ymmärtää, miksi karttasovellus tarvitsee sijainnin, hyväksymättä silti sitä, että datanvälittäjä myy hänen liikkumishistoriaansa eteenpäin. Suostumus yhteen käyttötarkoitukseen ei saisi vaivihkaa muuttua luvaksi mihin tahansa myöhempään käyttöön.

En usko, että jokaisen riskin selittäminen entistä kovemmalla äänellä ratkaisee asiaa. Ihmisillä on työ, perhe ja muuta ajateltavaa. Yksityisyystyökalujen on toimittava ilman jatkuvaa vaivannäköä.

## Heidän tarvitsee voittaa vain kerran

Kirjoita mepillesi, organisoidu ja tue [EFF:n](https://www.eff.org/deeplinks/2025/12/after-years-controversy-eus-chat-control-nears-its-final-hurdle-what-know) kaltaisia järjestöjä. Nämä toimet voivat pysäyttää lakiesityksiä ja asettaa rajoja instituutioiden toiminnalle.

Minua huolettaa se, kuinka paljon jatkuvaa työtä se vaatii. Kaadettu lakiesitys voi palata, hallitus voi vaihtua ja yritys voi muuttaa käyttöehtojaan. Haluan teknisiä suojia, jotka pysyvät hyödyllisinä näiden muutosten läpi.

Tavoitteeni on tehdä tietyistä massavalvonnan muodoista arkkitehtonisesti mahdottomia: palveluntarjoaja ei esimerkiksi voi luovuttaa selkokielistä dataa, jota sillä ei koskaan ollutkaan. Se ei estä jokaista päätelaitteeseen kohdistuvaa hyökkäystä tai kaikkea metadatan keräämistä. Se kuitenkin poistaa yhden väylän, johon pääsyä voitaisiin muuten vaatia pakolla.

Päästä päähän -salaus, asiakasohjelmat joita ihmiset voivat tarkastaa ja hallita, sekä tiedonkeruun vähentäminen auttavat kaikki. Hajauttaminen voi poistaa keskitettyjä pääsypisteitä, vaikka se tuokin mukanaan suunnittelu- ja käytettävyysongelmia. Avoin lähdekoodi tekee tarkastamisesta mahdollista, mutta jonkun on silti tehtävä se tarkastus.

Meillä on toimivia projekteja, joista ottaa oppia, kuten Signal, Tor, [Briar](https://briarproject.org/), [Session](https://getsession.org/) ja [SimpleX](https://simplex.chat/). Ihmisten saaminen käyttämään niitä säännöllisesti on toinen osa työtä.

## Helppokäyttöisyys voittaa aina

En halua, että yksityisyyden vaaliminen vaatii toisen harrastuksen ylläpitämistä. Jos pikaviestintä on vaikea asentaa, viestit eivät kulje luotettavasti tai yksikään kaveri ei käytä sitä, kryptografia ei tee siitä sinulle hyödyllistä.

Oletusasetuksilla saadaan paljon aikaan. Signal ja WhatsApp antavat ihmisten lähettää salattuja viestejä ilman, että heidän tarvitsee hallita avaimia jokaista keskustelua varten. Suojaus on osa tavanomaista toimintaa.

Tällaista käyttökokemusta haluan olla rakentamassa. Ihmisen pitäisi voida valita yksityisyyttä kunnioittava työkalu siksi, että se hoitaa hommansa hyvin, ilman että joutuu sietämään huonompaa versiota kaikesta siitä, mihin on jo tottunut.

## Toinen puoli: Kaivon myrkyttäminen

Olen kiinnostunut myös siitä, voisimmeko tehdä kerätystä datasta vähemmän hyödyllistä. Syöttihaut, -sijainnit tai -laitesignaalit voisivat häiritä profilointia, jos tiedonkerääjä ei pysty helposti ja edullisesti erottamaan niitä todellisesta toiminnasta.

Tuo ehto on hankala. WWW'25 -julkaisu [”Breaking the Shield”](https://dl.acm.org/doi/10.1145/3696410.3714713) hyökkää sormenjälkien satunnaistamista vastaan 18 lisäosassa ja viidessä selaimessa. Erottuva satunnaistaja voi itsessään auttaa tunnistamaan käyttäjänsä.

Aiempi [tutkimus oikeiden hakujen erottamisesta TrackMeNot-syöteistä](https://link.springer.com/chapter/10.1007/978-3-642-14527-8_2) nostaa esiin saman ongelman. Kohinan lisääminen ei vielä takaa, että vastapuoli hämääntyisi siitä.

[HARPO](https://arxiv.org/pdf/2111.05792) käyttää vahvistusoppimista hämärtämiseen (obfuscation) ja raportoi paremmasta tehokkuudesta kuin sen verrokit. Haluaisin tietää, miten tuo hyöty säilyy kerääjän mukautuessa. Käyttäjien saaminen näyttämään samanlaisilta, kuten Tor Browser yrittää tehdä, on toinen lähestymistapa omien käytettävyysrajoitteidensa kera.

Olen [kehittämässä ØCLOAKia](https://github.com/NovusEdge/ocloak) tällä alueella. Hypoteesina on, että johdonmukaiset, oikein ajoitetut syötit ja havainnointiolosuhteiden muuttaminen voisivat tehdä tiedonkeruusta kalliimpaa tai vähemmän luotettavaa. Se, toimiiko tämä järkevillä kustannuksilla, on vielä mitattava.

## Suuntia, ei vastauksia

Muutamat käytännön valinnat vaikuttavat tavoittelemisen arvoisilta.

Pidetään salaus ja tiedonkeruun rajoitukset osana normaalia käyttökokemusta. Yksityisyysasetus, jota suurin osa ihmisistä ei koskaan löydä, ei suojaa heitä. Signalin keskitetyt välityspalvelimet osoittavat myös, miksi verkon topologia ja pääsy viestien sisältöön on tarkasteltava erillään toisistaan.

Autetaan ihmisiä tuomaan kontaktinsa mukanaan. Federaatio ja sillat (bridges) voivat auttaa käyttöönotossa, mutta silta muuttaa myös sitä, kuka pääsee viestiin käsiksi. Tämän täytyy olla selvää sitä käyttävälle henkilölle.

Suhtaudutaan asennukseen, viestien perillemenoon, palautukseen ja saavutettavuuteen osana yksityisyystyötä. PGP:n vaikeaselkoisuus on hyvä varoitus: vahvinkin mekanismi voi pettää ihmiset, jos he eivät pysty käyttämään sitä luotettavasti.

[Veilidin](https://veilid.com/) ja [Meshtasticin](https://meshtastic.org/) kaltaiset projektit tutkivat muita tapoja viestiä. Pieni radio-mesh-verkko voi olla kätevä paikalliseen tai verkon ulkopuoliseen (off-grid) koordinointiin ilman, että sen tarvitsee korvata mobiiliverkkoa. Haluan lisää tällaisia kokeiluja, arvioituina niissä tilanteissa, joita ne todella tukevat.

## Mistä tässä pelataan

Minua häiritsee valtaepäsuhta ihmisen ja sellaisen instituution välillä, jolla on vuosien edestä tietoja hänestä. Ihminen ei välttämättä tiedä tietojen olemassaolosta, ei pysty korjaamaan niitä eikä kenties koskaan saa tietää, että ne vaikuttivat häntä koskevaan päätökseen.

Tämä voi muuttaa käyttäytymistä jo ennen kuin kukaan käyttää suoraa pakkoa. Ihmiset välttelevät tiettyjä keskusteluja, yhteyksiä tai paikkoja, kun he olettavat näiden valintojen tulevan kirjatuksi ja myöhemmin arvioiduksi. Haluan tilaa elää ilman, että minun täytyy perustella jokaista arkista tekoani tietokannalle, jota en voi tarkastella.

## Loppusanat

Omassa työssäni kysymykset ovat melko konkreettisia: mitä tietoa järjestelmä tarvitsee, kuinka kauan se säilyttää sitä ja mitä palveluntarjoaja tai hyökkääjä voi siitä oppia? Haluan poistaa turhan tiedonkeruun ennen kuin yritän suojata laajempaa arkistoa.

Yksityisyyttä kunnioittavien työkalujen käyttö ja digioikeusjärjestöjen tukeminen auttavat molemmat. Samoin se, että näistä työkaluista tehdään tarpeeksi helppokäyttöisiä, jotta kaveritkin pitävät ne asennettuina.

Minulla ei ole valmista arkkitehtuuria, joka tekisi kaikesta valvonnasta mahdotonta. Haluan keskittyä niihin osiin, jotka voimme estää, ja mitata, toimivatko kokeellisemmat suojamekanismit toivotulla tavalla.

~ A.
