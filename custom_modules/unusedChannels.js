var config = require('../config/config');
var fs = require('fs');
var path = require('path');
path = path.basename(__filename)
const logger = require('../functions/logger');

var unusedChannels = {
    loadModule: (client) => {
        try {
            client.on("message", (message) => {
                try {
                    messageParams = message.content.toLowerCase().split(" ")
                    var dataObject = {}
                    if (!message.guild.member(message.author.id).permissions.has('ADMINISTRATOR')) {
                        return;
                    } else if (messageParams[0] == ".unusedchannels") {
                        if (messageParams[1] == undefined || messageParams < 1) {
                            message.channel.send("Please enter a number (greater than 0) after that command ('.unusedchannels 5').")
                        } else {
                            listOfChannels = message.guild.channels;
                            var promise = new Promise(function(resolve, reject) {
                                var arrayOfPromises = [];
                                listOfChannels.forEach((channel) => {
                                    if (channel.type == "text") {
                                        var promise = new Promise(function(resolve, reject) {
                                            channel.fetchMessages({
                                                limit: 1
                                            }).then((messages) => {
                                                messages.forEach((message) => {
                                                    var dataToAdd = {}
                                                    dataToAdd.name = message.channel.name
                                                    dataToAdd.time = (message.createdTimestamp / 1000) / 86400
                                                    dataObject[message.id] = dataToAdd;
                                                })
                                                resolve(1)
                                            })
                                        })
                                        arrayOfPromises.push(promise);
                                    }
                                })
                                Promise.all(arrayOfPromises).then(() => {
                                    resolve(1)
                                });
                            })
                            promise.then(() => {
                                var arrayOfDays = []
                                for (key in Object.keys(dataObject)) {
                                    newKey = Object.keys(dataObject)[key]
                                    daysSinceLastMessage = Math.floor(((new Date).getTime() / 1000) / 86400 - dataObject[newKey].time)
                                    var newArray = []
                                    newArray.push(dataObject[newKey].name)
                                    newArray.push(daysSinceLastMessage)
                                    arrayOfDays.push(newArray)
                                }
                                arrayOfDays.sort(function(a, b) {
                                    return b[1] - a[1]
                                })
                                console.log(arrayOfDays)
                                var messageString = "```"
                                for (index in arrayOfDays) {
                                    if (arrayOfDays[index][1] > messageParams[1]) {
                                        messageString += ( arrayOfDays[index][0 ]+ ": " + arrayOfDays[index][1] + " days \n")
                                    }
                                }
                                messageString += "```"
                                if (messageString == "``````") {
                                    message.channel.send("There are no channels that haven't been used in the past " + messageParams[1] + " days.")
                                } else {
                                    message.channel.send(messageString)
                                }

                            })
                        }
                    }
                } catch (err) {
                    logger.log(err, path)
                }
            })
        } catch (err) {
            logger.log(err, path)
        }
    }
}
module.exports = unusedChannels;