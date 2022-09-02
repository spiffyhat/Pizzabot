const fs = require('fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const config = require('./config.js');
//const util = require('minecraft-server-util'); needed in minecraft.js file

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const DISCORDKEY = config.DISCORDKEY;
const prefix = config.PREFIX;
const specialAliases = config.SPECIALALIASES;

const chatrevive = fs.readFileSync("./chatrevive.txt").toString('utf-8');
//console.log("got chatrevive, length " + chatrevive.length);
const chatreviveList = chatrevive.split("\n");
//console.log("got list, length " + chatreviveList.length);

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    console.log('Pizzabot is online!');
    // client.user.setActivity(' for commands. If I\'m broken, call SpiffyHat!', { type: 'WATCHING' });
})

client.on('interactionCreate', async interaction => {
    console.log('Something happening...');
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) return;

	try {

		await command.execute(interaction);

	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(DISCORDKEY);
