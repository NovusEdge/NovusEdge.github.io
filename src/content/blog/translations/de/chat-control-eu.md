---
title: "Reden wir über das EU-Chatkontroll-Gesetz"
date: 2026-07-14
tags: [privacy, surveillance, eu, encryption, p2p, essay]
description: "Warum mir die Chatkontrolle Sorgen macht, was andere Formen der Überwachung damit zu tun haben und welche Datenschutz-Tools wir meiner Meinung nach bauen sollten."
toc: true
---

## 314 > 276, aber wer zählt schon mit

Am 9. Juli 2026 stimmte das Europäische Parlament [über die Verlängerung der Chatkontrolle 1.0 ab](https://andreafortuna.org/2026/07/10/chatcontrol-survives/). Bei der ersten Abstimmung stimmten 314 Abgeordnete für die Ablehnung des Standpunkts des Rates und 276 dagegen. Für die Hürde hat es trotzdem nicht gereicht.

In der zweiten Lesung erfordert eine Ablehnung die absolute Mehrheit der Parlamentsmitglieder: 361 Stimmen. Eine Mehrheit der abgegebenen Stimmen genügte nicht. Der [Bericht des Parlaments über die Abstimmung](https://www.europarl.europa.eu/news/en/press-room/20260706IPR46318) stellt diesen Unterschied klar dar. Ich verstehe die Regel, frustrierend finde ich das Ergebnis trotzdem.

Diese Abstimmung betraf die Übergangsregelung, die freiwilliges Scannen erlaubt. Die vorgeschlagene dauerhafte Verordnung, meist Chatkontrolle 2.0 genannt, ist Gegenstand separater Verhandlungen. Mir geht es um beides, insbesondere um jeden Vorschlag, der das Scannen privater Nachrichten vorschreiben würde.

## Es geht nicht nur um deine DMs

Die Chatkontrolle ist nur eine von mehreren Möglichkeiten, wie private Aktivitäten für Institutionen zugänglich gemacht werden. Bei meiner Arbeit an Privacy-Hardware stoße ich ständig auf weitere. Sie haben unterschiedliche Fähigkeiten und Grenzen, aber zusammen beeinflussen sie, wohin sich ein Mensch bewegen und was er tun kann, ohne eine durchsuchbare Spur zu hinterlassen.

### Was du sagst

Client-Side-Scanning untersucht Inhalte auf einem Gerät vor der Verschlüsselung oder nach der Entschlüsselung. Ende-zu-Ende-Verschlüsselung schützt die Nachricht zwar bei der Übertragung, hindert Software auf den Endgeräten aber nicht daran, den Klartext zu prüfen.

Ein Wechsel des Netzwerks löst dieses Problem allein nicht. Eine App kann ein dezentrales Netzwerk nutzen und eine Nachricht trotzdem vor dem Versenden scannen. Ich möchte, dass Nutzer die Kontrolle über den Client behalten und gleichzeitig vor dem Abfangen von Nachrichten geschützt sind.

### Wo du schläfst

[802.11bf](https://www.ieee802.org/11/Reports/tgbf_update.htm) standardisiert WiFi-Sensing. Die IEEE hat den Standard [im September 2025 veröffentlicht](https://www.ieee802.org/11/email/stds-802-11/msg09024.html). Forschungssysteme können anhand von Veränderungen der Funksignale Bewegungen und unter bestimmten Bedingungen auch die Atmung oder die Körperhaltung ableiten. Diese Fähigkeiten hängen von Ausrüstung, Platzierung, Umgebung und Modell ab; die Veröffentlichung eines Standards rüstet nicht automatisch jeden Router damit aus.

Die [Posen-Rekonstruktionsarbeit der Carnegie Mellon](https://www.spatialintelligence.ai/p/your-wifi-can-see-you-heres-how) und Endverbrauchersysteme wie [Gamgee](https://newatlas.com/around-the-home/gamgee-wifi-home-security-system/) sind Beispiele, die man differenziert betrachten sollte. Eine Forschungsdemonstration und ein Bewegungsmelder für zu Hause messen nicht unbedingt dasselbe. Vodafones [Who's Home](https://www.vodafone.co.uk/help/account/how-do-i-use-whos-home) etwa beobachtet lediglich, wie sich Geräte mit dem Heim-WLAN verbinden. Das ist kein Beleg für Sensorik durch Wände hindurch.

Ich kenne auch jemanden an der Aalto-Universität, der an einem ML-basierten WiFi-Sensing-Detektor für das Militär arbeitet. Auch deshalb verfolge ich diesen Bereich aufmerksam.

Andere Geräte erfassen Daten noch direkter. Ein Fernseher mit automatischer Inhaltserkennung (ACR) kann identifizieren, was gerade läuft. Apps können Standortdaten sammeln, und Funk- oder Audio-Beacons lassen sich nutzen, um Geräte miteinander zu verknüpfen. Ein Lautsprecher, der lokal auf ein Wake-Word lauscht, ist nicht dasselbe wie das kontinuierliche Hochladen von Raumgesprächen. Die entscheidenden Fragen lauten: Was wird erfasst, wohin fließt es und wer kann es abrufen?

### Wo du hingehst

Das [Netzwerk automatischer Kennzeichenleser von Flock Safety](https://www.aclu.org/campaigns-initiatives/get-the-flock-out) macht Fahrzeugsichtungen standortübergreifend durchsuchbar. Meine Sorge ist, dass alltägliche Fahrten zu Datensätzen werden, die später für Zwecke abgefragt werden können, von denen der Fahrer nie etwas wusste.

![The Invasion of Flock Cameras](https://youtu.be/A3cMU55dIIc?si=8BPTtjEkvlUURSpG)

Ein Smartphone kann weitere Datensätze über Apps mit Standortzugriff, Fitness-Tracking und mit Geotags versehene Fotos beisteuern. Ihre Datenschutzeigenschaften sind unterschiedlich, aber in Kombination können solche Datensätze viel mehr verraten, als eine einzelne Berechtigungsanfrage vermuten lässt.

Es gibt Gegenwehr. Ein Bericht über [Einschränkungen für Flock-Kameras](https://mrsc.org/stay-informed/mrsc-insight/april-2026/restrictions-flock-cameras) verzeichnet 82 gekündigte Verträge in 28 US-Bundesstaaten zwischen 2021 und Mai 2026, davon 39 in den ersten fünf Monaten von 2026. Ich hoffe, dass diese Bestrebungen Erfolg haben. Außerdem wünsche ich mir verbindliche Grenzen für die Datenerfassung und -speicherung, die auch dann greifen, wenn der nächste Anbieter auf den Markt drängt.

### Was du denkst

Gehirn-Computer-Schnittstellen werfen noch spekulativere Fragen auf. Berichte über Metas [Brain2Qwerty v2](https://www.marktechpost.com/2026/06/30/meta-ai-releases-brain2qwerty-v2-a-non-invasive-meg-brain-to-text-pipeline-decoding-typed-sentences-at-61-word-accuracy/) beschreiben das Dekodieren getippter Sätze aus MEG-Aufzeichnungen. [TRIBE v2](https://ai.meta.com/blog/tribe-v2-brain-predictive-foundation-model/) prognostiziert Gehirnreaktionen auf Reize. Keines dieser Ergebnisse bedeutet, dass man beliebige Gedanken aus der Ferne lesen könnte.

Jemandem über eine Gehirnschnittstelle bei der Kommunikation zu helfen, ist eine absolut lohnende Anwendung. Trotzdem möchte ich wissen, wer die Kontrolle über die Aufzeichnungen hat und ob der Zugriff darauf zur Voraussetzung für eine Anstellung, eine Behandlung oder die Nutzung eines Produkts werden kann.

Auch der MEG-Aufbau spielt eine Rolle: Teure Geräte in einem abgeschirmten Raum sind meilenweit von einem Wearable für Endverbraucher entfernt. Ich weiß nicht, ob diese konkreten Technologien jemals portabel oder günstig werden, geschweige denn in welchem Zeitrahmen. Meine Sorge gilt der Frage, wie mit Einwilligung und Kontrolle umgegangen wird, während sich die Technologie weiterentwickelt.

## Selbstbestimmung und ihr Verlust

Die meisten Menschen begegnen der Datenerfassung durch kleine Entscheidungen: eine Berechtigung erteilen, ein praktisches Feature aktivieren, einen Standardwert akzeptieren, um einfach weitermachen zu können.

Das Gesamtbild, das sich daraus ergibt, ist schwerer zu erkennen. Man versteht vielleicht, warum eine Karten-App den Standort braucht, ohne damit einverstanden zu sein, dass ein Datenhändler das eigene Bewegungsprofil verkauft. Die Zustimmung zu einer Nutzung sollte nicht stillschweigend zur Erlaubnis für jede künftige Verwendung werden.

Ich glaube nicht, dass es hilft, jedes Risiko einfach noch lauter zu erklären. Die Leute haben Jobs, Familien und andere Dinge, um die sie sich kümmern müssen. Privacy-Tools müssen funktionieren, ohne ständige Aufmerksamkeit zu verlangen.

## Sie müssen nur einmal gewinnen

Schreibt euren EU-Abgeordneten, organisiert euch und unterstützt Organisationen wie die [EFF](https://www.eff.org/deeplinks/2025/12/after-years-controversy-eus-chat-control-nears-its-final-hurdle-what-know). Solche Bemühungen können Vorhaben stoppen und den Handlungsspielraum von Institutionen einschränken.

Was mir Sorgen macht, ist der enorme kontinuierliche Aufwand, den das erfordert. Ein abgewendeter Vorschlag kann wiederkommen, Regierungen wechseln und Unternehmen können ihre AGB ändern. Ich will technische Schutzmaßnahmen, die über all diese Änderungen hinweg wirksam bleiben.

Mein Ziel ist es, bestimmte Formen der Massenüberwachung architektonisch unmöglich zu machen: Ein Anbieter kann beispielsweise keinen Klartext herausgeben, den er nie besessen hat. Das verhindert nicht jeden Angriff auf ein Endgerät oder jede Form von Metadatenerfassung. Aber es beseitigt einen Punkt, an dem ein Zugriff sonst erzwungen werden könnte.

Ende-zu-Ende-Verschlüsselung, Clients, die man überprüfen und kontrollieren kann, und eine sparsamere Datenerhebung helfen alle weiter. Dezentralisierung kann manche zentralen Zugriffspunkte eliminieren, bringt aber auch Design- und Usability-Probleme mit sich. Open Source ermöglicht die Überprüfung, aber jemand muss diese Überprüfung auch tatsächlich durchführen.

Wir haben funktionierende Projekte, von denen wir lernen können, darunter Signal, Tor, [Briar](https://briarproject.org/), [Session](https://getsession.org/) und [SimpleX](https://simplex.chat/). Die Menschen dazu zu bringen, sie dauerhaft zu nutzen, ist ein weiterer Teil der Arbeit.

## Bequemlichkeit gewinnt immer

Ich möchte nicht, dass Datenschutz wie ein zweites Hobby betrieben werden muss. Wenn ein Messenger schwer zu installieren ist, Nachrichten unzuverlässig zustellt oder keiner deiner Freunde dort ist, hilft auch die beste Kryptographie nichts.

Voreinstellungen können viel bewirken. Signal und WhatsApp ermöglichen es, verschlüsselte Nachrichten zu senden, ohne für jede Unterhaltung Schlüssel verwalten zu müssen. Der Schutz ist einfach Teil der ganz normalen Nutzung.

Genau das ist die Art von Nutzererlebnis, auf die ich hinarbeiten möchte. Man sollte sich für ein datenschutzfreundliches Tool entscheiden können, weil es seinen Zweck hervorragend erfüllt, ohne sich mit einer schlechteren Version von allem abfinden zu müssen, was man ohnehin schon nutzt.

## Die andere Seite: Den Brunnen vergiften

Mich interessiert auch die Frage, ob wir gesammelte Daten weniger nützlich machen können. Schein-Suchanfragen, künstliche Standorte oder fingierte Gerätesignale könnten das Profiling stören, sofern der Datensammler sie nicht mit geringem Aufwand von echten Aktivitäten trennen kann.

Diese Bedingung ist allerdings schwer zu erfüllen. Das WWW'25-Paper [„Breaking the Shield“](https://dl.acm.org/doi/10.1145/3696410.3714713) greift die Randomisierung von Fingerprints über 18 Erweiterungen und fünf Browser hinweg an. Ein markanter Zufallsgenerator kann am Ende selbst wieder dazu beitragen, den Nutzer zu identifizieren.

Frühere [Arbeiten zur Trennung echter Suchanfragen von TrackMeNot-Dummys](https://link.springer.com/chapter/10.1007/978-3-642-14527-8_2) werfen ein ähnliches Problem auf. Rauschen hinzuzufügen beweist noch nicht, dass sich der Angreifer davon auch wirklich täuschen lässt.

[HARPO](https://arxiv.org/pdf/2111.05792) setzt auf Reinforcement Learning zur Verschleierung und berichtet über eine bessere Effizienz als die Vergleichsmodelle. Ich würde gerne wissen, wie dieser Vorteil standhält, wenn sich der Sammler anpasst. Nutzer einander angleichen zu lassen, wie es der Tor Browser versucht, ist ein weiterer Ansatz mit ganz eigenen Usability-Einschränkungen.

Ich [arbeite in diesem Bereich an ØCLOAK](https://github.com/NovusEdge/ocloak). Die Hypothese lautet: Kohärente, gut getimte Dummys und gezielte Anpassungen der Sensorsignale könnten die Datenerfassung teurer oder unzuverlässiger machen. Ob das zu vertretbaren Kosten funktioniert, muss erst noch gemessen werden.

## Ansätze statt fertiger Antworten

Einige praktische Richtungen scheinen mir lohnenswert.

Verschlüsselung und Sparsamkeit sollten im ganz normalen Ablauf integriert sein. Eine Datenschutzeinstellung, die die meisten nie finden, schützt sie auch nicht. Die zentralen Relay-Server von Signal zeigen zudem, warum man die Netzwerktopologie und den Zugriff auf Nachrichteninhalte getrennt betrachten muss.

Man sollte den Leuten helfen, ihre Kontakte mitzubringen. Föderation und Bridges können die Verbreitung erleichtern, aber eine Bridge ändert auch, wer Zugriff auf eine Nachricht hat. Das muss für die nutzende Person klar ersichtlich sein.

Installation, Zustellung, Wiederherstellung und Barrierefreiheit müssen als integraler Teil der Datenschutzarbeit begriffen werden. Die Komplexität von PGP ist eine deutliche Warnung: Selbst ein starker Mechanismus nützt nichts, wenn Menschen ihn nicht zuverlässig bedienen können.

Projekte wie [Veilid](https://veilid.com/) und [Meshtastic](https://meshtastic.org/) erkunden alternative Kommunikationswege. Ein kleines Funk-Mesh kann für die lokale oder netzunabhängige Koordination nützlich sein, ohne gleich das Mobilfunknetz ersetzen zu müssen. Ich wünsche mir mehr solcher Experimente, evaluiert anhand der konkreten Szenarien, die sie tatsächlich unterstützen.

## Worum es eigentlich geht

Was mich stört, ist das Machtgefälle zwischen einer einzelnen Person und einer Institution, die jahrelange Aufzeichnungen über sie besitzt. Die Person weiß möglicherweise gar nichts von diesen Aufzeichnungen, kann sie nicht korrigieren und erfährt vielleicht nie, dass sie eine Entscheidung beeinflusst haben.

Das kann das Verhalten schon verändern, bevor überhaupt Zwang ausgeübt wird. Menschen meiden bestimmte Gespräche, Kontakte oder Orte, wenn sie damit rechnen müssen, dass diese Entscheidungen aufgezeichnet und später beurteilt werden. Ich möchte Raum zum Leben haben, ohne jede ganz gewöhnliche Handlung vor einer Datenbank rechtfertigen zu müssen, in die ich keinen Einblick habe.

## Schlussbemerkungen

Für meine eigene Arbeit sind die Fragen ziemlich konkret: Welche Informationen braucht das System, wie lange speichert es sie und was kann ein Anbieter oder Angreifer daraus ableiten? Ich möchte unnötige Datenerfassung von vornherein vermeiden, statt zu versuchen, ein immer größeres Archiv abzusichern.

Datenschutzfreundliche Tools zu nutzen und Bürgerrechtsorganisationen zu unterstützen, hilft beides. Genauso wie diese Tools so benutzerfreundlich zu gestalten, dass Freunde sie auch wirklich installiert lassen.

Ich habe keinen Masterplan, der jede Überwachung unmöglich macht. Ich möchte an den Bereichen arbeiten, die wir verhindern können, und messen, ob die experimentelleren Schutzansätze das halten, was wir uns von ihnen erhoffen.

~ A.
