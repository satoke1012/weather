/*
==========================================
 太田市 天気サイネージ Ver.5
 気象庁データ取得
==========================================
*/


/*
==========================================
 天気取得
==========================================
*/

async function loadWeather(){

    try{

        const response = await fetch(

            CONFIG.FORECAST_URL,

            {
                cache:"no-cache"
            }

        );

        if(!response.ok){

            throw new Error(

                "HTTP Error : " + response.status

            );

        }

        const json = await response.json();

        saveCache(json);

        parseWeather(json);

    }

    catch(error){

        console.error(error);

        console.log("キャッシュを使用します");

        const cache = loadCache();

        if(cache){

            parseWeather(cache.data);

        }

        else{

            showError();

        }

    }

}
