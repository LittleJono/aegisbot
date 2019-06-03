
const fs = require('fs');
const _ = require('lodash');
const Discord = require('discord.js');
let path = require('path');
path = path.basename(__filename);


const logger = require('./functions/logger');
const config = require('./config/config'); // Load the configuration from config.js


if (!fs.existsSync('logFiles')) {
  fs.mkdirSync('logFiles');
}

if (!fs.existsSync('cacheFiles')) {
  fs.mkdirSync('cacheFiles');
}

const modules = {
  notify: {
    enabled: config.notify,
    file: require('./custom_modules/notify'),
  },
  getRoleIDs: {
    enabled: config.getRoleIDs,
    file: require('./custom_modules/getRoleIDs'),
  },
  antiWord: {
    enabled: config.antiWord,
    file: require('./custom_modules/antiWord'),
  },
  autoRoles: {
    enabled: config.autoRoles,
    file: require('./custom_modules/autoRoles'),
  },
  channelRenaming: {
    enabled: config.channeRenaming,
    file: require('./custom_modules/channelRenaming'),
  },
  channelSorting: {
    enabled: config.channelSorting,
    file: require('./custom_modules/channelSorting'),
  },
  unusedChannels: {
    enabled: config.unusedChannels,
    file: require('./custom_modules/unusedChannels.js'),
  },
  getWammed: {
    enabled: config.getWammed,
    file: require('./custom_modules/getWammed.js'),
  },
  roleAssignment: {
    enabled: config.roleAssignment,
    file: require('./custom_modules/roleAssignment.js'),
  },
};

const { token } = config;

const connectBot = async (client) => {
  try {
    logger.log('Attempting to connect.', path);
    await client.login(token);
    logger.log('Logged in');
  } catch (err) {
    connectBot();
  }
};

const botClient = new Discord.Client();
connectBot(botClient);

botClient.once('ready', () => {
  _.forEach(modules, (value) => {
    if (value.enabled) {
      value.file.loadModule(botClient);
    }
  });
});

botClient.on('error', error => logger.log(error, path));

process.on('SIGINT', () => {
  console.log('Received SIGINT... Shutting down');
  logger.log('Received SIGINT... Shutting down', path);
  modules.channelRenaming.file.exit(botClient);
  setTimeout(() => {
    process.exit(0);
  }, 3000);
});

process.on('uncaughtException', async (error) => {
  console.log(`Caught exception: ${error}`);
  logger.log(error, path);
  process.exit(0);
});
