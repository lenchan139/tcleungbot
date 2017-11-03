//import apikey
const env_config = require('./.env.config.js');
//init telegram bot api
const TelegramBot = require('node-telegram-bot-api');
const token = env_config.tgbot_token();
const bot = new TelegramBot(token, { polling: true });

//init api.ai
const apiai_object = require('apiai');
const apiai = apiai_object(env_config.apiai_token());


bot.onText(/.+/, message => {
  console.log(message); // for debug
  const chatId = message.chat.id;
  console.log('you say:' + message.text);
  const msg = message.text;
  if(msg.startsWith("/")){
    //bot.sendMessage(chatId,"you say: "+ message.text + " | response: " + "it is command.");
    //switch a for command.
    switch(msg) {
    case "/start":
        bot.sendMessage(chatId, "未開始建國啊！");
        break;
    case "/end":
        bot.sendMessage(chatId, "我要建國啊/_\\");
        break;
    default:
        bot.sendMessage(chatId, "系統：未定義指令。")
    }
  }else if(msg.includes("@tcleungbot")){
    //push to apiai
    const mentionMsg = msg.replace("@tcleungbot","")
    var request = apiai.textRequest(mentionMsg, {
        sessionId: chatId
    });

    request.on('response', function(response) {
      console.log(response);
      const outputMsg = response.result.fulfillment.speech;
      if(outputMsg){
        bot.sendMessage(chatId, outputMsg);
      }
    });
    request.end();
  }
  //bot.sendMessage(chatId, 'you: '+ message.text + '| tcl: 咩事+_+');

});
