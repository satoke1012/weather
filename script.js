const LAT = 36.305;   // 太田市あたり
const LON = 139.378;

const URL =
`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=Asia%2FTokyo`;

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

function updateClock(){
    const now = new Date();
    const days = ["日","月","火","水","木","金","土"];

    dateEl.textContent =
        `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日（${days[now.getDay()]}）`;

    clockEl.textContent =
        now.toLocaleTimeString("ja-JP");
}

function codeToWeather(code){
    if(code === 0) return ["☀️","晴れ"];
    if(code <= 3) return ["☁️","くもり"];
    if(code <= 48) return ["☁️","霧"];
    if(code <= 67) return ["🌧","雨"];
    if(code <= 77) return ["❄️","雪"];
    return ["🌧","荒天"];
}

async function fetchWeather(){

    try{

        const res = await fetch(URL);
        const data = await res.json();

        const d = data.daily;

        const icon = codeToWeather(d.weathercode[0]);

        weatherIconEl.textContent = icon[0];
        weatherTextEl.textContent = icon[1];

        maxTempEl.textContent = d.temperature_2m_max[0];
        minTempEl.textContent = d.temperature_2m_min[0];

        const pop = d.precipitation_probability_max;

        rain0.textContent = pop[0] + "%";
        rain6.textContent = pop[1] + "%";
        rain12.textContent = pop[2] + "%";
        rain18.textContent = pop[3] + "%";

        updateTimeEl.textContent =
            "更新：" + new Date().toLocaleTimeString("ja-JP");

    }catch(e){

        console.log(e);

        weatherTextEl.textContent = "取得失敗";
        weatherIconEl.textContent = "⚠️";
    }
}

updateClock();
fetchWeather();

setInterval(updateClock,1000);
setInterval(fetchWeather,30*60*1000);
