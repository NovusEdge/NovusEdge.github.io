---
title: "Linux-resor - Anpassa bootsplash"
date: 2023-07-07
tags: [linux-journeys, linux]
description: "Ett Tensura-inspirerat kaninhål in i Linux-ricing som slutar med att installera och tema plymouth för en anpassad bootsplash."
---

Igår kväll, weeb som jag är, kollade jag på [That Time I Got Reincarnated as a Slime](https://tensura.fandom.com/wiki/Tensei_Shitara_Slime_Datta_Ken_Wiki) och tyckte att `Great Sage` var riktigt cool. Svär att de där ljudeffekterna fick mig att dregla. Alltså HUR GÖR MAN DEM SÅ BRA?! Hur som helst påminde det mig också om Jarvis OCH några coola grejer från WatchDogs-serien, vilket i slutändan fick mig att fundera... _Hur fan lyckas folk köra såna här coola animationer på sina system, jag menar... Linux har säkert ett sätt att anpassa **allt**... 🤔._ Vips så var jag djupt nere i kaninhålet av att "_rica_" system. 

Det första jag ville göra var att ändra det som visas när jag bootar upp mitt system (vilket jag senare fick veta kallas för en _bootsplash-animation/skärm_). En snabb googling ledde mig till ett smidigt verktyg som heter [`plymouth`](https://wiki.debian.org/plymouth) och låter oss ändra bootsplash, och jag citerar:
> Erbjuda ögongodis och en mer professionell presentation för scenarier där den texttunga standardutskriften kan vara oönskad.

(jovisst, ett ganska långrandigt och _professionellt_ sätt att säga "få våra system att se coolare ut så vi kan skryta om det på reddit")

Nu vet jag att det säkert finns en googol plus artiklar på nätet om hur man gör det här... _men_ jag tänker skriva en ändå eftersom det var något coolt jag lärde mig :3

## Installera förutsättningar
 
Att installera `plymouth` är ganska enkelt på Debian-system:

```shell-session
$ sudo apt install plymouth plymouth-themes

## If your fancy ass is using KDE:
$ sudo apt install plymouth-theme-breeze kde-config-plymouth
```

**OBS**: Du kanske också vill installera `ffmpeg` och några andra verktyg om du vill göra en egen bootsplash-animation. 

## Ställa in bootsplash-temat

Så, nu när vi har plymouth behöver vi tema-animationen vi vill spela upp. Till vår besvikelse fungerar inte en MP4-fil. _Dessutom_ kan du inte spela upp ljud (jag lyckades åtminstone inte lista ut något sätt att göra det på 😭), därav behovet av `ffmpeg` för att skapa en egen animation, men jag återkommer till det senare. [@adi1090x](https://github.com/adi1090x) har sammanställt ett [väldigt fint repo](https://github.com/adi1090x/plymouth-themes) med animationer. Jag fastnade för animationen [_Hexagon Dots Alt_](https://github.com/adi1090x/plymouth-themes/tree/master/pack_2/hexagon_dots_alt) från det andra paketet, så här ser den ut:

![Hexagon Dots Alt Animation Preview](/assets/gifs/hexagon_dots_alt.gif)

Här är stegen för att ställa in den som ditt tema.
```shell-session
$ git clone https://github.com/adi1090x/plymouth-themes.git
$ cd plymouth-themes/

## Now we copy the theme over to /usr/share/plymouth/themes
## If you're NOT using a debian based OS, please just check some docs or something idk
$ sudo cp -r pack_2/hexagon_dots_alt /usr/share/plymouth/themes
```
Det finns många guider som använder `update-alternative`-spåret för att konfigurera temat, men ärligt talat fungerade det inte för mig 90 % av gångerna, och det är _mycket_ enklare att använda [`plymouth-set-default-theme`](https://manpages.org/plymouth-set-default-theme):
```shell-session
## To list themes:
$ sudo plymouth-set-default-theme --list

## To set the theme:
$ sudo plymouth-set-default-them -R hexagon_dots_alt
```

Du kan också använda följande skript (tack vare [@adi1090x](https://github.com/adi1090x)) för att se om bootsplashen har ändrats eller inte:
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

### Skapa ett eget tema

Jag försökte också göra en egen animation (ärligt talat var den ganska kass, men hey! det är i alla fall något) med hjälp av [det här repot](https://github.com/jcklpe/Plymouth-Animated-Boot-Screen-Creator) som guide. Så här gör du:

Klona först repot (duh!):
```shell-session
$ git clone https://github.com/jcklpe/Plymouth-Animated-Boot-Screen-Creator.git
$ cd Plymouth-Animated-Boot-Screen-Creator/
```

Ta sedan bara snabbt bort alla PNG-filer och rensa mapparna `input` och `output`:
```shell-session
$ rm ./*.png
$ rm input/* ouput/*
```

Helt rent! Nu vill vi fixa någon MP4/GIF/MOV/etc.-fil som vi kan konvertera till en serie PNG-filer med hjälp av `ffmpeg` (installera det om du inte redan har gjort det). Lägg filen i mappen `input`, och om det är en MP4- eller GIF-fil kan du använda ett av skripten som följer med i repot. Glöm bara inte att köra `chmod` på det~

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

Låt oss kalla det nya temat... "glitch\_wall" (ja, jag döpte mitt till det, snälla håna mig inte, det är svårt att döpa saker). Förutsatt att vi har runt 140 bilder behöver vi modifiera `template.script` och även byta namn på det:

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

Vi behöver också modifiera skriptet `template.plymouth` lite grann:
```
[Plymouth Theme]
Name=glitch_wall
Description=Cool discription here!
ModuleName=script

[script]
ImageDir=/usr/share/plymouth/themes/glitch_wall/
ScriptFile=/usr/share/plymouth/themes/glitch_wall/glitch_wall.script
```

Du behöver också ta bort alla skräpfiler som `splash.script` och det gamla `animation-boot.script`.
Det var allt! Nu behöver du bara kopiera över den här rackaren dit alla andra teman sparas, och resten är precis samma sak som när man väljer temat. 

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

## Sammanfattning

Det var verkligen kul att anpassa bootsplashen för min setup. Några förslag på vad jag borde anpassa härnäst? Jag är riktigt sugen på att testa tiling-DE:s, så förvänta dig ett inlägg om det i framtiden~!

Ha det gott!
