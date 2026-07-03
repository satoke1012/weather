
/* ================================
   太田市 天気サイネージ（Open-Meteo版）
   安定・シンプル・エラー対策済み
================================ */

const LAT = 36.305;
const LON = 139.378;

const URL =
`https://api.open-meteo.com/v1/forecast
?latitude=${LAT}
&longitude=${LON}
&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode
&timezone=Asia/Tokyo`;

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

const CACHE_KEY = "weather_openmeteo";

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

/* ================= 取得 ================= */

async function fetchWeather() {

    try {

        const res = await fetch(URL);
        if (!res.ok) throw new Error("HTTP Error");

        const data = await res.json();

        saveCache(data);
        render(data);

    } catch (e) {

        console.log("API失敗、キャッシュ使用");

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

    if (!daily) {
        weatherText.textContent = "データなし";
        return;
    }

    /* 天気 */
    const code = daily.weathercode?.[0] ?? 0;
    weatherIcon.textContent = getIcon(code);
    weatherText.textContent = "今日の天気";

    /* 気温 */
    maxTemp.textContent = (daily.temperature_2m_max?.[0] ?? "--") + "℃";
    minTemp.textContent = (daily.temperature_2m_min?.[0] ?? "--") + "℃";

    /* 降水確率 */
    rain0.textContent = (daily.precipitation_probability_max?.[0] ?? "--") + "%";
    rain1.textContent = (daily.precipitation_probability_max?.[1] ?? "--") + "%";
    rain2.textContent = (daily.precipitation_probability_max?.[2] ?? "--") + "%";

    /* 更新時刻 */
    updateTime.textContent =
        "更新：" + new Date().toLocaleTimeString("ja-JP");
}

/* ================= 起動 ================= */

fetchWeather();
setInterval(fetchWeather, 30 * 60 * 1000);
