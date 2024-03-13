const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chatrevive')
        .setDescription('Send an icebreaker to the channel to revive the chat!'),
    async execute(interaction) {
        await interaction.reply('Working on it...');

        const chatrevive = fs.readFileSync("./chatrevive.txt").toString('utf-8');
        console.log("got chatrevive, length " + chatrevive.length);
        const chatreviveList = chatrevive.split("\n");

        var randomNum = getRandomInt(0, chatreviveList.length - 1);
        //console.log("Got random number " + randomNum);
        //console.log("Getting corresponding icebreaker...");
        var icebreaker = chatreviveList[randomNum].toString();
        //console.log("Got icebreaker : " + icebreaker);

        interaction.editReply(":medical_symbol: CHAT MEDIC INCOMING :medical_symbol:" + "\r\n\r\n" + icebreaker);
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}