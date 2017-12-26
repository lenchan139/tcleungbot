
const env_config = require('./.env.config.js');
const aqicn_token = env_config.aqicn_token();
const gmap_token = env_config.gmap_token();
var request = require('request');
exports.checkBitcoin = function (chatId,bot) {
  var reqUsd = 'https://api.coindesk.com/v1/bpi/currentprice/usd.json'
  var reqHkd = 'https://api.coindesk.com/v1/bpi/currentprice/hkd.json'

  request(reqHkd, function (err, res, data) {
    if (err) {
      console.log('Error1:', error1);
        console.log('Error2:', error2);
    } else if (res.statusCode !== 200 ) {
      //
    } else {
        var output = ""
        var json = JSON.parse(data.toString());
        console.log("\n BTC JSON:\n" + json)
        output += "\n======1 BTC 兌換率======"
        output += "\n最後更新：" + json.time.updated
        output += "\n1 BTC 兌 " + json.bpi.USD.rate + " USD"
        output += "\n1 BTC 兌 " + json.bpi.HKD.rate + " HKD"
        output += "\n====== 結 束 輸 出 ======"
        bot.sendMessage(chatId,output)
    }

  })
}
