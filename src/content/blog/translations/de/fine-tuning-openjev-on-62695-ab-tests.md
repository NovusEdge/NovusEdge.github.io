---
title: "Fine-Tuning von OpenJev auf 62.695 A/B-Tests"
date: 2026-09-23
tags: [ml, decision-models, calibration, open-weights, benchmarks]
draft: false
description: "Ich habe ein Decision-Model auf echten A/B-Tests trainiert, statt einfach ein anderes Modell nach seiner Meinung zu fragen. Es weicht deiner schlechtesten Variante in 90 % der Fälle aus, und mein erster Benchmark hat buchstäblich gar nichts gemessen lol"
---

Es gibt also rund 300 öffentliche Projekte, die auf den neuen Decision-Models aufbauen. Ich habe mir die für „Scoring und Ranking“ angeschaut (26 Stück), und ausnahmslos jedes einzelne bewertet Dinge, indem es einfach das Modell fragt, was es denkt. Bewerte diesen Artikel auf acht Qualitätsachsen, beurteile diesen Werbetext nach Geschmack, entscheide, ob dieses Dokument relevant ist – ihr wisst, was ich meine.

Und ganz ehrlich, das sind doch keine Daten? Das ist die Meinung eines Modells mit einer rangehefteten Zahl, und die ganze Kategorie baut ungelogen darauf auf.

Also habe ich eins auf echten, tatsächlich gemessenen Outcomes trainiert, und die Weights sind online, falls ihr damit rumspielen wollt: **[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)**, Apache 2.0, 435M Parameter, ein Forward Pass, es bewertet kurze persuasive Texte. Die Basis ist [`com-kotobalabs/open-jev-deberta-v3-large`](https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large), was wiederum ein DeBERTa-v3-large ist, das auf Typed Decisions vortrainiert wurde.

| Metrik | Dieses Modell | Zufall | Gemini 3.1 Pro |
|---|---|---|---|
| Pairwise Accuracy, ungesehener Split | **0,812** | 0,546 | 0,751 |
| Nur saubere Paare | **0,797** | 0,546 | - |
| Wählt die beste von 4–5 Varianten | **47,7 %** | 23,0 % | - |
| Vermeidet die schlechteste Variante | **90,3 %** | 77,0 % | - |
| Reddit-Titelpaare, out-of-domain | 0,522 | 0,500 | - |

Es ist auf 62.695 echten A/B-Arms aus 32.487 randomisierten Headline-Experimenten trainiert, und jede Zahl da oben stammt aus einem Split, den das Modell nie gesehen hat. Wie es dazu kam, steht unten, inklusive des Teils, in dem mein erster Benchmark absolut gar nichts gemessen hat (ja, das wurmt mich immer noch ein bisschen).

## Das Setup

Wie sich herausstellt, gibt es dafür einen perfekten Datensatz, der seit 2021 frei zugänglich herumliegt. Zwischen Januar 2013 und April 2015 hat Upworthy (ja, *dieses* Upworthy, die Leute von „Du wirst nicht glauben, was als Nächstes geschah“) 32.487 randomisierte A/B-Tests mit ihren Überschriften durchgeführt: echter Traffic, echte Randomisierung, 538 Millionen Zuweisungen. Und dann hat Cornell das Ganze als [das Upworthy Research Archive](https://osf.io/jd64p/) unter CC BY veröffentlicht. Jede Headline-Variante, jede Impression, jeder Klick.

Näher an eine Ground Truth kommt man bei kurzen persuasiven Texten kaum heran.

Also: ModernBERT-large mit einem Regression-Head, und das Target ist die geschrumpfte (shrunk) Logit-Klickrate, zentriert auf den Mittelwert des jeweiligen Tests. Die Zentrierung ist übrigens wichtig: Der *Artikel* macht den Großteil der Klickraten-Varianz aus, und eine Headline kann das nicht erklären. Was man also eigentlich vorhersagen will, ist, wie weit ein Arm vom Mittelwert des Tests entfernt liegt, in dem er lief. Dazu noch Beta-Binomial-Shrinkage in Richtung dieses Mittelwerts, sodass ein Arm mit 600 Impressions hauptsächlich als Prior zählt und einer mit 20.000 hauptsächlich als Evidence.

Fünfundzwanzig Minuten auf einer einzelnen L4, etwa vierzig Cent. Ich habe alles nach Januar 2015 als Holdout behalten, darauf getestet und kam auf **0,704 Pairwise Accuracy**.

Zum Vergleich: Die nächstgelegene veröffentlichte Zahl auf ungefilterten Paaren liegt bei [0,544](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682), von einer Gruppe aus Toronto, die handgefertigte linguistische Features genutzt hat. Ihr Paper kommt zu dem Schluss, dass das Problem „von Natur aus schwer ist, nicht bloß eine Frage der Stichprobengröße“. Ich komme noch darauf zurück, warum diese 0,544 ein schlechterer Vergleich ist, als es scheint, und später höre ich auf, fremde Zahlen zu zitieren, und führe den Vergleich einfach selbst durch.

Sechzehn Punkte darüber, für vierzig Cent. Also habe ich es natürlich aufgeschrieben: „Headline-Signal überlebt zwei Jahre Drift“.

## Und doch...

Die Behauptung in diesem Titel war, dass das Signal *Drift* überlebt, da die Trainingsdaten von 2013 bis 2014 stammten, das Testset von 2015 war und sich die Accuracy kaum bewegte, als ob zwei Jahre wandelnde Internetkultur dem Modell völlig egal wären. Das wäre eine echte Erkenntnis, wenn es stimmt. Und es zählt, weil der eigentliche Sinn des Ganzen ist, es irgendwann auf E-Mail-Betreffzeilen loszulassen. Wenn es nicht mal zwei Jahre innerhalb eines einzigen Publishers übersteht, überlebt es den Sprung auf ein völlig anderes Medium erst recht nicht.

Das Archiv wird in drei Splits geliefert (exploratory, confirmatory, holdout), und ich hatte auf confirmatory trainiert und getestet. Also habe ich, hauptsächlich aus Sorgfalt und in der festen Erwartung, das zu bestätigen, was ich schon „wusste“, dieselben Weights auf den anderen beiden ausgewertet.

```
confirmatory 2015:  0.704
holdout:            0.637
exploratory:        0.624
```

Cool.

Zwei Splits, die ich nie angefasst hatte, stimmten auf *jeder einzelnen Effektstärken-Stufe* bis auf 0,013 überein, und beide sagten mir, dass mein Spitzenwert um sieben Punkte künstlich aufgebläht war.

![Pairwise Accuracy über drei Splits des Upworthy-Archivs. Die confirmatory-2015-Linie liegt deutlich über holdout und exploratory, die eng beieinander liegen.](/assets/img/blog/decision-models/splits.png)

## Die Zeitmaschine, die sich nur seitwärts bewegt

Also habe ich die Dokumentation des Archivs diesmal wirklich richtig gelesen, und es stellt sich heraus: Das Archiv teilt Tests den Splits **zufällig** zu. Nicht chronologisch, zufällig.

![Zwei Balken. Der erste zeigt einen sauberen chronologischen Split, erst Train, dann Test. Der zweite zeigt die reale Struktur: Train- und Test-Blöcke über den gesamten Zeitraum verschachtelt.](/assets/img/blog/decision-models/split-structure.png)

| Split | Arms | Datumsbereich | Anteil vor 2015 |
|---|---|---|---|
| confirmatory | 51.891 | 2013-01-24 → 2015-04-30 | 83,5 % |
| holdout | 11.231 | 2013-01-24 → 2015-04-29 | 82,8 % |
| exploratory | 10.804 | 2013-01-26 → 2015-04-29 | 83,8 % |

Alle drei Splits decken dieselben Zeiträume im selben Verhältnis ab. Das bedeutet: Als ich auf holdout getestet habe, stammten 83 % der Testdaten aus dem *Trainingszeitraum*. Selbe Ära, selber Hausstil, alles gleich, nur eben Tests, die das Modell nie gesehen hatte. Und trotzdem schnitt es dort *schlechter* ab als auf dem 2015er-Ausläufer.

Wenn man das umdreht, ist es ehrlich gesagt fast schon witzig: Zeit kostet dieses Modell so gut wie nichts, während ungesehene Tests aus demselben Zeitraum es sieben Punkte kosten. Mein sorgfältig gebauter Drift-Test hatte die ganze Zeit über nur die Test-Identität gemessen, er steckte bloß im Kostüm zeitlicher Generalisierung.

Ich hatte eine Zeitmaschine gebaut, die sich nur seitwärts bewegt.

## Zwei Hypothesen, beide falsch herum

Der nächste Gedanke ist natürlich Data Leakage. Upworthy hat denselben Artikel unter Dutzenden Headline-Varianten umgeschrieben. Wenn man also *Tests* zufällig aufteilt, verteilen sich die Varianten eines Artikels über alle drei Splits, und holdout müsste voll von Fast-Kopien des Trainingstexts sein.

Ich habe kurz ein Inverted-Index-Skript geschrieben, um den maximalen Jaccard-Token-Overlap zwischen jeder Eval-Headline und den 38.950 Headlines zu messen, auf die das Modell tatsächlich gefittet wurde (exaktes String-Matching hatte fünf übereinstimmende Headlines von 650 gefunden, und ja, daraufhin hatte ich Leakage für „ausgeschlossen“ erklärt).

| Evaluationsset | n | ≥0,9 Overlap | Median |
|---|---|---|---|
| confirmatory 2015 | 1.300 | 0,5 % | 0,227 |
| holdout | 4.274 | **30,5 %** | 0,300 |

Dreißig Prozent, sechzigmal stärker kontaminiert als der 2015er-Teil, und es schnitt **schlechter** ab.

Leakage erklärt die Lücke also nicht, es geht in die komplett falsche Richtung. Wenn überhaupt, bedeutet das, dass der ehrliche Holdout-Wert *schlechter* als 0,637 sein müsste, sobald man die Fast-Kopien entfernt. Ich habe auch das überprüft, indem ich die Scores pro Paar gedumpt und geslict habe: Auf wirklich sauberen Paaren erzielte das Modell 0,646, also etwas *besser*. Die Fast-Duplikate brachten ihm also absolut gar nichts.

Gut, also Label-Noise? Vielleicht haben die Holdout-Paare einfach weniger Impressions.

| Evaluationsset | Median Impressions | Median z | Median CTR-Ratio |
|---|---|---|---|
| confirmatory 2015 | 2.462 | 2,37 | 2,24 |
| holdout | 3.096 | 2,64 | 1,99 |

Ebenfalls falsch herum lol. Holdout-Paare haben *mehr* Impressions und *höhere* z-Scores. Das 2015er-Set hat zwar eine breitere mediane CTR-Ratio (2,24 gegenüber 1,99), seine Paare sind also tatsächlich leichter zu trennen, was real ist, aber das macht bei Weitem keine sieben Punkte aus.

Also habe ich „ungeklärt“ ins Dokument geschrieben und weitergemacht. 0,63 ist die Zahl, zwei unabhängige Splits stimmen darin überein, der abweichende ist der Ausreißer, und ich kann euch nicht sagen, warum.

**!! Nerd-Infodump-Alarm :3 !!**

## Der Teil, auf den es wirklich ankam

Nachdem ich mein eigenes Vorzeige-Ergebnis zerlegt hatte, dachte ich, ich sollte wenigstens die Ablations ordentlich durchführen.

Ich hatte erwartet, dass Daten gewinnen, denn das ist der langweilige Prior: Du hast 62.695 Arms, wirf den dritten Split rein, hol mehr raus. Also habe ich zwei Runs aufgesetzt: einen, der den exploratory-Split zum Training hinzufügt, und einen, der die Loss-Funktion austauscht, beide evaluiert auf denselben 2.137 Holdout-Paaren.

```
Phase 0        confirmatory       MSE              0.637
more-data      expl+confirmatory  MSE              0.724
rank           confirmatory       Bradley-Terry    0.775
rank+more      expl+confirmatory  Bradley-Terry    0.787
```

![Ablation-Ergebnisse. Mehr Daten bringen +0,087 gegenüber der Baseline; der Wechsel zu Bradley-Terry bringt +0,138, und der beste Run erreicht 0,812.](/assets/img/blog/decision-models/ablations.png)

Achtundzwanzig Prozent mehr Trainingsdaten brachten **+0,053**, und die Änderung der Loss-Funktion brachte **+0,107**, bei zwei statt drei Epochen und auf dem kleineren Trainingsset – und hat trotzdem doppelt so stark abgeschnitten.

Was im Nachhinein offensichtlich ist, die schlimmste Art von offensichtlich. Der Benchmark ist *Pairwise Accuracy*, sprich: wähle bei zwei Headlines den Gewinner, und ich habe auf die Klickrate regrediert. Ich habe also einen Proxy für die Metrik optimiert und mich dann an der Metrik selbst gemessen.

[Bradley-Terry](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) optimiert die eigentliche Sache. Für jedes Paar von Arms innerhalb eines Tests maximiert man `logsigmoid(score_winner - score_loser)`, gewichtet mit den Log-Impressions des dünneren Arms. Aus meinen 38.950 Trainings-Arms wurden 63.597 Paare innerhalb desselben Tests.

Dasselbe Modell. Dieselben Daten. Anderes Objective. Vierzehn Punkte.

Aus Neugier habe ich auch ModernBERT-*base* laufen lassen (ein Drittel der Parameter), und es kam auf 0,761. Das meiste davon steckt also im Objective und in den Daten, nicht in der Modellgröße. Das ist praktisch, falls man das Ganze jemals auf einer CPU laufen lassen will.

Und dann ist da noch der Fall, der mir fast entgangen wäre. Ich habe eine DeBERTa-v3-large-Variante ausprobiert, die auf Decision-Tasks vortrainiert war, und sie blieb über alle 4.804 Schritte exakt bei `-log(0.5)` stehen und erzielte einen Score von 0,519 – also reiner Zufall, komplett flach.

Man könnte das leicht als „DeBERTa ist schlechter“ abtun und weitermachen – fast hätte ich das auch getan. Aber eine Loss-Kurve, die *vollkommen* flach genau bei dem Wert liegt, der „ich rate nur“ bedeutet, ist eine sehr spezifische Signatur. So sieht kein Modell aus, das einfach nur schlecht lernt. Der Encoder war auch problemlos geladen worden, nur Classifier und Pooler waren frisch initialisiert.

Es lag an der Learning Rate. DeBERTa-v3-large ist [berüchtigt instabil](https://github.com/microsoft/DeBERTa/issues/77) bei den 2e-5, mit denen ModernBERT gut klarkommt, und will eher etwas um die 6e-6. Und ich hatte dieselbe Config für beide verwendet, weil warum auch nicht.

Nochmal bei 6e-6 laufen lassen: Der Loss sank 0,709 → 0,682 → 0,620 → 0,360, und am Ende stand eine **0,812** – zweieinhalb Punkte über ModernBERT und 0,913 auf der Stufe mit dem höchsten Vertrauensbereich.

Ich habe auch den Near-Duplicate-Slice darauf laufen lassen, weil ich mir an diesem Punkt selbst nicht mehr traue, und auf wirklich sauberen Paaren (nichts, was irgendetwas im Training ähnelt) holt es **0,797** gegenüber 0,769 bei ModernBERT. Seine Memorization Gap ist zudem *kleiner* als die von ModernBERT, während es höher punktet – genau das Gegenteil von dem, wie ein Modell aussieht, das nur durch Auswendiglernen gewinnt.

Das System hat also die ganze Zeit funktioniert, ich hatte nur eine einzige Zahl falsch eingestellt.

## Aber was bedeutet 0,812 eigentlich *konkret*?

Ehrlich gesagt: für einen Menschen gar nichts. Das ist das Problem mit Pairwise Accuracy als Aussage: Sie besagt, dass die Reihenfolge stimmt, sagt aber nichts über die Größenordnung aus. Zwei Headlines in 81,2 % der Fälle richtig anzuordnen, kann ein Vermögen wert sein oder gar nichts, je nachdem, wie weit sie tatsächlich auseinanderliegen.

Also habe ich gemessen, was jemand spüren würde, der das Ding tatsächlich verschickt. Nehmt für jeden Test den vom Modell am besten bewerteten Arm und vergleicht dessen reale Klickrate mit dem Mittelwert aller Arms in diesem Test. Denn ohne Modell gibt es keinen Grund, eine Variante zu bevorzugen, der Mittelwert dessen, was man verschickt hätte, ist also das ehrliche Counterfactual.

| | CTR |
|---|---|
| Test-Mittelwert, kein Modell | 1,20 % |
| Auswahl des Modells | 1,42 % |
| Orakel, perfekte Auswahl | 1,60 % |

Das sind **+18,3 % relative Klickrate** über 2.140 Tests, und ich muss euch diese Hoffnung direkt wieder nehmen.

### Die Lift-Zahl lässt sich nicht übertragen

18,3 % ist eine Eigenschaft von Upworthy. Es hängt von deren 1,20 % Basisrate ab und davon, wie viel Streuung die Autoren zwischen die Varianten gebracht haben. Wendet man das auf einen B2B-Newsletter mit 2,5 % Klickrate und ähnlicheren Varianten an, ändert sich die Zahl – in eine Richtung, die ich beim besten Willen nicht vorhersagen kann.

Was sich *tatsächlich* übertragen lässt, ist alles, was ein Verhältnis innerhalb eines einzelnen Tests darstellt:

| Metrik | Wert |
|---|---|
| Vermeidet die schlechteste Variante | **90,3 %** |
| Schlägt den Test-Durchschnitt | 76,6 % |
| Wählt die tatsächlich beste Variante | 47,7 % |
| Genutzter Spielraum (Headroom), medianer Test | 89,2 % |
| Spearman, Score vs. Klickrate | 0,526 |

**90,3 % ist die Zahl, hinter der ich wirklich stehe.** Es lässt einen so gut wie nie das Schlechteste abschicken, was man geschrieben hat, und das übersteht einen Wechsel von Basisrate, Zielgruppe und Medium auf eine Weise, wie es „+18,3 %“ einfach nicht tut. Und 47,7 % Top-1 bei meist vier oder fünf Arms ist etwa das 2,2-Fache des Zufalls.

Eine dieser Zahlen schummelt allerdings ein bisschen. Der mediane erfasste Headroom liegt bei 89,2 %, mit einem Interquartilsabstand von 5 % bis 100 %, und über alle Tests gepoolt sind es 55,4 %. Das Modell verhält sich bimodal: Bei den meisten Tests holt es fast den gesamten verfügbaren Gewinn heraus, und bei einer Minderheit fast gar keinen, und die ziehen das Gesamtergebnis runter.

Dann habe ich eine [isotonische Regression](https://en.wikipedia.org/wiki/Isotonic_regression) darüber gelegt, damit der Score echte Einheiten statt bloßer Vibes hat. Isotonisch passt hier, weil es nur Monotonie voraussetzt (höherer Score, höhere Klickrate), was genau das ist, was Bradley-Terry garantiert, und buchstäblich alles, was es garantiert. Alles Parametrische würde Strukturen hinzuerfinden, die das Modell nie versprochen hat. Die Intervalle stammen aus Bootstrapping über *Tests* statt über Arms, da Arms innerhalb eines Tests denselben Artikel teilen und nicht unabhängig sind.

| Score | vs. Basis | 90%-Intervall |
|---|---|---|
| −2,72 | **−19,1 %** | [−0,252, −0,209] pp |
| −1,06 | −8,2 % | [−0,111, −0,086] pp |
| −0,20 | −0,7 % | [−0,023, −0,000] pp |
| +0,56 | +3,7 % | [+0,030, +0,056] pp |
| +1,62 | +11,1 % | [+0,115, +0,147] pp |
| +2,82 | **+21,8 %** | [+0,231, +0,274] pp |

![Kalibrierungskurve. Die Klickrate gegenüber der Baseline steigt mit dem Modell-Score monoton an, mit 90%-Intervallen, die nur nahe der Mitte die Null schneiden.](/assets/img/blog/decision-models/calibration.png)

Und schaut euch die mittleren Zeilen an: Dort schneiden die Intervalle die Null, was bedeutet, dass das Modell richtigerweise sagt: „Diese beiden Überschriften sind im Grunde gleich, wirf eine Münze“.

## Zu dieser 0,544

Ich meinte ja, dass ich darauf zurückkommen würde. Als ich mir genauer ansah, was sonst noch auf diesem Archiv gerechnet wurde, wurde der Vergleich, auf den ich mich gestützt hatte, deutlich schwächer – und etwas, das ich übersehen hatte, viel relevanter.

| Quelle | Aufgabe | Metrik | Wert | Zufall |
|---|---|---|---|---|
| LOLA, Menschen (n=4.571) | Top-1 von k | Accuracy | ~Zufall | 0,330 |
| LOLA, GPT-4 In-Context | Top-1 von k | Accuracy | 0,400 | 0,330 |
| LOLA, LoRA Llama-3-8B | Top-1 von k | Accuracy | 0,469 | 0,330 |
| LOLA, fine-getuntes GPT-4o | Top-1 von k | Accuracy | 0,488 | 0,330 |
| [arXiv:2506.00152](https://arxiv.org/abs/2506.00152), Pythia-12B | signifikante Paare, + Vorspann + Timestamp | ROC AUC | 0,82 | 0,50 |
| [PLOS ONE 0281682](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682) | Paare gematcht nach Artikel+Bild+Woche, K≤15 | Accuracy | 0,544 | ~0,50 |
| **VERA** | alle Within-Test-Paare, nur Headline | Accuracy | **0,812** | 0,546 |

Keine einzige dieser Zeilen ist ein 1:1-Vergleich mit meinen Daten, und genau darum geht es.

Das Paper mit der 0,544 matcht Paare nach Artikel, Bild *und* Testwoche und zieht dann ein zufälliges Subsample für jedes Experiment mit mehr als 15 Paaren. Es trainiert auf 5.048 Paaren. Und es ist ein Registered Report, dessen erste Hypothese lautet: „Lässt sich das überhaupt besser als der Zufall vorhersagen?“ (ein Signifikanztest). Niemand dort hat versucht, die Accuracy zu maximieren. Das mit einem 435M-Parameter-Modell auf einer Größenordnung mehr Daten um 27 Punkte zu schlagen, ist nicht der Flex, für den ich es gehalten habe.

Was ich tatsächlich übersehen hatte, ist das Pythia-12B Reward Model, und es ist mit Abstand das stärkste neuronale Ergebnis auf diesem Datensatz. ROC AUC 0,82. Es trainiert nur auf Paaren, deren CTR-Unterschied bei 5 % signifikant ist (ungefähr die leichtesten 28 %), und es liest neben der Headline auch den Vorspann des Artikels und den Timestamp des Posts. Es ist also ein einfacheres Label-Set mit mehr Input auf einer anderen Metrik, und es schlägt die 0,812 nicht. Aber wenn man die beiden Zahlen nebeneinander überfliegt, sehen sie identisch aus, und ich weise lieber selbst darauf hin, als dass mich jemand anderes darauf hinweisen muss.

Was von alledem übrig bleibt: Niemand hat bisher Pairwise Accuracy von einem fine-getunten Encoder auf ungefilterten Within-Test-Paaren allein aus dem Headline-Text berichtet. Das ist eine engere Behauptung als „schlägt SOTA“, aber eine, die ich tatsächlich verteidigen kann.

## Also habe ich den Vergleich selbst durchgeführt

Jede Zahl oben stammt von jemand anderem, gemessen auf den Paaren von jemand anderem. Also habe ich zwei aktuelle Systeme auf meine losgelassen.

Jedes Paar wird zweimal abgefragt: einmal mit dem Gewinner an erster Stelle und einmal an zweiter Stelle. Gewertet wird es nur, wenn beide Reihenfolgen dieselbe Headline wählen. Dieses Protokoll ist wichtig: Modelle wählen Slot A unabhängig vom Inhalt häufiger als der Zufall, ein Durchlauf mit nur einer Reihenfolge bewertet sich also selbst auf einem Subset, das es selbst ausgewählt hat.

| System | Parameter | Gematchte Paare | Selbstkonsistent |
|---|---|---|---|
| **VERA** | 435M | **0,823** | — |
| Gemini 3.1 Pro | Frontier | 0,751 | 83,7 % |
| Laya typed-decisions | 421M | 0,504 | 52,9 % |

Und damit verpufft ein Argument, auf das ich mich gestützt hatte. Ich hatte behauptet, dass Menschen hier auf Zufallsniveau liegen, mit der Implikation, dass die Aufgabe auch für Modelle schwer ist. Ist sie nicht. Gemini holt 0,751. Das menschliche Ergebnis bezieht sich auf Menschen und sagt rein gar nichts über Maschinen aus, und ich habe es benutzt, um etwas zu behaupten, was es gar nicht hergibt.

Die ehrliche Version ist sowieso besser: Ein 435M-Modell schlägt ein Frontier-Reasoning-Modell um sieben Punkte bei etwa einem Tausendstel der Kosten pro Call. 5,60 $ an Gemini-Calls, um das herauszufinden.

Laya ist das offene Decision-Model, nach dem alle fragen werden, und es antwortet hier mit der Zuverlässigkeit eines Münzwurfs. Das liest sich verheerend, wenn man es einfach so stehen lässt, daher: Seine Model Card deckt Rechnungsverarbeitung, Sicherheitsvorfälle, Kundenservice und Agent Traces ab. Headline-Klickraten liegen außerhalb aller vier Bereiche. Das ist ein Domain-Fit-Wert, und ich würde erwarten, dass VERA bei der Rechnungsverarbeitung genauso alt aussieht.

Eine Sache hat sich dabei noch ergeben: Gemini erreicht 0,641 auf den Paaren, deren Klickraten-Unterschied die 5%-Signifikanz verfehlt – die Paare, die ich als Rauschen bezeichnet hatte. Es hat diese Labels nie gesehen. Ein Modell ohne Zugriff auf die Outcome-Daten schlägt dort also ebenfalls die 0,500, was bedeutet, dass diese Paare echte Unterschiede enthalten, für deren Nachweis dem Experiment schlicht die statistische Power fehlte. Dass VERA auf demselben Stratum 0,696 erzielt, erfordert keine Leakage-Erklärung, und bis ich Gemini laufen ließ, konnte ich diese beiden Lesarten ehrlich nicht auseinanderhalten.

## Okay, an diesem Punkt mache ich alles kaputt

Jede einzelne Zahl oben stammt von viralen Social-Media-Headlines eines einzigen Publishers aus den Jahren 2013 bis 2015, und das, was ich eigentlich bauen will, bewertet E-Mail-Betreffzeilen.

Ein B2B-Newsletter an 4.000 angemeldete Abonnenten hat so gut wie nichts gemeinsam mit „Dieses Kind hat mit einem einzigen Satz das komplette Argument gegen Impfungen zerstört“.

Also habe ich es getestet. Reddit hat im Grunde dieselbe Struktur wie das Archiv, wenn man ein Auge zudrückt: SNAP hat 132.308 Submissions veröffentlicht, bei denen dasselbe Bild jeweils etwa achtmal unter einem anderen Titel erneut eingereicht wurde. Ein Item, viele Textvarianten, ein gemessenes Outcome. 16.242 Bilder.

Nichts daran war randomisiert, also mussten drei Dinge vorher bereinigt werden. Paare werden innerhalb eines Bildes *und* eines Subreddits gebildet, das Community-Level kürzt sich also heraus. Ein später Repost schneidet schlechter ab, weil er spät ist, also habe ich den Decay gegen den Resubmission-Index pro Subreddit gefittet und das Residuum gerankt. Und ein Paar überlebt nur, wenn der Unterschied im Residuum groß genug ist, um einen klaren Gewinner zu bestimmen.

117.118 Paare. VERA erzielt **0,522**. Zufall liegt bei 0,500. Eine „längerer Titel gewinnt“-Regel kommt auf 0,507.

Bei dieser Stichprobengröße beträgt der Standardfehler 0,0015, 0,522 liegt also etwa fünfzehn Standardfehler über dem Zufall – real, aber klein genug, um nutzlos zu sein. Die Accuracy steigt zwar mit dem Residuumsabstand, 0,508 → 0,531 über die Quartile, was zeigt, dass der winzige Effekt echtes Signal und kein Artefakt ist. Sie reicht von 0,495 auf r/WTF bis 0,558 auf r/fffffffuuuuuuuuuuuu.

Die 0,812 gehört also Upworthy. Was auch immer VERA gelernt hat, ist der Stil eines Publishers aus dem Jahr 2013, und er lässt sich nicht mitnehmen.

Ich schränke meinen eigenen Einwand noch ein: Reddit-Upvotes sind keine Klickrate, und Tageszeit sowie Reputation des Submitters bleiben unkontrolliert. Ein Null-Ergebnis kann hier nicht sauber trennen zwischen „kein Transfer“ und „die Störvariablen haben es geschluckt“. Aber es ist der günstigste ehrliche Test, der verfügbar war, und er fiel negativ aus. Und ich führe ihn lieber durch, als „Transfer ist ungetestet“ zu schreiben und den Leser das Beste annehmen zu lassen.

Der Test, den ich eigentlich machen wollte, braucht E-Mail-Daten. Also habe ich nach öffentlichen E-Mail-Daten mit echten, gemessenen Versand-Outcomes gesucht, und es gibt keine.

| Quelle | Umfang | Verfügbarkeit |
|---|---|---|
| Return-Path-Betreffzeilenstudie | 9 Mio. Betreffzeilen | Proprietär, 2015, nie veröffentlicht |
| Belkins-B2B-Korpus | 5,5 Mio. E-Mails | Nur aggregierte Statistiken |
| Yahoo (IEEE 7004277) | 100k+ Zeilen, Milliarden Impressions | Proprietär |
| Oracles NLORP-Paper | 300 Zeilen | Von Google gescrapt, Raten nicht gemessen |
| Verschiedene Kaggle-„E-Mail-Kampagnen“-Sets | variiert | Mock-Daten oder synthetisch |

Eines davon ist ein arXiv-Paper von zwei Principal Data Scientists bei Oracle, deren gesamter Datensatz aus „300+ verschiedenen Betreffzeilen von Sonderangebots-E-Mails, gesammelt aus mehreren Internetquellen per Google-Suche“ besteht. Ich will mich übrigens gar nicht über sie lustig machen, das ist einfach ungelogen das Einzige, was da draußen existiert.

Die aggregierten Erkenntnisse kursieren überall frei herum (sechs bis zehn Wörter performen am besten, einundzwanzig bis vierzig Zeichen für Öffnungen, Zahlen bringen ein paar Punkte), aber nichts davon sind Outcome-Daten auf Einzelebene und nichts davon lässt sich trainieren.

## Was das ganze Unterfangen in ein neues Licht rückt

Ich hatte mir eine bequeme kleine Geschichte eingeredet, bis eine zweite Meinung sie über den Haufen geworfen hat. Die Geschichte lautete: *Die Architektur ist Commodity, das wertvolle Asset sind proprietäre Outcome-Labels*. Die erste Hälfte stimmt, aber die zweite Hälfte ist Unsinn, denn ich *habe* keine proprietären Labels. Upworthy ist öffentlich, jeder mit einer GPU kann meine 0,812 an einem Wochenende für weniger als einen Kaffee reproduzieren. Das ist auch ein Grund, warum die Weights einfach online stehen: Sie haben mich vier Dollar gekostet, da kann ich nicht so tun, als wären sie ein Burggraben.

Was ich eigentlich habe, ist ein Leistungsnachweis. Das wirkliche Asset wäre ein fortlaufender Measurement-Loop auf Live-Traffic, und den gibt es noch nicht.

Die Daten, die ich brauche, liegen bei Email Service Providern ungenutzt herum. Jeder ESP mit einem A/B-Testing-Feature hat Millionen von Betreffzeilen-Experimenten mit gemessenen Outcomes, und so gut wie niemand trainiert irgendetwas darauf. Ich brauche also keinen weiteren Head oder einen weiteren Benchmark, ich brauche eine Person, die Zugriff auf die Logs hat.

## Worauf sich das generalisieren lässt

Das Rezept ist ehrlich gesagt simpel genug, um in eine einzige Zeile zu passen: Wenn ein gemessenes Outcome existiert, trainiere darauf und hör auf, ein Modell nach seiner Meinung zu fragen.

Jeder A/B-Test, den dein Unternehmen je durchgeführt hat, liegt in irgendeiner Experimentation-Plattform, gelabelt, mit angehängtem Ergebnis, und verstaubt. Optimizely, Statsig, LaunchDarkly, was auch immer ihr nutzt: Es sind Jahre voller „Wir haben diese fünf ausprobiert und diese eine hat gewonnen“, und niemand hat je ein Modell darauf trainiert.

Überall dort, wo man ein Candidate-Set und eine nachgelagerte Zahl hat, gilt genau dasselbe:

| Entscheidung | Das Label, das ihr bereits habt |
|---|---|
| Betreffzeilen, Überschriften, Push-Texte | Öffnungen, Klicks |
| Auswahl von Support-Makros | Gelöst ohne Eskalation |
| Retrieval-Reranking | Welches Ergebnis der Nutzer akzeptiert hat |
| Formulierung von Fehlermeldungen | Problem selbst gelöst oder Ticket erstellt |
| Titel von Produktangeboten | Conversions |
| Tool-Auswahl bei Agents | War die Trajectory erfolgreich |

Die letzte Zeile ist die spannendste, wenn man Agents baut. Jevs drei Primitive sind choice, score und noul, und alles in diesem Beitrag berührt `score`. Aber derselbe Move funktioniert auch für `choice`, wo immer jemand protokolliert hat, was nach der Entscheidung passiert ist (was beim Routing der meisten Agents bisher noch niemand tut).

Eine ehrliche Einschränkung bei all dem: Ich habe genau einen Datenpunkt. Outcome-Training hat Zero-Shot-Urteile *bei einer Aufgabe* deutlich geschlagen, und ob dieser Vorsprung irgendwo anders hält, ist ungetestet. Ich würde also auf die Richtung wetten, nicht auf die genaue Zahl.

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

Lest die Scores als Set, niemals als einzelne Zahl. Das Trainingsziel war die Abweichung vom Mittelwert des jeweiligen Tests, ein einzelner Score für sich allein bedeutet also nichts. Man gibt ihm die 3 bis 6 Varianten, die man für einen Versand geschrieben hat, und es rankt sie. Ein Kalibrator, der den Score auf den erwarteten Lift abbildet, ist ebenfalls enthalten.

Und falls 435M zu wuchtig ist, gibt es auch eine CPU-taugliche Version: ModernBERT-base erreicht 0,761 bei einem Drittel der Parameter.

## Was es nicht tun wird

Sich auf E-Mails übertragen – oder zumindest habe ich keine Ahnung, ob es das tut.

Wenn ihr also einen Newsletter betreibt und vergangene Versendungen mit gemessenen Öffnungs- oder Klickraten habt, würde ich das wirklich gerne herausfinden. Meldet euch bei mir, und die Daten bleiben natürlich bei euch.

## Das Fazit

Eines der Open-Weight-Modelle in diesem Bereich erzielt Zero-Shot 0,362 auf seinem eigenen Typed-Decisions-Benchmark, was unter der Majority-Class-Baseline von 0,461 liegt.

Und der Sprung von 0,637 auf 0,812 war auch kein genialer Modellierungstrick: Zwei Drittel davon kamen durch die Wahl eines Loss zustande, der zur Metrik passte, und der Rest aus 62.695 Zeilen, in denen jemand gemessen hat, was tatsächlich passiert ist. Also ja: Wenn ihr eure Daten labelt, indem ihr ein Modell fragt, sucht vielleicht erst mal nach der Ground Truth – wahrscheinlich liegt sie ohnehin schon irgendwo herum.

---

*Daten: [The Upworthy Research Archive](https://osf.io/jd64p/). Matias, J., Munger, K., Le Quere, M.A., Ebersole, C. (2021), Nature Scientific Data. CC BY 4.0. Experimente zwischen dem 25. Juni 2013 und dem 10. Januar 2014 wurden durchgehend ausgeschlossen, da die Maintainer 2024 einen Randomisierungsfehler offengelegt haben. Weights DOI: [10.57967/hf/10573](https://doi.org/10.57967/hf/10573).*
