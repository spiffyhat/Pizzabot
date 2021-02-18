module.exports = {
    name: 'help',
    aliases: ['commands', 'info'],
    description: 'This is the help command, pretty self-explanatory.',
    execute(message, args) {
        message.channel.send('Pretend I\'m helping you right now.');
    }
}