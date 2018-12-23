// Edit this and then rename to 'config.js';

const config = {};

config.token = ''; // token from Discord
config.guildID = ''; // The ID of your Discord Server;

// Set to 1 to enable, 0 to disable.
config.notify = 1;
config.antiWord = 1;
config.getRoleIDs = 1;
config.autoRoles = 1;
config.channeRenaming = 1;
config.channelSorting = 1;
config.unusedChannels = 1;

config.notifyTrigger = '@notify';
config.notifyReply = '@here';
config.notifyRequiredRoleID = ''; // The role required for people to be able to use '@notify'. Use the '.getroleid' command to get the right ID.

module.exports = config;
