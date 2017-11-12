
const env_config = require('./.env.config.js');
const aqicn_token = env_config.aqicn_token();
const gmap_token = env_config.gmap_token();
exports.getNews = function (newsType, chatId,bot) {  var FeedParser = require('feedparser');
  var request = require('request'); // for fetching the feed
  var req = request('https://news.google.com/news/rss/local?hl=zh-HK&gl=HK&ned=hk')
  console.log(newsType)
  if(newsType == 'entertainment'){
    //娛樂版
      console.log(newsType)
    req = request('https://news.google.com/news/rss/headlines/section/topic/ENTERTAINMENT.zh-TW_hk/%E5%A8%9B%E6%A8%82?ned=hk&hl=zh-HK&gl=HK')
    console.req;
  }else{
    req = request('https://news.google.com/news/rss/local?hl=zh-HK&gl=HK&ned=hk')
  }
  var feedparser = new FeedParser([]);
  //bot.sendMessage(chatId,"地區：空氣污染指數：程度 - 日期\n");
  var string_return = "即時港聞：\n"
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
        var outputDate = dateFormat(item.pubDate, "yyyy-mm-dd h:MM:ss")
        var tempString =  item.title + " \n " + outputDate + "\n" + item.link + "\n"
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
};


//for enterainments news
