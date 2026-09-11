---
title: "Reden wir über das EU-Chatkontrolle-Gesetz"
date: 2026-07-14
tags: [privacy, surveillance, eu, encryption, p2p, essay]
description: "Über Chatkontrolle, den Überwachungs-Stack, der sich von allen Seiten zusammenzieht, und warum die einzig dauerhafte Lösung darin besteht, Massenüberwachung architektonisch unmöglich zu machen."
toc: true
---

## 314 > 276, aber wer zählt schon mit

Am 9. Juli 2026 hat das Europäische Parlament [über die Verlängerung von Chat Control 1.0 abgestimmt](https://andreafortuna.org/2026/07/10/chatcontrol-survives/). Der Ablehnungsantrag erhielt *mehr* Stimmen als die Zustimmung: 314 „_Nein_“ gegenüber 276 „_Ja_“. In jedem vernünftigen System wäre das unterm Strich ein klares Nein.

Aber das war eine zweite Lesung, und für alle, die sich damit nicht so genau auskennen: Bei zweiten Lesungen braucht man eine *absolute Mehrheit* von 361 Stimmen für eine Ablehnung. Das 314 > 276-Ergebnis bedeutete also im Grunde einen feuchten Dreck, und die Verlängerung ging durch, weil weniger Abgeordnete aufgetaucht sind als nötig gewesen wären, um sie zu stoppen.

So läuft das heutzutage: nicht durch ein Mandat, sondern durch Verfahrenstricks; nicht, weil die Menschen es wollen, sondern weil diejenigen, die es ablehnen, eine willkürliche Hürde nicht knacken können, die für eine ganz andere Ära parlamentarischer Politik gedacht war.

Der Witz ist: Das war nur das *freiwillige* Scan-Regime. Chat Control 1.0 erlaubt es Plattformen, eure Nachrichten zu scannen, wenn sie wollen – aber die dauerhafte Verordnung, Chat Control 2.0, wird immer noch verhandelt. Die _schreibt_ die Chat-Überwachung verpflichtend vor, und der Trilog wird diesen September fortgesetzt.

## Es geht nicht nur um eure DMs
Wenn ihr denkt, das wäre schon alles: keine Sorge, es wird noch viel schlimmer (Shoutout an @HowMoneyWorks, 100 Punkte für Hufflepuff, falls ihr die Referenz checkt lmao). Chat Control ist nur eine Schicht dieses Überwachungs-Stacks. Im Bereich der Datenerfassung passiert noch so einiges mehr, das öffentliche Aufmerksamkeit _erfordert_ – aber da wir Menschen absolut beschissen darin sind, den Überblick über komplexe Systeme zu behalten, die uns systematisch aufgedrückt werden, während wir uns über irgendwas völlig Banales „empören“, wird genau das verdammt schwer. Hier ist, was alles getrackt wird:


### Was du sagst
Chat Control zielt auf die Inhalte deiner Kommunikation ab. Die Abstimmung im Juli hat Ende-zu-Ende-verschlüsselte Dienste (WhatsApp, Signal, Telegram etc.) vom freiwilligen Regime ausgenommen – schätze mal, das ist ein kleiner Sieg.

Aber Chat Control 2.0 enthält Passagen zu **Client-Side-Scanning** – was bedeutet, dass dein Smartphone die Nachricht überprüft, *bevor* sie verschlüsselt wird. Die Verschlüsselung bringt überhaupt nichts, wenn das verdammte Gerät selbst die Petze ist. Apple hat das 2021 mit ihrem CSAM-Scanning-Ding versucht und nach massivem Backlash einen Rückzieher gemacht, aber die EU zieht das einfach... trotzdem durch? Cool cool cool.

Und hier ist der Haken: Dezentralisierung löst das nicht wirklich. Du kannst über Onion-Netzwerke routen, über tausend Nodes springen, mit quantenresistenten Algorithmen verschlüsseln – nichts davon spielt eine Rolle, wenn die App auf deinem Smartphone gesetzlich dazu verpflichtet ist, vor dem Senden zu scannen. Der Angriff hat sich vom Netzwerk auf die Endpunkte verlagert. Dein Handy. Dein Laptop. Das Ding, dem du am meisten vertraust.

### Wo du schläfst
[`802.11bf`](https://www.ieee802.org/11/Reports/tgbf_update.htm) wurde im September 2025 ratifiziert. Das ist ein WiFi-Sensing-Standard, was bedeutet, dass ab nächstem Jahr (und bei neuen Modellen, die den neuen Standard unterstützen) **dein** Router die Anwesenheit von Menschen, Bewegungen, Atemmuster und Körperhaltungen erkennen kann. Durch Wände. Deine Wände.

Das ist auch kein rein theoretischer Plan oder so, die Technologie gibt es schon seit einiger Zeit. Vodafone hat „Who's Home“ im Dezember 2025 herausgebracht. [Carnegie Mellon demonstrierte eine vollständige Rekonstruktion von Körperposen](https://www.spatialintelligence.ai/p/your-wifi-can-see-you-heres-how) aus ganz normalen Router-Signalen. Ein \$9-ESP32 kann durch Wände sehen. [Gamgee](https://newatlas.com/around-the-home/gamgee-wifi-home-security-system/) liefert bereits darauf basierende WLAN-Sicherheitssysteme für Endverbraucher aus. Verdammt, ich kenne sogar jemanden an der Aalto, der einen ML-basierten WiFi-Sensing-Detektor fürs Militär baut.

Oh, und es ist übrigens nicht nur WLAN – dein Smart-TV läuft höchstwahrscheinlich mit ACR (Automatic Content Recognition), das Frame für Frame fingerprinted, was du schaust, und nach Hause telefoniert. Dein Smart Speaker lauscht ständig nach Aktivierungswörtern, was bedeutet, dass er *immer* zuhört. BLE-Beacons tracken dich durch Einkaufszentren und Flughäfen. In Werbung eingebettete Ultraschall-Beacons können dein Fernsehverhalten mit deinen Smartphone-Aktivitäten verknüpfen. Das „Smart Home“ ist einfach nur ein Überwachungs-Zuhause mit besserem Marketing.

Bis 2027 wird WiFi-Sensing in den meisten neuen Routern Standard sein. Die Infrastruktur für Ambient Sensing in globalem Maßstab wird *genau jetzt* standardisiert, und die meisten Menschen haben keinen blassen Schimmer.

### Wo du hingehst
[Flock Safety](https://www.aclu.org/campaigns-initiatives/get-the-flock-out) hat rund 75.000–100.000 ALPR-Kameras in den USA im Einsatz, die täglich über 150 Millionen Fahrzeuge scannen. Sie erstellen durchsuchbare Datenbanken darüber, welches Auto wann wo hinfährt – ohne Durchsuchungsbeschluss oder begründeten Verdacht. Nur Vibes und Risikokapital.

![The Invasion of Flock Cameras](https://youtu.be/A3cMU55dIIc?si=8BPTtjEkvlUURSpG)

Weniger als 1 % dieser Scans stehen in Verbindung mit einem echten Verbrechen. Die restlichen 99 %+ sind einfach nur... Daten. Wo du warst. Wann. Wie oft. Wer sonst noch da war. Wessen Auto neben deinem geparkt hat.

Und es sind nicht nur Autos – dein Smartphone sendet ununterbrochen. Funkzellentriangulation liefert einen groben Standort, aber Apps mit Standortberechtigungen (was ehrlich gesagt die meisten sind) bekommen GPS-Präzision. Googles Standortverlauf, Apples „Wichtige Orte“, dein Fitnesstracker, die Fotos, die du mit Geotagging machst – all das fügt sich zu einem ziemlich lückenlosen Bild von jedem Ort zusammen, an dem du je warst. Datenhändler kaufen dieses Zeug massenhaft auf und verkaufen es an jeden, der dafür zahlt, einschließlich Cops, die keine Lust haben, sich einen Durchsuchungsbeschluss zu holen.

Die ACLU zählte [82 gekündigte Flock-Verträge](https://mrsc.org/stay-informed/mrsc-insight/april-2026/restrictions-flock-cameras) in 28 Bundesstaaten zwischen 2021 und Mai 2026, davon 39 allein in den ersten fünf Monaten des Jahres 2026. Die Leute wehren sich, was gut ist! Aber die Infrastruktur steht bereits, und selbst wenn Flock morgen stirbt, existiert die Blaupause für das nächste Unternehmen.

### Was du denkst
Meta hat im Juni 2026 [Brain2Qwerty v2](https://www.marktechpost.com/2026/06/30/meta-ai-releases-brain2qwerty-v2-a-non-invasive-meg-brain-to-text-pipeline-decoding-typed-sentences-at-61-word-accuracy/) veröffentlicht. Es dekodiert getippte Sätze aus der Gehirnaktivität mit einer Wortgenauigkeit von 61–78 % mithilfe von nicht-invasivem MEG-Scanning. Ach ja, und [TRIBE v2](https://ai.meta.com/blog/tribe-v2-brain-predictive-foundation-model/) sagt Gehirnreaktionen auf Video, Audio und Sprache voraus. Man muss Zucc einfach dafür lieben, dass er die dystopischsten Tech-Produkte aller Zeiten raushaut, was?

Währenddessen implantiert Neuralink Chips in menschliche Gehirne und Synchrons Stentrode befindet sich bereits in klinischen Studien an Menschen. Das Narrativ der „medizinischen Anwendungen“ ist durchaus berechtigt (gelähmten Menschen bei der Kommunikation zu helfen, ist wirklich großartig), aaaaaber die Dual-Use-Implikationen sind... tja, die haben es in sich (address me vro 🐘). Sobald man Absichten auslesen kann, kann man Absichten auch *erkennen*. Gedankenverbrechen wird von Orwell zu einem reinen Ingenieursproblem – und JUNGE, ich wette so gut wie alles darauf, dass ein großer Teil des Verteidigungs- und Sicherheitssektors _irgendwie_ massiv darin investiert ist.

Aktuell erfordert Brain2Qwerty noch so etwas wie einen 2-Millionen-Dollar-MEG-Scanner, der in einem magnetisch abgeschirmten Raum verschraubt ist, um tatsächlich nutzbar zu sein, aber jeder mit auch nur einer halben Gehirnzelle sieht ganz klar, wohin die Reise geht: Jede Sensorik startet teuer und wird billig, und es ist nur eine Frage der Zeit, bis wir tragbare Gehirn-Scanner haben. MRTs brauchten früher ein eigenes Gebäude, heute gibt es tragbare Varianten. WiFi-Sensing begann in Forschungslaboren, bevor es in deinem \$50-Router landete. Gebt dem Ganzen 15–20 Jahre und irgendeine Version davon wird Konsumentenstandard sein, wahrscheinlich vermarktet als „Wellness“- oder „Fokus“-Gerät.

Die letzte Zuflucht des Menschen – der eigene Verstand – wird angreifbar. Und im Gegensatz zu jeder anderen Schicht der Überwachung kann man sein Gehirn nicht einfach zu Hause lassen.

## Selbstbestimmung und ihr Verlust

Hier ist, was mich mehr stört als jede spezifische Technologie: Menschen *geben das freiwillig auf*, natürlich nicht auf einen Schlag, sondern schrittweise, Bequemlichkeit für Bequemlichkeit, Feature für Feature.

„Ich habe nichts zu verbergen.“ „Das sind doch nur Metadaten.“ „Der Algorithmus kennt mich besser als ich mich selbst.“ „Ach, kein Bock drüber nachzudenken, lass mich vor dem Schlafen einfach noch dieses eine Reel gucken.“

Jeder einzelne Tauschhandel scheint klein zu sein – was macht schon eine Berechtigung mehr, ein weiterer Sensor, eine zusätzliche Datenbank? Aber die Deals summieren sich, und irgendwann blickst du auf und merkst, dass du die Fähigkeit weggegeben hast, zu existieren, ohne beobachtet, katalogisiert und vorhergesagt zu werden.

Das ist nicht einmal neu oder beispiellos, jede Zivilisation hat das getan: Rom tauschte die republikanische Ordnung gegen kaiserliche Stabilität ein, das mittelalterliche Europa tauschte lokale Autonomie gegen feudalen Schutz ein, und _wir_ tauschen Privatsphäre gegen Bequemlichkeit. Das Muster wiederholt sich, weil es kurzfristig für die meisten Menschen die meiste Zeit *funktioniert* (und das verdammt gut) – bis es das eben nicht mehr tut. Und bis dahin ist die Kontrollinfrastruktur längst aufgebaut und es ist zu spät, umzukehren.

## Sie müssen nur einmal gewinnen

Man kann gegen Chat Control ankämpfen. Man kann im Parlament auftauchen, seinen EU-Abgeordneten schreiben, Kampagnen organisieren, die [EFF](https://www.eff.org/deeplinks/2025/12/after-years-controversy-eus-chat-control-nears-its-final-hurdle-what-know) finanzieren, digitale Bürgerrechtsgruppen unterstützen (und das solltet ihr absolut tun, denn all das zählt) – aber hier ist die unbequeme Wahrheit, die niemand hören will: Politische Lösungen sind ziemlich vorübergehend (zumindest im Moment).

Du gewinnst eine Abstimmung und sie setzen die nächste an. Du bringst eine Verordnung zu Fall und sie benennen sie um und versuchen es erneut. Das Votum vom 9. Juli war nicht einmal die erste Abstimmung zur Chatkontrolle und es wird nicht die letzte sein. Diese Idioten versuchen Varianten davon seit den frühen 2000ern, der ganze Mist tritt jetzt nur offen zutage, das ist alles. Die Überwachungsseite hat permanente Anreize (Regierungen wollen sehen, Konzerne wollen wissen) und der Druck bleibt konstant bestehen, immer auf der Suche nach der nächsten Lücke. Die Privatsphäre-Seite muss jedes einzelne Mal gewinnen, aber die Überwachungsseite... _sie_ muss nur ein einziges Mal gewinnen.

Dieser Kampf wird unfair bleiben, solange Überwachung *architektonisch möglich* ist. Der einzig richtige und gangbare Weg, ein gezinktes Spiel zu gewinnen, besteht also darin, _das Spiel komplett zu verändern_.

Wenn Massenüberwachung technisch möglich ist, wird sie irgendwann Realität – vielleicht nicht in diesem Parlament, vielleicht nicht unter dieser Regierung, aber irgendwann ganz sicher. Denn, liebe Leser, die Anreize sind zu stark und die Wachsamkeit, die nötig wäre, um sie für immer zu verhindern, ist unhaltbar. Niemand kann über Jahrzehnte hinweg empört bleiben – schaut euch doch nur das ganze Israel/Palästina-Debakel an: Ja, die Leute waren empört für was, ein paar Monate? Aber mit der Zeit kommt immer der nächste Empörungs-Köder, das nächste Problem. Und das berücksichtigt noch nicht einmal die Tatsache, dass die Wohlstandsschere die Menschen so sehr dazu zwingt, den Kopf in die Arbeit zu stecken, dass sie es sich _buchstäblich_ nicht leisten können, über irgendetwas abseits ihres Einkommens nachzudenken.

Die Lösung besteht daher darin, Überwachung *architektonisch unmöglich* zu machen – nicht illegal oder reguliert, sondern faktisch *unmöglich*. Baut Systeme, bei denen es selbst dann, wenn die Regierung mit einem Beschluss vor der Tür steht, nichts zu übergeben gibt, weil die Daten schlicht nirgendwo in lesbarer Form existieren.

Das bedeutet:
- **Ende-zu-Ende-Verschlüsselung**, bei der Anbieter Inhalte *nicht* mitlesen können, selbst wenn sie dazu verdonnert werden
- **Dezentrale Netzwerke**, bei denen es keinen zentralen Punkt zum Überwachen oder Vorladen gibt
- **Client-Software**, die von den Nutzern kontrolliert wird, nicht von Konzernen oder Regierungen
- **Open Source**, damit der Code auditiert werden kann und wir uns nicht auf bloße Ehrenwörter verlassen müssen

Teile davon haben wir bereits – Signal existiert, Tor existiert, [Briar](https://briarproject.org/), [Session](https://getsession.org/) und [SimpleX](https://simplex.chat/) existieren –, aber keines davon hat sich auf breiter Front durchgesetzt. Und der Grund ist schmerzhaft simpel: **Bequemlichkeit**.

## Bequemlichkeit gewinnt immer
Privacy-Tech verliert, weil es schwerer zu bedienen ist als die überwachte Alternative – und das ist kein Bug, sondern gewissermaßen die zentrale Herausforderung dieser Art von Technologie. Zentralisierte Systeme sind von Natur aus *bequemer*, weil sie ohne Einschränkungen auf User Experience optimieren können, während dezentrale Systeme sich ohne Koordinator abstimmen müssen, was zusätzliche Reibung erzeugt.

Die Zahlen sind ebenfalls verdammt brutal:
- Mastodons Twitter-Exodus 2022 (3,5 Mio. → 6 Mio. Anmeldungen) brach innerhalb von Monaten in sich zusammen. Die Downloads sanken um 99 % und die Retention lag bei etwa 37 %.
- Tor erreicht durchschnittlich ~5 Mbps im Vergleich zu ~250 Mbps bei VPNs. 50-mal langsamer.
- Web3 dApps verzeichnen eine jährliche Retention von 7 %. 75 % der Nutzer springen ab, bevor sie ihre erste Transaktion abgeschlossen haben.

Das Muster ist eindeutig: Wenn Privatsphäre (oder eigentlich irgendetwas) Anstrengung erfordert, entscheiden sich die Menschen für Bequemlichkeit. Weil wir dazu neigen, kognitive Leichtigkeit gegenüber Belastung zu wählen, und wir von Natur aus faule Säcke sind.

Aber es gibt Ausnahmen:
- **Signal** hat gewonnen, weil es so einfach ist wie iMessage. Null Nutzerinteraktion für Verschlüsselung erforderlich.
- **WhatsApp** hat das Signal Protocol für 3 Milliarden Nutzer ausgerollt, ohne dass irgendjemand Schlüssel verwalten musste.
- **Passkeys** sind *schneller* als Passwörter – 8 Sekunden gegenüber 69 Sekunden für Passwort+2FA.

Die Lektion: **Privacy-Tech gewinnt, wenn Nutzer sich nicht aktiv dafür entscheiden müssen**. Wenn der private Weg zugleich der einfachste Weg ist.

## Die andere Seite: Den Brunnen vergiften
Verteidigung ist also die eine Sache, aber es gibt noch einen _anderen_ Blickwinkel, über den ich nachgedacht habe: Was wäre, wenn man sich nicht bloß vor Überwachung versteckt, sondern den *Output* der Überwachung unzuverlässig macht?

Wenn die Daten aller vergiftet sind (künstlich verrauschte Standorte, randomisierte Fingerprints oder randomisierte/verschleierte Suchanfragen), werden die Datensätze, auf denen die Überwachungsmodelle trainiert werden, unbrauchbar. Gutes altes „Garbage in -> Garbage out“-Prinzip. Man kann kein Profil über jemanden erstellen, wenn dessen Profil größtenteils aus Bullshit-Rauschen besteht.

Das Problem ist, dass naive Verschmutzung erkennbar ist. Das WWW'25-Paper [„Breaking the Shield“](https://dl.acm.org/doi/10.1145/3696410.3714713) hat erfolgreich ALLE Fingerprint-Randomisierungsmechanismen über 18 Extensions und 5 Browser hinweg ausgehebelt. In diesem Fall wird der Randomisierer selbst zum Fingerprint, weil die Gruppe derer, die solche Randomisierer nutzen, klein genug ist, um unterscheidbar zu sein. Wenn nur 0,1 % der Nutzer einen Fingerprint-Randomisierer laufen lassen, ist die Zugehörigkeit zu diesen 0,1 % an sich schon eine identifizierende Information lmao. Okay, das scheidet für sich allein also schon mal aus.

TrackMeNot, der Verschleierer für Suchanfragen, liegt im Grunde im Koma. [ML-Klassifikatoren können echte Anfragen von Ködern](https://link.springer.com/chapter/10.1007/978-3-642-14527-8_2) mit einer Genauigkeit von ~48–52 % bei einer Falsch-Positiv-Rate von nahezu null trennen, weil menschliche Suchmuster *eigenartig* und schwer überzeugend zu fälschen sind. Der naive Ansatz, einfach zufälliges Rauschen einzuschleusen, reicht nachweislich nicht aus.

[HARPO](https://arxiv.org/pdf/2111.05792), der auf Reinforcement Learning basierende Verschleierer, erzielt eine 16-mal bessere Privatsphäre pro Einheit injiziertem Traffic, was eigentlich ziemlich cool ist – aber er erfordert kontinuierliche ML-Modell-Updates, um der Erkennung einen Schritt voraus zu sein. Das bedeutet, dass dieser Weg ein fortlaufendes Wettrüsten ist und kein gelöstes Problem.

Der Tor-Ansatz, alle identisch aussehen zu lassen anstatt zu randomisieren, ist robuster, weil man in der Masse untertaucht, statt als „die Person, die versucht, sich zu verstecken“ herauszustechen. Aber er bringt brutale UX-Kompromisse mit sich, auf die die meisten Leute schlicht keinen Bock haben.

Die wirkliche Antwort ist also wahrscheinlich eine Mischung aus Defensive (Überwachung unmöglich machen) + Offensive (Überwachung unzuverlässig machen). Ich [arbeite tatsächlich an etwas in diesem Bereich](https://github.com/NovusEdge/ocloak) und werde später mehr dazu teilen, aber die Grundidee ist: Hochentwickelte Verschmutzung, die Persona-kohärent, menschlich getaktet und adaptiv ist, könnte die Kosten der Überwachung so weit in die Höhe treiben, dass sie sich wirtschaftlich schlicht nicht mehr lohnt.

## Richtungen, keine fertigen Antworten
Ich habe keine vollständige Antwort und ehrlich gesagt bezweifle ich, dass irgendjemand sie hat – aber es gibt eine klare Richtung, in die sich all das bewegt. Ich will versuchen, etwas Licht darauf zu werfen:

**Vertrauen dezentralisieren, nicht zwingend die Infrastruktur.** Das ist das Signal-Modell – sie nutzen zentrale Server für die Zustellung (schnell, zuverlässig, gute UX), dezentralisieren aber das kryptografische Vertrauen (sie können deine Nachrichten buchstäblich nicht lesen). Das ist pragmatisch und es funktioniert. Der puristische Ansatz, alles zu dezentralisieren, bedeutet oft nur, auch die Probleme zu dezentralisieren.

**Privatsphäre zum Standard machen.** Keine Einstellung, die tief in einem Menü vergraben ist. Kein „Privater Modus“, den man erst aktivieren muss. Der Standard. WhatsApp hat das mit E2E-Verschlüsselung vorgemacht – 3 Milliarden Nutzer bekamen verschlüsselte Nachrichten, ohne etwas über Schlüsselverwaltung zu wissen oder sich darum scheren zu müssen. Das ist das Vorbild.

**Das Cold-Start-Problem lösen.** Netzwerkeffekte machen neue Privacy-Tools gnadenlos platt. Du kannst den sichersten Messenger der Welt bauen, aber wenn deine Freunde nicht darauf sind, wirst du ihn nicht nutzen. Man braucht Interoperabilität (Matrix-Föderation, Bridges zu bestehenden Plattformen) oder man muss auf einer bestehenden Welle reiten (Signal wuchs, weil WhatsApp suspekt wurde).

**In UX investieren, als wäre sie das gesamte Produkt.** Weil sie es ist. Niemand schert sich um dein Threat Model, wenn die App nervig zu bedienen ist. Die Crypto/Privacy-Community war darin historisch gesehen furchtbar – diese „Nimm doch einfach PGP“-Attitüde, obwohl PGP ein UX-Albtraum ist, bei dem selbst Sicherheitsforscher Mist bauen.

P2P-Messaging hat Optionen – Session, SimpleX, Briar, Matrix –, aber sie alle haben Haken. Session ist nach einer Datenanfrage der australischen Polizei in die Schweiz umgezogen (gut), hat aber immer noch eine langsamere Zustellung als zentraler Push (schlecht). SimpleX hat keine persistenten Identifikatoren (gut), aber nur zwei Core-Entwickler (bedenklich für die langfristige Wartung). Briar funktioniert über Tor und Bluetooth-Mesh (gut), gibt es aber nur für Android und rein textbasiert (einschränkend). [Veilid](https://veilid.com/) sieht vielversprechend aus, steckt aber noch in den Kinderschuhen.

Mesh-Netzwerke wie [Meshtastic](https://meshtastic.org/) sind heute mit Hardware für rund ~\$30 nutzbar, was ziemlich cool für netzunabhängige Koordination und Katastrophenszenarien ist, aber offensichtlich kein Ersatz für Kommunikation auf Mobilfunk-Niveau.

Dezentrale Identität nimmt ordentlich Fahrt auf – die EU-eIDAS 2.0 erzwingt die Akzeptanz von DID-Wallets ab Januar 2026 –, aber Block/Square hat ihre Web5-DID-Initiative wegen der UX-Reibung bei Wallets eingestampft. Das Bequemlichkeitsproblem killt selbst Projekte mit Hundert-Millionen-Dollar-Finanzierung. Niemand ist davor gefeit.

## Worum es hier eigentlich geht
Ich möchte klarstellen, was hier auf dem Spiel steht, denn hier geht es nicht darum, Verbrechen zu vertuschen, und genausowenig darum, hirnrissige illegale/extremistische Aktivitäten zu befeuern, die uns allen schaden. Nein, *hierbei* geht es um die Asymmetrie der Macht zwischen Individuen und Institutionen.

Eine Regierung, die alles sehen kann, kann alles kontrollieren – nicht durch Gewalt (das ist teuer und erzeugt Widerstand), sondern durch Vorhersage und Prävention. Wenn man weiß, was jemand tun wird, bevor er es tut, kann man dessen Optionen unsichtbar lenken. Ein Konzern, der alles weiß, kann alles manipulieren – nicht durch Zwang (das ist illegal), sondern durch Optimierung: Wenn man weiß, was jemand will, bevor er es selbst weiß, kann man das Bedürfnis erzeugen und die Lösung verkaufen.

Der Endpunkt totaler Überwachung ist kein klassischer Polizeistaat, sondern etwas Subtileres und viel schwerer zu Bekämpfendes: eine Welt, in der das Abweichen von vorhergesagtem Verhalten zunehmend mit Kosten verbunden ist, in der Konformität der Weg des geringsten Widerstands ist und in der der Raum für echte freie Entscheidungen langsam schrumpft. Das ist die Welt, die wir gerade bauen – eine Bequemlichkeit nach der anderen.

## Schlussgedanken
Schaut, ich sage euch nicht, dass ihr Facebook löschen und in eine Hütte im Wald ziehen sollt oder jede App wie eine Wanze behandeln müsst. Darum geht es hier nicht, und für die meisten von uns ist das sowieso unrealistisch.

Was ich sagen will: Die Infrastruktur, die gerade um euch herum aufgebaut wird – das WLAN, das durch Wände sieht, die Kameras, die jedes Kennzeichen erfassen, die Apps, die vielleicht bald vor der Verschlüsselung scannen, die BCIs, die lernen, Gedanken selbst zu lesen –, nichts davon wird mit Blick auf eure Interessen gebaut. Es wird gebaut, weil es machbar ist, weil jemand dafür bezahlt und weil die Leute, die es bauen, nicht mit den Konsequenzen leben müssen, so wie ihr es tun müsst.

Die politischen Kämpfe sind wichtig und man sollte sich daran beteiligen, wann immer man kann, aber sie sind bestenfalls Rückzugsgefechte. Der einzige Weg aus dieser Schleife heraus besteht darin, Überwachung selbst technisch unmöglich zu machen – nicht reguliert, nicht illegal, sondern *unmöglich* – und den privaten Weg so reibungslos zu gestalten, dass seine Wahl sich nicht wie ein Opfer anfühlt.

**Was könnt ihr also konkret tun?** Nutzt Signal – es ist kostenlos, es funktioniert und jeder zusätzliche Nutzer stärkt das Netzwerk. Unterstützt Organisationen wie EFF, ACLU, Access Now und noyb, die die politischen Schlachten schlagen, selbst wenn diese Siege letztlich nur temporär sind. Achtet auf Standardeinstellungen und fragt nach dem Warum, wenn ein neuer Dienst nach Berechtigungen verlangt. Und sprecht mit Leuten über dieses Zeug, denn der größte Vorteil, den Überwachung derzeit hat, ist Gleichgültigkeit. Die meisten Menschen haben absolut keine Ahnung, was um sie herum gerade hochgezogen wird.

**Und wenn ihr Dinge entwickelt?** Macht Privatsphäre zum Standard. Investiert in UX, als wäre sie das gesamte Produkt – denn im Grunde ist sie genau das. Denkt architektonisch darüber nach, ob euer System erpresst oder kompromittiert werden kann und was passiert, wenn (nicht falls) sich die rechtlichen Rahmenbedingungen ändern.

Wir sind noch lange nicht am Ziel, nicht einmal annähernd. Aber ich glaube, wir können es schaffen, wenn genügend Leute anfangen, in diese Richtung zu bauen, statt sich nur über den Status quo zu beschweren.

Bleibt wachsam da draußen.

~ A.
