const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('left4dead2vs')
        .setDescription('Sets up automatic actions for a L4D2 Versus lobby')
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Reset the current teams'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('join')
                .setDescription('Join a team'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('move')
                .setDescription('Move everyone to their team VC from hangout'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('merge')
                .setDescription('Merge the teams back to hangout after a round has ended')),
    async execute(interaction) {
        await interaction.reply(interaction.options.getSubcommand());
    }
}