
var rp = require('request-promise');
var config = require('../config/config');
var token = config.token;
var guildID = config.guildID;
var logger = require("../functions/logger");

var path = require('path');
path = path.basename(__filename)


var options = {
    method: 'GET',
    uri: 'https://discordapp.com/api/guilds/' + guildID + '/channels',
    headers: {
        'Authorization': 'Bot ' + token,
        'User-Agent': 'DiscordBot (*, *)'
    }
};

var channelSorting = {
    loadModule: (client) => {
        client.on("message", (message) => {
            try {
            var messageParams = message.content.toLowerCase().split(" ");
            if (!message.guild.member(message.author.id).permissions.has('ADMINISTRATOR')) {
                return;
            } else if (messageParams[0] == ".sortchannels") {
                var parentChannelID = messageParams[1];
                rp(options)
                    .then(function(body) {
                        var childChannels = {};
                        var childChannelNames = [];
                        output = JSON.parse(body);
                        //console.log(JSON.stringify(output, null, 4))
                        var guildChannels = client.guilds.get(guildID).channels;

                        for (channel in output) {
                            if (output[channel].parent_id == parentChannelID) {
                                childChannelNames.push(output[channel].name)
                                childChannels[output[channel].name] = {
                                    "id": output[channel].id,
                                    "position": output[channel].position
                                }
                            }
                        }
                        if (childChannelNames.length == 0) {
                            message.channel.send("Cannot find channel with that ID.");
                            logger.log("Channel with ID " + parentChannelID + " not found.", path);
                            return;
                        } else {
                            childChannelNames = childChannelNames.sort()
                            var count = 1;
                            for (name in childChannelNames) {
                                actualName = childChannelNames[name]
                                logger.log('Sorting #' + actualName + ', Position: ' + count, path);
                                var channel = guildChannels.get(childChannels[actualName].id)
                                channel.edit({
                                    position: count,
                                    bitrate: 96000
                                })
                                count += 1;
                            }
                            message.channel.send("Channels sorted.");
                            logger.log("Channels sorted.", path);
                        }
                    })
                    .catch(function(err) {
                        logger.log(err, path);
                    });
            }
        } catch (err) {
            logger.log(err, path);
        }
        })
    }
}

module.exports = channelSorting;