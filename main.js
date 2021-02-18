const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.js');
//const util = require('minecraft-server-util'); needed in minecraft.js file

const client = new Discord.Client();
const DISCORDKEY = config.DISCORDKEY;
const prefix = config.PREFIX;

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
    client.commands.set(command.name, command);
}


client.once('ready', () => {
    console.log('Pizzabot is online!');
    client.user.setActivity(' for commands. If I\'m broken, call SpiffyHat!', { type: 'WATCHING' });
})

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot ) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const d = new Date(message.createdTimestamp);

    console.log('Received: \'' + message.content + '\' from ' + message.author.username + ' at ' + d.toLocaleTimeString() + ' ' + d.toLocaleDateString() + (message.guild ? (' in ' + message.guild.name + ' - ' + message.channel.name) : ''));

    if (!client.commands.has(commandName)) {
        console.log('command \'' + command + '\' not present in list')
        return;
    }

    const command = client.commands.get(commandName);

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

    //if (command === 'ping') {
    //    client.commands.get('ping').execute(message, args);
    //    console.log('Request processed || ' + message.content + ' || received from ' + message.author.username.toString() + ' at ' + d.toLocaleTimeString() + ' ' + d.toLocaleDateString());
    //    //console.log('Request processed || ' + message.content + ' || received from ' + message.author.username.toString() + ' at ' + d.toLocaleTimeString() + ' ' + d.toLocaleDateString() + ' in ' + message.guild.name.toString() + ' - ' + message.channel.name.toString());
    //} else if (command === 'pizza') {
    //    client.commands.get('pizza').execute(message, args);
    //    console.log('Request processed || ' + message.content + ' || received from ' + message.author.username.toString() + ' at ' + d.toLocaleTimeString() + ' ' + d.toLocaleDateString());
    //    //console.log('Request processed || ' + message.content + ' || received from ' + message.author.username.toString() + ' at ' + d.toLocaleTimeString() + ' ' + d.toLocaleDateString() + ' in ' + message.guild.name.toString() + ' - ' + message.channel.name.toString());
    //} else if (command === 'minecraft') {
    //    client.commands.get('minecraft').execute(message, args, minecraftServer, minecraftRCON);
    //    console.log('Request processed || ' + message.content + ' || received from ' + message.author.username.toString() + ' at ' + d.toLocaleTimeString() + ' ' + d.toLocaleDateString());
    //    //console.log('Request processed || ' + message.content + ' || received from ' + message.author.username.toString() + ' at ' + d.toLocaleTimeString() + ' ' + d.toLocaleDateString() + ' in ' + message.guild.name.toString() + ' - ' + message.channel.name.toString());
    //} else if (command === 'codyiscool') {
    //    client.commands.get('codyiscool').execute(message, args);
    //    console.log('Request processed || ' + message.content + ' || received from ' + message.author.username.toString() + ' at ' + d.toLocaleTimeString() + ' ' + d.toLocaleDateString());
    //    //console.log('Request processed || ' + message.content + ' || received from ' + message.author.username.toString() + ' at ' + d.toLocaleTimeString() + ' ' + d.toLocaleDateString() + ' in ' + message.guild.name.toString() + ' - ' + message.channel.name.toString());
    //} else if (command === 'chatrevive') {
    //    client.commands.get('chatrevive').execute(message, args, chatreviveList);
    //    console.log('Request processed || ' + message.content + ' || received from ' + message.author.username.toString() + ' at ' + d.toLocaleTimeString() + ' ' + d.toLocaleDateString());
    //    //console.log('Request processed || ' + message.content + ' || received from ' + message.author.username.toString() + ' at ' + d.toLocaleTimeString() + ' ' + d.toLocaleDateString() + ' in ' + message.guild.name.toString() + ' - ' + message.channel.name.toString());
    //}
})

//console.log(DISCORDKEY);
//console.log(config.DISCORDKEY);
client.login(DISCORDKEY);
