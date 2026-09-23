---
title: "Fine-Tuning von OpenJev auf 62.695 A/B-Tests"
date: 2026-09-23
updated: 2026-09-24
tags: [ml, decision-models, calibration, open-weights, benchmarks]
draft: false
description: "Ich habe ein Decision-Model auf echten A/B-Tests trainiert, anstatt ein anderes Modell nach seiner Meinung zu fragen; es meidet deine schlechteste Variante in 90 % der Fälle, und mein erster Benchmark hat buchstäblich gar nichts gemessen lol"
---

Es gibt also rund 300 öffentliche Projekte, die auf den neuen Decision-Models aufbauen. Ich habe mir die für „Scoring und Ranking“ angeschaut (26 Stück), und ausnahmslos jedes einzelne bewertet Dinge, indem es einfach das Modell fragt, was es denkt. Bewerte diesen Artikel auf acht Qualitätsachsen, beurteile diesen Copy-Text nach Geschmack, entscheide, ob dieses Dokument relevant ist – ihr wisst, was ich meine.

Und ganz ehrlich, das sind doch keine Daten? Das ist die Meinung eines Modells mit einer Zahl dran getackert, und die gesamte Kategorie baut darauf auf, ngl.

Also habe ich eines auf echten, gemessenen Ergebnissen trainiert. Die Gewichte sind online, falls ihr damit rumspielen wollt: **[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)**, Apache 2.0, 435M Parameter, ein einziger Forward Pass, bewertet kurze persuasive Texte. Die Basis ist [`com-kotobalabs/open-jev-deberta-v3-large`](https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large), ein auf getypten Entscheidungen vortrainiertes DeBERTa-v3-large.

| Metrik | Dieses Modell | Zufall |
|---|---|---|
| Jedes Paar innerhalb eines Tests, ungesehener Split | **0,689** | 0,524 |
| Paare mit signifikantem Testergebnis (p<0,05) | **0,843** | 0,547 |
| Saubere Paare, nichts ähnelt den Trainingsdaten | **0,671** | 0,524 |
| Wählt die beste von 4–5 Varianten | **47,7%** | 24,9% |
| Meidet die schlechteste Variante | 90,3% | 75,1% |
| Reddit-Titelpaare, Out-of-Domain | 0,522 | 0,500 |

Die meisten Paare in diesem Archiv zeigen keinen echten Unterschied, nur 29 % erreichen Signifikanz bei 5 %. Die erste Zeile mischt diese mit rein, weshalb das die Zahl ist, mit der ich einsteige. Die zweite Zeile zeigt, wie es abschneidet, wenn das Experiment tatsächlich etwas entschieden hat.

Es hat 47.168 Arms über 16.129 randomisierte Headline-Experimente gefittet, und jede Zahl da oben stammt aus einem Split, den das Modell nie gesehen hat. Wie es dazu kam, steht unten, inklusive der Stelle, an der mein erster Benchmark absolut gar nichts gemessen hat (ja, ich ärgere mich immer noch ein bisschen darüber).

## Das Setup

Wie sich herausstellt, gibt es dafür einen perfekten Datensatz, der seit 2021 frei zugänglich herumliegt. Zwischen Januar 2013 und April 2015 hat Upworthy (ja, *dieses* Upworthy, die „You won't believe what happened next“-Leute) 32.487 randomisierte A/B-Tests mit ihren Überschriften durchgeführt. Echter Traffic, echte Randomisierung, 538 Millionen Zuweisungen. Und dann hat Cornell das Ganze als [Upworthy Research Archive](https://osf.io/jd64p/) unter CC BY veröffentlicht. Jede Headline-Variante, jede Impression, jeder Klick.

Das ist so nah an der Ground Truth, wie man es bei kurzen persuasiven Texten nur bekommen kann.

Also: ModernBERT-large mit einem Regressions-Head, und das Ziel ist die geschrumpfte Logit-Klickrate, zentriert auf den Mittelwert des jeweiligen Tests. Die Zentrierung ist übrigens wichtig: Der *Artikel* macht den Großteil der Klickraten-Varianz aus, und eine Überschrift kann das nicht erklären. Was man also eigentlich vorhersagen will, ist, wie weit ein Arm vom Mittelwert des Tests abweicht, in dem er lief. Dann Beta-Binomial-Shrinkage in Richtung dieses Mittelwerts, sodass ein Arm mit 600 Impressionen hauptsächlich als Prior zählt und einer mit 20.000 als echte Evidenz.

25 Minuten auf einer einzelnen L4, etwa vierzig Cent. Ich habe alles nach Januar 2015 zurückgehalten, darauf getestet und kam auf **0,704 paarweise Genauigkeit (pairwise accuracy).**

Zum Vergleich: Die beste publizierte Zahl auf ungefilterten Paaren liegt bei [0,544](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682) von einer Gruppe aus Toronto, die handgefertigte linguistische Features verwendet hat. Ihr Paper kommt zu dem Schluss, dass das Problem „von Natur aus schwer ist und nicht bloß eine Frage der Stichprobengröße“. Ich komme noch darauf zurück, warum diese 0,544 ein schlechterer Vergleich ist, als es aussieht. Später habe ich dann aufgehört, Zahlen anderer Leute zu zitieren, und den Vergleich einfach selbst gerechnet.

16 Prozentpunkte darüber, für vierzig Cent. Also habe ich es natürlich aufgeschrieben: „Headline-Signal übersteht zwei Jahre Drift.“

## Und doch

Die Behauptung in diesem Titel war, dass das Signal *Drift* übersteht, weil die Trainingsdaten von 2013 bis 2014 stammten, das Testset von 2015 war und die Genauigkeit sich kaum bewegt hat. Quasi zwei Jahre sich wandelnde Internetkultur, und dem Modell war es einfach egal. Das wäre eine echte Erkenntnis, wenn es stimmt. Und es ist wichtig, weil das eigentliche Ziel darin besteht, das Ganze irgendwann auf E-Mail-Betreffzeilen loszulassen. Wenn es nicht mal zwei Jahre innerhalb eines einzigen Publishers übersteht, schafft es den Sprung auf ein komplett anderes Medium erst recht nicht.

Das Archiv wird in drei Splits geliefert (Exploratory, Confirmatory, Holdout), und ich hatte auf Confirmatory trainiert und getestet. Hauptsächlich aus Sorgfalt und in der festen Erwartung, das zu bestätigen, was ich ohnehin schon „wusste“, habe ich dieselben Gewichte auf den anderen beiden getestet.

```
confirmatory 2015:  0.704
holdout:            0.637
exploratory:        0.624
```

Cool.

Zwei Splits, die ich nie angefasst hatte, stimmten auf *jeder einzelnen Effektstärken-Stufe* bis auf 0,013 überein, und beide sagten mir, dass mein Hauptergebnis um sieben Punkte aufgebläht war.

![Paarweise Genauigkeit über drei Splits des Upworthy-Archivs. Die Linie für Confirmatory 2015 liegt deutlich über Holdout und Exploratory, die sehr nah beieinander liegen.](/assets/img/blog/decision-models/splits.png)

## Die Zeitmaschine, die nur seitwärts reist

Also habe ich diesmal die Dokumentation des Archivs ordentlich gelesen. Und siehe da: Das Archiv teilt die Tests **zufällig** auf die Splits auf. Nicht chronologisch, sondern zufällig.

![Zwei Balken. Der erste zeigt einen sauberen chronologischen Split, erst Train, dann Test. Der zweite zeigt die reale Struktur: Trainings- und Testblöcke über den gesamten Zeitraum verschachtelt.](/assets/img/blog/decision-models/split-structure.png)

| Split | Arms | Datumsbereich | Anteil vor 2015 |
|---|---|---|---|
| Confirmatory | 51.891 | 2013-01-24 → 2015-04-30 | 83,5% |
| Holdout | 11.231 | 2013-01-24 → 2015-04-29 | 82,8% |
| Exploratory | 10.804 | 2013-01-26 → 2015-04-29 | 83,8% |

Alle drei Splits decken dieselben Zeiträume in denselben Anteilen ab. Als ich auf Holdout evaluierte, stammten 83 % meiner Testdaten aus dem *Trainingszeitraum*. Selbe Ära, selber Hausstil, alles gleich, nur eben Tests, die das Modell noch nie gesehen hatte. Und trotzdem schnitt es dort *schlechter* ab als auf dem 2015er-Rest.

Dreht man das um, ist es fast schon lustig, tbh: Zeit kostet dieses Modell fast nichts, während ungesehene Tests aus demselben Zeitraum es sieben Punkte kosten. Mein sorgfältig gebauter Drift-Test hatte die ganze Zeit über die Test-Identität gemessen; er trug bloß ein Kostüm namens temporale Generalisierung.

Ich hatte eine Zeitmaschine gebaut, die nur seitwärts reist.

## Zwei Hypothesen, beide verkehrt herum

Der nächste Gedanke ist natürlich Data Leakage. Upworthy hat denselben Artikel mit Dutzenden Überschriftenvarianten neu geschrieben. Wenn man *Tests* zufällig aufteilt, verteilen sich die Varianten eines Artikels über alle drei Splits, und das Holdout müsste voller Fast-Kopien der Trainingsdaten sein.

Ich habe ein schnelles Inverted-Index-Skript geschrieben, um den maximalen Jaccard-Token-Overlap zwischen jeder Eval-Headline und den 47.168 Headlines zu messen, auf die das Modell tatsächlich gefittet wurde (ein exakter String-Vergleich hatte fünf geteilte Headlines von 650 gefunden, und ja, daraufhin hatte ich Leakage für „ausgeschlossen“ erklärt).

| Evaluationsset | n | ≥0,9 Overlap | Median |
|---|---|---|---|
| Confirmatory 2015 | 1.300 | 0,5% | 0,227 |
| Holdout | 4.274 | **30,5%** | 0,300 |

Dreißig Prozent, 60-mal stärker kontaminiert als der 2015er-Teil, und das Modell schnitt **schlechter** ab.

Leakage erklärt die Lücke also nicht, es läuft genau in die falsche Richtung. Wenn überhaupt, müsste der ehrliche Holdout-Wert *schlechter* als 0,637 sein, sobald man die Fast-Kopien entfernt. Auch das habe ich geprüft, indem ich die Scores pro Paar exportiert und aufgeteilt habe: Auf wirklich sauberen Paaren erreichte das Modell 0,646, also minimal *besser*. Die Fast-Duplikate brachten ihm absolut gar nichts.

Gut, Label-Noise vielleicht? Haben Holdout-Paare vielleicht einfach weniger Impressionen?

| Evaluationsset | Median Impressionen | Median z | Median CTR-Verhältnis |
|---|---|---|---|
| Confirmatory 2015 | 2.462 | 2,37 | 2,24 |
| Holdout | 3.096 | 2,64 | 1,99 |

Ebenfalls verkehrt herum lol. Holdout-Paare haben *mehr* Impressionen und *höhere* z-Scores. Das 2015er-Set hat zwar ein breiteres medianes CTR-Verhältnis (2,24 gegenüber 1,99), die Paare sind also tatsächlich leichter zu trennen, was real ist, aber das erklärt bei Weitem keine sieben Punkte Unterschied.

Also schrieb ich „ungeklärt“ ins Dokument und machte weiter. 0,63 ist die Zahl, zwei unabhängige Splits bestätigen sie, der abweichende ist der Ausreißer, und ich kann euch nicht sagen, warum.

**!! Nerd-Infodump-Alarm :3 !!**

## Der Teil, auf den es wirklich ankam

Nachdem ich mein eigenes Hauptergebnis zerlegt hatte, dachte ich mir, ich sollte wenigstens die Ablations ordentlich durchführen.

Ich erwartete, dass mehr Daten gewinnen würden, denn das ist der langweilige Standard-Prior: Man hat 62.695 Arms zur Verfügung, packt den dritten Split dazu und holt mehr raus. Also setzte ich zwei Runs auf: einen, der den Exploratory-Split zum Training hinzufügte, und einen, der die Loss-Funktion austauschte, beide evaluiert auf denselben 2.137 Holdout-Paaren.

```
Phase 0        confirmatory       MSE              0.637
more-data      expl+confirmatory  MSE              0.724
rank           confirmatory       Bradley-Terry    0.775
rank+more      expl+confirmatory  Bradley-Terry    0.787
```

![Ablation-Ergebnisse. Mehr Daten bringen 0,087 gegenüber der Baseline; der Wechsel zu Bradley-Terry bringt 0,138, und der beste Run erreicht 0,812.](/assets/img/blog/decision-models/ablations.png)

28 % mehr Trainingsdaten brachten **+0,053**, und das Ändern der Loss-Funktion brachte **+0,107**, bei zwei statt drei Epochen und auf dem kleineren Trainingsset – und hat trotzdem doppelt so stark gewonnen.

Im Nachhinein ist das völlig offensichtlich, auf die ärgerlichste Art und Weise. Der Benchmark ist *paarweise Genauigkeit*: Wähle bei zwei Überschriften die bessere. Und ich hatte auf Klickrate regressiert, habe also einen Proxy für die Metrik optimiert und mich dann an der Metrik selbst gemessen.

[Bradley-Terry](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) optimiert direkt das eigentliche Ziel. Für jedes Paar von Arms innerhalb eines Tests maximiert man `logsigmoid(score_winner - score_loser)`, gewichtet mit dem Log der Impressionen des kleineren Arms. Aus meinen 47.168 Trainings-Arms wurden 76.892 Paare innerhalb derselben Tests.

Selbes Modell. Selbe Daten. Anderes Ziel. 14 Punkte Vorsprung.

Aus Neugier habe ich auch ModernBERT-*base* laufen lassen (ein Drittel der Parameter), und es kam auf 0,761. Der Großteil des Effekts liegt also im Objective und in den Daten, nicht in der Modellgröße. Das ist praktisch, wenn man das Ding jemals auf einer CPU laufen lassen will.

Und dann gab es noch den Fall, der mir fast entgangen wäre. Ich probierte eine DeBERTa-v3-large-Variante aus, die auf Decision-Tasks vortrainiert war. Sie blieb über alle 4.804 Schritte exakt bei `-log(0,5)` hängen und erzielte einen Score von 0,519, was purem Zufall entspricht, völlig flach.

Man könnte das leicht als „DeBERTa ist schlechter“ abtun und weitermachen, und fast hätte ich das getan. Aber eine Loss-Kurve, die *vollkommen* flach genau bei dem Wert liegt, der „ich rate nur“ bedeutet, ist ein sehr spezifisches Muster. So sieht kein Modell aus, das schlecht lernt. Der Encoder war auch sauber geladen worden, nur der Classifier und der Pooler waren frisch initialisiert.

Es lag an der Learning Rate. DeBERTa-v3-large ist [berüchtigt instabil](https://github.com/microsoft/DeBERTa/issues/77) bei den 2e-5, mit denen ModernBERT problemlos läuft, und verlangt eher nach 6e-6. Und ich hatte dieselbe Konfiguration für beide verwendet, weil warum auch nicht.

Noch mal mit 6e-6 laufen lassen: Der Loss sank von 0,709 → 0,682 → 0,620 → 0,360, und das Modell landete bei **0,812** – zweieinhalb Punkte vor ModernBERT und 0,913 auf der Stufe mit der höchsten Konfidenz.

Ich habe auch den Slice ohne Fast-Duplikate darüber laufen lassen, weil ich mir an diesem Punkt selbst nicht mehr traute. Auf wirklich sauberen Paaren (nichts, was auch nur im Entferntesten den Trainingsdaten ähnelt) erreicht es **0,797** gegenüber 0,769 bei ModernBERT. Seine Memorization-Lücke ist zudem *kleiner* als die von ModernBERT, während es insgesamt höher punktet. Das ist das genaue Gegenteil davon, wie ein Modell aussieht, das nur durch Auswendiglernen gewinnt.

Das System funktionierte also die ganze Zeit einwandfrei, ich hatte bloß eine einzige Zahl falsch eingestellt.

## Aber was bedeutet 0,812 eigentlich *konkret*

Für einen Menschen ehrlich gesagt gar nichts. Das ist das Problem mit paarweiser Genauigkeit als Aussage: Sie sagt dir, dass die Reihenfolge stimmt, verrät aber nichts über die Größenordnung. Zwei Überschriften in 81,2 % der Fälle richtig zu ordnen, kann ein Vermögen wert sein oder absolut wertlos, je nachdem, wie weit sie tatsächlich auseinanderliegen.

Also habe ich gemessen, was jemand spüren würde, der die Kampagne tatsächlich verschickt. Für jeden Test nimmt man den vom Modell am besten bewerteten Arm und vergleicht seine reale Klickrate mit dem Mittelwert aller Arms in diesem Test. Denn ohne Modell hat man keinen Grund, eine Variante vorzuziehen, also ist der Mittelwert dessen, was man hätte senden können, das ehrliche Counterfactual.

| | CTR |
|---|---|
| Test-Mittelwert, ohne Modell | 1,20% |
| Auswahl des Modells | 1,42% |
| Orakel, perfekte Auswahl | 1,60% |

Das sind **+18,3% relative Klickrate** über 2.140 Tests hinweg. Und genau diesen Wert muss ich euch sofort wieder wegnehmen.

### Der Lift-Wert lässt sich nicht übertragen

18,3 % ist ein Fakt über Upworthy. Er hängt von deren Basisrate von 1,20 % ab und davon, wie stark die Varianten der Autoren streuten. Wendet man das auf einen B2B-Newsletter mit 2,5 % Klickrate und ähnlicheren Varianten an, ändert sich die Zahl in eine Richtung, die ich schlichtweg nicht vorhersagen kann.

Was sich *tatsächlich* übertragen lässt, ist alles, was ein Verhältnis innerhalb eines einzelnen Tests darstellt:

| Metrik | Wert |
|---|---|
| Meidet die schlechteste Variante | **90,3%** |
| Schlägt den Test-Durchschnitt | 76,6% |
| Wählt die tatsächlich beste Variante | 47,7% |
| Erfasster Headroom, medianer Test | 89,2% |
| Spearman, Score vs. Klickrate | 0,526 |

**90,3 % ist der Wert, für den ich tatsächlich meine Hand ins Feuer legen würde.** Es lässt einen fast nie das Schlechteste verschicken, was man geschrieben hat. Und das übersteht veränderte Basisraten, Zielgruppen und Medien ganz anders als ein pauschales „+18,3 %“. Und 47,7 % Top-1 bei meist vier oder fünf Arms ist etwa das 2,2-Fache des Zufalls.

Eine dieser Zahlen schummelt allerdings ein wenig. Der mediane erfasste Headroom liegt bei 89,2 %, mit einem Interquartilsabstand von 5 % bis 100 %, und über alle Tests gepoolt sind es 55,4 %. Das Modell verhält sich bimodal: Bei den meisten Tests holt es fast den gesamten verfügbaren Gewinn heraus, bei einer Minderheit fast gar keinen, und diese ziehen das Gesamtergebnis nach unten.

Danach habe ich eine [isotonische Regression](https://en.wikipedia.org/wiki/Isotonic_regression) darüber gelegt, damit der Score echte Einheiten statt bloßer Vibes bekommt. Isotonisch passt hier, weil es nur Monotonie voraussetzt (höherer Score, höhere Klickrate), was genau das ist, was Bradley-Terry garantiert, und buchstäblich alles, was es garantiert. Alles Parametrische würde Strukturen erfinden, die das Modell nie versprochen hat. Die Intervalle stammen aus Bootstrapping über *Tests* statt über Arms, da Arms innerhalb eines Tests denselben Artikel teilen und nicht unabhängig sind.

| Score | vs. Basis | 90%-Intervall |
|---|---|---|
| −2,72 | **−19,1%** | [−0,252, −0,209] Pp. |
| −1,06 | −8,2% | [−0,111, −0,086] Pp. |
| −0,20 | −0,7% | [−0,023, −0,000] Pp. |
| +0,56 | +3,7% | [+0,030, +0,056] Pp. |
| +1,62 | +11,1% | [+0,115, +0,147] Pp. |
| +2,82 | **+21,8%** | [+0,231, +0,274] Pp. |

![Kalibrierungskurve. Die Klickrate gegenüber der Baseline steigt monoton mit dem Modell-Score, wobei die 90%-Intervalle nur nahe der Mitte die Nulllinie kreuzen.](/assets/img/blog/decision-models/calibration.png)

Und schaut euch die mittleren Zeilen an: Dort kreuzen die Intervalle die Null, was bedeutet, dass das Modell richtigerweise sagt: „Diese beiden Überschriften sind gleich gut, wirf eine Münze.“

## Zu diesen 0,544

Ich meinte ja, dass ich darauf zurückkomme. Als ich mir genauer ansah, was sonst noch auf diesem Archiv gerechnet wurde, wurde der Vergleich, auf den ich mich gestützt hatte, deutlich schwächer, und etwas, das ich übersehen hatte, gewann massiv an Relevanz.

| Quelle | Task | Metrik | Wert | Zufall |
|---|---|---|---|---|
| LOLA, Menschen (n=4.571) | Top-1 von k | Accuracy | ~Zufall | 0,330 |
| LOLA, GPT-4 In-Context | Top-1 von k | Accuracy | 0,400 | 0,330 |
| LOLA, LoRA Llama-3-8B | Top-1 von k | Accuracy | 0,469 | 0,330 |
| LOLA, fine-tuned GPT-4o | Top-1 von k | Accuracy | 0,488 | 0,330 |
| [arXiv:2506.00152](https://arxiv.org/abs/2506.00152), Pythia-12B | signifikante Paare, + Teaser + Timestamp | ROC AUC | 0,82 | 0,50 |
| [PLOS ONE 0281682](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682) | Paare gematcht auf Artikel+Bild+Woche, K≤15 | Accuracy | 0,544 | ~0,50 |
| **VERA** | jedes Paar innerhalb eines Tests, nur Headline | Accuracy | **0,689** | 0,524 |

Keine einzige dieser Zeilen ist ein 1:1-Vergleich mit meinen Zahlen, und genau darum geht es.

Das Paper mit 0,544 matcht Paare nach Artikel, Bild *und* Testwoche und zieht dann zufällige Subsamples aus jedem Experiment mit mehr als 15 Paaren. Es trainiert auf 5.048 Paaren. Zudem ist es ein Registered Report, dessen erste Hypothese lautet: „Lässt sich das überhaupt besser als Zufall vorhersagen?“ – ein reiner Signifikanztest. Niemand dort hat versucht, die Accuracy zu maximieren. Es mit einem 435M-Parameter-Modell auf einer Größenordnung mehr Daten um 27 Punkte zu schlagen, ist nicht der Flex, als den ich es dargestellt hatte.

Was ich tatsächlich übersehen hatte, war das Pythia-12B Reward Model, und das ist mit Abstand das stärkste neuronale Ergebnis auf diesem Datensatz. ROC AUC 0,82. Es trainiert nur auf Paaren, deren CTR-Differenz bei 5 % signifikant ist (grob die leichtesten 28 %), und liest neben der Überschrift auch den Lead-Absatz des Artikels sowie den Zeitstempel des Beitrags. Es nutzt also ein einfacheres Label-Set mit mehr Input auf einer anderen Metrik und schlägt 0,812 trotzdem nicht. Aber wenn man die beiden Zahlen nebeneinander überfliegt, sehen sie identisch aus, und ich weise lieber selbst darauf hin, als dass es mir jemand anderes vorhält.

Was am Ende bleibt: Niemand hat bisher paarweise Genauigkeit eines feinabgestimmten Encoders auf ungefilterten Paaren innerhalb von Tests allein anhand des Headline-Texts berichtet. Das ist eine engere Behauptung als „schlägt SOTA“, aber eine, die ich tatsächlich verteidigen kann.

## Also habe ich den Vergleich selbst gerechnet

Jede Zahl oben stammt von anderen, gemessen an den Paaren anderer Leute. Also habe ich zwei aktuelle Systeme auf meine Paare losgelassen.

Jedes Paar wird zweimal abgefragt, einmal mit dem Gewinner an erster Stelle und einmal an zweiter, und es zählt nur, wenn beide Durchläufe dieselbe Überschrift wählen. Dieses Protokoll ist wichtig: Modelle wählen Slot A unabhängig vom Inhalt häufiger als Zufall, ein Durchlauf mit fester Reihenfolge bewertet sich also selbst auf einem Subset, das es selbst gewählt hat.

| System | Parameter | Gematchte Paare | Selbstkonsistent |
|---|---|---|---|
| **VERA** | 435M | **0,823** | — |
| Gemini 3.1 Pro | Frontier | 0,751 | 83,7% |
| Laya typed-decisions | 421M | 0,504 | 52,9% |

Und damit verabschiedet sich ein Argument, auf das ich mich gestützt hatte. Ich hatte behauptet, Menschen schnitten hier auf Zufallsniveau ab, mit der impliziten Annahme, dass die Aufgabe auch für Modelle schwer sei. Ist sie nicht. Gemini holt 0,751. Das menschliche Ergebnis gilt für Menschen und sagt nichts über Maschinen aus, und ich habe es benutzt, um etwas zu suggerieren, was es gar nicht hergibt.

Die ehrliche Version ist ohnehin besser: Ein 435M-Modell schlägt ein Frontier-Reasoning-Modell um sieben Punkte bei etwa einem Tausendstel der Kosten pro Call. 5,60 Dollar an Gemini-Calls, um das herauszufinden.

Laya ist das offene Decision-Model, nach dem alle fragen werden, und es antwortet hier mit der Zuverlässigkeit eines Münzwurfs. Das liest sich vernichtend, wenn man es so stehen lässt, daher: Seine Modellkarte deckt Rechnungsverarbeitung, Sicherheitsvorfälle, Kundenservice und Agent-Traces ab. Headline-Klickraten liegen außerhalb aller vier Bereiche. Das ist eine Frage des Domain-Fits, und ich würde erwarten, dass VERA bei der Rechnungsverarbeitung genauso alt aussieht.

Eine weitere Sache kam dabei heraus. Gemini erreicht 0,641 auf den Paaren, deren Klickraten-Unterschied bei 5 % nicht signifikant ist – also genau die, die ich als Rauschen abgetan hatte. Es hat diese Labels nie gesehen. Ein Modell ohne Zugriff auf die Ergebnisdaten schlägt dort also ebenfalls 0,500, was bedeutet, dass diese Paare echte Unterschiede enthalten, für deren Nachweis dem Experiment bloß die statistische Power fehlte. Dass VERA auf derselben Schicht 0,696 erreicht, erfordert keine Leakage-Erklärung, und bis ich Gemini laufen ließ, konnte ich diese beiden Interpretationen schlicht nicht auseinanderhalten.

## Okay, an dieser Stelle mache ich alles kaputt

Jede einzelne Zahl da oben stammt aus viralen Social-Headlines eines einzigen Publishers aus den Jahren 2013 bis 2015, und das, was ich eigentlich bauen will, bewertet E-Mail-Betreffzeilen.

Ein B2B-Newsletter an 4.000 Opt-in-Abonnenten hat so gut wie nichts gemeinsam mit „Dieses Kind hat gerade das gesamte Argument gegen Impfungen in einem Satz zerstört“.

Also habe ich es getestet. Reddit hat dieselbe Struktur wie das Archiv, wenn man ein Auge zudrückt: SNAP hat 132.308 Einreichungen veröffentlicht, bei denen dasselbe Bild etwa achtmal unter verschiedenen Titeln erneut eingereicht wurde. Ein Element, viele Textvarianten, ein gemessenes Ergebnis. 16.242 Bilder.

Da hier nichts randomisiert war, mussten drei Dinge bereinigt werden. Paare werden innerhalb eines Bildes *und* eines Subreddits gebildet, das Community-Niveau kürzt sich also heraus. Ein später Repost schneidet schlechter ab, weil er spät ist, also habe ich den Decay gegen den Resubmission-Index pro Subreddit gefittet und das Residuum gerankt. Und ein Paar bleibt nur bestehen, wenn der Residuen-Abstand groß genug ist, um einen Gewinner zu bestimmen.

117.118 Paare. VERA erreicht **0,522**. Zufall liegt bei 0,500. Eine simple Heuristik wie „längerer Titel gewinnt“ kommt auf 0,507.

Bei dieser Stichprobengröße beträgt der Standardfehler 0,0015. 0,522 liegt also etwa 15 Standardfehler über Zufall – real, aber klein genug, um nutzlos zu sein. Die Genauigkeit steigt zwar mit dem Residuen-Abstand (0,508 → 0,531 über die Quartile hinweg), was zeigt, dass der winzige Effekt ein echtes Signal und kein Artefakt ist. Sie reicht von 0,495 auf r/WTF bis 0,558 auf r/fffffffuuuuuuuuuuuu.

Das bisschen Signal, das da ist, gehört also Upworthy. Was auch immer VERA gelernt hat, ist der Tonfall eines einzelnen Publishers aus dem Jahr 2013, und der lässt sich nicht einfach mitnehmen.

Ich schränke meine eigene Einschränkung gleich wieder ein: Reddit-Upvotes sind keine Klickrate, und Tageszeit sowie Reputation des Posters bleiben unkontrolliert. Ein Null-Ergebnis kann hier nicht sauber trennen zwischen „kein Transfer möglich“ und „die Störfaktoren haben das Signal geschluckt“. Aber es ist der günstigste ehrliche Test, der verfügbar war, und er fiel negativ aus. Ich führe ihn lieber durch, als „Transfer ist ungetestet“ zu schreiben und den Leser das Beste annehmen zu lassen.

Der Test, den ich eigentlich wollte, braucht E-Mail-Daten. Also machte ich mich auf die Suche nach öffentlichen E-Mail-Daten mit echten, gemessenen Versand-Ergebnissen. Es gibt keine.

| Quelle | Größe | Verfügbarkeit |
|---|---|---|
| Return Path Betreffzeilen-Studie | 9M Betreffzeilen | Proprietär, 2015, nie veröffentlicht |
| Belkins B2B-Korpus | 5,5M E-Mails | Nur aggregierte Statistiken |
| Yahoo (IEEE 7004277) | 100k+ Zeilen, Milliarden Impressionen | Proprietär |
| Oracles NLORP-Paper | 300 Zeilen | Von Google gescraped, Raten nicht gemessen |
| Diverse Kaggle „E-Mail-Kampagnen“-Sets | unterschiedlich | Mock- oder synthetische Daten |

Eines davon ist ein arXiv-Paper von zwei leitenden Data Scientists bei Oracle, deren gesamter Datensatz aus „300+ verschiedenen Betreffzeilen von Sonderangebots-E-Mails, gesammelt aus mehreren Internetquellen via Google-Suche“ besteht. Ich mache mich darüber übrigens nicht lustig, das ist einfach buchstäblich alles, was es da draußen gibt.

Die aggregierten Erkenntnisse kursieren überall (sechs bis zehn Wörter performen am besten, 21 bis 40 Zeichen für Öffnungen, Zahlen bringen ein paar Punkte), aber nichts davon sind ergebnisbasierte Daten pro Versand, und nichts davon taugt zum Trainieren.

## Was das ganze Vorhaben in ein neues Licht rückt

Ich hatte mir eine bequeme kleine Geschichte eingeredet, bis eine zweite Meinung sie über den Haufen warf. Die Geschichte lautete: *Die Architektur ist Commodity, das wertvolle Gut sind proprietäre Ergebnis-Labels*. Die erste Hälfte stimmt, die zweite ist Unsinn, denn ich *habe* keine proprietären Labels. Upworthy ist öffentlich. Jeder mit einer GPU kann das an einem Wochenende für weniger Geld als eine Tasse Kaffee nachbauen. Das ist mit ein Grund, warum die Gewichte einfach online sind: Sie haben mich vier Dollar gekostet, da kann ich nicht so tun, als wären sie ein Burggraben.

Was ich tatsächlich habe, ist ein Nachweis, dass es geht. Das eigentliche Asset wäre ein kontinuierlicher Mess-Loop auf Live-Traffic, und den gibt es noch nicht.

Die Daten, die ich brauche, liegen ungenutzt bei E-Mail-Service-Providern herum. Jeder ESP mit A/B-Testing-Funktion hat Millionen von Betreffzeilen-Experimenten mit gemessenen Ergebnissen, und so gut wie niemand trainiert darauf Modelle. Ich brauche also keinen weiteren Head oder Benchmark, ich brauche eine Person, die Zugriff auf diese Logs hat.

## Worauf sich das übertragen lässt

Das Rezept ist ehrlich gesagt simpel genug für eine einzige Zeile: Wenn ein gemessenes Ergebnis existiert, trainiere darauf und hör auf, ein Modell nach seiner Meinung zu fragen.

Jeder A/B-Test, den dein Unternehmen jemals durchgeführt hat, liegt in irgendeiner Experimentierplattform herum – gelabelt, mit Ergebnis versehen, ungenutzt. Optimizely, Statsig, LaunchDarkly, was auch immer ihr nutzt: jahrelanges „Wir haben diese fünf ausprobiert und diese eine hat gewonnen“, und niemand hat je ein Modell darauf trainiert.

Überall dort, wo man ein Set von Kandidaten und eine nachgelagerte Zahl hat, greift dasselbe Prinzip:

| Entscheidung | Das Label, das ihr bereits habt |
|---|---|
| Betreffzeilen, Headlines, Push-Texte | Öffnungen, Klicks |
| Auswahl von Support-Makros | Gelöst ohne Eskalation |
| Retrieval-Reranking | Welches Ergebnis der Nutzer gewählt hat |
| Formulierung von Fehlermeldungen | Problem selbst gelöst oder Ticket erstellt |
| Titel von Produktangeboten | Conversions |
| Tool-Auswahl bei Agenten | War die Trajektorie erfolgreich |

Die letzte Zeile ist die spannendste, wenn man Agenten baut. Die drei Primitive von Jev sind Choice, Score und Noul, und alles in diesem Beitrag betrifft `score`. Aber derselbe Move funktioniert für `choice`, sobald jemand protokolliert hat, was nach der Entscheidung passiert ist – was beim Agent-Routing bisher fast niemand tut.

Eine ehrliche Einschränkung zu alldem gibt es allerdings: Ich habe genau einen Datenpunkt. Outcome-basiertes Training hat Zero-Shot-Judgments *bei einer einzigen Aufgabe* deutlich geschlagen. Ob dieser Vorsprung anderswo hält, ist ungetestet. Ich würde auf die Richtung wetten, nicht auf die exakte Zahl.

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

Lest die Scores immer als Set, niemals als einzelne Zahl. Das Trainingsziel war die Abweichung vom Mittelwert des jeweiligen Tests. Ein einzelner Score für sich allein bedeutet also nichts: Man gibt dem Modell die drei bis sechs Varianten, die man für einen Versand geschrieben hat, und es rankt sie. Ein Kalibrator, der Scores auf den erwarteten Lift abbildet, ist ebenfalls enthalten.

Und wem 435M zu wuchtig sind: Es gibt auch eine CPU-taugliche Variante. ModernBERT-base erreicht 0,761 bei einem Drittel der Parameter.

## Was es nicht tun wird

Sich auf E-Mails übertragen – oder zumindest habe ich keine Ahnung, ob es das tut.

Wenn ihr also einen Newsletter betreibt und vergangene Versendungen mit gemessenen Öffnungs- oder Klickraten habt: Ich würde es wahnsinnig gerne herausfinden. Meldet euch bei mir, die Daten bleiben natürlich eure.

## Das Fazit

Eines der Open-Weight-Modelle in diesem Bereich erzielt auf seinem eigenen Typed-Decisions-Benchmark Zero-Shot 0,362, was unter der Majority-Class-Baseline von 0,461 liegt.

Und der Leistungssprung war auch kein cleveres Modeling: Der Großteil kam von einer Loss-Funktion, die zur Metrik passte, und der Rest von 47.168 Zeilen, bei denen tatsächlich jemand gemessen hat, was passiert ist. Also ja: Wenn ihr eure Daten labelt, indem ihr ein Modell fragt, sucht vielleicht erst mal nach der Ground Truth. Vermutlich liegt sie sowieso schon irgendwo herum.

## Eine Anmerkung zu den Zahlen

Zwei Dinge haben sich am 24.09.2026 geändert, nachdem ich ein Modell diesen Beitrag adversarial habe lesen und auf den Code losgehen lassen.

Meine Evaluation rief `pairs_from` auf, was pro Test genau ein Paar behält: den besten Arm gegen den schlechtesten. Das Training nutzte jedoch jedes mögliche Paar. Die 0,812, die ich zitiert hatte, bezogen sich also auf das Paar mit dem größten Abstand in jedem Test, und die echte Zahl über alle Paare hinweg liegt bei **0,689**. Alle Zahlen in diesem Beitrag basieren nun auf den vollen 18.485 Paaren.

Zudem hatte ich den Sprung von 0,519 der OpenJev-Basis zugeschrieben, ohne jemals eine Kontrollgruppe laufen zu lassen. Das Standardmodell `microsoft/deberta-v3-large` erreicht auf demselben Set 0,805 gegenüber 0,812. Die Basis hatte also keinen messbaren Effekt, der Gewinn lag rein an der Learning Rate.

Die Zahlen im Ablation-Abschnitt basieren alle auf dem alten Set aus 2.137 Paaren. Sie ranken untereinander immer noch korrekt, da jeder Run auf dieselbe Weise evaluiert wurde.

---|---|---|---|
| Jedes Paar innerhalb eines Tests | 18.485 | 0,524 | **0,689** |
| Bester Arm gegen schlechtesten, einer pro Test | 2.137 | 0,546 | 0,812 |

Zwölf Punkte Unterschied. Was bitterer ist als die sieben Punkte, über deren Entdeckung ich mich in der ersten Hälfte dieses Beitrags noch gefreut hatte.

Und es gibt ein Detail, das hier besonders schmerzt. Weiter oben wiegle ich ein Ergebnis von Pythia-12B ab, weil es „nur auf Paaren trainiert, deren CTR-Differenz bei 5 % signifikant ist – grob die leichtesten 28 %“. Mein eigenes Evaluationsset war zu 70 % signifikant. Ich habe einen Filter kritisiert, den ich selbst noch schärfer angewendet hatte, und zwar in einem Satz, in dem ich darüber schrieb, wie vorsichtig man sein muss.

Im selben Review kam dann die Frage auf, warum ich eigentlich nie eine Kontrollgruppe für das Basismodell getestet hatte. Der Run `openjev2` hatte das Basismodell *und* die Learning Rate in einem Rutsch geändert, und ich hatte das Vortraining des Decision-Models für das Ergebnis verantwortlich gemacht. Also habe ich das reguläre `microsoft/deberta-v3-large` durch exakt dasselbe Rezept geschickt.

| Basis | Holdout, selbes Paar-Set |
|---|---|
| open-jev-deberta-v3-large | 0,812 |
| microsoft/deberta-v3-large | 0,805 |

Sieben Tausendstel Unterschied bei einem Standardfehler von fast neun. Das Vortraining des Decision-Models hatte keinen messbaren Effekt. Der Sprung von 0,519 lag an der Learning Rate, und das gilt für beide Basismodelle. Dieser Beitrag hieß ursprünglich „Fine-Tuning von OpenJev auf 62.695 A/B-Tests“, und beide Hälften dieses Titels waren falsch.

Ein paar kleinere Punkte aus demselben Review, alle berechtigt: Der mit den Gewichten ausgelieferte Kalibrator war auf einem *anderen Modell* gefittet worden; mein Bootstrap nutzte `.isin()` auf einem Sample mit Zurücklegen, was Duplikate stillschweigend verwirft und es in ein 63%-Subsample verwandelt; meine Zufalls-Baselines lagen um zwei Punkte daneben, weil ich sie nie aus den tatsächlichen Arm-Counts berechnet hatte; und mein Leaderboard zeigte den Score eines Modells auf 2.137 Paaren direkt neben dem eines anderen auf 1.788 Paaren, ohne jeden Hinweis darauf.

Alles ist mit Stand vom 24.09.2026 korrigiert und neu gemessen. Die Model Card, das Dataset und dieser Beitrag enthalten die korrigierten Zahlen.

Was ich daraus mitnehme, abgesehen vom Offensichtlichen: Den ersten Fehler habe ich bemerkt, weil zwei Splits nicht übereinstimmten – etwas, das die Daten von selbst taten, ohne dass man danach fragen musste. Den zweiten Fehler habe ich nicht bemerkt und hätte ihn auch nicht bemerkt, weil alles hinter dieser Funktion intern konsistent war. Jede Ablation nutzte dasselbe Set, also rankten sie relativ zueinander korrekt. Die Stufen stiegen monoton an. Der Fast-Duplikat-Slice verhielt sich unauffällig. Nichts sah falsch aus, weil nichts falsch *war*, außer der Beschriftung der Achse.

Ein Adversarial Review hat das in 20 Minuten aufgedeckt, für praktisch null Kosten. Ich veröffentliche diesen Abschnitt lieber selbst, als ihn von jemand anderem in den Kommentaren lesen zu müssen.

---

*Daten: [The Upworthy Research Archive](https://osf.io/jd64p/). Matias, J., Munger, K., Le Quere, M.A., Ebersole, C. (2021), Nature Scientific Data. CC BY 4.0. Experimente zwischen dem 25. Juni 2013 und dem 10. Januar 2014 sind durchgehend ausgeschlossen, da die Betreuer 2024 einen Fehler bei der Randomisierung offengelegt haben. Gewichte DOI: [10.57967/hf/10573](https://doi.org/10.57967/hf/10573).*
