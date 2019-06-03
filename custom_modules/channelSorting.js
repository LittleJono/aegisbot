const rp = require('request-promise');
const _ = require('lodash');
let path = require('path');
const config = require('../config/config');
const logger = require('../functions/logger');

const { token } = config;
const { guildID } = config;

path = path.basename(__filename);

const options = {
  method: 'GET',
  uri: `https://discordapp.com/api/guilds/${guildID}/channels`,
  headers: {
    Authorization: `Bot ${token}`,
    'User-Agent': 'DiscordBot (*, *)'
  }
};

const channelSorting = {
  loadModule: (client) => {
    client.on('message', (message) => {
      try {
        const messageParams = message.content.toLowerCase().split(' ');

        if (!message.guild.member(message.author.id).permissions.has('ADMINISTRATOR')) return;

        if (messageParams[0] === '.sortchannels') {
          const parentChannelID = messageParams[1];
          rp(options)
            .then((body) => {
              const childChannels = {};
              const childChannelNames = [];
              const output = JSON.parse(body);
              // console.log(JSON.stringify(output, null, 4))
              const guildChannels = client.guilds.get(guildID).channels;

              _.forEach(output, (channel) => {
                if (channel.parent_id === parentChannelID) {
                  childChannelNames.push(channel.name);
                  childChannels[channel.name] = {
                    id: channel.id,
                    position: channel.position
                  };
                }
              });

              if (childChannelNames.length === 0) {
                message.channel.send('Cannot find channel with that ID.');
                logger.log(`Channel with ID ${parentChannelID} not found.`, path);
                return;
              }

              const childChannelNamesSorted = childChannelNames.sort();
              let count = 1;
              _.forEach(childChannelNamesSorted, (name) => {
                const actualName = name;
                logger.log(`Sorting #${actualName} Position: ${count}`, path);
                const channel = guildChannels.get(childChannels[actualName].id);
                channel.edit({
                  position: count,
                  bitrate: 96000
                });
                count += 1;
              });

              message.channel.send('Channels sorted.');
              logger.log('Channels sorted.', path);
            })
            .catch((err) => {
              logger.log(err, path);
            });
        }
      } catch (err) {
        logger.log(err, path);
      }
    });
  }
};

module.exports = channelSorting;
