var config = require('../config/config');
var fs = require('fs');
var path = require('path');
path = path.basename(__filename)
const logger = require('../functions/logger');


function getMessages(channels, dataObject) {

}

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
                            messageString = "```"
                            for (key in Object.keys(dataObject)){
                                newKey = Object.keys(dataObject)[key]
                                daysSinceLastMessage = Math.floor(((new Date).getTime() / 1000) / 86400 - dataObject[newKey].time)
                                if (daysSinceLastMessage > 10) {
                                    messageString += (dataObject[newKey].name + ": " + daysSinceLastMessage + " days \n")
                                }   
                            }
                            messageString += "```"
                            message.channel.send(messageString)
                        })
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