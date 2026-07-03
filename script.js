
const URL =
"https://www.jma.go.jp/bosai/forecast/data/forecast/100000.json";

const CACHE_KEY = "weather_v5";

/* ================= DOM ================= */

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

/* ================= 時計 ================= */

function updateClock() {

    const now = new Date();

    dateEl.textContent = now.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long"
    });

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

/* ================= アイコン ================= */

function icon(code) {
    code = String(code);

    if (["100", "101", "110"].includes(code)) return "☀️";
    if (["200", "201"].includes(code)) return "☁️";
    if (["300", "400"].includes(code)) return "🌧️";

    return "🌫️";
}

/* ================= 取得 ================= */

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

/* ================= 南部取得 ================= */

function getSouth(data) {

    const areas = safe(data, "0.timeSeries.0.areas", []);

    return areas.find(a =>
        a.area?.name?.includes("南部")
    ) || null;
}

/* ================= 描画 ================= */

function render(data) {

    const south = getSouth(data);

    if (!south) {
        weatherText.textContent = "データなし";
        return;
    }

    /* 天気 */
    const weather = safe(south, "weathers.0", "不明");
    const code = safe(south, "weatherCodes.0", "100");

    weatherText.textContent = weather;
    weatherIcon.textContent = icon(code);

    /* 降水確率 */
    const pops = safe(data, "0.timeSeries.1.areas.0.pops", []);

    rainToday.textContent = (pops[0] ?? "--") + "%";
    rainTomorrow.textContent = (pops[1] ?? "--") + "%";
    rainAfter.textContent = (pops[2] ?? "--") + "%";

    /* ★気温（ここが修正版） */
    const tempsArea = safe(data, "0.timeSeries.2.areas.0", null);

    if (tempsArea) {

        maxTemp.textContent =
            (tempsArea.tempsMax?.[0] ?? "--") + "℃";

        minTemp.textContent =
            (tempsArea.tempsMin?.[0] ?? "--") + "℃";

    } else {

        maxTemp.textContent = "--℃";
        minTemp.textContent = "--℃";

    }

    updateTime.textContent =
        "更新：" + new Date().toLocaleTimeString("ja-JP");
}

/* ================= 起動 ================= */

fetchWeather();
setInterval(fetchWeather, 30 * 60 * 1000);
