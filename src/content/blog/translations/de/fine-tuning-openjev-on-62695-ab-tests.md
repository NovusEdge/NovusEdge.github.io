---
title: "Fine-Tuning von OpenJev auf 62.695 A/B-Tests"
date: 2026-09-23
tags: [ml, decision-models, calibration, open-weights, benchmarks]
draft: false
description: "Ich habe ein Entscheidungsmodell auf A/B-Tests trainiert, die tatsächlich durchgeführt wurden, anstatt ein anderes Modell nach seiner Meinung zu fragen; es umgeht deine schlechteste Variante in 90 % der Fälle, und mein erster Benchmark hat ungelogen absolut gar nichts gemessen lol"
---

Es gibt etwa 300 öffentliche Projekte, die auf den neuen Entscheidungsmodellen aufbauen, und ich habe mir die fürs „Scoring und Ranking“ (26 davon) angeschaut: Jedes einzelne davon bewertet Dinge, indem es einfach das Modell fragt, was es denkt. Bewerte diesen Artikel auf acht Qualitätsachsen, beurteile diesen Werbetext nach Geschmack, entscheide, ob dieses Dokument relevant ist, ihr wisst, was ich meine.

Und ganz ehrlich: Das sind doch keine Daten? Das ist die Meinung eines Modells mit einer rangehefteten Zahl, und die ganze Kategorie baut darauf auf, ungelogen.

Also habe ich eins auf Ergebnissen trainiert, die tatsächlich jemand gemessen hat, und die Gewichte sind online, falls ihr damit rumspielen wollt: **[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)**, Apache 2.0, 435 Mio. Parameter, ein einziger Forward Pass, es bewertet kurze persuasive Texte. Die Basis ist [`com-kotobalabs/open-jev-deberta-v3-large`](https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large), was wiederum DeBERTa-v3-large ist, vortrainiert auf typisierte Entscheidungen.

| Metrik | Dieses Modell | Publizierter SOTA | Menschen |
|---|---|---|---|
| Paarweise Genauigkeit, ungesehener Split | **0,812** | 0,544 | ~Zufall |
| Nur saubere Paare | **0,797** | - | - |
| Vermeidet die schlechteste Variante | **90,3%** | - | - |

Es wurde auf 62.695 echten A/B-Varianten aus 32.487 randomisierten Headline-Experimenten trainiert, und jede Zahl da oben stammt aus einem Split, den das Modell nie gesehen hat. Wie es dazu kam, steht unten, inklusive des Teils, in dem mein erster Benchmark absolut gar nichts gemessen hat (ja, das wurmt mich immer noch ein bisschen).

## Das Setup

Wie sich herausstellt, gibt es dafür einen perfekten Datensatz, der seit 2021 frei zugänglich herumliegt. Zwischen Januar 2013 und April 2015 hat Upworthy (ja, *dieses* Upworthy, die „Du wirst nicht glauben, was als Nächstes geschah“-Leute) 32.487 randomisierte A/B-Tests mit ihren Überschriften durchgeführt: echter Traffic, echte Randomisierung, 538 Millionen Zuweisungen. Und dann hat Cornell das Ganze einfach als [Upworthy Research Archive](https://osf.io/jd64p/) unter CC BY veröffentlicht. Jede Headline-Variante, jede Impression, jeder Klick.

Viel näher kommt man bei kurzen persuasiven Texten nicht an Ground Truth heran, denn man hat das, was geschrieben wurde, man hat das, was passiert ist, als echte Menschen es sahen, und die Zuweisung war zufällig, sodass ein Vergleich tatsächlich Aussagekraft hat.

Also: ModernBERT-large mit einem Regressions-Head, und das Ziel ist die geschrumpfte Logit-Klickrate, zentriert auf den Mittelwert des jeweiligen Tests. Die Zentrierung ist übrigens wichtig: Der *Artikel* treibt den Großteil der Klickraten-Varianz, und eine Headline kann das nicht erklären. Was man also eigentlich vorhersagen will, ist, wie weit eine Variante vom Mittelwert des Tests abweicht, in dem sie lief. Dazu kommt ein Beta-Binomial-Shrinkage in Richtung dieses Mittelwerts, sodass eine Variante mit 600 Impressionen hauptsächlich als Prior zählt und eine mit 20.000 hauptsächlich als Evidenz.

25 Minuten auf einer einzelnen L4, etwa vierzig Cent. Ich habe alles nach Januar 2015 zurückgehalten, darauf getestet und **0,704 paarweise Genauigkeit** erzielt.

Zum Vergleich: Der publizierte State of the Art auf genau diesem Datensatz liegt bei [0,544](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682), von einer Gruppe aus Toronto, die handgefertigte linguistische Features auf 24.333 Paaren verwendet hat. Ihr Paper kommt zu dem Schluss, das Problem sei „von Natur aus schwer, nicht bloß eine Frage der Stichprobengröße“. Menschen, denen dieselbe Aufgabe gestellt wird, schneiden auf Zufallsniveau ab, und in der Literatur gibt es ein per LoRA feinabgestimmtes Llama-3-8B, das auf 0,469 kommt, was *unter* Zufallsniveau liegt lmao.

16 Punkte über der publizierten Zahl, für vierzig Cent. Also habe ich es natürlich aufgeschrieben: „Headline-Signal überlebt zwei Jahre Drift“.

## Und doch ...

Die Behauptung in diesem Titel war, dass das Signal *Drift* überlebt, da die Trainingsdaten von 2013 bis 2014 stammten, das Testset von 2015 war und sich die Genauigkeit kaum verändert hatte – quasi zwei Jahre sich verändernde Internetkultur, und dem Modell war es einfach egal. Das wäre ein echtes Ergebnis, wenn es stimmte, und es ist wichtig, weil der eigentliche Zweck darin besteht, das Modell irgendwann auf E-Mail-Betreffzeilen loszulassen. Und wenn es nicht einmal zwei Jahre bei einem einzelnen Publisher überlebt, überlebt es den Sprung auf ein komplett anderes Medium ganz sicher nicht.

Das Archiv wird in drei Splits ausgeliefert (exploratory, confirmatory, holdout), und ich hatte auf confirmatory trainiert und getestet. Also habe ich, größtenteils aus reiner Sorgfalt und in der festen Erwartung, das zu bestätigen, was ich ohnehin schon „wusste“, dieselben Gewichte auf den anderen beiden getestet.

```
confirmatory 2015:  0.704
holdout:            0.637
exploratory:        0.624
```

Cool.

Zwei Splits, die ich nie angerührt hatte, stimmten auf *jeder einzelnen Effektstärken-Stufe* bis auf 0,013 überein, und beide sagten mir, dass mein Vorzeige-Ergebnis um sieben Punkte aufgebläht war.

![Paarweise Genauigkeit über drei Splits des Upworthy-Archivs. Die confirmatory-2015-Linie liegt deutlich über holdout und exploratory, die eng beieinander liegen.](/assets/img/blog/decision-models/splits.png)

Die rote Linie ist die, über die ich gepostet hatte, und die beiden darunter sind die Realität.

## Die Zeitmaschine, die nur seitwärts reist

Also habe ich dieses Mal die Dokumentation des Archivs wirklich gründlich gelesen, und es stellte sich heraus, dass das Archiv Tests den Splits **zufällig** zuweist. Nicht chronologisch, sondern zufällig.

![Zwei Balken. Der erste zeigt einen sauberen chronologischen Split, erst Train, dann Test. Der zweite zeigt die reale Struktur: Trainings- und Testblöcke über den gesamten Zeitraum verschachtelt.](/assets/img/blog/decision-models/split-structure.png)

| Split | Varianten | Datumsbereich | Anteil vor 2015 |
|---|---|---|---|
| confirmatory | 51.891 | 2013-01-24 → 2015-04-30 | 83,5% |
| holdout | 11.231 | 2013-01-24 → 2015-04-29 | 82,8% |
| exploratory | 10.804 | 2013-01-26 → 2015-04-29 | 83,8% |

Alle drei Splits decken dieselben Zeiträume in denselben Anteilen ab. Das heißt: Als ich auf holdout ausgewertet habe, stammten 83 % der Testdaten aus dem *Trainingszeitraum*. Selbe Ära, selber Hausstil, alles gleich, nur eben Tests, die das Modell noch nie gesehen hatte, und trotzdem schnitt es dort *schlechter* ab als auf dem 2015er-Endstück.

Dreht man das um, ist es ehrlich gesagt ziemlich witzig: Zeit kostet dieses Modell fast nichts, während ungesehene Tests aus demselben Zeitraum es sieben Punkte kosten. Mein sorgfältig aufgebauter Drift-Test hatte die ganze Zeit nur die Test-Identität gemessen, er steckte bloß im Kostüm einer zeitlichen Generalisierung.

Ich hatte eine Zeitmaschine gebaut, die nur seitwärts reist.

## Zwei Hypothesen, beide verkehrt herum

Der nächste Gedanke ist natürlich Datenleckage (Leakage). Upworthy hat denselben Artikel unter Dutzenden Headline-Varianten umgeschrieben. Wenn man also *Tests* zufällig aufteilt, verteilen sich die Varianten eines Artikels über alle drei Splits und holdout müsste voll von Fast-Kopien des Trainingstextes sein.

Ich habe schnell ein kleines Inverted-Index-Skript geschrieben, um den maximalen Jaccard-Token-Overlap zwischen jeder Eval-Headline und den 38.950 Headlines zu messen, auf denen das Modell tatsächlich trainiert wurde (ein exakter String-Abgleich hatte fünf geteilte Headlines von 650 gefunden, und ja, daraufhin hatte ich Leakage für „ausgeschlossen“ erklärt).

| Evaluationsset | n | ≥0,9 Overlap | Median |
|---|---|---|---|
| confirmatory 2015 | 1.300 | 0,5% | 0,227 |
| holdout | 4.274 | **30,5%** | 0,300 |

30 Prozent, sechzigmal stärker kontaminiert als das 2015er-Endstück, und es schnitt **schlechter** ab.

Leakage erklärt die Lücke also nicht, es geht in die komplett falsche Richtung. Wenn überhaupt, bedeutet das, dass das ehrliche Holdout-Ergebnis *schlechter* als 0,637 sein müsste, sobald man die Fast-Duplikate entfernt. Das habe ich auch überprüft, indem ich die Scores pro Paar exportiert und gefiltert habe: Bei wirklich sauberen Paaren erzielte das Modell 0,646, also sogar etwas *besser*. Die Fast-Duplikate brachten ihm also absolut gar nichts.

Gut, Label-Noise vielleicht? Wenn Holdout-Paare weniger Impressionen haben, ist der beobachtete Gewinner seltener der wahre Gewinner, und das deckelt, wie gut irgendein Modell überhaupt abschneiden kann.

| Evaluationsset | Median Impressionen | Median z | Median CTR-Verhältnis |
|---|---|---|---|
| confirmatory 2015 | 2.462 | 2,37 | 2,24 |
| holdout | 3.096 | 2,64 | 1,99 |

Ebenfalls verkehrt herum lol. Holdout-Paare haben *mehr* Impressionen und *höhere* z-Werte, ihre Labels sind also vertrauenswürdiger. Das 2015er-Set hat zwar ein größeres medianes CTR-Verhältnis (2,24 gegenüber 1,99), seine Paare sind also tatsächlich leichter zu trennen, was real ist, aber das erklärt bei Weitem keine sieben Punkte.

Also schrieb ich „ungeklärt“ ins Dokument und machte weiter. 0,63 ist die Zahl, zwei unabhängige Splits stimmen darin überein, der abweichende ist der Ausreißer, und ich kann euch nicht sagen, warum.

**!! Nerd-Infodump-Alarm :3 !!**

## Der Teil, auf den es wirklich ankam

Nachdem ich mein eigenes Vorzeige-Ergebnis demontiert hatte, dachte ich mir, ich sollte wenigstens die Ablations ordentlich durchführen.

Ich rechnete damit, dass mehr Daten gewinnen würden, denn das ist der langweilige Standard: Man hat 62.695 Varianten, wirft den dritten Split rein und bekommt mehr. Also setzte ich zwei Durchläufe auf, einen, der den exploratory-Split zum Training hinzufügte, und einen, der die Loss-Funktion austauschte, beide evaluiert auf denselben 2.137 Holdout-Paaren.

```
Phase 0        confirmatory       MSE              0.637
more-data      expl+confirmatory  MSE              0.724
rank           confirmatory       Bradley-Terry    0.775
rank+more      expl+confirmatory  Bradley-Terry    0.787
```

![Ablation-Ergebnisse. Zusätzliche Daten bringen +0,087 gegenüber der Baseline; der Wechsel zu Bradley-Terry bringt +0,138, und der beste Durchlauf erreicht 0,812.](/assets/img/blog/decision-models/ablations.png)

28 Prozent mehr Trainingsdaten brachten **+0,053**, und das Ändern der Loss-Funktion brachte **+0,107**, bei zwei Epochen statt drei und auf dem kleineren Trainingsset, und es gewann trotzdem mit dem Doppelten.

Was im Nachhinein offensichtlich ist, die schlimmste Art von offensichtlich. Der Benchmark ist *paarweise Genauigkeit*, wähle bei zwei Headlines den Gewinner, und ich hatte auf die Klickrate regressiert. Ich optimierte also einen Proxy für die Metrik und bewertete mich dann anhand der Metrik.

[Bradley-Terry](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) optimiert genau das Richtige. Für jedes Paar von Varianten innerhalb eines Tests maximiert man `logsigmoid(score_winner - score_loser)`, gewichtet mit den Log-Impressionen der dünneren Variante, weil der Vergleich nur so vertrauenswürdig ist wie die Seite mit weniger Impressionen. Aus meinen 38.950 Trainingsvarianten wurden 63.597 Paare innerhalb desselben Tests.

Gleiches Modell. Gleiche Daten. Anderes Objective. 14 Punkte.

Aus Neugier habe ich auch ModernBERT-*base* laufen lassen (ein Drittel der Parameter), und es erreichte 0,761. Das meiste davon steckt also im Objective und in den Daten, nicht in der Modellgröße, was praktisch ist, wenn man das Ganze mal auf einer CPU laufen lassen will.

Und dann gab es da noch den Fall, der mir fast durch die Lappen gegangen wäre. Ich probierte eine Variante von DeBERTa-v3-large aus, die auf Entscheidungsaufgaben vortrainiert war: Sie blieb über alle 4.804 Schritte exakt bei `-log(0.5)` hängen und erzielte 0,519, Zufallsniveau, völlig flach.

Man könnte das leicht als „DeBERTa ist schlechter“ abstempeln und weitermachen, und fast hätte ich das auch getan. Aber eine Loss-Kurve, die *vollkommen* flach genau auf dem Wert liegt, der „Ich rate nur“ bedeutet, ist eine sehr spezifische Signatur, und so sieht kein Modell aus, das einfach nur schlecht lernt. Der Encoder hatte auch problemlos geladen, nur Classifier und Pooler waren frisch initialisiert, wie zu erwarten.

Es lag an der Learning Rate. DeBERTa-v3-large ist bei 2e-5, womit ModernBERT zufrieden ist, [berüchtigt instabil](https://github.com/microsoft/DeBERTa/issues/77) und will eher etwas um 6e-6. Und ich hatte für beides dieselbe Konfiguration verwendet, denn warum auch nicht.

Nochmal bei 6e-6 laufen gelassen: Der Loss ging 0,709 → 0,682 → 0,620 → 0,360, und es endete bei **0,812**, der beste Wert im gesamten Projekt, zweieinhalb Punkte über ModernBERT und 0,913 auf der Stufe mit der höchsten Konfidenz.

Ich habe auch den Fast-Duplikate-Filter darauf angewendet, weil ich mir an diesem Punkt selbst nicht mehr traue. Bei wirklich sauberen Paaren (nichts, was auch nur entfernt nach Trainingsdaten aussieht) erzielt es **0,797** gegenüber 0,769 bei ModernBERT. Seine Memorization-Lücke ist zudem *kleiner* als die von ModernBERT bei gleichzeitig besserem Score, genau das Gegenteil von dem, wie ein Modell aussieht, das durch reines Auswendiglernen gewinnt.

Das System funktionierte also die ganze Zeit prima, ich hatte bloß eine einzige Zahl falsch eingestellt.

## Aber was bedeutet 0,812 eigentlich *konkret*?

Ehrlich gesagt: für einen Menschen nichts. Das ist das Problem mit paarweiser Genauigkeit als Aussage: Sie sagt, dass die Reihenfolge stimmt, verrät einem aber nichts über die Größenordnung. Zwei Überschriften in 81,2 % der Fälle richtig zu ordnen, kann ein Vermögen wert sein oder gar nichts, je nachdem, wie weit sie in Wirklichkeit auseinanderliegen.

Also habe ich gemessen, was jemand, der das Ganze tatsächlich verschickt, spüren würde. Nimm für jeden Test die vom Modell am höchsten bewertete Variante und vergleiche ihre reale Klickrate mit dem Mittelwert aller Varianten in diesem Test. Denn ohne Modell hat man keinen Grund, eine bestimmte Variante zu bevorzugen; der Mittelwert dessen, was man verschickt haben könnte, ist also das ehrliche Counterfactual.

| | CTR |
|---|---|
| Test-Mittelwert, kein Modell | 1,20% |
| Auswahl des Modells | 1,42% |
| Orakel, perfekte Auswahl | 1,60% |

Das sind **+18,3% relative Klickrate** über 2.140 Tests hinweg, und ich muss euch diese Zahl gleich wieder wegnehmen.

### Die Lift-Zahl lässt sich nicht übertragen

18,3 % ist ein Fakt über Upworthy. Es hängt von deren 1,20 % Basisrate ab und davon, wie viel Streuung deren Autoren zwischen die Varianten gebracht haben. Wendet man das auf einen B2B-Newsletter mit 2,5 % Klickrate und ähnlicheren Varianten an, ändert sich die Zahl, in eine Richtung, die ich beim besten Willen nicht vorhersagen kann.

Was sich *tatsächlich* übertragen lässt, ist alles, was ein Verhältnis innerhalb eines einzelnen Tests darstellt:

| Metrik | Wert |
|---|---|
| Vermeidet die schlechteste Variante | **90,3%** |
| Schlägt den Test-Durchschnitt | 76,6% |
| Wählt die tatsächlich beste Variante | 47,7% |
| Ausgeschöpfter Spielraum (Headroom), medianer Test | 89,2% |
| Spearman, Score vs. Klickrate | 0,526 |

**90,3 % ist der Wert, für den ich mich wirklich verbürgen würde.** Er lässt einen fast nie das Schlechteste verschicken, was man geschrieben hat, und das überlebt eine Änderung von Basisrate, Zielgruppe und Medium auf eine Weise, wie „+18,3 %“ es einfach nicht tut. Und 47,7 % Top-1 bei meist vier oder fünf Varianten ist etwa 2,2-mal besser als der Zufall.

Einer dieser Werte schummelt allerdings ein wenig. Der mediane ausgeschöpfte Spielraum liegt bei 89,2 %, mit einem Interquartilsabstand von 5 % bis 100 %, und über alle Tests gepoolt sind es 55,4 %. Das Modell verhält sich bimodal: Bei den meisten Tests holt es fast den gesamten verfügbaren Gewinn heraus, bei einer Minderheit fast gar keinen, und diese ziehen das Aggregat nach unten. Nur den Median zu nennen, würde es also beschönigen, und nur den gepoolten Wert zu nennen, würde den typischen Fall unter Wert verkaufen.

Anschließend habe ich eine [isotonische Regression](https://en.wikipedia.org/wiki/Isotonic_regression) darüber gelegt, damit der Score messbare Einheiten statt nur Vibes hat. Isotonisch passt hier perfekt, weil es lediglich Monotonie voraussetzt (höherer Score, höhere Klickrate), genau das, was Bradley-Terry garantiert und buchstäblich alles, was es garantiert. Alles Parametrische würde eine Struktur erfinden, die das Modell nie versprochen hat. Die Intervalle stammen aus Bootstrapping über *Tests* statt über einzelne Varianten, da Varianten innerhalb eines Tests denselben Artikel teilen und nicht unabhängig sind.

| Score | vs. Basis | 90-%-Intervall |
|---|---|---|
| −2,72 | **−19,1%** | [−0,252, −0,209] pp |
| −1,06 | −8,2% | [−0,111, −0,086] pp |
| −0,20 | −0,7% | [−0,023, −0,000] pp |
| +0,56 | +3,7% | [+0,030, +0,056] pp |
| +1,62 | +11,1% | [+0,115, +0,147] pp |
| +2,82 | **+21,8%** | [+0,231, +0,274] pp |

![Kalibrierungskurve. Die Klickrate im Vergleich zur Baseline steigt monoton mit dem Modell-Score, wobei die 90-%-Intervalle die Null nur nahe der Mitte kreuzen.](/assets/img/blog/decision-models/calibration.png)

Das sind einundvierzig Prozentpunkte Spanne zwischen der schlechtesten und der besten Betreffzeile, die man verschicken könnte. Und schaut euch die mittleren Zeilen an: Dort kreuzen die Intervalle die Null, was bedeutet, dass das Modell korrekterweise sagt: „Diese beiden Überschriften sind im Grunde gleich, wirf eine Münze.“ Und ein Scorer, der *Ich weiß es nicht* sagen kann, ist unendlich viel mehr wert als einer, der das nicht kann.

## Okay, an dieser Stelle mache ich alles kaputt

Jede einzelne Zahl da oben stammt aus viralen Social-Media-Headlines eines einzigen Publishers aus den Jahren 2013 bis 2015, und das, was ich eigentlich bauen will, soll E-Mail-Betreffzeilen bewerten.

Das ist überhaupt nicht dasselbe. Ein B2B-Newsletter an 4.000 angemeldete Abonnenten hat so gut wie nichts gemeinsam mit „Dieses Kind hat gerade das gesamte Argument gegen Impfungen in einem einzigen Satz zerstört“: anderes Medium, andere Zielgruppe, anderes Jahrzehnt, einfach alles anders.

Also habe ich mich nach öffentlichen E-Mail-Daten mit real gemessenen Versand-Outcomes umgesehen, und es gibt keine.

| Quelle | Größe | Verfügbarkeit |
|---|---|---|
| Return-Path-Betreffzeilenstudie | 9 Mio. Betreffzeilen | Proprietär, 2015, nie veröffentlicht |
| Belkins-B2B-Korpus | 5,5 Mio. E-Mails | Nur aggregierte Statistiken |
| Yahoo (IEEE 7004277) | 100k+ Zeilen, Milliarden Impressionen | Proprietär |
| Oracles NLORP-Paper | 300 Zeilen | Von Google gescrapt, Raten nicht gemessen |
| Diverse Kaggle-„E-Mail-Kampagnen“-Sets | unterschiedlich | Mock- oder synthetische Daten |

Eines davon ist ein arXiv-Paper von zwei leitenden Data Scientists bei Oracle, deren gesamter Datensatz aus „300+ verschiedenen Betreffzeilen von Sonderangebot-E-Mails, gesammelt aus mehreren Internetquellen via Google-Suche“ besteht. Ich mache mich übrigens nicht über sie lustig, das ist einfach buchstäblich alles, was es gibt.

Die aggregierten Erkenntnisse kursieren überall frei herum (sechs bis zehn Wörter performen am besten, 21 bis 40 Zeichen für Öffnungen, Zahlen bringen ein paar Punkte), aber nichts davon sind ergebnisbasierte Daten pro Versand und nichts davon eignet sich zum Trainieren.

## Was die ganze Sache in ein neues Licht rückt

Ich hatte mir selbst eine bequeme kleine Geschichte eingeredet, bis eine zweite Meinung sie umwarf. Die Geschichte lautete: *Die Architektur ist Standardware, der bleibende Wert sind proprietäre Ergebnis-Labels.* Die erste Hälfte stimmt, aber die zweite Hälfte ist Unsinn, denn ich *habe* keine proprietären Labels. Upworthy ist öffentlich, jeder mit einer GPU kann meine 0,812 an einem Wochenende für weniger Geld als einen Kaffee reproduzieren, was auch ein Grund ist, warum die Gewichte einfach frei verfügbar sind: Sie haben mich vier Dollar gekostet, und ich kann nicht so tun, als wären sie ein Burggraben.

Was ich tatsächlich habe, ist ein Nachweis. Das eigentliche Asset wäre ein kontinuierlicher Mess-Loop auf Live-Traffic, und den gibt es noch nicht.

Was irgendwie erhellend ist, denn es zeigt mir, wo das eigentliche Potenzial liegt. Die Daten, die ich brauche, liegen ungenutzt bei Email Service Providern herum. Jeder ESP mit A/B-Testing-Funktion hat Millionen von Betreffzeilen-Experimenten mit gemessenen Ergebnissen, und so gut wie niemand trainiert irgendetwas darauf. Ich brauche also keinen weiteren Head oder Benchmark, ich brauche eine Person, die Zugriff auf diese Logs hat.

## Worauf sich das verallgemeinern lässt

Das Rezept ist ehrlich gesagt simpel genug, um in eine einzige Zeile zu passen: Wenn ein gemessenes Ergebnis existiert, trainiere darauf und hör auf, ein Modell nach seiner Meinung zu fragen.

Der erwähnenswerte Teil ist, wo diese Ergebnisse bereits schlummern. Jeder A/B-Test, den euer Unternehmen je durchgeführt hat, liegt auf irgendeiner Experimentier-Plattform herum, gelabelt, mit zugehörigem Ergebnis, ungenutzt. Optimizely, Statsig, LaunchDarkly, was auch immer ihr nutzt: Es sind Jahre von „Wir haben diese fünf ausprobiert und diese eine hat gewonnen“, und niemand hat je ein Modell darauf trainiert.

Überall, wo man eine Menge von Kandidaten und eine nachgelagerte Kennzahl hat, gilt dasselbe:

| Entscheidung | Das Label, das ihr bereits habt |
|---|---|
| Betreffzeilen, Überschriften, Push-Texte | Öffnungen, Klicks |
| Auswahl von Support-Makros | Gelöst ohne Eskalation |
| Retrieval-Reranking | Welches Ergebnis der Nutzer akzeptiert hat |
| Formulierung von Fehlermeldungen | Problem selbst gelöst oder Ticket eröffnet |
| Produkttitel im Shop | Conversions |
| Tool-Auswahl bei KI-Agenten | War der Handlungsablauf (Trajectory) erfolgreich |

Die letzte Zeile ist die spannendste, wenn man Agenten baut. Jevs drei Grundbausteine sind choice, score und noul, und alles in diesem Beitrag dreht sich um `score`, aber derselbe Move funktioniert auch für `choice`, überall dort, wo protokolliert wurde, was nach der Entscheidung passiert ist (was beim Agenten-Routing bisher so gut wie niemand tut).

Eine ehrliche Einschränkung bei alldem: Ich habe genau einen Datenpunkt. Outcome-Training hat Zero-Shot-Urteile *bei einer einzigen Aufgabe* deutlich geschlagen, und ob dieser Vorsprung irgendwo anders Bestand hat, ist ungetestet. Ich würde also auf die Richtung wetten, nicht auf die genaue Zahl.

## VERA

**V**ariant **E**valuation from **R**eal **A**nalytics, denn jedes Modell braucht ein albernes Backronym.

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

Lest die Scores als Gruppe, niemals als einzelne Zahl. Das Trainingsziel war die Abweichung vom Mittelwert des jeweiligen Tests, ein einzelner Score für sich allein bedeutet also nichts. Man gibt ihm die 3 bis 6 Varianten, die man für einen Versand geschrieben hat, und es ordnet sie an. Ein Kalibrator, der den Score auf den erwarteten Lift abbildet, ist ebenfalls enthalten.

Und falls 435 Mio. Parameter zu wuchtig sind, gibt es auch eine CPU-taugliche Version: ModernBERT-base erreicht 0,761 bei einem Drittel der Parameter.

## Was es nicht tun wird

Sich auf E-Mails übertragen lassen, oder zumindest habe ich keine Ahnung, ob es das tut. Alles hier basiert auf viralen Social-Media-Headlines eines einzigen Publishers aus den Jahren 2013 bis 2015, und euer Newsletter hat wahrscheinlich sehr wenig mit „Dieses Kind hat gerade das gesamte Argument gegen Impfungen in einem einzigen Satz zerstört“ gemeinsam.

Wenn ihr also einen Newsletter betreibt und vergangene Mailings mit gemessenen Öffnungs- oder Klickraten habt: Ich würde es wirklich gerne herausfinden, meldet euch bei mir, und die Daten bleiben eure.

## Das Fazit

Eines der Open-Weight-Modelle in diesem Bereich erzielt zero-shot 0,362 auf seinem eigenen Typed-Decisions-Benchmark, was unter der Majority-Class-Baseline von 0,461 liegt. Es braucht also ein aufgabenspezifisches Fine-Tuning, um überhaupt irgendwo hinzukommen, die Architektur allein bringt herzlich wenig.

Und die Lücke zwischen 0,544 und 0,812 lag auch nicht an cleverer Modellierung: Zwei Drittel davon kamen durch die Wahl eines Loss, der zur Metrik passte, und der Rest aus 62.695 Zeilen, bei denen jemand gemessen hat, was tatsächlich passiert ist. Wenn ihr eure Daten also labölt, indem ihr ein Modell fragt: Schaut vielleicht zuerst nach Ground Truth, sie liegt wahrscheinlich schon irgendwo herum.

---

*Daten: [The Upworthy Research Archive](https://osf.io/jd64p/). Matias, J., Munger, K., Le Quere, M.A., Ebersole, C. (2021), Nature Scientific Data. CC BY 4.0. Experimente zwischen dem 25. Juni 2013 und dem 10. Januar 2014 sind durchgehend ausgeschlossen, aufgrund des Randomisierungsfehlers, den die Maintainer 2024 offengelegt haben. Gewichte DOI: [10.57967/hf/10573](https://doi.org/10.57967/hf/10573).*
