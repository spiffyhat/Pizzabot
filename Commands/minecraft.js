const { request } = require('undici');
const { SlashCommandBuilder } = require('discord.js');

let server;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('minecraft')
        .setDescription('Checks the status of the Minecraft server'),
    async execute(interaction, minecraftserver) {
        server = minecraftserver;
        await interaction.reply('Checking status...');
        const requeststring = 'https://api.mcstatus.io/v2/status/java/' + server.ip + ':' + server.port;
        //console.log(requeststring);
        const result = await request(requeststring);
        //console.log(result);
        let replyString = '';
        
        // console.log('Processing response...');
        const response = await getJSONResponse(result.body)
        //console.log(response);

        const online = response.online;
        
        if (online == true) {
            replyString = server.name + ' is __**online!**__'
        } else {
            replyString = server.name + ' is currently __**offline!**__'
        }
        
        //console.log(response.players);
        //console.log(response.players.list);

        if (online) {
            replyString += "\r\n\r\n"
            //console.log(response.players.list.length > 0);

            if (response.players.list != null && response.players.list.length > 0) {
    
                const players = await getPlayers(response.players.list);
                
                //console.log(players);
                
                replyString += 'There ' + (response.players.list.length > 1 ? 'are ' : 'is ')
                                + response.players.list.length + ' player'
                                + (response.players.list.length > 1 ? 's' : '')
                                + ' online: ' + players;
            } else {
                replyString += 'There are 0 players online.';
            }
        }
        
        // console.log('Replying...');
        interaction.editReply(replyString);

    },
};

async function getJSONResponse(body) {
	let fullBody = '';

	for await (const data of body) {
		fullBody += data.toString();
	}

	return JSON.parse(fullBody);
}

async function getPlayers(list) {
    //console.log('getPlayers');
    let playersString = '';
    let plural = false;

    for await (const data of list) {
        //console.log(data);
        //console.log(data.name_clean);
        
        if (plural) playersString += ', ';
        playersString += '**' + data.name_clean + '**';
        
        plural = true;
    }

    return playersString;

}