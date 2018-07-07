const config = require('./config/config'); //Load the configuration from config.js
const notify = require('./custom_modules/notify')
const antiWord = require('./custom_modules/antiWord')
const getRoleIDs = require('./custom_modules/getRoleIDs')
const autoRoles = require('./custom_modules/autoRoles')
const channelRenaming = require('./custom_modules/channelRenaming')
const channelSorting = require('./custom_modules/channelSorting')
const unusedChannels = require("./custom_modules/unusedChannels.js")
const logger = require('./functions/logger');

var fs = require('fs');
var path = require('path');
path = path.basename(__filename)

if (!fs.existsSync("logFiles")){
    fs.mkdirSync("logFiles");
}

if (!fs.existsSync("cacheFiles")){
    fs.mkdirSync("cacheFiles");
}

const Discord = require("discord.js");
const client = new Discord.Client();
const token = config.token;
const notifyMode = config.notify;
const getRoleIDsMode = config.getRoleIDs;
const antiWordMode = config.antiWord;
const autoRolesMode = config.autoRoles;
const channelRenamingMode = config.channeRenaming;
const channelSortingMode = config.channelSorting;
const unusedChannelsMode = config.unusedChannels;


function connectBot() {
    logger.log("Attempting to connect.", path);
    client.login(token);
}


client.on('ready', () => {
    console.log('Bot has connected.');
    logger.log('Bot has connected.', path);
    clearInterval(botLoggingIn);

    if (notifyMode == 1) {
        console.log("Loaded notify")
        notify.loadModule(client);
    }
    if (getRoleIDsMode == 1) {
        console.log("Loaded getRoleIDs")
        getRoleIDs.loadModule(client);
    }
    if (antiWordMode == 1) {
        console.log("Loaded antiWord")
        antiWord.loadModule(client);
    }
    if (autoRolesMode == 1) {
        console.log("Loaded autoRoles")
        autoRoles.loadModule(client);
    }
    if (channelRenamingMode == 1) {
        console.log("Loaded channelRenaming")
        channelRenaming.loadModule(client);
    }
    if (channelSortingMode == 1) {
        console.log("Loaded channelSorting")
        channelSorting.loadModule(client);
    }
    if (unusedChannelsMode == 1) {
        console.log("Loaded unusedChannels")
        unusedChannels.loadModule(client);
    }
});


connectBot();
var botLoggingIn = setInterval(function() {
    connectBot();
}, 5000);

process.on('SIGINT', function() {
    console.log("Received SIGINT... Shutting down")
    logger.log('Received SIGINT... Shutting down', path);
    channelRenaming.exit(client);
    setTimeout(function() {
        process.exit(0);
    }, 3000)

});

process.on('uncaughtException', function(error) {
    console.log('Caught exception: ' + error);
    logger.log(error.stack, path);
});