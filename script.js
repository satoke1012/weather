
/* ================================
   太田市 天気サイネージ Ver.6 FINAL
   気象庁API 安定版
================================ */

const URL =
"https://www.jma.go.jp/bosai/forecast/data/forecast/100000.json";

const CACHE_KEY = "weather_v6";

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

/* ================= 安全取得 ================= */

function safe(obj, path, fallback = null) {
    try {
        return path.split(".").reduce((o, k) => o[k], obj) ?? fallback;
    } catch {
        return fallback;
    }
}

/* ================= 天気アイコン ================= */

function getIcon(code) {
    code = String(code);

    if (["100", "101", "110"].includes(code)) return "☀️";
    if (["200", "201"].includes(code)) return "☁️";
    if (["300", "400"].includes(code)) return "🌧️";

    return "🌫️";
}

/* ================= データ取得 ================= */

async function fetchWeather() {
    try {
        const res = await fetch(URL, { cache: "no-store" });
        const json = await res.json();

        saveCache(json);
        render(json);

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

/* ================= 南部検索 ================= */

function findArea(list, keyword) {
    return list.find(a => a.area?.name?.includes(keyword));
}

/* ================= 描画 ================= */

function render(data) {

    const series = data?.[0]?.timeSeries;
    if (!series) return;

    /* ================= 天気 ================= */
    const weatherAreas = series[0]?.areas || [];
    const weather = findArea(weatherAreas, "南部") || weatherAreas[0];

    if (weather) {
        weatherText.textContent = weather.weathers?.[0] ?? "--";
        weatherIcon.textContent = getIcon(weather.weatherCodes?.[0]);
    }

    /* ================= 降水 ================= */
    const popAreas = series[1]?.areas || [];
    const pop = findArea(popAreas, "南部") || popAreas[0];

    if (pop) {
        const p = pop.pops || [];
        rain0.textContent = (p[0] ?? "--") + "%";
        rain1.textContent = (p[1] ?? "--") + "%";
        rain2.textContent = (p[2] ?? "--") + "%";
    }

    /* ================= 気温 ================= */
    const tempAreas = series[2]?.areas || [];

    const temp =
        findArea(tempAreas, "南部") ||
        tempAreas.find(t => t.tempsMax?.length > 0) ||
        tempAreas[0];

    if (temp && temp.tempsMax) {
        maxTemp.textContent = temp.tempsMax?.[0] ?? "--" + "℃";
        minTemp.textContent = temp.tempsMin?.[0] ?? "--" + "℃";
    } else {
        maxTemp.textContent = "--℃";
        minTemp.textContent = "--℃";
    }

    /* ================= 更新時間 ================= */
    updateTime.textContent =
        "更新：" + new Date().toLocaleTimeString("ja-JP");
}

/* ================= 起動 ================= */

fetchWeather();
setInterval(fetchWeather, 30 * 60 * 1000);
