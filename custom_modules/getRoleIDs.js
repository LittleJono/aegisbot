var config = require('../config/config');
var guildID = config.guildID;
var fs = require('fs');
var path = require('path');
path = path.basename(__filename)
const logger = require('../functions/logger');

var getRoleIDs = {
    loadModule: (client) => {
        try {
            client.on("message", (message) => {
                messageParams = message.content.toLowerCase().split(" ")
                if (!message.guild.member(message.author.id).permissions.has('ADMINISTRATOR')) {
                    return;
                } else if (messageParams[0] == ".getroleid") {
                    var data = client.guilds.get(guildID).roles
                    data.forEach(function(role) {
                        if (role.name.toLowerCase() == messageParams.slice(1).join(" ")) {
                            message.channel.send(role.name + ": " + role.id);
                        }
                    })
                }
            })
        } catch (err) {
            logger.log(err, path)
        }
    }
}

module.exports = getRoleIDs;