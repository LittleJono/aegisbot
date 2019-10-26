const fs = require('fs');
let path = require('path');

const config = require('../config/config');
const logger = require('../functions/logger');

path = path.basename(__filename);

const channelFile = 'cacheFiles/channelRenamingCashe.js';
const { guildID } = config; // This is correct for Aegis7
const memberPrefix = '[M] ';
const requiredRoleID = config.notifyRequiredRoleID;
const requiredBitrate = process.env.discordBitrate || 96000;

/*
.autoRename channelID - Adds a channel to be auto-renamed.
.changeName channelID newName - Changes the name a channel will revert to.
.removeAutoRename channelID - Removes a channel from being auto-renamed.
.listAutoRename - Lists all the channels that are being auto-renamed

channelID can be found by rightclicking on the channel -> 'Copy ID'
*/

let channels = {};
let foobar;

function revertChannel(value) {
  try {
    if (value.type === 'voice' && value.id in channels) {
      if (value.name !== channels[value.id]) {
        value.edit({
          name: channels[value.id],
          bitrate: requiredBitrate
        });
        logger.log(`Restored Channel: ${value.name}\t to: \t${channels[value.id]}`, path);
      }
    }
  } catch (err) {
    logger.log(err, path);
  }
}

function logElements(value) {
  try {
    if (value.type === 'voice' && value.id in channels) {
      const game = {};
      value.members.forEach((value2) => {
        if (value2.roles.get(requiredRoleID)) {
          // checks for member
          try {
            if (value2.presence.game.url == null) {
              if (isNaN(game[value2.presence.game.name])) {
                game[value2.presence.game.name] = 1;
              } else {
                game[value2.presence.game.name] += 1;
              }
            }
          } catch (err) {
            // logger.log(err, path); REMOVED THE LOG HERE, this is where the NULLs are coming from. It's supposed to not work.
          }
        }
      });
      let max = 0;
      let count = 0;
      let gameValue = '';
      let total = 0;
      Object.keys(game).forEach((key) => {
        total += game[key];
        if (game[key] > max) {
          max = game[key];
          gameValue = key;
        }
      });
      if (max / total > 0.49) {
        Object.keys(game).forEach((key) => {
          if (game[key] === max) {
            count += 1;
          }
        });
        if (count > 1 || count === 0) {
          if (value.name !== channels[value.id]) {
            value.edit({
              name: channels[value.id],
              bitrate: requiredBitrate
            });
            logger.log(`Restored Channel: ${value.name}\t to: \t${channels[value.id]}`, path);
          }
        }

        else if (value.name !== gameValue && value.name !== memberPrefix + gameValue) {
          if (value.name.toLowerCase().indexOf('member') > -1) {
            gameValue = memberPrefix + gameValue;
          }
          value.edit({
            name: gameValue,
            bitrate: requiredBitrate
          });
          logger.log(`Auto Renamed Channel: ${channels[value.id]}\t to: \t${gameValue}`, path);
        }
      }
      if (value.name !== channels[value.id]) {
        value.edit({
          name: channels[value.id],
          bitrate: requiredBitrate
        });
        logger.log(`Restored Channel: ${value.name}\t to: \t${channels[value.id]}`, path);
      }
    }
  } catch (err) {
    logger.log(err, path);
  }
}

const channelRenaming = {
  loadModule: (client) => {
    logger.log('Starting Service', path);

    fs.readFile(channelFile, (err, data) => {
      try {
        channels = JSON.parse(data);
        const channelCount = Object.keys(channels).length;
        logger.log(`Loaded ${channelCount} channels to rename from ${channelFile}`, path);
      } catch (error) {
        logger.log(error, path);
      }
    });

    client.on('message', (msg) => {
      const messageArray = msg.content.toLowerCase().split(' ');

      if (!msg.guild.member(msg.author.id).permissions.has('ADMINISTRATOR')) {
        return;
      }

      if (msg.content.slice(0, 12).toLowerCase() === '.autorename ') {
        try {
          const channelID = msg.content.slice(12);
          if (client.guilds.get(guildID).channels.get(channelID).type === 'voice') {
            channels[channelID] = client.guilds.get(guildID).channels.get(channelID).name;
            msg.channel.send(
              `\`\`\`Channel: ${channels[channelID]} ADDED to Auto Renamer by user: ${msg.author.username}\`\`\``
            );
            logger.log(`Channel: ${channels[channelID]} ADDED to Auto Renamer by user: ${msg.author.username}`, path);
            fs.writeFile(channelFile, JSON.stringify(channels, null, 4), (err) => {
              if (err) throw err;
            });
          } else {
            msg.channel.send('That channel does not exist or is not a voice channel.');
          }
        } catch (err) {
          logger.log(err, path);
        }
      }

      if (messageArray[0] === '.changename') {
        try {
          const changesID = messageArray[1];
          const changes = messageArray[2];
          if (!channels[changesID]) {
            msg.channel.send(`Renamed channel ${[changesID]} to ${messageArray[2]}`);
            channels[changesID] = changes;
            fs.writeFile(channelFile, JSON.stringify(channels, null, 4), (err) => {
              if (err) throw err;
            });
          } else {
            msg.channel.send("That channel isn't currently auto-renaming.");
          }
        } catch (err) {
          logger.log(err, path);
        }
      }

      if (msg.content.slice(0, 18).toLowerCase() === '.removeautorename ') {
        try {
          const channelID = msg.content.slice(18);
          const channel = client.guilds.get(guildID).channels.get(channelID);
          logger.log(
            `\`\`\`Channel: ${channel.name} REMOVED from Auto Renamer by user: ${msg.author.username}\`\`\``,
            path
          );
          revertChannel(channel);
          delete channels[channelID];
          msg.channel.send(
            `\`\`\`Channel: ${channel.name} REMOVED from Auto Renamer by user: ${msg.author.username}\`\`\``
          );
          fs.writeFile(channelFile, JSON.stringify(channels, null, 4), (err) => {
            if (err) throw err;
          });
        } catch (err) {
          logger.log(err, path);
        }
      }

      if (msg.content.toLowerCase() === '.listautorename') {
        try {
          let replyString = '```Voice channels auto-named:\n\n';

          Object.entries(channels).forEach((tuple) => {
            replyString += `${tuple[1]}: ${tuple[0]}\n`;
          });

          replyString += '```';
          msg.channel.send(replyString);
        } catch (err) {
          logger.log(err, path);
        }
      }
    });

    foobar = setInterval(() => {
      try {
        client.guilds.get(guildID).channels.forEach(logElements);
      } catch (err) {
        logger.log(err, path);
      }
    }, 1000);
  },
  exit: (client) => {
    try {
      clearInterval(foobar);
      client.guilds.get(guildID).channels.forEach(revertChannel);
    } catch (err) {
      logger.log(err, path);
    }
  }
};

module.exports = channelRenaming;

