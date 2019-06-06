let path = require('path');
const logger = require('../functions/logger'); // Load the configuration from config.js
const config = require('../config/config');

path = path.basename(__filename);


const { usefulLogChannelID } = config;
const { uselessLogChannelID } = config;
const { guildID } = config;


const antiWord = {
  loadModule: (client) => {
    client.on('channelCreate', (channel) => {
      try {
        const logMessage = `\`\`\`Channel Created: ${channel.name}\`\`\``;
        logger.log(logMessage, path);
        client.guilds.get(guildID).channels.get(usefulLogChannelID).send(logMessage);
      } catch (err) {
        logger.log(err, path);
      }
    });

    client.on('channelDelete', (channel) => {
      try {
        const logMessage = `\`\`\`Channel Deleted: ${channel.name}\`\`\``;
        logger.log(logMessage, path);
        client.guilds.get(guildID).channels.get(usefulLogChannelID).send(logMessage);
      } catch (err) {
        logger.log(err, path);
      }
    });

    client.on('channelUpdate', (oldChannel, newChannel) => {
      try {
        if (newChannel.name === oldChannel.name) {
          return;
        }
        const logMessage = `\`\`\`Channel Updated: ${oldChannel.name} -> ${newChannel.name}\`\`\``;
        logger.log(logMessage, path);
        client.guilds.get(guildID).channels.get(uselessLogChannelID).send(logMessage);
      } catch (err) {
        logger.log(err, path);
      }
    });

    client.on('guildBanAdd', (user) => {
      try {
        const logMessage = `\`\`\`User Banned: ${user.tag} ${user.id}\`\`\``;
        logger.log(logMessage, path);
        client.guilds.get(guildID).channels.get(usefulLogChannelID).send(logMessage);
      } catch (err) {
        logger.log(err, path);
      }
    });

    client.on('guildBanRemove', (user) => {
      try {
        const logMessage = `\`\`\`User Unbanned: ${user.tag} ${user.id}\`\`\``;
        logger.log(logMessage, path);
        client.guilds.get(guildID).channels.get(usefulLogChannelID).send(logMessage);
      } catch (err) {
        logger.log(err, path);
      }
    });

    client.on('guildMemberAdd', (user) => {
      try {
        const logMessage = `\`\`\`User Joined: ${user.tag} ${user.id}\`\`\``;
        logger.log(logMessage, path);
        client.guilds.get(guildID).channels.get(usefulLogChannelID).send(logMessage);
      } catch (err) {
        logger.log(err, path);
      }
    });

    client.on('guildMemberRemove', (user) => {
      try {
        const logMessage = `\`\`\`User Left: ${user.tag} ${user.id}\`\`\``;
        logger.log(logMessage, path);
        client.guilds.get(guildID).channels.get(usefulLogChannelID).send(logMessage);
      } catch (err) {
        logger.log(err, path);
      }
    });

    client.on('guildMemberUpdate', (oldUser, newUser) => {
      try {
        const logMessage = `\`\`\`User Updated: ${newUser.tag}, ${newUser.id}\`\`\``;
        logger.log(logMessage, path);
        client.guilds.get(guildID).channels.get(uselessLogChannelID).send(logMessage);
      } catch (err) {
        logger.log(err, path);
      }
    });

    client.on('guildUpdate', () => {
      try {
        const logMessage = '```Guild Updated, see audit log```';
        logger.log(logMessage, path);
        client.guilds.get(guildID).channels.get(usefulLogChannelID).send(logMessage);
      } catch (err) {
        logger.log(err, path);
      }
    });

    client.on('messageDelete', (message) => {
      try {
        const logMessage = `\`\`\`Message Deleted: ${message}\n  Author:  ${message.author.tag}, ${message.author.id}\`\`\``;
        logger.log(logMessage, path);
        client.guilds.get(guildID).channels.get(usefulLogChannelID).send(logMessage);
      } catch (err) {
        logger.log(err, path);
      }
    });

    client.on('messageUpdate', (oldMessage, newMessage) => {
      try {
        const logMessage = `\`\`\`Message Updated:\n  Old Message: ${oldMessage}\n  New Message: ${newMessage}\n  Author:  ${newMessage.author.tag}, ${newMessage.author.id}\`\`\``;
        logger.log(logMessage, path);
        client.guilds.get(guildID).channels.get(usefulLogChannelID).send(logMessage);
      } catch (err) {
        logger.log(err, path);
      }
    });

    client.on('roleCreate', (role) => {
      try {
        const logMessage = `\`\`\`Role Created: ${role.name}\`\`\``;
        logger.log(logMessage, path);
        client.guilds.get(guildID).channels.get(usefulLogChannelID).send(logMessage);
      } catch (err) {
        logger.log(err, path);
      }
    });

    client.on('roleDelete', (role) => {
      try {
        const logMessage = `\`\`\`Role Deleted: ${role.name}\`\`\``;
        logger.log(logMessage, path);
        client.guilds.get(guildID).channels.get(usefulLogChannelID).send(logMessage);
      } catch (err) {
        logger.log(err, path);
      }
    });

    client.on('roleUpdate', (newRole) => {
      try {
        const logMessage = `\`\`\`Role Updated: ${newRole.name}\`\`\``;
        logger.log(logMessage, path);
        client.guilds.get(guildID).channels.get(usefulLogChannelID).send(logMessage);
      } catch (err) {
        logger.log(err, path);
      }
    });

    client.on('voiceStateUpdate', async (oldMember, newMember) => {
      try {
        const logMessage = (newMember.voiceChannel) ? `\`\`\`${newMember.user.tag} joined channel ${newMember.voiceChannel.name}\`\`\`` : `\`\`\`${newMember.user.tag} left channel ${oldMember.voiceChannel.name}\`\`\``;
        logger.log(logMessage, path);
        client.guilds.get(guildID).channels.get(uselessLogChannelID).send(logMessage);
      } catch (err) {
        logger.log(err, path);
      }
    });
  }
};

module.exports = antiWord;
