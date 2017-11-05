
const env_config = require('./.env.config.js');
const aqicn_token = env_config.aqicn_token();
const gmap_token = env_config.gmap_token();
exports.getAqiByCity = function (city,chatId,bot) {
  var request = require('request');
  var aqicnurl = "http://api.waqi.info/" //+ aqicn_token;
  //aqicnurl = aqicnurl.replace("$city$", city);

var gmap_url = "https://maps.googleapis.com/maps/api/geocode/json?key=" + gmap_token
gmap_url += "&address=" + encodeURIComponent(city);
console.log("request url is: " + gmap_url);
request({url:gmap_url}, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(JSON.parse(body).results[0]);
        var lat = JSON.parse(body).results[0].geometry.location.lat;
        var lng = JSON.parse(body).results[0].geometry.location.lng;
        aqicnurl += "/feed/geo:" + lat + ";" + lng + "/?token=" + aqicn_token;
        request(aqicnurl,function (error1, response1, body1) {
            if (!error && response.statusCode == 200) {
              var aqicnJson = JSON.parse(body1);
              console.log("+++++\n\n\n\n\n" + aqicnJson.data.aqi);
              var outstr = "現時 " +aqicnJson.data.city.name + " 嘅AQI（空氣污染指數）喺："  + aqicnJson.data.aqi + "，";
              outstr += getAqiLevel(aqicnJson.data.aqi);
              outstr += "\n時間：" +  aqicnJson.data.time.s;
              outstr += "\n==========詳細資訊==========";
              outstr += "\nIAQI資訊："
              try{outstr += "\nco: " + aqicnJson.data.iaqi.co.v;}catch(e){}
              try{outstr += "\nd: " + aqicnJson.data.iaqi.d.v;}catch(e){}
              try{outstr += "\nh: "+ aqicnJson.data.iaqi.h.v;}catch(e){}
              try{outstr += "\nno2: "+ aqicnJson.data.iaqi.no2.v;}catch(e){}
              try{outstr += "\no3: "+ aqicnJson.data.iaqi.o3.v;}catch(e){}
              try{outstr += "\np: "+ aqicnJson.data.iaqi.p.v;}catch(e){}
              try{outstr += "\npm1.0: "+ aqicnJson.data.iaqi.pm10.v;}catch(e){}
              try{outstr += "\npm2.5: "+ aqicnJson.data.iaqi.pm25.v;}catch(e){}
              try{outstr += "\nso2: "+ aqicnJson.data.iaqi.so2.v;}catch(e){}
              try{outstr += "\nt: "+ aqicnJson.data.iaqi.t.v;}catch(e){}
              try{outstr += "\nw: "+ aqicnJson.data.iaqi.w.v;}catch(e){}
              try{outstr += "\nwd: "+ aqicnJson.data.iaqi.wd.v;}catch(e){}
              outstr += "\n==========結束資訊==========";
              bot.sendMessage(chatId,outstr)

            }
      });

    }
  })
  return "|";
};
function getAqiLevel(aqi){
  if(aqi >= 0 && aqi <= 50){
    return "處於「優秀」水平，可正常活動。"
  }else if(aqi >= 51 && aqi <= 100){
    return "處於「良好」水平，極少數過敏人士應減少戶外活動。"
  }else if(aqi >= 101 && aqi <= 150){
    return "處於「輕度污染」水平，兒童、老年人同埋心臟病、呼吸系統疾病患者應減少長時間、高強度嘅戶外鍛鍊。"
  }else if(aqi >= 151 && aqi <= 200){
    return "處於「中度污染」水平，兒童、老年人同埋心臟病、呼吸系統疾病患者避免長時間、高強度嘅戶外鍛鍊，一般人群適量減少戶外運動。"
  }else if(aqi >= 201 && aqi <= 300){
    return "處於「重度污染」水平，兒童、老年人及心臟病、肺病患者應留喺室內，停止戶外運動，一般人群亦應減少戶外運動。"
  }else{
    return "處於「嚴重污染」水平，兒童、老年人同埋病人應留喺室內，避免體力消耗，一般人群亦應避免戶外活動。"
  }
}
