var config = require('./config'); //Load the configuration from config.js

const Discord = require("discord.js");
const client = new Discord.Client();

const token = config.token; //The token for the main bot.
const guildID = config.guildID //This is correct for Aegis7
const memberPrefix = config.memberPrefix;
const fs = require('fs');
const moment = require('moment');
var channels = {};
const logFile = config.logFile
const channelFile = config.channelFile;

var wstream = fs.createWriteStream(logFile, {
    flags: 'a+'
});

function writeLog(str) {
    wstream.write(str + '\r\n');
}

function logAndDisplay(str, addPadding = 0, message_type = 0) {
    //Handle errors
    var currentTime = moment().format('MMM/D/YY h:mm:ss a');
    switch (message_type) {
        case 0:
            var message_name = 'INFO';
            break;
        case 1:
            var message_name = 'EXCEPTION';
            break;
        default:
            var message_name = 'UNKNOWN';
    }
    var message = currentTime + ' - ' + message_name + ': ' + str;
    if (!addPadding) {
        console.log(message);
        writeLog(message);
    } else {
        console.log('===================');
        console.log(message);
        console.log('===================');
        writeLog('===================');
        writeLog(message);
        writeLog('===================');
    }
}

logAndDisplay('Starting Service', true);

fs.readFile(channelFile, (err, data) => {
    try {
        channels = JSON.parse(data);
        channel_count = Object.keys(channels).length;

        logAndDisplay('Loaded ' + channel_count + ' channels to rename from ' + channelFile);

    } catch (err) {
        logAndDisplay(err, true, 1);
    }
});

function logElements(value, key, map) {
    try {
        if (value.type == 'voice' && value.id in channels) {
            var game = {};
            value.members.forEach(function(value2, key2, map2) {
                if (value2.roles.find('name', 'Member') != null) { //checks for member
                    try {
                        if (value2.presence.game.url == null) {
                            if (isNaN(game[value2.presence.game.name])) {
                                game[value2.presence.game.name] = 1;
                            } else {
                                game[value2.presence.game.name] += 1;
                            }
                        }
                    } catch (err) {
                        //logAndDisplay(err, true, 1); REMOVED THE LOG HERE, this is where the NULLs are coming from. It's supposed to not work.
                    }
                }
            });
            setTimeout(function() {
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
                setTimeout(function() {
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
                                logAndDisplay('>Restored Channel: ' + value.name + '\t to: \t' + channels[value.id]);
                            }
                        } else {
                            if (value.name != gameValue && value.name != memberPrefix+''+gameValue) {
								isMemberChannel = false;
								if (value.name.toLowerCase().indexOf('member') > -1) {
									isMemberChannel = true;
									gameValue = memberPrefix+''+gameValue;
								}
                                value.edit({
                                    name: gameValue,
                                    bitrate: 96000
                                })
                                logAndDisplay('Auto Renamed Channel: ' + channels[value.id] + '\t to: \t' + gameValue);
                            }
                        }
                    } else {
                        if (value.name != channels[value.id]) {
                            value.edit({
                                name: channels[value.id],
                                bitrate: 96000
                            })
                            logAndDisplay('>>Restored Channel: ' + value.name + '\t to: \t' + channels[value.id]);
                        }
                    }
                }, 100);
            }, 500);
        }
    } catch (err) {
        logAndDisplay(err, true, 1);
    }
}

function revertChannel(value) {
    try {
        if (value.type == 'voice' && value.id in channels) {
            if (value.name != channels[value.id]) {
                value.edit({
                    name: channels[value.id],
                    bitrate: 96000
                })
                logAndDisplay('Restored Channel: ' + value.name + '\t to: \t' + channels[value.id]);
            }
        }
    } catch (err) {
        logAndDisplay(err, true, 1);
    }
}

client.on('ready', () => {
    console.log('Ready!');
    clearInterval(botLoggingIn);
});

client.on('message', msg => {
    if (msg.content.slice(0, 12) === '.autoRename ') {
        try {
            if (msg.guild.member(msg.author.id).permissions.has('ADMINISTRATOR')) { // This SHOULD make it so only Admins can add new channels to the renaming whitelist.
                channelID = msg.content.slice(12);
                channels[channelID] = client.guilds.get(guildID).channels.get(channelID).name;
                msg.channel.send('```Channel: ' + channels[channelID] + ' ADDED to Auto Renamer by user: ' + msg.author.username + '```');
                logAndDisplay('Channel: ' + channels[channelID] + ' ADDED to Auto Renamer by user: ' + msg.author.username);
                fs.writeFile(channelFile, JSON.stringify(channels, null, 4), (err) => {
                    if (err) throw err;
                });
            }
        } catch (err) {
            logAndDisplay(err, true, 1);
        }
    }
    if (msg.content.slice(0, 12) === '.changeName ') {
        if (msg.guild.member(msg.author.id).permissions.has('ADMINISTRATOR')) { // This SHOULD make it so only Admins can add new channels to the renaming whitelist.
            try {
                str = msg.content.slice(12)
                var changesID = str.substr(0, str.indexOf(' '))
                var changes = str.substr(str.indexOf(' ') + 1)

                channels[changesID] = changes
                fs.writeFile(channelFile, JSON.stringify(channels, null, 4), (err) => {
                    if (err) throw err;
                });

            } catch (err) {
                logAndDisplay(err, true, 1);
            }
        }
    }
    if (msg.content.slice(0, 18) === '.removeAutoRename ') {
        if (msg.guild.member(msg.author.id).permissions.has('ADMINISTRATOR')) { // This SHOULD make it so only Admins can add new channels to the renaming whitelist.
            try {
                channelID = msg.content.slice(18);
                channel = client.guilds.get(guildID).channels.get(channelID)
                logAndDisplay('Channel: ' + channel.name + ' REMOVED from Auto Renamer by user: ' + msg.author.username);
                revertChannel(channel)
                delete channels[channelID];
                msg.channel.send('```Channel: ' + channel.name + ' REMOVED from Auto Renamer by user: ' + msg.author.username + '```');
                fs.writeFile(channelFile, JSON.stringify(channels, null, 4), (err) => {
                    if (err) throw err;
                });

            } catch (err) {
                logAndDisplay(err, true, 1);
            }
        }
    }
    if (msg.content === '.listAutoRename') {
        try {
            replyString = '```Voice channels auto-named:\n\n'
            for (key in channels) {
                replyString += channels[key] + ': ' + key + '\n';
            }
            replyString += '```'
            msg.channel.send(replyString)
        } catch (err) {
            logAndDisplay(err, true, 1);
        }
    }
});

var foobar = setInterval(function() {
    try {
        client.guilds.get(guildID).channels.forEach(logElements);
    } catch (err) {
        logAndDisplay(err, true, 1);
    }
}, 5000)

/*
.autoRename channelID - Adds a channel to be auto-renamed.
.changeName channelID newName - Changes the name a channel will revert to.
.removeAutoRename channelID - Removes a channel from being auto-renamed.
.listAutoRename - Lists all the channels that are being auto-renamed

channelID can be found by rightclicking on the channel -> 'Copy ID'
<<<<<<< HEAD
*/