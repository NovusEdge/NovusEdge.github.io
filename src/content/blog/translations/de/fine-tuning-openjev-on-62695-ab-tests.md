---
title: "Ich habe meinen eigenen Benchmark zweimal verbockt"
date: 2026-09-23
updated: 2026-09-24
tags: [ml, decision-models, calibration, open-weights, benchmarks]
draft: false
description: "Ich habe ein Decision-Modell auf echten A/B-Tests trainiert, die tatsächlich gelaufen sind, statt einfach ein anderes Modell nach seiner Meinung zu fragen. Dann habe ich mich dabei ertappt, wie ich die Werte künstlich aufgebläht habe, habe es korrigiert, veröffentlicht und festgestellt, dass ich an einer noch schlimmeren Stelle genau denselben Fehler wieder gemacht hatte."
---

> **Korrektur, 24.09.2026.** In diesem Beitrag wurde ursprünglich eine paarweise Genauigkeit (pairwise accuracy) von 0,812 angegeben und als „alle Paare innerhalb eines Tests“ bezeichnet. Tatsächlich war es nur ein einziges Paar pro Test: der Arm mit der höchsten CTR gegen den mit der niedrigsten, also der maximal mögliche Unterschied in einem Test.
> Der echte Wert über alle Paare liegt bei **0,689**. Außerdem wurde der Gewinn fälschlicherweise der Decision-Modell-Basis zugeschrieben, obwohl ein Kontrolllauf zeigt, dass er schlicht an der Learning Rate lag.
> Die Zahlen unten wurden korrigiert, und [der letzte
> Abschnitt](#the-part-i-got-wrong-again) erklärt, wie ich darauf gekommen bin.

Es gibt aktuell rund 300 öffentliche Projekte, die auf den neuen Decision-Modellen aufbauen. Ich habe mir die für „Scoring and Ranking“ (26 Stück) angeschaut, und wirklich jedes einzelne bewertet Dinge, indem es einfach das Modell fragt, was es denkt. Bewerte diesen Artikel anhand von acht Qualitätskriterien, beurteile diesen Text nach gutem Geschmack, schätze ein, ob dieses Dokument relevant ist, ihr wisst schon.

Und ganz ehrlich, das sind doch keine Daten? Das ist die Meinung eines Modells mit einer drangeklatschten Zahl, und die ganze Kategorie baut darauf auf, ngl.

Also habe ich eines auf Ergebnissen trainiert, die tatsächlich jemand gemessen hat, und die Gewichte sind online, falls ihr damit herumspielen wollt: **[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)**, Apache 2.0, 435 Mio. Parameter, ein einziger Forward-Pass, bewertet kurze persuasive Texte. Die Basis ist [`com-kotobalabs/open-jev-deberta-v3-large`](https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large), ein DeBERTa-v3-large, das auf typisierten Entscheidungen vortrainiert wurde – was sich, Spoiler, als völlig wirkungslos herausstellte, zumindest konnte ein Kontrolllauf keinen Unterschied feststellen.

| Metrik | Dieses Modell | Zufall |
|---|---|---|
| Jedes Paar innerhalb eines Tests, ungesehener Split | **0,689** | 0,524 |
| Paare mit eindeutigem Testergebnis (p<0,05) | **0,843** | 0,547 |
| Bereinigte Paare, nichts ähnelt den Trainingsdaten | **0,671** | 0,524 |
| Wählt die beste aus 4–5 Varianten | **47,7%** | 24,9% |
| Vermeidet die schlechteste Variante | 90,3% | 75,1% |
| Reddit-Titelpaare, Out-of-Domain | 0,522 | 0,500 |

Die meisten Paare in diesem Archiv weisen keinen echten Unterschied auf – nur 29 % erreichen Signifikanz auf dem 5%-Niveau. Die erste Zeile schließt diese mit ein, weshalb das auch die Zahl ist, die ich an den Anfang stelle. Die zweite zeigt, wie gut das Modell abschneidet, wenn das Experiment tatsächlich eine Entscheidung geliefert hat.

Es hat 47.168 Testarme aus 16.129 randomisierten Headline-Experimenten gefittet, und jede Zahl da oben stammt aus einem Split, den das Modell nie zuvor gesehen hat. Wie es dazu kam, steht weiter unten, inklusive zweier Gelegenheiten, bei denen mein Benchmark etwas völlig anderes gemessen hat, als ich behauptet hatte.

## Das Setup

Wie sich herausstellt, gibt es dafür einen perfekten Datensatz, der seit 2021 frei verfügbar herumliegt. Zwischen Januar 2013 und April 2015 führte Upworthy (ja, *dieses* Upworthy, die Macher von „Du wirst nicht glauben, was als Nächstes geschah“) 32.487 randomisierte A/B-Tests mit ihren Überschriften durch: echter Traffic, echte Randomisierung, 538 Millionen Zuweisungen. Die Cornell University hat das Ganze dann als [The Upworthy Research Archive](https://osf.io/jd64p/) unter CC BY veröffentlicht. Jede Headline-Variante, jede Impression, jeder Klick.

Näher kommt man einer echten Ground Truth bei kurzen persuasiven Texten kaum.

Also: ModernBERT-large mit einem Regressionskopf, und das Target ist die geschrumpfte (shrunk) Logit-Klickrate, zentriert auf den Mittelwert des jeweiligen Tests. Die Zentrierung ist übrigens wichtig: Der *Artikel* macht den Großteil der Varianz bei den Klickraten aus, und eine Überschrift kann das nicht erklären. Was man also eigentlich vorhersagen will, ist, wie weit ein Arm vom Mittelwert des Tests abweicht, in dem er lief. Darauf dann Beta-Binomial-Shrinkage in Richtung dieses Mittelwerts, sodass ein Arm mit 600 Impressionen hauptsächlich als Prior zählt und einer mit 20.000 vor allem als Evidenz.

Fünfundzwanzig Minuten auf einer einzelnen L4, etwa vierzig Cent. Ich habe alles nach Januar 2015 als Holdout beiseitegelegt, darauf evaluiert und **0,704 paarweise Genauigkeit** erreicht.

Zum Vergleich: Die beste publizierte Zahl auf ungefilterten Paaren liegt bei [0,544](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682) von einer Gruppe aus Toronto, die handgefertigte linguistische Features genutzt hat. In deren Paper heißt es am Ende, das Problem sei „von Natur aus schwer und nicht bloß eine Frage der Stichprobengröße“. Ich komme später noch darauf zurück, warum diese 0,544 ein schlechterer Vergleichswert ist, als es scheint. Weiter unten höre ich dann auch auf, fremde Zahlen zu zitieren, und lasse den Vergleich einfach selbst laufen.

Sechzehn Punkte Vorsprung für vierzig Cent. Also habe ich das natürlich sofort niedergeschrieben: „Headline-Signal überlebt zwei Jahre Drift.“

## Und doch

Die Behauptung in diesem Titel war, dass das Signal *Drift* überlebt: Die Trainingsdaten stammten aus den Jahren 2013 bis 2014, das Testset von 2015, und die Genauigkeit veränderte sich kaum. Quasi zwei Jahre wandelnde Internetkultur, und dem Modell war es völlig egal. Das wäre eine echte Erkenntnis, wenn es stimmen würde. Und es ist wichtig, weil das eigentliche Ziel darin besteht, das Ganze irgendwann auf E-Mail-Betreffzeilen loszulassen. Wenn es nicht einmal zwei Jahre bei ein und demselben Publisher übersteht, schafft es den Sprung auf ein komplett anderes Medium erst recht nicht.

Das Archiv ist in drei Splits aufgeteilt (Exploratory, Confirmatory, Holdout). Ich hatte auf Confirmatory trainiert und getestet. Aus reiner Sorgfalt – und in der festen Erwartung, das zu bestätigen, was ich ohnehin schon „wusste“ – habe ich dieselben Gewichte dann auf den anderen beiden getestet.

```
confirmatory 2015:  0.704
holdout:            0.637
exploratory:        0.624
```

Klasse.

Zwei Splits, die ich nie angerührt hatte, stimmten auf *jeder einzelnen Effektstärken-Stufe* bis auf 0,013 überein – und beide zeigten mir, dass meine Hauptzahl um satte sieben Punkte zu hoch angesetzt war.

![Paarweise Genauigkeit über drei Splits des Upworthy-Archivs hinweg. Die Confirmatory-2015-Linie liegt deutlich über Holdout und Exploratory, die nahezu identisch verlaufen.](/assets/img/blog/decision-models/splits.png)

## Die Zeitmaschine, die nur seitwärts reist

Also habe ich diesmal tatsächlich die Dokumentation des Archivs ordentlich gelesen. Und siehe da: Das Archiv teilt die Tests **nach dem Zufallsprinzip** auf die Splits auf. Nicht chronologisch, sondern zufällig.

![Zwei Balken. Der erste zeigt einen sauberen chronologischen Split, zuerst Train, dann Test. Der zweite zeigt die reale Struktur: Trainings- und Testblöcke sind über den gesamten Zeitraum verschachtelt.](/assets/img/blog/decision-models/split-structure.png)

| Split | Arme | Datumsbereich | Anteil vor 2015 |
|---|---|---|---|
| confirmatory | 51.891 | 24.01.2013 → 30.04.2015 | 83,5% |
| holdout | 11.231 | 24.01.2013 → 29.04.2015 | 82,8% |
| exploratory | 10.804 | 26.01.2013 → 29.04.2015 | 83,8% |

Alle drei Splits decken dieselben Zeiträume in denselben Verhältnissen ab. Das bedeutet: Als ich auf dem Holdout evaluiert habe, stammten 83 % der Testdaten aus *demselben Zeitraum wie die Trainingsdaten*. Dieselbe Ära, derselbe Hausstil, alles identisch – nur eben Tests, die das Modell noch nie gesehen hatte. Und trotzdem schnitt es dort *schlechter* ab als auf den Daten von 2015.

Wenn man das mal umdreht, ist es eigentlich fast schon witzig: Zeitliche Distanz kostet dieses Modell so gut wie gar nichts, aber ungesehene Tests aus demselben Zeitraum kosten es sieben Punkte. Mein sorgsam aufgebauter Drift-Test hatte die ganze Zeit über nur die Eigenheiten einzelner Tests gemessen, verkleidet als zeitliche Generalisierung.

Ich hatte eine Zeitmaschine gebaut, die sich nur seitwärts bewegt.

## Zwei Hypothesen, beide komplett verdreht

Der nächste Gedanke war natürlich: Data Leakage. Upworthy hat denselben Artikel mit Dutzenden verschiedenen Überschriften getestet. Wenn man also *Tests* zufällig aufteilt, verteilen sich die Varianten eines einzigen Artikels über alle drei Splits, und der Holdout-Split müsste voll von Fast-Kopien der Trainingsdaten sein.

Ich habe fix einen invertierten Index gebaut, um die maximale Jaccard-Token-Überlappung zwischen jeder Eval-Überschrift und den 47.168 Überschriften zu messen, auf die das Modell tatsächlich gefittet wurde (ein exakter String-Vergleich hatte fünf identische Überschriften von 650 gefunden, und ja, daraufhin hatte ich Leakage für „ausgeschlossen“ erklärt).

| Evaluationsset | n | ≥0,9 Überlappung | Median |
|---|---|---|---|
| confirmatory 2015 | 1.300 | 0,5% | 0,227 |
| holdout | 4.274 | **30,5%** | 0,300 |

Dreißig Prozent, sechzigmal stärker kontaminiert als das 2015er-Set, und das Ergebnis war **schlechter**.

Leakage erklärt die Lücke also nicht, es geht genau in die falsche Richtung. Eigentlich hieße das sogar, dass der ehrliche Holdout-Wert *noch schlechter* als 0,637 sein müsste, sobald man die Beinahe-Kopien herausfiltert. Auch das habe ich überprüft, indem ich die Scores pro Paar exportiert und gefiltert habe: Bei wirklich sauberen Paaren erzielte das Modell 0,646, also sogar minimal *besser*. Die Beinahe-Duplikate brachten ihm also absolut gar nichts.

Gut, dann eben Label Noise? Vielleicht haben die Holdout-Paare einfach weniger Impressionen.

| Evaluationsset | Median Impressionen | Median z | Median CTR-Verhältnis |
|---|---|---|---|
| confirmatory 2015 | 2.462 | 2,37 | 2,24 |
| holdout | 3.096 | 2,64 | 1,99 |

Ebenfalls genau falsch herum, lol. Holdout-Paare haben *mehr* Impressionen und *höhere* z-Scores. Das 2015er-Set hat zwar ein größeres medianes CTR-Verhältnis (2,24 gegenüber 1,99), die Paare sind dort also tatsächlich leichter zu trennen, was ein echter Faktor ist, aber das rechtfertigt bei weitem keine sieben Punkte.

Also schrieb ich „ungeklärt“ ins Dokument und machte weiter. 0,63 ist die Zahl, zwei unabhängige Splits stimmen darin überein, der eine abweichende ist der Ausreißer, und ich kann euch nicht sagen, warum.

**!! Nerd-Infodump-Warnung :3 !!**

## Der Teil, auf den es wirklich ankam

Nachdem ich mein eigenes Hauptergebnis zerlegt hatte, dachte ich mir, ich sollte wenigstens die Ablations ordentlich durchziehen.

Ich rechnete damit, dass mehr Daten gewinnen würden, das ist nun mal der Standard-Prior: Man hat 62.695 Arme zur Verfügung, packt den dritten Split ins Training und bekommt ein besseres Ergebnis. Also habe ich zwei Läufe aufgesetzt, einen mit dem Exploratory-Split zusätzlich im Training und einen mit ausgetauschter Loss-Funktion, beide evaluiert auf denselben 2.137 Holdout-Paaren.

Jede Zahl in diesem Abschnitt bezieht sich auf diese 2.137 Paare, was – wie die Korrektur oben schon sagt und der letzte Abschnitt genauer erklärt – die leichte Teilmenge ist. Untereinander lassen sie sich problemlos vergleichen, da jeder Lauf exakt gleich bewertet wurde. Keine davon ist jedoch ein Wert über alle Paare.

```
Phase 0        confirmatory       MSE              0.637
more-data      expl+confirmatory  MSE              0.724
rank           confirmatory       Bradley-Terry    0.775
rank+more      expl+confirmatory  Bradley-Terry    0.787
```

![Ablation-Ergebnisse. Mehr Daten bringen ein Plus von 0,087 gegenüber der Baseline; der Wechsel zu Bradley-Terry bringt +0,138, und der beste Lauf erreicht 0,812.](/assets/img/blog/decision-models/ablations.png)

Achtundzwanzig Prozent mehr Trainingsdaten brachten ein Plus von **+0,053**, und die Änderung der Loss-Funktion brachte **+0,107** – bei zwei Epochen statt drei und auf dem kleineren Trainingsset. Und trotzdem gewann sie mit dem doppelten Vorsprung.

Was im Nachhinein natürlich völlig offensichtlich ist, auf die denkbar ärgerlichste Art. Der Benchmark ist die *paarweise Genauigkeit* (zwei Überschriften gegeben, finde den Gewinner), und ich hatte eine Regression auf die Klickrate gerechnet. Ich optimierte also einen Proxy für die Metrik und bewertete mich anschließend anhand der eigentlichen Metrik.

[Bradley-Terry](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) optimiert direkt das, worum es geht. Für jedes Paar von Armen innerhalb eines Tests maximiert man `logsigmoid(score_winner - score_loser)`, gewichtet mit den logarithmischen Impressionen des schwächer frequentierten Arms. Aus meinen 47.168 Trainingsarmen wurden so 76.892 Test-interne Paare.

Dasselbe Modell. Dieselben Daten. Anderes Optimierungsziel. Vierzehn Punkte Unterschied.

Aus Neugier habe ich auch ModernBERT-*base* laufen lassen (ein Drittel der Parameter), und es kam auf 0,761. Der Großteil des Effekts steckt also im Objective und in den Daten, nicht in der Modellgröße. Was ziemlich praktisch ist, falls man das Ganze jemals auf einer CPU ausführen möchte.

Und dann ist da noch der eine Fall, der mir fast entgangen wäre. Ich habe eine DeBERTa-v3-large-Variante ausprobiert, die auf Decision-Tasks vortrainiert war. Sie verharrte über alle 4.804 Schritte exakt bei `-log(0.5)` und kam auf einen Score von 0,519 – also reiner Zufall, komplett flach.

Man könnte das leicht als „DeBERTa taugt nichts“ abhaken und weitermachen. Fast hätte ich das auch getan. Aber eine Loss-Kurve, die *vollkommen* flach genau auf dem Wert liegt, der „ich rate nur“ bedeutet, ist ein extrem spezifisches Muster. So sieht kein Modell aus, das einfach nur schlecht lernt. Der Encoder war außerdem fehlerfrei geladen, lediglich Classifier und Pooler waren frisch initialisiert.

Es lag an der Learning Rate. DeBERTa-v3-large ist [berüchtigt instabil](https://github.com/microsoft/DeBERTa/issues/77) bei den 2e-5, mit denen ModernBERT bestens klarkommt, und verlangt eher nach 6e-6. Und ich hatte dieselbe Konfiguration für beide genommen, weil, warum auch nicht.

Noch einmal mit 6e-6 laufen gelassen, der Loss fiel von 0,709 → 0,682 → 0,620 → 0,360, und am Ende stand ein Wert von **0,812** – zweieinhalb Punkte besser als ModernBERT, und 0,913 auf der höchsten Konfidenzstufe.

Ich habe auch den Test auf Beinahe-Duplikate noch einmal drübergejagt, weil ich mir an diesem Punkt selbst nicht mehr über den Weg traue. Bei wirklich sauberen Paaren (nichts, was den Trainingsdaten auch nur ähnelt) erzielt es **0,797** gegenüber ModernBERTs 0,769. Die Memorization-Lücke ist bei ihm zudem *kleiner* als bei ModernBERT, obwohl der Score höher liegt – genau das Gegenteil von dem, was man erwarten würde, wenn ein Modell nur durch reines Auswendiglernen gewinnt.

Das System funktionierte also die ganze Zeit wie gedacht, ich hatte bloß eine einzige Zahl falsch.

Dieser letzte Satz sollte sich noch als gewaltige Fehleinschätzung herausstellen. Behaltet ihn im Hinterkopf.

## Aber was bedeutet 0,812 eigentlich *konkret*

Für einen Menschen ehrlich gesagt gar nichts. Das ist das Problem mit paarweiser Genauigkeit als Metrik: Sie sagt dir, dass die Reihenfolge stimmt, verrät dir aber absolut nichts über die Größenordnung. Zwei Überschriften in 81,2 % der Fälle richtig zu ordnen, kann ein Vermögen wert sein oder komplett nutzlos, je nachdem, wie weit die beiden Varianten in der Realität auseinanderliegen.

Also habe ich gemessen, was jemand spüren würde, der das Ding tatsächlich für den Versand einsetzt. Man nehme für jeden Test den vom Modell am besten bewerteten Arm und vergleiche dessen echte Klickrate mit dem Mittelwert aller Arme in diesem Test. Denn ohne Modell hat man keinen Grund, irgendeine Variante zu bevorzugen; der Durchschnitt dessen, was man verschickt haben könnte, ist also das ehrliche Kontrafaktum.

| | CTR |
|---|---|
| Test-Mittelwert, ohne Modell | 1,20% |
| Auswahl des Modells | 1,42% |
| Orakel, perfekte Auswahl | 1,60% |

Das entspricht einem **relativen Klickraten-Zuwachs von +18,3 %** über 2.140 Tests hinweg. Und genau diesen Wert muss ich euch direkt wieder wegnehmen.

### Der Uplift lässt sich nicht einfach übertragen

Die 18,3 % sind eine spezifische Eigenschaft von Upworthy. Sie hängen von deren Basis-Klickrate von 1,20 % ab und davon, wie stark sich die Varianten der Autoren voneinander unterschieden. Wendet man das auf einen B2B-Newsletter mit 2,5 % Klickrate und feineren Textunterschieden an, ändert sich die Zahl drastisch, in eine Richtung, die ich schlicht nicht vorhersagen kann.

Was sich jedoch *sehr wohl* übertragen lässt, sind relative Kennzahlen innerhalb eines einzelnen Tests:

| Metrik | Wert |
|---|---|
| Vermeidet die schlechteste Variante | **90,3%** |
| Schlägt den Test-Durchschnitt | 76,6% |
| Trifft die tatsächlich beste Variante | 47,7% |
| Genutztes Potenzial (Headroom), Median-Test | 89,2% |
| Spearman-Rangkorrelation, Score vs. Klickrate | 0,526 |

**Die 90,3 % sind der Wert, für den ich tatsächlich meine Hand ins Feuer legen würde.** Er sorgt fast ausnahmslos dafür, dass man nicht den schlechtesten Text verschickt, den man geschrieben hat. Das bleibt auch bei einer anderen Basisrate, einer anderen Zielgruppe und einem anderen Medium stabil, ganz im Gegensatz zu einem pauschalen „+18,3 %“. Und 47,7 % Top-1-Trefferquote bei üblicherweise vier bis fünf Varianten ist etwa das 2,2-Fache des Zufallswerts.

Eine dieser Zahlen schummelt allerdings ein wenig. Das mediane ausgeschöpfte Potenzial liegt bei 89,2 % (Interquartilsabstand von 5 % bis 100 %), über alle Tests zusammengefasst sind es jedoch nur 55,4 %. Das Modell verhält sich bimodal: Bei den meisten Tests holt es fast den gesamten möglichen Gewinn heraus, bei einer Minderheit dagegen so gut wie gar nichts, und diese zieht den Gesamtschnitt nach unten.

Danach habe ich noch eine [isotonische Regression](https://en.wikipedia.org/wiki/Isotonic_regression) darauf gefittet, damit der Score eine echte Einheit bekommt statt nur ein diffuses Gefühl. Isotonisch passt hier perfekt, weil es lediglich Monotonie voraussetzt (höherer Score = höhere Klickrate) – genau das, was Bradley-Terry garantiert, und zwar buchstäblich das Einzige. Alles Parametrische würde Annahmen hineindichten, die das Modell nie versprochen hat. Die Konfidenzintervalle stammen aus einem Bootstrapping über *Tests* statt über einzelne Arme, da die Arme innerhalb eines Tests denselben Artikel teilen und nicht unabhängig voneinander sind.

| Score | vs. Baseline | 90%-Intervall |
|---|---|---|
| −2,72 | **−19,1%** | [−0,252; −0,209] %-Punkte |
| −1,06 | −8,2% | [−0,111; −0,086] %-Punkte |
| −0,20 | −0,7% | [−0,023; −0,000] %-Punkte |
| +0,56 | +3,7% | [+0,030; +0,056] %-Punkte |
| +1,62 | +11,1% | [+0,115; +0,147] %-Punkte |
| +2,82 | **+21,8%** | [+0,231; +0,274] %-Punkte |

![Kalibrierungskurve. Die Klickrate im Vergleich zur Baseline steigt monoton mit dem Modell-Score, wobei die 90%-Intervalle nur nahe der Mitte die Nulllinie schneiden.](/assets/img/blog/decision-models/calibration.png)

Und man beachte die mittleren Zeilen: Dort schneiden die Intervalle die Nullmarke. Das Modell signalisiert hier völlig korrekt: „Diese beiden Überschriften sind gleichwertig, wirf eine Münze.“

## Zu diesen 0,544

Ich meinte ja, dass ich darauf zurückkommen würde. Als ich mir genauer anschaute, was sonst noch mit diesem Datensatz angestellt wurde, verlor der Vergleich, auf den ich mich gestützt hatte, massiv an Aussagekraft – und etwas, das ich übersehen hatte, wurde plötzlich sehr viel wichtiger.

| Quelle | Aufgabe | Metrik | Wert | Zufall |
|---|---|---|---|---|
| LOLA, Menschen (n=4.571) | Top-1 aus k | Genauigkeit | ~Zufall | 0,330 |
| LOLA, GPT-4 In-Context | Top-1 aus k | Genauigkeit | 0,400 | 0,330 |
| LOLA, LoRA Llama-3-8B | Top-1 aus k | Genauigkeit | 0,469 | 0,330 |
| LOLA, Fine-Tuned GPT-4o | Top-1 aus k | Genauigkeit | 0,488 | 0,330 |
| [arXiv:2506.00152](https://arxiv.org/abs/2506.00152), Pythia-12B | signifikante Paare, + Teaser + Timestamp | ROC AUC | 0,82 | 0,50 |
| [PLOS ONE 0281682](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682) | Paare gematcht nach Artikel+Bild+Woche, K≤15 | Genauigkeit | 0,544 | ~0,50 |
| **VERA** | jedes Paar im Test, nur Überschrift | Genauigkeit | **0,689** | 0,524 |

Keine einzige dieser Zeilen ist ein direkter Eins-zu-eins-Vergleich mit meinem Ansatz, und genau darum geht es.

Das Paper mit den 0,544 gleicht Paare nach Artikel, Bild *und* Testwoche ab und zieht dann bei jedem Experiment mit mehr als 15 Paaren eine Zufallsstichprobe. Es trainiert auf gerade einmal 5.048 Paaren. Zudem ist es ein Registered Report, dessen allererste Hypothese lautet: „Lässt sich das überhaupt besser als der Zufall vorhersagen?“ – ein reiner Signifikanztest. Niemand dort hatte das Ziel, die Genauigkeit zu maximieren. Das Ganze mit einem 435M-Parameter-Modell auf einer Größenordnung mehr Daten um 27 Punkte zu schlagen, ist weiß Gott nicht der Flex, für den ich es gehalten hatte.

Was ich hingegen wirklich übersehen hatte, war das Pythia-12B-Reward-Modell, und das ist mit Abstand das stärkste neuronale Ergebnis auf diesem Datensatz. ROC AUC 0,82. Es trainiert ausschließlich auf Paaren, deren CTR-Differenz auf dem 5%-Niveau signifikant ist (also grob die leichtesten 28 %), und liest neben der Überschrift auch noch den Teaser des Artikels sowie den Veröffentlichungs-Zeitstempel ein. Es nutzt also ein leichteres Label-Set mit mehr Input auf einer völlig anderen Metrik und schlägt die 0,812 nicht. Aber wenn man die beiden Zahlen nur flüchtig nebeneinander sieht, wirken sie identisch. Und darauf weise ich lieber selbst hin, als dass es mir jemand anderes vorhält.

Was von alledem übrig bleibt: Bisher hat noch niemand die paarweise Genauigkeit eines feinabgestimmten Encoders auf ungefilterten Paaren innerhalb eines Tests rein anhand des Überschriftentextes berichtet. Das ist eine deutlich bescheidenere Behauptung als „schlägt den Stand der Technik“, aber eine, die ich wenigstens fundiert verteidigen kann.

## Also habe ich den Vergleich selbst gerechnet

Jede Zahl da oben stammt von jemand anderem, gemessen auf den Paaren anderer Leute. Also habe ich zwei aktuelle Systeme auf meine losgelassen.

Jedes Paar wird zweimal abgefragt: einmal mit dem Gewinner an erster Stelle und einmal an zweiter. Gewertet wird es nur, wenn beide Durchläufe dieselbe Überschrift wählen. Dieses Protokoll ist essenziell: Modelle bevorzugen Slot A unabhängig vom Inhalt überzufällig oft. Ein Lauf mit nur einer Reihenfolge würde sich also selbst auf einer von ihm bevorzugten Teilmenge bewerten.

| System | Parameter | Gematchte Paare | Selbstkonsistent |
|---|---|---|---|
| **VERA** | 435M | **0,823** | — |
| Gemini 3.1 Pro | Frontier | 0,751 | 83,7% |
| Laya typed-decisions | 421M | 0,504 | 52,9% |

Und damit löst sich ein Argument in Luft auf, auf das ich mich gerne gestützt hatte. Ich hatte immer behauptet, Menschen schnitten hier auf Zufallsniveau ab, was suggerieren sollte, dass die Aufgabe auch für Modelle extrem schwer sei. Ist sie nicht. Gemini holt 0,751. Das Ergebnis der menschlichen Tester sagt nur etwas über Menschen aus und überhaupt nichts über Maschinen, und ich habe es für ein Argument missbraucht, das es nicht hergibt.

Die ehrliche Version ist ohnehin viel besser: Ein 435M-Modell schlägt ein Frontier-Reasoning-Modell um sieben Punkte bei etwa einem Tausendstel der Kosten pro Aufruf. 5,60 Dollar an Gemini-API-Kosten, um das herauszufinden.

Laya ist das offene Decision-Modell, nach dem mich garantiert jeder fragen wird, und es antwortet hier mit der Zuverlässigkeit eines Münzwurfs. Das klingt verheerend, wenn man es so stehen lässt, daher zur Einordnung: Seine Model Card deckt Rechnungsverarbeitung, Sicherheitsvorfälle, Kundenservice und Agent-Traces ab. Klickraten von Überschriften liegen meilenweit außerhalb dieser vier Bereiche. Das ist ein reines Domain-Fit-Problem, und ich würde erwarten, dass VERA bei der Rechnungsverarbeitung genauso alt aussieht.

Eine Sache kam dabei noch heraus: Gemini erzielt 0,641 auf den Paaren, deren Klickraten-Unterschied die Signifikanz bei 5 % verfehlt – also genau jenen, die ich bisher als reines Rauschen abgetan hatte. Es hat diese Labels nie gesehen. Wenn also ein Modell ohne jeden Zugriff auf die Ergebnisdaten dort ebenfalls über 0,500 liegt, bedeutet das: Diese Paare weisen echte Unterschiede auf, dem Experiment fehlte bloß die statistische Power, um sie nachzuweisen. Wenn VERA auf derselben Schicht 0,696 erreicht, braucht man dafür keine Data-Leakage-Erklärung. Bis ich Gemini laufen ließ, konnte ich diese beiden Interpretationen schlicht nicht voneinander unterscheiden.

## Okay, an dieser Stelle mache ich alles kaputt

Jede einzelne Zahl da oben basiert auf viralen Social-Media-Überschriften aus den Jahren 2013 bis 2015 bei einem einzigen Publisher. Und das System, das ich eigentlich bauen will, soll E-Mail-Betreffzeilen bewerten.

Ein B2B-Newsletter, der an 4.000 Abonnenten geht, hat so gut wie nichts gemeinsam mit „Dieses Kind hat gerade mit einem einzigen Satz das gesamte Argument gegen Impfungen zerstört“.

Also habe ich es getestet. Reddit hat im Grunde dieselbe Struktur wie das Archiv, wenn man ein Auge zudrückt: SNAP hat 132.308 Einreichungen veröffentlicht, bei denen dasselbe Bild durchschnittlich etwa achtmal unter verschiedenen Titeln gepostet wurde. Ein Inhalt, viele Textvarianten, ein messbares Ergebnis. 16.242 Bilder.

Da hier nichts randomisiert war, mussten zuerst drei Störfaktoren bereinigt werden. Paare werden immer innerhalb desselben Bildes *und* desselben Subreddits gebildet, womit der Community-Einfluss herausfällt. Ein späterer Repost schneidet allein wegen des Timings schlechter ab, also habe ich den Decay gegen den Repost-Index pro Subreddit gefittet und die Residuen gerankt. Und ein Paar bleibt nur dann im Set, wenn der Residuums-Abstand groß genug ist, um einen klaren Gewinner zu bestimmen.

117.118 Paare. VERA holt **0,522**. Der Zufallswert liegt bei 0,500. Eine simple Heuristik wie „der längere Titel gewinnt“ erreicht 0,507.

Bei dieser Stichprobengröße beträgt der Standardfehler 0,0015. Die 0,522 liegen also etwa 15 Standardfehler über dem Zufall: statistisch real, aber praktisch so winzig, dass es nutzlos ist. Die Genauigkeit steigt zwar mit wachsendem Residuums-Abstand (0,508 → 0,531 über die Quartile hinweg), was belegt, dass der minimale Effekt echtes Signal und kein Artefakt ist. Er reicht von 0,495 auf r/WTF bis 0,558 auf r/fffffffuuuuuuuuuuuu.

Was an Signal da ist, gehört also rein zu Upworthy. Was auch immer VERA gelernt hat, ist der Tonfall eines einzigen Publishers aus dem Jahr 2013 – und er lässt sich nicht übertragen.

Ich schränke meine eigene Einschränkung gleich wieder ein: Reddit-Upvotes sind keine Klickrate, und Tageszeit sowie die Reputation der Einreichenden bleiben unkontrolliert. Ein Null-Ergebnis kann hier nicht sauber trennen zwischen „kein Transfer möglich“ und „die Confounder haben das Signal gefressen“. Aber es ist der günstigste ehrliche Test, den ich machen konnte, und er fiel negativ aus. Ich führe ihn lieber durch, als „Transfer wurde nicht getestet“ hinzuschreiben und die Leserschaft das Beste hoffen zu lassen.

Für den Test, den ich eigentlich machen wollte, brauche ich E-Mail-Daten. Also habe ich nach öffentlichen E-Mail-Datensätzen mit echten, gemessenen Versand-Ergebnissen gesucht. Es gibt schlicht keine.

| Quelle | Größe | Verfügbarkeit |
|---|---|---|
| Return Path Betreffzeilen-Studie | 9 Mio. Betreffzeilen | Proprietär, 2015, nie veröffentlicht |
| Belkins B2B-Korpus | 5,5 Mio. E-Mails | Nur aggregierte Statistiken |
| Yahoo (IEEE 7004277) | 100k+ Zeilen, Milliarden Impressionen | Proprietär |
| Oracles NLORP-Paper | 300 Zeilen | Von Google gescrapt, Raten nicht gemessen |
| Diverse Kaggle „E-Mail-Kampagnen“-Sets | unterschiedlich | Mock- oder synthetische Daten |

Eines davon ist ein arXiv-Paper von zwei leitenden Data Scientists bei Oracle, deren gesamter Datensatz aus „300+ verschiedenen Betreffzeilen von Sonderangebots-E-Mails besteht, die über eine Google-Suche aus verschiedenen Internetquellen zusammengetragen wurden“. Ich mache mich darüber gar nicht lustig, das ist einfach exakt der Stand dessen, was öffentlich existiert.

Die aggregierten Faustregeln kursieren überall (sechs bis zehn Wörter funktionieren am besten, 21 bis 40 Zeichen für Öffnungen, Zahlen bringen ein paar Prozentpunkte), aber nichts davon sind ergebnisbasierte Daten pro Versand und nichts davon taugt zum Trainieren.

## Was das gesamte Vorhaben in ein anderes Licht rückt

Ich hatte mir da eine bequeme kleine Geschichte zurechtgelegt, bis eine Zweitmeinung sie komplett zerlegt hat. Die Geschichte ging so: *Die Architektur ist austauschbare Massenware, der dauerhafte Wert liegt in proprietären Ergebnis-Labels.* Die erste Hälfte stimmt, aber die zweite ist völliger Unsinn, denn ich *habe* gar keine proprietären Labels. Upworthy ist öffentlich zugänglich, jeder mit einer GPU kann das an einem Wochenende für weniger Geld als einen Kaffee nachbauen. Das ist auch ein Grund, warum die Gewichte einfach frei online stehen: Sie haben mich vier Dollar gekostet, da kann ich kaum behaupten, das sei ein uneinholbarer Burggraben.

Was ich hier eigentlich habe, ist ein reiner Machbarkeitsnachweis. Der echte Wert läge in einer kontinuierlichen Messschleife auf Live-Traffic, und die existiert schlicht noch nicht.

Die Daten, die ich brauche, liegen ungenutzt auf den Servern von E-Mail-Marketing-Dienstleistern herum. Jeder ESP mit einem A/B-Testing-Feature hat Millionen von Betreffzeilen-Experimenten mit sauber gemessenen Ergebnissen, und so gut wie niemand trainiert Modelle darauf. Ich brauche also weder einen neuen Modellkopf noch einen weiteren Benchmark – ich brauche schlicht eine einzige Person mit Zugriff auf diese Logs.

## Worauf sich das Ganze übertragen lässt

Das Rezept ist ehrlich gesagt so simpel, dass es in eine einzige Zeile passt: Wenn ein gemessenes Ergebnis existiert, trainiere darauf und hör auf, ein Modell nach seiner bloßen Meinung zu fragen.

Jeder einzelne A/B-Test, den euer Unternehmen jemals durchgeführt hat, liegt auf irgendeiner Testing-Plattform herum: gelabelt, mit fertigem Ergebnis, vollkommen ungenutzt. Optimizely, Statsig, LaunchDarkly, ganz egal, was ihr nutzt – das sind Jahre an Daten nach dem Muster „Wir haben diese fünf Varianten ausprobiert und diese eine hat gewonnen“, und niemand hat je ein Modell darauf trainiert.

Überall, wo man eine Menge von Kandidaten hat und dahinter eine messbare Zahl steht, greift exakt dasselbe Prinzip:

| Entscheidung | Das Label, das ihr bereits habt |
|---|---|
| Betreffzeilen, Headlines, Push-Texte | Öffnungen, Klicks |
| Auswahl von Support-Makros | Gelöst ohne Eskalation |
| Re-Ranking in der Suche | Welches Ergebnis der Nutzer angeklickt hat |
| Formulierung von Fehlermeldungen | Problem selbst gelöst oder Ticket eröffnet |
| Produkttitel im E-Commerce | Conversions |
| Tool-Auswahl von Agenten | War die Trajektorie erfolgreich |

Die letzte Zeile ist die spannendste, wenn man KI-Agenten baut. Jevs drei Grundbausteine sind Choice, Score und Noul. Alles in diesem Beitrag dreht sich um `score`, aber derselbe Ansatz funktioniert auch für `choice`, sobald irgendwo protokolliert wird, was nach der Entscheidung passiert ist – was beim Routing der meisten Agenten bisher schlicht niemand tut.

Eine ehrliche Einschränkung gehört allerdings dazu: Ich habe hier exakt einen einzigen Datenpunkt. Das Training auf echten Ergebnissen hat das Zero-Shot-Urteil *bei einer einzigen Aufgabe* deutlich geschlagen. Ob dieser Vorsprung irgendwo sonst Bestand hat, ist ungetestet. Ich würde also auf die grundsätzliche Richtung wetten, nicht auf die exakte Zahl.

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

Lest die Scores immer als Gruppe, niemals als einzelne Zahl. Das Trainingsziel war die Abweichung vom Mittelwert des jeweiligen Tests. Ein einzelner Score für sich allein genommen sagt also gar nichts aus: Man füttert das Modell mit den drei bis sechs Varianten, die man für einen Versand geschrieben hat, und es rankt sie. Ein Kalibrator, der den Score auf den erwarteten Uplift mappt, ist ebenfalls enthalten.

Und falls 435M zu wuchtig ist, gibt es auch eine CPU-taugliche Variante: ModernBERT-base erreicht 0,761 bei einem Drittel der Parameter.

## Was es nicht leisten kann

Der Transfer auf E-Mails – zumindest habe ich keine Ahnung, ob es funktioniert.

Falls ihr also einen Newsletter betreibt und alte Versendungen mit gemessenen Öffnungs- oder Klickraten habt: Ich würde es wirklich gerne herausfinden, meldet euch gerne bei mir, und die Daten bleiben selbstverständlich komplett bei euch.

## Das Fazit

Eines der Open-Weight-Modelle in diesem Bereich erzielt auf seinem eigenen Typed-Decisions-Benchmark Zero-Shot einen Score von 0,362 – was noch unter der Majority-Class-Baseline von 0,461 liegt.

Und der Leistungssprung lag auch nicht an übermäßig cleverem Modeling: Der Großteil kam von einer Loss-Funktion, die zur Zielmetrik passte, und der Rest von 47.168 Zeilen, bei denen tatsächlich jemand gemessen hat, was in der Realität passiert ist. Wenn ihr eure Daten also labelt, indem ihr einfach ein Modell fragt: Schaut euch vielleicht erst einmal nach echten Ground-Truth-Daten um. Die liegen höchstwahrscheinlich ohnehin schon irgendwo herum.

## Der Teil, den ich schon wieder verbockt habe

Ich war kurz davor, das auf Hacker News zu posten. Vorher ließ ich den gesamten Text von einem Modell aus der Perspektive eines feindseligen Kommentators gegenlesen – mit der expliziten Anweisung, den Code statt der Prosa auseinanderzunehmen. Es fand innerhalb von zwanzig Minuten etwas, das ich zwei Tage lang direkt vor der Nase gehabt hatte.

Meine Evaluation rief eine Funktion namens `pairs_from` auf. Und das ist, was sie tut:

```python
g = g.assign(ctr=...).sort_values("ctr", ascending=False)
best, worst = g.iloc[0], g.iloc[-1]
out.append((best.headline, worst.headline))
```

**Ein einziges Paar pro Test. Der beste Arm gegen den schlechtesten Arm.** Das Training nutzte eine andere Funktion, die wirklich jedes Paar erstellte. Ich hatte beide geschrieben, im Abstand von Monaten, und nie bemerkt, dass sie völlig unterschiedliche Dinge taten.

Dieses eine Paar stellt die maximal mögliche Spanne dar, die ein Test zu bieten hat. 70 % dieser Paare erreichen Signifikanz auf dem 5%-Niveau. Betrachtet man tatsächlich jedes Paar innerhalb der Tests, sind es gerade einmal 29 %. Ich hatte also auf den einfachsten 11,6 % der Daten evaluiert und das Ganze in einer Model Card, einem öffentlichen Datensatz und diesem Beitrag dreist als „alle Paare innerhalb eines Tests“ bezeichnet.

| Paar-Set | n | Längen-Baseline | VERA |
|---|---|---|---|
| Jedes Paar im Test | 18.485 | 0,524 | **0,689** |
| Bester Arm gegen schlechtesten, einer pro Test | 2.137 | 0,546 | 0,812 |

Zwölf Punkte Unterschied. Was noch peinlicher ist als die sieben Punkte, bei denen ich mich in der ersten Hälfte dieses Beitrags dafür gefeiert habe, sie entdeckt zu haben.

Und das schmerzt auf eine ganz bestimmte Art. Weiter oben bügle ich ein Ergebnis von Pythia-12B mit der Begründung ab, dass es „ausschließlich auf Paaren trainiert, deren CTR-Differenz auf dem 5%-Niveau signifikant ist – also grob die leichtesten 28 %“. Mein eigenes Evaluationsset war zu 70 % signifikant. Ich habe einen Filter kritisiert, den ich selbst noch viel schärfer angewendet hatte, und zwar in genau dem Satz, in dem ich über wissenschaftliche Sorgfalt schrieb.

Im selben Review kam dann die Frage auf, warum ich eigentlich nie einen Kontrolllauf für das Basismodell gemacht hatte. Beim `openjev2`-Lauf hatte ich das Basismodell *und* die Learning Rate in einem Rutsch geändert und das Ergebnis prompt dem Pretraining des Decision-Modells zugeschrieben. Also habe ich das ganz normale `microsoft/deberta-v3-large` durch exakt dieselbe Pipeline gejagt.

| Basis | Holdout, selbes Paar-Set |
|---|---|
| open-jev-deberta-v3-large | 0,812 |
| microsoft/deberta-v3-large | 0,805 |

Sieben Tausendstel Unterschied, bei einem Standardfehler von fast neun. Das Pretraining des Decision-Modells hat absolut keinen messbaren Effekt gebracht. Der Sprung von 0,519 lag einzig an der Learning Rate, und das gilt für beide Basismodelle. Dieser Beitrag trug ursprünglich den Titel „Fine-tuning OpenJev on 62,695 A/B Tests“ – und beide Hälften davon waren schlicht falsch.

Ein paar kleinere Schnitzer aus demselben Review, alle echt: Der in den Gewichten mitgelieferte Kalibrator war auf einem *anderen Modell* gefittet worden; mein Bootstrap nutzte `.isin()` auf einer Stichprobe mit Zurücklegen, was Duplikate stillschweigend verwirft und das Ganze in eine 63%-Teilstichprobe verwandelt; meine Zufalls-Baselines lagen um zwei Punkte daneben, weil ich sie nie aus den echten Arm-Zahlen berechnet hatte; und mein Leaderboard zeigte den Score eines Modells auf 2.137 Paaren direkt neben dem eines anderen auf 1.788 Paaren an, ohne jeden Hinweis darauf.

Alles davon ist seit dem 24.09.2026 korrigiert und neu durchgemessen. Die Model Card, das Dataset und dieser Beitrag enthalten ausnahmslos die korrigierten Zahlen.

Was ich daraus mitnehme, abgesehen vom Offensichtlichen: Den ersten Fehler habe ich bemerkt, weil zwei Splits nicht zusammenpassten, was die Daten ganz von alleine taten. Den zweiten Fehler habe ich nicht bemerkt – und hätte ihn auch nie bemerkt –, weil alles, was hinter dieser Funktion lag, in sich vollkommen konsistent war. Jede Ablation nutzte dasselbe Set, also stimmte das relative Ranking untereinander. Die Stufen stiegen monoton an. Der Test auf Beinahe-Duplikate verhielt sich unauffällig. Nichts sah falsch aus, weil auch nichts falsch *war*, abgesehen von der Achsenbeschriftung.

Ein adversarielles Review hat das in zwanzig Minuten aufgedeckt, für praktisch null Kosten. Ich veröffentliche diesen Abschnitt tausendmal lieber selbst, als ihn mir von jemand anderem in den Kommentaren um die Ohren hauen zu lassen.

---

*Daten: [The Upworthy Research Archive](https://osf.io/jd64p/). Matias, J., Munger, K., Le Quere, M.A., Ebersole, C. (2021), Nature Scientific Data. CC BY 4.0. Experimente zwischen dem 25. Juni 2013 und dem 10. Januar 2014 sind durchgehend ausgeschlossen, da die Maintainer 2024 einen Fehler bei der Randomisierung offengelegt haben. Gewichte DOI: [10.57967/hf/10573](https://doi.org/10.57967/hf/10573).*
