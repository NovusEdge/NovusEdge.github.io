---
title: "Linux 探索之旅 - 平铺式窗口管理器与 Linux Ricing"
date: 2023-09-07
tags: [linux-journeys, linux]
description: "掉入 ricing 坑之后的后续篇，带你了解初次尝试平铺式窗口管理器 rice 所用到的 i3、Polybar、Rofi、compton、kitty 和 zsh 配置。"
---

好嘞。所以……这算是[上一篇 Linux 探索之旅博文](https://novusedge.github.io/posts/linux-journeys-customizing-the-bootsplash/)的后续吧。希望大家喜欢～

TL;DR：如果你只对 dotfiles 感兴趣，指路这里：https://github.com/NovusEdge/dotfiles

![](/assets/img/LJ-TWM-01.png)
![](/assets/img/LJ-TWM-02.png)
![](/assets/img/LJ-TWM-03.png)
![](/assets/img/LJ-TWM-04.png)

| 组件 | 工具 |
|-----------|------|
| WM | i3 |
| Bar | Polybar |
| 菜单 | Rofi |
| 混成器 | compton |
| 终端 | kitty |
| Shell | zsh |
| 文件管理器 | Thunar |

***

上周，我决定尝试一下平铺式窗口管理器。我对 Linux ricing 毫无抵抗力，一直想亲自动手试试看。整个过程非常好玩，但我敢肯定，要想真正自称用得顺手，我还有很长的一段路要走。

## 本次 Rice

关于我是怎么选定所用组件的，其实真没费太多周折。至于 WM，我只是简单搜了下：“Easiest tiling window manager”，发现很多人都推荐 `i3`，于是我就选了它。我做了不少微调，但离真正记住快捷键还差得远（我老得去翻自己的快捷键设置）。

至于其他组件，纯粹是不断试错的过程。我试了一大堆东西，最后挑了自己喜欢的或者用着顺手的 >.>
我_强烈_建议对这些感兴趣的小伙伴去逛逛下面这些地方：
- [r/unixporn](https://www.reddit.com/r/unixporn/)：大家都在这里晒自己的 rice 作品，快去看看吧！
- [Jie Fang 的 Ricing 指南](https://jie-fang.github.io/blog/basics-of-ricing)
- [Rizonrice 关于这方面的博客](https://rizonrice.github.io/resources)
- [Lordpipe 的冷门教程库](https://lordofpipes.github.io/obscure-tutorials/docs/linux-tutorials/fedora-snapper/)：我也不知道自己是怎么偶然发现这位宝藏博主的教程库的，但真的太神了


好啦，这篇大概就这么多了。感谢阅读～
