const util = require('minecraft-server-util');

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
            restartTooSoon: 'The server was just restarted at {lastRestarted}, you\'ll need to wait at least 15 minutes between restarts.',
            restartPermission: 'You don\'t have permission to restart the server! HACKER ALERT'
        }
    }
};

module.exports = {
    name: 'minecraft',
    description: 'This checks the status of the Arcade Discord Server',
    execute(message, args, minecraftServer, rconObj) {
        server = minecraftServer;
        thisArgs = args;
        if (args.length > 0) {
            switch (args[0].toString()) { 
                case 'saytest':
                    rconObj.connect();
                    message.reply(replies.rcon.text.sending).then((rconmsg) => rconTest(rconObj, rconmsg));
                    break;
                case 'restart':
                    const authorPerms = message.channel.permissionsFor(message.author);
                    if (!authorPerms || !authorPerms.has('KICK_MEMBERS')) {
                        console.log('user ' + message.author.username + ' does not have permission to restart!');
                        return message.reply(replies.rcon.text.restartPermission);
                    } else {
                        rconObj.connect();
                        message.reply(replies.rcon.text.sending).then((rconmsg) => restart(rconObj, rconmsg));
                    }
                    break;
                default:
                    console.log("HOW DID THIS HAPPEN, minecraft COMMAND?!?");
                    break;
            }
        } else {
            message.reply(replies.status.text.checking).then((msg) => statusCommand(msg));
            //statusCommand(newMessage);
        }
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

function statusCommand(message) { // Handle status command
    //console.log("Datetime now, last updated, cache time:");
    //console.log(Date.now());
    //console.log(lastUpdated);
    //console.log(cacheTime);
    if (!lastUpdated || Date.now() > lastUpdated + cacheTime) { // Cache expired or doesn't exist
        console.log("getting server status...");
        util.status(server.ip, { port: server.port })
            .then(res => {
                console.log("successfully got status.");
                data = res;
                lastUpdated = Date.now();
                replyStatus(message);
            })
            .catch(err => {
                console.error(err);
                message.edit(message.content.replace(replies.status.text.checking, replies.status.text.error.replace('{serverName}', server.name)));
                //return message.reply(replies.status.text.error.replace('{serverName}', server.name));
            });
    } else { // Use cached data
        replyStatus(message);
    }
}

function replyStatus(message) {
    let { text } = replies.status;
    let status = text.online;
    status += data.onlinePlayers ? text.players : text.noPlayers;
    
    status = status.replace('{serverName}', server.name);
    status = status.replace('{online}', data.onlinePlayers);

    status += data.onlinePlayers ? "\r\n" + text.playersList + "\r\n" + getPlayers(data.samplePlayers) : ""; 
    status += text.lastChecked;
    status = status.replace('{cacheSeconds}', cacheSeconds);
    message.edit(message.content.replace(replies.status.text.checking, status));
}

function getPlayers(sample) {
    let retval = "";
    for (const player of sample) {
        var nameFixed = player.name.replace(/_/g, '\\_');
        console.log("fixed name: " + nameFixed);
        retval += nameFixed + "\r\n";
    }
    return retval;
}

function escapeMarkdown(original) {

}

//function ipCommand(message) { // Handle IP command
//    message.reply(commands.ip.text.main.replace('{ip}', server.ip).replace('{port}', server.port));
//}