---
title: "140 MW für Chat"
date: 2026-11-20
tags: [energy, grid, datacenters, finland, ai, inference]
draft: true
description: "Ich habe anhand veröffentlichter Nutzungs- und Energiezahlen zusammengerechnet, wie viel Strom all die Consumer-Chat-Assistenten verbrauchen. Im Schnitt kommt man auf etwa 140 MW, also etwa ein Viertelprozent des gesamten Rechenzentrumsstroms. Der Energiebedarf pro Nachricht ist die große Unbekannte, und die Nutzung hat sich im letzten Jahr verfünffacht."
toc: true
pixel: thinking
---

## Die Zahl

Hunderte Millionen Menschen nutzen jede Woche Chatbots, und KI-Campusse werden im Gigawatt-Bereich geplant. Allein Fingrid liegen Netzanfragen über mehr als 100 GW vor, verglichen mit einer finnischen Spitzenlast von unter 16 GW, und die meisten davon entfallen auf Rechenzentren ([Fingrid](https://www.fingrid.fi/globalassets/dokumentit/fi/ajankohtaista-tapahtumat/webinaari-liittymissopimushakemuksista-18.5.2026-esitysmateriaali.pdf)). Diese Anfragen sind nicht verbindlich, und die tatsächlich unterzeichneten Vereinbarungen für Rechenzentren belaufen sich auf etwa 5 GW. In Großbritannien entfallen rund 73 GW der 125 GW in der Anschluss-Warteschlange auf Rechenzentren ([Ofgem](https://www.ofgem.gov.uk/sites/default/files/2026-07/Proposed-data-centre-connection-reforms-curate-consultation-document.pdf)).

Ich wollte wissen, wie viel davon die Chatbots selbst benötigen, also habe ich es anhand veröffentlichter Zahlen nachgerechnet. Meine zentrale Schätzung ist, dass ChatGPT, Gemini, Claude, Meta AI und der Rest zusammen im Schnitt etwa **140 MW und in der Spitze 233 MW** ziehen. Dieser Durchschnitt entspricht etwa 0,25 % des Stroms, den Rechenzentren 2025 verbraucht haben.

Man sollte bedenken, dass das die heutige Chat-Last im Vergleich zu Campus-Projekten ist, die zwischen 2027 und 2030 ans Netz gehen sollen, und Chat wächst rasant. Aber heute macht Consumer-Chat nur einen kleinen Teil der Rechenzentrumslast aus. Der Rest entfällt auf Training, Enterprise- und API-Traffic, Consumer-KI abseits von Chat und allgemeine Cloud-Dienste. Keine veröffentlichte Quelle schlüsselt diesen Rest auf, deshalb kann ich nicht sagen, wie groß die einzelnen Anteile sind.

## Wie die Schätzung funktioniert

Die Schätzung besteht aus vier miteinander multiplizierten Werten, zuzüglich eines Spitzenlastfaktors.

| Eingabewert | Niedrig | Mittel | Hoch | Quelle |
|---|---|---|---|---|
| Wöchentliche ChatGPT-Nutzer | 900 Mio. | 900 Mio. | 900 Mio. | [OpenAI via TechCrunch](https://techcrunch.com/2026/02/27/chatgpt-reaches-900m-weekly-active-users) |
| Nachrichten pro Nutzer pro Tag | 3,67 | 5,5 | 11 | [OpenAI/NBER](https://cdn.openai.com/pdf/a253471f-8260-40c6-a2cc-aa93fe9f142e/economic-research-chatgpt-usage-paper.pdf) |
| Energie pro Nachricht | 0,24 Wh | 0,34 Wh | 1,0 Wh | [Google](https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference), Altman, [Epoch AI](https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use) |
| Alle Assistenten ÷ ChatGPT | 1,5 | 2,0 | 3,0 | Angenommen; [Similarweb via Momentic](https://momenticmarketing.com/blog/top-ai-chatbots) |
| Peak ÷ Mittelwert | 1,66 | 1,66 | 2,0 | Azure 2024 Conversation Trace |

Worauf die einzelnen Werte basieren:

- **Nutzer.** 900 Mio. stammt aus dem Februar 2026 und ist die aktuellste Zahl, die OpenAI bestätigt hat. Jedes Ergebnis skaliert linear damit.
- **Nachrichten.** Der niedrige Wert entspricht dem, was OpenAI gemeldet hat: 18 Milliarden Nachrichten pro Woche von 700 Millionen Nutzern im Juli 2025. Der mittlere und hohe Wert gehen davon aus, dass die Nutzung pro Person weiter gestiegen ist.
- **Energie.** Der niedrige Wert ist Googles Median für einen Gemini-Text-Prompt, inklusive Rechenzentrums-Overhead. Der mittlere Wert ist der von Sam Altman genannte Durchschnitt, ohne Angabe von Methodik oder Rahmenbedingungen. Der hohe Wert ist meine eigene Annahme für einen Mix mit etwas Reasoning und langem Kontext.
- **Andere Assistenten.** ChatGPT kommt im Oktober 2026 unter sieben Assistenten auf 56,6 % der Web-Visits, was einen Faktor von 1,77 ergibt. Diese Zählung berücksichtigt keine Apps, kein Meta AI innerhalb der Meta-Apps und keine chinesischen Inlandsassistenten.
- **Peak.** Er wird in stündlichen Abschnitten aus einer Woche von Azures LLM-Conversation-Trace aus dem Jahr 2024 berechnet, bei dem es sich um Enterprise-API-Traffic handelt. Der hohe Wert ist eine Annahme.

| Szenario | Durchschnitt | Peak | Durchschnitt als Anteil am Rechenzentrums-Strom 2025 |
|---|---|---|---|
| Niedrig | 50 MW | 82 MW | 0,09 % |
| Mittel | 140 MW | 233 MW | 0,25 % |
| Mein hohes Szenario | 1.238 MW | 2.475 MW | 2,2 % |

![Werte verschieben, um die Megawatt zu sehen](/figures/chat-power-calculator)

Die Rechenzentrumszahl basiert auf den 485 TWh der IEA für 2025, was einem Durchschnitt von etwa 55 GW entspricht ([IEA](https://iea.org/reports/key-questions-on-energy-and-ai/executive-summary)). Das [Skript](/assets/blog/consumer-chat-demand.py) umfasst etwa 55 Zeilen einfaches Python, sodass man leicht eigene Eingabewerte einsetzen kann.

Die Energie pro Nachricht ist der Wert, dem ich am wenigsten traue, und er beeinflusst das Ergebnis am stärksten. Modellierungen Dritter veranschlagen für einen mittellangen GPT-5-Prompt 2,33 Wh bei minimalem Reasoning und 17,15 Wh bei hohem Reasoning ([Jegham et al.](https://arxiv.org/abs/2505.09598)). Belässt man alle anderen Eingabewerte auf dem mittleren Niveau, ergibt das im Schnitt etwa 1 GW bzw. 7 GW. Wenn die durchschnittliche Chat-Nachricht also wie ein Reasoning-Prompt aussieht, liegt Consumer-Chat schon heute im Gigawatt-Bereich.

## Eine grobe Untergrenze anhand von Googles Tokens

Im Mai 2026 gab Google an, monatlich über 3,2 Billiarden Tokens „across our surfaces“ zu verarbeiten ([Google](https://blog.google/innovation-and-ai/sundar-pichai-io-2026/)). Google definiert diese Zahl nicht genauer, die neben der Gemini-App auch KI-Funktionen in der Suche, Workspace und die API umfasst. Das entspricht etwa 1,2 Milliarden Tokens pro Sekunde.

DeepSeek hat seinen Produktionsdurchsatz veröffentlicht: etwa 73.700 Input-Tokens pro Sekunde pro 8-GPU-H800-Node beim Prefill oder etwa 14.800 Output-Tokens pro Sekunde beim Decode ([DeepSeek](https://github.com/deepseek-ai/open-infra-index/blob/main/202502OpenSourceWeek/day_6_one_more_thing_deepseekV3R1_inference_system_overview.md)). Rechnet man mit Epochs 1,5 kW pro GPU inklusive Overhead, kommt Googles Token-Strom im Schnitt auf etwa 240 bis 360 MW, wenn 80 bis 95 % der Tokens Input sind. DeepSeeks eigener Mix lag bei 78 % Input, was 370 MW ergibt. Bei 50 % Input sind es etwa 590 MW.

Ich würde das als Untergrenze betrachten. Die Zahlen von DeepSeek stellen einen Bestfall dar: ein stark optimiertes Modell bei großen Batch-Größen, 56 % der Input-Tokens aus dem Cache bedient und eine Flotte, die ungenutzte Nodes nachts für das Training abstellt. Außerdem misst das etwas anderes als die Chat-Schätzung, da es alle Angebote von Google abdeckt, einschließlich des Enterprise-Bereichs. Was es jedoch zeigt: Selbst Googles gesamter Token-Strom kommt bei DeepSeeks Effizienz auf Hunderte Megawatt.

## Wachstum

Die Anzahl der ChatGPT-Nachrichten hat sich zwischen Juli 2024 und Juli 2025 mehr als verfünffacht. Mein mittleres Szenario geht von einem rund 1,9-fachen Wachstum seit Juli 2025 aus. Beim Tempo des letzten Jahres würde der Durchschnitt innerhalb eines Jahres die 700 MW überschreiten. Auf der Gegenseite gibt Google an, dass der Energiebedarf des medianen Text-Prompts zwischen Mai 2024 und Mai 2025 um das 33-Fache gesunken ist. Welcher dieser beiden Trends überwiegt, entscheidet darüber, ob Consumer-Chat im Bereich von Hunderten Megawatt bleibt.

## Finnland braucht ein halbes Megawatt

Gemessen am Nutzeranteil benötigt Finnlands Consumer-Chat im mittleren Szenario etwa **0,55 MW** in der Spitze und bis zu etwa 18 MW im hohen Szenario. Rein leistungsmäßig würde ein einzelner Standort mit 1 bis 5 MW in einer Stadt dafür ausreichen. Deutschland benötigt etwa 6 MW. Die USA benötigen rund 24 MW, oder etwa 71 MW, wenn man nach den Besuchen auf chatgpt.com rechnet, wo die USA etwa 22 % des Traffics bei 7 % der Nutzer ausmachen. Ein Anteil von 15 % am weltweiten Consumer-Chat (was Europas Anteil am weltweiten Rechenzentrumsstrom entspricht) zu hosten, würde etwa 35 MW erfordern. Das sind unter 5 % dessen, was Irlands Rechenzentren heute schon ziehen.

Die schiere Leistung ist allerdings nicht alles. Ein einziger Standort, der alle finnischen Nutzer bedient, müsste die Modelle sämtlicher Anbieter hosten, und jedes Modell benötigt seinen eigenen Serving-Pool. Mehrere kleine Pools an einem Standort würden jeweils teilweise im Leerlauf laufen.

Das ist ein zweischneidiges Schwert für das Argument, mit dem ich angefangen habe. Consumer-Chat braucht keine Riesen-Campusse. Ihn dorthin auszulagern entlastet das Stromnetz aber auch kaum, weil die Last von vornherein gering ist. Wenn man ihn also von kleinen innerstädtischen Standorten aus betreiben will, muss die Begründung auf etwas anderem aufbauen.

## Warum überhaupt Städte?

Ich schreibe gerade an einem Paper, das einen Campus mit 100 bis 300 MW mit einem städtischen Standort mit 1 bis 5 MW vergleicht, basierend auf finnischen Preislisten und Regularien. Hier ist der aktuelle Stand.

### Das Gebäude zählt weniger als die Auslastung

In Epochs Modell eines 1-GW-Campus in den USA machen Server und Netzwerk etwa 73 % der Gesamtbetriebskosten (TCO) aus, das Gebäude selbst etwa 16 % ([Epoch AI](https://epoch.ai/data-insights/ai-datacenter-cost-breakdown)). Ein kleiner Standort, dessen Bau pro MW 50 % teurer ist, erhöht die Kosten pro Token also nur um rund 8 %. Diese 50 % sind das obere Ende meiner Spanne, da niemand die tatsächlichen Zahlen veröffentlicht.

Der Haken ist die Auslastung. Eine rein nationale Flotte kann die Nachfrage nicht über Zeitzonen hinweg bündeln. Finnlands gemessener Spitzenlastfaktor liegt bei etwa 2,33 gegenüber 1,66 bei global gebündeltem Chat. Eine auf die finnische Spitze ausgelegte Flotte läuft im Schnitt also nur mit rund 43 % statt 60 %. Diese Lücke müssen kleine Standorte schließen, und das wiegt schwerer als das Gebäude.

### Kleine Standorte bekommen womöglich schneller Strom

Das finnische Gesetz sieht für das Verteilnetz eine angemessene Anschlussfrist von 6 Monaten ab Vertragsunterzeichnung vor, im Hochspannungsnetz sind es 24 Monate ([Finlex](https://www.finlex.fi/fi/lainsaadanto/2013/588)). Tatsächlich beobachtete Zeiten für Lasten von 1 bis 5 MVA konnte ich nirgends veröffentlicht finden.

Auch in den städtischen Netzen ist es eng. Der Verteilnetzbetreiber von Espoo gibt an, dass eigene neue Leitungen 6 bis 8 Jahre dauern, und 30 seiner 35 Haupttransformatoren sind voll, wenn man die Redundanzkapazität mit einrechnet.

### Bestehende Gebäude verbrauchen kein neues Land

Finnische Campus-Projekte benötigen nach den vier Projekten mit veröffentlichten Zahlen etwa 0,07 bis 0,22 Hektar Fläche pro MW IT-Last. Ein Standort in einem bestehenden Gebäude verbraucht gar keine.

Googles Standort Muhos, einer der finnischen Standorte, über die ich [im September geschrieben habe](/blog/googles-13-billion-in-finland), ließ etwa 330 ha roden oder vorbereiten, bevor die Umweltverträglichkeitsprüfung abgeschlossen war. Im Oktober forderte die finnische Genehmigungs- und Aufsichtsbehörde das Unternehmen auf, die vorbereitenden Arbeiten bis zum Abschluss der Prüfungen zu stoppen, was das Unternehmen auch tat ([LVV](https://www.sttinfo.fi/tiedote/72390663/lupa-ja-valvontavirasto-kehottaa-tuike-finland-oyta-keskeyttamaan-muhoksen-ja-kajaanin-datakeskushankkeiden-valmistelutoimet)).

### Was nicht hilft

- **Latenz.** Von Helsinki nach Stockholm sind es etwa 7 ms Round-Trip, und das MLPerf-Limit für die Time-to-First-Token liegt bei 450 ms.
- **Resilienz.** Bei den Beschädigungen der Ostseekabel wurden etwa ein Viertel der umgeleiteten Strecken zwischen Finnland und Deutschland um mehr als 3 ms langsamer, ohne zusätzlichen Paketverlust.
- **CO2-Bilanz.** Die finnische Fernwärme ist ohnehin schon kohlenstoffarm, daher bringt das Einspeisen von Server-Abwärme kaum Einsparungen.

## Außerhalb Finnlands entscheiden die Regularien

Ab wann ein Standort als „Großverbraucher“ gilt, variiert stark: von 1 MVA in Irland über 50 MW bei PJM bis hin zu 75 MW in Texas. Oberhalb dieser Grenze droht je nach Land eine Mischung aus Warteschlangen, Gebühren, Sicherheitsleistungen, eigener Stromerzeugung oder schlicht eine Ablehnung. Irland und Dänemark haben bereits Regeln dagegen, die Last eines einzelnen Betreibers in kleine Anschlüsse aufzuteilen, und PJM stuft verbundene Standorte eines Betreibers im Umkreis von einer Meile als eine einzige Last ein. Fingrid hat gefordert, finnische Netzanschlüsse projekt- oder gebietsbezogen als Ganzes zu bewerten, was den gleichen Effekt haben könnte. Wo solche Regeln gelten, kann eine Flotte kleiner Standorte als ein einziger Großverbraucher behandelt werden.

## Wo die Schätzung falsch liegen könnte

- **Die Energie pro Nachricht stammt größtenteils von den Anbietern selbst.** Googles 0,24 Wh ist ein Median für Text-Prompts auf den hauseigenen TPUs und nicht unabhängig verifiziert. Bei einer schiefen Verteilung liegt der Median unter dem Mittelwert, daher ist das niedrige Szenario wahrscheinlich zu niedrig angesetzt. Altmans 0,34 Wh wird ohne jede Methodik genannt.
- **Sie deckt nur Chat ab.** Agents, Coding-Tools, Bild- und Videogenerierung sowie die in Suchmaschinen und Social Feeds integrierten KI-Funktionen bleiben alle außen vor. Sie machen womöglich jetzt schon mehr aus als Chat.
- **Chinesische Inlandsassistenten fehlen in der Datenbasis.** Keine der von mir genutzten Quellen deckt sie ab.
- **Wöchentlich aktive Nutzer zählen Accounts, keine Personen.** Für die weltweite Gesamtzahl kürzt sich das heraus, da dort Nachrichten pro Account gerechnet werden, aber es kann die Länderanteile verzerren.
- **Finnlands Spitzenlastfaktor basiert auf einer kleinen Stichprobe** von etwa 500 finnischen Nutzern in einem öffentlichen Chat-Datensatz.

## Was helfen würde

Wer bessere Zahlen hat: immer her damit. Die Werte, die das Modell des Papers am stärksten beeinflussen würden, sind der Leerlauf-Stromverbrauch eines Serving-Racks, die Baukosten pro MW für flüssigkeitsgekühlte Standorte mit 1 bis 5 MW, die Auslastung echter Serving-Flotten und tatsächliche Anschlusszeiten für Lasten von 1 bis 5 MVA weltweit.

Das Paper wird mit dem vollständigen Kostenmodell, allen Quellen und Daten auf Zenodo veröffentlicht.
