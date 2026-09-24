---
title: "Fine-Tuning von OpenJev auf 62.695 A/B-Tests"
date: 2026-09-23
updated: 2026-09-24
tags: [ml, decision-models, calibration, open-weights, benchmarks]
draft: false
description: "Training eines Headline-Rankers auf den A/B-Tests von Upworthy, Korrektur der Evaluation und ein Vergleich mit Gemini sowie der Transfer auf Reddit."
---

Ich bin die 26 „Scoring and Ranking“-Projekte unter den rund 300 öffentlichen Projekten durchgegangen, die auf den neuen Entscheidungsmodellen aufbauen. Alle 26 kamen zu ihren Bewertungen, indem sie ein Modell fragten: Bewerte diesen Artikel, beurteile diesen Text, entscheide, ob dieses Dokument relevant ist.

Ich wollte das mit gemessenen Ergebnissen ausprobieren. Irgendwann möchte ich E-Mail-Betreffzeilen bewerten können; vorherzusagen, welche Überschrift mehr Klicks erzielt hat, schien mir daher ein nützlicher Ausgangspunkt zu sein.

Das Ergebnis ist **[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)**, ein Headline-Ranker mit 435 Millionen Parametern, der unter Apache 2.0 veröffentlicht wurde. Er bewertet Text in einem einzigen Forward Pass. Die Basis ist [`com-kotobalabs/open-jev-deberta-v3-large`](https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large), ein DeBERTa-v3-large, das auf typisierten Entscheidungen vortrainiert wurde. Die Gewichte sind online, falls du es ausprobieren willst.

| Metrik | Dieses Modell | Zufall |
|---|---|---|
| Jedes Paar innerhalb eines Tests, ungesehener Split | **0,689** | 0,524 |
| Paare mit statistisch eindeutigem Ergebnis (p<0,05) | **0,843** | 0,547 |
| Bereinigte Paare, nichts ähnelt dem Trainingstext | **0,671** | 0,524 |
| Wählt die beste aus 4–5 Varianten | **47,7%** | 24,9% |
| Vermeidet die schlechteste Variante | 90,3% | 75,1% |
| Reddit-Titel-Paare, out of Domain | 0,522 | 0,500 |

Nur 29 % der Paare erreichen statistische Signifikanz bei 5 %. Die erste Zeile enthält alle Paare, auch solche, bei denen der beobachtete Unterschied in der Klickrate reines Rauschen sein könnte. Die zweite beschränkt die Auswertung auf signifikante Paare.

Das Modell wurde auf 47.168 Arms aus 16.129 randomisierten Headline-Experimenten gefittet. Die obigen Ergebnisse nutzen Daten, auf denen es nicht trainiert wurde. Die meisten der folgenden Durchläufe nutzten eine engere Auswertung: ein Best-versus-Worst-Paar pro Test. Diesen Fehler habe ich erst später bemerkt; der Abschnitt zu den Korrekturen erklärt ihn genauer, und die obige Tabelle gibt die All-Pairs-Accuracy an.

## Daten und Methode

Das [Upworthy Research Archive](https://osf.io/jd64p/) ist seit 2021 unter CC BY öffentlich zugänglich. Es enthält 32.487 randomisierte Headline-A/B-Tests aus dem Zeitraum von Januar 2013 bis April 2015 mit 538 Millionen Zuweisungen sowie Impression- und Klickzahlen für jede Variante. Ja, das sind die Leute von „You won’t believe what happened next“. Ihre Überschriften haben einen sehr speziellen Schreibstil, aber das Archiv ermöglicht mir den Vergleich von Varianten mit echten Klicks.

Ich habe mit ModernBERT-large und einem Regressions-Head angefangen. Das Ziel war die geschrumpfte (shrunk) Logit-Klickrate, zentriert auf den Mittelwert des jeweiligen Tests. Der Artikel selbst treibt einen Großteil der Klickraten-Varianz, also wollte ich vorhersagen, wie eine Überschrift im Vergleich zu den anderen Überschriften für genau diesen Artikel abschnitt. Beta-Binomial-Shrinkage zieht die Schätzwerte in Richtung des Testmittelwerts, und zwar bei einem Arm mit 600 Impressions deutlich stärker als bei einem mit 20.000.

Der Durchlauf dauerte 25 Minuten auf einer einzelnen L4 und kostete etwa 40 Cent. Ich habe auf dem 2013–2014-Teil des Confirmatory-Splits trainiert, die Tests aus 2015 zurückgehalten und eine **paarweise Genauigkeit von 0,704** erzielt.

Zu der Zeit verglich ich das mit [0,544](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682) aus einer Arbeit einer Gruppe aus Toronto, die handgefertigte linguistische Features nutzte. Ihr Paper bezeichnet das Problem als „von Natur aus schwierig, nicht bloß eine Frage der Stichprobengröße“. Dieser Vergleich hatte ebenfalls Schwächen: Ihre Paarauswahl und Forschungsfrage wichen von meinen ab, wie ich unter Frühere Arbeiten erkläre.

Das erste Ergebnis habe ich als „Headline-Signal übersteht zwei Jahre Drift“ zusammengefasst.

## Split-übergreifende Evaluation

Ich dachte, das 2015er-Ergebnis würde zeigen, dass das Modell mit stilistischen Veränderungen von Überschriften im Laufe der Zeit zurechtkommt. Da ich das Modell später für E-Mails nutzen möchte, war ich daran interessiert, wie gut es jenseits der Trainingsdaten funktioniert.

Das Archiv hat drei Splits: Exploratory, Confirmatory und Holdout. Bisher hatte ich nur Confirmatory genutzt. Ein Test derselben Gewichte auf den anderen beiden ergab:

```
confirmatory 2015:  0.704
holdout:            0.637
exploratory:        0.624
```

Holdout und Exploratory lagen bei jeder von mir geprüften Effektstärkestufe innerhalb von 0,013 beieinander. Beide schnitten deutlich schlechter ab als das Confirmatory-Set von 2015.

![Paarweise Genauigkeit über drei Splits des Upworthy-Archivs. Die Confirmatory-2015-Linie liegt deutlich über Holdout und Exploratory, die eng beieinander liegen.](/assets/img/blog/decision-models/splits.png)

## Struktur der Splits

Die Dokumentation des Archivs erklärt, dass Tests den drei Splits zufällig zugewiesen werden. Jeder Split deckt fast den gesamten Zeitraum ab:

![Zwei Balken. Der erste zeigt einen sauberen chronologischen Split, erst Training, dann Test. Der zweite zeigt die tatsächliche Struktur: Trainings- und Testblöcke über den gesamten Zeitraum verschachtelt.](/assets/img/blog/decision-models/split-structure.png)

| Split | Arms | Datumsbereich | Anteil vor 2015 |
|---|---|---|---|
| confirmatory | 51.891 | 24.01.2013 → 30.04.2015 | 83,5% |
| holdout | 11.231 | 24.01.2013 → 29.04.2015 | 82,8% |
| exploratory | 10.804 | 26.01.2013 → 29.04.2015 | 83,8% |

Etwa 83 % des Holdouts stammten aus dem Trainingszeitraum, dennoch lag die Genauigkeit dort sieben Punkte unter dem 2015er-Endstück. Der Unterschied lag also nicht daran, dass neuere Überschriften schwieriger waren. Meine datumsbasierte Evaluation innerhalb von Confirmatory reichte nicht aus, um die von mir behauptete zeitliche Generalisierung zu belegen.

## Leakage und Label-Rauschen

Als Nächstes habe ich nach Data Leakage gesucht. Upworthy hat Artikel über mehrere Tests hinweg wiederverwendet, weshalb die zufällige Zuweisung ähnliche Überschriften sowohl im Training als auch in der Evaluation platzieren konnte.

Mein erster Check suchte nur nach exakten Treffern und fand fünf geteilte Überschriften von 650. Das übersah Fast-Duplikate. Ich habe einen invertierten Index genutzt, um die maximale Jaccard-Token-Überlappung zwischen jeder Evaluations-Überschrift und den 47.168 Trainings-Überschriften zu messen.

| Evaluations-Set | n | ≥0,9 Überlappung | Median |
|---|---|---|---|
| confirmatory 2015 | 1.300 | 0,5% | 0,227 |
| holdout | 4.274 | **30,5%** | 0,300 |

Holdout hatte anteilig etwa sechzigmal so viele Fast-Duplikate, trotz der geringeren Genauigkeit. Nach deren Entfernung lag der Wert bei 0,646, leicht über 0,637. Dieser Check erklärte die Lücke nicht und zeigte auch keinen Genauigkeitsvorteil durch die Fast-Duplikate.

Ich habe auch geprüft, ob Holdout weniger Impressions oder verrauschtere Labels hatte:

| Evaluations-Set | Median Impressions | Median z | Median CTR-Verhältnis |
|---|---|---|---|
| confirmatory 2015 | 2.462 | 2,37 | 2,24 |
| holdout | 3.096 | 2,64 | 1,99 |

Holdout hatte mehr Impressions und höhere z-Scores. Die 2015er-Paare hatten allerdings ein größeres medianes CTR-Verhältnis (2,24 gegenüber 1,99), was sie leichter unterscheidbar machen könnte. Die gesamte Differenz konnte ich trotzdem nicht erklären, also habe ich sie als ungeklärt verbucht und rund 0,63 als die durch die beiden anderen Splits gestützte Baseline angesetzt.

## Ablations

Anschließend habe ich verglichen, was mehr bringt: zusätzliche Trainingsdaten oder eine andere Loss-Funktion. Durch die Einbindung von Exploratory wuchs das verfügbare Trainingsset auf 62.695 Arms. Ich habe jede Konfiguration auf denselben 2.137 Holdout-Paaren evaluiert, jeweils ein Best-versus-Worst-Paar pro Test.

```
Phase 0        confirmatory       MSE              0.637
more-data      expl+confirmatory  MSE              0.724
rank           confirmatory       Bradley-Terry    0.775
rank+more      expl+confirmatory  Bradley-Terry    0.787
```

![Ablation-Ergebnisse. Mehr Daten bringen ein Plus von 0,087 gegenüber der Baseline; der Wechsel zu Bradley-Terry bringt 0,138, und der beste Durchlauf erreicht 0,812.](/assets/img/blog/decision-models/ablations.png)

Mehr Daten verbesserten die Genauigkeit um **0,087**. Der Wechsel zu Bradley-Terry brachte ein Plus von **0,138**, und zwar mit dem kleineren Trainingsset und zwei statt drei Epochen.

Bisher hatte ich einen Klickraten-Regressor trainiert und evaluiert, ob er Paare korrekt ordnet. Ein Ranking-Loss passte schlichtweg besser zu dieser Evaluation.

[Bradley-Terry](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) trainiert auf paarweisen Präferenzen. Für jedes Paar von Arms innerhalb eines Tests habe ich `logsigmoid(score_winner - score_loser)` maximiert, gewichtet mit dem Logarithmus der Impressions des Arms mit weniger Impressions. Die 47.168 Trainings-Arms ergaben 76.892 Paare innerhalb einzelner Tests.

ModernBERT-*base* erreichte 0,761 mit einem Drittel der Parameter, was es zu einer guten Option für die CPU macht.

Die auf Entscheidungsaufgaben vortrainierte Variante von DeBERTa-v3-large lernte anfangs überhaupt nicht. Der Loss blieb über alle 4.804 Schritte bei `-log(0.5)` hängen, und das Modell kam auf 0,519.

Der unveränderte Loss veranlasste mich dazu, das Trainingssetup zu überprüfen. Der Encoder war korrekt geladen; nur der Classifier und der Pooler waren frisch initialisiert.

Ich hatte die Lernrate von 2e-5 aus dem ModernBERT-Setup übernommen. Nachdem ich Berichte über [Trainingsinstabilitäten bei DeBERTa](https://github.com/microsoft/DeBERTa/issues/77) gefunden hatte, probierte ich 6e-6 aus.

Bei 6e-6 sank der Loss von 0,709 → 0,682 → 0,620 → 0,360. Die Genauigkeit erreichte **0,812**, zweieinhalb Punkte über ModernBERT und 0,913 auf der höchsten Konfidenzstufe.

Bei Paaren, die den Fast-Duplikat-Filter passierten, erzielte es **0,797** gegenüber 0,769 bei ModernBERT. Zudem fiel die Genauigkeit nach dem Filtern weniger stark ab.

## Kalibrierung und erzielter Lift

Die paarweise Genauigkeit sagt noch nichts darüber aus, wie viele zusätzliche Klicks die Entscheidungen des Modells bringen würden. Das hängt von der Größe der Unterschiede zwischen den Varianten ab.

Für jeden Test habe ich die beobachtete Klickrate des vom Modell am besten bewerteten Arms mit dem Mittelwert über alle Arms dieses Tests verglichen. Der Mittelwert entspricht der rein zufälligen Auswahl einer Variante; er spiegelt nicht die Wahl durch eine Redaktion wider.

| | CTR |
|---|---|
| Testmittelwert, ohne Modell | 1,20% |
| Auswahl des Modells | 1,42% |
| Orakel, perfekte Auswahl | 1,60% |

Das entspricht einer **relativen Steigerung der Klickrate von +18,3%** über 2.140 Tests hinweg.

### Was das über andere Zielgruppen aussagt

Die 18,3 % hängen von Upworthys Basisrate von 1,20 % und der Streuung zwischen den Varianten ab. Wie hoch der Lift für einen B2B-Newsletter mit einer Klickrate von 2,5 % und ähnlicheren Betreffzeilen wäre, lässt sich daraus nicht ableiten.

Ich habe auch gemessen, wie oft das Modell innerhalb eines Tests sinnvolle Entscheidungen getroffen hat. Diese Werte sind weniger an die absolute Klickrate gekoppelt, müssen aber trotzdem an anderen Zielgruppen getestet werden:

| Metrik | Wert |
|---|---|
| Vermeidet die schlechteste Variante | **90,3%** |
| Schlägt den Testdurchschnitt | 76,6% |
| Wählt die tatsächlich beste Variante | 47,7% |
| Ausgeschöpfter Spielraum (Headroom), medianer Test | 89,2% |
| Spearman, Score vs. Klickrate | 0,526 |

Die schlechteste Variante in 90,3 % der Fälle zu vermeiden, ist hier sehr nützlich, verglichen mit 75,1 % bei zufälliger Auswahl. Die Genauigkeit von 47,7 % bei der besten Variante liegt etwa beim 1,9-fachen der Zufalls-Baseline von 24,9 %. Keines dieser Ergebnisse belegt, wie es sich bei E-Mails schlagen würde.

Der ausgeschöpfte Headroom variiert stark: Der Median liegt bei 89,2 %, der Interquartilsabstand reicht von 5 % bis 100 %, und der gepoolte Wert beträgt 55,4 %. Der hohe Median bedeutet nicht, dass das Modell einen so großen Teil des gesamten verfügbaren Zuwachses ausschöpft.

Ich habe eine [isotonische Regression](https://en.wikipedia.org/wiki/Isotonic_regression) gefittet, um Scores auf den erwarteten Lift abzubilden. Sie passt eine monotone Beziehung an, ohne eine bestimmte Kurvenform zu erzwingen. Bradley-Terry lernt eine Reihenfolge; es macht die Roh-Scores nicht zu kalibrierten Klickraten. Ich habe über Tests gebootstrappt, da Arms innerhalb eines Tests denselben Artikel teilen und nicht unabhängig sind.

| Score | vs. Basis | 90%-Intervall |
|---|---|---|
| −2,72 | **−19,1%** | [−0,252, −0,209] Pp. |
| −1,06 | −8,2% | [−0,111, −0,086] Pp. |
| −0,20 | −0,7% | [−0,023, −0,000] Pp. |
| +0,56 | +3,7% | [+0,030, +0,056] Pp. |
| +1,62 | +11,1% | [+0,115, +0,147] Pp. |
| +2,82 | **+21,8%** | [+0,231, +0,274] Pp. |

![Kalibrierungskurve. Die geschätzte Klickraten-Differenz zur Baseline steigt monoton mit dem Modell-Score, mit 90%-Intervallen.](/assets/img/blog/decision-models/calibration.png)

Die mittleren Scores bilden sich auf kleine geschätzte Differenzen zur Baseline ab. Diese Intervalle beschreiben den kalibrierten Lift, nicht, ob zwei konkrete Überschriften gleichwertig sind.

## Frühere Arbeiten zu diesem Archiv

Andere Arbeiten zu diesem Archiv nutzen andere Aufgabenstellungen, Eingabedaten und Evaluations-Teilmengen:

| Quelle | Aufgabe | Metrik | Wert | Zufall |
|---|---|---|---|---|
| LOLA, Menschen (n=4.571) | Top-1 von k | Accuracy | ~Zufall | 0,330 |
| LOLA, GPT-4 in-context | Top-1 von k | Accuracy | 0,400 | 0,330 |
| LOLA, LoRA Llama-3-8B | Top-1 von k | Accuracy | 0,469 | 0,330 |
| LOLA, fine-tuned GPT-4o | Top-1 von k | Accuracy | 0,488 | 0,330 |
| [arXiv:2506.00152](https://arxiv.org/abs/2506.00152), Pythia-12B | signifikante Paare, + Teaser + Timestamp | ROC AUC | 0,82 | 0,50 |
| [PLOS ONE 0281682](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682) | Paare gematcht auf Artikel+Bild+Woche, K≤15 | Accuracy | 0,544 | ~0,50 |
| **VERA** | jedes Paar im Test, nur Headline | Accuracy | **0,689** | 0,524 |

Das Paper mit 0,544 matcht Paare nach Artikel, Bild und Testwoche und zieht dann zufällige Stichproben aus Experimenten mit mehr als 15 Paaren. Es trainiert auf 5.048 Paaren. Es handelt sich um einen Registered Report, der prüft, ob Vorhersagen besser als der Zufall sein können; diese Zahl direkt mit der Genauigkeit meines Modells zu vergleichen, würde meine Ergebnisse überbewerten.

Das Pythia-12B-Reward-Modell berichtet eine ROC AUC von 0,82. Es trainiert auf Paaren, deren CTR-Differenz bei 5 % signifikant ist (etwa 28 % der Paare), und liest neben der Überschrift auch den Anreißertext (Lede) und den Zeitstempel des Beitrags ein. AUC und meine Accuracy sind nicht austauschbar, weshalb diese Zahlen nicht belegen, welches Modell besser ist.

Ich habe kein veröffentlichtes Ergebnis gefunden, das die paarweise Genauigkeit eines feinabgestimmten Encoders auf ungefilterten Paaren innerhalb von Tests ausschließlich anhand des Headline-Texts ausweist. Das macht dies zu einer nützlichen zusätzlichen Evaluation, begründet aber kein State-of-the-Art-Ergebnis.

## Hier gemessene Baselines

Ich habe Gemini 3.1 Pro und Laya auf meinen Evaluationspaaren laufen lassen, um einen direkten Vergleich zu erhalten.

Ich habe jedes Paar zweimal vorgelegt, dabei die Reihenfolge der Überschriften vertauscht und eine Vorhersage nur dann gewertet, wenn beide Reihenfolgen dieselbe Überschrift auswählten. Das prüft auf Position Bias. Die Tabelle zeigt die Genauigkeit auf übereinstimmenden Paaren sowie den Anteil der Vorhersagen, die über beide Reihenfolgen hinweg konsistent waren; die reine Genauigkeit unterschlägt, wie oft ein System diese Konsistenzprüfung nicht bestand.

| System | Parameter | Gematchte Paare | Selbstkonsistent |
|---|---|---|---|
| **VERA** | 435M | **0,823** | — |
| Gemini 3.1 Pro | Frontier | 0,751 | 83,7% |
| Laya typed-decisions | 421M | 0,504 | 52,9% |

VERA lag bei den gematchten Paaren etwa sieben Prozentpunkte über Gemini, bei etwa einem Tausendstel der Kosten pro Aufruf. Die Evaluation von Gemini kostete 5,60 $. Zuvor hatte ich das Abschneiden von Menschen auf Zufallsniveau als Indiz dafür angeführt, dass dies auch für Modelle schwer sein würde; die 0,751 von Gemini stützen diese Annahme nicht.

Laya erzielte 0,504 und gab bei 52,9 % der Paare konsistente Antworten. Seine Model Card deckt Rechnungsverarbeitung, Sicherheitsvorfälle, Kundenservice und Agenten-Traces ab. Diese Auswertung testet es außerhalb dieser Domänen, daher würde ich das Ergebnis nicht nutzen, um seine Leistung bei jenen Aufgaben zu beurteilen.

Gemini erzielte zudem 0,641 bei Paaren, deren Klickraten-Unterschied bei 5 % nicht signifikant war, gegenüber einer Zufalls-Baseline von 0,500. VERA kam in dieser Schicht auf 0,696. Ich hatte diese Paare als Rauschen bezeichnet, aber das Verfehlen einer Signifikanzschwelle bedeutet nicht, dass kein prädiktives Signal vorhanden ist. Gemini wurde nicht auf diesen Labels feingetunt; sein Ergebnis stützt diese Unterscheidung, schließt aber Leakage in der Evaluation von VERA nicht aus.

## Domänentransfer

Die Upworthy-Ergebnisse stammen aus den viralen Social-Media-Überschriften eines einzelnen Publishers aus den Jahren 2013–2015. Mein Ziel bleibt es, E-Mail-Betreffzeilen zu bewerten.

Ein B2B-Newsletter an 4.000 Abonnenten ist ein ganz anderes Umfeld, und ein gutes Abschneiden bei Upworthy sagt mir nicht, ob das dort funktioniert.

Für einen ersten Transfertest habe ich den Reddit-Datensatz von SNAP genutzt: 132.308 Einreichungen zu 16.242 Bildern, wobei jedes Bild im Schnitt etwa achtmal unter verschiedenen Titeln eingereicht wurde.

Diese Einreichungen waren nicht randomisiert. Ich habe Paare innerhalb desselben Bildes und Subreddits gebildet, den Leistungsabfall gegenüber dem Wiedereinreichungs-Index pro Subreddit gefittet und die Residuen gerankt. Ich habe nur Paare behalten, bei denen der Residuumsabstand groß genug war, um einen eindeutigen Gewinner zu bestimmen.

117.118 Paare. VERA erzielt **0,522**. Der Zufallswert liegt bei 0,500. Die einfache Regel „längerer Titel gewinnt“ kommt auf 0,507.

Behandelt man Paare als unabhängig, ergibt sich ein Standardfehler von 0,0015, etwa fünfzehn Standardfehler über dem Zufall. Paare teilen sich jedoch Bilder, sodass diese Rechnung allein nicht ausreicht, um Signifikanz zu belegen. Die Genauigkeit steigt von 0,508 auf 0,531 über die Quartile des Residuumsabstands und reicht von 0,495 auf r/WTF bis 0,558 auf r/fffffffuuuuuuuuuuuu. So oder so: 0,522 ist nicht gut genug für das, was ich bauen möchte.

Reddit-Upvotes sind keine Klickraten, und ich habe weder Tageszeit noch Reputation der Einreichenden kontrolliert. Das schwache Ergebnis könnte an mangelndem Transfer liegen, an diesen Störfaktoren oder an beidem. Es liefert mir keine Grundlage, um eine brauchbare Leistung außerhalb von Upworthy in Aussicht zu stellen.

Um E-Mails direkt zu testen, brauche ich Betreffzeilen mit gemessenen Versand-Ergebnissen. Einen öffentlich zugänglichen Datensatz, der sich fürs Training eignet, konnte ich nicht finden:

| Quelle | Größe | Verfügbarkeit |
|---|---|---|
| Return Path Betreffzeilen-Studie | 9 Mio. Betreffzeilen | Proprietär, 2015, nie veröffentlicht |
| Belkins B2B-Korpus | 5,5 Mio. E-Mails | Nur aggregierte Statistiken |
| Yahoo (IEEE 7004277) | 100k+ Zeilen, Milliarden Impressions | Proprietär |
| NLORP-Paper von Oracle | 300 Zeilen | Von Google gescrapt, Raten nicht gemessen |
| Diverse Kaggle-„Email Campaign“-Sets | unterschiedlich | Mock- oder synthetische Daten |

Das Oracle-Paper verwendet beispielsweise „300+ different subject lines of special deal emails, picked up from multiple internet sources via google search“. Diese enthalten keine gemessenen Klick- oder Öffnungsraten. Aggregierte Erkenntnisse über Betreffzeilenlänge oder Wortwahl liefern mir ebenfalls nicht die Labels pro Versand, die dieses Trainingssetup benötigt.

## Datenverfügbarkeit

Die Trainingsdaten sind öffentlich und die Gewichte haben mich etwa vier Dollar an Rechenzeit gekostet. Das Experiment ist reproduzierbar, und ich muss immer noch herausfinden, ob der Ansatz bei E-Mails funktioniert.

E-Mail-Provider und Newsletter-Betreiber mit A/B-Test-Logs könnten die relevanten Daten liefern. Ich bräuchte Betreffzeilen-Varianten und deren gemessene Ergebnisse sowie einen Weg, um Vorhersagen bei neuen Sendungen zu evaluieren. Dieses Setup habe ich bisher noch nicht.

## Generalisierung

Ich würde das gerne bei anderen Entscheidungen mit protokollierten Ergebnissen ausprobieren. Wer eine Experimentierplattform wie Optimizely, Statsig oder LaunchDarkly nutzt, hat möglicherweise bereits passende Varianten und Ergebnisse parat. Einige denkbare Aufgabenstellungen:

| Entscheidung | Das Label, das du bereits hast |
|---|---|
| Betreffzeilen, Headlines, Push-Texte | Öffnungen, Klicks |
| Auswahl von Support-Makros | Gelöst ohne Eskalation |
| Retrieval-Reranking | Welches Ergebnis der Nutzer akzeptiert hat |
| Formulierung von Fehlermeldungen | Selbst gelöst oder Ticket erstellt |
| Titel von Produktangeboten | Conversions |
| Tool-Auswahl bei Agenten | War die Trajektorie erfolgreich |

Besonders interessiert mich die Tool-Auswahl bei Agenten. Die drei Primitive von Jev sind `choice`, `score` und `noul`; dieses Experiment nutzt `score`. Ein Versuch mit `choice` würde Logs der verfügbaren Optionen, des ausgewählten Tools und des anschließenden Ergebnisses erfordern. Diese Logs müssten vorher geprüft werden, ob sie einen fairen Vergleich erlauben.

Bisher habe ich das Training auf echten Ergebnissen nur bei einer einzigen Aufgabe gegen Zero-Shot-Urteile getestet. Ob der Vorteil auch bei anderen Aufgabenstellungen Bestand hat, weiß ich noch nicht.

## VERA

**V**ariant **E**valuation from **R**eal **A**nalytics.

**[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)**, Apache 2.0.

```python
from transformers import AutoModelForSequenceClassification, AutoTokenizer

tok = AutoTokenizer.from_pretrained("NovusEdge/vera-deberta-v3-large")
model = AutoModelForSequenceClassification.from_pretrained(
    "NovusEdge/vera-deberta-v3-large")

# Score a set of candidates for ONE piece of content. Higher wins.
enc = tok(candidates, padding=True, truncation=True, max_length=64,
          return_tensors="pt")
scores = model(**enc).logits.squeeze(-1)
```

Nutze die Scores, um Kandidaten für denselben Inhalt zu vergleichen, zum Beispiel 3 bis 6 Varianten für einen Versand. Das finale Modell hat Rankings innerhalb von Tests gelernt, daher ist ein roher Score weder ein absolutes Qualitätsmaß noch eine Klickwahrscheinlichkeit. Die Gewichte enthalten auch einen Kalibrator, der auf die Upworthy-Ergebnisse gefittet wurde.

Es gibt auch ein kleineres ModernBERT-base-Modell für den Einsatz auf CPUs. Es erreicht 0,761 bei der Best-versus-Worst-Evaluation mit einem Drittel der Parameter.

## Einschränkungen

Ich habe das nicht an E-Mails getestet, und das Reddit-Ergebnis war schwach. Die Upworthy-Scores sollten keinesfalls als erwartete Performance für einen Newsletter interpretiert werden.

Wenn du einen betreibst und frühere Sendungen mit gemessenen Öffnungs- oder Klickraten hast, melde dich gerne bei mir. Ich würde das gerne testen, und die Daten bleiben natürlich bei dir.

## Korrekturen

Am 24.09.2026 brachte ein Review des Evaluations-Codes mehrere Probleme zutage.

Meine Evaluation rief `pairs_from` auf, was genau ein Paar pro Test behält: den besten Arm gegen den schlechtesten. Das Training baute hingegen jedes Paar auf. Das Ergebnis von 0,812 maß daher nur das Paar mit dem größten Abstand in jedem Test. Über alle 18.485 Paare innerhalb von Tests hinweg liegt die Genauigkeit bei **0,689** gegenüber einer Baseline von 0,524.

| Paar-Set | n | Längen-Baseline | VERA |
|---|---|---|---|
| Jedes Paar im Test | 18.485 | 0,524 | **0,689** |
| Bester Arm gegen schlechtesten, einer pro Test | 2.137 | 0,546 | 0,812 |

Ich habe außerdem das reguläre `microsoft/deberta-v3-large` durch exakt dasselbe Rezept laufen lassen. Es erzielt auf demselben Set 0,805 gegenüber 0,812, ein Unterschied, der kleiner ist als der ausgewiesene Standardfehler von 0,009. Das belegt keinen Vorteil durch das Vortraining auf typisierten Entscheidungen. Das Senken der Lernrate behob das Trainingsproblem bei beiden Basismodellen.

Die obigen Ablations nutzen alle das ursprüngliche Set aus 2.137 Paaren, damit sie innerhalb dieser Evaluation untereinander vergleichbar sind. Es handelt sich dabei nicht um All-Pairs-Ergebnisse.

Ebenfalls korrigiert: Der in den Gewichten mitgelieferte Kalibrator stammte aus einem anderen Durchlauf, mein Bootstrap nutzte `.isin()` auf einer Stichprobe mit Zurücklegen und verwarf dadurch Duplikate, und die Zufalls-Baselines lagen um zwei Punkte daneben, weil ich sie nicht aus den tatsächlichen Arm-Zahlen berechnet hatte.

Die einleitende Tabelle zeigt die korrigierten Ergebnisse. Die früheren Durchläufe bleiben im obigen Bericht erhalten, mit Kennzeichnung der jeweiligen Evaluations-Teilmenge.

---

*Daten: [The Upworthy Research Archive](https://osf.io/jd64p/). Matias, J., Munger, K., Le Quere, M.A., Ebersole, C. (2021), Nature Scientific Data. CC BY 4.0. Experimente zwischen dem 25. Juni 2013 und dem 10. Januar 2014 sind durchgängig ausgeschlossen, da bei der Randomisierung ein Fehler auftrat, den die Maintainer 2024 offengelegt haben. Gewichte DOI: [10.57967/hf/10573](https://doi.org/10.57967/hf/10573).*
