---
title: "Linux Journeys - ブートスプラッシュのカスタマイズ"
date: 2023-07-07
tags: [linux-journeys, linux]
description: "転スラに影響されてLinuxのricing（外観カスタマイズ）の沼にハマり、最終的にplymouthを導入・テーマ設定してカスタムブートスプラッシュを作ることになった話。"
---

昨晩、オタク全開で『[転生したらスライムだった件](https://tensura.fandom.com/wiki/Tensei_Shitara_Slime_Datta_Ken_Wiki)』を観ていたのですが、`Great Sage`（大賢者）がめちゃくちゃかっこいいなと思いまして。マジであの効果音には惚れ惚れしました。いやどうやってあんな最高の音作ってんだよ？！ ともかく、これを見ていてJarvisやWatchDogsシリーズのイケてる演出も思い出し、最終的にこう考えるようになりました… _一体どうやって自分のPCであんなかっこいいアニメーションを動かしてんだ？ ていうか… Linuxなら**あらゆるもの**をカスタマイズする方法が絶対あるはず… 🤔。_ 気づけばシステムの「_ricing_」という底なし沼にハマっていました。

最初にやりたかったのは、システムを起動するたびに表示される画面（後から_ブートスプラッシュ アニメーション／画面_と呼ばれるものだと知りました）を変更することでした。サクッとGoogle検索してみると、[`plymouth`](https://wiki.debian.org/plymouth)という気の利いたツールが見つかりました。これを使えばブートスプラッシュを変更できます。引用すると:
> デフォルトの情報量の多いテキスト出力が望ましくないシナリオにおいて、見た目の美しさとよりプロフェッショナルな表示を提供する。

（はいはい、「Redditで自慢できるようにシステムをかっこよく見せる」ってことを随分と回りくどく_プロっぽく_言っただけですね）

さて、これのやり方を解説した記事なんてネット上にグーゴル個くらいあるのは分かってます… _でも_ 面白いことを学べたので記事にしちゃいます :3

## 事前準備のインストール
 
Debian系システムなら`plymouth`のインストールは超簡単です:

```shell-session
$ sudo apt install plymouth plymouth-themes

## If your fancy ass is using KDE:
$ sudo apt install plymouth-theme-breeze kde-config-plymouth
```

**注意**: カスタムのブートスプラッシュアニメーションを作りたい場合は、`ffmpeg`やその他のユーティリティもインストールしておくといいかもしれません。

## ブートスプラッシュテーマの設定

さて、plymouthが入ったので、次は再生したいテーマアニメーションが必要です。残念ながらMP4ファイルそのままでは動きません。_さらに_音を鳴らすこともできません（少なくとも私にはその方法が分かりませんでした😭）。そのためカスタムアニメーションを作るのに`ffmpeg`が必要になるわけですが、これについては後ほど触れます。[@adi1090x](https://github.com/adi1090x) 氏がアニメーションをまとめた[とても素晴らしいリポジトリ](https://github.com/adi1090x/plymouth-themes)を公開しています。私は2つ目のパックにある[_Hexagon Dots Alt_](https://github.com/adi1090x/plymouth-themes/tree/master/pack_2/hexagon_dots_alt)アニメーションに決めました。見た目はこんな感じです:

![Hexagon Dots Alt Animation Preview](/assets/gifs/hexagon_dots_alt.gif)

これをテーマとして設定する手順は以下の通りです。
```shell-session
$ git clone https://github.com/adi1090x/plymouth-themes.git
$ cd plymouth-themes/

## Now we copy the theme over to /usr/share/plymouth/themes
## If you're NOT using a debian based OS, please just check some docs or something idk
$ sudo cp -r pack_2/hexagon_dots_alt /usr/share/plymouth/themes
```
テーマの設定に`update-alternative`を使うガイドがたくさんありますが、正直私の環境では9割方うまく動かず、[`plymouth-set-default-theme`](https://manpages.org/plymouth-set-default-theme)を使った方が_遥かに_簡単です:
```shell-session
## To list themes:
$ sudo plymouth-set-default-theme --list

## To set the theme:
$ sudo plymouth-set-default-them -R hexagon_dots_alt
```

また、ブートスプラッシュが切り替わったかどうかを確認するために、以下のスクリプト（[@adi1090x](https://github.com/adi1090x) 氏に感謝）を使用することもできます:
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

### カスタムテーマの作成

[このリポジトリ](https://github.com/jcklpe/Plymouth-Animated-Boot-Screen-Creator)を参考にして、カスタムアニメーションの自作にも挑戦してみました（正直クオリティはイマイチでしたが、まあ形にはなりました！）。やり方はこちら:

まずはリポジトリをクローンします（当然ですね！）：
```shell-session
$ git clone https://github.com/jcklpe/Plymouth-Animated-Boot-Screen-Creator.git
$ cd Plymouth-Animated-Boot-Screen-Creator/
```

次に、PNGファイルをすべてサクッと削除し、`input`ディレクトリと`output`ディレクトリを空にします:
```shell-session
$ rm ./*.png
$ rm input/* ouput/*
```

綺麗になりました！次に、`ffmpeg`（まだ入れてなければインストールしてください）を使って一連のPNGファイルに変換するためのMP4/GIF/MOVなどのファイルを用意します。そのファイルを`input`ディレクトリに配置し、MP4やGIFファイルの場合はリポジトリに付属しているスクリプトのいずれかを使います。`chmod`で実行権限を付与するのをお忘れなく〜

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

この新しいテーマの名前を…「glitch\_wall」としましょう（ええ、私はそう名付けました。ネーミングセンスを叩かないでください、名前をつけるのって難しいんです）。画像が140枚ほどあると仮定して、`template.script`を修正し、名前も変更する必要があります:

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

また、`template.plymouth`スクリプトも少し修正する必要があります:
```
[Plymouth Theme]
Name=glitch_wall
Description=Cool discription here!
ModuleName=script

[script]
ImageDir=/usr/share/plymouth/themes/glitch_wall/
ScriptFile=/usr/share/plymouth/themes/glitch_wall/glitch_wall.script
```

また、`splash.script`や古い`animation-boot.script`などの不要なファイルもすべて削除する必要があります。
これで完了です！あとはこいつを他のテーマが保存されている場所にコピーするだけで、残りの手順はテーマを選択するときと同じです。

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

## おわりに

自分の環境のブートスプラッシュをカスタマイズするのは本当に楽しかったです。次にカスタマイズすべきおすすめがあれば教えてください！タイル型DE（デスクトップ環境）を試すのにもかなり興味があるので、今後の記事をお楽しみに〜！

それでは！
