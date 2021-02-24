const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.js');
//const util = require('minecraft-server-util'); needed in minecraft.js file

const client = new Discord.Client();
const DISCORDKEY = config.DISCORDKEY;
const prefix = config.PREFIX;
const specialAliases = config.SPECIALALIASES;

const Rcon = require('rcon');

const Rconoptions = {
    tcp: true,
    challenge: false
};

const minecraftRCON = new Rcon(config.MINECRAFTSERVERIP, config.MINECRAFTRCONPORT, config.MINECRAFTRCONPASSWORD, Rconoptions);

minecraftRCON.on('auth', function () {
    console.log("Minecraft RCON authed successfully");
});

minecraftRCON.connect();

const chatrevive = fs.readFileSync("./chatrevive.txt").toString('utf-8');
//console.log("got chatrevive, length " + chatrevive.length);
const chatreviveList = chatrevive.split("\n");
//console.log("got list, length " + chatreviveList.length);

const minecraftServer = {
    name: config.MINECRAFTSERVERNAME,
    ip: config.MINECRAFTSERVERIP,
    port: config.MINECRAFTSERVERPORT
}

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

//console.log(DISCORDKEY);
//console.log(config.DISCORDKEY);
client.login(DISCORDKEY);
