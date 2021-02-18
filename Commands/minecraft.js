const util = require('minecraft-server-util');

const cacheSeconds = 30;
const cacheTime = cacheSeconds * 1000; // 30 sec cache time
let data, fullData, lastUpdated = 0;
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
            sendfail: 'There was a problem sending the test message to the Minecraft server.'
        }
    }
};

module.exports = {
    name: 'minecraft',
    description: 'This checks the status of the Arcade Discord Server',
    execute(message, args, minecraftServer, rcon) {
        if (args.length > 0 && args[0] === 'saytest') {
            message.reply(replies.rcon.text.sending).then((rconmsg) => rconTest(rcon, rconmsg));
        } else {
            server = minecraftServer;
            thisArgs = args;
            message.reply(replies.status.text.checking).then((msg) => statusCommand(msg));
            //statusCommand(newMessage);
        }
    }
}

function rconTest(rcon, message) {
    try {
        rcon.send('/say This is a test!');
        message.edit(message.content.replace(replies.rcon.text.sending, replies.rcon.text.sendsuccess));
    } catch (error) {
        console.error(error);
        message.edit(message.content.replace(replies.rcon.text.sending, replies.rcon.text.sendfail));
    }
}

function testString() {
    return 'Pretend I did the thing!';
}

function statusCommand(message) { // Handle status command
    if (Date.now() > lastUpdated + cacheTime) { // Cache expired or doesn't exist
        util.status(server.ip, { port: server.port })
            .then(res => {
                data = res;
                lastUpdated = Date.now();
                replyStatus(message)
            })
            .catch(err => {
                console.error(err);
                message.edit(message.content.replace(replies.status.text.checking, replies.status.text.error.replace('{serverName}', server.name)));
                //return message.reply(replies.status.text.error.replace('{serverName}', server.name));
            });
    } else { // Use cached data
        replyStatus(message)
    }
}

function replyStatus(message) {
    let { text } = replies.status;
    let status = text.online;
    status += data.onlinePlayers ? text.players : text.noPlayers;
    
    status = status.replace('{serverName}', server.name)
    status = status.replace('{online}', data.onlinePlayers);

    status += data.onlinePlayers ? "\r\n" + text.playersList + "\r\n" + getPlayers(data.samplePlayers) : ""; 
    status += text.lastChecked;
    status = status.replace('{cacheSeconds}', cacheSeconds);
    message.edit(message.content.replace(replies.status.text.checking, status));
}

function getPlayers(sample) {
    let retval = "";
    for (const player of sample) {
        retval += player.name + "\r\n";
    }
    return retval;
}

//function ipCommand(message) { // Handle IP command
//    message.reply(commands.ip.text.main.replace('{ip}', server.ip).replace('{port}', server.port));
//}