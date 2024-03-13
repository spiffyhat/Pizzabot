const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
var TelnetClient = require("telnet-client");

var d7dtdState = {
    doReconnect: 1,
  
    waitingForTime: 0,
    waitingForVersion: 0,
    waitingForPlayers: 0,
    //waitingForPref: 0,
    receivedData: 0,
  
    skipVersionCheck: 0,
  
    // Connection initialized?
    connInitialized: 0,
  
    previousLine: null,
    dataCheck: null,
  
    // Connection status
    // -1 = Error, 0 = No connection/connecting, 1 = Online
    // -100 = Override or N/A (value is ignored)
    connStatus: -100
  };

var params = {
    host: '',
    port: '',
    timeout: 15000,
    username: '',
    password: '',

    passwordPrompt: /Please enter password:/i,
    shellPrompt: /\r\n$/,

    debug: false,
};

var telnet = new TelnetClient.Telnet();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('7days')
        .setDescription('Retrieves information about the 7 Days to Die server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, _7DaysServer) {
        
      try {
        await interaction.reply('Working on it...');
        var info = 'fail';

        console.log(_7DaysServer);

        params.host = _7DaysServer.ip;
        params.port = _7DaysServer.port;
        params.pass = _7DaysServer.pass;

        console.log(params);

        telnet.connect(params)

        telnet.exec("version", (err, response) => {
            if(!err) {
                
            info = response

            //   processTelnetResponse(response, (line) => {
            //     if(line.startsWith("Day")) {
            //       d7dtdState.receivedData = 1;
            //       handleTime(line, msg);
            //     }
            //   });
  
            //   // Sometimes, the response doesn't have the data we're looking for...
            //   if(!d7dtdState.receivedData) {
            //     d7dtdState.waitingForTime = 1;
            //     d7dtdState.waitingForTimeMsg = msg;
            //   }
            
              interaction.editReply(info);
            }
        }).catch(error => {
          console.error(error);
		      interaction.editReply({ content: '**Unable to retrieve server status.** :(', ephemeral: false });
       });
        
      } catch (error) {
        console.error(error);
		    await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
    };
  },
};

function processTelnetResponse(response, callback) {
    // Sometimes the "response" has more than what we're looking for.
    // We have to double-check and make sure the correct line is returned.
    if(typeof response !== "undefined") {
      var lines = response.split(lineSplit);
      d7dtdState.receivedData = 0;
      for(var i = 0; i <= lines.length-1; i++) {
        callback(lines[i]);
      }
    }
  }