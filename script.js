/* =========================================
   Weather Signage FINAL STABLE VERSION
   ========================================= */

const LAT = 36.305;
const LON = 139.378;

const URL =
`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=Asia%2FTokyo`;

/* ===== DOM ===== */
const dateEl = document.getElementById("date");
const clockEl = document.getElementById("clock");

const weatherIconEl = document.getElementById("weatherIcon");
const weatherTextEl = document.getElementById("weatherText");

const maxTempEl = document.getElementById("maxTemp");
const minTempEl = document.getElementById("minTemp");

const rain0 = document.getElementById("rain0");
const rain6 = document.getElementById("rain6");
const rain12 = document.getElementById("rain12");
const rain18 = document.getElementById("rain18");

const updateTimeEl = document.getElementById("updateTime");

/* ===== ローカル保存キー ===== */
const STORAGE_KEY = "weather_cache_v1";

/* ===== 時計 ===== */
function updateClock(){
    const now = new Date();
    const days = ["日","月","火","水","木","金","土"];

    dateEl.textContent =
        `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日（${days[now.getDay()]}）`;

    clockEl.textContent = now.toLocaleTimeString("ja-JP");
}

/* ===== 天気コード変換 ===== */
function codeToWeather(code){
    if(code === 0) return ["☀️","晴れ"];
    if(code <= 3) return ["☁️","くもり"];
    if(code <= 48) return ["☁️","霧"];
    if(code <= 67) return ["🌧","雨"];
    if(code <= 77) return ["❄️","雪"];
    return ["🌧","荒天"];
}

/* ===== 保存 ===== */
function saveCache(data){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ===== 読み込み ===== */
function loadCache(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    return JSON.parse(raw);
}

/* ===== 表示 ===== */
function render(data){

    const d = data.daily;

    const icon = codeToWeather(d.weathercode[0]);

    weatherIconEl.textContent = icon[0];
    weatherTextEl.textContent = icon[1];

    maxTempEl.textContent = d.temperature_2m_max[0];
    minTempEl.textContent = d.temperature_2m_min[0];

    const pop = d.precipitation_probability_max || [];

    rain0.textContent = "今日　 " + pop[0] + "%";
    rain6.textContent = "明日　" + pop[1] + "%";
    rain12.textContent = "明後日  " + pop[2] + "%";
    rain18.textContent = "3日後  " + pop[3] + "%";

    updateTimeEl.textContent =
        "更新：" + new Date().toLocaleTimeString("ja-JP");
}

/* ===== 取得 ===== */
async function fetchWeather(){

    try{

        const res = await fetch(URL);
        const data = await res.json();

        saveCache(data);
        render(data);

    }catch(e){

        console.log("API失敗、キャッシュ使用");

        const cache = loadCache();

        if(cache){
            render(cache);
            updateTimeEl.textContent =
                "（オフライン表示）" + new Date().toLocaleTimeString("ja-JP");
        }else{
            weatherTextEl.textContent = "データ取得失敗";
            weatherIconEl.textContent = "⚠️";
        }
    }
}

/* ===== 初期化 ===== */
updateClock();

const cache = loadCache();
if(cache){
    render(cache);
}

fetchWeather();

/* ===== ループ ===== */
setInterval(updateClock, 1000);
setInterval(fetchWeather, 30 * 60 * 1000);
