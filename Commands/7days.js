const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
var TelnetClient = require("telnet-client");

const lineSplit = /\n|\r/g;

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
    username: "",
    password: "",
    passwordPrompt: /Please enter password:/i,
    //failedLoginMatch: /Password incorrect, please enter password:/i,
    shellPrompt: /\r\n$/,
    // negotiationmandatory: false,
    // initialCtrlC: false,
    // initialLFCR: false,
    
    debug: false,
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

function handleTime(line) {
  let hordeFreq = 7;
  // if(config["horde-frequency"] != null) {
  //   hordeFreq = parseInt(config["horde-frequency"]);
  // }

  const messageValues = line.split(",");
  const day = parseInt(messageValues[0].replace("Day ", ""));
  const hour = parseInt(messageValues[1].split(":")[0]);
  const daysFromHorde = day % hordeFreq;
  let hordeMsg = "";

  const isFirstWeek = day === 1 || day === 2;
  const isHordeHour = (daysFromHorde === 0 && hour >= 22) || (daysFromHorde === 1 && hour < 6);

  const isHordeNow = !isFirstWeek && isHordeHour;

  if (daysFromHorde === 0 && hour < 22) {
    const hoursToHorde = 22 - hour;
    const hourStr = hour === 21 ? "less than an hour" : `${hoursToHorde} hour${hoursToHorde === 1 ? "" : "s"}`;

    hordeMsg = `The blood moon horde begins in ${hourStr}.`;
  } else if (isHordeNow) {
    hordeMsg = "The horde is rampaging now!";
  } else if (daysFromHorde !== 0) {
    const daysToHorde = parseInt(hordeFreq) - daysFromHorde;
    hordeMsg = `The blood moon horde begins on Day ${day+daysToHorde} (in ${daysToHorde} day${daysToHorde === 1 ? "" : "s"}).`;
  }

  return line + ' - ' + hordeMsg;
}

var telnet = new TelnetClient.Telnet();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('7days')
        .setDescription('Retrieves information about the 7 Days to Die server.'),
        //.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, _7DaysServer) {
        
      try {
        await interaction.reply('Working on it...');
        telnet = new TelnetClient.Telnet();
        var replyContent = '**7 Days to Die Server Status (BETA)**\r\n\r\n';
        var failed = false;

        params.host = _7DaysServer.ip;
        params.port = _7DaysServer.port;
        params.password = _7DaysServer.pass;

        console.log(params);

        await telnet.connect(params)
        //await telnet.exec(params.password);

        // List players
        await telnet.exec("lp", (err, response) => {
            if(!err) {

            processTelnetResponse(response, (line) => {
              if(line.startsWith("Total of ")) {
                d7dtdState.receivedData = 1;
                replyContent = replyContent + line + '\r\n';
              }
            });
            
            replyContent = replyContent.replace('Total of ','There are ');
            replyContent = replyContent.replace('in the game','players online right now.');

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
            
              //interaction.editReply('**7 Days to Die Server Status (BETA)**\r\n\r\n' + info);
            }
        }).catch(error => {
          console.error(error);
          replyContent = '**Unable to retrieve server status.** :(';
          failed = true;
       });

       // Get time and blood moon
       if (!failed) {
          await telnet.exec("gettime", (err, response) => {
          if(!err) {

            var responseFormatted = "";

            processTelnetResponse(response, (line) => {
              if(line.startsWith("Day")) {
                d7dtdState.receivedData = 1;
                responseFormatted = handleTime(line);
              }
            });

          replyContent = replyContent + responseFormatted;

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
          
            //interaction.editReply('**7 Days to Die Server Status (BETA)**\r\n\r\n' + info);
          }
        }).catch(error => {
          console.error(error);
          replyContent = '**Unable to retrieve server status.** :(';
          failed = true;
        });
      }

      interaction.editReply(replyContent);
      
      await telnet.end();
      await telnet.destroy();
        
      } catch (error) {
        console.error(error);
      await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
};

