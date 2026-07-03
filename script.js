const URL = "https://www.jma.go.jp/bosai/forecast/data/forecast/100000.json";
const CACHE_KEY = "weather_v5";

/* =========================
   DOM
========================= */

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

/* =========================
   時計
========================= */

function clock() {
    const now = new Date();

    dateEl.textContent = now.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long"
    });

    clockEl.textContent = now.toLocaleTimeString("ja-JP");
}

setInterval(clock, 1000);
clock();

/* =========================
   キャッシュ
========================= */

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

/* =========================
   安全にデータ取得（重要）
========================= */

function safeGet(obj, path, fallback = null) {
    try {
        return path.split(".").reduce((o, k) => o[k], obj) ?? fallback;
    } catch {
        return fallback;
    }
}

/* =========================
   天気アイコン
========================= */

function icon(code) {
    code = String(code);

    if (["100", "101", "110"].includes(code)) return "☀️";
    if (["200", "201"].includes(code)) return "☁️";
    if (["300", "400"].includes(code)) return "🌧️";
    return "🌫️";
}

/* =========================
   メイン取得
========================= */

async function fetchWeather() {

    try {

        const res = await fetch(URL, { cache: "no-store" });

        const json = await res.json();

        saveCache(json);

        render(json);

    } catch (e) {

        console.log("API失敗 → キャッシュ");

        const cache = loadCache();

        if (cache) {
            render(cache.data);
        } else {
            weatherText.textContent = "取得失敗";
            weatherIcon.textContent = "⚠️";
        }
    }
}

/* =========================
   南部エリア取得（重要）
========================= */

function getSouth(data) {

    const areas =
        safeGet(data, "0.timeSeries.0.areas", []);

    for (const a of areas) {
        if (a.area.name.includes("南部")) {
            return a;
        }
    }

    return null;
}

/* =========================
   描画
========================= */

function render(data) {

    const south = getSouth(data);

    if (!south) {
        weatherText.textContent = "データなし";
        return;
    }

    // 天気
    const weather = safeGet(south, "weathers.0", "不明");
    const code = safeGet(south, "weatherCodes.0", "100");

    weatherText.textContent = weather;
    weatherIcon.textContent = icon(code);

    // 降水確率（2番目のtimeSeries）
    const popsArea =
        safeGet(data, "0.timeSeries.1.areas.0.pops", []);

    rainToday.textContent = popsArea[0] ?? "--";
    rainTomorrow.textContent = popsArea[1] ?? "--";
    rainAfter.textContent = popsArea[2] ?? "--";

    // 気温（3番目のtimeSeries）
    const tempArea =
        safeGet(data, "0.timeSeries.2.areas.0", {});

    maxTemp.textContent = (tempArea.tempsMax?.[0] ?? "--") + "℃";
    minTemp.textContent = (tempArea.tempsMin?.[0] ?? "--") + "℃";

    updateTime.textContent =
        "更新：" + new Date().toLocaleTimeString("ja-JP");
}

/* =========================
   起動
========================= */

fetchWeather();
setInterval(fetchWeather, 30 * 60 * 1000);
