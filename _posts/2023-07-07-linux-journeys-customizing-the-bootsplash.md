---
layout: post
title: Linux Journeys - Customizing the bootsplash
tags:
- linux-journeys
- short-blog
- casual
- lifestyle
categories:
- Linux Journeys
date: 2023-07-07 18:42 +0530
---
Last night, being the weeb I am, I was watching [That Time I Got Reincarnated as a Slime](https://tensura.fandom.com/wiki/Tensei_Shitara_Slime_Datta_Ken_Wiki) and I found the `Great Sage` to be quite cool. istg those sound effects had me drooling. Like HOW DO YOU MAKE THEM SO GOOD?! Anyways, this also reminded me of Jarvis AND some cool stuff from The WatchDogs series, which eventually had me thinking... _How tf do people get these cool animations running on their systems, I mean... Linux probably has a way to customize **everything**... 🤔._ Next thing you know I was down the rabithole of "_ricing_" systems. 

The first thing I wanted to do was change the thing that's displayed whenever I boot into my system (which I later found out is a little something known as the _bootsplash animation/screen_). A quick google search directed me to a nifty tool called: [`plymouth`](https://wiki.debian.org/plymouth) that enables us to change the bootsplash and I quote:
> Provide eye-candy and a more professional presentation for scenarios where the default high-information text output might be undesirable.

(yeah right, quite a long winded and _professional_ way to say "make our systems look cooler so we can brag about it on reddit")

Now, I know that there's probably a googol plus articles online on how to do this... _but_ I'm gonna write one because it's something cool I learned :3

## Installing Prerequisites
 
Installing `plymouth` is quite straightforward for debian systems:

```shell-session
$ sudo apt install plymouth plymouth-themes

## If your fancy ass is using KDE:
$ sudo apt install plymouth-theme-breeze kde-config-plymouth
```

**NOTE**: You might also wanna install `ffmpeg` and some other utilities if you wish to make a custom bootsplash animation. 

## Setting the Bootsplash Theme

So, now that we have plymouth, we need the theme animation we wanna play. To our dismay, an MP4 file won't do. _Furthermore_ you cannot have a sound play (at least I could not figure out a way to do so 😭), hence the need for `ffmpeg` to create a custom animation thing, but imma get back to that later. [@adi1090x](https://github.com/adi1090x) has compiled a [very nice repository](https://github.com/adi1090x/plymouth-themes) of some animations. I settled on the [_Hexagon Dots Alt_](https://github.com/adi1090x/plymouth-themes/tree/master/pack_2/hexagon_dots_alt) animation from the second pack, here's what it looks like:

![Hexagon Dots Alt Animation Preview](/assets/gifs/hexagon_dots_alt.gif)

Here're the steps to setting this as your theme.
```shell-session
$ git clone https://github.com/adi1090x/plymouth-themes.git
$ cd plymouth-themes/

## Now we copy the theme over to /usr/share/plymouth/themes
## If you're NOT using a debian based OS, please just check some docs or something idk
$ sudo cp -r pack_2/hexagon_dots_alt /usr/share/plymouth/themes
```
There's a lot of guides that use the `update-alternative` route of setting up the theme, but honestly it did not work for me 90% of the time, and it's _way_ easier to use [`plymouth-set-default-theme`](https://manpages.org/plymouth-set-default-theme):
```shell-session
## To list themes:
$ sudo plymouth-set-default-theme --list

## To set the theme:
$ sudo plymouth-set-default-them -R hexagon_dots_alt
```

You can also use the following script (courtesy of [@adi1090x](https://github.com/adi1090x)) to see if the bootsplash has changed or not:
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

### Making a Custom Theme

I also tried to make a custom animation (honestly, it was kinda trash, but hey! it's something) using [this repository](https://github.com/jcklpe/Plymouth-Animated-Boot-Screen-Creator) as a guide. Here's how:

First clone the repo (duh!):
```shell-session
$ git clone https://github.com/jcklpe/Plymouth-Animated-Boot-Screen-Creator.git
$ cd Plymouth-Animated-Boot-Screen-Creator/
```

Next, just quickly remove all the PNG files and clear the `input` and `output` directories:
```shell-session
$ rm ./*.png
$ rm input/* ouput/*
```

All clean! Now, we wanna get some MP4/GIF/MOV/etc file that we can use to convert into a series of PNG files using `ffmpeg` (install it if you have not yet). Place the file into the `input` directory and if it's either a MP4/GIF file, use one of the scripts that the repo comes with. Just don't forget to `chmod` it~

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

Let's call this new theme... "glitch\_wall" (yes I called mine that please don't roast me, naming things is hard). Assuming that we have 140 images or so, we need to modify the `template.script` and also rename it:

```script
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

Now, we need to modify the `template.plymouth` script a bit:
```script
[Plymouth Theme]
Name=glitch_wall
Description=Cool discription here!
ModuleName=script

[script]
ImageDir=/usr/share/plymouth/themes/glitch_wall/
ScriptFile=/usr/share/plymouth/themes/glitch_wall/glitch_wall.script
```

You also need to remove all garbage files like `splash.script` and the old `animation-boot.script`.
That's all! Now all you need to do is copy this sucker over to where all the other themes are stored and the rest is the same as choosing the theme. 

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

## Conclusion

It sure was fun to customize the bootsplash for my setup. Any suggestions on what I should customize next? I'm really quite interested in trying out tiled DEs so expect a post about it in the future~!

Cheers!
