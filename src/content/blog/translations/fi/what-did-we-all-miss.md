---
title: "Mitä meiltä kaikilta meni ohi?"
date: 2026-09-12
tags: [ai, epistemics, robotics, industry, essay]
description: "Ne meni ja teki sen pojat, se on jover ToT"
draft: false
toc: true
---

## Miljoonan dollarin vitsi

Kun OpenAI julkisti ratkaisun [Navier-Stokesin Millennium-palkintotehtävään](https://www.claymath.org/millennium/navier-stokes-equation/), suuri osa näkemästäni keskustelusta pyöri sen ympärillä, että [laskentatehoon käytettiin suunnilleen 22 miljoonaa dollaria](https://techcrunch.com/2026/09/08/openai-fought-dirty-on-career-making-math-problem-says-nyu-mathematician/) miljoonan dollarin palkinnon vuoksi. Ihan totta, se on huvittava vertailu. Itse olin enemmän kiinnostunut siitä, miten työ tehtiin.

Noin kymmenentuhannen koordinoivan agentin kerrottiin tuottaneen todistuksen ja Lean-formalisaation. OpenAI kieltäytyi palkintorahoista. Tuon tason koneellisesti tarkistettu todistus olisi merkittävä tutkimustulos, jo ennen kuin sille keksitään yhtäkään käytännön sovellusta.

Väitetty tulos on äärellisen ajan singulariteetti: sileät ratkaisut voivat rikkoutua. Se ei anna meille uutta tapaa rakentaa raketteja tai mallintaa turbulenssia. Se osa, jonka haluan ymmärtää, on miten agentit suoriutuivat matematiikasta ja kuinka suuri osa tuosta prosessista siirtyy muihin ongelmiin.

## Kenen määritelmä

Syyskuun 6. päivänä Jensen Huang [julisti AGI:n saapuneen](https://www.forbes.com/sites/timbajarin/2026/09/08/jensen-huangs-agi-claim-is-a-business-case-not-settled-fact/) ja antoi kunnian [GPT-6 Astralle](https://openai.com/index/gpt-6-astra/), joka koulutettiin yli 100 000:lla Nvidian Grace Blackwell -GPU:lla. Kaksi päivää myöhemmin todistus julkaistiin. Jo maaliskuussa hän oli sanonut Lex Fridmanille [”mielestäni olemme saavuttaneet AGI:n”](https://www.forbes.com/sites/antoniopequenoiv/2026/03/23/nvidias-jensen-huang-says-he-thinks-weve-achieved-agi/), kun he keskustelivat siitä, voisiko tekoäly rakentaa ja pyörittää miljardin dollarin arvoista yritystä. Elokuun tulospuhelussa väite oli suppeampi: monien tehtävien osalta voitaisiin sanoa, että olemme saavuttaneet AGI:n.

Myös Sam Altmanin lausuntoja on ollut vaikea sovittaa yhteen: nykyiset järjestelmät kuulemma täyttävät OpenAI:n määritelmän, mutta hän odottaa silti vielä tänä vuonna sisäistä järjestelmää, jota hän itse kutsuisi AGI:ksi.

Tämä on mielestäni uuvuttavaa. Joku lukee yhden noista otsikoista, pyytää sovellusta tekemään työnsä ja katsoo vierestä, kun se epäonnistuu asiassa, josta pätevä kollega suoriutuisi. Haastattelua varten valittu määritelmä ei auta ymmärtämään, mihin järjestelmä oikeasti pystyy.

Ja kyllä, onhan se aika huvittavaa, että Huang lukee AGI:n sadantuhannen oman GPU:nsa ansioksi.

## Kaikki ovat väsyneitä

Tekoälyä on tuotejulkistuksissa, mainoksissa, LinkedIn-postauksissa, uutisissa ja työkaluissa, joita jo käytin ja jotka ovat sittemmin saaneet kimmellyskuvakkeen. Sitä on vittu kaikkialla. Haluan yhä lukea siitä, mutta teknologia-alan ulkopuoliset kaverit haluavat usein keskustelun päättyvän ennen kuin se ehtii edes alkaa.

Osa tästä muistuttaa [taipumusta jakautua vastakkaisiin leireihin](https://www.researchgate.net/publication/333673884_Tribalism_Is_Human_Nature): kaikki on kuplaa, kaikki on kuraa tai olemme luomassa jumalaa. Mutta kauppatieteitä opiskelevien tai muilla aloilla työskentelevien ystävieni kohdalla huomaan lähinnä väsymystä. He ovat kuulleet liikaa hehkutusta eivätkä halua enää yhtään uutta asiaa arvioitavakseen.

Tämä on havainto tuntemistani ihmisistä. En itse jaa tuota tunnetta kovin usein; yleensä lopetan lukemisen, koska olen fyysisesti väsynyt. En siis koe voivani saarnata heille siitä, että heidän pitäisi seurata aihetta tarkemmin.

## Kahdenlaisia yrityksiä

Thielin ”0 → 1” -ajattelutapa vastaa pitkälti omaa näkemystäni: jotkut yritykset tekevät jotain, mikä ei aiemmin ollut mahdollista, kun taas toiset myyvät pääsyä johonkin jo valmiiksi rakennettuun.

Hyödyllisen asian jälleenmyynnissä ei ole mitään vikaa. Minua ärsyttää se, kun kehotteen ympärille käärittyä tilauspalvelua markkinoidaan teknologisena läpimurtona. Kun noita julkistuksia tulee tarpeeksi, seuraavaa on yhä vaikeampi ottaa vakavasti.

Olen enemmän huolissani tuotteista, jotka toimivat hyvin ja tekevät vahinkoa: esimerkiksi valvontatyökaluista tai sotilassovelluksista, joiden siviilikäyttö saa kaiken huomion esitteissä. Vastalauseeni kohdistuu siihen, mitä ihmiset rakentavat ja kuka sitä pääsee käyttämään.

## Robotit

Robotiikka on yksi alue, josta toivoisin kuulevani enemmän.

[AMI Labs](https://techcrunch.com/2026/03/09/yann-lecuns-ami-labs-raises-1-03-billion-to-build-world-models/) keräsi 1,03 miljardia dollaria siemenkierroksella Yann LeCunin toimiessa puheenjohtajana kehittääkseen maailmanmalleja JEPA-lähestymistavalla. [Generalist AI](https://techcrunch.com/2026/08/25/robotics-startup-generalist-reaches-3b-valuation-sources-say/) keräsi kesäkuussa 400 miljoonaa dollaria ja neuvotteli tietojen mukaan 3 miljardin dollarin arvostuksesta elokuussa. Sen [GEN-1.5-mallin](https://generalistai.com/blog/gen-1.5) näytetään [oppivan fyysisen tehtävän yhdestä ainoasta demonstraatiosta](https://youtu.be/1cllCVK-9lo), ilman gradienttipäivityksiä tai hienosäätöä.

Näillä yrityksillä on selvästi pääomaa käytössään. Silti kuulen niiden työstä paljon vähemmän kuin seuraavasta kielimallijulkistuksesta. Se saattaa osittain johtua siitä, mitä itse seuraan. Robotiikkaa on minun vaikeampi arvioida, ja edes yhden alan osan seuraaminen vie aikaa.

Jos robottien opettamisesta tulee paljon helpompaa, haluan tietää, miten aiomme käsitellä fyysisen työn muutokset. Pitäisikö joidenkin töiden pysyä vain ihmisille varattuina, mukaan lukien terapia, lääketiede tai tietyt ammatit? En ole päätynyt mihinkään vastaukseen. Kysymys liittyy toimeentuloon, vastuuseen ja siihen, mitä ihmiset haluavat työn tekijältä, sen lisäksi pystyykö kone suoriutumaan siitä.

## Puolet internetistä

[Impervan vuoden 2026 raportti](https://www.imperva.com/blog/bad-bot-report-2026-bots-agentic-age/) arvioi automatisoidun liikenteen osuudeksi yli 53 % sen mittaamasta verkkoliikenteestä. Haitalliset botit muodostavat 40 % kokonaismäärästä, ja tekoälyä hyödyntävät bottihyökkäykset ovat kasvaneet 12,5-kertaisiksi edellisvuodesta. Nämä ovat liikennemittauksia. Ne eivät kerro, kuinka suuri osa postauksista tai keskusteluista on generoituja.

On olemassa erillistä näyttöä siitä, miten vakuuttavaa generoitu keskustelu voi olla. [Jonesin ja Bergenin Turingin testi -tutkimuksessa](https://arxiv.org/abs/2503.23674) osallistujat keskustelivat ihmisen ja mallin kanssa viisi minuuttia ja valitsivat sitten, kumpi oli ihminen. Ihmismäisellä persoonalla kehotettu GPT-4.5 valittiin 73 prosentissa tapauksista. LLaMA-3.1 ylsi 56 prosenttiin; vertailukohtina olleet ELIZA ja GPT-4o saavuttivat 23 % ja 21 %.

Luulen joskus tunnistavani generoidun tekstin. En kuitenkaan haluaisi luottaa tuohon arvioon, etenkään väsyneenä tai lukiessani jotain oman alani ulkopuolelta.

## Leiki sillä

Nautin yhä asioiden kokeilemisesta tietämättä, johtaako se mihinkään. Tee jokin naurettava ohjelma yliopistoprofessorisi ärsyttämiseksi tai seuraa tyhmää ideaa tarpeeksi pitkälle nähdäksesi mitä tapahtuu. Sen ei tarvitse muuttua yritykseksi.

Olen huomannut taitavien tekniikan alan ihmisten välttelevän yrittämistä, koska he eivät näe hyödyllistä lopputulosta etukäteen. Mietin, vaikuttaako siihen paine ottaa kantaa jokaiseen teknologiaan. Lyhytmuotoinen media saattaa myös vaikuttaa asiaan, mutta se on vain arvaus.

Haluan tilaa olla kiinnostunut teknologiasta ja samalla vastustaa tapaa, jolla sitä myydään ja käytetään. Voin inhota valvontatuotetta tai AGI-väitettä, joka ei kerro minulle juuri mitään, ja silti haluta ymmärtää uutta mallia tai koetta.

## Missä mennään

Tutkimus kiinnostaa minua tarpeeksi, jotta jaksan lukea siitä. Markkinointi tekee siitä vaikeampaa, ja kavereilla, jotka eivät työskentele teknologia-alalla, on paljon vähemmän syitä sietää sitä.

Toivoisin, että keskustelu pyörisi enemmän konkreettisten asioiden kokeilemisen ympärillä ja vähemmän sen ympärillä, onko tekoäly kokonaisuudessaan hyvä vai paha asia. Robotiikka on yksi aiheista, joiden toivoisin olevan mukana.

~ A.
