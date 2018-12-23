let path = require('path');
const logger = require('../functions/logger'); // Load the configuration from config.js

path = path.basename(__filename);

const wordsToDelete = ['kappa', 'kapa'];

const antiWord = {
  loadModule: (client) => {
    client.on('message', (message) => {
      try {
        const messageString = message.content.toLowerCase().split().join('').replace(/[^0-9a-z]/gi, '');
        Object.values(wordsToDelete).forEach((string) => {
          if (messageString.indexOf(wordsToDelete[string]) > -1) {
            logger.log(`Message: ${message.content} from ${message.author.username} deleted.`, path);
            message.delete();
          }
        });
      } catch (err) {
        logger.log(err, path);
      }
    });
  }
};

module.exports = antiWord;
