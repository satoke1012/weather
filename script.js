/*
=====================================
太田市 天気サイネージ Ver.5
メイン起動
=====================================
*/

document.addEventListener("DOMContentLoaded", async () => {

    startClock();

    await loadWeather();

    setInterval(loadWeather, 30 * 60 * 1000);

});
