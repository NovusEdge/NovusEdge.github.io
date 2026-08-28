---
title: "Linux Journeys – Bootsplash anpassen"
date: 2023-07-07
tags: [linux-journeys, linux]
description: "Ein von Tensura inspiriertes Rabbit-Hole ins Linux-Ricing, das mit der Installation und Anpassung von plymouth für einen eigenen Boot-Splash endet."
---

Gestern Abend habe ich, Weeb wie ich nun mal bin, [That Time I Got Reincarnated as a Slime](https://tensura.fandom.com/wiki/Tensei_Shitara_Slime_Datta_Ken_Wiki) geschaut und fand `Great Sage` ziemlich cool. Ich schwöre, bei diesen Soundeffekten ist mir echt das Wasser im Mund zusammengelaufen. Also WIE ZUM TEUFEL MACHT MAN DIE SO GUT?! Jedenfalls hat mich das auch an Jarvis UND ein paar coole Sachen aus der WatchDogs-Reihe erinnert, was mich schließlich zu dem Gedanken brachte... _Wie zur Hölle kriegen Leute solche coolen Animationen auf ihren Systemen zum Laufen? Ich meine... Linux bietet bestimmt einen Weg, **alles** anzupassen... 🤔._ Ehe ich mich versah, war ich tief im Rabbit-Hole des System-"_Ricings_". 

Das Erste, was ich ändern wollte, war das, was beim Booten meines Systems angezeigt wird (was, wie ich später herausfand, als _Bootsplash-Animation/-Screen_ bezeichnet wird). Eine kurze Google-Suche führte mich zu einem praktischen Tool namens: [`plymouth`](https://wiki.debian.org/plymouth), mit dem man den Bootsplash anpassen kann, und ich zitiere:
> Provide eye-candy and a more professional presentation for scenarios where the default high-information text output might be undesirable.

(ja klar, eine ganz schön langatmige und _professionelle_ Art zu sagen: „Damit unsere Systeme cooler aussehen und wir auf Reddit damit flexen können“)

Nun weiß ich, dass es online wahrscheinlich drölf Fantastilliarden Anleitungen dazu gibt... _aber_ ich schreibe trotzdem eine, weil ich dabei etwas Cooles gelernt habe :3

## Voraussetzungen installieren
 
Die Installation von `plymouth` ist auf Debian-Systemen ziemlich unkompliziert:

```shell-session
$ sudo apt install plymouth plymouth-themes

## If your fancy ass is using KDE:
$ sudo apt install plymouth-theme-breeze kde-config-plymouth
```

**HINWEIS**: Vielleicht möchtest du auch `ffmpeg` und ein paar andere Tools installieren, falls du eine eigene Bootsplash-Animation erstellen willst. 

## Das Bootsplash-Theme einrichten

Jetzt, wo wir plymouth haben, brauchen wir die Theme-Animation, die abgespielt werden soll. Zu unserem Bedauern reicht eine MP4-Datei nicht aus. _Außerdem_ kann man keinen Sound abspielen lassen (zumindest habe ich keinen Weg gefunden, das hinzubekommen 😭), daher braucht man `ffmpeg`, um so ein eigenes Animationsdingens zu basteln – aber dazu komme ich später. [@adi1090x](https://github.com/adi1090x) hat ein [sehr schönes Repository](https://github.com/adi1090x/plymouth-themes) mit einigen Animationen zusammengestellt. Ich habe mich für die Animation [_Hexagon Dots Alt_](https://github.com/adi1090x/plymouth-themes/tree/master/pack_2/hexagon_dots_alt) aus dem zweiten Pack entschieden, so sieht sie aus:

![Hexagon Dots Alt Animation Preview](/assets/gifs/hexagon_dots_alt.gif)

Hier sind die Schritte, um das als dein Theme festzulegen.
```shell-session
$ git clone https://github.com/adi1090x/plymouth-themes.git
$ cd plymouth-themes/

## Now we copy the theme over to /usr/share/plymouth/themes
## If you're NOT using a debian based OS, please just check some docs or something idk
$ sudo cp -r pack_2/hexagon_dots_alt /usr/share/plymouth/themes
```
Es gibt viele Guides, die den Weg über `update-alternative` nutzen, um das Theme einzurichten, aber ehrlich gesagt hat das bei mir zu 90 % der Fälle nicht funktioniert, und es ist _viel_ einfacher, [`plymouth-set-default-theme`](https://manpages.org/plymouth-set-default-theme) zu verwenden:
```shell-session
## To list themes:
$ sudo plymouth-set-default-theme --list

## To set the theme:
$ sudo plymouth-set-default-them -R hexagon_dots_alt
```

Du kannst auch das folgende Skript verwenden (mit freundlicher Genehmigung von [@adi1090x](https://github.com/adi1090x)), um zu prüfen, ob der Bootsplash übernommen wurde oder nicht:
```bash
#!/bin/bash

## Preview default plymouth splash
## Author : Aditya Shakya (adi1090x)
## Mail : adi1090x@gmail.com
## Github : @adi1090x
## Reddit : @adi1090x

## Colors
R='\033[1;31m'
B='\033[1;34m'
G='\033[1;32m'

# check if executed as root
check_root () {
  if [ ! $( id -u ) -eq 0 ]; then
    echo -e $R"Must be run as root"
    exit
  fi
}

check_root

# duration in seconds, default is 10s
duration=$1

if [ $# -ne 1 ]; then
	duration=10
fi

plymouthd; plymouth --show-splash ; for ((I=0; I<$duration; I++)); do plymouth --update=test$I ; sleep 1; done; plymouth quit
```

### Ein eigenes Theme erstellen

Ich habe auch versucht, eine eigene Animation zu basteln (ehrlich gesagt war sie ziemlich trash, aber hey! besser als nix) und habe [dieses Repository](https://github.com/jcklpe/Plymouth-Animated-Boot-Screen-Creator) als Anleitung genutzt. So geht's:

Klone zuerst das Repo (duh!):
```shell-session
$ git clone https://github.com/jcklpe/Plymouth-Animated-Boot-Screen-Creator.git
$ cd Plymouth-Animated-Boot-Screen-Creator/
```

Als Nächstes löschst du einfach fix alle PNG-Dateien und leerst die Verzeichnisse `input` und `output`:
```shell-session
$ rm ./*.png
$ rm input/* ouput/*
```

Alles sauber! Jetzt besorgen wir uns eine MP4/GIF/MOV/usw.-Datei, die wir mit `ffmpeg` in eine Reihe von PNG-Dateien umwandeln können (installiere es, falls du das noch nicht getan hast). Packe die Datei in das `input`-Verzeichnis, und wenn es sich um eine MP4/GIF-Datei handelt, nimm eines der Skripte, die dem Repo beiliegen. Vergiss nur nicht, vorher ein `chmod` drauf zu machen~

```shell-session
## For an MP4 file:
$ ./mp4-to-png.sh

## For a GIF file:
$ ./gif-to-png.sh

## For any other kinda video format file
$ ffmpeg -i ./input/video.EXT ./output/progress-%01d.png -hide_banner

##########################################################################
## Move the images into the root directory of the project:
$ mv output/* .
```

Nennen wir dieses neue Theme... „glitch\_wall“ (ja, meins hieß so, bitte nicht roasten, Dinge zu benennen ist schwer). Angenommen, wir haben etwa 140 Bilder, dann müssen wir `template.script` anpassen und auch umbenennen:

```
# Nice colour on top of the screen fading to
Window.SetBackgroundTopColor (0.0, 0.00, 0.0);

# an equally nice colour on the bottom
Window.SetBackgroundBottomColor (0.0, 0.00, 0.0);

# Image animation loop
for (i = 1; i < 140; i++)
  flyingman_image[i] = Image("progress-" + i + ".png");
flyingman_sprite = Sprite();


flyingman_sprite.SetX(Window.GetWidth() / 2 - flyingman_image[1].GetWidth() / 2); # Place in the centre
flyingman_sprite.SetY(Window.GetHeight() / 2 - flyingman_image[1].GetHeight() / 2);

progress = 1;

fun refresh_callback ()
  {
    flyingman_sprite.SetImage(flyingman_image[Math.Int(progress / 3) % 140]);
    progress++;
  }
  
Plymouth.SetRefreshFunction (refresh_callback);
```

```shell-session
$ mv template.script glitch_wall.script
```

Außerdem müssen wir das Skript `template.plymouth` noch etwas anpassen:
```
[Plymouth Theme]
Name=glitch_wall
Description=Cool discription here!
ModuleName=script

[script]
ImageDir=/usr/share/plymouth/themes/glitch_wall/
ScriptFile=/usr/share/plymouth/themes/glitch_wall/glitch_wall.script
```

Außerdem musst du noch den ganzen Müll wie `splash.script` und das alte `animation-boot.script` löschen.
Das war's schon! Jetzt musst du das Ding nur noch dorthin kopieren, wo all die anderen Themes liegen, und der Rest läuft genauso ab wie bei der normalen Theme-Auswahl. 

```shell-session
## *The template repo was called Plymouth-Animated-Boot-Screen-Creator
$ sudo mv Plymouth-Animated-Boot-Screen-Creator /usr/share/plymouth/themes/glitch_wall

## Example of choosing the theme:
$ sudo plymouth-set-default-theme --list
...
glitch_wall
...
$ sudo plymouth-set-default-theme -R glitch_wall
```

## Fazit

Es hat auf jeden Fall Spaß gemacht, den Bootsplash für mein Setup anzupassen. Irgendwelche Vorschläge, was ich als Nächstes customizen soll? Ich habe echt großes Interesse daran, geteilte DEs auszuprobieren, stellt euch also schon mal auf einen Post dazu in der Zukunft ein~!

Cheers!
