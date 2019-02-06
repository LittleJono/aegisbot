const path = require('path');

const thePath = path.basename(__filename);

const logger = require('../functions/logger'); // Load the configuration from config.js
const config = require('../config/config'); // Load the configuration from config.js

const adminRoleID = config.staffRoleIDs[0];
const moderatorRoleID = config.staffRoleIDs[1];

const wamSelf = {
  '10774058046901862231341234': 'jono'
}

const getWammed = {
  loadModule: (client) => {
    client.on('message', (message) => {
      try {
        const messageString = message.content.toLowerCase();
        if (messageString.indexOf('.wam ') === 0) {
          if (wamSelf[message.author.id]) {
            logger.log(`wamming <@!${message.author.id}>`, thePath);
            message.channel.send(`Get wammed, <@!${message.author.id}>!`);
          } else if (message.guild.member(message.author.id).roles.get(adminRoleID) !== undefined || message.guild.member(message.author.id).roles.get(moderatorRoleID) !== undefined) { // not correct
            const wammedUser = messageString.split(' ')[1];
            logger.log(`wamming ${wammedUser}`, thePath);
            message.channel.send(`Get wammed, ${wammedUser}!`);
          } else {
            message.channel.send(`Only staff are allowed to wam, ${message.author}`);
          }
        }
      } catch (err) {
        logger.log(err, thePath);
      }
    });
  }
};

module.exports = getWammed;
