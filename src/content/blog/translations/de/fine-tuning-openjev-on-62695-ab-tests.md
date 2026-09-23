---
title: "Fine-Tuning von OpenJev auf 62.695 A/B-Tests"
date: 2026-09-23
tags: [ml, decision-models, calibration, open-weights, benchmarks]
draft: false
description: "Ich habe ein Decision-Modell auf A/B-Tests trainiert, die tatsächlich durchgeführt wurden, statt einfach ein anderes Modell nach seiner Meinung zu fragen. Es vermeidet in 90 % der Fälle deine schlechteste Variante, und mein erster Benchmark hat buchstäblich gar nichts gemessen lol"
---

Es gibt da draußen rund 300 öffentliche Projekte, die auf den neuen Decision-Modellen aufbauen. Ich habe mir die für „Scoring and Ranking“ angeschaut (26 Stück), und ausnahmslos jedes einzelne bewertet Dinge, indem es einfach das Modell fragt, was es denkt. Bewerte diesen Artikel auf acht Qualitätsachsen, beurteile diesen Werbetext nach Geschmack, entscheide, ob dieses Dokument relevant ist, ihr wisst, was ich meine.

Und ganz ehrlich, das sind doch keine Daten? Das ist die Meinung eines Modells mit einer rangehefteten Zahl, und die ganze Kategorie basiert darauf, ngl.

Also habe ich eines auf Ergebnissen trainiert, die tatsächlich jemand gemessen hat. Die Gewichte sind online, falls ihr damit rumspielen wollt: **[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)**, Apache 2.0, 435 Mio. Parameter, ein Forward Pass, bewertet kurze persuasive Texte. Die Basis ist [`com-kotobalabs/open-jev-deberta-v3-large`](https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large), was wiederum ein auf typisierten Entscheidungen vortrainiertes DeBERTa-v3-large ist.

| Metrik | Dieses Modell | Veröffentlichter SOTA | Menschen |
|---|---|---|---|
| Paarweise Accuracy, ungesehener Split | **0.812** | 0.544 | ~Zufall |
| Nur saubere Paare | **0.797** | - | - |
| Vermeidet die schlechteste Variante | **90.3%** | - | - |

Es ist auf 62.695 echten A/B-Varianten aus 32.487 randomisierten Headline-Experimenten trainiert, und jede Zahl da oben stammt aus einem Split, den das Modell nie gesehen hat. Wie es dazu kam, steht unten, inklusive des Teils, bei dem mein erster Benchmark absolut gar nichts gemessen hat (ja, ich bin deswegen immer noch ein bisschen salty).

## Das Setup

Wie sich herausstellt, gibt es dafür einen perfekten Datensatz, der seit 2021 frei verfügbar herumliegt. Zwischen Januar 2013 und April 2015 führte Upworthy (ja, *dieses* Upworthy, die „Du wirst nicht glauben, was als Nächstes geschah“-Leute) 32.487 randomisierte A/B-Tests mit ihren Überschriften durch: echter Traffic, echte Randomisierung, 538 Millionen Zuweisungen. Und dann hat Cornell das Ganze als [Upworthy Research Archive](https://osf.io/jd64p/) unter CC BY veröffentlicht. Jede Headline-Variante, jede Impression, jeder Klick.

Das ist so nah an einer Ground Truth, wie man es bei kurzen persuasiven Texten überhaupt bekommen kann.

Also: ModernBERT-large mit einem Regressions-Head, und das Target ist die geschrumpfte Logit-Klickrate, zentriert auf den Mittelwert des jeweiligen Tests. Die Zentrierung ist übrigens wichtig: Der *Artikel* treibt den Großteil der Varianz der Klickrate und eine Headline kann das nicht erklären. Was man also eigentlich vorhersagen will, ist, wie weit ein Arm vom Mittelwert des Tests entfernt liegt, in dem er lief. Dazu dann Beta-Binomial-Shrinkage in Richtung dieses Mittelwerts, sodass ein Arm mit 600 Impressionen hauptsächlich als Prior zählt und einer mit 20.000 hauptsächlich als Evidenz.

Fünfundzwanzig Minuten auf einer einzelnen L4, etwa vierzig Cent. Ich habe alles nach Januar 2015 zurückgehalten, darauf getestet und kam auf **0.704 paarweise Accuracy.**

Zum Vergleich: Der veröffentlichte State of the Art auf genau diesem Datensatz liegt bei [0.544](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682), von einer Gruppe aus Toronto, die handgefertigte linguistische Features auf 24.333 Paaren verwendet hat. Ihr Paper kommt zu dem Schluss, dass das Problem „von Natur aus schwer ist, nicht bloß eine Frage der Stichprobengröße“. Menschen schneiden bei derselben Aufgabe auf Zufallsniveau ab, und in der Literatur gibt es ein per LoRA angepasstes Llama-3-8B, das 0.469 erreicht lmao.

Sechzehn Punkte über der veröffentlichten Zahl, für vierzig Cent. Natürlich habe ich das sofort aufgeschrieben: „Headline-Signal überlebt zwei Jahre Drift.“

## Und doch

Die Behauptung in diesem Titel war, dass das Signal *Drift* überlebt, da die Trainingsdaten von 2013 bis 2014 stammten, das Testset von 2015 war und die Accuracy sich kaum verändert hat, als ob zwei Jahre sich wandelnder Internetkultur dem Modell völlig egal gewesen wären. Das wäre ein echtes Ergebnis, wenn es denn stimmte. Und es ist wichtig, weil das eigentliche Ziel ja ist, das Ganze irgendwann auf E-Mail-Betreffzeilen loszulassen. Wenn es nicht mal zwei Jahre innerhalb eines einzigen Publishers überlebt, überlebt es den Sprung in ein völlig anderes Medium erst recht nicht.

Das Archiv wird in drei Splits geliefert (exploratory, confirmatory, holdout), und ich hatte auf confirmatory trainiert und getestet. Also habe ich, hauptsächlich aus Sorgfalt und in der festen Erwartung, das zu bestätigen, was ich ohnehin schon „wusste“, dieselben Gewichte auf den anderen beiden getestet.

```
confirmatory 2015:  0.704
holdout:            0.637
exploratory:        0.624
```

Cool.

Zwei Splits, die ich nie angefasst hatte, stimmten auf *jeder einzelnen Effektstärken-Stufe* bis auf 0.013 überein, und beide sagten mir, dass mein Vorzeigeergebnis um sieben Punkte aufgeblasen war.

![Paarweise Accuracy über drei Splits des Upworthy-Archivs hinweg. Die Linie für confirmatory 2015 liegt deutlich über holdout und exploratory, die eng beieinander verlaufen.](/assets/img/blog/decision-models/splits.png)

## Die Zeitmaschine, die sich nur seitwärts bewegt

Ich habe also diesmal die Dokumentation des Archivs tatsächlich richtig gelesen, und es stellte sich heraus, dass das Archiv Tests **rein zufällig** auf Splits verteilt. Nicht chronologisch, sondern zufällig.

![Zwei Balken. Der erste zeigt einen sauberen chronologischen Split, zuerst Train, dann Test. Der zweite zeigt die reale Struktur: Trainings- und Testblöcke über den gesamten Zeitraum verschachtelt.](/assets/img/blog/decision-models/split-structure.png)

| Split | Arme | Datumsbereich | Anteil vor 2015 |
|---|---|---|---|
| confirmatory | 51,891 | 2013-01-24 → 2015-04-30 | 83.5% |
| holdout | 11,231 | 2013-01-24 → 2015-04-29 | 82.8% |
| exploratory | 10,804 | 2013-01-26 → 2015-04-29 | 83.8% |

Alle drei Splits decken dieselben Zeiträume in denselben Anteilen ab. Das bedeutet: Als ich auf Holdout evaluierte, stammten 83 % der Testdaten aus dem *Trainingszeitraum*. Selbe Ära, selber Hausstil, alles gleich, nur eben Tests, die das Modell noch nie gesehen hatte, und trotzdem schnitt es dort *schlechter* ab als im 2015er-Ausläufer.

Wenn man das umdreht, ist es ehrlich gesagt fast schon witzig: Zeit kostet dieses Modell so gut wie nichts, während ungesehene Tests aus demselben Zeitraum es sieben Punkte kosten. Mein sorgfältig aufgebauter Drift-Test hatte die ganze Zeit über nur Test-Identität gemessen, er steckte bloß im Kostüm zeitlicher Generalisierung.

Ich hatte eine Zeitmaschine gebaut, die sich nur seitwärts bewegt.

## Zwei Hypothesen, beide verkehrt herum

Der nächste Gedanke ist natürlich Leakage. Upworthy hat denselben Artikel mit Dutzenden von Headline-Varianten umgeschrieben. Wenn man *Tests* also zufällig aufteilt, verteilen sich die Varianten eines Artikels über alle drei Splits, und das Holdout-Set müsste voller Fast-Kopien des Trainingstextes sein.

Ich habe schnell ein kleines Inverted-Index-Skript geschrieben, um den maximalen Jaccard-Token-Overlap zwischen jeder Eval-Headline und den 38.950 Headlines zu messen, auf denen das Modell tatsächlich gefittet wurde (exaktes String-Matching hatte fünf übereinstimmende Headlines von 650 gefunden, und ja, daraufhin hatte ich Leakage für „ausgeschlossen“ erklärt).

| Evaluationsset | n | ≥0.9 Overlap | Median |
|---|---|---|---|
| confirmatory 2015 | 1,300 | 0.5% | 0.227 |
| holdout | 4,274 | **30.5%** | 0.300 |

Dreißig Prozent, sechzigmal stärker kontaminiert als der 2015er-Teil, und es schnitt **schlechter** ab.

Leakage erklärt die Lücke also nicht, es geht in die völlig falsche Richtung. Wenn überhaupt, bedeutet das, dass das ehrliche Holdout-Ergebnis *schlechter* als 0.637 sein müsste, sobald man die Fast-Kopien herausfiltert. Auch das habe ich überprüft, indem ich die Scores pro Paar exportiert und analysiert habe: Auf wirklich sauberen Paaren erreichte das Modell 0.646, also sogar minimal *besser*. Die Beinahe-Duplikate brachten ihm also absolut gar nichts.

Gut, dann vielleicht Label-Noise? Vielleicht haben die Holdout-Paare einfach weniger Impressionen.

| Evaluationsset | Median Impressionen | Median z | Median CTR-Verhältnis |
|---|---|---|---|
| confirmatory 2015 | 2,462 | 2.37 | 2.24 |
| holdout | 3,096 | 2.64 | 1.99 |

Ebenfalls verkehrt herum lol. Holdout-Paare haben *mehr* Impressionen und *höhere* z-Scores. Das 2015er-Set hat zwar ein größeres Median-CTR-Verhältnis (2.24 gegenüber 1.99), die Paare sind also tatsächlich leichter zu trennen, was real ist, aber das rechtfertigt bei weitem keine sieben Punkte Differenz.

Also habe ich „ungeklärt“ ins Dokument geschrieben und weitergemacht. 0.63 ist die Zahl, zwei unabhängige Splits stimmen darin überein, der abweichende ist der Ausreißer, und ich kann euch nicht sagen, warum.

**!! Nerd Infodump Alert :3 !!**

## Der Teil, auf den es wirklich ankam

Nachdem ich mein eigenes Spitzen-Ergebnis zerlegt hatte, dachte ich mir, ich sollte wenigstens die Ablations ordentlich durchführen.

Ich hatte erwartet, dass mehr Daten gewinnen würden, denn das ist der langweilige Prior: Du hast 62.695 Varianten, wirf den dritten Split noch rein, hol mehr raus. Also habe ich zwei Durchläufe aufgesetzt: einen, bei dem der Exploratory-Split zum Training hinzugefügt wurde, und einen mit getauschter Loss-Funktion, beide evaluiert auf denselben 2.137 Holdout-Paaren.

```
Phase 0        confirmatory       MSE              0.637
more-data      expl+confirmatory  MSE              0.724
rank           confirmatory       Bradley-Terry    0.775
rank+more      expl+confirmatory  Bradley-Terry    0.787
```

![Ablation-Ergebnisse. Mehr Daten bringen +0.087 gegenüber der Baseline; der Wechsel zu Bradley-Terry bringt +0.138, und der beste Durchlauf erreicht 0.812.](/assets/img/blog/decision-models/ablations.png)

Achtundzwanzig Prozent mehr Trainingsdaten brachten **+0.053**, und die Änderung der Loss-Funktion brachte **+0.107**, bei zwei statt drei Epochen und auf dem kleineren Trainingsset, und trotzdem war der Gewinn doppelt so hoch.

Was im Nachhinein natürlich völlig offensichtlich ist, die schlimmste Art von offensichtlich. Der Benchmark ist *paarweise Accuracy*: Gegeben sind zwei Headlines, wähle den Gewinner. Und ich hatte eine Regression auf die Klickrate gemacht, ich habe also einen Proxy für die Metrik optimiert und mich dann an der eigentlichen Metrik gemessen.

[Bradley-Terry](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) optimiert genau das Richtige. Für jedes Variantenpaar innerhalb eines Tests maximiert man `logsigmoid(score_winner - score_loser)`, gewichtet mit den Log-Impressionen der schwächer ausgestatteten Variante. Aus meinen 38.950 Trainings-Armen wurden so 63.597 Paare innerhalb desselben Tests.

Gleiches Modell. Gleiche Daten. Anderes Objective. Vierzehn Punkte.

Aus Neugier habe ich auch ModernBERT-*base* laufen lassen (ein Drittel der Parameter), und es kam auf 0.761. Das meiste davon steckt also im Objective und den Daten, nicht in der Modellgröße, was praktisch ist, wenn man das Ding jemals auf einer CPU laufen lassen will.

Und dann gab es da noch den Fall, der mir fast durchgerutscht wäre. Ich probierte eine DeBERTa-v3-large-Variante aus, die auf Entscheidungsaufgaben vortrainiert war, und sie verharrte für alle 4.804 Schritte bei exakt `-log(0.5)` und erzielte 0.519, was pures Zufallsniveau ist, völlig flach.

Man könnte das leicht als „DeBERTa ist schlechter“ interpretieren und abhaken, und fast hätte ich das getan. Aber eine Loss-Kurve, die *perfekt* flach genau bei dem Wert liegt, der „ich rate nur“ bedeutet, ist eine extrem spezifische Signatur, so sieht kein Modell aus, das einfach nur schlecht lernt. Der Encoder hatte auch problemlos geladen, nur Classifier und Pooler waren frisch initialisiert.

Es lag an der Learning Rate. DeBERTa-v3-large ist [berüchtigt instabil](https://github.com/microsoft/DeBERTa/issues/77) bei den 2e-5, mit denen ModernBERT völlig zufrieden ist, und verlangt eher nach 6e-6. Und ich hatte für beides dieselbe Konfiguration genommen, weil warum auch nicht.

Noch mal mit 6e-6 laufen lassen, der Loss sank von 0.709 → 0.682 → 0.620 → 0.360, und am Ende stand eine **0.812**, zweieinhalb Punkte über ModernBERT und 0.913 auf der Stufe mit der höchsten Konfidenz.

Ich habe auch den Fast-Duplikate-Slice darauf angesetzt, weil ich mir an diesem Punkt selbst nicht mehr traute, und auf wirklich sauberen Paaren (nichts, was auch nur entfernt an Trainingsdaten erinnert) erreicht es **0.797** gegenüber 0.769 bei ModernBERT. Seine Memorization-Lücke ist zudem *kleiner* als die von ModernBERT bei gleichzeitig höherem Score, genau das Gegenteil von dem, wie ein Modell aussieht, das nur durch Auswendiglernen gewinnt.

Das System funktionierte also die ganze Zeit einwandfrei, ich hatte nur eine einzige Zahl falsch.

## Aber was *bedeutet* 0.812 eigentlich wirklich

Ehrlich gesagt: für einen Menschen gar nichts. Das ist das Problem mit paarweiser Accuracy als Aussage: Sie besagt, dass die Reihenfolge stimmt, sagt einem aber nichts über die Größenordnung. Zwei Überschriften in 81.2 % der Fälle richtig zu ordnen, kann ein Vermögen wert sein oder gar nichts, je nachdem, wie weit sie in Wirklichkeit auseinanderliegen.

Also habe ich gemessen, was jemand spüren würde, der das Ding tatsächlich verschickt. Für jeden Test nimmt man den vom Modell am höchsten bewerteten Arm und vergleicht dessen reale Klickrate mit dem Mittelwert aller Arme in diesem Test. Denn ohne Modell hat man keinen Grund, irgendeine Variante zu bevorzugen, der Mittelwert dessen, was man verschickt haben könnte, ist also das ehrliche Counterfactual.

| | CTR |
|---|---|
| Test-Mittelwert, ohne Modell | 1.20% |
| Auswahl des Modells | 1.42% |
| Oracle, perfekte Auswahl | 1.60% |

Das sind **+18.3% relative Klickrate** über 2.140 Tests hinweg, und ich muss euch die Hoffnung gleich wieder nehmen.

### Der Lift-Wert lässt sich nicht übertragen

18.3% ist eine Eigenschaft von Upworthy. Sie hängt von deren Basisrate von 1.20% ab und davon, wie stark die Varianten ihrer Autoren streuen. Wendet man das auf einen B2B-Newsletter mit 2.5% Klickrate und ähnlicheren Varianten an, ändert sich die Zahl, in eine Richtung, die ich beim besten Willen nicht vorhersagen kann.

Was sich *tatsächlich* übertragen lässt, ist alles, was ein Verhältnis innerhalb eines einzelnen Tests darstellt:

| Metrik | Wert |
|---|---|
| Vermeidet die schlechteste Variante | **90.3%** |
| Schlägt den Test-Durchschnitt | 76.6% |
| Wählt die tatsächlich beste Variante | 47.7% |
| Ausgeschöpfter Spielraum, Median-Test | 89.2% |
| Spearman, Score vs. Klickrate | 0.526 |

**90.3% ist der Wert, hinter dem ich wirklich stehe.** Er sorgt fast immer dafür, dass man nicht das Schlechteste verschickt, was man geschrieben hat, und das überlebt eine Änderung der Basisrate, des Publikums und des Mediums auf eine Weise, wie es „+18.3%“ einfach nicht kann. Und 47.7% Top-1 bei typischerweise vier oder fünf Armen ist etwa 2.2-mal besser als der Zufall.

Einer dieser Werte schummelt allerdings ein wenig. Der im Median ausgeschöpfte Spielraum liegt bei 89.2%, mit einem Interquartilsabstand von 5% bis 100%, und aggregiert über alle Tests sind es 55.4%. Das Modell verhält sich bimodal: Bei den meisten Tests holt es fast den gesamten verfügbaren Gewinn heraus, und bei einer Minderheit fast gar nichts, und genau die ziehen den Gesamtwert nach unten.

Anschließend habe ich eine [isotonische Regression](https://en.wikipedia.org/wiki/Isotonic_regression) darübergelegt, damit der Score echte Einheiten statt nur Vibes hat. Isotonisch passt hier perfekt, weil es nur Monotonie voraussetzt (höherer Score, höhere Klickrate), genau das, was Bradley-Terry garantiert, und buchstäblich alles, was es garantiert. Alles Parametrische würde Strukturen erfinden, die das Modell nie versprochen hat. Die Intervalle stammen aus Bootstrapping über *Tests* statt über Arme, da Varianten innerhalb eines Tests denselben Artikel teilen und nicht unabhängig sind.

| Score | vs. Basis | 90%-Intervall |
|---|---|---|
| −2.72 | **−19.1%** | [−0.252, −0.209] pp |
| −1.06 | −8.2% | [−0.111, −0.086] pp |
| −0.20 | −0.7% | [−0.023, −0.000] pp |
| +0.56 | +3.7% | [+0.030, +0.056] pp |
| +1.62 | +11.1% | [+0.115, +0.147] pp |
| +2.82 | **+21.8%** | [+0.231, +0.274] pp |

![Kalibrierungskurve. Die Klickrate im Vergleich zur Baseline steigt monoton mit dem Modell-Score, wobei die 90%-Intervalle nur nahe der Mitte die Nulllinie kreuzen.](/assets/img/blog/decision-models/calibration.png)

Und schaut euch die mittleren Zeilen an: Dort kreuzen die Intervalle die Null, das Modell signalisiert hier völlig korrekt: „Diese beiden Headlines sind im Grunde gleich gut, wirf eine Münze“.

## Okay, an dieser Stelle mache ich alles kaputt

Jede einzelne Zahl oben stammt von viralen Social-Media-Headlines eines einzigen Publishers aus den Jahren 2013 bis 2015. Und das, was ich eigentlich bauen will, soll E-Mail-Betreffzeilen bewerten.

Ein B2B-Newsletter an 4.000 Abonnenten hat so gut wie nichts gemeinsam mit „Dieses Kind hat mit einem einzigen Satz die gesamte Impfgegner-Argumentation zerstört“.

Also habe ich nach öffentlichen E-Mail-Daten mit echten, gemessenen Versand-Outcomes gesucht, und es gibt schlicht keine.

| Quelle | Größe | Verfügbarkeit |
|---|---|---|
| Return-Path-Betreffzeilen-Studie | 9M Betreffzeilen | Proprietär, 2015, nie veröffentlicht |
| Belkins-B2B-Korpus | 5.5M E-Mails | Nur aggregierte Statistiken |
| Yahoo (IEEE 7004277) | 100k+ Zeilen, Milliarden Impressionen | Proprietär |
| Oracles NLORP-Paper | 300 Zeilen | Von Google gescrapt, Raten nicht gemessen |
| Diverse Kaggle-„Email Campaign“-Sets | variiert | Mock-Daten oder synthetisch |

Eines davon ist ein arXiv-Paper von zwei Principal Data Scientists bei Oracle, deren gesamter Datensatz aus „300+ verschiedenen Betreffzeilen von Sonderangebots-E-Mails, gesammelt aus diversen Internetquellen via Google-Suche“ besteht. Ich will mich übrigens gar nicht über sie lustig machen, das ist einfach tatsächlich alles, was es gibt.

Die aggregierten Erkenntnisse kursieren überall (sechs bis zehn Wörter performen am besten, 21 bis 40 Zeichen für Öffnungen, Zahlen bringen ein paar Punkte), aber nichts davon sind ergebnisbasierte Daten pro Versand und nichts davon taugt zum Trainieren.

## Was das ganze Vorhaben in ein anderes Licht rückt

Ich hatte mir selbst eine bequeme kleine Geschichte eingeredet, bis eine zweite Meinung sie über den Haufen warf. Die Geschichte ging so: *Die Architektur ist Commodity, der dauerhafte Wert liegt in proprietären Ergebnis-Labels*. Die erste Hälfte stimmt, aber die zweite ist Unsinn, denn ich *habe* keine proprietären Labels. Upworthy ist öffentlich, jeder mit einer GPU kann meine 0.812 an einem Wochenende für weniger als den Preis eines Kaffees reproduzieren. Das ist auch ein Grund, warum die Gewichte einfach öffentlich sind: Sie haben mich vier Dollar gekostet, und ich kann nicht so tun, als wären sie ein Moat.

Was ich tatsächlich habe, ist ein Leistungsnachweis. Das eigentliche Asset wäre eine kontinuierliche Messschleife auf Live-Traffic, und die existiert noch nicht.

Die Daten, die ich brauche, liegen ungenutzt bei E-Mail-Service-Providern herum. Jeder ESP mit A/B-Testing-Funktion verfügt über Millionen von Betreffzeilen-Experimenten mit gemessenen Ergebnissen, und so gut wie keiner von ihnen trainiert irgendetwas darauf. Ich brauche also keinen weiteren Head oder einen neuen Benchmark, ich brauche eine Person, die Zugriff auf die Logs hat.

## Worauf sich das verallgemeinern lässt

Das Rezept ist ehrlich gesagt simpel genug, um in eine einzige Zeile zu passen: Wenn ein gemessenes Ergebnis existiert, trainiere darauf, und hör auf, ein Modell nach seiner Meinung zu fragen.

Jeder A/B-Test, den euer Unternehmen je durchgeführt hat, liegt auf irgendeiner Experimentier-Plattform, gelabelt, mit Ergebnis versehen, und tut gar nichts. Optimizely, Statsig, LaunchDarkly, was auch immer ihr nutzt: Das sind jahrelange Daten der Sorte „Wir haben diese fünf ausprobiert und diese hier hat gewonnen“, und niemand hat etwas darauf trainiert.

Überall dort, wo man ein Kandidatenset und eine nachgelagerte Kennzahl hat, gilt genau dasselbe:

| Entscheidung | Das Label, das ihr bereits habt |
|---|---|
| Betreffzeilen, Überschriften, Push-Texte | Öffnungen, Klicks |
| Auswahl von Support-Makros | Gelöst ohne Eskalation |
| Retrieval-Reranking | Welches Ergebnis der Nutzer akzeptiert hat |
| Formulierung von Fehlermeldungen | Problem selbst gelöst oder Ticket erstellt |
| Titel von Produktangeboten | Conversions |
| Tool-Auswahl für Agenten | War die Trajektorie erfolgreich |

Die letzte Zeile ist die spannendste, wenn man Agenten baut. Die drei Primitiven von Jev sind choice, score und noul, und alles in diesem Beitrag dreht sich um `score`, aber derselbe Move funktioniert auch für `choice`, wo immer protokolliert wurde, was nach der Entscheidung passiert ist. Was beim Routing der meisten Agenten aktuell allerdings noch niemand tut.

Eine ehrliche Einschränkung bei all dem: Ich habe genau einen Datenpunkt. Outcome-Training hat Zero-Shot-Bewertungen *bei einer Aufgabe* deutlich geschlagen, und ob dieser Vorsprung anderswo hält, ist ungetestet. Ich würde also auf die Richtung wetten, nicht auf die exakte Zahl.

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

Lest die Scores immer als Set, nie als einzelne Zahl. Das Trainingsziel war die Abweichung vom Mittelwert des jeweiligen Tests. Ein einzelner Score für sich allein bedeutet also nichts: Ihr gebt ihm die 3 bis 6 Varianten, die ihr für einen Versand geschrieben habt, und es rankt sie. Ein Kalibrator, der den Score auf den erwarteten Lift abbildet, ist ebenfalls enthalten.

Und falls 435M zu klobig ist, gibt es auch eine CPU-taugliche Variante: ModernBERT-base erreicht 0.761 bei einem Drittel der Parameter.

## Was es nicht tun wird

Sich auf E-Mails übertragen lassen, oder zumindest habe ich keine Ahnung, ob es das tut.

Wenn ihr also einen Newsletter betreibt und vergangene Versendungen mit gemessenen Öffnungs- oder Klickraten habt, würde ich das wirklich gerne herausfinden. Meldet euch bei mir, und die Daten bleiben natürlich eure.

## Das Fazit

Eines der Open-Weight-Modelle in diesem Bereich erzielt Zero-Shot auf seinem eigenen Typed-Decisions-Benchmark 0.362, was unter der Majority-Class-Baseline von 0.461 liegt.

Und der Abstand zwischen 0.544 und 0.812 war auch kein genialer Modellierungstrick: Zwei Drittel davon kamen durch die Wahl einer Loss-Funktion zustande, die zur Metrik passte, und der Rest aus 62.695 Zeilen, bei denen tatsächlich jemand gemessen hat, was passiert ist. Wenn ihr eure Daten also labelt, indem ihr ein Modell fragt: Schaut vielleicht zuerst nach der Ground Truth, wahrscheinlich liegt sie ohnehin schon irgendwo herum.

---

*Daten: [The Upworthy Research Archive](https://osf.io/jd64p/). Matias, J., Munger, K., Le Quere, M.A., Ebersole, C. (2021), Nature Scientific Data. CC BY 4.0. Experimente zwischen dem 25. Juni 2013 und dem 10. Januar 2014 sind durchgehend ausgeschlossen, da die Maintainer 2024 einen Fehler bei der Randomisierung offengelegt haben. Gewichte DOI: [10.57967/hf/10573](https://doi.org/10.57967/hf/10573).*
