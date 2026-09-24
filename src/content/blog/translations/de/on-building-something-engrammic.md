---
title: "Über das Bauen von etwas... Engrammischem"
date: 2026-05-06
tags: [ai-memory, epistemics, engrammic, agents, founder-log]
description: "Wiederholte veraltete Behauptungen in einer KI-Pipeline brachten mich dazu, an einem Agent-Gedächtnis zu arbeiten, das Belege aufzeichnet, Revisionen nachverfolgt und mit widersprüchlichen Beobachtungen umgehen kann."
---

Letzten Dezember habe ich an einer KI-SEO-Pipeline gebaut. Wir hatten ein umfangreiches „LLM-Wiki“ in einem `context/`-Verzeichnis: strukturierte Architekturdokumente, einen Funktionsindex, den der Agent per `grep` durchsuchen konnte, das volle Programm. Ehre, wem Ehre gebührt: Es _war_ ein feines System, bis... Context Pollution einsetzte. Agenten fingen an, veraltete Infos abzurufen, die wir *in derselben Session* aktualisiert hatten. Neue Agenten, die mit frischem Kontext gestartet wurden, spuckten sofort wieder denselben veralteten Unsinn aus. Mein Context Window füllte sich doppelt so schnell, weil der Agent bereits gesehene Dateien erneut las und versuchte, Widersprüche aufzulösen, die es gar nicht hätte geben dürfen. Währenddessen saß ich völlig genervt da, habe den Agenten beschimpft und die weise Antwort bekommen: „*Du hast vollkommen recht!*“ (heilige Scheiße, wie sehr ich diesen Satz hasse).

Der abgerufene Kontext enthielt Dinge, die der Agent frei erfunden hatte. Unser System unterschied nicht zwischen beobachteten Fakten, Vermutungen oder Erfindungen, sodass der nächste Agent alles davon als Beleg nutzen konnte.

Ich hatte eine Menge Arbeit ins Retrieval gesteckt: relevante Chunks finden und ins Context Window packen. Ich hatte dem System aber keine Möglichkeit gegeben zu prüfen, ob eine abgerufene Behauptung belegt oder noch aktuell war. Das wurde zu dem Memory-Problem, an dem ich arbeiten wollte.

Das ist das, was die Branche Context Rot nennt.

Bei [RAG](https://en.wikipedia.org/wiki/Retrieval-augmented_generation) hilft Ähnlichkeit dabei, relevanten Text zu finden. Es belegt jedoch nicht, ob dieser Text auch stimmt. Eine unbelegte Behauptung, die vor sechs Wochen gespeichert wurde, kann immer noch ein extrem guter Treffer für die heutige Anfrage sein.

Produkte wie `Mem0` und `Zep` widmen sich dem sessionübergreifenden Gedächtnis, aber reine Persistenz löst keine widersprüchlichen Notizen. Wenn ein Agent am Montag „nutzt OAuth“ speichert und am Dienstag „nutzt API-Keys“, muss ich wissen, ob sich das System geändert hat, die Aussagen verschiedene Komponenten betreffen oder eine davon falsch war. Zeitstempel helfen, aber die neueste Aussage ist nicht zwingend die am besten belegte. Ich möchte die Belege für jede Behauptung behalten und festhalten, wie ein Konflikt aufgelöst wurde.

Ein Agent nutzt vielleicht ein Suchergebnis, um eine Entscheidung zu treffen, und verwendet diese Entscheidung dann als Kontext für eine spätere. Ich möchte diese Abhängigkeiten nachverfolgen. Wenn sich eine Beobachtung als falsch herausstellt, sollten wir die Schlussfolgerungen finden können, die darauf aufbauten.

Die Forschungsgemeinschaft fängt an, das zu verstehen. Es gibt dieses Jahr ein [Paper von Google DeepMind](https://arxiv.org/abs/2603.02960), das von „epistemic drift“ handelt, also wie schlecht kalibrierte KI-Systeme das menschliche Urteilsvermögen mit der Zeit verschlechtern, indem sie mit voller Überzeugung unzuverlässige Informationen liefern. Es gibt [Arbeiten zu „belief deviation“](https://arxiv.org/abs/2510.12264) beim mehrstufigen Schlussfolgern, die zeigen, dass man 30 Punkte Performance-Verbesserung erzielen kann, nur indem man erkennt, wann der interne Zustand eines Agenten zu weit von der Kohärenz abgedriftet ist. Mehrere Gruppen konvergieren unabhängig voneinander auf formale Modelle der Belief Revision, weil der informelle Ansatz, Dinge einfach abzuspeichern und wieder abzurufen, nachweislich nicht skaliert.

Das Witzige ist, dass die Biologie das schon vor Ewigkeiten gelöst hat. Da ist der [Hippocampus](https://en.wikipedia.org/wiki/Hippocampus), der eine schnelle, spärliche Enkodierung spezifischer Episoden übernimmt, und der Neokortex, der verallgemeinertes Wissen langsam konsolidiert. Und das ganze System führt jede Nacht einen Prozess aus, um zu entscheiden, was von „Dinge, die passiert sind“ zu „Dinge, die ich weiß“ befördert wird. [Sharp-Wave Ripples](https://en.wikipedia.org/wiki/Sharp_waves_and_ripples) im Schlaf, explizite Mechanismen fürs Vergessen.

Was mich an diesem Vergleich interessiert, ist die selektive Speicherung: Was wird behalten, was revidiert und was vergessen? Das sind die Fragen, die ich auf das Gedächtnis von Agenten übertragen möchte.

**!! Nerd Infodump Alert :3 !!**

Es gibt aber durchaus Bewegung in die richtige Richtung. [HippoRAG](https://arxiv.org/abs/2405.14831) modelliert die hippocampale Indexierungstheorie explizit mit Wissensgraphen und PageRank und erzielt 20 % Verbesserung bei Multi-Hop-QA, indem es die Biologie ernst nimmt. Es gibt [Forschung zu Surprise-gated Episodic Memory](https://arxiv.org/abs/2606.03787) in der Robotik, bei der nur neuartige Beobachtungen gespeichert werden, was genau die Art von Salienzfilterung ist, die Gehirne betreiben.

[Zep](https://arxiv.org/abs/2501.13956) hat temporale Wissensgraphen mit episodischen und semantischen Schichten gebaut. [Hindsight](https://arxiv.org/abs/2512.12818) geht noch weiter mit vier verschiedenen Speichernetzwerken und Richtlinien zur Konfliktlösung, aber Widersprüche werden immer noch mit Zeitstempeln *aufbewahrt*, statt vor dem Speichern *gelöst* zu werden, und es gibt [keine konkrete Methode](https://hindsight.vectorize.io/blog/2026/05/21/agent-memory-consolidation), um genau nachzuvollziehen, warum der Agent gesagt hat, was er gesagt hat.

Für Engrammic möchte ich Belief-Status, Widerspruchsbehandlung beim Schreiben und eine gemeinsam einsehbare Provenienz. Das Ziel ist, prüfen zu können, ob eine abgerufene Behauptung noch zutrifft und welche anderen Behauptungen von ihr abhängen.

Mit „Belief“ meine ich eine Interpretation, die durch Beobachtungen gestützt wird. „Sie hat mich auf gelesen gelassen“ ist eine Beobachtung. „Sie ist sauer auf mich, weil sie mich auf gelesen gelassen hat und sie das sonst nie tut“ ist eine Interpretation, und die ändert sich vielleicht, wenn sie zurückschreibt. Ich will, dass das System diese Unterscheidung beibehält.

Für diesen Entwurf möchte ich die Datensätze außerhalb der Modellgewichte haben, wo sie eingesehen und bearbeitet werden können. Arbeiten, die [rund 3,6 Bits pro Parameter](https://arxiv.org/abs/2505.24832) schätzen, untersuchen die Speicherkapazität von Modellen, aber Kapazität allein liefert uns kein überprüfbares Protokoll für jede Behauptung. Das ist die Anforderung, die ich erfüllen möchte.

Ein Modell zu fragen, warum es eine Behauptung aufgestellt hat, liefert mir keinen unabhängig überprüfbaren Nachweis darüber, wie es dazu kam. Dafür brauche ich gespeicherte Beobachtungen und Verknüpfungen, die zeigen, welche Schlussfolgerungen darauf zurückgriffen. Diese Verknüpfungen müssen außerdem Revisionen überstehen.

Wir nennen das externalisierte Epistemik. Der Name „Engrammic“ leitet sich von Engrammen ab, den hypothetischen physischen Gedächtnisspuren im Gehirn. In der Software geht es darum, Behauptungen zusammen mit ihren Belegen, ihrem Status und ihren Beziehungen zu speichern, damit wir sie überprüfen und überarbeiten können.

Konkret bedeutet das: Wenn ein Agent versucht, „sie hat zurückgeschrieben, alles gut“ zu speichern, und „sie ist sauer auf mich“ bereits existiert, hängt das System nicht einfach eine weitere Zeile an. Es markiert einen Konflikt und zwingt dazu, ihn aufzulösen. Entweder wird der alte Belief durch einen expliziten Link zu dem ersetzt, was ihn abgelöst hat, oder die neue Beobachtung wird verworfen, oder beides wird vorübergehend eingefroren, bis ein Mensch eingreift. Was aber *nicht* passiert, ist die stille Anhäufung widersprüchlicher Fakten, die unweigerlich wieder auftauchen und alles durcheinanderbringen.

Es bedeutet, dass jeder Belief eine nachverfolgbare Spur hat: Statt „das Modell hat das generiert“ heißt es „das stammt aus den Beobachtungen X, Y, Z, erfasst zu den Zeitpunkten A, B, C, mit einer Konfidenz, die mit der Zeit nachgelassen hat“. Wenn ein Unternehmen fragt „warum hat Ihr Agent unserem Kunden das erzählt?“, kann man das beantworten, indem man den Graphen durchgeht, statt mit den Schultern zu zucken. Es bedeutet, dass Vergessen eine echte Funktion ist, die man gezielt einbaut. Alte Beobachtungen verfallen, abgestandener Kontext verblasst, und das System entscheidet aktiv, was wichtig genug ist, um behalten zu werden. Statt einer Art „perfektem“ Abruf ist das Ziel hier ein gutes *Urteilsvermögen* bezüglich Relevanz.

Das erfordert mehr Maschinerie, als einfach nur Text zu speichern und abzurufen. Ich denke, der Versuch lohnt sich für Agenten, deren Entscheidungen von Aufzeichnungen abhängen, die sich über viele Sessions hinweg angesammelt haben.

Ein geteiltes Gedächtnis macht die Konfliktbehandlung besonders wichtig. Wenn `agents 1 and 2` widersprüchliche Beobachtungen schreiben, was sollte `agent 3` erhalten? Er braucht genug Kontext, um die Uneinigkeit zu erkennen, und einen Weg, eine Lösung zu protokollieren, ohne die ursprünglichen Belege zu verlieren.

Mich interessiert auch, wie sich das auf Weltmodelle und Robotik anwenden lässt, einschließlich der Rolle des externen Speichers, wie sie in LeCuns [JEPA](https://openreview.net/forum?id=BZ5a1r-kVsf)-Arbeit diskutiert wird. Für Systeme, die auf Basis gespeicherter Beobachtungen agieren, würde ich dieselben Fragen zu Provenienz, widersprüchlichen Datensätzen und Revisionen stellen.

Die technischen Paper gibt es unter [engrammic.ai/research](https://engrammic.ai/research), und die Kernarchitektur ist Open Source. Wenn du an Agent-Memory, Belief Revision oder der Koordination zwischen Agenten arbeitest, würde ich mich gerne austauschen. Wir suchen Forschungspartner; Fragen und Issues im Repo sind ebenfalls willkommen.

Für mich ist der eigentliche Test genau das Problem, mit dem alles anfing: Wenn ein Agent eine veraltete Behauptung wiederholt, kann ich dann herausfinden, woher sie kam, sie korrigieren und verhindern, dass der nächste Agent sie wiederholt?

_Header image via [cosmos.so](https://www.cosmos.so/e/948956014)._
