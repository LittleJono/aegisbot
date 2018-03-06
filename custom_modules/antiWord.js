const Discord = require('discord.js');
const client = new Discord.Client();
var config = require('./config'); //Load the configuration from config.js
const token = config.token; //The token for the bot.

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {
	messageString = message.content.toLowerCase().split().join("").replace(/[^0-9a-z]/gi, '')
	console.log(messageString)
    if (messageString.indexOf("kapa") > -1 || messageString.indexOf("kappa") > -1) {
    	message.delete()
    }
});

client.login(token);