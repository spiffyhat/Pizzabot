module.exports = {
    name: 'ping',
    aliases: ['pingbutdifferent', 'pingalias'],
    description: 'This is just a ping command.',
    execute(message, args) {
        message.channel.send('I\'m here!');
    }
}