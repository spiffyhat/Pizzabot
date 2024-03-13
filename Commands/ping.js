const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with a pong (if I\'m alive).'),
    async execute(interaction) {
        interaction.reply('Pong! I\'m alive!');
    }
}