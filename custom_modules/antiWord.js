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
        if (message.guild.member(message.author.id).roles.get(requiredRoleID) === undefined && !message.author.bot) {
          if (message.attachments.size > 0) {
            logger.log(`Message: ${message.content} from ${message.author.username} deleted.`, path);
            message.delete()
              .then((messageTwo) => { logger.log(`Message: ${messageTwo.content} from ${messageTwo.author.username} deleted.`, path); })
              .catch(console.error);
          } else {
            let deleted = 0;
            Object.values(wordsToDelete).forEach((string) => {
              if (messageString.indexOf(string) > -1) {
                if (deleted !== 1) {
                  deleted = 1;
                  message.delete()
                    .then((messageTwo) => { logger.log(`Message: ${messageTwo.content} from ${messageTwo.author.username} deleted.`, path); })
                    .catch(console.error);
                }
              }
            });
          }
        }
      } catch (err) {
        logger.log(err, path);
      }
    });
  }
};

module.exports = antiWord;
