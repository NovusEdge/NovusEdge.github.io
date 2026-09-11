---
title: "Linux Journeys - Tiling Window Managerit ja Linux-ricing"
date: 2023-09-07
tags: [linux-journeys, linux]
description: "Jatkoa ricing-kaninkoloon: käydään läpi i3-, Polybar-, Rofi-, compton-, kitty- ja zsh-setuppi ensimmäisen tiling window manager -ricen takana."
---

Okei. Eli... Tämä on tavallaan jatkopostaus [viimeisimmälle Linux Journeys -kirjoitukselle](https://novusedge.github.io/posts/linux-journeys-customizing-the-bootsplash/). Toivottavasti tykkäät~

TL;DR: Jos sinua kiinnostavat vain dotfilet, tässä ole hyvä: https://github.com/NovusEdge/dotfiles

![](/assets/img/LJ-TWM-01.png)
![](/assets/img/LJ-TWM-02.png)
![](/assets/img/LJ-TWM-03.png)
![](/assets/img/LJ-TWM-04.png)

| Komponentti | työkalu |
|-----------|------|
| WM | i3 |
| Bar | Polybar |
| Menu | Rofi |
| Compositor | compton |
| Terminal | kitty |
| Shell | zsh |
| File Manager | Thunar |

***

Viime viikolla päätin antaa mahdollisuuden tiling window managereille. Olen heikkona Linux-ricingiin ja halusin kokeilla omia taitojani sen parissa. Se oli tosi hauskaa, mutta minulla on varmasti vielä PITKÄ matka ennen kuin voin väittää olevani oikeasti hyvä käyttämään niitä. 

## The Rice

Valintaprosessini ei ollut kovin kummoinen. WM:n kohdalla hain vain: "Easiest tiling window manager" ja huomasin monien suosittelevan `i3`:a, joten valitsin sen. Tein paljon säätöjä, mutta olen vielä kaukana siitä, että edes muistaisin pikanäppäimet (joudun jatkuvasti tarkistamaan näppäinyhdistelmäni). 

Muiden komponenttien osalta kyse oli puhtaasta yrityksestä ja erehdyksestä. Kokeilin kaikenlaista ja käytin sitä, mistä pidin ja/tai mikä toimi minulle >.>
Suosittelen _lämpimästi_ aiheesta kiinnostuneita tsekkaamaan seuraavat paikat:
- [r/unixporn](https://www.reddit.com/r/unixporn/): Ihmiset esittelevät ricejään täällä, käy tsekkaamassa!
- [Jie Fang's Guide to Ricing](https://jie-fang.github.io/blog/basics-of-ricing)
- [Rizonricen blogi aiheesta](https://rizonrice.github.io/resources)
- [Lordpipen obscure tutorials](https://lordofpipes.github.io/obscure-tutorials/docs/linux-tutorials/fedora-snapper/): En tiedä miten törmäsin tämän tyypin opashelmiin, mutta tämä on silkkaa KULTAA


No, siinäpä kai kaikki tältä erää. Kiitos lukemisesta~
