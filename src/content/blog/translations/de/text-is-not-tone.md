---
title: "Text != Tonfall"
date: 2026-11-15
tags: [ai, interfaces, voice, agents, essay]
description: "Sieben Wörter, die sieben verschiedene Dinge bedeuten, je nachdem, welches man betont. Wenn man einer KI tippt, geht genau dieser Teil verloren. Und das fällt heute viel mehr ins Gewicht, wo KIs auf Basis unserer getippten Worte auch handeln."
draft: true
pixel: thinking
---

"I didn't say she stole the money." Versuch mal, das ein paar Mal laut auszusprechen, und betone jedes Mal ein anderes Wort. Es ist ein Beispiel, das Linguisten und Englischlehrer lieben, weil es aus sieben Wörtern besteht und sieben verschiedene Dinge bedeutet, je nachdem, welches man betont:

{{stress_list}}

Und jetzt tipp es mal ein. Es ist alle sieben Mal derselbe Satz, und wenn ich mir nicht die Mühe mache, Wörter kursiv zu setzen (was ich normalerweise nicht tue, und du vermutlich auch nicht), musst du raten, was ich eigentlich gemeint habe. Und genau so sprechen wir im Moment mit so ziemlich jedem KI-Assistenten: über ein kleines Textfeld, das die Wörter behält und alles andere einfach wegwirft.

{{typed_line}}

## Was geht da also verloren?

Die Betonung ist das eine. Der Tonfall ist das noch größere Thema. Es gibt eine großartige Anekdote über den Philosophen J. L. Austin: In einer Vorlesung erklärte er, dass im Englischen eine doppelte Verneinung positiv sein kann, aber keine Sprache eine doppelte Bejahung nutzt, um etwas zu verneinen. Sidney Morgenbesser, der im Publikum saß, meinte daraufhin nur: "Yeah, *yeah*." Aufgeschrieben stimmen sich hier zwei Leute zu. Laut ausgesprochen hatte er gerade mit zwei Wörtern die gesamte These widerlegt.

Und wir bemerken das viel schlechter, als wir glauben. In einer [Studie aus dem Jahr 2005](https://pubmed.ncbi.nlm.nih.gov/16393025/) zu E-Mails lagen Personen, die sarkastische oder ernste Sätze lasen, etwa so oft richtig wie beim puren Raten. Diejenigen, die dieselben Sätze *gehört* hatten, lagen dagegen zu fast drei Vierteln richtig. Das ist wie ein Münzwurf, und die Absender hatten keine Ahnung: In einem weiteren Experiment desselben Papers erwarteten die Absender, dass ihr Tonfall per E-Mail zu etwa [89%](#stat) richtig rüberkommt, aber er landete nur bei rund [63%](#stat).

Das Internet hat sich natürlich Behelfslösungen ausgedacht: /s, ein "lol" am Satzende, damit es nicht gemein wirkt, oder Großbuchstaben fürs Schreien. Sprachmodelle haben das ganze Internet gelesen, die verstehen das problemlos. Das Problem ist nur: Man fügt so etwas nur hinzu, wenn man schon ahnt, dass man missverstanden werden könnte, und laut der Studie können wir genau das extrem schlecht einschätzen. Niemand tippt "ok fine /tired".

Und dann ist da noch das Unterbrechen. Wenn man mit jemandem spricht, sagt man "mhm", damit er weiterspricht, oder "warte, nein, nicht das", sobald er in die falsche Richtung abbiegt. Im Chat tippt man eine ganze Nachricht, wartet auf eine komplette Antwort und merkt erst hinterher, dass man missverstanden wurde. Wer schon mal dabei zugesehen hat, wie eine KI voller Überzeugung 600 Wörter über das völlig Falsche schreibt, kennt das Gefühl.

{{forty_sheets}}

## Und wenn es NICHT Englisch ist?

Im Englischen dient die Tonhöhe vor allem der Haltung und Stimmung, und genau deshalb geht beim Aufschreiben so viel verloren. Andere Sprachen ziehen diese Grenze ganz woanders, und ehrlich gesagt ist das ziemlich faszinierend.

Im Mandarin ist die Tonhöhe Teil des Wortes selbst. *mā*, flach gesprochen, ist 妈, Mutter. *má*, steigend, ist 麻, Hanf. *mǎ*, fallend-steigend, ist 马, Pferd. *mà*, fallend, ist 骂, schimpfen. Dieselbe Silbe, vier verschiedene Wörter, und der einzige Unterschied ist der Tonverlauf der Stimme. In der Schrift bleibt das allerdings erhalten, weil jedes Wort sein eigenes Schriftzeichen bekommt. Der Linguist Yuen Ren Chao trieb das mit dem Gedicht "Lion-Eating Poet in the Stone Den" auf die Spitze, in dem jede einzelne Silbe eine Variante von *shi* ist. Es beginnt mit 石室诗士施氏，嗜狮，誓食十狮 (*Shíshì shīshì Shī Shì, shì shī, shì shí shí shī*): ein Dichter namens Shi in einer Steinhöhle, der Löwen liebte und schwor, zehn davon zu essen. In Schriftzeichen gelesen ergibt es Sinn. Laut vorgelesen ist es einen ganzen Absatz lang nur *shi shi shi shi*, und niemand kann mehr folgen.

{{tones}}

Das Arabische geht den umgekehrten Weg. Kurze Vokale werden meistens gar nicht geschrieben, كتب besteht also nur aus den Konsonanten k-t-b. Fügt man die Vokalzeichen wieder ein, könnte es كَتَبَ (*kataba*, er schrieb), كُتِبَ (*kutiba*, es wurde geschrieben) oder كُتُب (*kutub*, Bücher) heißen. Wer flüssig liest, setzt aus dem Kontext ganz automatisch das Richtige ein, ohne auch nur darüber nachzudenken.

{{harakat}}

Gesprochene Sprachen transportieren Informationen zudem mit unterschiedlicher Dichte. Eine [Studie aus dem Jahr 2019 in Science Advances](https://www.science.org/doi/10.1126/sciadv.aaw2594) verglich 17 Sprachen und fand heraus, dass schnelle Sprachen wie Spanisch und Japanisch weniger in jede Silbe packen und langsamere wie Vietnamesisch mehr. Am Ende transportieren sie alle etwa [39 bits a second](#stat).

Jedes Schriftsystem trifft also eine Entscheidung darüber, was festgehalten und was dem Leser überlassen wird. Das Chinesische behält die Töne in den Schriftzeichen. Das Arabische lässt die Vokale weg und vertraut auf den Kontext. Das Englische behält jeden Buchstaben, wirft Betonung und Tonfall komplett über Bord und überlässt das Raten dir.

## Tippen ist einfach ziemlich langsam

Die größte Tipp-Studie, die ich finden konnte, [untersuchte 136 Millionen Tastenanschläge](https://userinterfaces.aalto.fi/136Mkeystrokes/). Der Durchschnitt lag bei [52 words a minute](#stat), etwa [1 token a second](#stat), und das von Leuten, die sich *freiwillig* für einen Tipptest gemeldet haben. Sprechen liegt bei rund [150 words a minute](#stat), etwas über [3 tokens a second](#stat). Das Modell am anderen Ende antwortet mit [50 to 200 tokens a second](#stat). Der langsamste Teil des gesamten Kreislaufs sind also deine Finger.

{{rate_cards}}

Wer schnell tippt, kommt gut klar. Die meisten Menschen tippen aber nicht schnell, und viele können überhaupt nicht bequem tippen: Kinder, ältere Menschen, jeder mit motorischen Einschränkungen oder alle, die eine Sprache eher sprechen als schreiben. Jeder lernt sprechen, Jahre bevor er schreiben lernt. Wenn wir wirklich wollen, dass KI für mehr Leute nutzbar ist als nur für diejenigen, die ohnehin an der Tastatur leben, ist Sprache der naheliegende Zugang.

## Können wir dann nicht einfach Sprache nutzen?

Der Haken ist, dass viele Sprachmodi den Tonfall immer noch verwerfen. Sie transkribieren das Gesagte in Text, schicken den Text an das Modell und lesen die Antwort laut vor. Die Betonung ist schon in Schritt eins verloren, und am Ende ist man wieder beim kleinen Textfeld, nur mit Zwischenschritten.

Modelle, die Audio direkt verarbeiten, müssten das doch besser können, oder? Ein [Paper aus dem Jahr 2025 namens StressTest](https://arxiv.org/abs/2505.22765) hat genau das mit Sätzen wie dem ganz oben überprüft, und die meisten Sprachmodelle schnitten kaum besser ab als bloßes Raten, welche Bedeutung gemeint war. gpt-4o-audio kam auf [59%](#stat). Das beste Modell, Gemini 2.5 Pro, erreichte [78%](#stat). Menschen kamen auf [93%](#stat). Selbst wenn das Modell dich also buchstäblich hören kann, merkt es oft nicht, welches Wort du betont hast.

## Warum eigentlich?

Eine Zeit lang war das alles keine große Sache. Ein Chatbot hat dich missverstanden, du hast eine schlechte Antwort bekommen, mit den Augen gerollt und noch mal gefragt.

So läuft das heute nicht mehr. Assistenten bearbeiten Code, öffnen Pull Requests, verschicken E-Mails und laufen stundenlang autonom. Ich baue selbst solche Systeme: [flocc](/portfolio/flocc/) schnappt sich ein Issue und bearbeitet es, ohne dass ich eingreifen muss. Wenn so ein System dich falsch versteht, bekommst du nicht bloß einen schlechten Absatz; dann wird eine Datei geändert oder eine E-Mail verschickt.

Angenommen, ein Agent fragt, ob er mit einem großen Refactoring loslegen soll, und du tippst "ok fine". Wenn du damit *Ja* gemeint hast: super. Wenn du aber meintest "Ich bin zu müde, um jetzt darüber zu diskutieren", wolltest du wahrscheinlich, dass er aufhört. Nur steckt in diesen zwei Wörtern nichts, was ihm das verrät.

Ich sage nicht, dass Text verschwinden soll. Man kann vor dem Absenden noch editieren, man kann sich Zeit lassen, man kann es in einer Bibliothek nutzen. Und manchmal *will* man auch gar nicht, dass eine Maschine mitbekommt, wie man sich fühlt, was völlig verständlich ist.

Aber wenn wir diese Dinger für uns handeln lassen wollen, brauchen sie mehr als nur die reinen Wörter. Sie müssen hören, *wie* man Ja gesagt hat, und nicht nur, dass man es gesagt hat. Sie müssen es zulassen, dass man sie rechtzeitig unterbricht. Und wenn sie wirklich nicht wissen, welche der sieben Bedeutungen gemeint war, sollten sie das tun, was ein Mensch tun würde: nachfragen.
