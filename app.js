
const fs = require('fs');
let path = require('path');
const Discord = require('discord.js');

const config = require('./config/config'); // Load the configuration from config.js
const notify = require('./custom_modules/notify');
const antiWord = require('./custom_modules/antiWord');
const getRoleIDs = require('./custom_modules/getRoleIDs');
const autoRoles = require('./custom_modules/autoRoles');
const channelRenaming = require('./custom_modules/channelRenaming');
const channelSorting = require('./custom_modules/channelSorting');
const unusedChannels = require('./custom_modules/unusedChannels.js');
const getWammed = require('./custom_modules/getWammed.js');
const roleAssignment = require('./custom_modules/roleAssignment.js');
const logger = require('./functions/logger');

path = path.basename(__filename);

if (!fs.existsSync('logFiles')) {
  fs.mkdirSync('logFiles');
}

if (!fs.existsSync('cacheFiles')) {
  fs.mkdirSync('cacheFiles');
}


const client = new Discord.Client();
const { token } = config;
const notifyMode = config.notify;
const getRoleIDsMode = config.getRoleIDs;
const antiWordMode = config.antiWord;
const autoRolesMode = config.autoRoles;
const channelRenamingMode = config.channeRenaming;
const channelSortingMode = config.channelSorting;
const unusedChannelsMode = config.unusedChannels;
const getWammedMode = config.getWammed;
const roleAssignmentMode = config.roleAssignment;


const connectBot = () => {
  logger.log('Attempting to connect.', path);
  client.login(token);
}

connectBot();

let loginLoop;

const botLoggingIn = () => {
  loginLoop = setInterval(() => {
    connectBot();
  }, 5000);
}

botLoggingIn();

client.once('ready', () => {
  console.log('Bot has connected.');
  logger.log('Bot has connected.', path);
  clearInterval(loginLoop);

  if (notifyMode === 1) {
    console.log('Loaded notify');
    notify.loadModule(client);
  }
  if (getRoleIDsMode === 1) {
    console.log('Loaded getRoleIDs');
    getRoleIDs.loadModule(client);
  }
  if (antiWordMode === 1) {
    console.log('Loaded antiWord');
    antiWord.loadModule(client);
  }
  if (autoRolesMode === 1) {
    console.log('Loaded autoRoles');
    autoRoles.loadModule(client);
  }
  if (channelRenamingMode === 1) {
    console.log('Loaded channelRenaming');
    channelRenaming.loadModule(client);
  }
  if (channelSortingMode === 1) {
    console.log('Loaded channelSorting');
    channelSorting.loadModule(client);
  }
  if (unusedChannelsMode === 1) {
    console.log('Loaded unusedChannels');
    unusedChannels.loadModule(client);
  }
  if (getWammedMode === 1) {
    console.log('Loaded getWammed');
    getWammed.loadModule(client);
  }
  if (roleAssignmentMode === 1) {
    console.log('Loaded roleAssignment');
    roleAssignment.loadModule(client);
  }
});

process.on('SIGINT', () => {
  console.log('Received SIGINT... Shutting down');
  logger.log('Received SIGINT... Shutting down', path);
  channelRenaming.exit(client);
  setTimeout(() => {
    process.exit(0);
  }, 3000);
});

process.on('uncaughtException', async (error) => {
  console.log(`Caught exception: ${error}`);
  logger.log(error, path);
  await client.destroy();
  botLoggingIn();
});
