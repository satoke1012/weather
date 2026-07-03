const URL =
"https://www.jma.go.jp/bosai/forecast/data/forecast/100000.json";

const CACHE_KEY = "weather_v5";

const weatherIcon = document.getElementById("weatherIcon");
const weatherText = document.getElementById("weatherText");
const maxTemp = document.getElementById("maxTemp");
const minTemp = document.getElementById("minTemp");

const rainToday = document.getElementById("rainToday");
const rainTomorrow = document.getElementById("rainTomorrow");
const rainAfter = document.getElementById("rainAfter");

const updateTime = document.getElementById("updateTime");

const dateEl = document.getElementById("date");
const clockEl = document.getElementById("clock");

/* 時計 */
function clock(){
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString("ja-JP",{year:"numeric",month:"long",day:"numeric",weekday:"long"});
    clockEl.textContent = now.toLocaleTimeString("ja-JP");
}
setInterval(clock,1000);
clock();

/* キャッシュ */
function saveCache(data){
    localStorage.setItem(CACHE_KEY,JSON.stringify({
        time:Date.now(),
        data
    }));
}

function loadCache(){
    const c = localStorage.getItem(CACHE_KEY);
    return c ? JSON.parse(c) : null;
}

/* 天気アイコン */
function icon(code){
    if(["100","101","110"].includes(code)) return "☀️";
    if(["200","201"].includes(code)) return "☁️";
    if(["300","400"].includes(code)) return "🌧️";
    return "🌫️";
}

/* メイン */
async function fetchWeather(){

    try{

        const res = await fetch(URL);
        const json = await res.json();

        saveCache(json);
        render(json);

    }catch(e){

        const cache = loadCache();

        if(cache){
            render(cache.data);
        }else{
            weatherText.textContent = "取得失敗";
            weatherIcon.textContent = "⚠️";
        }
    }
}

/* 描画 */
function render(data){

    const area = data[0];

    const today = area.timeSeries[0].areas[0];

    const rain = area.timeSeries[1].areas[0];

    const temp = area.timeSeries[2].areas[0];

    weatherText.textContent = today.weathers[0];
    weatherIcon.textContent = icon(today.weatherCodes[0]);

    rainToday.textContent = rain.pops[0] + "%";
    rainTomorrow.textContent = rain.pops[1] + "%";
    rainAfter.textContent = rain.pops[2] + "%";

    maxTemp.textContent = temp.tempsMax[0] + "℃";
    minTemp.textContent = temp.tempsMin[0] + "℃";

    updateTime.textContent =
        "更新：" + new Date().toLocaleTimeString("ja-JP");
}

/* 起動 */
fetchWeather();
setInterval(fetchWeather,30*60*1000);
