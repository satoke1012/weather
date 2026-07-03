
/* ================================
   Open-Meteo 天気サイネージ 完成版
================================ */

const LAT = 36.305;
const LON = 139.378;

const URL =
`https://api.open-meteo.com/v1/forecast
?latitude=${LAT}
&longitude=${LON}
&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode
&timezone=Asia/Tokyo`;

const CACHE_KEY = "weather_openmeteo";

/* ================= DOM ================= */

const weatherIcon = document.getElementById("weatherIcon");
const weatherText = document.getElementById("weatherText");

const maxTemp = document.getElementById("maxTemp");
const minTemp = document.getElementById("minTemp");

const rain0 = document.getElementById("rain0");
const rain1 = document.getElementById("rain1");
const rain2 = document.getElementById("rain2");

const updateTime = document.getElementById("updateTime");
const clockEl = document.getElementById("clock");

/* ================= 時計 ================= */

function updateClock() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString("ja-JP");
}

setInterval(updateClock, 1000);
updateClock();

/* ================= キャッシュ ================= */

function saveCache(data) {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
        time: Date.now(),
        data
    }));
}

function loadCache() {
    const c = localStorage.getItem(CACHE_KEY);
    return c ? JSON.parse(c) : null;
}

/* ================= 天気アイコン ================= */

function getIcon(code) {
    if (code === 0) return "☀️";
    if (code <= 3) return "🌤️";
    if (code <= 48) return "☁️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "🌨️";
    return "🌩️";
}

/* ================= 降水コメント ================= */

function rainLabel(p) {
    if (p >= 70) return "☔ 傘必須";
    if (p >= 40) return "🌂 念のため傘";
    if (p >= 20) return "☁️ 少し注意";
    return "☀️ ほぼ安心";
}

/* ================= 取得 ================= */

async function fetchWeather() {

    try {

        const res = await fetch(URL);
        if (!res.ok) throw new Error("HTTP Error");

        const data = await res.json();

        saveCache(data);
        render(data);

    } catch (e) {

        const cache = loadCache();

        if (cache) {
            render(cache.data);
        } else {
            weatherText.textContent = "取得失敗";
            weatherIcon.textContent = "⚠️";
        }
    }
}

/* ================= 描画 ================= */

function render(data) {

    const daily = data?.daily;
    if (!daily) return;

    /* 天気 */
    const code = daily.weathercode?.[0] ?? 0;
    weatherIcon.textContent = getIcon(code);
    weatherText.textContent = "今日の天気";

    /* 気温 */
    maxTemp.textContent = (daily.temperature_2m_max?.[0] ?? "--") + "℃";
    minTemp.textContent = (daily.temperature_2m_min?.[0] ?? "--") + "℃";

    /* 降水（コメント付き） */
    const p = daily.precipitation_probability_max || [];

    rain0.textContent = `${p[0] ?? "--"}% ${rainLabel(p[0] ?? 0)}`;
    rain1.textContent = `${p[1] ?? "--"}% ${rainLabel(p[1] ?? 0)}`;
    rain2.textContent = `${p[2] ?? "--"}% ${rainLabel(p[2] ?? 0)}`;

    /* 更新 */
    updateTime.textContent =
        "更新：" + new Date().toLocaleTimeString("ja-JP");
}

/* ================= 起動 ================= */

fetchWeather();
setInterval(fetchWeather, 30 * 60 * 1000);
