var rp = require('request-promise');
const parentChannelID = "386082475144642570" //Correct for 'Game-Specific Discussions
var token = 'Mzg0NjAxMzg2MzgzNTcyOTky.DQPv9Q.ZkoL6gfmI-cRMYLIby3mi-KKVlE';
var guildID = "327990949164875788"
const Discord = require("discord.js");
const client = new Discord.Client();
var channels = {};


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(client.guilds.get(guildID).channels)
});

/*
var options = {
    method: 'GET',
    uri: 'https://discordapp.com/api/guilds/' + guildID + '/channels',
    headers: {
        'Authorization': 'Bot ' + token,
        'User-Agent': 'DiscordBot (*, *)'
    }
};

setInterval(function() {
    rp(options)
		.then(function(body) {
            var childChannels = {}
            var childChannelNames = []
            output = JSON.parse(body)
            //console.log(JSON.stringify(output, null, 4))
            var guildChannels = client.guilds.get(guildID).channels
			console.log('====');
			console.log(guildChannels);
            for (channel in output) {
                if (output[channel].parent_id == parentChannelID) {
                    childChannelNames.push(output[channel].name)
                    childChannels[output[channel].name] = {
                        "id": output[channel].id,
                        "position": output[channel].position
                    }
                }
                if (channel == output.length - 1) {
                    childChannelNames = childChannelNames.sort()
                    var count = 1;
                    for (name in childChannelNames) {
                        actualName = childChannelNames[name]
						console.log('Sorting ' + actualName + ', Position: ' + count);
                        var channel = guildChannels.get(childChannels[actualName].id)
                        channel.edit({
                            position: count,
                            bitrate: 96000
                        })
                        count += 1;
                    }
                }
            }
        })
        .catch(function(err) {
            console.log(err);
        });
}, 5000)
*/