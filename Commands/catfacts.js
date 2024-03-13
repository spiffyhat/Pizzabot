const { request } = require('undici');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('catfacts')
        .setDescription('Replies with a cat fact!'),
    async execute(interaction) {
        await interaction.reply('Wait for it...');

        // console.log('Sending Cat Fact request...');
        const catResult = await request('https://catfact.ninja/fact');
        
        // console.log('Processing response...');
        // console.log(catResult);
        const { fact } = await getJSONResponse(catResult.body);
        
        // console.log('Replying...');
        interaction.editReply(fact);

    },
};

async function getJSONResponse(body) {
	let fullBody = '';

	for await (const data of body) {
		fullBody += data.toString();
	}

	return JSON.parse(fullBody);
}