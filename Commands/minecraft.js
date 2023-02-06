const { SlashCommandBuilder } = require('discord.js');
const util = require('minecraft-server-util');
const wait = require('node:timers/promises').setTimeout;

const cacheSeconds = 30;
const serverRestartInterval = 900;
const cacheTime = cacheSeconds * 1000; // 30 sec cache time
const restartTime = serverRestartInterval * 1000;
let data, fullData, lastUpdated, lastRestarted;
let server;
let thisArgs;

const replies = {
    status: {
        command: '.status',
        text: {
            error: 'Error getting {serverName} Minecraft server status. It may be offline or restarting!', // Check your terminal when you see this
            online: '**{serverName}** Minecraft server is **online**  -  ',
            players: '**{online}** people are playing!', // {online} will show player count
            playersList: '**Players online:** ',
            lastChecked: ' (data is updated every {cacheSeconds} seconds)',
            checking: 'Checking...',
            noPlayers: '**Nobody is playing**'
        }

    },
    ip: {
        command: '.ip',
        text: {
            main: 'The IP for the server is `{ip}:{port}`' // {ip} and {port} will show server ip and port from above
        }
    },
    rcon: {
        text: {
            sending: 'Sending test message to Minecraft server...',
            sendsuccess: 'Successfully sent test message to server.',
            sendfail: 'There was a problem sending the test message to the Minecraft server.',
            restarted: 'Minecraft server **{serverName}** restarted.',
            whitelisted: 'Whitelisted user {username}',
            blacklisted: 'Removed user {username} from the whitelist',
            restartTooSoon: 'The server was just restarted at {lastRestarted}, you\'ll need to wait at least 15 minutes between restarts.',
            restartPermission: 'You don\'t have permission to restart the server! HACKER ALERT',
            whitelistPermission: 'You don\'t have permission to modify the whitelist! Ask someone more powerful!',
            missingUsername: '{command} is missing a command argument: username'
        }
    }
};

module.exports = {
    data: new SlashCommandBuilder()
    .setName('minecraft')
    .setDescription('This performs various functions on the Minecraft server'),
    async execute(interaction, minecraftServer) {
        server = minecraftServer;
        try {
            await interaction.reply(replies.status.text.checking);
            await statusCommand().then((reply) => {
                console.log(reply);
                interaction.editReply(reply);
            });
        } catch (error) {
            console.error(error);
        }

        //const authorPerms = interaction.channel.permissionsFor(interaction.author);
        // if (args.length > 0) {
        //     switch (args[0].toString()) { 
        //         case 'saytest':
        //             rconObj.connect();
        //             return interaction.reply(replies.rcon.text.sending).then((rconmsg) => rconTest(rconObj, rconmsg));
        //         case 'restart':
        //             if (!authorPerms || !authorPerms.has('KICK_MEMBERS')) {
        //                 console.log('user ' + message.author.username + ' does not have permission to restart!');
        //                 return interaction.reply(replies.rcon.text.restartPermission);
        //             } else {
        //                 rconObj.connect();
        //                 return interaction.reply(replies.rcon.text.sending).then((rconmsg) => restart(rconObj, rconmsg));
        //             }
        //         case 'whitelist':
        //             if (!authorPerms || !authorPerms.has('KICK_MEMBERS')) {
        //                 console.log('user ' + message.author.username + ' does not have permission to modify the whitelist!');
        //                 return interaction.reply(replies.rcon.text.whitelistPermission);
        //             } else {
        //                 if (args.length = 2) {
        //                     console.log('whitelisting ' + args[1].toString());
        //                     rconObj.connect();
        //                     return interaction.reply(replies.rcon.text.sending).then((rconmsg) => whitelist(rconObj, rconmsg, args[1].toString()));
        //                 } else {
        //                     console.log('whitelist missing parameter for username');
        //                     return interaction.reply(replies.rcon.text.missingUsername.replace('{command}', 'Whitelist'));
        //                 }
        //             }
        //         case 'blacklist': 
        //             if (!authorPerms || !authorPerms.has('KICK_MEMBERS')) {
        //                 console.log('user ' + message.author.username + ' does not have permission to modify the whitelist!');
        //                 return interaction.reply(replies.rcon.text.whitelistPermission);
        //             } else {
        //                 if (args.length = 2) {
        //                     console.log('blacklisting ' + args[1].toString());
        //                     rconObj.connect();
        //                     return interaction.reply(replies.rcon.text.sending).then((rconmsg) => blacklist(rconObj, rconmsg, args[1].toString()));
        //                 } else {
        //                     console.log('whitelist missing parameter for username');
        //                     return interaction.reply(replies.rcon.text.missingUsername.replace('{command}', 'Blacklist'));
        //                 }
        //             }
        //         default:
        //             console.log("HOW DID THIS HAPPEN, minecraft COMMAND?!?");
        //             break;
        //     }
        // } else {
            //interaction.reply('Pretend this worked!')
            
            //statusCommand(newMessage);
        // }
    }
}

function restart(rcon, message) {
    try {
        // restart the minecraft server via rcon
        if (!lastRestarted || Date.now() > lastRestarted + restartTime) {
            console.log("restarting minecraft server...");
            rcon.send('/say RESTARTING NOW... haha just kidding, this is a test.');
            console.log("restarted server here");
            message.edit(message.content.replace(replies.rcon.text.sending, replies.rcon.text.restarted.replace('{serverName}', server.name)));
            lastRestarted = Date.now();
            rcon.disconnect();
        } else {
            var d = new Date(lastRestarted);
            message.edit(message.content.replace(replies.rcon.text.sending, replies.rcon.text.restartTooSoon.replace('{lastRestarted}', d.toLocaleTimeString())));
        }
    } catch (error) {
        console.error(error);
        message.edit(message.content.replace(replies.rcon.text.sending, replies.rcon.text.sendfail));
    }
}

function whitelist(rcon, message, username) {
    try {
        rcon.send('/whitelist add ' + username);
        message.edit(message.content.replace(replies.rcon.text.sending, replies.rcon.text.whitelisted.replace('{username}', username)));
        rcon.disconnect();
    } catch (error) {
        console.error(error);
        message.edit(message.content.replace(replies.rcon.text.sending, replies.rcon.text.sendfail));
    }
}

function blacklist(rcon, message, username) {
    try {
        rcon.send('/whitelist remove ' + username);
        message.edit(message.content.replace(replies.rcon.text.sending, replies.rcon.text.blacklisted.replace('{username}', username)));
        rcon.disconnect();
    } catch (error) {
        console.error(error);
        message.edit(message.content.replace(replies.rcon.text.sending, replies.rcon.text.sendfail));
    }
}

function rconTest(rcon, message) {
    try {
        rcon.send('/say This is a test!');
        message.edit(message.content.replace(replies.rcon.text.sending, replies.rcon.text.sendsuccess));
        rcon.disconnect();
    } catch (error) {
        console.error(error);
        message.edit(message.content.replace(replies.rcon.text.sending, replies.rcon.text.sendfail));
    }
}

function testString() {
    return 'Pretend I did the thing!';
}

async function statusCommand() { // Handle status command
    //console.log("Datetime now, last updated, cache time:");
    //console.log(Date.now());
    //console.log(lastUpdated);
    //console.log(cacheTime);
    try {
        if (!lastUpdated || Date.now() > lastUpdated + cacheTime) { // Cache expired or doesn't exist
        console.log("getting server status...");
        console.log(server.ip);
        console.log(server.port);
        data = await util.status(server.ip, Number(server.port))
        console.log("successfully got status.");
        lastUpdated = Date.now();
        return replyStatus();
    } else { // Use cached data
        console.log("use cached minecraft server data");
        return replyStatus();
    }
    } catch (error) {
        console.error(error);
        return replies.status.text.error.replace('{serverName}', server.name);
    }
    
}

function replyStatus() {
    try {
        let { text } = replies.status;
        let status = text.online;

        status += (data.players.sample != null && data.players.sample.length > 0) ? text.players : text.noPlayers;
        
        status = status.replace('{serverName}', server.name);
        status = status.replace('{online}', (data.players.sample != null && data.players.sample.length > 0) ? data.players.sample.length : '0');

        status += (data.players.sample != null && data.players.sample.length > 0) ? "\r\n" + text.playersList + "\r\n" + getPlayers(data.players.sample) : ""; 
        status += text.lastChecked;
        status = status.replace('{cacheSeconds}', cacheSeconds);
        console.log(status);
        return status;
    } catch (error) {
        throw error;
    }
    
}

function getPlayers(sample) {
    try {
        let retval = "";
        for (const player of sample) {
            var nameFixed = player.name.replace(/_/g, '\\_');
            console.log("fixed name: " + nameFixed);
            retval += nameFixed + "\r\n";
        }
        return retval;
    } catch (error) {
        throw error;
    }
    
}

//function ipCommand(message) { // Handle IP command
//    message.reply(commands.ip.text.main.replace('{ip}', server.ip).replace('{port}', server.port));
//}