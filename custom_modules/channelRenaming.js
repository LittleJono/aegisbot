var config = require('../config/config');
var logger = require('../functions/logger');
const fs = require('fs');

let path = require('path');
path = path.basename(__filename)

const channelFile = "cacheFiles/channelRenamingCashe.js"
const guildID = config.guildID //This is correct for Aegis7
const memberPrefix = "[M]"
const requiredRoleID = config.notifyRequiredRoleID;

let channels = {};
let foobar;

function revertChannel(value) {
    try {
        if (value.type == 'voice' && value.id in channels) {
            if (value.name != channels[value.id]) {
                value.edit({
                    name: channels[value.id],
                    bitrate: 96000
                })
                logger.log('Restored Channel: ' + value.name + '\t to: \t' + channels[value.id], path);
            }
        }
    } catch (err) {
        logger.log(err, path);
    }
}

function logElements(value, key, map) {
    try {
        if (value.type == 'voice' && value.id in channels) {
            var game = {};
            value.members.forEach(function(value2, key2, map2) {
                if (value2.roles.get(requiredRoleID) != undefined) { //checks for member
                    try {
                        if (value2.presence.game.url == null) {
                            if (isNaN(game[value2.presence.game.name])) {
                                game[value2.presence.game.name] = 1;
                            } else {
                                game[value2.presence.game.name] += 1;
                            }
                        }
                    } catch (err) {
                        //logger.log(err, path); REMOVED THE LOG HERE, this is where the NULLs are coming from. It's supposed to not work.
                    }
                }
            });
            var max = 0;
            var count = 0;
            var gameValue = '';
            var total = 0;
            for (var key in game) {
                total += game[key]
                if (game[key] > max) {
                    max = game[key];
                    gameValue = key;
                }
            }
            if (max / total > 0.49) {
                for (var key in game) {
                    if (game[key] == max) {
                        count += 1;
                    }
                }
                if (count > 1 || count == 0) {
                    if (value.name != channels[value.id]) {
                        value.edit({
                            name: channels[value.id],
                            bitrate: 96000
                        })
                        logger.log('Restored Channel: ' + value.name + '\t to: \t' + channels[value.id], path);
                    }
                } else {
                    if (value.name != gameValue && value.name != memberPrefix + '' + gameValue) {
                        isMemberChannel = false;
                        if (value.name.toLowerCase().indexOf('member') > -1) {
                            isMemberChannel = true;
                            gameValue = memberPrefix + '' + gameValue;
                        }
                        value.edit({
                            name: gameValue,
                            bitrate: 96000
                        })
                        logger.log('Auto Renamed Channel: ' + channels[value.id] + '\t to: \t' + gameValue, path);
                    }
                }
            } else {
                if (value.name != channels[value.id]) {
                    value.edit({
                        name: channels[value.id],
                        bitrate: 96000
                    })
                    logger.log('Restored Channel: ' + value.name + '\t to: \t' + channels[value.id], path);
                }
            }
        }
    } catch (err) {
        logger.log(err, path);
    }
}

var channelRenaming = {
    loadModule: (client) => {
        logger.log('Starting Service', path);

        fs.readFile(channelFile, (err, data) => {
            try {
                channels = JSON.parse(data);
                channel_count = Object.keys(channels).length;

                logger.log('Loaded ' + channel_count + ' channels to rename from ' + channelFile, path);

            } catch (err) {
                logger.log(err, path);
            }
        });

        client.on('message', msg => {
            var messageArray = msg.content.toLowerCase().split(" ");
            if (!msg.guild.member(msg.author.id).permissions.has('ADMINISTRATOR')) {
                return;
            } else

            if (msg.content.slice(0, 12).toLowerCase() === '.autorename ') {
                try {
                    channelID = msg.content.slice(12);
                    if (client.guilds.get(guildID).channels.get(channelID).type == 'voice') {
                        channels[channelID] = client.guilds.get(guildID).channels.get(channelID).name;
                        msg.channel.send('```Channel: ' + channels[channelID] + ' ADDED to Auto Renamer by user: ' + msg.author.username + '```');
                        logger.log('Channel: ' + channels[channelID] + ' ADDED to Auto Renamer by user: ' + msg.author.username, path);
                        fs.writeFile(channelFile, JSON.stringify(channels, null, 4), (err) => {
                            if (err) throw err;
                        });
                    } else {
                        msg.channel.send("That channel does not exist or is not a voice channel.")
                    }
                } catch (err) {
                    logger.log(err, path);
                }
            }

            if (messageArray[0] == ".changename") {
                try {

                    var changesID = messageArray[1]
                    var changes = messageArray[2]
                    if(typeof channels[changesID] != 'undefined') {
                        msg.channel.send("Renamed channel " + [changesID] + " to " + messageArray[2]);
                        channels[changesID] = changes
                        fs.writeFile(channelFile, JSON.stringify(channels, null, 4), (err) => {
                            if (err) throw err;
                        });
                    } else {
                        msg.channel.send("That channel isn't currently auto-renaming.")
                    }
                } catch (err) {
                    logger.log(err, path);
                }
            }

            if (msg.content.slice(0, 18).toLowerCase() === '.removeautorename ') {
                try {
                    channelID = msg.content.slice(18);
                    channel = client.guilds.get(guildID).channels.get(channelID)
                    logger.log('Channel: ' + channel.name + ' REMOVED from Auto Renamer by user: ' + msg.author.username, path);
                    revertChannel(channel)
                    delete channels[channelID];
                    msg.channel.send('```Channel: ' + channel.name + ' REMOVED from Auto Renamer by user: ' + msg.author.username + '```');
                    fs.writeFile(channelFile, JSON.stringify(channels, null, 4), (err) => {
                        if (err) throw err;
                    });
                } catch (err) {
                    logger.log(err, path);
                }
            }

            if (msg.content.toLowerCase() === '.listautorename') {
                try {
                    replyString = '```Voice channels auto-named:\n\n'
                    for (key in channels) {
                        replyString += channels[key] + ': ' + key + '\n';
                    }
                    replyString += '```'
                    msg.channel.send(replyString)
                } catch (err) {
                    logger.log(err, path);
                }
            }
        });

        foobar = setInterval(function() {
            try {
                client.guilds.get(guildID).channels.forEach(logElements);
            } catch (err) {
                logger.log(err, path);
            }
        }, 1000)
    },
    exit: (client) => {
        try {
            clearInterval(foobar);
            client.guilds.get(guildID).channels.forEach(revertChannel);
        } catch (err) {
            logger.log(err, path);
        }
    }

}

module.exports = channelRenaming;

/*
.autoRename channelID - Adds a channel to be auto-renamed.
.changeName channelID newName - Changes the name a channel will revert to.
.removeAutoRename channelID - Removes a channel from being auto-renamed.
.listAutoRename - Lists all the channels that are being auto-renamed

channelID can be found by rightclicking on the channel -> 'Copy ID'
*/