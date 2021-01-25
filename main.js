const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.js');
//const util = require('minecraft-server-util'); needed in minecraft.js file

const client = new Discord.Client();
const DISCORDKEY = config.DISCORDKEY;
const prefix = '-'

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
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    const d = new Date(message.createdTimestamp);

    if (command === 'ping') {
        client.commands.get('ping').execute(message, args);
        console.log('Request processed || ' + message.content + ' || received from ' + message.author.username.toString() + ' at ' + d.toLocaleTimeString() + ' ' + d.toLocaleDateString() + ' in ' + message.guild.name.toString() + ' - ' + message.channel.name.toString());
    } else if (command === 'pizza') {
        client.commands.get('pizza').execute(message, args);
        console.log('Request processed || ' + message.content + ' || received from ' + message.author.username.toString() + ' at ' + d.toLocaleTimeString() + ' ' + d.toLocaleDateString() + ' in ' + message.guild.name.toString() + ' - ' + message.channel.name.toString());
    } else if (command === 'minecraft') {
        client.commands.get('minecraft').execute(message, args, minecraftServer);
        console.log('Request processed || ' + message.content + ' || received from ' + message.author.username.toString() + ' at ' + d.toLocaleTimeString() + ' ' + d.toLocaleDateString() + ' in ' + message.guild.name.toString() + ' - ' + message.channel.name.toString());
    }
})

//console.log(DISCORDKEY);
//console.log(config.DISCORDKEY);
client.login(DISCORDKEY);
