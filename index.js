const config = require('./config/config'); //Load the configuration from config.js
const notify = require('./custom_modules/notify')
const antiWord = require('./custom_modules/antiWord')
const autoRoles = require('./custom_modules/autoRoles')
const channelRenaming = require('./custom_modules/channelRenaming')
const channelSorting = require('./custom_modules/channelSorting')

const Discord = require("discord.js");
const client = new Discord.Client();
const token = config.token; //The token for the main bot.
const notifyMode = config.notify
const antiWordMode = config.antiWord
const autoRolesMode = config.autoRoles
const channeRenamingMode = config.channeRenaming
const channelSortingMode = config.channelSorting

var botLoggingIn = setInterval(function() {
    console.log("Attempting to connect.")
    client.login(token);
}, 5000);

client.on('ready', () => {
    console.log('Bot has connected.');
    clearInterval(botLoggingIn);

    if (notifyMode == 1) {
    	notify.loadModule();
    }
    if (antiWordMode == 1) {
    	antiWord.loadModule();
    }
    if (autoRolesMode == 1) {
    	autoRoles.loadModule();
    }
    if (channelRenamingMode == 1) {
    	channelRenaming.loadModule();
    }
    if (channelSortingMode == 1) {
    	channelSorting.loadModule();
    }
    

});