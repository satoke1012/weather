/*
=====================================
 太田市 天気サイネージ Ver.5 FIX
=====================================
*/

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

function getIcon(code) {
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

function getSouth(areaList) {
    return areaList.find(a =>
        a.area?.name?.includes("南部")
    );
}

/* ================= 描画 ================= */

function render(data) {

    const series = data?.[0]?.timeSeries;

    if (!series) return;

    /* ===== 天気 ===== */
    const weatherAreas = series[0].areas;
    const southWeather = getSouth(weatherAreas) || weatherAreas[0];

    weatherText.textContent = southWeather.weathers[0];
    weatherIcon.textContent = getIcon(southWeather.weatherCodes[0]);

    /* ===== 降水確率 ===== */
    const popsAreas = series[1].areas;
    const southPop = getSouth(popsAreas) || popsAreas[0];

    const pops = southPop.pops;

    rainToday.textContent = (pops[0] ?? "--") + "%";
    rainTomorrow.textContent = (pops[1] ?? "--") + "%";
    rainAfter.textContent = (pops[2] ?? "--") + "%";

    /* ===== 気温（重要修正） ===== */
    const tempAreas = series[2]?.areas || [];

    const temp = tempAreas[0]; // ← 気温は南部検索しない（ここ重要）

    if (temp) {
        maxTemp.textContent = (temp.tempsMax?.[0] ?? "--") + "℃";
        minTemp.textContent = (temp.tempsMin?.[0] ?? "--") + "℃";
    } else {
        maxTemp.textContent = "--℃";
        minTemp.textContent = "--℃";
    }

    /* ===== 更新時刻 ===== */
    updateTime.textContent =
        "更新：" + new Date().toLocaleTimeString("ja-JP");
}

/* ================= 起動 ================= */

fetchWeather();
setInterval(fetchWeather, 30 * 60 * 1000);
