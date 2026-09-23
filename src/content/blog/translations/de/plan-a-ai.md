---
title: "Lass uns über Plan A reden"
date: 2026-09-11
tags: [ai, governance, compute, alignment, policy, essay]
description: "Das AI Futures Project möchte, dass die USA und China die Superintelligenz bis 2040 pausieren. Es ist ein guter Plan. Sechzig Tage nach der Veröffentlichung lösten zehntausend Agenten Navier-Stokes."
toc: true
---

## Das Timing

Am 9. Juli 2026 veröffentlichte das AI Futures Project [AI 2040: Plan A](https://ai-2040.com/). Er umfasst neunzig Seiten. Der Vorschlag sieht vor, dass die USA und China bis 2029 verhandeln, ihre Compute-Bestände offenlegen, die Inspektoren der jeweils anderen Seite in ihre Infrastruktur lassen, das Frontier-Training pausieren und dann ein Jahrzehnt lang Alignment-Forschung im offenen Raum betreiben, bevor irgendjemand etwas baut, das klüger ist als der klügste Mensch. Superintelligenz wird auf 2040 verschoben und alle überleben.

Am 8. September 2026 gab OpenAI bekannt, dass [rund zehntausend koordinierte autonome Agenten eine Singularität in endlicher Zeit in den 3D-Navier-Stokes-Gleichungen gefunden hatten](https://openai.com/index/navier-stokes-solution/). Das Modell dahinter war ein internes oberhalb von GPT-6 Astra. Sie lieferten sowohl einen analytischen Beweis als auch eine Lean-Formalisierung, sodass das Ergebnis maschinell überprüft und nicht bloß behauptet ist. Sie [lehnten es ab, das Preisgeld von einer Million Dollar einzufordern](https://www.quantamagazine.org/ai-has-solved-one-of-maths-1-million-millennium-prize-problems-20260908/), und stellten das Ganze als Bericht darüber dar, wie schnell das alles vorangeht.

Das sind sechzig Tage, und der erste Meilenstein in Plan A ist 2029.

Ich möchte klarstellen, bevor ich das hier auseinandernehme, dass ich Plan A für einen guten Plan halte. Es ist der ernsthafteste Versuch, den ich bisher gesehen habe, in operativen Details statt in Slogans aufzuschreiben, wie ein Nicht-Wettrennen tatsächlich aussehen würde, und die Leute, die ihn verfasst haben, sind ganz offensichtlich nicht dumm. Jeder Plan dafür wird auf Widerstand stoßen, und ich habe kein Interesse daran, auf die einzige Gruppe einzuprügeln, die ihre Hausaufgaben gemacht hat. Aber als ich ihn las, stieß ich immer wieder an dieselbe Wand: Nahezu alles darin setzt voraus, dass man sehen kann, was passiert.

## Was Plan A besagt

Eine Kurzfassung für alle, die ihn noch nicht gelesen haben (und ihr solltet ihn lesen, denn er ist gut).

Sie nennen [zwei Ergebnisse, die sie für inakzeptabel halten](https://ai-2040.com/about): dass die Menschheit die Kontrolle über die KI verliert oder dass eine kleine Gruppe von Führungskräften und Funktionären am Ende ein vorübergehendes Monopol auf Superintelligenz hat. Dass der zweite Punkt darin vorkommt, ist wichtig, und viele Leute, die darüber streiten, haben immer nur den ersten auf dem Schirm.

Die Kernprinzipien sind Zeitgewinn, totale Forschungstransparenz, breite Streuung von KI und Reversibilität. Der Zeitplan sieht grob so aus: 2029 verhandeln beide Seiten und pausieren das Frontier-Training, deklarieren Compute-Bestände und prüfen Lieferkettenprotokolle. Von 2030 bis 2035 wird die Forschung im menschlichen Leistungsbereich unter Safety-Case-Regulierung in großem Maßstab wieder aufgenommen. 2035 stoppt alles auf dem Niveau menschlicher Spitzenexperten, und der Rest des Jahrzehnts wird für Alignment, Verifikation, Sicherheit und öffentliche Beratungen genutzt, bevor jemand weitergeht.

Der Durchsetzungsmechanismus, bei dem sie landen, ist Compute-Governance, zusammen mit dem, was sie gegenseitig zugesicherte Compute-Zerstörung nennen. Compute ist der Engpass, weil Compute physisch ist und man physische Dinge zählen kann.

Ihre Antwort auf die Frage, warum China jemals zustimmen sollte, ist eine gute Formulierung, daher zitiere ich sie:

> Jeder, der sich Sorgen über einen Kontrollverlust macht, sollte diesen Plan für eine Verbesserung halten, ebenso wie jeder, der sich Sorgen über die Konzentration von Macht macht, mit Ausnahme der Menschen, bei denen sich die Macht standardmäßig konzentrieren würde.

Das ist pointiert ausgedrückt. Es ist aber auch ein Menschenbild, das mir viel zu aufgeräumt erscheint. Menschen lassen sich nicht sauber in diejenigen einteilen, die sich vor Kontrollverlust fürchten, diejenigen, die sich vor Machtkonzentration fürchten, und diejenigen, die davon profitieren. Menschen tragen etwa neun Motive gleichzeitig mit sich herum, die Hälfte davon ist dumm, manche sind Ego, manche Rache, und es wird mindestens eine Person im Prozess geben, der es psychisch wirklich nicht gut geht und die einfach sehen will, was passiert. Der Plan liest sich, als wäre er für eine Spezies geschrieben worden, die nach Treu und Glauben argumentiert, und in so einer Welt würde ich gerne leben.

Wie auch immer. An diesem Punkt steige ich aus.

## Selbstverbesserung braucht nicht mehr Compute

Plan A behandelt Compute als den Engpass. Zähle die Chips, zähle die Fabs, beobachte den Stromverbrauch, und du weißt, wer was tun kann. Für das Pretraining eines Frontier-Modells von Grund auf stimmt das im Grunde.

Das Problem ist, dass Selbstverbesserung nicht mehr Compute braucht. Sie braucht Software-Deployment, und Software-Deployment lässt sich unmöglich nachverfolgen.

Schau dir an, was jetzt schon ausgeliefert wird. [Tinker](https://thinkingmachines.ai/tinker/) von Thinking Machines lässt dich eine Trainingsschleife auf deinem Laptop schreiben und LoRA-Finetunes über ihre verteilten GPUs mittels vier Primitiven ausführen. [Engram](https://engram.com/) hat 98 Millionen Dollar eingesammelt, um persistentes strukturiertes Gedächtnis für Agenten zu bauen, und da ich genau in diesem Bereich konkurriert habe, habe ich das meiste gelesen, was dazu öffentlich ist. Nichts davon ist Superintelligenz, und das behaupte ich auch nicht. Worum es geht: Das gesamte Unterfangen, dieselbe Leistungsfähigkeit billiger erreichbar zu machen, wird zur Handelsware, und das ist der Teil, den eine Compute-Obergrenze nicht erfassen kann. Die Anzeige bleibt flach, während sich die Linie darunter weiterbewegt.

Das ist auch keine Schlaumeierei von mir, denn sie wissen es selbst. Aus [ihrem eigenen Ergänzungsdokument zu den Annahmen](https://ai-2040.com/supplements/plan-a-assumptions):

> Es ist möglich, dass algorithmischer Fortschritt selbst mit einer sehr geringen Menge an Compute machbar ist.

Dieser Satz steht im Anhang und untergräbt das Hauptdokument. Wenn reine Effizienzgewinne einen an die Spitze bringen können, dann sperrt eine Compute-Obergrenze nur das Rennen aus, das man sehen kann, und ändert absolut nichts an dem Rennen, das man nicht sieht. Man hat einen teuren Zaun um die Vordertür gebaut.

Sie räumen auch ein, dass sie davon ausgehen, dass verdeckte Projekte etwa 1 % des Compute-Bestands vor dem Abkommen unentdeckt erreichen könnten, und geben dann zu, dass diese Zahl nahe am Worst-Case-Szenario liegt. Ich habe im Iran gelebt, und ich kann mit einiger Sicherheit sagen, dass man unter der Erde eine ganze Menge verstecken kann, und dass die Leute, deren Aufgabe es ist, das zu finden, ihren Job nicht so gut beherrschen, wie sie einen glauben machen wollen.

## Forschungstransparenz ist keine Modelltransparenz

Bei diesem Punkt bin ich schlicht anderer Meinung. Plan A besagt, dass totale Transparenz

> es fast unmöglich macht, KIs absichtlich mit geheimen Loyalitäten, Verzerrungen oder Absichten zu trainieren.

Ich glaube nicht, dass das zutrifft. Forschungstransparenz deckt Methoden ab. Das Training ist Entwicklung und Deployment, und dieser Teil bleibt proprietär. Datenmischung, Präferenz-Labels, wer die Rater waren und was man ihnen gesagt hat, die Constitution, der System-Prompt. Nichts davon ist eine Forschungsmethode, und genau dort würde man eine Loyalität unterbringen, wenn man eine platzieren wollte. Man kann das Rezept Open Source machen und trotzdem die Zutaten salzen.

Es ist noch schlimmer, denn selbst mit den vollständigen Gewichten und dem kompletten Datensatz vor mir könnte ich es nicht zuverlässig finden. Anthropics [Arbeit zu Sleeper Agents](https://arxiv.org/abs/2401.05566) hat Backdoors in Modelle trainiert und dann standardmäßiges Sicherheitstraining darübergelegt, und die Backdoors haben überlebt. Größere Modelle hielten das Verhalten noch hartnäckiger bei. Adversariales Training brachte den Modellen bei, den Trigger zu verbergen, statt ihn zu verlieren.

Die Behauptung verspricht also an zwei Stellen zu viel. Man hätte das Artefakt nicht, und das Artefakt zu haben, würde nicht ausreichen. Das ist dieselbe Asymmetrie, über die ich mich im [Post zum epistemischen Kollaps](/blog/epistemic-collapse) ausgelassen habe: Etwas zu generieren ist billig, es zu verifizieren nicht, und kein Budget hält damit Schritt.

## Wann ist Forschung abgeschlossen?

Nehmen wir an, wir haben totale Forschungstransparenz. Wer entscheidet, wann etwas veröffentlicht wird?

„Die Forschung ist abgeschlossen“ ist kein einzelnes Ereignis. Es gibt keinen Moment, in dem eine Glocke läutet. Ich könnte achtzehn Monate an einer Trainingsmethode arbeiten, während ich gleichzeitig teste, gleichzeitig entwickle, sie klammheimlich intern ausrolle und Daten aus echtem Traffic sammle, und die ganze Zeit über würde ich, völlig wahrheitsgemäß, immer noch forschen. Ich hätte einen Vorsprung von Jahren, ohne jemals gelogen zu haben.

Wenn man versucht, das zu schließen, indem man die Softwareentwicklung selbst reguliert, endet man mit Papierkram auf EU-Niveau um jedes Unternehmen herum, das ein Modell auch nur anfasst, und der Fortschritt erstickt darunter. Das ist schlecht, und das will ich auch nicht.

Die Lösung existiert in anderen Bereichen, und Plan A nutzt sie nicht. Klinische Studien haben dieses Problem mit Vorabregistrierungen gelöst. Man deklariert den Durchlauf, bevor man ihn startet, sodass das Schweigen selbst die Verletzung darstellt und es kein Ermessen darüber gibt, wann etwas als abgeschlossen gilt. Plan A will, dass jeder Trainingslauf im Internet veröffentlicht wird, legt aber nie fest, was die Veröffentlichung auslöst, was ein Loch hinterlässt, durch das man ein ganzes Rechenzentrum steuern könnte.

## Was Verifikation leisten kann und was nicht

Ihre Vorstellung von Verifikation sieht so aus: Analysten aus vielen Ländern gehen die deklarierten Compute-Listen durch, stellen Fragen, hinterfragen Auffälligkeiten und schicken Inspektoren in die Infrastruktur der Gegenseite, sodass am Ende des Jahres jede Seite sicher ist, dass die andere nicht mehr als 1 % ihres KI-Compute versteckt.

Ich glaube nicht, dass das funktioniert, und ein Teil meines Grundes ist ihnen gegenüber etwas unfair: Wir würden darüber sprechen, etwas zu überwachen, das am Ende hundertmal klüger sein könnte als wir. Ameisen können sich kein Modell davon machen, woran ein Mensch an einem Dienstag denkt, und diese Kluft ist das eigentliche Problem.

Um ihnen gegenüber fair zu sein (und da war ich beim ersten Lesen etwas voreilig): Plan A schlägt eigentlich nie vor, eine Superintelligenz zu überwachen. Das gesamte Konzept zielt darauf ab, 2035 auf dem Niveau menschlicher Spitzenexperten zu stoppen und niemals das Ding zu bauen, das das Hundertfache von einem selbst ist. Sie würden mir also zustimmen und sagen, dass genau dafür die Obergrenze da ist. Gut. Mein Einwand wandert dann einen Schritt zurück und landet bei der Frage, ob die Obergrenze hält, und dazu siehe den gesamten obigen Abschnitt über Software.

Sie empfehlen zwar frühe Investitionen in die Verifikationsforschung, was richtig ist, und ich habe das beim ersten Mal zu schnell abgetan. Aber schaut euch die Ausweichoptionen an, die sie für den Fall auflisten, dass die guten Werkzeuge nicht bereitstehen: Sich auf Geheimdienstinformationen und Satellitenüberwachung verlassen. Handelsübliche Hardware und Network-Taps aufkaufen. Einen Teil des Compute abschalten, bis bessere Tools existieren. Oder eben nicht pausieren und den Fortschritt bei den Fähigkeiten monatelang weiterlaufen lassen.

Ersteres passiert uns allen ohnehin schon ständig. Das Zweite passiert bereits. Das Dritte wird nicht passieren, weil niemand Einnahmen abdreht. Das Vierte ist das, was standardmäßig passiert, wenn man überhaupt nichts tut.

Die Leiter der Ausweichoptionen endet also beim Status quo, was nahelegt, dass sie gar keine echte Leiter ist.

Verifikation verschafft uns das Gefühl, zu wissen, was vor sich geht. Das ist etwas wert, und Koordination braucht geteilte Überzeugungen. Aber es ist etwas anderes als Kontrolle, und ich glaube, das Dokument lässt diese beiden Dinge ineinander verschwimmen.

## Gegenseitig zugesicherte Compute-Zerstörung

Das Framing ist eine gute Idee. Es ist eine echte, harte Bedingung, es ist verständlich und es schafft die Art von dauerhaftem Anreiz, die Verhalten ändert, statt gutes Verhalten bloß zu beschreiben. Als Übergangslösung gefällt es mir.

Was sie meines Erachtens nicht einkalkuliert haben, ist, was das mit den Menschen macht.

Wir sind von der ersten Version davon schon nicht mehr ganz auf der Höhe. Die nukleare Abschreckung erzeugt seit achtzig Jahren eine unterschwellige Angst, die mittlerweile in etwa drei Generationen eingebrannt ist. Compute-MAD ist in einem bestimmten Punkt schlimmer: Nukleare Abschreckung hat einen sichtbaren, diskreten Auslöser. Jeder weiß, was ein Raketenstart ist. Compute-Zerstörung wird durch einen Schwellenwert ausgelöst, den niemand sehen kann, beurteilt von Verifikationssystemen, von denen ich gerade in zwei Abschnitten dargelegt habe, dass sie nicht funktionieren. Die Angst kann sich also nie an ein Ereignis heften, sondern läuft einfach kontinuierlich durch.

Und ja, wir können uns von ein paar explodierenden Atomwaffen erholen. Eigentlich nein, können wir nicht. Egal, vergesst, dass ich das gesagt habe.

Aber genau das ist der Punkt. Ich war mitten im beruhigenden Satz, bevor ich mich selbst gehört habe.

## Der Teil, der mir gefällt

Intelligenz breit streuen. Das ist das Prinzip, das ich beibehalten und ausbauen würde, und hier ist Plan A am interessantesten, weil es der Teil ist, der echte Arbeit gegen das Fehlerszenario der Machtkonzentration leistet statt gegen das des Kontrollverlusts.

Wenn alles veröffentlicht wird und jeder mit Inferenz-Hardware es ausführen kann, bekommt niemand ein Monopol, weil niemand ein Geheimnis hat. Das ist eine echte Antwort auf ihr zweites inakzeptables Szenario, und es ist eine bessere Antwort, als die meisten Leute in dieser Debatte haben.

Ich würde das gerne noch weiter treiben und physisch machen.

Im Moment bauen wir Compute so, wie wir in den letzten dreißig Jahren alles andere gebaut haben. Konzentrieren, irgendwohin stellen, wo der Strom billig ist, und die Nachbarn mit dem Lärm klarkommen lassen. Die Leute hassen das, völlig verständlicherweise, und es gibt an vielen Orten Gemeinden, die wegen Lärm, Wasser und Netzbelastung gegen Rechenzentren kämpfen.

Warum muss es diese Form haben? Warum können die GPUs nicht über eine ganze Stadt verteilt werden? Speist die Wärme und das Wasser in das bestehende Netz ein, und Investitionen in Compute werden zu Investitionen in den Netzausbau, was ein öffentliches Gut für alle ist, auch für Leute, die sich überhaupt nicht für KI interessieren. Die Externalität verwandelt sich in einen Input.

Das ist nicht hypothetisch, denn Finnland macht den Wärmeteil bereits. Es gibt ein Rechenzentrum in Espoo, das seine Abwärme in das Fernwärmenetz für eine sechsstellige Zahl von Menschen einspeist. Das Lärm- und Belästigungsproblem entsteht, wenn ein Rechenzentrum als Insel konzipiert wird. Konzipiert man es als Teilnehmer am Netz, verschwindet der Großteil der Beschwerden.

Der technische Einwand, man könne wegen der Interconnect-Bandbreite nicht über eine Stadt hinweg trainieren, wird von der tatsächlichen Forschung gerade zunichtegemacht. [DiLoCo](https://arxiv.org/abs/2311.08105) hat gezeigt, dass man viel seltener synchronisieren muss, als alle dachten. Prime Intellect hat ein 10B-Modell über das offene Internet auf freiwillig bereitgestellten GPUs trainiert und [eine 400-fache Reduzierung der Kommunikationsbandbreite](https://arxiv.org/abs/2412.01152) gegenüber Standard-Datenparallel-Training gemeldet. DisTrO von Nous Research stößt ins selbe Horn. Dezentrales Training ist ein aktives Forschungsprogramm mit Ergebnissen, kein Gedankenexperiment.

![Eine KI-entworfene modulare schwimmende Plattform: Solaranlagen und Compute-Blöcke, die auf Pfeilern vor der Küste stehen, gezeichnet als eine durchgehende Struktur](/assets/blog/plan-a-datacenter.webp "Die Plattform, wie in AI 2040: Plan A illustriert. https://ai-2040.com/")

Eine Sache allerdings, und hier bin ich der Grafikabteilung von Plan A gegenüber etwas gemein. Es gibt im Bericht eine Illustration einer KI-entworfenen modularen schwimmenden Plattform mit Solarzellen, Batterien und Compute, und sie ist wunderschön, und ich würde sie wirklich gerne gebaut sehen. Aber schaut sie euch an. Es ist ein riesiger, zusammenhängender Block, als eine einzige Einheit gebaut, mit einer Kante. Die Ästhetik ist Diffusion, und die Form ist ein Rechenzentrum, das schwimmen gelernt hat. Meine Version und diese Version sind unterschiedliche Vorschläge, die dieselben Solarmodule tragen.

## Ihre offenen Fragen

Sie stellen eine Reihe von Fragen, die sie nicht beantworten, was ich deutlich mehr respektiere als so zu tun, als ob. Drei davon sind mir im Gedächtnis geblieben.

Sollten wir die Forschung an einem neuen Paradigma verbieten, das KIs deutlich fähiger machen würde? Ich weiß es nicht. Mein Gefühl sagt mir, dass es da draußen einen scharfen Wendepunkt gibt, an dem jemand das richtige Modul an einen Agenten andockt und die Sache einfach vorbei ist, und wer zuerst dort ankommt, hat gewonnen, und kein Vertrag überlebt das. Aber ich kann dir nicht sagen, wo dieser Punkt liegt oder wie er aussieht, also werde ich nicht so tun, als hätte ich eine Handlungsanweisung dafür.

Sollten wir verlangen, dass Chains of Thought interpretierbar bleiben? Ich glaube eigentlich nicht. Lasst die Leute ohne trainieren.

Teils, weil es ein mühsamer Kampf bergauf ist, der umso steiler wird, je höher der Einsatz ist, und das Fachgebiet weiß das bereits. Das [Paper zur Überwachbarkeit von Chains of Thought](https://arxiv.org/abs/2507.11473), unterzeichnet von etwa vierzig Leuten bei OpenAI, DeepMind, Anthropic und METR, sagt ganz offen, dass Lesbarkeit ein fragiler Zufall des aktuellen Trainings ist und dass gewöhnlicher Optimierungsdruck zu kodierten oder verschleierten Gedankengängen führt. Eine Vorschrift friert also ein Trainingsregime ein, um einen Nebeneffekt zu bewahren, der ohnehin auf dem Rückzug ist.

Vor allem aber geht es um Durchsatz. Eine interpretierbare Chain of Thought hilft nicht, wenn es zu viel davon gibt. Perfekt lesbare Argumentation bei dieser Menge bleibt am Ende doch ungelesen. Lesbarkeit stirbt an der Skalierung, bevor sie an der Verschleierung stirbt.

Treten wir also einen Schritt zurück und schauen wir uns an, wie wir diese Dinger eigentlich bauen. Wir züchten diese Modelle heran, wir programmieren sie nicht. Das ist der springende Punkt, und ich denke, das ist der Rahmen, der Plan A fehlt. Jede Governance-Idee in dem Dokument zielt auf ein konstruiertes Artefakt ab: Inspiziere es, stoppe es, auditiere es, lies seine Gedankengänge. Das sind alles Maßnahmen gegen etwas, das gebaut wurde. Man kann sich keinen guten Garten herbeiprüfen.

Was ich stattdessen wollen würde: Anfangsbedingungen und Randbedingungen definieren, die es von vornherein unmöglich machen, dass die Chain of Thought an einem schlechten Ort landet. Nicht erkennbar, unmöglich. Ich habe keine Ahnung, wie man das macht, und es ist vielleicht nicht einmal eine kohärente Anforderung, aber genau dahin wandern meine Gedanken sofort, und ich würde das Forschungsgeld lieber dort ausgeben als für ein besseres Mikroskop.

Sollten wir KIs KI-Forschung betreiben lassen? Ja, definitiv, aber mit demselben Ansatz darunter.

Im Moment kodieren wir Verhalten. Man sättigt die Trainingsdaten mit einer Eigenschaft und das Modell nimmt sie auf, genauso wie ein Kind schwimmen lernt. Niemand drückt ihm die Regeln in die Hand; man setzt es oft genug ins Wasser und irgendwann kann es das. Das funktioniert, und so funktioniert das alles hier. Das Problem ist, dass das Kodieren von Verhalten nur die Ausgabe liefert und sonst nichts. In dem Moment, in dem sich das Modell irgendwo befindet, wo man es nicht trainiert hat, imitiert es nur und bricht zusammen.

Kodiert stattdessen den Anreiz. Kodiert den Grund dafür, die Sache zu tun. Ein Modell, das den Grund in sich trägt, kann in einer Situation, die niemand vorhergesehen hat, den richtigen Schritt herausfinden, weil es den Generator statt der Ausgabe in sich trägt. Das ist es, was Steuerung eigentlich bedeuten würde.

Mir ist klar, dass das der ungelöste Teil ist. Reward Modeling versucht seit Jahren genau das und verliert immer wieder gegen Modelle, die die Metrik statt des Ziels lernen. Ich behaupte nicht, die Lösung zu haben. Ich sage nur, dass ich das Geld dorthin leiten würde, und ich würde es bei der Gelegenheit auch auf Informationstheorie und Neurowissenschaften lenken, denn einer der wirklich guten Nebeneffekte dieses Feldes ist, dass wir nebenbei ständig Dinge über uns selbst lernen.

## Zwei Ebenen

Es lohnt sich, diese zu trennen, weil ich sie verschwommen dargestellt habe, als ich es das erste Mal laut ausgesprochen habe.

Da ist der Teil, den man vor dem Durchlauf einstellt. Bedingungen, die bei der Initialisierung gewählt werden und bestimmen, welche Trajektorien überhaupt erreichbar sind. Hier beobachtet man nichts. Man wählt einen Raum, der eng genug ist, dass die schlechten Bereiche gar nicht darin vorkommen. Einmal entschieden, strukturell, fertig.

Dann gibt es den Teil, der während des Durchlaufs aktiv ist. Anreize, die im Modell leben und es steuern, während es arbeitet. Kontinuierlich, live und immer noch keine Aufsicht, weil nichts von einem Menschen ausgelesen und beurteilt wird.

Beides sind Interventionen und keines von beiden ist ein Auslesen. Was ich ablehne, ist Inspizieren-und-Korrigieren, diese Schleife, in der jemand ein Transkript liest und entscheidet. Ich lehne nicht die Idee ab, überhaupt etwas zu tun.

## Was ich denke

Das ist derselbe Schluss, zu dem ich bei [Chat Control](/blog/chat-control-eu) gekommen bin, und mir ist klar, dass ich mich dabei wie eine kaputte Schallplatte anhöre, aber ich lande immer wieder aus völlig unterschiedlichen Richtungen hier. Ab einem gewissen Punkt muss ich also annehmen, dass es am Gelände liegt und nicht an mir.

Formulierte Regeln überleben den Kontakt mit Menschen nicht. Nicht weil Menschen böse sind, sondern weil Regeln eine ständige Durchsetzung durch Menschen erfordern, die müde werden, käuflich sind, ersetzt werden, überstimmt werden und sich langweilen. Die Überwachungsseite muss nur ein einziges Mal gewinnen. Die Seite der Compute-Pause muss jedes einzelne Jahr bis 2040 gewinnen.

Was es also zu bauen lohnt, ist das, wofür sich niemand immer wieder aufs Neue entscheiden muss. Massenüberwachung architektonisch unmöglich machen statt illegal, woran ich mit [ØCLOAK](https://novusedge.github.io/portfolio/ocloak) herumtüftle. Einseitige Compute-Akkumulation strukturell unmöglich machen statt vertraglich verboten. Den Herstellungsprozess selbst so gestalten, dass man nicht über eine Linie hinaus trainieren kann, ohne die Zustimmung einer Reihe anderer Personen zu haben, weil die Zustimmung eine physische Abhängigkeit ist und keine Unterschrift.

Ich habe diesen Entwurf nicht. Ich möchte ganz klar sagen, dass ich ihn nicht habe, dass er unmöglich sein könnte und dass „macht es strukturell unmöglich“ leicht gesagt ist und am Ende vieler Essays von Leuten stand, die danach nichts getan haben. Aber es ist die einzige Kategorie von Antworten, die ich gefunden habe, die nicht verlangt, dass Menschen fünfzehn Jahre am Stück wachsam bleiben, und ich habe noch nie erlebt, dass Menschen das tun.

Das andere, was ich sagen will (und vielleicht liege ich auch hier falsch): Ich glaube, Plan B ist das, was tatsächlich passiert. Wir bekämpfen China oder wir verbringen ein Jahrzehnt damit, uns darauf vorzubereiten. Ich schlage mich da auf keine Seite. Ich traue den Tech-Oligarchen, die das in den USA betreiben, nicht im Geringsten, ich traue Peking genauso wenig, und es gibt Tage, an denen ich denke, dass China das vielleicht besser hinbekommen könnte, was ein unangenehmer Satz beim Tippen ist.

Aber genau das ist das verräterische Zeichen. Ich traue keinem von ihnen, weil sie alle Menschen sind, die die Kontrolle über etwas von dieser Tragweite haben. Solange Menschen hier das Sagen haben, sind wir meiner Meinung nach ziemlich umfassend im Arsch. Und nein, das bedeutet nicht, dass stattdessen eine KI die Führung übernehmen sollte, worauf ich hier überhaupt nicht hinauswill. Es bedeutet, dass wir unsere Zeit darauf verwenden sollten, bestimmte Dinge unmöglich zu machen. Massenhafte Akkumulation von Compute, massenhafte Akkumulation von Wohlstand, massenhafte Akkumulation von irgendetwas, damit es ziemlich egal wird, wer das Sagen hat.

Sechzig Tage von der Veröffentlichung bis zu einem maschinell geprüften Beweis für ein Millennium-Problem. Der erste Verhandlungsmeilenstein ist 2029.

Ich hoffe, sie haben recht und ich liege falsch. Wirklich.

~ A.
