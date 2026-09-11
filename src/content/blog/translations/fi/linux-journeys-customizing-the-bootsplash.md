---
title: "Linux Journeys – Bootsplashin kustomointi"
date: 2023-07-07
tags: [linux-journeys, linux]
description: "Tensuran inspiroima kaninkolo Linux-tuunaukseen (ricing), joka päättyy plymouthin asentamiseen ja teemoittamiseen kustomoidun bootsplashin luomiseksi."
---

Eilen illalla, sellainen weebi kuin olen, katselin animea [That Time I Got Reincarnated as a Slime](https://tensura.fandom.com/wiki/Tensei_Shitara_Slime_Datta_Ken_Wiki) ja totesin `Great Sage` -hahmon olevan aika siisti. Vannon, ne ääniefektit saivat mut kuolaamaan. Siis MITEN NE VOI TEHDÄ NIIN HYVIKSI?! Joka tapauksessa tämä toi mieleeni myös Jarvisin JA jotain siistiä The WatchDogs -sarjasta, mikä sai mut lopulta miettimään... _Miten ihmeessä jengi saa nää siistit animaatiot pyörimään koneillaan, meinaan... Linuxissa on varmaan joku tapa kustomoida **ihan kaikki**... 🤔._ Ennen kuin huomasinkaan, olin syvällä järjestelmien "_raissaus_"-kaninkolossa (ricing).

Ensimmäinen juttu, jonka halusin tehdä, oli vaihtaa se ruutu, joka näkyy aina järjestelmää käynnistäessä (joka myöhemmin paljastui jutuksi nimeltä _bootsplash-animaatio/ruutu_). Nopea googlaus ohjasi mut näppärän työkalun luo nimeltä: [`plymouth`](https://wiki.debian.org/plymouth), jonka avulla bootsplashia voi muuttaa, ja siteraan:
> Provide eye-candy and a more professional presentation for scenarios where the default high-information text output might be undesirable.

(jep jep, melko monisanainen ja _ammatillinen_ tapa sanoa "saadaan järjestelmämme näyttämään siistimmältä, jotta voimme leuhkia sillä redditissä")

No, tiedän kyllä, että netissä on varmaan googolin verran artikkeleita aiheesta... _mutta_ aion kirjoittaa sellaisen silti, koska tää oli siisti juttu jonka opin :3

## Esivaatimusten asennus
 
`plymouth`-työkalun asentaminen on Debian-järjestelmissä melko suoraviivaista:

```shell-session
$ sudo apt install plymouth plymouth-themes

## If your fancy ass is using KDE:
$ sudo apt install plymouth-theme-breeze kde-config-plymouth
```

**HUOM**: Saatat haluta asentaa myös `ffmpeg`-työkalun ja joitain muita apuohjelmia, jos haluat tehdä oman kustomoidun bootsplash-animaation. 

## Bootsplash-teeman asettaminen

Nyt kun meillä on plymouth, tarvitsemme animaatioteeman, jota haluamme toistaa. Ikävä kyllä MP4-tiedosto ei kelpaa sellaisenaan. _Lisäksi_ ääntä ei voi toistaa (en ainakaan itse keksinyt keinoa siihen 😭), joten tarvitsemme `ffmpeg`iä kustomoidun animaation luomiseen, mutta palaan siihen myöhemmin. [@adi1090x](https://github.com/adi1090x) on koonnut [todella hienon repositorion](https://github.com/adi1090x/plymouth-themes) erilaisista animaatioista. Päädyin toisesta paketista löytyvään [_Hexagon Dots Alt_](https://github.com/adi1090x/plymouth-themes/tree/master/pack_2/hexagon_dots_alt) -animaatioon, tässä miltä se näyttää:

![Hexagon Dots Alt Animation Preview](/assets/gifs/hexagon_dots_alt.gif)

Tässä ovat askeleet sen asettamiseksi teemaksesi.
```shell-session
$ git clone https://github.com/adi1090x/plymouth-themes.git
$ cd plymouth-themes/

## Now we copy the theme over to /usr/share/plymouth/themes
## If you're NOT using a debian based OS, please just check some docs or something idk
$ sudo cp -r pack_2/hexagon_dots_alt /usr/share/plymouth/themes
```
Monissa oppaissa käytetään `update-alternative`-reittiä teeman asettamiseen, mutta rehellisesti sanottuna se ei toiminut mulla 90 % ajasta, ja on _paljon_ helpompaa käyttää komentoa [`plymouth-set-default-theme`](https://manpages.org/plymouth-set-default-theme):
```shell-session
## To list themes:
$ sudo plymouth-set-default-theme --list

## To set the theme:
$ sudo plymouth-set-default-them -R hexagon_dots_alt
```

Voit myös käyttää seuraavaa skriptiä (kiitos käyttäjälle [@adi1090x](https://github.com/adi1090x)) tarkistaaksesi, onko bootsplash vaihtunut vai ei:
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

### Oman kustomoidun teeman tekeminen

Yritin myös tehdä oman kustomoidun animaation (suoraan sanottuna se oli vähän kuraa, mutta hei! sekin on jotain) käyttäen oppaana [tätä repositorioa](https://github.com/jcklpe/Plymouth-Animated-Boot-Screen-Creator). Näin se käy:

Kloonaa ensin repo (totta kai!):
```shell-session
$ git clone https://github.com/jcklpe/Plymouth-Animated-Boot-Screen-Creator.git
$ cd Plymouth-Animated-Boot-Screen-Creator/
```

Seuraavaksi poista vain nopeasti kaikki PNG-tiedostot ja tyhjennä `input`- ja `output`-hakemistot:
```shell-session
$ rm ./*.png
$ rm input/* ouput/*
```

Kaikki puhdasta! Nyt haluamme jonkin MP4/GIF/MOV/yms.-tiedoston, jonka voimme muuntaa PNG-tiedostojen sarjaksi `ffmpeg`illä (asenna se, jos et ole vielä tehnyt niin). Siirrä tiedosto `input`-hakemistoon, ja jos se on MP4- tai GIF-tiedosto, käytä yhtä repon mukana tulevista skripteistä. Älä vain unohda ajaa sille `chmod`ia~

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

Kutsutaan tätä uutta teemaa nimellä... "glitch\_wall" (joo annoin omalleni tuon nimen, älkää dissatko, asioiden nimeäminen on vaikeaa). Olettaen, että meillä on noin 140 kuvaa, meidän täytyy muokata `template.script`-tiedostoa ja myös nimetä se uudelleen:

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

Meidän täytyy myös muokata `template.plymouth`-skriptiä hieman:
```
[Plymouth Theme]
Name=glitch_wall
Description=Cool discription here!
ModuleName=script

[script]
ImageDir=/usr/share/plymouth/themes/glitch_wall/
ScriptFile=/usr/share/plymouth/themes/glitch_wall/glitch_wall.script
```

Sinun täytyy myös poistaa kaikki roskatiedostot, kuten `splash.script` ja vanha `animation-boot.script`.
Siinä kaikki! Nyt sinun tarvitsee vain kopioida tämä kapistus sinne, minne muutkin teemat on tallennettu, ja loppu sujuu samalla tavalla kuin teeman valinta. 

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

## Yhteenveto

Oli kyllä hauskaa kustomoida bootsplash omaan kokoonpanoon. Onko ehdotuksia siitä, mitä minun pitäisi kustomoida seuraavaksi? Olen todella kiinnostunut kokeilemaan laatoittavia työpöytäympäristöjä (tiled DE), joten odotettavissa on postaus aiheesta tulevaisuudessa~!

Morjens!
