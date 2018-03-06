/* COMMANDS 
	.addrolemapping gameName role - Maps gameName to a role, when a member is playing gameName they will be given the mapped role.
	.removerolemapping gameName - Removes a role mapping for gameName.
	.listrolemapping - List all the current role mappings.
	.howmanyplaying gameName - Lists how many people on the server are playing gameName
	.listcurrentlyplayed number(optional) - Lists all the games people are playing and how many are playing currently.
*/

//--------------------------------------------------------- BOT SETUP ---------------------------------------------------------

const Discord = require('discord.js');
const client = new Discord.Client();
var fs = require('fs');
var config = require('./destinyConfig'); //Load the configuration from config.js
const token = config.token; //The token for the bot.
const guildID = "327990949164875788" //config.guildID;
var gameList = {}; //Games and their player Counts
var fields = []; //Above formatted for Embedded messages.
var tempGameList = {} //Used for storing the new cashe before it is pushed to gameList
var roleMap = {} // GET FROM JSON FILE
var roleMapFile = "roleMap.json"
const blackList = ['moderator', "coordinator", "administrator"] //Roles that can't be mapped. MAKE SURE THEY ARE LOWERCASE.

var botLoggingIn = setInterval(function() {
    console.log("attempting login")
    client.login(token);
}, 5000); //Fixes the weird reconnecting issue

client.on('ready', () => {
    console.log('I am ready!');
    updateGameList() //Get the player counts
    clearInterval(botLoggingIn) //Kill the above loop.
});

client.login(token);

//--------------------------------------------------------- FUNCTIONS AND FILES ---------------------------------------------------------

fs.readFile(roleMapFile, (err, data) => { //Gets the previous role mappings.
    try {
        roleMap = JSON.parse(data);
        console.log(roleMap);
    } catch (err) {
        //do nothing
    }
});

function updateGameList() { //Used to cashe the currently played games.
    try {
        tempGameList = {}
        client.guilds.get("223644373609480194").members.forEach(function(value) {
            if (value.presence.game != null) {
                try {
                    if (tempGameList[value.presence.game.name] == undefined) {
                        tempGameList[value.presence.game.name] =  {};
                        tempGameList[value.presence.game.name].count = 1;
                        var userArray = []
                        userArray.push(value.user.username)
                        tempGameList[value.presence.game.name].users = userArray;
                    } else {
                        tempGameList[value.presence.game.name].count += 1;
                        tempGameList[value.presence.game.name].users.push(value.user.username)
                    }
                } catch (err) {
                    console.log(err)
                    tempGameList[value.presence.game.name] = 1;
                }
            }
        });
        setTimeout(function() {
            gameList = tempGameList;
            var tempFields = []
            var keys = Object.keys(gameList);
            keys.sort(function(a, b) {
                return gameList[b].count - gameList[a].count
            });
            for (key in keys) {
                var field = {}
                field["name"] = keys[key];
                field["value"] = gameList[keys[key]].count;
                if (keys[key].length > 25) {
                    field["inline"] = "False";
                } else {
                    field["inline"] = "True";
                }
                tempFields.push(field)
            }
            setTimeout(function() {
                fields = tempFields;
            }, 500)
        }, 10000);
    } catch (err) {
        console.log(err)
    }
}

//--------------------------------------------------------- RUNNING LOOPS ---------------------------------------------------------

client.on('message', message => {
    try {
        if (message.content.slice(0, 20).toLowerCase() === '.listcurrentlyplayed') { //Lists the currently played games.
            var messageFields = []; //Fields to be used for the message
            var querier = client.guilds.get(guildID).members.get(message.author.id) //Get the Member object
            if (querier.roles.find('name', 'Moderator') != null || querier.roles.find('name', 'Coordinator') != null || querier.roles.find('name', 'Administrator') != null) { // ---------- SAFEGUARD ---------- Checks if user is mod or higher.
                try {
                    var required = message.content.slice(21); //Get the number
                } catch (err) {
                    var required = 0 //If there is no number, set number to 0.
                }
                for (i in fields) {
                    if (fields[i].value < required) { //If the game has less than the required players.
                        //donothing
                    } else {
                        messageFields.push(fields[i]) //If it meets the requirements, add to the games to be sent in the embeds.
                    }
                    if (i == fields.length - 1) { //When the for loop is done.
                        message.channel.send("Number of people playing each game currently:\n") //Everything below just sends the embedded messages.
                        var count = 19;
                        var oldCount = 0;
                        for (i = 0; i <= messageFields.length / 20; i++) {
                            try {
                                message.channel.send({
                                    embed: {
                                        color: 3447003,
                                        fields: messageFields.slice(oldCount, count),
                                    }
                                });
                                oldCount = count
                                count += 20
                            } catch (err) {
                                message.channel.send({
                                    embed: {
                                        color: 3447003,
                                        fields: messageFields.slice(oldCount),
                                    }
                                });
                            }
                        }
                    }
                }
            }
        };


        if (message.content.slice(0, 16).toLowerCase() === '.howmanyplaying ') { //Reports how many people are playing a certain game.
			var myRegexp = /[^\s"]+|"([^"]*)"/gi;
			var myString = message.content;
			var myArray = [];

			do {
				//Each call to exec returns the next regex match as an array
				var match = myRegexp.exec(myString);
				if (match != null) {
					//Index 1 in the array is the captured group if it exists
					//Index 0 is the matched text, which we use if no captured group exists
					myArray.push(match[1] ? match[1] : match[0]);
				}
			} while (match != null);
            game = myArray[1];
			showNames = false;
			if(myArray[2] !== void 0) {
				if (myArray[2].toLowerCase() == '--shownames') {
					showNames = true;
				}
			}
            if (gameList[game] == undefined) {
                var result = 0
            } else {
                var result = gameList[game].count
            }
            message.channel.send("There are `" + result + "` people playing `" + game + "` right now.")
			//if showNames is passed and there's more than 0 players in the game, show the name, duh
			if (showNames && result > 0) {
				//need an array to loop through and create a string then send it.
				message.channel.send("List of Users: " + gameList[game].users.join(", "));
			}
        };


        if (message.content.slice(0, 16).toLowerCase() === '.addrolemapping ') {
            if (message.guild.member(message.author.id).permissions.has('ADMINISTRATOR')) {
                //var params = message.content.toLowerCase().split(" ");
                //The parenthesis in the regex creates a captured group within the quotes
                var myRegexp = /[^\s"]+|"([^"]*)"/gi;
                var myString = message.content;
                var myArray = [];

                do {
                    //Each call to exec returns the next regex match as an array
                    var match = myRegexp.exec(myString);
                    if (match != null) {
                        //Index 1 in the array is the captured group if it exists
                        //Index 0 is the matched text, which we use if no captured group exists
                        myArray.push(match[1] ? match[1] : match[0]);
                    }
                } while (match != null);
                console.log(myArray);
                var role = myArray[2];
                //check if roles exists on the server
                //if so, map the game title to the role.
                matchingRoles = client.guilds.get(guildID).roles.findAll("name", role)
                if (matchingRoles.length == 0) {
                    message.channel.send("FAIL: There are no roles with that name, make sure character case is correct.")
                } else if (matchingRoles.length == 1) {
                    if (!matchingRoles[0].hasPermission('ADMINISTRATOR') && blackList.indexOf(matchingRoles[0].name.toLowerCase()) == -1) { //----------- SAFEGUARD ----------- Checks that the role to be mapped doesn't have admin permissions and the role name isn't in the blackList array
                        roleMap[myArray[1].toLowerCase()] = matchingRoles[0].id
                        fs.writeFile(roleMapFile, JSON.stringify(roleMap, null, 4));
                        message.channel.send("SUCCESS: Role `" + myArray[2] + "` mapped to game `" + myArray[1] + "`.")
                    }
                    if (matchingRoles[0].hasPermission('ADMINISTRATOR')) {
                        message.channel.send("FAIL: You can't map a role with Admin permissions.");
                    }
                    if (blackList.indexOf(matchingRoles[0].name.toLowerCase()) > -1) {
                        console.log(matchingRoles[0].name.toLowerCase(), role, blackList.indexOf(matchingRoles[0].name.toLowerCase()))
                        message.channel.send("FAIL: You can't map this role, it is on the blacklist.");
                    }
                } else {
                    message.channel.send("FAIL: There are 2 roles with this name, unable to map.")
                }
            };
        };


        if (message.content.slice(0, 19).toLowerCase() === '.removerolemapping ') {
            var params = message.content.toLowerCase().split(" ")
            if (message.guild.member(message.author.id).permissions.has('ADMINISTRATOR')) {
                delete roleMap[params[1]]
                console.log(roleMap)
                fs.writeFile(roleMapFile, JSON.stringify(roleMap, null, 4));
            }
        };


        if (message.content.slice(0, 16).toLowerCase() === '.listrolemapping') {
            var querier = client.guilds.get(guildID).members.get(message.author.id) //Get the Member object
            if (querier.roles.find('name', 'Moderator') != null || querier.roles.find('name', 'Coordinator') != null || querier.roles.find('name', 'Administrator') != null) { // ---------- SAFEGUARD ---------- Checks if user is mod or higher.
                var sendString = "```"
                arrayOfKeys = Object.keys(roleMap).sort()
                console.log(arrayOfKeys)
                for (key in arrayOfKeys) {
                    sendString = sendString.concat(arrayOfKeys[key] + ": " + roleMap[arrayOfKeys[key]] + "\n")
                }
                setTimeout(function() {
                    sendString = sendString.concat("```")
                    message.channel.send(sendString)
                }, 100)
            }
        };


    } catch (err) {
        console.log(err)
    }
});

client.on('presenceUpdate', function(oldUser, newUser) {
    try {
        var member = client.guilds.get(guildID).members.get(newUser.id);
        if (newUser.presence.game == null || newUser.presence.game.type != 0) {
            //do nothing
        } else {
            console.log(newUser.user.username + ' is playing ' + newUser.presence.game.name);
            if (newUser.presence.game.name.toLowerCase() in roleMap) {
                //console.log("MAPPED: This game is mapped...");
                //do they already have the role? we shouldn't add it again...
                if (member.roles.get(roleMap[newUser.presence.game.name.toLowerCase()])) {
                    console.log('>> ' + newUser.user.username + ' already has role.');
                } else {
                    //they do not, add them to the role
                    console.log('>>: ' + newUser.user.username + ' has been added to role.');
                    member.addRole(roleMap[newUser.presence.game.name.toLowerCase()]);
                }
                /**
            	client.guilds.get(guildID).roles.forEach(function(role) {
            		console.log(role.name, roleMap[newUser.presence.game.name.toLowerCase()])
            		if (role.name == roleMap[newUser.presence.game.name.toLowerCase()]) {
            			member.addRole(role.id);
            		}
            	})
				**/
            }else{
            	console.log("WARNING: This game does not have a mapping.");
            }
        }
    } catch (err) {
        console.log(err)
    }
});

setInterval(function() {
    updateGameList()
}, 30000)