---
title: "Låt oss prata om EU:s Chat Control Act"
date: 2026-07-14
tags: [privacy, surveillance, eu, encryption, p2p, essay]
description: "Varför Chat Control stör mig, vad andra typer av övervakning har med saken att göra och integritetsverktygen jag vill att folk ska bygga."
toc: true
---

## 314 > 276, men vem räknar

Den 9 juli 2026 [röstade Europaparlamentet om att förlänga Chat Control 1.0](https://andreafortuna.org/2026/07/10/chatcontrol-survives/). I den inledande omröstningen röstade 314 ledamöter för att avvisa rådets ståndpunkt och 276 röstade emot att avvisa den. Det räckte ändå inte för att nå tröskeln.

Vid en andra behandling kräver ett avslag absolut majoritet bland parlamentets ledamöter: 361 röster. En majoritet av de röstande räckte inte. [Parlamentets redogörelse för omröstningen](https://www.europarl.europa.eu/news/en/press-room/20260706IPR46318) förklarar den skillnaden. Jag förstår regeln, men jag tycker ändå att resultatet är frustrerande.

Den här omröstningen gällde det tillfälliga regelverket som tillåter frivillig skanning. Det föreslagna permanenta regelverket, oftast kallat Chat Control 2.0, är en separat förhandling. Jag bryr mig om båda, särskilt alla förslag som skulle kräva granskning av privata meddelanden.

## Det handlar inte bara om dina DM:s

Chat Control är ett av flera sätt som privat aktivitet görs tillgänglig för institutioner. Jag stöter ständigt på andra när jag jobbar med hårdvara för integritetsskydd. De har olika förmågor och begränsningar, men tillsammans påverkar de var en person kan röra sig och vad man kan göra utan att lämna efter sig sökbara spår.

### Vad du säger

Klientbaserad skanning granskar innehåll på en enhet innan det krypteras eller efter att det avkrypteras. End-to-end-kryptering skyddar meddelandet under överföringen, men det hindrar inte mjukvara på någon av ändpunkterna från att granska klartexten.

Att byta nätverk löser inte det problemet i sig. En app kan använda ett decentraliserat nätverk och ändå skanna ett meddelande innan det skickas. Jag vill att användarna ska ha kontroll över klienten, förutom att ha skydd mot avlyssning.

### Var du sover

[802.11bf](https://www.ieee802.org/11/Reports/tgbf_update.htm) standardiserar WiFi sensing. IEEE [publicerade den i september 2025](https://www.ieee802.org/11/email/stds-802-11/msg09024.html). Forskningssystem kan härleda rörelse och, under vissa förhållanden, andning eller kroppsställning från förändringar i radiosignaler. De förmågorna beror på utrustning, placering, miljö och modell; att en standard publiceras ger inte varje router allt detta per automatik.

[Carnegie Mellons arbete med rekonstruktion av kroppsställning](https://www.spatialintelligence.ai/p/your-wifi-can-see-you-heres-how) och konsumentsystem som [Gamgee](https://newatlas.com/around-the-home/gamgee-wifi-home-security-system/) är exempel värda att skilja på. En forskningsdemonstration och en rörelsedetektor för hemmet mäter inte nödvändigtvis samma sak. Vodafones [Who's Home](https://www.vodafone.co.uk/help/account/how-do-i-use-whos-home) håller till exempel bara koll på när enheter ansluter till hemmets wifi. Det är inte ett bevis på avkänning genom väggar.

Jag känner också en person på Aalto som jobbar på en ML-baserad WiFi sensing-detektor för militären. Det är en del av anledningen till att jag fortsätter hålla koll på det här området.

Andra enheter samlar in information mer direkt. En tv med automatisk innehållsidentifiering kan känna igen vad som spelas. Appar kan samla in platsdata, och radio- eller ljudfyrar kan användas för att koppla ihop enheter. En högtalare som lyssnar lokalt efter ett aktiveringsord är inte samma sak som att kontinuerligt ladda upp ett rums alla samtal. De relevanta frågorna är vad som samlas in, vart det tar vägen och vem som kan hämta ut det.

### Vart du går

[Flock Safetys nätverk av registreringsskyltskameror](https://www.aclu.org/campaigns-initiatives/get-the-flock-out) gör fordonsiakttagelser sökbara över olika platser. Min oro är att vardagliga resor blir till loggar som senare kan sökas igenom i syften som föraren aldrig haft en aning om.

![The Invasion of Flock Cameras](https://youtu.be/A3cMU55dIIc?si=8BPTtjEkvlUURSpG)

En telefon kan lägga till fler spår via appar med platsbehörighet, träningstracking och geotaggade foton. Deras integritetsegenskaper skiljer sig åt, men att kombinera register kan avslöja mycket mer än vad en enskild behörighetsfråga antyder.

Det finns motstånd. En sammanställning av [restriktioner mot Flock-kameror](https://mrsc.org/stay-informed/mrsc-insight/april-2026/restrictions-flock-cameras) rapporterar om 82 avslutade avtal i 28 delstater mellan 2021 och maj 2026, inklusive 39 under de första fem månaderna 2026. Jag vill att de striderna ska lyckas. Jag vill också ha gränser för insamling och lagring som gäller även när nästa leverantör dyker upp.

### Vad du tänker

Hjärngränssnitt väcker mer spekulativa farhågor. Rapporter om Metas [Brain2Qwerty v2](https://www.marktechpost.com/2026/06/30/meta-ai-releases-brain2qwerty-v2-a-non-invasive-meg-brain-to-text-pipeline-decoding-typed-sentences-at-61-word-accuracy/) beskriver avkodning av skrivna meningar från MEG-inspelningar. [TRIBE v2](https://ai.meta.com/blog/tribe-v2-brain-predictive-foundation-model/) förutspår hjärnans reaktioner på stimuli. Inget av resultaten innebär att man på distans kan läsa godtyckliga tankar.

Att hjälpa någon att kommunicera via ett hjärngränssnitt är ett värdefullt användningsområde. Jag vill ändå veta vem som kontrollerar inspelningarna och om åtkomst kan bli ett villkor för anställning, vård eller användning av en produkt.

MEG-riggen spelar också roll: dyr utrustning i ett skärmat rum är väldigt långt ifrån en bärbar konsumentprodukt. Jag vet inte om just de här funktionerna någonsin blir bärbara eller billiga, än mindre enligt vilken tidsplan. Min oro handlar om hur samtycke och kontroll hanteras i takt med att tekniken utvecklas.

## Handlingsutrymme och förlusten av det

De flesta stöter på datainsamling genom små beslut: ge en behörighet, slå på en praktisk funktion, godkänna en standardinställning för att kunna gå vidare med något annat.

Den samlade datamängden är svårare att se. Man kan förstå varför en kartapp behöver ens plats utan att för den skull gå med på att en datamäklare säljer ens rörelsehistorik. Samtycke till en användning borde inte i tysthet förvandlas till ett godkännande för alla framtida användningsområden.

Jag tror inte att lösningen är att förklara varje risk med högre röst. Folk har jobb, familjer och andra saker att bry sig om. Integritetsverktyg måste fungera utan att kräva ständig uppmärksamhet.

## De behöver bara vinna en gång

Skriv till din EU-parlamentariker, organisera dig och stöd grupper som [EFF](https://www.eff.org/deeplinks/2025/12/after-years-controversy-eus-chat-control-nears-its-final-hurdle-what-know). Sådana insatser kan stoppa förslag och begränsa vad institutioner kan göra.

Det som oroar mig är hur mycket kontinuerligt arbete det kräver. Ett nedröstat förslag kan komma tillbaka, en regering kan bytas ut och ett företag kan ändra sina villkor. Jag vill ha tekniska skydd som förblir användbara genom sådana förändringar.

Mitt mål är att göra vissa former av massövervakning arkitektoniskt omöjliga: till exempel att en tjänsteleverantör inte kan lämna ut klartext som den aldrig har haft tillgång till. Det förhindrar inte varje attack mot en ändpunkt, eller all form av metadatainsamling. Men det tar bort en plats där åtkomst annars skulle kunna tvingas fram.

End-to-end-kryptering, klienter som folk kan granska och kontrollera samt minskad datainsamling hjälper alla till. Decentralisering kan ta bort vissa centrala åtkomstpunkter, även om det också medför design- och användbarhetsproblem. Öppen källkod gör granskning möjlig; någon måste dock fortfarande utföra granskningen.

Vi har fungerande projekt att lära av, inklusive Signal, Tor, [Briar](https://briarproject.org/), [Session](https://getsession.org/) och [SimpleX](https://simplex.chat/). Att få folk att använda dem konsekvent är en annan del av arbetet.

## Bekvämlighet vinner alltid

Jag vill inte att personlig integritet ska kräva en extra hobby. Om en meddelandeapp är svår att installera, levererar opålitligt eller inte har några av dina vänner som användare, så spelar kryptografin ingen roll för dess användbarhet.

Standardinställningar kan göra mycket. Signal och WhatsApp låter folk skicka krypterade meddelanden utan att behöva hantera nycklar för varje konversation. Skyddet är en naturlig del av den vanliga handlingen.

Det är den typen av upplevelse jag vill bygga mot. Man ska kunna välja ett integritetsvänligt verktyg för att det gör jobbet bra, utan att behöva stå ut med en sämre version av allt man redan använder.

## Den andra sidan: Att förgifta brunnen

Jag är också intresserad av om vi kan göra insamlad data mindre användbar. Vilseledande sökningar, platser eller enhetssignaler skulle kunna störa profilering om den som samlar in inte enkelt kan skilja dem från verklig aktivitet.

Det villkoret är svårt att uppfylla. WWW'25-artikeln [“Breaking the Shield”](https://dl.acm.org/doi/10.1145/3696410.3714713) angriper fingeravtrycksrandomisering över 18 tillägg och fem webbläsare. En distinkt randomiserare kan i sig hjälpa till att identifiera sin användare.

Tidigare [forskning om att skilja verkliga sökningar från skensökningar i TrackMeNot](https://link.springer.com/chapter/10.1007/978-3-642-14527-8_2) lyfter ett liknande problem. Att lägga till brus garanterar inte att motståndaren faktiskt blir förvirrad av det.

[HARPO](https://arxiv.org/pdf/2111.05792) använder förstärkningsinlärning för obfuskering och rapporterar bättre effektivitet än sina referenspunkter. Jag vill veta hur den fördelen står sig när insamlaren anpassar sig. Att få alla användare att se likadana ut, som Tor Browser försöker göra, är en annan metod med sina egna begränsningar vad gäller användbarhet.

Jag [jobbar på ØCLOAK](https://github.com/NovusEdge/ocloak) inom det här området. Hypotesen är att sammanhängande, vältajmade skensignaler och förändringar i avkänningsförhållanden skulle kunna göra insamling dyrare eller mindre pålitlig. Huruvida det fungerar till en rimlig kostnad återstår att mäta.

## Riktningar, inte svar

Ett fåtal praktiska vägval verkar värda att satsa på.

Behåll kryptering och insamlingsgränser i det vanliga användarflödet. En integritetsinställning som de flesta aldrig hittar kommer inte att skydda dem. Signals centrala leveransservrar visar också varför ett nätverks topologi och åtkomsten till meddelandeinnehåll måste betraktas separat.

Hjälp folk att ta med sig sina kontakter. Federation och bryggor kan underlätta adoption, men en brygga ändrar också vem som kan komma åt ett meddelande. Det måste vara tydligt för den som använder den.

Se installation, leverans, återställning och tillgänglighet som en del av integritetsarbetet. Hur krångligt PGP är tjänar som en nyttig varning: även en stark mekanism kan svika människor som inte kan hantera den på ett pålitligt sätt.

Projekt som [Veilid](https://veilid.com/) och [Meshtastic](https://meshtastic.org/) utforskar andra sätt att kommunicera. Ett litet radiomesh-nätverk kan vara användbart för lokal eller off-grid-samordning utan att behöva ersätta ett mobilnät. Jag vill se fler experiment som dessa, utvärderade för de situationer de faktiskt stödjer.

## Vad som står på spel

Det som stör mig är maktskillnaden mellan en enskild person och en institution som sitter på åratal av register om personen i fråga. Personen vet kanske inte ens om att registren finns, kan inte rätta dem och får kanske aldrig veta att de påverkat ett beslut.

Det kan påverka beteenden redan innan någon använder tvångsmedel. Folk undviker samtal, umgängen eller platser när de förväntar sig att dessa val kommer att registreras och bedömas senare. Jag vill ha utrymme att leva utan att behöva rättfärdiga varje vardaglig handling inför en databas jag inte kan granska.

## Avslutande ord

För mitt eget arbete är frågorna ganska konkreta: vilken information behöver systemet, hur länge sparas den och vad kan en leverantör eller angripare lära sig av den? Jag vill ta bort onödig insamling innan jag försöker säkra ett större arkiv.

Att använda integritetsvänliga verktyg och stödja organisationer för digitala rättigheter hjälper båda. Likaså att göra verktygen tillräckligt användbara för att vänner faktiskt ska behålla dem installerade.

Jag har ingen design som gör all övervakning omöjlig. Jag vill jobba på de delar vi kan förhindra och mäta om de mer experimentella försvarsmetoderna gör vad vi hoppas på.

~ A.
