/*
==========================================
 太田市 天気サイネージ Ver.5
 時計
==========================================
*/

function updateClock() {

    const now = new Date();

    // 日付
    const date = now.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long"
    });

    // 時刻
    const time = now.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    document.getElementById("date").textContent = date;
    document.getElementById("clock").textContent = time;

}


/*
==========================================
 時計開始
==========================================
*/

function startClock() {

    updateClock();

    setInterval(updateClock, 1000);

}
