//******************************************************//
//*****************HELIUM MINER WATCHDOG*****************//
//*************************v3.1*************************//
//***************CREATED BY : FLEECEABLE****************//
//******************************************************//
//**********************CHANGELOG***********************//
//v1.1 - |30.08.21| - When problem with UI and next check everything is OK (also when in sync) notify user.
//v1.2 - |31.08.21| - Updated error handling when miner IP is not responding
//v1.3 - |02.09.21| - FW version check bug fix. When new firmware, program continuously send notification.
//v2.0 - |07.09.21| - Added hotspot activity notification
//v2.1 - |08.09.21| - Bug fix. If received one reward for two witness then sum reward amount
//v3.0 - |16.09.21| - Added "/status" telegram command to get information about your miner. !!!npm i node-telegram-bot-api must be installed!!!
//v3.1 - |23.09.21| - Added "/1";"/7";"/14";"/30"  telegram commands to get information about your account earnings. Also "/status" will show now a little more information

//************TELEGRAM SETTINGS************
const token = '45lyr534534543gfgdgfdg'; 					//Telegram bot token
const chatId = '-11433454541' 						//Chat or group id

//************MINERS NOTIFICATION SETTINGS************
const arrMiners = [
	{
		'MinerNickname': '[Office]',					//Miner nickname what is also implemented in telegram message
		'PublicAddress': '12345667xiVWf5fsg6eBf87LCZJfdgdfgd7J9gdfg5',	//Miner public address (used to check rewards)
		'MinerLocalIP': '',						//Miner local IP address or ddns address. If you use ddns make sure you forward 80 port
		'MinerWatchdog': 'true',					//Activates or deactivates miner health check. If local IP is empty just change true to false
		'RewardCheck': 'true',						//Activates or deactivates miner reward check. If any earnings then notification is sent to telegram. To disable just change true to false
	},
	{
		'MinerNickname': '[House]',
		'PublicAddress': '123456TtsMCBdgfddgdt3TgYdfgdEqP9',
		'MinerLocalIP': '',
		'MinerWatchdog': 'true',
		'RewardCheck': 'true',
	},
	{
		'MinerNickname': '[Friend 1]',
		'PublicAddress': 'qh7zAGBGcFUji3yXAgUoM1yC2zQu',
		'MinerLocalIP': '',
		'MinerWatchdog': 'true',
		'RewardCheck': 'true',
	},
	{
		'MinerNickname': '[Friend 2]',
		'PublicAddress': 'v2qRStTKQ3udShCs7p6snn5r9XdNvHCGXMhX',
		'MinerLocalIP': '',
		'MinerWatchdog': 'true',
		'RewardCheck': 'true',
	},
	{
		'MinerNickname': '[Friend 3]',
		'PublicAddress': 'Ex6RJBCgpZzkdkeAPPHuKvr5i5W4q',
		'MinerLocalIP': '',
		'MinerWatchdog': 'true',
		'RewardCheck': 'true',
	}
];

const AccountAddress = '123435hNSG245644q54654s8MvYcAeSxEE';			//Public account address. Then you can use "/1"; "/7" etc commands to check 1 day, 7 day etc earning. 

//************TIME SETTINGS************

const block_height_back = 10; 						//How many blocks can miner be back from blockchain to send notification [Default:10]
const miner_check_time = 5; 							//Cyclical miner check time in minutes [Default: 5]
const RewardCheckTime = 3; 							//Reward check time in minutes [Default: 3]


//************!!!!!!!!!!!!!DO NOT EDIT BELOW THIS LINE!!!!!!!!!!!!************
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const https = require('https');

var MinerBlockHeight = 0;
var BlockchainBlockHeigt = 0;
var helpcallcheck;
var block_height_error = [];
var connecting_error = [];
var FW_version = [];
let helpvar = ['', ''];
var rewardtime = 0;

let today = new Date();
var time
let oraclecurrentprice = 0;

for (let o = 0; o < arrMiners.length; o++){
	FW_version[o] = '';
}

function gettime(){
	let today = new Date();
	if (today.getMinutes() < 10){
		time = today.getHours() + ":0" + today.getMinutes();
	}
	else{
		time = today.getHours() + ":" + today.getMinutes();
	}
}

//Telegram polling
const bot = new TelegramBot(token, {polling: true});
	bot.on('message', (msg) => {
		const chatId = msg.chat.id;
		//console.log(msg.text);
	  if (msg.text == '/status') {
		  checkminer();
		  helpcallcheck = 1;
		  //bot.sendMessage(chatId, 'Give me a second. I will check it out...');
	  }
	  else if (msg.text == '/1'){
		rewardtime = 1;
		getoracleprice()
		//rewardssumcheck()
	  }
	  else if (msg.text == '/7'){
		rewardtime = 7;
		getoracleprice()
		//rewardssumcheck()
	  }
	  else if (msg.text == '/14' ){
		rewardtime = 14;
		getoracleprice()
		//rewardssumcheck()
	  }
	  else if (msg.text == '/30'){
		rewardtime = 30;
		getoracleprice()
		//rewardssumcheck()
	  }
	});

gettime();
bot.sendMessage(chatId, 'Watchdog started...');
console.log("[" + time + "] - " + 'Watchdog started...');



function rewardssumcheck(){
	let url = 'https://api.helium.io/v1/accounts/' + AccountAddress + '/rewards/sum?min_time=-' + rewardtime + "%20day&bucket=day";
	//console.log(url);
	https.get(url,(res) => {
		let body = "";
		res.on("data", (chunk) => {
			body += chunk;
		});

		res.on("end", () => {
			try {
				let json = JSON.parse(body);
				//console.log(json.data);
				let periodrewards = 0;
				if (json.data) {
					for (let i = 0; i < json.data.length; i++){
						periodrewards = periodrewards + json.data[i].total;
					};					
					let sendMessage3 = rewardtime + ' DAY - Account total mining rewards : ' + (periodrewards).toFixed(3) + ' HNT' + ' (' + (oraclecurrentprice * periodrewards).toFixed(2) + '$)'
					https.get('https://api.telegram.org/bot'+ token + '/sendMessage?chat_id=' + chatId + '&text='+ sendMessage3);
					console.log("[" + time + "] - " + rewardtime + " DAY - Account Total Mining Rewards : " + (periodrewards).toFixed(3) + ' HNT');
				};
			} 
			catch (error) {
				console.log(error);
				console.log("[" + time + "] - " + 'Helium Explorer API connection error. Please try again later...');
			};
		});

	}).on("error", (error) => {
		//console.error(error.message);
		console.log("[" + time + "] - " + 'Helium Explorer API connection error. Please try again later...');
	});
};


function getoracleprice(){
	let url = 'https://api.helium.io/v1/oracle/prices/current';
	https.get(url,(res) => {
		let body = "";
		res.on("data", (chunk) => {
			body += chunk;
		});

		res.on("end", () => {
			try {
				let json = JSON.parse(body);
				if (json.data) {
					oraclecurrentprice =  (json.data.price/100000000);
					rewardssumcheck()
				};
			} 
			catch (error) {
				console.log(error);
				console.log("[" + time + "] - " + 'Helium Explorer API connection error. Please try again later...');
			};
		});

	}).on("error", (error) => {
		//console.error(error.message);
		console.log("[" + time + "] - " + 'Helium Explorer API connection error. Please try again later...');
	});
	
};

setInterval(function(){
	checkminer();
},miner_check_time*60*1000);//x minutes delay before check again


setInterval(function(){
	gettime();
	console.log("[" + time + "] - " + 'Checking rewards...');
	for (let i = 0; i < arrMiners.length; i++){
		if (arrMiners[i].RewardCheck == 'true') {
			let url = 'https://api.helium.io/v1/hotspots/' + arrMiners[i].PublicAddress + '/activity?filter_types=';
			https.get(url,(res) => {
				let body = "";
				res.on("data", (chunk) => {
					body += chunk;
				});

				res.on("end", () => {
					try {
						let json = JSON.parse(body);
						if (json.data.length >= 1) {
							if (json.data[0].type == 'rewards_v2') {
								let reward_amount = 0;
								if (helpvar[i] != json.data[0].hash) {
									for (ie = 0; ie < json.data[0].rewards.length; ie++){
										reward_amount = reward_amount + json.data[0].rewards[ie].amount;
									};
									helpvar[i] = json.data[0].hash;
									console.log("[" + time + "] - " + arrMiners[i].MinerNickname + ' Received Mining Rewards: ' + (reward_amount/100000000).toFixed(3) + ' HNT' );
									sendMessage2 =arrMiners[i].MinerNickname + ' Received Mining Rewards: ' + (reward_amount/100000000).toFixed(3) + ' HNT' ;
									https.get('https://api.telegram.org/bot'+ token + '/sendMessage?chat_id=' + chatId + '&text='+ sendMessage2);
								};
							};
						};
					} 
					catch (error) {
						console.log("[" + time + "] - " + 'Helium Explorer API connection error. Will try again later...');
					};
				});

			}).on("error", (error) => {
				//console.error(error.message);
				console.log("[" + time + "] - " + 'Helium Explorer API connection error. Will try again later...');
			});
		};
	};
},RewardCheckTime*60*1000);//x minutes delay before check again

function checkminer(){
	gettime();
	console.log("[" + time + "] - " + 'Checking miner status...');
	for (let i = 0; i < arrMiners.length; i++){
		
		if (arrMiners[i].MinerWatchdog == 'true' && arrMiners[i].MinerLocalIP !='') {
			let url = "http://" + arrMiners[i].MinerLocalIP + "/?json=true";
			http.get(url,(res) => {
				let body = "";
				if (res.statusCode != 200) {
					if (connecting_error[i] != true) {
						console.log("[" + time + "] - " + arrMiners[i].MinerNickname + ' There is problem to load local UI. Reboot your miner...');
						sendMessage = arrMiners[i].MinerNickname + ' There is problem to load local UI. Reboot your miner...';
						https.get('https://api.telegram.org/bot'+ token + '/sendMessage?chat_id=' + chatId + '&text='+ sendMessage);
						connecting_error[i]=true;
					}
					else {
						if (connecting_error[i] != false) {
								console.log("[" + time + "] - " + arrMiners[i].MinerNickname + ' Miner local UI is responsing...');
								sendMessage = arrMiners[i].MinerNickname + ' Miner local UI is responsing... ';
								https.get('https://api.telegram.org/bot'+ token + '/sendMessage?chat_id=' + chatId + '&text='+ sendMessage);
								connecting_error[i]=false;
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
							sendMessage = arrMiners[i].MinerNickname + '%0aHeight Status: ' + json.MH + '/' + json.BCH + '%0aFW version: ' + json.FW + '%0aMiner Relayed: ' + json.MR + '%0aLast updated: ' + json.last_updated;
							https.get('https://api.telegram.org/bot'+ token + '/sendMessage?chat_id=' + chatId + '&text='+ sendMessage );
							console.log("[" + time + "] - " + arrMiners[i].MinerNickname + ' Height Status: [' + json.MH + '/' + json.BCH + "] | " + 'FW version: [' + json.FW + "] | " +'Miner Relayed: [' + json.MR + '] | '+  'Last updated: [' + json.last_updated + ']');
						}
						else {
							if (json.MH < json.BCH-block_height_back) {
								if (block_height_error[i] != true) {
									sendMessage = arrMiners[i].MinerNickname + '%0aMiner status: ERROR! - Your miner blockchain height is back more than ' + block_height_back + ' blocks.' + ' Height Status: ' + json.MH + '/' + json.BCH;
									https.get('https://api.telegram.org/bot'+ token + '/sendMessage?chat_id=' + chatId + '&text='+ sendMessage);
									console.log("[" + time + "] - " + arrMiners[i].MinerNickname + ' Miner status: ERROR! - Your miner blockchain height is back more than ' + block_height_back + ' blocks.' + ' Height Status: ' + json.MH + '/' + json.BCH);
									block_height_error[i]=true;
								}
							}								
							else {
								if (block_height_error[i] != false) {
									console.log("[" + time + "] - " + arrMiners[i].MinerNickname + ' Miner status: OK - Your miner is back on action.' + ' Height Status: ' + json.MH + '/' + json.BCH);
									sendMessage = arrMiners[i].MinerNickname + '%0aMiner status: OK - Your miner is back on action.' + ' Height Status: ' + json.MH + '/' + json.BCH;
									https.get('https://api.telegram.org/bot'+ token + '/sendMessage?chat_id=' + chatId + '&text='+ sendMessage);
									block_height_error[i]=false;
								}
							}
						}
						if (FW_version[i] == '') {
							FW_version[i] = json.FW;
							//console.log("[" + time + "] - " + arrMiners[i].MinerNickname + ' Your miner FW version is: ' + json.FW);
							sendMessage = arrMiners[i].MinerNickname + ' Miner FW: - Your miner FW version is ' + json.FW;
							//https.get('https://api.telegram.org/bot'+ token + '/sendMessage?chat_id=' + chatId + '&text='+ sendMessage);
						}
						else {
							if (FW_version[i] != json.FW) {
								FW_version[i] = json.FW;
								console.log("[" + time + "] - " + arrMiners[i].MinerNickname +' Miner FW UPDATE: - Your miner FW version is updated to ' + json.FW);
								sendMessage = arrMiners[i].MinerNickname +' Miner FW UPDATE: - Your miner FW version is updated to ' + json.FW;
								https.get('https://api.telegram.org/bot'+ token + '/sendMessage?chat_id=' + chatId + '&text='+ sendMessage);
							}
						}
					}
					catch (error) {
						console.log("[" + time + "] - " + 'Nebra API connection error. Will try again later...');
					};
				}).on("error", (error) => {
					console.log("[" + time + "] - " + 'Nebra API connection error. Will try again later...');
				});
			});
		}
	}
	helpcallcheck = 0;
}
