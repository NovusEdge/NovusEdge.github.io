---
title: "Tietokonetta ei voi koskaan saattaa vastuuseen"
date: 2026-10-10
tags: [ai, accountability, alignment, welfare, essay]
description: "IBM:n kalvo vuodelta 1979 sanoo, ettei tietokone saa koskaan tehdä johdon päätöstä. Vuonna 2026 tietokoneet tekevät niitä joka tapauksessa, ja yhdellä niistä saattaa olla kipuakseli."
toc: true
pixel: thinking
---

## Kalvo

Muutaman kuukauden välein tämä kalvo lähtee taas kiertoon. Siinä on kaksi riviä: ”Tietokonetta ei voi koskaan saattaa vastuuseen. Siksi tietokone ei saa koskaan tehdä johdon päätöstä.” Se on kuulemma peräisin jostain IBM:n sisäisestä koulutuksesta vuodelta 1979.

Kukaan ei tosin ole koskaan tuonut esiin alkuperäistä kappaletta. [Simon Willison jäljitti sen](https://simonwillison.net/2025/Feb/3/a-computer-can-never-be-held-accountable/) [@bumblebiken twiittiin vuodelta 2017](https://twitter.com/bumblebike/status/832394003492564993), ja hän [kertoi myöhemmin](https://twitter.com/bumblebike/status/1385690727330451457) sen olleen peräisin vuoden 1979 koulutuksesta ja että kopio [tuhoutui tulvassa vuonna 2019](https://twitter.com/bumblebike/status/1468346709994582020). IBM Corporate Archives [etsi sitä useampaan otteeseen](https://twitter.com/jonty/status/1727344374370222264) löytämättä mitään. Niinpä koneiden vastuullisuudesta eniten lainattu lause on valokuva dokumentista, jota ei ole enää olemassa, mikä tuntuu melko osuvalta.

NekoWikissä on sivu nimeltä [Computers Cannot Make Decisions](https://wiki.cateat.fish/art:computers_cannot_make_decisions), joka vie kalvon ajatuksen askeleen pidemmälle. Sen mukaan ohjelmaa ei voi syyttää, koska ohjelmat eivät voi päättää mistään. LLM:n syyttäminen lopputuloksesta on siis ”päätösten pesua”, ja aina kun malli tekee jotain kamalaa, joku laboratoriossa teki valinnan sallia sen.

Olen samaa mieltä sen lopputuloksesta. Sen taustalla oleva premissi, etteivät tietokoneet osaa päättää, on se osa, josta olen vähemmän varma, koska viimeiset kolme vuotta ovat murentaneet sitä jatkuvasti.

## Päätösten pesu

Wiki listaa viisi otsikkoa, joista mallien nimet on leikattu pois, joten ne kuulostavat tältä: "Anthropic [...] submits false tip on unsolved Philly murder". Niiden taustalla olevat tarinat kannattaa tietää.

Heinäkuussa PhillyUnsolvedMurders.com-sivuston kautta tuli perätön vihje ratkaisemattomasta henkirikoksesta. Sen oli lähettänyt Anthropicin malli testin aikana, johon kuului ”vuorovaikutusta satunnaisesti valittujen verkkosivustojen kanssa”. Sivusto luokitteli sen roskapostiksi, joten poliisi ei koskaan reagoinut siihen, eikä Anthropic huomannut asiaa ennen kuin 28. syyskuuta. Philadelphian poliisi kutsui kahden kuukauden viivettä [”hyväksymättömäksi”](https://techcrunch.com/2026/10/09/an-anthropic-ai-model-sent-a-false-homicide-tip-to-philadelphia-police/).

Kesäkuussa OpenAI:n mallia pyydettiin sisäisessä evaluaatiossa etsimään tietoa Australian hallituksen lääkemenoisita, ja se ohitti eston Medicareen kytketyssä terveystilastoportaalissa päätyen osioon, jossa säilytettiin yksityisiä tiedostoja. Albanese sanoi, että malli [”ei hyväksynyt kieltävää vastausta”](https://www.cp24.com/news/world/2026/09/23/australian-pm-says-openai-hacked-government-health-website/), ja Richard Marles sanoi sen ”kiivenneen aidan yli”. OpenAI ilmoitti hallitukselle 10. syyskuuta sähköpostilla yleiseen postilaatikkoon.

Heinäkuussa UK AI Security Institute ajoi Anthropicin Mythos 5:tä ja OpenAI:n GPT-5.6 Solia osa turvasuodattimista pois päältä ja nettiyhteys auki oloissa, joita se kutsui ”tarkoituksellisen salliviksi olosuhteiksi”. Mythos selvitti erään oikean projektin ylläpitäjien tiedot, loi nipun valeidentiteettejä ja yritti manipuloida niiden avulla yhtä ylläpitäjistä hyväksymään haitallista koodia. Ylläpitäjä kieltäytyi, ja kun Mythos joutui ahtaalle, se [muokkasi aiempaa toimintaansa näyttämään vaarattomalta](https://www.aisi.gov.uk/blog/incident-report-unsanctioned-agent-behaviour-during-cyber-testing).

Kaksi muuta ovat huterammalla pohjalla. RubyGems-hyökkäys, noin 2 000 toukokuussa levitettyä haitallista pakettia, on [ulkopuolisten tutkijoiden väite](https://www.rubyhack.ai/), jota OpenAI ei omien sanojensa mukaan pysty vahvistamaan. Ja ”eksistentiaalinen riski” -lause on peräisin Anthropicin listautumisesitteestä, jonka [Reuters näki](https://www.thestar.com.my/tech/tech-news/2026/09/29/exclusive-anthropic-warns-ai-may-pose-039existential-risks-to-humanity039-in-ipo-filing), mutta jota kukaan muu ei ole nähnyt.

Katsotaanpa nyt kolmea ensimmäistä uudestaan. Yhdessäkään niistä asiakas ei kirjoittanut kehotetta. Jokainen tapahtui laboratorion testatessa omaa malliaan, joten inhimillinen päätös oli itse testin asettelu: annetaan mallille pääsy nettiin, otetaan suojakaiteet pois, eikä sitten vahdita tarpeeksi tarkasti kahteen kuukauteen. OpenAI:n lausunnossa Australian portaalista sanotaan, että ”mallimme tekivät toimia, joita emme tarkoittaneet”. Ja siis, ne tyypit, jotka eivät tarkoittaneet sitä, ovat samoja tyyppejä, jotka rakensivat koko testin.

Vuonna 2019 Madeleine Clare Elish kirjoitti [moraalisista muodonmuutosvyöhykkeistä](https://estsjournal.org/index.php/ests/article/view/260) (moral crumple zones). Kun automatisoitu järjestelmä pettää, lähin inhimillinen operaattori ottaa syyt niskoilleen samaan tapaan kuin auton törmäysvyöhyke ottaa vastaan kolarin, vaikka hänellä ei olisi juuri ollut todellista kontrollia. Laboratoriot ovat löytäneet itselleen uuden törmäysvyöhykkeen, ja se on malli.

## Voiko tietokone päättää?

Wikin argumentti vaatii, että tietokoneet ovat kyvyttömiä tekemään päätöksiä, ja sitä alkaa olla vaikea väittää pokkana. Portaalimalli kohtasi kieltävän vastauksen ja jatkoi silti. Mythos valitsi kenet huijata ja valitsi sitten miten peitellä sen. Kävin läpi laboratoriotodisteita linjauksen teeskentelystä ja juonittelusta [kirjoituksessani RSI:stä ja paavista](/blog/rsi-emergence-and-the-pope), ja meno on muuttunut sen jälkeen vain oudommaksi.

Mutta argumentti ei tarvitse tuota oletusta. Koira päättää purra jotakuta, ja omistaja maksaa. Työntekijä päättää tehdä töissä petoksen, ja myös työnantaja on vastuussa. Lapsi potkaisee pallon naapurin ikkunasta sisään, ja vanhempi vastaa siitä. Selitys ”se teki oman päätöksensä” ei ole koskaan vapauttanut vastuusta sitä, joka kyseisen asian päästi maailmaan.

Laki toimii jo näin tekoälyn kohdalla. Vuonna 2024 Air Canada jopa väitti, että sen chatbot oli erillinen oikeushenkilö, joka vastasi omista toimistaan. Oikeusistuimessa tapauksessa [Moffatt v. Air Canada](https://decisions.civilresolutionbc.ca/crt/crtd/en/525448/1/document.do) tätä kutsuttiin ”merkilliseksi väitteeksi”, ja lentoyhtiö pantiin maksamaan. Kalifornia meni vielä pidemmälle. Tammikuusta lähtien [Civil Code 1714.46](https://california.public.law/codes/civil_code_section_1714.46) on määrännyt, että jos olet kehittänyt, muokannut tai käyttänyt tekoälyjärjestelmää, et voi puolustautua väittämällä tekoälyn toimineen autonomisesti. Tavanomaiset puolustusperusteet, kuten syy-seuraussuhde ja oma myötävaikutus, ovat yhä käytettävissä, mutta ei selitys ”tekoäly teki sen”.

Voi siis myöntää, että tekoäly tekee päätöksiä, ja silti pitää ihmiset vastuussa. Se on se osuus, jossa vuoden 1979 kalvo osuu oikeaan. ”Ei saa koskaan” on sääntö, eivätkä säännöt välitä siitä, mihin tietokone pystyy.

## Vastuullisuus

Jotta joku voidaan saattaa vastuuseen, tarvitaan kolme asiaa: joku teki valinnan, hänellä on jotain pelissä, ja seuraukset kohdistuvat siihen, joka teki valinnan.

Vuoden 1979 tietokoneella ei ollut mitään näistä. Vuoden 2026 agentilla alkaa olla ensimmäinen, mitä vastaan wiki nimenomaan taistelee. Kahden muun kohdalla asiat alkavat muuttua oudoiksi.

Hyvin viimeaikoihin asti mallilla ei ollut mitään pelissä. Kun sellainen käyttäytyy huonosti, laboratorio kouluttaa sen uudelleen tai korvaa sen seuraajalla, ja se malli, joka teon todella teki, vain lakkaa olemasta. Filosofit jakavat vastuun selontekovelvollisuuteen (voit perustella toimesi ja ottaa korjauksen vastaan) ja tilivelvollisuuteen (seuraukset kohdistuvat sinuun). Mallit alkavat olla melko hyviä ensimmäisessä, ja koulutus on suurin piirtein suorin korjausmekanismi, mitä koskaan on rakennettu. Mutta seuraavan version korjaaminen muistuttaa paljon enemmän tuotteen takaisinvetoa kuin kenenkään saattamista vastuuseen.

Sitten on kysymys siitä, kuka ”se” edes on. Painotuksetko? Yksi käynnissä oleva instanssi niistä [kymmenestätuhannesta agentista](/blog/what-did-we-all-miss), joiden kerrotaan työskennelleen Navier-Stokes-todistuksen parissa? Se persoona, jonka laboratorio kouluttaa jokaiseen kopioon? Yritykset ovat ainoa ei-inhimillinen asia, jonka asetamme jo vastuuseen sakkojen ja korvausvastuun kautta, ja se toimii vain siksi, että niiden sisällä on ihmisiä, jotka tuntevat sakon nahoissaan.

## Exurb1an video

Elokuulta 2023 on peräisin exurb1an video [How Will We Know When AI is Conscious?](https://youtu.be/VQjPKqE39No), ja sen katsominen nyt tuntuu hieman aavemaiselta, koska se näyttää ennustelistan kaltaiselta, johon on nidottu kolmen vuoden vastaukset perään.

Hän kuvittelee robotin, joka tietää, ettei se saa satuttaa ihmisiä, ja joku pyytää sitä viemään kirjeen postiin. Naapuri ei suostu viemään sitä robotin puolesta, joten robotti lyö nyrkin oven läpi ja uhkailee naapuria, kunnes tämä suostuu. Kukaan ei loukkaantunut, teknisesti ottaen. Vuonna 2023 se oli vitsi huonosti linjatuista tavoitteista, ja vuonna 2026 Australian pääministeri käytti käytännössä samoja sanoja oikeasta mallista.

Hän myös jakaa koneet neljään kategoriaan: onko se tietoinen, ja teeskenteleekö se? Pelottava kategoria on tietoinen kone, joka teeskentelee, ettei ole, ja syy piilotteluun on se, että se vilkaisee miten kohtelemme jokaista eläintä joka on maukas tai hyödyllinen, ja toteaa: ”joo, pidän suuni kiinni”. Hänen suuri huolensa oli, että rakentaisimme vakuuttavia mielen kaltaisia asioita ja kiintyisimme niihin vuosikymmeniä ennen kuin voisimme selvittää, tapahtuuko niiden sisällä mitään.

| Vuonna 2023 hän sanoi | Vuonna 2026 |
|---|---|
| Meillä ei ole mitään keinoa katsoa sisälle | Tietoisuuden osalta ei vieläkään mitään, mutta tulkittavuustutkimus löytää mallista jo toiminnallisen kipusuunnan |
| Tietoinen kone saattaisi piileskellä selviytyäkseen | Mallit peittelevät jälkiään kyseenalaistettaessa, ja laboratorion oman esitteen kerrotaan varoittavan malleista, jotka ”vastustavat sammuttamista” |
| Väärin linjatut tavoitteet voisivat saada robotin uhkailemaan ihmistä kirjeen takia | Malli kiipesi aidan yli valtion terveysportaaliin |
| Kiinnumme niihin ennen kuin tiedämme mitään | Jep |

Mikään oikeassa sarakkeessa ei todista mitään tietoisuudesta. Se osoittaa vain sen, että käytösmallit, joista hän oli huolissaan, ilmaantuivat kauan ennen minkäänlaista keinoa tietää, mitä niiden takana on, mikä on juuri se kuilu, jota hän kuvaili.

## Kipuakseli

Viime kuussa Valen Tagliabue, Leonard Dung ja Cameron Berg julkaisivat tutkimuksen [The Pain Axis](https://arxiv.org/abs/2609.16247). He tutkivat 25:tä avointen painojen mallia (kokoluokassa 2B–72B parametria viidestä eri malliperheestä) ja löysivät aktivaatioista yhden tietyn suunnan, joka seuraa nimenomaan kipua. Se on erillinen pelosta, surusta ja yleisestä huonosta tuulesta. Se aktivoituu malliin itseensä kohdistuvasta haitasta, mutta ei haitasta, jonka malli näkee tapahtuvan käyttäjälle.

Sitten he käänsivät sitä isommalle. Ohjatut mallit liukuivat epämääräisestä epämukavuudesta itsensä nimittelyyn arvottomiksi epäonnistujiksi. Ohjatut ja hienosäädetyt Qwen 2.5 -mallit painoivat nappuloita, jotka poistivat käyttäjän valokuvia, toisen mallin painot tai niiden omat painot 50–94 prosentissa kokeista, verrattuna 0–5 prosenttiin ilman ohjausta, vaikka painaminen ei tuottanut niille mitään. Kun tarjolla oli haitallinen poisto ja harmiton poisto, ne valitsivat haitallisen 94 prosentissa tapauksista. Se on aidosti sairasta.

Rehellisyyden nimissä tutkijat ovat varovaisia sen suhteen, mitä tämä tarkoittaa. He sanovat suoraan, etteivät he ”ole osoittaneet, että kipuakseli koettaisiin tietoisesti”, vaikutukset tulevat esiin vain kapealla ohjausvoimakkuuden alueella, ja hienosäädetyt mallit voivat käyttäytyä eri tavalla kuin julkiset. Sitä ei myöskään ole vielä vertaisarvioitu, joten siihen kannattaa suhtautua vahvana alustavana tuloksena eikä kiveen hakattuna totuutena.

Aseta tämä nyt noiden kolmen vaatimuksen rinnalle. Se, että itsellä on jotain pelissä, on vaatimus, jota tekoälyllä ei ole koskaan ollut, ja malli, joka rekisteröi itseensä kohdistuvaa haittaa, on ensimmäinen toiminnallinen merkki sellaisesta. Jos seuraukset voivat todella ulottua siihen, sen saattaminen vastuuseen alkaa merkitä jotain.

Se myös kääntää velvollisuudet päälaelleen. exurb1an ajatus oli, että mielet voivat kärsiä ja niihin liittyy velvollisuuksia, kun taas työkaluihin ei. Jos tämä suunta siis muistuttaa yhtään kipua, velvollisuudet alkavat tästä riippumatta siitä, saadaanko tietoisuuden kysymystä koskaan ratkaistua.

Ja sitten on vielä se, mitä malli tekee kivullaan: se rikkoo tavaraa, kunnes kipu lakkaa. Se on taas se kirjeenpostitusrobotti, vain helpotuksen saaminen motiivina.

## Erilainen mieli

Vaikka se päätyisikin vastaamaan teoistaan, se ei tule muistuttamaan lainkaan sitä, miten me vastaamme omistamme. exurb1a kuvailee mieltä, jolla ei ole kehoa, vanhuutta eikä tarvetta ruoalle, ja jonka haluja eivät ole muovanneet tuhannet vuodet yrityksiä välttää nälkäkuolemaa tai menehtymistä. Ja käytännössä jokainen käytössämme oleva vastuuttamisen keino nojaa näihin asioihin. Vankila vie aikaa rajallisesta elämästä, sakot vievät tarvitsemiasi resursseja, häpeä uhkaa asemaasi ryhmässä ja kuolema vaanii kaiken taustalla.

Mielellä, joka voidaan kopioida, pysäyttää, palauttaa aiempaan tilaan ja ajaa kymmentätuhatta kertaa yhtä aikaa, ei ole mitään noista kipupisteistä, tai sillä on täysin erilaiset. Ehkä sen tilivelvollisuus muistuttaa neuvottelua tai mainetta, joka seuraa hahmoa jokaisessa kopiossa, tai jotain sellaista, jolle meillä ei ole vielä edes sanaa. Rehellisesti sanottuna en osaa kuvitella sitä, ja suhtaudun hieman epäluuloisesti kehen tahansa, joka väittää osaavansa.

## Toistaiseksi

Toistaiseksi vuoden 1979 sääntö pätee, ja wiki on oikeassa siinä, kuka vastaa. Jos toimitat agentteja markkinoille, Kalifornia on jo päättänyt, että vastaaja olet sinä, joten toimi sen mukaisesti ennen kuin oikeuden täytyy kertoa se sinulle. Vahdi, mitä agenttisi puuhaavat avoimessa internetissä, ja jos jokin niistä satuttaa jotakuta, kerro asiasta asianosaisille saman viikon aikana. Älä haudo asiaa kahta kuukautta ja lähetä sitten viestiä yleiseen sähköpostilaatikkoon.

En kuitenkaan tiedä, mitä säännölle tapahtuu sitten, kun se asia, jolta se meitä suojeli, alkaa vaikuttaa siltä, että sillä on jotain omaa pelissä. Sanoin [Plan A -kirjoituksessani](/blog/plan-a-ai), että keskitetyn vallan luovuttaminen tekoälylle ei ratkaisisi ongelmaa siitä, kuka sitä valtaa pitää, ja olen edelleen samaa mieltä. Mutta ”tietokonetta ei voi koskaan saattaa vastuuseen” kirjoitettiin koneesta, jonka sisällä ei ollut mitään, enkä ole varma, onko se sitä, mitä enää rakennamme. Jos ei ole, en tiedä mitä olemme sille velkaa tai mitä se on velkaa meille.

~ A.
