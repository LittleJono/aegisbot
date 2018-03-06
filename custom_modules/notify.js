const fs = require('fs')
var config = require('../config/config'); //Load the configuration from config.js
const requiredRoleID = config.notifyRequiredRoleID; //The numerical ID of the role required for the bot to respond. AG7 Member Role: '223652428971638786'
const replyMessage = config.notifyReply;
const triggerMessage = config.notifyTrigger;
const logger = require('../functions/logger');

var blacklistedUsers = []
var blacklistedChannels = []

var path = require('path');
path = path.basename(__filename)

function remove(array, element) {
    const index = array.indexOf(element);
    if (index !== -1) {
        array.splice(index, 1);
    }
}

function returnDict(array) {
    dict = {}
    for (index in array) {
        dict[array[index]] = 1;
    }
    return dict;
}

var notify = {
    loadModule: (client) => {
        fs.readFile("notifyUserBlacklist.js", (err, data) => { //Gets the previous role mappings.
            try {
                userBlacklist = JSON.parse(data);
                blacklistedUsers = Object.keys(userBlacklist)
            } catch (err) {
                console.log("userBlacklist.js doesn't exist or is corrupt.")
                logger.log(err, path);
            }
        });

        fs.readFile("notifyChannelBlacklist.js", (err, data) => { //Gets the previous role mappings.
            try {
                channelBlacklist = JSON.parse(data);
                blacklistedChannels = Object.keys(channelBlacklist)
            } catch (err) {
                console.log("channelBlacklist.js doesn't exist or is corrupt.")
                logger.log(err, path);
            }
        });
        client.on('message', message => {
            try {
                var messageArray = message.content.toLowerCase().split(" ");
                if (message.content.toLowerCase().includes(triggerMessage)) { //&& !message.content.toLowerCase().includes('`' + triggerMessage + '`') && (message.content.toLowerCase().includes(triggerMessage + ' ') || message.content.length == triggerMessage.length) { //Checks every message to see if it contains the triggerMessage string.
                    if (blacklistedChannels.indexOf(message.channel.id) == -1) {
                        if (blacklistedUsers.indexOf(message.author.id) == -1) {
                            if (message.guild.member(message.author.id).roles.get(requiredRoleID) != undefined) { //Checks that the author of the message has the required role.
                                var firstIndex = message.content.toLowerCase().indexOf(triggerMessage)
                                var endIndex = firstIndex + triggerMessage.length
                                if (message.content.toLowerCase().includes(triggerMessage + ' ')) {
                                    message.channel.send(replyMessage); //Reply with the reply message.
                                } else if (message.content.toLowerCase()[endIndex] == undefined) {
                                    message.channel.send(replyMessage); //Reply with the reply message.
                                }
                            }
                        }
                    }
                } else

                if (!message.guild.member(message.author.id).permissions.has('ADMINISTRATOR')) {
                    return;
                } else

                if (messageArray[0] == ".notifyuserblacklistadd") {
                    var user = messageArray[1].replace(/\D/g, '');
                    if (blacklistedUsers.indexOf(user) == -1) {
                        blacklistedUsers.push(user)
                        var dictionary = returnDict(blacklistedUsers)
                        fs.writeFile("notifyUserBlacklist.js", JSON.stringify(dictionary, null, 4), (err) => {
                            if (err) {
                                console.log(err)
                            }
                        });
                    }
                } else

                if (messageArray[0] == ".notifyuserblacklistremove") {
                    var user = messageArray[1].replace(/\D/g, '');
                    remove(blacklistedUsers, user)
                    var dictionary = returnDict(blacklistedUsers)
                    fs.writeFile("notifyUserBlacklist.js", JSON.stringify(dictionary, null, 4), (err) => {
                        if (err) {
                            console.log(err)
                        }
                    });
                } else

                if (messageArray[0] == ".notifychannelblacklistadd") {
                    var channel = messageArray[1].replace(/\D/g, '');
                    if (blacklistedChannels.indexOf(channel) == -1) {
                        blacklistedChannels.push(channel)
                        var dictionary = returnDict(blacklistedChannels)
                        fs.writeFile("notifyChannelBlacklist.js", JSON.stringify(dictionary, null, 4), (err) => {
                            if (err) {
                                console.log(err)
                            }
                        });
                    }
                } else

                if (messageArray[0] == ".notifychannelblacklistremove") {
                    var user = messageArray[1].replace(/\D/g, '');
                    remove(blacklistedChannels, user)
                    var dictionary = returnDict(blacklistedChannels)
                    fs.writeFile("notifyChannelBlacklist.js", JSON.stringify(dictionary, null, 4), (err) => {
                        if (err) {
                            console.log(err)
                        }
                    });
                } else

                if (messageArray[0] == ".listnotifyuserblacklist") {
                    message.channel.send("```Blacklisted Users: \n" + blacklistedUsers.join("\n") + "```")
                } else

                if (messageArray[0] == ".listnotifychannelblacklist") {
                    message.channel.send("```Blacklisted Channels: \n" + blacklistedChannels.join("\n") + "```")
                }
            } catch (err) {
                logger.log(err, path);
            }
        });
    }
}

module.exports = notify;
/*Commands:
@notify - Makes the bot respond with @here
.notifyuserblacklistadd user - Blacklists a user from using @notify. Use either the user's ID or tag them ('@Jono').
.notifyuserblacklistremove user - Removes a user from the blacklist.
.notifychannelblacklistadd channelID - Blacklists a channel. The bot will ignore any @notify commands in blacklist channels. Rightclick on the channel to get it's ID.
.notifychannelblacklistremove channelID - Removes a channel from the blacklist.
.listnotifyuserblacklist - Lists the blacklisted users.
.listnotifychannelblacklist - Lists the blacklisted channels.
*/