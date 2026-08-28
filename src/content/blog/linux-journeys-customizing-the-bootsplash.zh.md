---
title: "Linux 之旅 - 自定义 bootsplash 开机画面"
date: 2023-07-07
tags: [linux-journeys, linux]
description: "一次受《关于我转生变成史莱姆这档事》（Tensura）启发的 Linux 桌面美化（ricing）折腾之旅，最终通过安装和配置 plymouth 主题实现了自定义开机动画。"
---

昨晚，作为老二次元的我正在看《[关于我转生变成史莱姆这档事](https://tensura.fandom.com/wiki/Tensei_Shitara_Slime_Datta_Ken_Wiki)》，觉得里面的“`大贤者`”简直帅炸了。我发誓那些音效听得我口水直流，到底是怎么做得这么带感的？！话说回来，这也让我想起了 Jarvis 以及《看门狗》（WatchDogs）系列里的一些炫酷玩意儿，最终让我陷入了沉思……_别人到底是怎么在系统里跑这些酷炫动画的？我是说……Linux 应该有办法自定义**一切**才对……🤔。_ 紧接着，我就一头扎进了系统“_美化（ricing）_”的无底洞中。

我想做的第一件事，就是修改每次开机进入系统时显示的内容（后来我才知道这玩意儿叫 _bootsplash 开机动画/画面_）。在 Google 上一通狂搜后，我找到了一个很棒的工具：[`plymouth`](https://wiki.debian.org/plymouth)，它可以让我们修改 bootsplash，引用官方的原话：
> 在默认的高信息量文本输出可能不太适用的场景下，提供赏心悦目的视觉效果和更专业的展示外观。

（行吧，这不过是用很长很_专业_的措辞来表达“让我们的系统看起来更酷，好去 reddit 上装 X”罢了）

我知道网上可能已经有成千上万篇关于这个主题的文章了……_但是_我还是想写一篇，因为这是我学到的很酷的新东西 :3

## 安装前置依赖
 
在 Debian 系统上安装 `plymouth` 非常简单：

```shell-session
$ sudo apt install plymouth plymouth-themes

## If your fancy ass is using KDE:
$ sudo apt install plymouth-theme-breeze kde-config-plymouth
```

**注意**：如果你想制作自定义的 bootsplash 动画，可能还需要安装 `ffmpeg` 以及其他一些实用工具。

## 设置 Bootsplash 主题

现在我们装好了 plymouth，接下来需要找到想要播放的主题动画。让人头秃的是，直接放个 MP4 文件可不行。_此外_，你还不能播放声音（至少我没琢磨出怎么搞 😭），所以才需要借助 `ffmpeg` 来制作自定义动画序列帧，不过这个我待会儿再说。[@adi1090x](https://github.com/adi1090x) 整理了一个[非常棒的动画仓库](https://github.com/adi1090x/plymouth-themes)。我挑中了第二个合集里的 [_Hexagon Dots Alt_](https://github.com/adi1090x/plymouth-themes/tree/master/pack_2/hexagon_dots_alt) 动画，效果如下：

![Hexagon Dots Alt 动画预览](/assets/gifs/hexagon_dots_alt.gif)

将其设置为主题的步骤如下。
```shell-session
$ git clone https://github.com/adi1090x/plymouth-themes.git
$ cd plymouth-themes/

## Now we copy the theme over to /usr/share/plymouth/themes
## If you're NOT using a debian based OS, please just check some docs or something idk
$ sudo cp -r pack_2/hexagon_dots_alt /usr/share/plymouth/themes
```
网上有很多教程都是通过 `update-alternative` 的方式来设置主题，但老实说，这方法在我这儿有 90% 的概率会翻车，直接使用 [`plymouth-set-default-theme`](https://manpages.org/plymouth-set-default-theme) 显然要_轻松得多_：
```shell-session
## To list themes:
$ sudo plymouth-set-default-theme --list

## To set the theme:
$ sudo plymouth-set-default-them -R hexagon_dots_alt
```

你还可以使用下面这个脚本（由 [@adi1090x](https://github.com/adi1090x) 提供）来测试 bootsplash 是否已经成功更改：
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

### 制作自定义主题

我还参考了[这个仓库](https://github.com/jcklpe/Plymouth-Animated-Boot-Screen-Creator)，尝试自己做了一个自定义动画（老实说做出来有点糙，但嘿！好歹能用）。制作方法如下：

首先克隆这个仓库（废话！）：
```shell-session
$ git clone https://github.com/jcklpe/Plymouth-Animated-Boot-Screen-Creator.git
$ cd Plymouth-Animated-Boot-Screen-Creator/
```

接下来，快速删掉所有的 PNG 文件，并清空 `input` 和 `output` 目录：
```shell-session
$ rm ./*.png
$ rm input/* ouput/*
```

搞定，全清干净了！现在，我们需要找一个 MP4/GIF/MOV 之类的视频/动图文件，以便使用 `ffmpeg` 将其转换为一系列 PNG 图片（还没装的话赶紧去装）。把文件放进 `input` 目录；如果是 MP4/GIF 文件，可以直接使用仓库自带的脚本。别忘了给它赋予执行权限 `chmod` 哟~

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

我们把这个新主题命名为……“glitch\_wall”（没错我就叫这名字，求别吐槽，起名字真的好难）。假设我们转换出了 140 张左右的图片，就需要修改 `template.script` 并将其重命名：

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

我们还需要稍微修改一下 `template.plymouth` 脚本：
```
[Plymouth Theme]
Name=glitch_wall
Description=Cool discription here!
ModuleName=script

[script]
ImageDir=/usr/share/plymouth/themes/glitch_wall/
ScriptFile=/usr/share/plymouth/themes/glitch_wall/glitch_wall.script
```

你还需要把像 `splash.script` 和旧的 `animation-boot.script` 这类无用文件统统删掉。
大功告成！现在你只需要把这个小家伙复制到其他主题存放的目录中，剩下的步骤就和选择普通主题一样了。

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

## 结语

为我的配置自定义 bootsplash 真的很有意思。大家对我接下来该折腾美化什么有什么建议吗？我对平铺式桌面环境（tiled DE）超级感兴趣，敬请期待后续相关的文章吧~！

回见！
