---
title: "Zwei Millennium-Probleme an einem Tag (wahrscheinlich)"
date: 2026-11-21
tags: [ai, math, lean, commentary]
description: "Am 20. November sind KI-gestützte Beweise sowohl für die Riemannsche Vermutung als auch für das Navier-Stokes-Blowup erschienen, drei Wochen nachdem zwei Labs unabhängig voneinander die Exponential Time Hypothesis geknackt haben. Ein Blick auf die letzten Monate der KI-Mathe und darauf, was eigentlich schon überprüft wurde."
toc: true
pixel: thinking
---

## Freitag

Terry Tao hat am 20. November einen [Blogpost](https://terrytao.wordpress.com/2026/11/20/unforced-euler-singularity-unforced-navier-stokes-singularity-and-the-generalized-riemann-hypothesis/) veröffentlicht, dessen Titel sich wie eine Liste von Dingen liest, die zu meinen Lebzeiten eigentlich nicht hätten passieren sollen: „Unforced Euler singularity, unforced Navier-Stokes singularity, and the Generalized Riemann Hypothesis“. Alle drei kamen an diesem Tag heraus, alle drei entstanden unter massivem KI-Einsatz, und ein Name steht auf allen dreien: Levent Alpöge, ein Zahlentheoretiker bei Anthropic.

Zwei davon sind Millennium-Probleme des Clay Mathematics Institute. Es gibt sieben davon, das Preisgeld für jedes beträgt eine Million Dollar, und in 26 Jahren wurde genau eines gelöst (Perelman, Poincaré, lehnte das Geld ab). Jetzt könnten es auf einmal drei sein, und zwei davon tauchten innerhalb weniger Stunden auf.

Nichts davon ist bisher bestätigt, und ich komme noch darauf zurück, was „bestätigt“ hier eigentlich bedeutet. Aber das kam auch nicht aus dem Nichts. Die letzten Monate haben darauf hingesteuert, und es lohnt sich, den gesamten Verlauf durchzugehen.

## Wie wir hierhergekommen sind

Das ist die Kurzfassung. Das meiste davon stammt aus der Wikipedia-[Liste von KI-Mathematikentdeckungen](https://en.wikipedia.org/wiki/List_of_mathematical_discoveries_made_with_artificial_intelligence), die mittlerweile eine peinlich hohe Zahl an Einträgen für 2026 enthält.

{{timeline}}

Blau wurde von Menschen oder Lean geprüft, Gelb wartet auf eine Überprüfung, und Rot bedeutet umstritten oder teilweise zurückgenommen. Das Ehrhart-Ergebnis deckt nur die obere Schranke ab, und der Fall der Gleichheit ist noch offen. Etwa die Hälfte der Oktober-Paper kam direkt mit Lean-Beweis, und drei wurden innerhalb eines Tages zurückgezogen.

Das vom 6. Oktober verdient eigentlich einen eigenen Beitrag. OpenAI veröffentlichte 722 Manuskripte zu einigen hundert Themen aus einem unveröffentlichten Modell. Alpöge nannte es „offensichtlich den bedeutendsten Moment in der Geschichte der Mathematik“, Sarnak sagte, er würde nichts davon als Theorem bezeichnen, bevor Menschen es überprüft hätten, und bei manchem Lean-Code stellte sich heraus, dass er schwächere Aussagen bewies als in den Papern behauptet. Sechs Wochen später ist der „bedeutendste Moment“ vielleicht schon auf Platz drei abgerutscht.

## ETH

Die Exponential Time Hypothesis besagt grob gesagt, dass 3-SAT nicht nennenswert schneller als durch Brute-Force gelöst werden kann. Bei n Variablen braucht man ungefähr eine Laufzeit von 2^(cn). Sie ist nicht so berühmt wie P vs NP, aber ein Großteil der Komplexitätstheorie baut darauf auf, da man über „unter der Annahme von ETH braucht dieses Problem mindestens Zeit X“ etliche untere Schranken beweist.

{{eth_figure}}

Am 16. Oktober stellten zwei Labs am selben Tag fest, dass sie falsch ist. Der Bericht von OpenAI trägt den Titel „The Exponential Time Hypothesis Is False“ und besagt, „unser System hat vor Kurzem bewiesen, dass die ETH falsch ist“, wobei am nächsten Tag ein [Lean-Beweis](https://openai.com/index/building-scientific-understanding-with-academic-communities/) folgte. Anthropics Paper mit dem Titel „A 2^o(n) Time Algorithm for 3-SAT“ erschien etwa zur gleichen Zeit, bezeichnet die beiden Ergebnisse als „unabhängig und zeitgleich“ und erklärt, [„Claude hat den Kernalgorithmus ohne menschlichen Input gefunden“](https://www.datacamp.com/blog/ai-exponential-time-hypothesis). Anthropic behauptet außerdem, damit auch die Strong ETH erledigt zu haben.

Russell Impagliazzo, einer der Leute, die die ETH überhaupt erst *formuliert haben*, nannte es „zutiefst überraschend“. Er leitet jetzt zusammen mit Ramamohan Paturi und Ryan Williams die Gruppe, die das Ganze überprüft. Williams sagte, das meiste sehe nach Routine aus, abgesehen von ein paar Stellen:

> “Two or three alien-looking parts.”
>
> — Ryan Williams, zum ETH-Beweis

„Alien-looking“ ist das am meisten nach 2026 klingende Statement, das ein Komplexitätstheoretiker je über einen Beweis abgegeben hat.

Um die Dimensionen klarzustellen: Das ist nicht P = NP, und der Geschwindigkeitsvorteil spielt in der Praxis Berichten zufolge erst bei Formeln mit Millionen von Variablen eine Rolle. Aber dass zwei getrennte KI-Systeme in derselben Woche auf dieselbe Sache kommen, ist eine ganz eigene Art von Beleg. Es ist genau die Art von Überschneidung, die man erwarten würde, wenn die Idee quasi auf dem Tisch lag und die Modelle endlich stark genug waren, sie zu sehen.

## Navier–Stokes

Beim Navier-Stokes-Millennium-Problem geht es um die Frage, ob glatte Anfangsbedingungen für ein 3D-Fluid immer glatt bleiben oder ob die Lösung in endlicher Zeit explodieren (Blowup) kann. Wer eines von beiden beweist, gewinnt.

{{ns_figure}}

Im September behauptete OpenAI einen Blowup, allerdings für eine *erzwungene* (forced) Version, was bedeutet, dass eine externe Kraft auf das Fluid einwirkt. Scientific American nannte diese Kraft „unrealistisch, fein abgestimmt“, und es ist nicht die Version, nach der das Clay Institute fragt. Zudem gab es ordentlich Streit. Tristan Buckmaster, der mit Alpöge am selben Problem gearbeitet hatte, sagt, OpenAIs erster Prompt sei [Tage nachdem Informationen über ihre Arbeit das Unternehmen erreichten](https://www.unite.ai/buckmaster-and-alpoge-post-ai-fluid-blowup-proofs-dispute-openai-contact/), abgesetzt worden. Als er in einem Call fragte, ob das Modell mit ihren Codex-Sitzungen trainiert worden sei, hieß es von ihm: „Ich habe keine Antwort bekommen.“ Seinen Angaben zufolge drängte OpenAI zudem zweimal darauf, Alpöge von der Autorenschaft zu streichen, weil er bei Anthropic arbeitet. OpenAI bestreitet jedes Fehlverhalten, und das stammt alles aus Buckmasters Perspektive, aber es ist schon eine beachtliche Vorgeschichte.

Am 20. veröffentlichten Alpöge und Buckmaster ihr eigenes Ergebnis: Blowup in endlicher Zeit für die *unerzwungenen* 3D-Gleichungen, also die echte Variante, als 79-seitiges Paper plus [Lean](https://github.com/tristanbuckmaster/navier-stokes/). Tao meint, die Strategie sei „im Großen und Ganzen klar“: eine numerische, annähernd selbstähnliche Lösung plus rigorose Störungstheorie darum herum. Er sagt aber auch: „Es muss noch mehr Arbeit investiert werden, um einen ordentlichen, professionell geschriebenen Beweis zu erstellen.“ Zwei praktische Lücken bleiben. Das numerische Zertifikat, von dem der Beweis abhängt, ist noch nicht veröffentlicht, sondern nur sein Hash. Und in der README selbst heißt es: „Das gepatchte Paket wurde beim Zusammenstellen dieses Repositorys nicht neu gebaut“, der Lean-Build ist also noch nicht bestätigt.

## Die Riemannsche Vermutung

{{rh_figure}}

Das ist das Ergebnis, über das gerade alle posten. Alpöge hat ein vierseitiges PDF namens [Remark](https://alpo.ge/remark.pdf) auf seine Website gestellt:

> Ich glaube, dass ich in Zusammenarbeit mit Claude einen Beweis für die Riemannsche Vermutung entdeckt habe. Tatsächlich lässt sich die Methode mühelos noch viel weiter ausdehnen und löst die sogenannte verallgemeinerte Riemannsche Vermutung, und ich erwarte, dass sie mit etwas mehr Zeit auch die erweiterte Riemannsche Vermutung lösen wird.

Der Beweis besteht aus einer Fußnote, die auf vierzehn Tarball-Teile verlinkt, zusammen 239 MB und rund 175.000 Lean-Dateien. Ein Paper gibt es nicht. Er schreibt, eine für Menschen lesbare Fassung zu erstellen sei „Routine“, und in einer weiteren Fußnote, dass er tatsächlich eine erstellt habe, die „über 250.000 Seiten erreichte“. Als er Claudes „Buch“ bei Theorem 1 aufschlug, begann es mit der Feststellung, dass, weil die reellen Zahlen total geordnet sind, wenn σ ≠ ½ ist, dann σ > ½ oder σ < ½ sein muss. Er entschied, dass die Veröffentlichung „eine gigantische, unlesbare Farce aus ‚Slop‘“ wäre, und veröffentlichte nur den Lean-Code.

{{proof_scale}}

Die Notiz spiegelt auch die größte Begeisterung wider, die ich je bei einem Mathematiker in schriftlicher Form gesehen habe. Er schreibt, er habe sich seit seiner Studienzeit auf dieses Problem vorbereitet, die Arbeit in den richtigen Rahmen gelenkt, und dann:

> “Claude far outpaced me near the finish line. No, Claude flew, and danced, and sparkled near that finish line.”
>
> — Levent Alpöge, Remark

Sein einziges konkretes Beispiel ist die Idee, Theta-Lifts zu verketten, um den „Multiplizitäts“-Trick aus Stepanovs Beweis der Riemannschen Vermutung über Funktionenkörpern nachzuahmen. Für eine Primsumme der Länge X schlug Claude eine Kette der Länge √X vor. „(Und doch, was hätte es sonst sein können?)“ Er gibt zu, dass er „automorphe Formen auf Gruppen höheren Rangs kaum beherrscht“, worauf sich jedoch ein Großteil der Argumentation stützt. Die 20-Schritte-Timeline auf Seite 3 ist eine Zusammenfassung von Claude, von der er warnt, dass sie „vielleicht überhaupt keinen Sinn ergibt“. Sie reicht vom 6. Oktober bis zu einem letzten Schritt am 16. November, der schlicht „GRH“ lautet.

Es gibt darin auch eine nette laborübergreifende Note. Er lobt OpenAIs „guten Geschmack“ bei Problemen. Als er den Gleichheitsfall ihres Ehrhart-Ergebnisses ausarbeitete, habe er, wie er sagt, „sofort verstanden, dass Navier-Stokes fallen würde“. Er erkannte ihr Siegel-Argument auch als „Stepanov ohne Multiplizität“ wieder, genau die Lücke, die die Theta-Lifts füllen. Das KI-Mathe-Rennen ist also keineswegs ein sauberes Labor gegen Labor. Die Leute lesen die Modell-Outputs der jeweils anderen und bauen darauf auf.

## Ist das echt?

Zum Zeitpunkt dieses Texts sieht es gut aus. Das Top-Level-Theorem in Lean ist gegen Mathlibs eigene Definition von `RiemannHypothesis` formuliert, zusammen mit der GRH für Dirichletsche L-Funktionen, wie der zur Überprüfung eingerichtete [unabhängige Mirror](https://github.com/Deicyde/riemann-hypothesis) zeigt. Andrew Sutherland vom MIT hat es selbst kompiliert und sagte Scientific American: [„Ehrlich gesagt liegt die Chance, dass hier irgendetwas faul ist, bei nahezu null“](https://www.scientificamerican.com/article/the-ai-riemann-hypothesis-proof-is-almost-certainly-true-independent-mathematicians-attest/). Kevin Buzzards Antwort lautete: „Wir warten noch immer auf einen erfolgreichen Comparator-Durchlauf.“

{{lean_statement}}

Buzzards Vorbehalt ist der entscheidende Punkt. Comparator prüft den Beweis gegen separat verfasste Theorem-Aussagen und listet jedes verwendete Axiom auf. Lean kompiliert nämlich anstandslos eine Datei, die stillschweigend genau das voraussetzt, was sie eigentlich beweisen soll, solange diese Annahme deklariert ist. Ein sauberer Durchlauf bedeutet, dass nur die drei Standard-Axiome von Lean verwendet werden. Damit bliebe als Ausweg nur noch ein Definitionsfehler in Mathlib oder ein Bug im Lean-Kernel. Beides ist bei einer so intensiv analysierten Aussage extrem unwahrscheinlich.

Wenn Comparator sauber durchläuft, befinden wir uns in einer merkwürdigen Situation. Die Riemannsche Vermutung wäre ein Theorem, und der einzige vollständige Beweis wäre einer, den kein Mensch gelesen hat und den möglicherweise auch kein Mensch lesen kann. Die Preisregeln des Clay Institute verlangen eine begutachtete Veröffentlichung und zwei Jahre allgemeine Anerkennung, und niemand hat diese Regeln mit einem 239 MB großen Tarball im Hinterkopf geschrieben.

## Wohin das führt (Spekulation)

Alles oben Beschriebene ist das, was bisher behauptet und überprüft wurde. Dieser Abschnitt hier ist meine eigene Spekulation, also bewertet es entsprechend.

**Das Muster.** Wenn man die Ergebnisse nebeneinanderlegt, zeigt sich immer dasselbe Bild. Ein Mensch wählt das Problem aus und steuert in die richtige Richtung, und das Modell übernimmt die technische Schwerstarbeit in genau dem Bereich, von dem der Mensch am wenigsten versteht. Alpöge sagt das ganz offen über automorphe Formen auf Gruppen höheren Rangs. Der Output ist zu riesig zum Lesen: 175.000 Lean-Dateien für die Riemannsche Vermutung, rund 2.270 Dateien und 600.000 Zeilen für Navier-Stokes und ein 250.000-seitiges „Buch“, das niemand aufschlagen wird. Also übernimmt am Ende Lean das Peer-Review. Und wenn zwei Labs am selben Tag auf denselben ETH-Algorithmus kommen, sieht das weniger nach Genie aus als vielmehr nach einer überschrittenen Fähigkeitsschwelle. Die Ideen lagen bereit und warteten nur auf etwas, das stark genug war, um an sie heranzukommen.

**Die Taktung.** Im Juli war es ein Gegenbeispiel zu einer Vermutung. Bis November waren es zwei Millennium-Probleme. Das sind fünf Monate. Ich werde jetzt nicht anhand von neun Datenpunkten eine Kurve extrapolieren, aber es sind noch vier Millennium-Probleme übrig (P vs NP, Hodge, Yang-Mills und Birch-Swinnerton-Dyer), und ich wäre heute weniger überrascht als noch vor einem Jahr, wenn 2027 das nächste als gelöst beansprucht wird.

**Was sich ändert, wenn es hält.**

- Jedes „unter Annahme der GRH“ in der Literatur verwandelt sich in ein simples Theorem. Das Lehrbuchbeispiel ist Millers Primzahltest, der schon seit den 70ern deterministisch und in Polynomialzeit läuft, *falls* die GRH gilt.
- Der schwierige Teil beim Überprüfen eines Beweises verlagert sich vom Beweis auf die Formulierung der Aussage. Sobald Lean einen Beweis akzeptiert, bleibt nur noch die Frage, ob das bewiesene Theorem wirklich das ist, was wir meinten. 30 Zeilen Definitionen extrem sorgfältig zu lesen wird zum neuen Peer-Review.
- Das Verständnis hinkt der Wahrheit hinterher. Wir wissen vielleicht jahrelang, dass die Riemannsche Vermutung wahr ist, bevor irgendjemand erklären kann, warum, und zwar so, dass es in einen menschlichen Kopf passt. Alpöges Hinweis, dass „kurze Argumente folgen werden“, ist eine Wette darauf, dass sich diese Lücke schnell schließt.
- Die Vergabe der Urheberschaft wird chaotisch. Der Buckmaster-Streit ist ein Vorgeschmack: Wessen Idee war es, wessen Modell, wessen Daten? Clays Regeln, Peer-Review-Normen und Autorenschaftskonventionen wurden alle für eine Welt geschrieben, in der der Autor den Beweis erklären konnte.
- Die Arbeit von Mathematikern verschiebt sich dahin, Probleme auszuwählen, Geschmack zu beurteilen und Verständnis aufzubauen. Alpöges Notiz lobt immer wieder den „guten Geschmack“ beider Labs. Womöglich ist genau das jetzt der Job.

Nichts davon setzt voraus, dass der RH-Beweis Comparator überlebt. Selbst wenn er in sich zusammenfällt: ETH, das Ergebnis zu den Zeta-Nullstellen und die Resultate vom Juli bleiben bestehen, und das Muster war schon vor Freitag erkennbar.

## Wie es weitergeht

- Das Urteil von Comparator zur RH und ein zweiter, unabhängiger Build.
- Die Veröffentlichung des Navier-Stokes-Zertifikats und ein sauberer Lean-Rebuild.
- Das Urteil von Impagliazzo, Paturi und Williams zur ETH.
- Alpöges versprochene ausführliche Ausarbeitung und der kürzere Beweis, von dem er erwartet, dass er „ziemlich schnell“ folgt.

Alpöges Notiz endet mit: „In einer Zeit der Revolution in der Mathematik hoffe ich, dass das Argument einen Ausblick auf die Wunder gibt, die vor uns liegen.“ Vor einem Jahr hätte sich das noch wie der Schlusssatz eines Spinners gelesen, heute wirkt es wie eine vernünftige Prognose.
