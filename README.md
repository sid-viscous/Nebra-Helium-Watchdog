# Nebra-Helium-Watchdog

If watchdog is useful for you, feel free to dip some HNT.

![image](https://user-images.githubusercontent.com/90242002/132324949-22135e10-5531-447a-a50b-f93de121b63f.png)

14faPbrrcdhNSG2EXiGuox4qkfcWNJmHmYYeSA8s8MvYcAeSxEE

This document describes how to keep an eye of your Nebra miner.

Basically it uses hardware (I used Raspberry Pi 3 model B) and operating system where you can run nodejs (You can run it on windows machine also but it needs to be on site 24/7 and running. Video how to use that with PC is here: https://youtu.be/H8iyiYbm3oQ ). Program checks cyclically if miner UI works and takes data from your miner to analyze if everything is okay. Notification is done via Telegram app (IOS and Android).

Here is an example: 

![image](https://user-images.githubusercontent.com/90242002/132312920-946ac422-9b8c-4180-b135-c6a88c61ae07.png) <br>

You will get four type of notifications:
1. Miner watchdog is activated. That means check service is started.
2. Miner block height is back more than X blocks. You can change it by yourself.
3. Miner firmware was updated.
4. Miner local UI is not responding. I usually wait 10-15 minutes and if miner status is not changed back to normal, I’ll do physical restart. This usually solves the problem.

By default program checks miner UI every 3 minutes.

## Telegram

Create a bot using BotFather. Here is video link how to do that:

https://youtu.be/XoryoE9V88E?t=104

Create a new group and add bot to your group.

Take a group id from browser:

![image](https://user-images.githubusercontent.com/90242002/132314917-2bcb191c-98be-4aa0-91a6-1d0933d51fd9.png)<br>

**If you cannot find group_id in the link. Follow these steps:**

1. Add your API token to the following url and navigate with browser.

[](https://api.telegram.org/bot<YourBOTToken>/getUpdates)

When you edit, it will look like this as an example <br>
https://api.telegram.org/bot123456789:jbd78sadvbdy63d37gda37bd8/getUpdates

2. Expected response: 

```json
{{"update_id":8393,"message":{"message_id":3,"from":{"id":7474,"first_name":"AAA"},"chat":{"id":<group_ID>,"title":""},"date":25497,"new_chat_participant":{"id":71,"first_name":"NAME","username":"YOUR_BOT_NAME"}}}
``` 

If you get response like this 

```json 
{"ok":true,"result":[]}
``` 

Remove the bot from the group and add it again. It will be fixed.

3. Group chat_id written after chat word `"chat":{"id":-1001234567891,"title"}}`


Test if bot is working with this command:

https://api.telegram.org/bot<BOT_TOKEN_HERE>/sendMessage?chat_id=<CHAT_ID_HERE>&text=Testing_bot

Change these values <BOT_TOKEN_HERE> and <CHAT_ID_HERE> in link and paste it in your browser.

Hit ENTER.

If you get the message in Telegram you are done in here and can go to change app.js file with notepad or notepad++.

##Code, modifications and installation

You need to change these lines:

![image](https://user-images.githubusercontent.com/90242002/132315153-d01b1a07-1ec0-4199-b2cb-372a4f50b017.png)

I’m using latest nodejs v16.8.0 and it works fine. 

Check this manual if you need step by step tutorial how to setup raspberry pi:

https://thisdavej.com/beginners-guide-to-installing-node-js-on-a-raspberry-pi/

When node is installed, copy app.js file to raspberry and run it (node app.js). There are many tutorials on how to do that. www.google.com is your best friend.

We want that code will execute automatically after raspberry pi restart or power failure.

I used PM2 (version 4 optionally uses Docker).

Here are the commands (link to help: https://stackoverflow.com/questions/13385029/automatically-start-forever-node-on-system-restart)

`sudo npm install pm2 -g` *--installs pm2*

`pm2 start app.js` *--starts application (make sure you are in same directory with app.js file)*

`pm2 list`*--shows your running application*

`pm2 startup` *--creates running service to your startup service*

After that you will see pm2 asking to manually run a command, copy and run that.<br>
  
`pm2 save` *--saves that process and executes that app.js process when startup.*

If you want to stop application then use:

`pm2 stop all` *--stops all applications (we have only one so you can use that command)</i>*
  
## v2.0

Added reward notification part. Change these inputs only: <br>
  * **const blockchain_check_time = 1;** - *Default 1 minute.*
  * **const enable_notification_system = true;** - *Enable or disable miner(s) reward notifications. If you want to disable, type false*
  * **const miner_address = ['11FCr9tda48JYBcxiVWf59QVG6eBf87LCZJHatYVj7d7J9QQc95',
                          '112Zu2reZjgMfTtsMCBRmEG6xvDBBTUPEgZkyjZmJt3TgYKSEqP9'];** - *Miner Blockchain addresses. You can find these on helium explorer. If you want notifications from only one miner then structure must be like this ['ADDRESS'];*
  * **const miner_nickname = ["[Voidu] ", "[Kalda] "];** - *Miner nicknames. This name is included in telegram notification*
  
You will get these type of notifications: <br>

![image](https://user-images.githubusercontent.com/90242002/132405957-a52299b8-a9ba-43c2-918d-372807eb1d9c.png)
  
## v3.0</h1>

Now it is possible to request miner status (blockchain height, FW version and when info was last updated).

You need to install **node-telegram-bot-api** with this command: `npm i node-telegram-bot-api`

https://www.npmjs.com/package/node-telegram-bot-api

![image](https://user-images.githubusercontent.com/90242002/133514600-010ae186-e9d5-435d-9ab3-d1e0ae18ee46.png)
	
In telegram type "/status" and bot will send you miner information...

![image](https://user-images.githubusercontent.com/90242002/133514806-3749c6e5-c996-45c4-af06-5d7c42769558.png)

## v4.0

Docker support added

As an alternative to running the bot using Node and pm2, the bot can be run in Docker.

This version also automatically downloads the dependencies for the application.

To run the code in Docker, modify the app settings as per the main instructions, and use the following command:

```shell
docker-compose up --build -d
```

This will build the image as set out in the `Dockerfile`, and run the image according to the instructions in the `docker-compose.yml` file.

If Docker is enabled on startup of your machine, then the container should be restarted after a power cycle of your machine.

	
