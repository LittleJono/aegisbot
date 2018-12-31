/* COMMANDS
  .addrolemapping gameName role - Maps gameName to a role, when a member is playing gameName they will be given the mapped role.
  .removerolemapping gameName - Removes a role mapping for gameName.
  .listrolemapping - List all the current role mappings.
  .howmanyplaying gameName - Lists how many people on the server are playing gameName
  .listcurrentlyplayed number(optional) - Lists all the games people are playing and how many are playing currently.
*/

// --------------------------------------------------------- BOT SETUP ---------------------------------------------------------

let path = require('path');
const fs = require('fs');
const config = require('../config/config'); // Load the configuration from config.js
const logger = require('../functions/logger');


path = path.basename(__filename);

const {
  guildID
} = config;
let gameList = {}; // Games and their player Counts
let fields = []; // Above formatted for Embedded messages.
let tempGameList = {}; // Used for storing the new cashe before it is pushed to gameList
let roleMap = {}; // GET FROM JSON FILE
const roleMapFile = 'cacheFiles/roleMap.json';
const optInRoleName = 'AutoRoles';

const blackList = ['moderator', 'coordinator', 'administrator']; // Roles that can't be mapped. MAKE SURE THEY ARE LOWERCASE.

// --------------------------------------------------------- FUNCTIONS AND FILES ---------------------------------------------------------


function updateGameList(client) { // Used to cashe the currently played games.
  try {
    tempGameList = {};
    client.guilds.get(guildID).members.forEach((value) => {
      if (value.presence.game != null && value.presence.game.type === 0 && !value.user.bot) {
        try {
          if (tempGameList[value.presence.game.name] === undefined) {
            tempGameList[value.presence.game.name] = {};
            tempGameList[value.presence.game.name].count = 1;
            const userArray = [];
            userArray.push(`${value.user.username}#${value.user.discriminator}(<@${value.user.id}>)`);
            tempGameList[value.presence.game.name].users = userArray;
          } else {
            tempGameList[value.presence.game.name].count += 1;
            tempGameList[value.presence.game.name].users.push(`${value.user.username}#${value.user.discriminator}(<@${value.user.id}>)`);
          }
        } catch (err) {
          logger.log(err, path);
          console.log(err);
          tempGameList[value.presence.game.name] = 1;
        }
      }
    });
    gameList = tempGameList;
    const tempFields = [];
    const keys = Object.keys(gameList);
    keys.sort((a, b) => {
      return gameList[b].count - gameList[a].count;
    });
    Object.keys(keys).forEach((key) => {
      const field = {};
      field.name = keys[key];
      field.value = gameList[keys[key]].count;
      if (keys[key].length > 25) {
        field.inline = 'False';
      } else {
        field.inline = 'True';
      }
      tempFields.push(field);
    });
    fields = tempFields;
  } catch (err) {
    logger.log(err, path);
  }
}


const autoRoles = {
  loadModule: (client) => {
    fs.readFile(roleMapFile, (err, data) => { // Gets the previous role mappings.
      try {
        roleMap = JSON.parse(data);
      } catch (theErr) {
        // do nothing
      }
    });

    client.on('message', (message) => {
      try {
        const messageParams = message.content.toLowerCase().split(' ');
        if (messageParams[0] === '.listcurrentlyplayed') { // Lists the currently played games.
          const messageFields = []; // Fields to be used for the message
          const querier = client.guilds.get(guildID).members.get(message.author.id); // Get the Member object
          if (querier.roles.find(x => x.name === 'Moderator') !== null || querier.roles.find(x => x.name === 'Coordinator') !== null || querier.roles.find(x => x.name === 'Administrator') !== null) { // ---------- SAFEGUARD ---------- Checks if user is mod or higher.
            let required;
            try {
              required = message.content.slice(21); // Get the number
            } catch (err) {
              required = 0; // If there is no number, set number to 0.
            }
            Object.keys(fields).forEach((i) => {
              if (fields[i].value < required) { // If the game has less than the required players.
                // do nothing
              } else {
                messageFields.push(fields[i]); // If it meets the requirements, add to the games to be sent in the embeds.
              }
              if (Number.parseInt(i, 10) === (fields.length - 1)) { // When the for loop is done.
                message.channel.send('Number of people playing each game currently:\n'); // Everything below just sends the embedded messages.
                let count = 19;
                let oldCount = 0;
                for (let a = 0; a <= messageFields.length / 20; a += 1) {
                  try {
                    message.channel.send({
                      embed: {
                        color: 3447003,
                        fields: messageFields.slice(oldCount, count),
                      }
                    });
                    oldCount = count;
                    count += 20;
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
            });
          }
        }

        if (messageParams[0] === '.howmanyplaying') { // Reports how many people are playing a certain game.
          const myRegexp = /[^\s"]+|"([^"]*)"/gi;
          const myString = message.content;
          const myArray = [];
          let match;
          do {
            // Each call to exec returns the next regex match as an array
            match = myRegexp.exec(myString);
            if (match !== null) {
              // Index 1 in the array is the captured group if it exists
              // Index 0 is the matched text, which we use if no captured group exists
              myArray.push(match[1] ? match[1] : match[0]);
            }
          } while (match !== null);
          const game = myArray[1];
          let showNames = false;
          if (myArray[2] !== undefined) {
            if (myArray[2].toLowerCase() === '--shownames') {
              showNames = true;
            }
          }
          let result;
          if (gameList[game] === undefined) {
            result = 0;
          } else {
            result = gameList[game].count;
          }
          message.channel.send(`There are \`${result}\` people playing \`${game}\` right now.`);
          // if showNames is passed and there's more than 0 players in the game, show the name, duh
          if (showNames && result > 0) {
            // need an array to loop through and create a string then send it.
            message.channel.send(`List of Users: ${gameList[game].users.join(', ')}`);
          }
        }

        if (messageParams[0] === '.addrolemapping') {
          if (message.guild.member(message.author.id).permissions.has('ADMINISTRATOR')) {
            // const params = message.content.toLowerCase().split(" ");
            // The parenthesis in the regex creates a captured group within the quotes
            const myRegexp = /[^\s"]+|"([^"]*)"/gi;
            const myString = message.content;
            const myArray = [];
            let match;
            do {
              // Each call to exec returns the next regex match as an array
              match = myRegexp.exec(myString);
              if (match !== null) {
                // Index 1 in the array is the captured group if it exists
                // Index 0 is the matched text, which we use if no captured group exists
                myArray.push(match[1] ? match[1] : match[0]);
              }
            } while (match != null);
            const role = myArray[2];
            // check if roles exists on the server
            // if so, map the game title to the role.
            const matchingRoles = client.guilds.get(guildID).roles.filter(x => x.name === role);
            if (matchingRoles.size === 0) {
              message.channel.send('FAIL: There are no roles with that name, make sure character case is correct.');
            } else if (matchingRoles.size === 1) {
              const assignedRole = matchingRoles.values().next().value;
              if (!assignedRole.hasPermission('ADMINISTRATOR') && blackList.indexOf(assignedRole.name.toLowerCase()) === -1) { // ----------- SAFEGUARD ----------- Checks that the role to be mapped doesn't have admin permissions and the role name isn't in the blackList array
                roleMap[myArray[1].toLowerCase()] = assignedRole.id;
                fs.writeFile(roleMapFile, JSON.stringify(roleMap, null, 4), (error) => {
                  logger.log(error, path);
                });
                message.channel.send(`SUCCESS: Role \`${myArray[2]}\` mapped to game \`${myArray[1]}\`.`);
              }
              if (assignedRole.hasPermission('ADMINISTRATOR')) {
                message.channel.send("FAIL: You can't map a role with Admin permissions.");
              }
              if (blackList.indexOf(assignedRole.name.toLowerCase()) > -1) {
                logger.log((assignedRole.name.toLowerCase(), role, blackList.indexOf(assignedRole.name.toLowerCase())), path);
                message.channel.send("FAIL: You can't map this role, it is on the blacklist.");
              }
            } else {
              message.channel.send('FAIL: There are 2 roles with this name, unable to map.');
            }
          }
        }

        if (messageParams[0] === '.removerolemapping') {
          const params = message.content.toLowerCase().split(' ');
          if (message.guild.member(message.author.id).permissions.has('ADMINISTRATOR')) {
            delete roleMap[params[1]];
            fs.writeFile(roleMapFile, JSON.stringify(roleMap, null, 4), (err) => {
              if (err) logger.log(err);
            });
          }
        }

        if (messageParams[0] === '.listrolemapping') {
          const querier = client.guilds.get(guildID).members.get(message.author.id); // Get the Member object
          if (querier.roles.find(x => x.name === 'Moderator') != null || querier.roles.find(x => x.name === 'Coordinator') != null || querier.roles.find(x => x.name === 'Administrator') != null) { // ---------- SAFEGUARD ---------- Checks if user is mod or higher.
            let sendString = '```';
            Object.keys(roleMap).forEach((key) => {
              sendString = sendString.concat(`${key}: ${roleMap[key]}\n`);
            });
            setTimeout(() => {
              sendString = sendString.concat('```');
              message.channel.send(sendString);
            }, 100);
          }
        }
      } catch (err) {
        logger.log(err, path);
      }
    });

    client.on('presenceUpdate', (oldUser, newUser) => {
      if (newUser.user.bot) {
        // console.log(newUser.user.username + ' is a bot. Ignoring.');
        return;
      }
      try {
        const member = client.guilds.get(guildID).members.get(newUser.id);
        if (newUser.presence.game == null || newUser.presence.game.type !== 0) {
          // do nothing
        } else if (newUser.presence.game.name.toLowerCase() in roleMap) {
          // console.log("MAPPED: This game is mapped...");
          // do they already have the role? we shouldn't add it again...
          if (member.roles.get(roleMap[newUser.presence.game.name.toLowerCase()])) {
            // console.log('>> ' + newUser.user.username + ' already has role.');
          } else if (member.roles.find(x => x.name === optInRoleName)) {
            member.addRole(roleMap[newUser.presence.game.name.toLowerCase()]);
            logger.log(`Assigned ${newUser.presence.game.name.toLowerCase()} to ${newUser.user.username}`, path);
          }
        }
      } catch (err) {
        logger.log(err, path);
      }
    });

    updateGameList(client);
    setInterval(() => {
      updateGameList(client);
    }, 30000);
  }
};

module.exports = autoRoles;
