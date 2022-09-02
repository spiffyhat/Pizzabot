const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with a pong (if I\'m alive).'),
    aliases: ['pingbutdifferent', 'pingalias'],
    async execute(interaction) {
        interaction.reply('I\'m alive!');
    }
}