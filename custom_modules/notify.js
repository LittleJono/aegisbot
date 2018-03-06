const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs')
var config = require('./config'); //Load the configuration from config.js
const token = config.token; //The token for the bot.
const requiredRoleID = config.requiredRoleID; //The numerical ID of the role required for the bot to respond. AG7 Member Role: '223652428971638786'
const replyMessage = '@here' //The message the bot replies with.
const triggerMessage = '@notify' //The trigger string required in a users message.

var blacklistedUsers = []
var blacklistedChannels = []

fs.readFile("userBlacklist.js", (err, data) => { //Gets the previous role mappings.
    try {
        userBlacklist = JSON.parse(data);
        blacklistedUsers = Object.keys(userBlacklist)
    } catch (err) {
        console.log("userBlacklist.js doesn't exist or is corrupt.")
    }
});

fs.readFile("channelBlacklist.js", (err, data) => { //Gets the previous role mappings.
    try {
        channelBlacklist = JSON.parse(data);
        blacklistedChannels = Object.keys(channelBlacklist)
    } catch (err) {
        console.log("channelBlacklist.js doesn't exist or is corrupt.")
    }
});

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

client.on('ready', () => {
    console.log('I am ready!');
    clearInterval(botLoggingIn)
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

        if (messageArray[0] == ".notifyuserblacklistadd") {
            if (message.guild.member(message.author.id).permissions.has('ADMINISTRATOR')) { // This SHOULD make it so only Admins can add new channels to the renaming whitelist.
                var user = messageArray[1].replace(/\D/g, '');
                if (blacklistedUsers.indexOf(user) == -1) {
                    blacklistedUsers.push(user)
                    var dictionary = returnDict(blacklistedUsers)
                    fs.writeFile("userBlacklist.js", JSON.stringify(dictionary, null, 4), (err) => {
                        if (err) {
                            console.log(err)
                        }
                    });
                }
            }
        } else

        if (messageArray[0] == ".notifyuserblacklistremove") {
            if (message.guild.member(message.author.id).permissions.has('ADMINISTRATOR')) { // This SHOULD make it so only Admins can add new channels to the renaming whitelist.
                var user = messageArray[1].replace(/\D/g, '');
                remove(blacklistedUsers, user)
                var dictionary = returnDict(blacklistedUsers)
                fs.writeFile("userBlacklist.js", JSON.stringify(dictionary, null, 4), (err) => {
                    if (err) {
                        console.log(err)
                    }
                });
            }
        } else

        if (messageArray[0] == ".notifychannelblacklistadd") {
            if (message.guild.member(message.author.id).permissions.has('ADMINISTRATOR')) { // This SHOULD make it so only Admins can add new channels to the renaming whitelist.  
                var channel = messageArray[1].replace(/\D/g, '');
                if (blacklistedChannels.indexOf(channel) == -1) {
                    blacklistedChannels.push(channel)
                    var dictionary = returnDict(blacklistedChannels)
                    fs.writeFile("channelBlacklist.js", JSON.stringify(dictionary, null, 4), (err) => {
                        if (err) {
                            console.log(err)
                        }
                    });
                }
            }
        } else

        if (messageArray[0] == ".notifychannelblacklistremove") {
            if (message.guild.member(message.author.id).permissions.has('ADMINISTRATOR')) { // This SHOULD make it so only Admins can add new channels to the renaming whitelist.
                var user = messageArray[1].replace(/\D/g, '');
                remove(blacklistedChannels, user)
                var dictionary = returnDict(blacklistedChannels)
                fs.writeFile("channelBlacklist.js", JSON.stringify(dictionary, null, 4), (err) => {
                    if (err) {
                        console.log(err)
                    }
                });
            }
        } else

        if (messageArray[0] == ".listnotifyuserblacklist") {
            if (message.guild.member(message.author.id).permissions.has('ADMINISTRATOR')) { // This SHOULD make it so only Admins can add new channels to the renaming whitelist.
                message.channel.send("```Blacklisted Users: \n" + blacklistedUsers.join("\n") + "```")
            }
        } else

        if (messageArray[0] == ".listnotifychannelblacklist") {
            if (message.guild.member(message.author.id).permissions.has('ADMINISTRATOR')) { // This SHOULD make it so only Admins can add new channels to the renaming whitelist.
                message.channel.send("```Blacklisted Channels: \n" + blacklistedChannels.join("\n") + "```")
            }
        }
    } catch (err) {

    }
});
client.login(token);

var botLoggingIn = setInterval(function() {
    console.log("attempting login")
    client.login(token);
}, 5000);

/*Commands:
@notify - Makes the bot respond with @here
.notifyuserblacklistadd user - Blacklists a user from using @notify. Use either the user's ID or tag them ('@Jono').
.notifyuserblacklistremove user - Removes a user from the blacklist.
.notifychannelblacklistadd channelID - Blacklists a channel. The bot will ignore any @notify commands in blacklist channels. Rightclick on the channel to get it's ID.
.notifychannelblacklistremove channelID - Removes a channel from the blacklist.
.listnotifyuserblacklist - Lists the blacklisted users.
.listnotifychannelblacklist - Lists the blacklisted channels.
*/