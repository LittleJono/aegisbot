/* COMMANDS 
	.addrolemapping gameName role - Maps gameName to a role, when a member is playing gameName they will be given the mapped role.
	.removerolemapping gameName - Removes a role mapping for gameName.
	.listrolemapping - List all the current role mappings.
	.howmanyplaying gameName - Lists how many people on the server are playing gameName
	.listcurrentlyplayed number(optional) - Lists all the games people are playing and how many are playing currently.
*/

//--------------------------------------------------------- BOT SETUP ---------------------------------------------------------

var fs = require('fs');
var config = require('../config/config'); //Load the configuration from config.js
const logger = require('../functions/logger');

var path = require('path');
path = path.basename(__filename);

const guildID = config.guildID;
var gameList = {}; //Games and their player Counts
var fields = []; //Above formatted for Embedded messages.
var tempGameList = {} //Used for storing the new cashe before it is pushed to gameList
var roleMap = {} // GET FROM JSON FILE
var roleMapFile = "cacheFiles/roleMap.json";
var optOutRoleName = 'NoAutoRoles';

const blackList = ['moderator', "coordinator", "administrator"] //Roles that can't be mapped. MAKE SURE THEY ARE LOWERCASE.

//--------------------------------------------------------- FUNCTIONS AND FILES ---------------------------------------------------------


function updateGameList(client) { //Used to cashe the currently played games.
  try {
    tempGameList = {}
    client.guilds.get(guildID).members.forEach(function(value) {
      if (value.presence.game != null && value.presence.game.type == 0 && !value.user.bot) {
        try {
          if (tempGameList[value.presence.game.name] == undefined) {
            tempGameList[value.presence.game.name] = {};
            tempGameList[value.presence.game.name].count = 1;
            var userArray = []
            userArray.push(value.user.username + '#' + value.user.discriminator + '(<@' + value.user.id + '>)')
            tempGameList[value.presence.game.name].users = userArray;
          } else {
            tempGameList[value.presence.game.name].count += 1;
            tempGameList[value.presence.game.name].users.push(value.user.username + '#' + value.user.discriminator + '(<@' + value.user.id + '>)')
          }
        } catch (err) {
          logger.log(err, path)
          tempGameList[value.presence.game.name] = 1;
        }
      }
    });
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
    fields = tempFields;
  } catch (err) {}
}


var autoRoles = {
  loadModule: (client) => {

    fs.readFile(roleMapFile, (err, data) => { //Gets the previous role mappings.
      try {
        roleMap = JSON.parse(data);
      } catch (err) {
        //do nothing
      }
    });

    client.on('message', message => {
      try {
        var messageParams = message.content.toLowerCase().split(" ");
        if (messageParams[0] == '.listcurrentlyplayed') { //Lists the currently played games.
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

        if (messageParams[0] == '.howmanyplaying') { //Reports how many people are playing a certain game.
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
          if (myArray[2] !== void 0) {
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

        if (messageParams[0] == '.addrolemapping') {
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
            var role = myArray[2];
            //check if roles exists on the server
            //if so, map the game title to the role.
            matchingRoles = client.guilds.get(guildID).roles.findAll("name", role)
            if (matchingRoles.length == 0) {
              message.channel.send("FAIL: There are no roles with that name, make sure character case is correct.")
            } else if (matchingRoles.length == 1) {
              if (!matchingRoles[0].hasPermission('ADMINISTRATOR') && blackList.indexOf(matchingRoles[0].name.toLowerCase()) == -1) { //----------- SAFEGUARD ----------- Checks that the role to be mapped doesn't have admin permissions and the role name isn't in the blackList array
                roleMap[myArray[1].toLowerCase()] = matchingRoles[0].id
                fs.writeFile(roleMapFile, JSON.stringify(roleMap, null, 4), (error) => { /* handle error */ });
                message.channel.send("SUCCESS: Role `" + myArray[2] + "` mapped to game `" + myArray[1] + "`.")
              }
              if (matchingRoles[0].hasPermission('ADMINISTRATOR')) {
                message.channel.send("FAIL: You can't map a role with Admin permissions.");
              }
              if (blackList.indexOf(matchingRoles[0].name.toLowerCase()) > -1) {
                logger.log((matchingRoles[0].name.toLowerCase(), role, blackList.indexOf(matchingRoles[0].name.toLowerCase())), path)
                message.channel.send("FAIL: You can't map this role, it is on the blacklist.");
              }
            } else {
              message.channel.send("FAIL: There are 2 roles with this name, unable to map.")
            }
          };
        };

        if (messageParams[0] == '.removerolemapping') {
          var params = message.content.toLowerCase().split(" ")
          if (message.guild.member(message.author.id).permissions.has('ADMINISTRATOR')) {
            delete roleMap[params[1]]
            fs.writeFile(roleMapFile, JSON.stringify(roleMap, null, 4));
          }
        };

        if (messageParams[0] == '.listrolemapping') {
          var querier = client.guilds.get(guildID).members.get(message.author.id) //Get the Member object
          if (querier.roles.find('name', 'Moderator') != null || querier.roles.find('name', 'Coordinator') != null || querier.roles.find('name', 'Administrator') != null) { // ---------- SAFEGUARD ---------- Checks if user is mod or higher.
            var sendString = "```"
            arrayOfKeys = Object.keys(roleMap).sort()
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
        logger.log(err, path);
      }
    });

    client.on('presenceUpdate', function(oldUser, newUser) {
      if (newUser.user.bot) {
        //console.log(newUser.user.username + ' is a bot. Ignoring.');
        return;
      }
      try {
        var member = client.guilds.get(guildID).members.get(newUser.id);
        if (newUser.presence.game == null || newUser.presence.game.type != 0) {
          //do nothing
        } else {
          // console.log(newUser.user.username + ' is playing ' + newUser.presence.game.name);
          if (newUser.presence.game.name.toLowerCase() in roleMap) {
            //console.log("MAPPED: This game is mapped...");
            //do they already have the role? we shouldn't add it again...
            if (member.roles.get(roleMap[newUser.presence.game.name.toLowerCase()])) {
              //console.log('>> ' + newUser.user.username + ' already has role.');
            } else {
              //they do not, add them to the role
              if (member.roles.find("name", optOutRoleName)) {
                //console.log('DENY: ' + newUser.user.username + ' is in Role: `' + optOutRoleName + '`. Cannot assign role.');
                return;
              }
              //console.log('>>: ' + newUser.user.username + ' has been added to role.');
              member.addRole(roleMap[newUser.presence.game.name.toLowerCase()]);
            }
          } /*else {
            console.log("WARNING: This game does not have a mapping.");
          }*/
        }
      } catch (err) {
        logger.log(err, path)
      }
    });

    setInterval(function() {
      updateGameList(client)
    }, 30000)
  }
}

module.exports = autoRoles;