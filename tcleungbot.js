//import apikey
const env_config = require('./.env.config.js');
//init telegram bot api
const TelegramBot = require('node-telegram-bot-api');
const token = env_config.tgbot_token();
const bot = new TelegramBot(token, { polling: true });

//init api.ai
const apiai_object = require('apiai');
const apiai = apiai_object(env_config.apiai_token());

//init forecast
// Require the module
var Forecast = require('forecast');

// Initialize
var forecast = new Forecast({
  service: 'darksky',
  key: env_config.darksky_token(),
  lang: "zh-tw",
  units: 'celcius',
  cache: true,      // Cache API requests
  ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/
    minutes: 30,
    seconds: 50
  }
});

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
  }else if(msg.includes("大少")){
    if(msg.includes("天氣")){
      // Retrieve weather information from coordinates (ShaTin, HK)
      forecast.get([22.383, 114.1878], function(err, weather) {
      if(err) return console.dir(err);
      console.dir(weather);
      var weatherMsg = "而家 大少國, 香港, 沙田 嘅實際氣溫喺 " + weather.currently.temperature + " 度。";
      weatherMsg += weather.daily.summary;
      weatherMsg += "\n體感氣溫喺 " + weather.currently.apparentTemperature + " 度。";
      weatherMsg += "\n溼度喺 " + weather.currently.humidity * 100 + "%。";
      weatherMsg += "\n氣壓喺 " + weather.currently.pressure + "Pa。"
      weatherMsg += "\n風速喺 " + weather.currently.windSpeed + "kn。"
      weatherMsg += "\n雲覆蓋量喺 " + weather.currently.cloudCover * 100 + "%。"
      var uvi = weather.currently.cloudCover
      weatherMsg += "\nUV指數喺 " + uvi +" 暴曬指數屬於 " + uviToString(uvi) + "。"
      weatherMsg += "\n能見度喺 " + weather.currently.visibility + "英里。"

      bot.sendMessage(chatId, weatherMsg);
    });

  }else if(msg.includes("空氣")){
    //bot.sendMessage(chatId,getAqhi());
    getAqhi(chatId,bot);
    //console.log("\n\n\n!+" + getAqhi());
  }else{

  }
  }else if(msg.includes("@tcleungbot")){
    //push to apiai
    const mentionMsg = msg.replace("@tcleungbot","").trim()
    if(!mentionMsg.trim()){
      return ";";
    }
    var request = apiai.textRequest(mentionMsg, {
        sessionId: chatId
    });

    request.on('response', function(response) {
      console.log(response);
      const outputMsg = response.result.fulfillment.speech;
      const action = response.result.action;
      if(action == 'callaqicn'){
    var callaqicn = require('./callaqicn.js');
    var pushLocale = "";
    if(response.result.parameters.hklocation){
      pushLocale = response.result.parameters.hklocation
    }else if(response.result.parameters.geocity){
      pushLocale = response.result.parameters.geocity
    }else if(response.result.parameters.geocounty){
      pushLocale = response.result.parameters.geocounty
    }else{
      pushLocale = "沙田";
    }
    callaqicn.getAqiByCity(pushLocale,chatId,bot);

  }else if(action=="speakhknews"){
    var speakhknews = require('./speakhknews.js')
    speakhknews.getNews('hknews',chatId,bot)
  }else if(action=="speakhkEntNews"){
    var speakhknews = require('./speakhknews.js')
    speakhknews.getNews('entertainment',chatId,bot)
  }else if(action=="checkBitcoin"){
    var btc = require('./checkBitcoin.js')
    btc.checkBitcoin(chatId,bot)
  }else if(outputMsg){
          bot.sendMessage(chatId, outputMsg);
      }
    });
    request.end();
  }
  //bot.sendMessage(chatId, 'you: '+ message.text + '| tcl: 咩事+_+');

});
function uviToString(uvi){
  if(uvi>=0 && uvi<=2){
    return "低"
  }else if(uvi >= 3 && uvi <= 5 ){
    return "中等"
  }else if(uvi >=  6 && uvi <= 7){
    return "高"
  }else if(uvi >= 8 && uvi <= 10 ){
    return "甚高"
  }else{
    return "極高"
  }
}
function getAqhi(chatId,bot){
  var FeedParser = require('feedparser');
  var request = require('request'); // for fetching the feed

  var req = request('http://www.aqhi.gov.hk/epd/ddata/html/out/aqhi_ind_rss_ChT.xml')
  var feedparser = new FeedParser([]);
  //bot.sendMessage(chatId,"地區：空氣污染指數：程度 - 日期\n");
  var string_return = "地區：空氣污染指數：程度 - 日期\n"
  req.on('error', function (error) {
    // handle any request errors
  });

  req.on('response', function (res) {
    var stream = this; // `this` is `req`, which is a stream

    if (res.statusCode !== 200) {
      this.emit('error', new Error('Bad status code'));
    }
    else {
      //bot.sendMessage(chatId,"===========開始輸出===========");
      string_return += "===========開始輸出===========\n"
      stream.pipe(feedparser);

    }
  });
  feedparser.on('error', function (error) {
    // always handle errors
  });


  feedparser.on('readable', function () {
    // This is where the action is!
    var stream = this; // `this` is `feedparser`, which is a stream
    var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
    var item;

           var returnString  = ""//"地區：空氣污染指數：程度 - 日期\n";
    while (item = stream.read()) {
      console.log(item);
      console.log("\n======\n");
     //bot.sendMessage(chatId,item.summary);
     var decode = require('decode-html');

      if(item){
        var dateFormat = require('dateformat');
        var outputDate = dateFormat(item.date, "yyyy-mm-dd h:MM:ss")
        var tempString =  item.title + " - " + outputDate + "\n"
        //bot.sendMessage(chatId,item.title + " - " + item.date)
        string_return += tempString
      }
    }
    //bot.sendMessage(chatId,returnString);
    //return returnString;
  });

  feedparser.on('end', function (error) {
    string_return += "===========停止輸出==========="
    bot.sendMessage(chatId,string_return)
    //bot.sendMessage(chatId,"\n===========停止輸出===========");
  });
  //return "|Error|";
}

function callAqi(){

}
