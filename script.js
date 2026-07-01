/* ===== 天気取得（修正版 安定版） ===== */
async function fetchWeather() {

    try {

        const res = await fetch(WEATHER_URL);
        const data = await res.json();

        const area = data[0];

        // -------------------------
        // 天気
        // -------------------------
        const weatherTS = area.timeSeries.find(ts =>
            ts.areas[0].weathers
        );

        const weatherText = weatherTS.areas[0].weathers[0];

        weatherTextEl.textContent = weatherText;

        if(weatherText.includes("晴")) {
            weatherIconEl.textContent = "☀️";
        } else if(weatherText.includes("雨")) {
            weatherIconEl.textContent = "🌧";
        } else {
            weatherIconEl.textContent = "☁️";
        }

        // -------------------------
        // 降水確率
        // -------------------------
        const popTS = area.timeSeries.find(ts =>
            ts.areas[0].pops
        );

        const pops = popTS ? popTS.areas[0].pops : [];

        rain0.textContent = (pops[0] ?? "--") + "%";
        rain6.textContent = (pops[1] ?? "--") + "%";
        rain12.textContent = (pops[2] ?? "--") + "%";
        rain18.textContent = (pops[3] ?? "--") + "%";

        // -------------------------
        // 気温（ここが重要）
        // -------------------------
        const tempTS = area.timeSeries.find(ts =>
            ts.areas[0].temps
        );

        if(tempTS && tempTS.areas[0].temps) {

            const temps = tempTS.areas[0].temps;

            maxTempEl.textContent = temps[1] ?? "--";
            minTempEl.textContent = temps[0] ?? "--";

        } else {
            maxTempEl.textContent = "--";
            minTempEl.textContent = "--";
        }

        // -------------------------
        // 更新時刻
        // -------------------------
        updateTimeEl.textContent =
            `更新：${new Date().toLocaleTimeString("ja-JP")}（気象庁）`;

    } catch (e) {

        console.error(e);

        weatherTextEl.textContent = "取得失敗";
        weatherIconEl.textContent = "⚠️";
        updateTimeEl.textContent = "エラー";
    }
}
