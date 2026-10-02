---
title: "Linux Journeys - Tiling Window Managers och Linux-ricing"
date: 2023-09-07
tags: [linux-journeys, linux]
description: "En uppföljning om ricing-kaninhålet, med en genomgång av setupen med i3, Polybar, Rofi, compton, kitty och zsh bakom min allra första tiling window manager-rice."
---

Okej. Så... Det här är typ ett uppföljningsinlägg till [förra Linux Journeys-inlägget](https://novusedge.github.io/posts/linux-journeys-customizing-the-bootsplash/). Hoppas du gillar det~

TL;DR: Om du bara är ute efter mina dotfiles så finns de här: https://github.com/NovusEdge/dotfiles

![](/assets/img/LJ-TWM-01.png)
![](/assets/img/LJ-TWM-02.png)
![](/assets/img/LJ-TWM-03.png)
![](/assets/img/LJ-TWM-04.png)

| Komponent | Verktyg |
|-----------|------|
| WM | i3 |
| Bar | Polybar |
| Meny | Rofi |
| Compositor | compton |
| Terminal | kitty |
| Shell | zsh |
| Filhanterare | Thunar |

***

Förra veckan bestämde jag mig för att ge tiling window managers en chans. Jag är svag för Linux-ricing och ville testa på att göra just det. Det var riktigt kul, men jag har definitivt en LÅNG väg kvar innan jag faktiskt kan påstå att jag är bra på att använda dem. 

## Min rice

Det fanns inte direkt någon genomtänkt process bakom hur jag valde vad jag använde. För WM sökte jag helt enkelt på: "Easiest tiling window manager" och såg att många rekommenderar `i3`, så det fick det bli. Jag gjorde en hel del tweaks, men jag har fortfarande långt kvar till att ens komma ihåg kortkommandona (jag måste hela tiden kolla upp mina keybindings). 

När det gäller de andra komponenterna var det ren trial and error. Jag testade en massa grejer och använde det jag gillade och/eller det som funkade för mig >.>
Jag rekommenderar _varmt_ alla som är intresserade av sånt här att spana in några av följande ställen:
- [r/unixporn](https://www.reddit.com/r/unixporn/): Här visar folk upp sina rices, in och kika!
- [Jie Fangs guide till ricing](https://jie-fang.github.io/blog/basics-of-ricing)
- [Rizonrices blogg om det här](https://rizonrice.github.io/resources)
- [Lordpipes obskyra tutorials](https://lordofpipes.github.io/obscure-tutorials/docs/linux-tutorials/fedora-snapper/): Jag vet inte hur jag snubblade över den här personens samling av tutorials, men den är GULD


Jaja, det var nog allt för den här gången. Tack för att du läste~
