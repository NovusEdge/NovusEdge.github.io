---
title: "Kaksi Millennium-ongelmaa yhdessä päivässä (luultavasti)"
date: 2026-11-21
tags: [ai, math, lean, commentary]
description: "Marraskuun 20. päivänä julkaistiin tekoälyavusteiset todistukset sekä Riemannin hypoteesille että Navierin–Stokesin blowupille, vain kolme viikkoa sen jälkeen kun kaksi eri labraa mursi toisistaan riippumattomasti eksponentiaalisen aikahypoteesin. Katsaus tekoälymatematiikan viime kuukausiin ja siihen, mitä on oikeasti tarkistettu."
toc: true
pixel: thinking
---

## Perjantai

Terry Tao julkaisi 20. marraskuuta [blogipostauksen](https://terrytao.wordpress.com/2026/11/20/unforced-euler-singularity-unforced-navier-stokes-singularity-and-the-generalized-riemann-hypothesis/), jonka otsikko kuulostaa listalta asioista, joiden ei pitänyt tapahtua minun elinaikanani: "Unforced Euler singularity, unforced Navier-Stokes singularity, and the Generalized Riemann Hypothesis". Kaikki kolme tulivat julki samana päivänä, kaikki kolme tehtiin vahvasti tekoälyä hyödyntäen, ja yksi nimi löytyy niistä jokaisesta: Levent Alpöge, lukuteoreetikko Anthropicolla.

Kaksi noista on Clay-instituutin Millennium-palkinto-ongelmia. Niitä on seitsemän, kunkin ratkaisemisesta saa miljoona dollaria, ja 26 vuoden aikana niistä on ratkaistu tasan yksi (Perelman, Poincaré, kieltäytyi rahoista). Nyt ratkaistuja saattaa olla kolme, ja kaksi niistä ilmestyi muutaman tunnin sisällä toisistaan.

Mitään tästä ei ole vielä vahvistettu, ja palaan myöhemmin siihen, mitä "vahvistettu" tässä yhteydessä tarkoittaa. Mutta tämä ei myöskään tullut aivan tyhjästä. Viime kuukausien tapahtumat ovat pohjustaneet tätä, ja koko kehityskulku kannattaa käydä läpi.

## Miten tähän päädyttiin

Tämä on lyhyt versio. Suurin osa pohjautuu Wikipedian [listaan tekoälyn tekemistä matematiikan löydöistä](https://en.wikipedia.org/wiki/List_of_mathematical_discoveries_made_with_artificial_intelligence), jossa on nyt kiusallisen paljon merkintöjä vuodelta 2026.

{{timeline}}

Sininen tarkoittaa ihmisten tai Leanin tarkistamaa, keltainen odottaa tarkistusta ja punainen tarkoittaa kiistettyä tai osittain peruttua tulosta. Ehrhart-tulos kattaa vain ylärajan, ja yhtäsuuruustapaus on yhä avoin. Noin puolessa lokakuun papereista oli mukana Lean-koodi, ja kolme vedettiin takaisin vuorokauden kuluessa.

Lokakuun 6. päivän tapaus ansaitsisi oman postauksensa. OpenAI julkaisi yhdeltä julkaisemattomalta mallilta 722 käsikirjoitusta muutamasta sadasta aiheesta. Alpöge kutsui sitä "ilmiselvästi matematiikan historian merkittävimmäksi hetkeksi", Sarnak sanoi, ettei kutsuisi mitään niistä lauseeksi ennen kuin ihmiset ovat tarkistaneet ne, ja osa Lean-todistuksista osoittautui todistavan heikompia väitteitä kuin paperit väittivät. Kuusi viikkoa myöhemmin "merkittävin hetki" saattaa olla jo kolmannella sijalla.

## ETH

Eksponentiaalisen ajan hypoteesi (ETH) sanoo karkeasti ottaen, että 3-SAT-ongelmaa ei voi ratkaista merkittävästi raakaa voimaa nopeammin. Jos muuttujia on n, tarvitaan suunnilleen 2^(cn) verran aikaa. Se ei ole yhtä kuuluisa kuin P vs NP, mutta suuri osa kompleksisuusteoriasta rakentuu sen varaan, koska olettamalla ETH:n pätevän pystytään todistamaan valtavasti alarajoja muotoa "tämä ongelma vaatii vähintään ajan X".

{{eth_figure}}

Lokakuun 16. päivänä kaksi labraa totesi sen vääräksi samana päivänä. OpenAI:n teksti on otsikoitu "The Exponential Time Hypothesis Is False" ja siinä sanotaan, että "järjestelmämme on hiljattain todistanut, että ETH ei pidä paikkaansa", ja [Lean-todistus](https://openai.com/index/building-scientific-understanding-with-academic-communities/) valmistui seuraavana päivänä. Anthropicin paperi "A 2^o(n) Time Algorithm for 3-SAT" ilmestyi samoihin aikoihin, kutsuu näitä kahta tulosta "itsenäisiksi ja samanaikaisiksi" ja toteaa, että ["Claude löysi ydinalgoritmin täysin ilman ihmisen apua"](https://www.datacamp.com/blog/ai-exponential-time-hypothesis). Anthropic väittää myös sen kumoavan vahvan ETH:n (Strong ETH).

Russell Impagliazzo, joka oli mukana *kehittämässä* ETH:ta, kutsui sitä "syvästi yllättäväksi". Hän johtaa nyt sen tarkistusryhmää yhdessä Ramamohan Paturin ja Ryan Williamsin kanssa. Williams sanoi suurimman osan näyttävän rutiininomaiselta muutamaa kohtaa lukuun ottamatta:

> “Two or three alien-looking parts.”
>
> — Ryan Williams, ETH-todistuksesta

"Alien-looking" on vuoden 2026 henkeen sopivin asia, mitä kompleksisuusteoreetikko on koskaan sanonut todistuksesta.

Selvyyden vuoksi: kyse ei ole siitä, että P = NP, ja nopeutuksella on tietojen mukaan käytännössä merkitystä vain kaavoille, joissa on miljoonia muuttujia. Mutta kahden erillisen tekoälyjärjestelmän päätyminen samaan asiaan samalla viikolla on jo itsessään todiste. Juuri tällaista päällekkäisyyttä osaa odottaa, jos idea oli koko ajan suoraan edessä ja mallit olivat vihdoin riittävän kyvykkäitä havaitsemaan sen.

## Navier–Stokes

Navier–Stokes-yhtälöitä koskeva Millennium-ongelma kysyy, pysyvätkö 3D-nesteen sileät alkuarvot aina sileinä vai voiko ratkaisu räjähtää äärellisessä ajassa. Kumman tahansa todistaminen riittää voittoon.

{{ns_figure}}

Syyskuussa OpenAI väitti löytäneensä blowupin, mutta *pakotetulle* versiolle, mikä tarkoittaa, että nesteeseen vaikuttaa ulkoinen voima. Scientific American kutsui tätä voimaa "epärealistiseksi ja hienosäädetyksi", eikä se ole versio, jota Clay kysyy. Asiaan liittyi myös riitaa. Tristan Buckmaster, joka oli työskennellyt saman ongelman parissa Alpögen kanssa, sanoo OpenAI:n ensimmäisen kehotteen lähteneen [päiviä sen jälkeen, kun tieto heidän työstään päätyi yritykselle](https://www.unite.ai/buckmaster-and-alpoge-post-ai-fluid-blowup-proofs-dispute-openai-contact/). Kun hän kysyi puhelussa, oliko mallia koulutettu heidän Codex-sessioillaan, hän kertoo: "En saanut vastausta." Hänen mukaansa OpenAI yritti myös kahdesti pudottaa Alpögen kirjoittajien joukosta, koska tämä työskentelee Anthropicolla. OpenAI kiistää kaiken vilpin, ja tämä on kaikki Buckmasterin näkökulmasta, mutta taustatarina on melkoinen.

Kuun 20. päivänä Alpöge ja Buckmaster julkaisivat oman tuloksensa: äärellisen ajan blowup *pakottamattomille* 3D-yhtälöille, eli sille oikealle versiolle, 79-sivuisena julkaisuna sekä [Lean-koodina](https://github.com/tristanbuckmaster/navier-stokes/). Taon mukaan strategia on "pääpiirteittäin selkeä": numeerinen, likimain itsesimilaarinen ratkaisu ja sen ympärille rakennettu tiukka perturbaatioteoria. Hän sanoo myös, että "on tehtävä vielä lisää työtä kunnollisen, ammattimaisesti kirjoitetun todistuksen luomiseksi". Kaksi käytännön aukkoa on yhä olemassa. Numeerista sertifikaattia, josta todistus riippuu, ei ole vielä julkaistu, vaan ainoastaan sen tiiviste (hash). Ja itse README toteaa, että "paikattua pakettia ei käännetty uudelleen, kun tämä repositorio koottiin", joten Lean-käännöstä ei ole vahvistettu.

## Riemannin hypoteesi

{{rh_figure}}

Tästä kaikki nyt postaavat. Alpöge laittoi verkkosivuilleen nelisivuisen PDF:n nimeltä [Remark](https://alpo.ge/remark.pdf):

> I believe I have, working with Claude, discovered a proof of the Riemann Hypothesis. In fact, the method easily extends much further, resolving the so-called Generalized Riemann Hypothesis, and I expect, with more time, the Extended Riemann Hypothesis too.

Todistus on alaviite, joka linkittää neljääntoista tar-paketin osaan, yhteensä 239 megatavuun ja noin 175 000 Lean-tiedostoon. Mitään paperia ei ole. Hän sanoo, että ihmisluettavan version tuottaminen on "rutiinitehtävä", ja toisessa alaviitteessä hän mainitsee tehneensä sellaisen, josta tuli "yli 250 000 sivua". Kun hän avasi Clauden "kirjan" lauseen 1 kohdalta, se alkoi toteamalla, että koska reaaliluvut ovat täydellisesti järjestettyjä, jos σ ≠ ½ niin σ > ½ tai σ < ½. Hän päätti, että sen julkaiseminen olisi "jonkinlainen massiivinen lukukelvoton 'slop'-irvikuva", ja julkaisi pelkän Lean-koodin.

{{proof_scale}}

Muistio on myös innostuneinta tekstiä, mitä olen koskaan nähnyt matemaatikon kirjoittavan. Hän kertoo suunnitelleensa tämän ongelman ratkaisemista opiskeluajoistaan lähtien, ohjanneensa työn oikeisiin uomiin, ja sitten:

> “Claude far outpaced me near the finish line. No, Claude flew, and danced, and sparkled near that finish line.”
>
> — Levent Alpöge, Remark

Hänen ainoa konkreettinen esimerkkinsä on ajatus thetan nostojen (theta lifts) ketjuttamisesta Stepanovin funktiokuntien RH-todistuksen "kertaluku"-kikan (multiplicity trick) jäljittelemiseksi. Pituusluokan X alkulukusummalle Claude ehdotti ketjua, jonka pituus on √X. "(Ja silti, mitä muuta se voisi olla?)" Hän myöntää hallitsevansa heikosti "korkeamman rankin ryhmien automorfiset muodot", joihin suuri osa argumentista perustuu. Sivun 3 kaksikymmentävaiheinen aikajana on Clauden tekemä tiivistelmä, josta hän varoittaa, että se "ei välttämättä käy järkeen lainkaan". Se ulottuu lokakuun 6. päivästä marraskuun 16. päivän viimeiseen vaiheeseen, jossa lukee vain "GRH".

Mukana on myös hieno labrojen välinen yhteys. Hän antaa tunnustusta OpenAI:n "hyvälle maulle" ongelmien valinnassa. Saatuaan ratkaistua heidän Ehrhart-tuloksensa yhtäsuuruustapauksen hän sanoo "ymmärtäneensä välittömästi, että Navier–Stokes tulee kaatumaan". Hän myös tunnisti heidän Siegel-argumenttinsa "Stepanoviksi ilman kertalukua", mikä on juuri se aukko, jonka thetan nostot täyttävät. Tekoälymatematiikan kilpajuoksu ei siis ole siististi pelkkää labrojen välistä taistelua toisiaan vastaan. Ihmiset lukevat toistensa mallien tulosteita ja rakentavat niiden pohjalle.

## Onko se totta

Kirjoitushetkellä tilanne näyttää hyvältä. Leanin päätason lause on määritelty Mathlibin omaa `RiemannHypothesis`-määritelmää vasten, ja sen rinnalla on Dirichlet'n L-funktioiden GRH, kuten tarkistusta varten pystytetystä [riippumattomasta peilauksesta](https://github.com/Deicyde/riemann-hypothesis) näkyy. Andrew Sutherland MIT:stä käänsi sen itse ja sanoi Scientific Americanille, että ["rehellisesti sanottuna todennäköisyys sille, että tässä olisi jotain hämärää, on käytännössä nolla"](https://www.scientificamerican.com/article/the-ai-riemann-hypothesis-proof-is-almost-certainly-true-independent-mathematicians-attest/). Kevin Buzzardin vastaus puolestaan oli, että "odotamme edelleen onnistunutta Comparator-ajoa."

{{lean_statement}}

Buzzardin huomautus on se, jolla on väliä. Comparator tarkistaa todistuksen erikseen kirjoitettuja lauselausekkeita vasten ja listaa jokaisen sen käyttämän aksiooman. Lean kääntää kyllä tiedoston, joka olettaa vähin äänin juuri sen mitä yritetään todistaa, kunhan oletus on deklaroitu. Puhdas ajo tarkoittaa, että vain Leanin kolmea standardiaksioomaa käytetään, jolloin ainoiksi pakoteiksi jäisi bugi Mathlibin määritelmässä tai Leanin ytimessä. Molemmat ovat erittäin epätodennäköisiä näin tarkasti luetulle väitteelle.

Jos Comparator antaa puhtaat paperit, olemme oudossa tilanteessa. Riemannin hypoteesi olisi silloin todistettu lause, ja ainoa täydellinen todistus olisi sellainen, jota yksikään ihminen ei ole lukenut ja jota yksikään ihminen ei mahdollisesti edes pysty lukemaan. Clay-instituutin palkintosäännöt vaativat vertaisarvioidun julkaisun ja kahden vuoden yleisen hyväksynnän, eikä noita sääntöjä kirjoitettaessa kenelläkään ollut mielessä 239 megatavun tar-pakettia.

## Mihin tämä johtaa (spekulaatiota)

Kaikki edellä mainittu on sitä, mitä on väitetty ja tarkistettu. Tämä osio on omaa arvailuani, joten suhtaudu siihen sen mukaisesti.

**Kaava.** Kun tulokset laittaa riviin, sama kaava toistuu kerta toisensa jälkeen. Ihminen valitsee ongelman ja ohjaa kohti oikeaa viitekehystä, ja sitten malli tekee teknisen raskaan työn juuri sillä osa-alueella, josta ihminen tietää vähiten. Alpöge sanoo tämän suoraan korkeamman rankin ryhmien automorfisista muodoista. Tuotos on liian valtava luettavaksi: 175 000 Lean-tiedostoa RH:lle, noin 2 270 tiedostoa ja 600 000 riviä Navier–Stokesille, sekä 250 000-sivuinen "kirja", jota kukaan ei tule avaamaan. Niinpä Lean päätyy hoitamaan vertaisarvioinnin. Ja kun kaksi labraa päätyy samaan ETH-algoritmiin samana päivänä, se ei vaikuta niinkään neroudelta vaan pikemminkin kyvykkyyskynnyksen ylittymiseltä. Ideat vain odottivat siellä jotain riittävän vahvaa saavuttamaan ne.

**Tahti.** Heinäkuussa kyseessä oli vastoesimerkki yhteen konjektuuriin. Marraskuuhun mennessä kyse oli kahdesta Millennium-ongelmasta. Se vei viisi kuukautta. En aio ekstrapoloida käyrää yhdeksästä datapisteestä, mutta Millennium-ongelmia on jäljellä neljä (P vs NP, Hodge, Yang–Mills ja Birch–Swinnerton-Dyer), ja olisin vähemmän yllättynyt kuin vuosi sitten, jos vielä yhden väitettäisiin ratkenneen vuonna 2027.

**Mikä muuttuu, jos se pitää paikkansa.**

- Jokainen kirjallisuudessa esiintyvä "olettaen GRH:n pätevän" muuttuu tavalliseksi lauseeksi. Oppikirjaesimerkki on Millerin alkulukutesti, joka on ollut deterministinen ja polynominen *jos* GRH pätee aina 70-luvulta asti.
- Todistuksen tarkistamisen vaikea osuus siirtyy itse todistuksesta väitteeseen. Kun Lean hyväksyy todistuksen, jäljelle jäävä kysymys on se, onko sen todistama lause todella se, mitä tarkoitimme. 30 määritelmärivin erittäin huolellisesta lukemisesta tulee uutta vertaisarviointia.
- Ymmärrys alkaa laahata totuuden perässä. Saatamme elää vuosia tietäen, että RH on tosi, ennen kuin kukaan kykenee selittämään syyn tavalla, joka mahtuu ihmisen päähän, ja Alpögen lupaus lyhyistä argumenteista lähiaikoina on veto sen puolesta, että tämä kuilu umpeutuu nopeasti.
- Kunnian jakamisesta tulee sotkuista. Buckmaster-kiista on esimakua tulevasta: kenen idea se oli, kenen malli, kenen data. Clay-instituutin säännöt, vertaisarviointikäytännöt ja tekijyyden konventiot kirjoitettiin maailmaan, jossa tekijä osasi selittää todistuksensa.
- Matemaatikon toimenkuva siirtyy kohti ongelmien valitsemista, hyvän maun arvioimista ja ymmärryksen rakentamista. Alpögen muistiossa kehutaan toistuvasti kummankin labran "hyvää makua". Se saattaa olla työnkuva tästä eteenpäin.

Mikään tästä ei edellytä, että RH-todistus selviää Comparatorista. Vaikka se kaatuisi, ETH, zeta-nollien tulos ja heinäkuun tulokset ovat yhä olemassa, ja kaava oli nähtävissä jo ennen perjantaita.

## Mitä seuraavaksi

- Comparatorin tuomio RH:sta ja toinen riippumaton käännös.
- Navier–Stokes-sertifikaatin julkaisu ja puhdas Lean-uudelleenkäännös.
- Impagliazzon, Paturin ja Williamsin tuomio ETH:sta.
- Alpögen lupaama kunnollinen raportti sekä lyhyempi todistus, jonka hän odottaa valmistuvan "suhteellisen nopeasti".

Alpögen muistio päättyy sanoihin: "In a time of revolution in mathematics I hope the argument provides a glimpse towards the miracles that lie ahead." Vuosi sitten tuo olisi kuulostanut hörhön loppukaneetilta, mutta nyt se vaikuttaa kohtuulliselta ennusteelta.
