const path = require('path');
const fs = require('fs');

const thePath = path.basename(__filename);

const logger = require('../functions/logger'); // Load the configuration from config.js
const config = require('../config/config'); // Load the configuration from config.js

const iamRolesFile = 'cacheFiles/iamRoles.json';

const blackList = ['moderator', 'coordinator', 'administrator', 'member']; // Roles that can't be mapped. MAKE SURE THEY ARE LOWERCASE.

const { guildID } = config;

let iamRoles = {};


// SEE CASE WHERE ROLE HAS ALREADY BEEN MAPPED BUT A NEW ROLE WITH THE SAME NAME IS CREATED. MIGHT NOT NEED TO DO ANYTHING?

const roleAssignment = {
  loadModule: (client) => {
    fs.readFile(iamRolesFile, (err, data) => { // Gets the previous role mappings.
      try {
        iamRoles = JSON.parse(data);
      } catch (theErr) {
        // do nothing
      }
    });

    client.on('message', (message) => {
      try {
        const messageString = message.content.toLowerCase();
        const role = messageString.split(' ').slice(1).join(' ');

        const matchingRoles = client.guilds.get(guildID).roles.filter(x => x.name.toLowerCase() === role);

        if (messageString.indexOf('.iam ') === 0) {
          if (matchingRoles.size === 1) {
            const assignedRole = matchingRoles.values().next().value;
            if (assignedRole.hasPermission('ADMINISTRATOR') || blackList.indexOf(assignedRole.name.toLowerCase()) > -1) {
              message.channel.send('How about no.');
              return;
            }
          }
          if (iamRoles[role]) {
            client.guilds.get(guildID).members.get(message.author.id).addRole(iamRoles[role]);
            message.channel.send(`${role} added.`);
          } else {
            message.channel.send("Role doesn't exist or isn't assignable.");
          }
        }

        if (messageString.indexOf('.iamnot ') === 0) {
          if (matchingRoles.size === 1) {
            const assignedRole = matchingRoles.values().next().value;
            if (assignedRole.hasPermission('ADMINISTRATOR') || blackList.indexOf(assignedRole.name.toLowerCase()) > -1) {
              message.channel.send('How about no.');
              return;
            }
          }
          if (iamRoles[role]) {
            client.guilds.get(guildID).members.get(message.author.id).removeRole(iamRoles[role]);
            message.channel.send(`${role} removed.`);
          } else {
            message.channel.send("Role doesn't exist or isn't removable.");
          }
        }

        if (messageString.indexOf('.lsar') === 0) {
          let replyString = '```\n';
          Object.keys(iamRoles).forEach((name) => { replyString = `${replyString}${name}\n`; });
          replyString = `${replyString}\`\`\``;
          message.channel.send(replyString);
        }
        if (messageString.indexOf('.asar ') === 0) {
          if (message.guild.member(message.author.id).permissions.has('ADMINISTRATOR')) {
            if (matchingRoles.size === 0) {
              message.channel.send('FAIL: There are no roles with that name, make sure character case is correct.');
            } else if (matchingRoles.size === 1) {
              const assignedRole = matchingRoles.values().next().value;
              if (!assignedRole.hasPermission('ADMINISTRATOR') && blackList.indexOf(assignedRole.name.toLowerCase()) === -1) { // ----------- SAFEGUARD ----------- Checks that the role to be mapped doesn't have admin permissions and the role name isn't in the blackList array
                iamRoles[role] = assignedRole.id;
                fs.writeFile(iamRolesFile, JSON.stringify(iamRoles, null, 4), (error) => {
                  if (error) logger.log(error, thePath);
                });
                message.channel.send(`Added role: ${role}`);
              }
              if (assignedRole.hasPermission('ADMINISTRATOR')) {
                message.channel.send("FAIL: You can't map a role with Admin permissions.");
              }
              if (blackList.indexOf(assignedRole.name.toLowerCase()) > -1) {
                message.channel.send("FAIL: You can't map this role, it is on the blacklist.");
              }
            } else {
              message.channel.send('FAIL: There are 2 roles with this name, unable to map.');
            }
          }
        }
        if (messageString.indexOf('.rsar ') === 0) {
          if (message.guild.member(message.author.id).permissions.has('ADMINISTRATOR')) {
            if (matchingRoles.size === 0) {
              message.channel.send('FAIL: There are no roles with that name, make sure character case is correct.');
            } else if (matchingRoles.size === 1) {
              delete iamRoles[role];
              fs.writeFile(iamRolesFile, JSON.stringify(iamRoles, null, 4), (error) => {
                if (error) logger.log(error, thePath);
              });
              message.channel.send(`Removed role: ${role}`);
            } else {
              message.channel.send('FAIL: There are 2 roles with this name, unable to map.');
            }
          }
        }
      } catch (err) {
        logger.log(err, thePath);
      }
    });
  }
};

module.exports = roleAssignment;
