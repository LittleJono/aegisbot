var logger = require("../functions/logger"); //Load the configuration from config.js
var path = require('path');
path = path.basename(__filename)

var wordsToDelete = ["kappa", "kapa"];

var antiWord = {
    loadModule: (client) => {
        client.on('message', message => {
            try {
                messageString = message.content.toLowerCase().split().join("").replace(/[^0-9a-z]/gi, '')
                for (string in wordsToDelete) {
                	if (messageString.indexOf(wordsToDelete[string]) > -1) {
                        logger.log("Message: '" + message.content + "' from " + message.author.username + " deleted.", path)
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