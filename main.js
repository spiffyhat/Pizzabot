const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.js');

const client = new Discord.Client();
const DISCORDKEY = config.DISCORDKEY;
const prefix = '-'



client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}


client.once('ready', () => {
    console.log('Pizzabot is online!');
    client.user.setActivity(' for -pizza followed by topping names. If I\'m broken, call SpiffyHat!', { type: 'WATCHING' });
})

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
        client.commands.get('ping').execute(message, args);
    } else if (command === 'pizza') {
        client.commands.get('pizza').execute(message, args);
    }
})

//console.log(DISCORDKEY);
//console.log(config.DISCORDKEY);
client.login(DISCORDKEY);
