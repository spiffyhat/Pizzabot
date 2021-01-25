const util = require('minecraft-server-util');

const cacheSeconds = 30;
const cacheTime = cacheSeconds * 1000; // 30 sec cache time
let data, lastUpdated = 0;
let server;

const replies = {
    status: {
        command: '.status',
        text: {
            error: 'Error getting {serverName} Minecraft server status. It may be offline!', // Check your terminal when you see this
            online: '**{serverName}** Minecraft server is **online**  -  ',
            players: '**{online}** people are playing!', // {online} will show player count
            lastChecked : ' (data is updated every {cacheSeconds} seconds)',
            noPlayers: '**Nobody is playing**'
        }

    },
    ip: {
        command: '.ip',
        text: {
            main: 'The IP for the server is `{ip}:{port}`' // {ip} and {port} will show server ip and port from above
        }
    }
};

module.exports = {
    name: 'minecraft',
    description: 'This checks the status of the Arcade Discord Server',
    execute(message, args, minecraftServer) {
        server = minecraftServer;
        statusCommand(message);
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
                return message.reply(replies.status.text.error.replace('{serverName}', server.name));
            });
    } else { // Use cached data
        replyStatus(message)
    }
}

function replyStatus(message) {
    let { text } = replies.status;
    let status = text.online;
    status += data.onlinePlayers ? text.players : text.noPlayers;
    status += text.lastChecked;
    status = status.replace('{serverName}', server.name)
    status = status.replace('{online}', data.onlinePlayers);
    status = status.replace('{cacheSeconds}', cacheSeconds);
    message.reply(status);
}

//function ipCommand(message) { // Handle IP command
//    message.reply(commands.ip.text.main.replace('{ip}', server.ip).replace('{port}', server.port));
//}