module.exports = {
    name: 'chatrevive',
    description: 'This command sends an icebreaker to the channel to revive the chat.',
    execute(message, args, chatreviveList) {
        //console.log("Chatrevivelist length " + chatreviveList.length);
        //console.log("Trying random number...");
        var randomNum = getRandomInt(0, chatreviveList.length - 1);
        //console.log("Got random number " + randomNum);
        //console.log("Getting corresponding icebreaker...");
        var icebreaker = chatreviveList[randomNum].toString();
        //console.log("Got icebreaker : " + icebreaker);

        message.channel.send(":medical_symbol: CHAT MEDIC INCOMING :medical_symbol:" + "\r\n\r\n" + icebreaker);
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}