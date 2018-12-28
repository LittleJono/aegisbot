let path = require('path');
const logger = require('../functions/logger'); // Load the configuration from config.js
const config = require('../config/config');

path = path.basename(__filename);

const wordsToDelete = ['http://', '.com', '.org', '.net', 'https://', 'www.'];

const requiredRoleID = config.notifyRequiredRoleID;

const antiWord = {
  loadModule: (client) => {
    client.on('message', (message) => {
      try {
        const messageString = message.content.toLowerCase().split().join('');
        if (message.guild.member(message.author.id).roles.get(requiredRoleID) === undefined) {
          Object.values(wordsToDelete).forEach((string) => {
            if (messageString.indexOf(string) > -1) {
              logger.log(`Message: ${message.content} from ${message.author.username} deleted.`, path);
              message.delete();
            }
          });
          if (message.attachments.size > 0) {
            logger.log(`Message: ${message.content} from ${message.author.username} deleted.`, path);
            message.delete();
          }
        }
      } catch (err) {
        logger.log(err, path);
      }
    });
  }
};

module.exports = antiWord;
