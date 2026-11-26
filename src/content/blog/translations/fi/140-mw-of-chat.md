---
title: "140 MW chattia"
date: 2026-11-20
tags: [energy, grid, datacenters, finland, ai, inference]
draft: true
description: "Laskin yhteen kuluttajille suunnattujen tekoälybottien sähkönkulutuksen julkaistujen käyttö- ja energialukujen pohjalta. Keskiarvoksi tulee noin 140 MW, mikä vastaa noin neljännesprosenttia datakeskusten sähkönkulutuksesta. Energiankulutus viestiä kohti on suuri tuntematon, ja käyttö viisinkertaistui viime vuonna."
toc: true
pixel: thinking
---

## Luku

Sadat miljoonat ihmiset käyttävät chatbotteja viikoittain, ja tekoälykampuksia suunnitellaan gigawattiluokassa. Pelkästään Fingridillä on vireillä yli 100 GW:n edestä liittymiskyselyjä Suomen alle 16 GW:n huippukulutukseen verrattuna, ja suurin osa niistä koskee datakeskuksia ([Fingrid](https://www.fingrid.fi/globalassets/dokumentit/fi/ajankohtaista-tapahtumat/webinaari-liittymissopimushakemuksista-18.5.2026-esitysmateriaali.pdf)). Kyselyt eivät ole sitovia, ja todellisuudessa allekirjoitettuja datakeskussopimuksia on noin 5 GW:n verran. Britanniassa 125 GW:n liityntäjonosta noin 73 GW on datakeskuksia ([Ofgem](https://www.ofgem.gov.uk/sites/default/files/2026-07/Proposed-data-centre-connection-reforms-curate-consultation-document.pdf)).

Halusin tietää, kuinka paljon chatbotit itse tästä tarvitsevat, joten laskin asian auki julkaistuista luvuista. Keskeinen arvioni on, että ChatGPT, Gemini, Claude, Meta AI ja muut kuluttavat yhdessä **keskimäärin noin 140 MW ja huipussa 233 MW**. Tuo keskiarvo on noin 0,25 % sähköstä, jota datakeskukset käyttivät vuonna 2025.

On hyvä muistaa, että tämä on nykyinen chattikuorma verrattuna kampushankkeisiin, joiden pitäisi valmistua vuosien 2027 ja 2030 välillä, ja chatin käyttö kasvaa vauhdilla. Tällä hetkellä kuluttajachatti muodostaa kuitenkin vain pienen osan datakeskusten kuormasta. Loput menevät mallien koulutukseen, yritys- ja API-liikenteeseen, muuhun kuin chat-muotoiseen kuluttajatekoälyyn sekä yleiseen pilvipalveluun. Yksikään julkaistu lähde ei erittele tuota loppuosaa, joten eri osuuksien tarkkaa kokoa ei voi tietää.

## Miten arvio on tehty

Arvio syntyy neljän luvun tulona, jonka päälle tulee vielä huippukerroin.

| Syöte | Matala | Keskiarvio | Korkea | Lähde |
|---|---|---|---|---|
| ChatGPT:n viikoittaiset käyttäjät | 900M | 900M | 900M | [OpenAI TechCrunchin kautta](https://techcrunch.com/2026/02/27/chatgpt-reaches-900m-weekly-active-users) |
| Viestejä käyttäjää kohti päivässä | 3,67 | 5,5 | 11 | [OpenAI/NBER](https://cdn.openai.com/pdf/a253471f-8260-40c6-a2cc-aa93fe9f142e/economic-research-chatgpt-usage-paper.pdf) |
| Energia per viesti | 0,24 Wh | 0,34 Wh | 1,0 Wh | [Google](https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference), Altman, [Epoch AI](https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use) |
| Kaikki avustajat ÷ ChatGPT | 1,5 | 2,0 | 3,0 | Oletus; [Similarweb Momenticin kautta](https://momenticmarketing.com/blog/top-ai-chatbots) |
| Huippu ÷ keskiarvo | 1,66 | 1,66 | 2,0 | Azure 2024 -keskusteludata |

Tähän kukin syöte nojaa:

- **Käyttäjät.** 900 miljoonaa on helmikuulta 2026, ja se on tuorein OpenAI:n vahvistama luku. Kaikki tulokset skaalautuvat sen mukana lineaarisesti.
- **Viestit.** Matala arvo perustuu OpenAI:n ilmoitukseen: 18 miljardia viestiä viikossa 700 miljoonalta käyttäjältä heinäkuussa 2025. Keskiarvio ja korkea arvo olettavat, että käyttö henkilöä kohti on jatkanut kasvuaan.
- **Energia.** Matala arvo on Googlen mediaani Gemini-tekstikehotteelle, datakeskuksen lisäkulutus mukaan luettuna. Keskiarvio on Sam Altmanin mainitsema keskiarvo, jolle ei ole annettu laskentatapaa tai rajauksia. Korkea arvo on oma oletukseni yhdistelmälle, jossa käytetään jonkin verran päättelyä ja pitkää kontekstia.
- **Muut avustajat.** ChatGPT:n osuus seitsemän avustajan verkkosivukäynneistä oli 56,6 % lokakuussa 2026, mistä saadaan kertoimeksi 1,77. Tästä luvusta puuttuvat sovellukset, Metan omien sovellusten sisäinen Meta AI sekä Kiinan kotimaiset avustajat.
- **Huippu.** Tämä on laskettu tunneittain yhden viikon mittaisesta Azuren vuoden 2024 LLM-keskusteludatasta, joka on yritysten API-liikennettä. Korkea arvo on oletus.

| Skenaario | Keskiarvo | Huippu | Keskiarvon osuus vuoden 2025 datakeskussähköstä |
|---|---|---|---|
| Matala | 50 MW | 82 MW | 0,09 % |
| Keskiarvio | 140 MW | 233 MW | 0,25 % |
| Oma korkea skenaario | 1 238 MW | 2 475 MW | 2,2 % |

![Säädä syötteitä nähdäksesi megawatit](/figures/chat-power-calculator)

Datakeskusten vertailulukuna käytetään IEA:n 485 TWh:ta vuodelle 2025, mikä vastaa keskimäärin noin 55 GW:n tehoa ([IEA](https://iea.org/reports/key-questions-on-energy-and-ai/executive-summary)). [Skripti](/assets/blog/consumer-chat-demand.py) on noin 55 riviä puhdasta Pythonia, joten voit kokeilla siihen omia syötteitäsi.

Energia viestiä kohti on syötteistä se, johon luotan vähiten, ja juuri se liikuttaa lopputulosta eniten. Kolmannen osapuolen mallinnuksen mukaan keskipitkä GPT-5-kehote kuluttaa 2,33 Wh minimaalisella päättelyllä ja 17,15 Wh laajalla päättelyllä ([Jegham et al.](https://arxiv.org/abs/2505.09598)). Jos kaikki muut syötteet pidetään keskiarviossa, nämä antavat keskiarvoksi noin 1 GW ja 7 GW. Jos siis tavallinen chat-viesti muistuttaa päättelykehotetta, kuluttajachatti on jo nyt gigawattiluokan kuorma.

## Karkea alaraja Googlen tokeneista

Toukokuussa 2026 Google ilmoitti käsittelevänsä yli 3,2 kvadriljoonaa tokenia kuukaudessa eri palveluissaan ("across our surfaces") ([Google](https://blog.google/innovation-and-ai/sundar-pichai-io-2026/)). Google ei määrittele laskutapaansa tarkemmin, ja luku kattaa Haun tekoälyominaisuudet, Workspacen ja API:n sekä Gemini-sovelluksen. Tästä saadaan noin 1,2 miljardia tokenia sekunnissa.

DeepSeek on julkaissut oman tuotantonsa läpäisykyvyn: noin 73 700 syötetokenia sekunnissa kahdeksan GPU:n H800-solmua kohti esitäyttövaiheessa (prefill), tai noin 14 800 tulostokenia sekunnissa purkuvaiheessa (decode) ([DeepSeek](https://github.com/deepseek-ai/open-infra-index/blob/main/202502OpenSourceWeek/day_6_one_more_thing_deepseekV3R1_inference_system_overview.md)). Kun käytetään Epochin arviota 1,5 kW per GPU oheiskulut mukaan luettuina, Googlen token-virta vastaa keskimäärin noin 240–360 MW:n tehoa, jos 80–95 % tokeneista on syötettä. DeepSeekin oma jakauma oli 78 % syötettä, mikä tekee 370 MW. 50 prosentin syöteosuudella teho on noin 590 MW.

Pitäisin tätä alarajana. DeepSeekin luvut edustavat parasta mahdollista tilannetta: raskaasti optimoitu malli suurella eräkoolla, 56 % syötetokeneista tarjoiltuna välimuistista ja palvelinkanta, jossa joutilaat solmut siirretään öisin mallikoulutukseen. Luku mittaa myös eri asiaa kuin chattiarvio, sillä se kattaa Googlen kaikki palvelut yritysliikenne mukaan lukien. Se kuitenkin osoittaa, että jopa Googlen koko token-virta vaatii satoja megawatteja DeepSeekin tehokkuudellakin ajettuna.

## Kasvu

ChatGPT:n viestimäärät kasvoivat yli viisinkertaisiksi heinäkuun 2024 ja heinäkuun 2025 välillä. Oma keskiarvioni olettaa noin 1,9-kertaista kasvua heinäkuun 2025 jälkeen. Viime vuoden vauhdilla keskiarvo ylittäisi 700 MW vuoden kuluessa. Toiseen suuntaan taas vaikuttaa se, että Googlen mukaan sen tekemän mediaanitekstikehotteen energiankulutus laski 33-osaan toukokuun 2024 ja toukokuun 2025 välillä. Se, kumpi näistä kehityssuunnista vie voiton, ratkaisee pysyykö kuluttajachatti sadoissa megawateissa.

## Suomi tarvitsee puoli megawattia

Käyttäjäosuuden mukaan Suomen kuluttajachatti tarvitsee keskiarviossa huippuaikaan noin **0,55 MW**, ja korkeassa skenaariossa enimmillään noin 18 MW. Tehon puolesta yksi 1–5 MW:n laitos kaupungissa riittää kattamaan tämän. Saksa tarvitsee noin 6 MW. Yhdysvallat tarvitsee noin 24 MW, tai noin 71 MW jos mittarina käytetään chatgpt.comin käyntejä, joissa Yhdysvaltojen osuus liikenteestä on noin 22 % verrattuna sen 7 %:n käyttäjäosuuteen. 15 prosentin hoitaminen koko maailman kuluttajachatista (mikä vastaa Euroopan osuutta globaalista datakeskusten sähkönkulutuksesta) vaatisi noin 35 MW. Se on alle 5 % siitä, mitä Irlannin datakeskukset jo kuluttavat.

Teho ei kuitenkaan ole koko tarina. Yhden ainoan suomalaisia käyttäjiä palvelevan laitoksen pitäisi ajaa jokaisen toimittajan malleja, ja jokainen malli tarvitsee oman palvelinpoolinsa. Useat pienet poolit samassa toimipisteessä kävisivät kukin osittain tyhjäkäynnillä.

Tämä toimii molempiin suuntiin alkuperäisen pohdintani kannalta. Kuluttajachatti ei tarvitse jättikampuksia. Sen siirtäminen pois kampuksilta ei kuitenkaan juuri helpota sähköverkkoakaan, koska kuorma on jo valmiiksi pieni. Perustelujen sen ajamiselle pienistä kaupunkikohteista täytyy siis nojata johonkin muuhun.

## Miksi kaupunkeihin ylipäätään

Kirjoitan parhaillaan artikkelia, jossa vertailen 100–300 MW:n kampusta ja 1–5 MW:n kaupunkikohdetta suomalaisten hinnastojen ja sääntöjen pohjalta. Tältä alustava tilanne näyttää.

### Rakennus merkitsee vähemmän kuin käyttöaste

Epochin mallissa 1 GW:n yhdysvaltalaiselle kampukselle palvelimet ja verkkolaitteet muodostavat noin 73 % elinkaarikustannuksista (TCO) ja itse kiinteistö noin 16 % ([Epoch AI](https://epoch.ai/data-insights/ai-datacenter-cost-breakdown)). Pieni toimipiste, jonka rakentaminen maksaa 50 % enemmän megawattikohtaisesti, nostaa tokenikohtaista hintaa siis vain noin 8 %. Tuo 50 % on olettamani vaihteluvälin yläpäässä, koska todellisia lukuja ei julkaise kukaan.

Ongelmana on käyttöaste. Kansallinen laitekanta ei pysty tasaamaan kysyntää eri aikavyöhykkeiden yli. Suomen mitattu huippukerroin on noin 2,33, kun taas maailmanlaajuisesti kootussa chatissa se on 1,66. Tämän vuoksi Suomen huippukulutukseen mitoitettu laitekanta käy keskimäärin noin 43 prosentin käyttöasteella 60 prosentin sijaan. Tämä kuilu pienten toimipisteiden on kurottava umpeen, ja sillä on enemmän merkitystä kuin itse rakennuksella.

### Pienet kohteet saattavat saada sähköä nopeammin

Suomen laki asettaa jakeluverkossa kohtuulliseksi liittymisajaksi 6 kuukautta sopimuksen allekirjoittamisesta ja suurjännitteellä 24 kuukautta ([Finlex](https://www.finlex.fi/fi/lainsaadanto/2013/588)). En löytänyt mistään julkaistuja toteutuneita liittymisaikoja 1–5 MVA:n kuormille.

Kaupunkiverkoissakin on ahdasta. Espoon jakeluverkkoyhtiö sanoo omien uusien linjojensa rakentamisen vievän 6–8 vuotta, ja sen 35 päämuuntajasta 30 on täynnä, kun varakapasiteetti otetaan huomioon.

### Olemassa olevat rakennukset eivät vie uutta maata

Suomalaiset kampukset vievät tonttitilaa 0,07–0,22 hehtaaria IT-kuorman megawattia kohden neljän sellaisen hankkeen perusteella, joista on julkaistu tietoja. Olemassa olevaan rakennukseen sijoitettu kohde ei vie uutta maata lainkaan.

Googlen Muhoksen tontilta, josta [kirjoitin syyskuussa](/blog/googles-13-billion-in-finland), hakattiin tai raivattiin noin 330 hehtaaria ennen kuin ympäristövaikutusten arviointi oli saatu päätökseen. Lokakuussa Lupa- ja valvontavirasto kehotti yhtiötä keskeyttämään valmistelutoimet arviointien valmistumiseen asti, ja yhtiö toimi näin ([LVV](https://www.sttinfo.fi/tiedote/72390663/lupa-ja-valvontavirasto-kehottaa-tuike-finland-oyta-keskeyttamaan-muhoksen-ja-kajaanin-datakeskushankkeiden-valmistelutoimet)).

### Mistä ei ole hyötyä

- **Viive.** Helsingistä Tukholmaan edestakainen viive on noin 7 ms, ja MLPerfin aikaraja ensimmäiselle tokenille (time-to-first-token) on 450 ms.
- **Vikasietoisuus.** Itämeren kaapelirikkojen aikana noin neljännes uudelleenreititetyistä Suomi–Saksa-yhteyksistä hidastui yli 3 ms ilman ylimääräistä pakettihävikkiä.
- **Päästöt.** Suomalainen kaukolämpö on jo valmiiksi vähähiilistä, joten palvelinten lämmön myyminen verkkoon tuottaa vain vähän säästöjä.

## Suomen ulkopuolella säännöt ratkaisevat

Kohteesta tulee "suuri kuorma" rajalla, joka vaihtelee Irlannin 1 MVA:sta PJM:n 50 MW:iin ja Texasin 75 MW:iin. Tämän rajan yläpuolella edessä on maasta riippuen jonoja, maksuja, vakuuksia, vaatimuksia omasta sähköntuotannosta tai suoria kieltäytymisiä. Irlannissa ja Tanskassa on jo sääntöjä, jotka estävät yhden toimijan kuorman pilkkomisen pienempiin liittymiin, ja PJM laskee toimijan sidossuhteessa olevat kohteet mailin säteellä yhdeksi kuormaksi. Fingrid on ehdottanut, että suomalaisia liityntöjä arvioitaisiin hanke- tai aluekohtaisina kokonaisuuksina, millä voisi olla sama vaikutus. Siellä missä tällaisia sääntöjä sovelletaan, pienten toimipisteiden verkostoa voidaan kohdella yhtenä suurena kuormana.

## Missä tämä voi mennä pieleen

- **Energia viestiä kohti perustuu pääosin toimittajien omiin ilmoituksiin.** Googlen 0,24 Wh on mediaani sen omilla TPU-piireillä ajetuille tekstikehotteille, eikä sitä ole vahvistettu riippumattomasti. Mediaani aliarvioi keskiarvoa jakauman ollessa vino, joten matala skenaario on todennäköisesti liian matala. Altmanin 0,34 Wh:n luvulle ei puolestaan ole annettu mitään laskentatapaa.
- **Tämä kattaa vain chatin.** Agentit, koodaustyökalut, kuvien ja videoiden generointi sekä hakuun ja sosiaalisen median syötteisiin rakennetut tekoälyominaisuudet on jätetty pois. Ne saattavat jo nyt olla chattia suurempia.
- **Kiinan kotimaiset avustajat puuttuvat aineistosta.** Yksikään käyttämistäni lähteistä ei kata niitä.
- **Viikoittaiset aktiiviset käyttäjät laskevat tilejä, eivät ihmisiä.** Tämä poistuu globaalista kokonaissummasta, jossa käytetään viestejä tiliä kohti, mutta se voi vääristää maakohtaisia osuuksia.
- **Suomen huippukerroin perustuu pieneen otokseen**, noin 500 suomalaiseen käyttäjään julkisessa chat-aineistossa.

## Mikä auttaisi

Jos sinulla on parempia lukuja, otan ne mielelläni vastaan. Artikkelin mallia muuttaisivat eniten palvelinräkin tyhjäkäyntiteho, rakennuskustannukset megawattia kohti 1–5 MW:n nestejäähdytetyille kohteille, todellisten palvelinkantojen käyttöaste sekä toteutuneet liittymisajat 1–5 MVA:n kuormille missä tahansa.

Artikkeli julkaistaan Zenodossa täyden kustannusmallin, lähteiden ja datan kera.
