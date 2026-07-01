/* =========================================
   Weather Signage JS v1.0
   ========================================= */

/* ===== 気象庁API（関東・甲信） =====
   ※群馬を含む広域データ（安定版）
*/
const WEATHER_URL =
"https://www.jma.go.jp/bosai/forecast/data/forecast/100000.json";

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

/* ===== 時計 ===== */
function updateClock() {
    const now = new Date();

    const days = ["日","月","火","水","木","金","土"];

    dateEl.textContent =
        `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日（${days[now.getDay()]}）`;

    clockEl.textContent =
        `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
}

/* ===== 天気取得 ===== */
async function fetchWeather() {

    try {

        const res = await fetch(WEATHER_URL);
        const data = await res.json();

        // ---- 1つ目の地域データ ----
        const area = data[0];

        // ---- 今日の天気 ----
        const today = area.timeSeries[0];

        const weatherText = today.areas[0].weathers[0];
        const pops = today.areas[0].pops;

        weatherTextEl.textContent = weatherText;

        // アイコン簡易判定
        if(weatherText.includes("晴")) {
            weatherIconEl.textContent = "☀️";
        } else if(weatherText.includes("雨")) {
            weatherIconEl.textContent = "🌧";
        } else if(weatherText.includes("雪")) {
            weatherIconEl.textContent = "❄️";
        } else {
            weatherIconEl.textContent = "☁️";
        }

        // ---- 降水確率 ----
        rain0.textContent = (pops[0] || "--") + "%";
        rain6.textContent = (pops[1] || "--") + "%";
        rain12.textContent = (pops[2] || "--") + "%";
        rain18.textContent = (pops[3] || "--") + "%";

        // ---- 気温（別配列） ----
        const tempArea = area.timeSeries[2];

        if(tempArea && tempArea.areas[0]) {

            const temps = tempArea.areas[0].temps;

            maxTempEl.textContent = temps[1] || "--";
            minTempEl.textContent = temps[0] || "--";
        }

        // 更新時刻
        const now = new Date();
        updateTimeEl.textContent =
            `更新：${now.toLocaleTimeString("ja-JP")}（気象庁）`;

    } catch (e) {

        console.error(e);

        weatherTextEl.textContent = "天気情報取得失敗";
        weatherIconEl.textContent = "⚠️";

        updateTimeEl.textContent = "データ取得エラー";
    }
}

/* ===== 初期化 ===== */
updateClock();
fetchWeather();

/* ===== 定期更新 ===== */
setInterval(updateClock, 1000);          // 時計
setInterval(fetchWeather, 30 * 60 * 1000); // 30分ごと更新
