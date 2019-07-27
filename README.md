# aegisbot


aegisbot is a bot that provides some useful administrative features to Discord.
NOTE: This code is a work in progress, the code needs to be refactored and there will probably be the odd bug.


## Installation:
1. Download the zip and uncompress or clone the repo.
2. Ensure you have [node](https://nodejs.org/en/) installed (version 8+).
3. Open your choice of CLI, navigate to the directory of the downloaded files and run 'npm install'.
4. Navigate to the 'config' directory and edit the 'configTemplate.js' file. Fill in your Bot token and Guild ID. Save the file as 'config.js'
5. Run the bot with 'node app.js' in your CLI.

## Operation:
The bot is comprised of serveral modules linked together. Each module runs independently of one another. Each module can be enabled or disabled by editing the 'config.js' file. The bot uses Discord's text chat as an interface, each modules has it's own commands. Most of the commands will only work if the author of the command has the 'Administrator' permission on the server the bot is running on. Errors for each module will be logged in files under the 'logFiles' directory. Some of the modules store information under the 'cacheFiles' directory, don't edit any of the files located there.

## Features:

* **Notify**- Allows members to type '@notify' to make the bot reply with an '@here'. This is a workaround to allow you to give members the ability to use '@here' (push notification for online users) without giving them access to '@everyone' (push notification for everybody, including those offline).
**Commands:**
	* **@notify** - Makes the bot respond with @here
	* **.notifyuserblacklistadd user** - Blacklists a user from using @notify. Use either the user's ID or tag them ('@LittleJono').
	* **notifyuserblacklistremove user** - Removes a user from the blacklist.
	* **.notifychannelblacklistadd channelID** - Blacklists a channel. The bot will ignore any @notify commands in blacklisted channels. Rightclick on the channel to get its ID.
    * **.notifychannelblacklistremove channelID** - Removes a channel from the blacklist.
    * **.listnotifyuserblacklist** - Lists the blacklisted users.
    * **.listnotifychannelblacklist** - Lists the blacklisted channels.


* **Auto-Roles**- Automatically give members specific roles (mapped manually) based on what game they are playing. Requires the user to display their current game in their Discord status.
**Commands:**
    * **.addrolemapping gameName role** - Maps gameName to a pre-existing role. When a member is playing '**gameName**' they will be given the mapped role automatically.
	* **.removerolemapping gameName** - Removes a role mapping for '**gameName**'.
	* **.listrolemapping** - List all the current role mappings.
	* **.howmanyplaying gameName** - Lists a count of how many people on the server are playing '**gameName**'.
	* **.howmanyplaying gameName --shownames** - Lists how many people on the server are playing '**gameName**' and displays their names.
	* **.listcurrentlyplayed** - Lists all the games people are playing and how many are playing currently.
	* **.listcurrentlyplayed number** - Lists all of the games with '**number**' or more people playing currently.


* **Anti-Words**- A word blacklist. Deletes messages containing particular words. Edit the 'wordsToDelete' array in 'custom_modules/antiWord.js' to change the words that will trigger a deletion. (This will be moved to the config file eventually). There are no commands for this module.


* **Channel Renaming**- Automatically rename voice channels based on what game the people in the channel are playing (data gathered from their Discord statuses). 
**Commands:**
    * **.autoRename channelID** - Adds the channel corresponding to '**channelID**' to the list of channels that will be automatically renamed. When the channel is empty it will revert to the name it had when it was added.
    * **.changeName channelID newName** - Changes the name a channel will revert to when empty. 
    * **.removeAutoRename channelID** - Removes a channel from the list of channels that are auto-renamed.
    * **.listAutoRename** - Lists all the channels that are being auto-renamed.


* **Channel Sorting**- Alphabetically sort channels under a specified category. 
**Commands:**
    * **.sortchannels parentCategory** - Sorts all the channels under '**parentCategory**' by alphabetical order. 


* **Get Role IDs**- Get the ID of all roles matching a given name. 
**Commands:**
    * **.getroleid role** - Returns the numerical ID of any roles matching the name of the '**role**' given. 


## Other Information:
If you have any ideas for new features and changes or have discovered any bugs please raise an issue through github. 

## Docker Commands: 

1. docker build -t aegisbot . (Build the container)
2. docker stop aegisbot         (Stop the container)
3. docker rm aegisbot           (Remove the container)
4. docker run --restart always --name aegisbot --volume /home/jono/aegisbot/cacheFiles:/aegisbot/cacheFiles -d aegisbot (Starting the bot, make sure cacheFiles folder exists locally)
5. docker exec -i -t aegisbot /bin/bash (Look inside the container)
