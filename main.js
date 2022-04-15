const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.js');
//const util = require('minecraft-server-util'); needed in minecraft.js file

const client = new Discord.Client();
const DISCORDKEY = config.DISCORDKEY;
const prefix = config.PREFIX;
const specialAliases = config.SPECIALALIASES;

const Rcon = require('rcon');

const RCONoptions = {
    tcp: true,
    challenge: false
};

const minecraftRCON = new Rcon(config.MINECRAFTSERVER_IP, config.MINECRAFTSERVER_RCONPORT, config.MINECRAFTSERVER_RCONPASSWORD, RCONoptions);

minecraftRCON.on('auth', function () {
    console.log("Minecraft RCON authed successfully");
});

const chatrevive = fs.readFileSync("./chatrevive.txt").toString('utf-8');
//console.log("got chatrevive, length " + chatrevive.length);
const chatreviveList = chatrevive.split("\n");
//console.log("got list, length " + chatreviveList.length);

const minecraftServer = {
    name: config.MINECRAFTSERVER_NAME,
    ip: config.MINECRAFTSERVER_IP,
    port: config.MINECRAFTSERVER_PORT
}

// const staffChannelID = config.STAFFCHANNELID;

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    for (const [key, value] of Object.entries(specialAliases)) {
        if (value.toString() === command.name.toString()) {
            console.log("Found special alias " + key.toString() + " for command " + value.toString());
            command.aliases += (key.toString);
            console.log("Added alias successfully.");
        }
    }
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('Pizzabot is online!');
    client.user.setActivity(' for commands. If I\'m broken, call SpiffyHat!', { type: 'WATCHING' });
})

client.on('message', message => {

    const args = message.content.slice(prefix.length).split(/ +/);
    var commandName = args.shift().toLowerCase();
    const specialCommand = message.content.split(/ +/).shift();

    if ((!Object.keys(specialAliases).includes(specialCommand) && !message.content.startsWith(prefix)) || message.author.bot) return;

    if (Object.keys(specialAliases).includes(specialCommand)) {
        console.log("using special command " + specialCommand + " for " + specialAliases[specialCommand]);
        commandName = specialAliases[specialCommand];
    }

    const d = new Date(message.createdTimestamp);

    console.log('Received: \'' + message.content + '\' from ' + message.author.username + ' at ' + d.toLocaleTimeString() + ' ' + d.toLocaleDateString() + (message.guild ? (' in ' + message.guild.name + ' - ' + message.channel.name) : ''));

    //if (!client.commands.has(commandName)) {
    //    console.log('command \'' + commandName + '\' not present in list')
    //    return;
    //}

    //const command = client.commands.get(commandName);

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) {
        console.log('No command found! SOMETHING IS WRONG');
        return;
    } 

    console.log(command.name + " identified...");

    if (command.permissions) {
        const authorPerms = message.channel.permissionsFor(message.author);
        if (!authorPerms || !authorPerms.has(command.permissions)) {
            console.log('user ' + message.author.name + ' does not have permission!');
            return message.reply('You don\'t have permission to use this command!');
        }
    }

    try {
        switch (command.name) {
            case 'minecraft':
                command.execute(message, args, minecraftServer, minecraftRCON);
                break;
            case 'chatrevive':
                command.execute(message, args, chatreviveList);
                break;
            default:
                command.execute(message, args);
                break;
        }

        console.log('Command \'' + commandName + '\' successfully processed');

    } catch {
        console.error(error);
        message.reply('Okay, something is messed up. I couldn\'t run that command. @SpiffyHat help me!');
    }

})

// Advertising reminder in staff chat channel, requested by @haziing

// const CHECK_INTERVAL = 1000 * 60; // check every minute
// var reminded = false;

// setInterval(function () {
//     try {
//         //console.log('Checking time for reminder...');
//         var currentdate = new Date();
//         //console.log('datetime hours: ' + currentdate.getHours().toString());
//         //console.log('datetime minutes: ' + currentdate.getMinutes().toString());

//         // the 14 shouldn't be hardcoded, just put it into the config some other time lol
//         if (currentdate.getHours() == 14) {
//             if (!reminded) {
//                 console.log('Sending reminder message to staff!');
//                 client.channels.cache.get(staffChannelID).send('Remember to advertise the server today! :wink:');
//                 reminded = true;
//             } else {
//                 //console.log('it time, but we already did the thing');
//             }
//         } else {
//             if (reminded) {
//                 console.log('Flipping reminder flag back to false.');
//                 reminded = false;
//             }
//         }
//     } catch (error) {
//         console.log('There was a problem with the setInterval function!');
//         console.log(error);
//     }
    
// }, CHECK_INTERVAL)

//console.log(DISCORDKEY);
//console.log(config.DISCORDKEY);
client.login(DISCORDKEY);
