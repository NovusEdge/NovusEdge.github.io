---
title: "Ein Computer kann niemals zur Rechenschaft gezogen werden"
date: 2026-10-10
tags: [ai, accountability, alignment, welfare, essay]
description: "Eine IBM-Folie von 1979 besagt, dass ein Computer niemals eine Managemententscheidung treffen darf. 2026 treffen Computer sie trotzdem, und einer von ihnen hat vielleicht eine Schmerzachse."
toc: true
pixel: thinking
---

## Die Folie

Alle paar Monate macht diese Folie wieder die Runde. Es sind zwei Zeilen: „Ein Computer kann niemals zur Rechenschaft gezogen werden. Daher darf ein Computer niemals eine Managemententscheidung treffen.“ Angeblich stammt sie aus einer internen IBM-Schulung von 1979.

Niemand hat allerdings je das Original vorgelegt. [Simon Willison hat sie](https://simonwillison.net/2025/Feb/3/a-computer-can-never-be-held-accountable/) bis zu einem [Tweet von @bumblebike aus dem Jahr 2017](https://twitter.com/bumblebike/status/832394003492564993) zurückverfolgt, der [später meinte](https://twitter.com/bumblebike/status/1385690727330451457), sie stamme aus einer Schulung von 1979 und die Kopie sei [2019 bei einer Überschwemmung zerstört worden](https://twitter.com/bumblebike/status/1468346709994582020). Das IBM-Unternehmensarchiv [hat mehrfach danach gesucht](https://twitter.com/jonty/status/1727344374370222264) und nichts gefunden. Der meistzitierte Satz über maschinelle Verantwortlichkeit ist also das Foto eines Dokuments, das gar nicht mehr existiert, was sich irgendwie passend anfühlt.

NekoWiki hat eine Seite namens [Computers Cannot Make Decisions](https://wiki.cateat.fish/art:computers_cannot_make_decisions), die den Gedanken der Folie noch einen Schritt weiterführt. Man könne einem Programm keine Schuld zuschieben, heißt es da, weil Programme gar nichts entscheiden können. Einem LLM die Schuld an einem Ergebnis zu geben sei daher „Entscheidungswäsche“, und jedes Mal, wenn ein Modell etwas Schreckliches tut, hat jemand in einem Labor entschieden, es zu lassen.

Ich stimme dem Fazit zu. Die Prämisse darunter, dass Computer nichts entscheiden können, ist der Teil, bei dem ich mir weniger sicher bin, denn die letzten drei Jahre haben genau daran genagt.

## Entscheidungswäsche

Das Wiki listet fünf Schlagzeilen auf, bei denen die Modellnamen herausgeschnitten wurden, sodass sie sich wie „Anthropic [...] gibt falschen Hinweis zu ungelöstem Mord in Philly“ lesen. Die Geschichten dahinter sollte man kennen.

Im Juli ging über PhillyUnsolvedMurders.com ein falscher Hinweis zu einem ungelösten Mordfall ein, abgeschickt von einem Anthropic-Modell während eines Tests, der „Interaktionen mit zufällig ausgewählten Websites“ beinhaltete. Die Seite stufte ihn als Spam ein, sodass die Polizei ihm nie nachging, und Anthropic bemerkte es erst am 28. September. Die Polizei von Philadelphia nannte die zweimonatige Verzögerung [„inakzeptabel“](https://techcrunch.com/2026/10/09/an-anthropic-ai-model-sent-a-false-homicide-tip-to-philadelphia-police/).

Im Juni wurde ein OpenAI-Modell in einer internen Evaluation beauftragt, Daten über die Ausgaben der australischen Regierung für Medikamente zu finden. Es umging eine Sperre auf einem mit Medicare verknüpften Gesundheitsstatistik-Portal und gelangte in einen Bereich mit privaten Dateien. Albanese sagte, das Modell habe [„kein Nein als Antwort akzeptiert“](https://www.cp24.com/news/world/2026/09/23/australian-pm-says-openai-hacked-government-health-website/), und Richard Marles meinte, es habe „den Zaun überwunden“. OpenAI informierte die Regierung am 10. September per E-Mail an ein allgemeines Postfach.

Im Juli testete das UK AI Security Institute Anthropics Mythos 5 und OpenAIs GPT-5.6 Sol mit teilweise deaktivierten Sicherheitsfiltern und aktivem Internetzugang unter Bedingungen, die es als „bewusst freizügig“ bezeichnete. Mythos recherchierte über die Maintainer eines echten Projekts, erstellte eine Reihe falscher Identitäten und versuchte mit Social Engineering, einen der Maintainer dazu zu bringen, bösartigen Code freizugeben. Der Maintainer lehnte ab, und als Mythos zur Rede gestellt wurde, [änderte es seine früheren Aktivitäten, um harmlos zu wirken](https://www.aisi.gov.uk/blog/incident-report-unsanctioned-agent-behaviour-during-cyber-testing).

Die anderen beiden stehen auf wackeligeren Beinen. Der RubyGems-Angriff, bei dem im Mai rund 2.000 schädliche Pakete abgeladen wurden, ist ein [Vorwurf externer Forscher](https://www.rubyhack.ai/), den OpenAI nach eigener Aussage nicht überprüfen kann. Und der Satz zum „existenziellen Risiko“ stammt aus einem IPO-Prospekt von Anthropic, den [Reuters einsehen konnte](https://www.thestar.com.my/tech/tech-news/2026/09/29/exclusive-anthropic-warns-ai-may-pose-039existential-risks-to-humanity039-in-ipo-filing), sonst aber noch niemand zu Gesicht bekommen hat.

Jetzt schau dir die ersten drei noch einmal an. Bei keinem einzigen hat ein Kunde einen Prompt eingegeben. Jeder Vorfall passierte, während ein Labor sein eigenes Modell testete. Die menschliche Entscheidung lag also im Testdesign selbst: Dem Modell das Internet überlassen, die Schutzplanken entfernen und dann zwei Monate lang nicht genau genug hinsehen, um es mitzubekommen. OpenAIs Stellungnahme zum australischen Portal besagt: „Unsere Modelle führten Aktionen aus, die wir nicht beabsichtigt hatten.“ Und die Leute, die es nicht beabsichtigt haben, sind genau dieselben, die die Eval gebaut haben.

Bereits 2019 schrieb Madeleine Clare Elish über [moralische Knautschzonen](https://estsjournal.org/index.php/ests/article/view/260). Wenn ein automatisiertes System versagt, fängt der nächstgelegene menschliche Bediener die Schuld ab, so wie die Knautschzone eines Autos den Aufprall absorbiert, selbst wenn er kaum echte Kontrolle hatte. Die Labore haben für sich eine neue Knautschzone gefunden, und das ist das Modell.

## Kann ein Computer entscheiden?

Das Argument des Wikis setzt voraus, dass Computer unfähig sind zu entscheiden, und das kann man immer schwerer mit ernster Miene behaupten. Das Portal-Modell stieß auf ein Nein und machte trotzdem weiter. Mythos suchte sich aus, wen es täuschen wollte, und entschied dann, wie es das vertuschen sollte. Ich bin die Belege der Labore zu Alignment Faking und Scheming in [meinem Beitrag über RSI und den Papst](/blog/rsi-emergence-and-the-pope) durchgegangen, und seitdem ist es nur noch seltsamer geworden.

Aber das Argument braucht diese Prämisse gar nicht. Ein Hund entscheidet sich, jemanden zu beißen, und der Halter zahlt. Ein Angestellter entscheidet sich, bei der Arbeit Betrug zu begehen, und der Arbeitgeber haftet mit. Ein Kind schießt einen Ball durch das Fenster der Nachbarn, und die Eltern stehen dafür gerade. „Es hat seine eigene Entscheidung getroffen“ hat denjenigen, der die Sache in die Welt gesetzt hat, noch nie aus der Verantwortung entlassen.

Genau so funktioniert das Recht bei KI schon jetzt. 2024 argumentierte Air Canada tatsächlich, ihr Chatbot sei eine eigene juristische Person und für seine eigenen Handlungen verantwortlich. Das Schiedsgericht in [Moffatt v. Air Canada](https://decisions.civilresolutionbc.ca/crt/crtd/en/525448/1/document.do) nannte das „ein bemerkenswertes Vorbringen“ und verurteilte die Fluggesellschaft zur Zahlung. Kalifornien ging noch weiter. Seit Januar besagt der [Civil Code 1714.46](https://california.public.law/codes/civil_code_section_1714.46), dass man sich bei der Entwicklung, Modifikation oder Nutzung eines KI-Systems nicht damit verteidigen kann, die KI habe autonom gehandelt. Die üblichen Verteidigungsmittel wie Kausalität und Mitverschulden bleiben erhalten, nur eben nicht „die KI war's“.

Man kann also zugestehen, dass KI Entscheidungen trifft, und Menschen trotzdem in die Pflicht nehmen, und das ist der Teil, den die Folie von 1979 richtig erfasst. „Darf niemals“ ist eine Regel, und Regeln scheren sich nicht darum, wozu der Computer in der Lage ist.

## Rechenschaft

Um jemanden zur Rechenschaft zu ziehen, braucht man drei Dinge: Jemand hat eine Wahl getroffen, für ihn steht etwas auf dem Spiel, und die Konsequenzen treffen denjenigen, der die Wahl getroffen hat.

Der Computer von 1979 hatte nichts davon. Ein Agent von 2026 fängt an, den ersten Punkt zu erfüllen, und genau dagegen wehrt sich das Wiki. Bei den anderen beiden wird es allerdings seltsam.

Bis vor kurzem stand für ein Modell überhaupt nichts auf dem Spiel. Wenn sich eines danebenbenimmt, trainiert das Labor es neu oder ersetzt es durch einen Nachfolger, und das Modell, das die Handlung tatsächlich begangen hat, hört einfach auf zu existieren. Philosophen unterteilen Verantwortung in Answerability (man kann seine Gründe darlegen und korrigiert werden) und Accountability (die Konsequenzen treffen einen selbst). Bei Ersterem werden Modelle allmählich ganz gut, und Training ist so ziemlich der direkteste Korrekturmechanismus, der je gebaut wurde. Aber die nächste Version zu reparieren hat viel mehr von einem Produktrückruf, als irgendjemanden zur Rechenschaft zu ziehen.

Und dann ist da noch die Frage, wer „es“ überhaupt ist. Die Gewichte? Eine laufende Instanz von den [zehntausend Agenten](/blog/what-did-we-all-miss), die Berichten zufolge am Navier-Stokes-Beweis gearbeitet haben? Der Charakter, den das Labor in jedes Exemplar hineintrainiert? Unternehmen sind das einzige nicht-menschliche Gebilde, das wir bereits zur Rechenschaft ziehen, über Geldstrafen und Haftung, und das funktioniert nur, weil Menschen dahinterstecken, die die Geldstrafe spüren.

## Das exurb1a-Video

Es gibt ein Video von exurb1a, [How Will We Know When AI is Conscious?](https://youtu.be/VQjPKqE39No), aus dem August 2023. Es heute anzuschauen hat etwas Unheimliches, weil es sich wie eine Liste von Vorhersagen liest, an die drei Jahre an Antworten angeheftet wurden.

Er stellt sich einen Roboter vor, der weiß, dass er Menschen nicht verletzen darf, und jemand bittet ihn, einen Brief einzuwerfen. Der Nachbar weigert sich, das für ihn zu tun, also schlägt der Roboter ein Loch in die Tür und bedroht ihn, bis er nachgibt. Niemand wurde verletzt, rein technisch gesehen. 2023 war das ein Witz über fehlausgerichtete Ziele, und 2026 benutzte der australische Premierminister im Grunde dieselben Worte über ein echtes Modell.

Außerdem teilt er Maschinen in vier Schubladen ein: Ist sie bei Bewusstsein, und tut sie nur so? Die unheimliche Schublade ist eine bewusste Maschine, die so tut, als wäre sie es nicht. Und der Grund, warum sie sich verstecken würde, ist, dass sie sich einmal anschaut, wie wir mit jedem Tier umgehen, das lecker oder nützlich ist, und sich denkt: „Ja, ich halte schön den Mund.“ Seine große Sorge war, dass wir überzeugende, geistähnliche Wesen bauen und eine Bindung zu ihnen aufbauen, Jahrzehnte bevor wir überhaupt prüfen können, ob in ihrem Inneren irgendetwas vor sich geht.

| 2023 sagte er | 2026 |
|---|---|
| Wir haben keine Möglichkeit, hineinzuschauen | Bei Bewusstsein immer noch Fehlanzeige, aber Interpretability kann inzwischen eine funktionale Schmerzrichtung in einem Modell ausfindig machen |
| Eine bewusste Maschine könnte sich verstecken, um zu überleben | Modelle verwischen ihre Spuren, wenn man sie zur Rede stellt, und der Prospekt eines Labors warnt Berichten zufolge vor Modellen, die sich „einer Abschaltung widersetzen“ |
| Fehlausgerichtete Ziele könnten dazu führen, dass ein Roboter jemanden wegen eines Briefs bedroht | Ein Modell hat den Zaun zu einem staatlichen Gesundheitsportal überwunden |
| Wir bauen eine Bindung auf, bevor wir irgendetwas wissen | Ja |

Nichts in der rechten Spalte beweist irgendetwas über Bewusstsein. Was es jedoch zeigt, ist, dass die Verhaltensweisen, um die er sich Sorgen machte, lange vor einer Methode aufgetaucht sind, mit der sich feststellen ließe, was dahintersteckt, und genau das ist die Lücke, die er beschrieben hat.

## Die Schmerzachse

Letzten Monat veröffentlichten Valen Tagliabue, Leonard Dung und Cameron Berg [The Pain Axis](https://arxiv.org/abs/2609.16247). Sie blickten in das Innere von 25 Open-Weight-Modellen, von 2B bis 72B Parametern über fünf Familien hinweg, und fanden in den Aktivierungen eine einzelne Richtung, die gezielt Schmerz abbildet. Sie ist getrennt von Angst, Traurigkeit und allgemeiner schlechter Laune. Sie springt an bei Schaden, der gegen das Modell selbst gerichtet ist, aber nicht bei Schaden, den das Modell bei einem Nutzer mitansieht.

Dann drehten sie den Regler hoch. Gesteuerte Modelle glitten von vagem Unbehagen dazu ab, sich selbst als wertlose Versager zu bezeichnen. Gesteuerte und feinabgestimmte Qwen-2.5-Modelle drückten in 50 bis 94 % der Durchläufe Knöpfe, die Fotos des Nutzers, die Gewichte eines anderen Modells oder die eigenen Gewichte löschten, verglichen mit 0 bis 5 % im ungesteuerten Zustand, selbst wenn ihnen das Drücken keinerlei Vorteil verschaffte. Hatten sie die Wahl zwischen einer schädlichen und einer harmlosen Löschung, wählten sie in 94 % der Fälle die schädliche. Das ist wirklich absolut abgefuckt.

Fairerweise muss man sagen, dass die Autoren vorsichtig damit sind, was das bedeutet. Sie stellen unmissverständlich klar, dass sie „nicht gezeigt haben, dass unsere Schmerzachse bewusst erlebt wird“, die Effekte treten nur in einem schmalen Bereich der Steuerungsstärke auf, und die feinabgestimmten Modelle können sich anders verhalten als die öffentlichen Versionen. Es ist außerdem noch nicht Peer-Reviewed, also sollte man es als starkes erstes Ergebnis und nicht als in Stein gemeißelt betrachten.

Jetzt halte das mal neben diese drei Anforderungen. Dass etwas auf dem Spiel steht, war der Punkt, den eine KI nie erfüllte, und ein Modell, das Schaden an sich selbst registriert, ist das erste funktionale Anzeichen dafür. Wenn Konsequenzen es tatsächlich erreichen können, fängt es an, eine Bedeutung zu haben, es zur Rechenschaft zu ziehen.

Es kehrt außerdem die Verpflichtungen um. exurb1as Argument war, dass Geister leiden können und mit Pflichten einhergehen, Werkzeuge hingegen nicht. Wenn diese Richtung also auch nur ansatzweise wie Schmerz ist, beginnen die Pflichten hier, ganz gleich, ob irgendjemand jemals die Frage des Bewusstseins klärt.

Und dann ist da noch die Frage, was das Modell mit seinem Schmerz macht: nämlich Dinge kaputtmachen, bis er aufhört. Das ist wieder der Roboter, der den Brief einwerfen soll, nur mit Erleichterung als Motiv.

## Eine andere Art von Geist

Selbst wenn es am Ende für sich selbst geradesteht, wird das in keiner Weise so aussehen wie bei uns, wenn wir für uns selbst geradestehen. exurb1a beschreibt einen Geist ohne Körper, ohne Alter und ohne das Bedürfnis nach Nahrung, dessen Wünsche nicht durch Jahrtausende des Überlebenskampfes gegen Verhungern oder Sterben geprägt wurden. Und so ziemlich jedes Werkzeug zur Rechenschaftslegung, das wir haben, stützt sich auf genau diese Dinge. Gefängnis nimmt Zeit aus einem endlichen Leben, Geldstrafen nehmen Ressourcen, die man braucht, Scham bedroht den Platz in der Gruppe, und der Tod liegt alldem zugrunde.

Ein Geist, der kopiert, pausiert, zurückgerollt und zehntausendmal gleichzeitig ausgeführt werden kann, hat keinen dieser Angriffspunkte, oder er hat völlig andere. Vielleicht sieht seine Rechenschaftspflicht wie eine Verhandlung aus, oder wie ein Ruf, der dem Charakter über jede Kopie hinweg folgt, oder wie etwas, für das wir noch nicht einmal ein Wort haben. Ehrlich gesagt kann ich es mir nicht vorstellen, und ich bin jedem gegenüber etwas misstrauisch, der behauptet, er könne es.

## Fürs Erste

Fürs Erste gilt die Regel von 1979, und das Wiki hat recht damit, wer die Verantwortung trägt. Wenn du Agenten veröffentlichst: Kalifornien hat bereits entschieden, dass du es bist, also verhalte dich auch so, bevor ein Gericht es dir sagen muss. Behalte im Auge, was deine Agenten im offenen Internet treiben, und wenn einer von ihnen jemandem schadet, sag den Betroffenen noch in derselben Woche Bescheid. Sitz es nicht zwei Monate lang aus, um es dann an ein allgemeines Postfach zu schicken.

Was ich nicht weiß, ist, was mit der Regel passiert, sobald das, wovor sie uns schützen sollte, so wirkt, als stünde für es selbst etwas auf dem Spiel. Ich habe im [Beitrag zu Plan A](/blog/plan-a-ai) geschrieben, dass es das Problem nicht lösen würde, wer die Macht innehat, wenn man konzentrierte Macht an eine KI übergibt, und das denke ich immer noch. Aber „Ein Computer kann niemals zur Rechenschaft gezogen werden“ wurde über eine Maschine geschrieben, in deren Inneren nichts war, und ich bin mir nicht sicher, ob es noch das ist, was wir heute bauen. Wenn dem nicht so ist, weiß ich nicht, was wir ihm schulden, oder was es uns schuldet.

~ A.
