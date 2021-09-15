//******************************************************//
//*****************HELIUM MINER WATCHDOG*****************//
//*************************v2.1*************************//
//***************CREATED BY : FLEECEABLE****************//
//******************************************************//
//**********************CHANGELOG***********************//
//v1.1 - |30.08.21| - When problem with UI and next check everything is OK (also when in sync) notify user. 
//v1.2 - |31.08.21| - Updated error handling when miner IP is not responding
//v1.3 - |02.09.21| - FW version check bug fix. When new firmware, program continuously send notification.
//v2.0 - |07.09.21| - Added hotspot activity notification
//v2.1 - |08.09.21| - Bug fix. If received one reward for two witness then sum reward amount
//v3.0 - |16.09.21| - Added "/status" telegram command to get information about your miner. !!!npm i node-telegram-bot-api must be installed!!!


//************TELEGRAM SETTINGS************
const token = ''; 				//Telegram bot token
const chatId = '' 													//Chat or group id

//************MINER LOCAL NETWORK SETTINGS************
const enable_miner_check_system = true;											//Enable or disable miner local diagnostic check. 
const miner_ip_address = '192.168.1.229'; 										//Miner IP address
const block_height_back = 10; 													//How many blocks can miner be back from blockchain
const miner_check_time = 3; 													//Cyclical check time in minutes

//************MINERS REWARD NOTIFICATION SETTINGS************
const blockchain_check_time = 1; 												//Default 1 minute.
const enable_notification_system = true;										//Enable or disable miner(s) reward notifications
const miner_address = ['1a47J9QQc95',
						'11EqP9',
						'1NvHCGXMhX',
						'1Gye5W4qMZ4'];//Miner Blockchain addresses
const miner_nickname = ["[Voidu] ",
						"[Kalda] ",
						"[Valge] ",
						"[Tammsaare] "]; 											//Miner nicknames. This name is included in telegram notification					


//************!!!!!!!!!!!!!DO NOT EDIT BELOW THIS LINE!!!!!!!!!!!!************
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const https = require('https');

var MinerBlockHeight = 0;
var BlockchainBlockHeigt = 0;
var helpcallcheck;
var block_height_error;
var connecting_error;
var FW_version = '';
let helpvar = ['', ''];


const bot = new TelegramBot(token, {polling: true});
	bot.on('message', (msg) => {
		const chatId = msg.chat.id;
		//console.log(msg.text);
	  if (msg.text == '/status') {
		  checkminer();
		  helpcallcheck = 1;
		  bot.sendMessage(chatId, 'Give me a second. I will check it out...');
	  } 
	});


if (enable_miner_check_system == true) {
	sendMessage = 'Helium miner watchdog has been ACTIVATED...'
	console.log(sendMessage);
}
else {
	sendMessage = 'Helium miner watchdog has been DISABLED...'
	console.log(sendMessage);
}
if (enable_notification_system == true) {
	sendMessage2 = 'Miners activity notification has been ACTIVATED...' 
	console.log(sendMessage2);
}	
else {
	sendMessage2 = 'Miners activity notification is DISABLED' 
	console.log(sendMessage2);
}
bot.sendMessage(chatId, sendMessage);
bot.sendMessage(chatId, sendMessage2);


setInterval(function(){		
	checkminer();
},miner_check_time*60*1000);//x minutes delay before check again

	
setInterval(function(){	
	if (enable_notification_system == true) {
		console.log('Checking rewards...');
		for (let i = 0; i < miner_address.length; i++){
			
			let url = 'https://api.helium.io/v1/hotspots/' + miner_address[i] + '/activity?filter_types=';
			https.get(url,(res) => {
				let body = "";
				res.on("data", (chunk) => {
					body += chunk;
				});
				
				res.on("end", () => {
					//console.log(miner_nickname[i]);
					try {
						let json = JSON.parse(body);
						//console.log(json);
						//console.log(json.data.length);
						if (json.data.length >= 1) {
							if (json.data[0].type == 'rewards_v2') {
								let reward_amount = 0;
								if (helpvar[i] != json.data[0].hash) {
									for (ie = 0; ie < json.data[0].rewards.length; ie++){
										reward_amount = reward_amount + json.data[0].rewards[ie].amount;
									}
									helpvar[i] = json.data[0].hash;
									console.log(miner_nickname[i] + 'Received Mining Rewards: ' + (reward_amount/100000000).toFixed(3) + ' HNT' );
									sendMessage2 = miner_nickname[i] + 'Received Mining Rewards: ' + (reward_amount/100000000).toFixed(3) + ' HNT' ;
									https.get('https://api.telegram.org/bot'+ token + '/sendMessage?chat_id=' + chatId + '&text='+ sendMessage2);
								}	
							}
						}
					}
					catch (error) {
						console.error(error.message);
					};
				});
			
			}).on("error", (error) => {
				console.error(error.message);
				});

		};
		};

	},blockchain_check_time*60*1000);//x minutes delay before check again
	
function checkminer(){
	console.log('Checking miner status........');
		if (enable_miner_check_system == true) {
		let url = "http://" + miner_ip_address + "/?json=true";

		http.get(url,(res) => {
		let body = "";
		if (res.statusCode != 200) {
		  console.log("non-200 response status code:", res.statusCode);
		  console.log("for url:", url);
		  if (connecting_error != true) {
				console.log('There is problem to load local UI. Reboot your miner...');
				sendMessage = 'There is problem to load local UI. Reboot your miner...';
				https.get('https://api.telegram.org/bot'+ token + '/sendMessage?chat_id=' + chatId + '&text='+ sendMessage);
				connecting_error=true;
			}
			else {
				if (connecting_error != false) {
						console.log('Miner local UI is responsing...');
						sendMessage = 'Miner local UI is responsing... ';
						https.get('https://api.telegram.org/bot'+ token + '/sendMessage?chat_id=' + chatId + '&text='+ sendMessage);
						connecting_error=false;
					}	
				}
		  return;
		}
		res.on("data", (chunk) => {
			body += chunk;
		});

		res.on("end", () => {
			try {
				let json = JSON.parse(body);
				if (helpcallcheck ==1){
				sendMessage = 'Your miner blockchain height: [' + json.MH + '/' + json.BCH + "]%0a%0a" + 'Your miner FW version is: [' + json.FW + "]%0a%0a" + 'Last updated: [' + json.last_updated + ']';
					https.get('https://api.telegram.org/bot'+ token + '/sendMessage?chat_id=' + chatId + '&text='+ sendMessage);
					console.log('Your miner blockchain height ' + json.MH + '/' + json.BCH);
					helpcallcheck = 0;
				}else{
					if (json.MH < json.BCH-block_height_back) {
						if (block_height_error != true) {
							sendMessage = 'Miner status: ERROR! - Your miner blockchain height is back more than ' + block_height_back + ' blocks.' + ' Height Status: ' + json.MH + '/' + json.BCH;
							https.get('https://api.telegram.org/bot'+ token + '/sendMessage?chat_id=' + chatId + '&text='+ sendMessage);
							console.log('Miner status: ERROR! - Your miner blockchain height is back more than ' + block_height_back + ' blocks.' + ' Height Status: ' + json.MH + '/' + json.BCH);
							block_height_error=true;
						}
					}
					else{
						if (block_height_error != false) {
							console.log('Miner status: OK - Your miner is back on action.' + ' Height Status: ' + json.MH + '/' + json.BCH);
							sendMessage = 'Miner status: OK - Your miner is back on action.' + ' Height Status: ' + json.MH + '/' + json.BCH;
							https.get('https://api.telegram.org/bot'+ token + '/sendMessage?chat_id=' + chatId + '&text='+ sendMessage);
							block_height_error=false;
						}
					}
					
					if (FW_version == '') {
						FW_version = json.FW;
						console.log('Miner FW: - Your miner FW version is ' + json.FW);
						sendMessage = 'Miner FW: - Your miner FW version is ' + json.FW;
						https.get('https://api.telegram.org/bot'+ token + '/sendMessage?chat_id=' + chatId + '&text='+ sendMessage);
					}
					else {
						if (FW_version != json.FW) {
							FW_version = json.FW;
							console.log('Miner FW UPDATE: - Your miner FW version is updated to ' + json.FW);
							sendMessage = 'Miner FW UPDATE: - Your miner FW version is updated to ' + json.FW;
							https.get('https://api.telegram.org/bot'+ token + '/sendMessage?chat_id=' + chatId + '&text='+ sendMessage);
						}
					}
				}
			} catch (error) {
				console.error(error.message);
			};
		});

		}).on("error", (error) => {
			console.error(error.message);
			});
			};
		//console.log('Checking...');
}
