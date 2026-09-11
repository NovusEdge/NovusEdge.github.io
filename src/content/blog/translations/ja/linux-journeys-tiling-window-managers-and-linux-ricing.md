---
title: "Linux Journeys - タイリングウィンドウマネージャーとLinux Ricing"
date: 2023-09-07
tags: [linux-journeys, linux]
description: "Ricingの沼にハマった話の続き。初めて組んだタイリングウィンドウマネージャーのriceについて、i3、Polybar、Rofi、compton、kitty、zshのセットアップを紹介します。"
---

さてさて… 今回は[前回のLinux Journeysの記事](https://novusedge.github.io/posts/linux-journeys-customizing-the-bootsplash/)のちょっとした続きです。楽しんでもらえたら嬉しいです〜

TL;DR: dotfilesだけ見たい方はこちらをどうぞ: https://github.com/NovusEdge/dotfiles

![](/assets/img/LJ-TWM-01.png)
![](/assets/img/LJ-TWM-02.png)
![](/assets/img/LJ-TWM-03.png)
![](/assets/img/LJ-TWM-04.png)

| コンポーネント | ツール |
|-----------|------|
| WM | i3 |
| Bar | Polybar |
| Menu | Rofi |
| Compositor | compton |
| Terminal | kitty |
| Shell | zsh |
| File Manager | Thunar |

***

先週、タイリングウィンドウマネージャーを試してみることにしました。Linuxのricingが大好きで、自分でも挑戦してみたかったんです。すごく楽しかったですが、使いこなせていると胸を張って言えるようになるには、まだまだ道のりが長そうです。

## The Rice

使うツールの選定に大したこだわりはありませんでした。WMに関しては、シンプルに「Easiest tiling window manager」で検索して、多くの人が `i3` をおすすめしていたのでそれに決めました。色々カスタマイズしたものの、キーバインドを覚えるのすらまだまだ先の話です（いまだにキーバインドを調べ直してばかりです）。

他のコンポーネントに関しては、完全に試行錯誤の連続でした。いろいろ試してみて、気に入ったものや自分にしっくりきたものを採用した感じです >.>
これ系に興味がある人には、以下のサイトを_超_おすすめします:
- [r/unixporn](https://www.reddit.com/r/unixporn/): みんなが自慢のriceを投稿している場所です。ぜひチェックしてみてください！
- [Jie Fang's Guide to Ricing](https://jie-fang.github.io/blog/basics-of-ricing)
- [Rizonrice's blog on this stuff](https://rizonrice.github.io/resources)
- [Lordpipe's obscure tutorials](https://lordofpipes.github.io/obscure-tutorials/docs/linux-tutorials/fedora-snapper/): どうやってこの神チュートリアル集にたどり着いたのか覚えてないですが、マジで宝の山です


まぁ、今回はこんなところですかね。読んでくれてありがとうございました〜
