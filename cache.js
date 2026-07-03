/*
==========================================
 太田市 天気サイネージ Ver.5
 キャッシュ管理
==========================================
*/


/*
==========================================
 保存
==========================================
*/

function saveCache(data) {

    const cache = {

        updateTime: Date.now(),

        data: data

    };

    localStorage.setItem(

        CONFIG.CACHE_KEY,

        JSON.stringify(cache)

    );

}



/*
==========================================
 読み込み
==========================================
*/

function loadCache() {

    const cache = localStorage.getItem(

        CONFIG.CACHE_KEY

    );

    if (!cache) {

        return null;

    }

    try {

        return JSON.parse(cache);

    }

    catch (e) {

        console.error(e);

        return null;

    }

}



/*
==========================================
 キャッシュ削除
==========================================
*/

function clearCache() {

    localStorage.removeItem(

        CONFIG.CACHE_KEY

    );

}



/*
==========================================
 キャッシュの経過時間
==========================================
*/

function getCacheAge() {

    const cache = loadCache();

    if (!cache) {

        return null;

    }

    return Date.now() - cache.updateTime;

}



/*
==========================================
 キャッシュ有効？
24時間以内なら使用可能
==========================================
*/

function hasValidCache() {

    const age = getCacheAge();

    if (age === null) {

        return false;

    }

    return age < (24 * 60 * 60 * 1000);

}
