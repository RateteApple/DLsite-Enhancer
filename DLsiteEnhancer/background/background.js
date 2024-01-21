// = = = = = = = = = = = = = = = = = = = =
//  debug
// = = = = = = = = = = = = = = = = = = = =
function debug_func() {
    chrome.storage.sync.clear(function () {
        console.log("chrome.storage cleared.");
    });
}
// debug_func();



// = = = = = = = = = = = = = = = = = = = =
//  class
// = = = = = = = = = = = = = = = = = = = =
class RequestDLsiteSearch {
    /**
     * リクエストのイベントリスナーを追加する
     */
    addRequestListener() {
        chrome.webRequest.onBeforeRequest.addListener(
            // 捕捉したときに実行する
            (details) => {
                console.log("catch request :\n" + details.url);
                const url = this.rewriteRequestUrl(details.url); // URLを書き換える
                console.log("redirect to :\n" + url);
                return { redirectUrl: url };
            },
            { urls: ["*://www.dlsite.com/*/fsr/=/*"] },
            ["blocking"]
        );
    }

    /**
     * URLを書き換える
     * @param {String} url
     * @returns {String} URL
     */
    rewriteRequestUrl(url) {
        let newUrl = null;

        // リクエストにキーワードが含まれていない場合
        if (url.indexOf("keyword") == -1) {
            console.log("keyword not found");
            newUrl = this.appendKeywords(url);
        }
        // リクエストにキーワードが含まれている場合
        else {
            console.log("keyword found");
            newUrl = this.margeKeywords(url);
        }

        return newUrl;
    }

    appendKeywords(url) {
        let returnUrl = url;
        // ブロックするサークルIDを取得
        const blockedCircleKeywords = this.getblockedKeywords();
        // ブロックするサークルIDがない場合はそのまま返す
        if (blockedCircleKeywords.length == 0) {
            return returnUrl;
        }
        // 先頭以外の要素の文頭に"+"を追加
        const keywords = blockedCircleKeywords.map((item, index) => (index > 0 ? '+' : '') + item).join('');
        // URL末尾にキーワードを追加
        returnUrl = url + "/keyword/" + keywords;
        return returnUrl;
    }

    margeKeywords(url) {
        // ブロックするサークルIDを取得
        let blockedCircleKeywords = this.getblockedKeywords();

        // "keyword"文字列のインデックスを取得
        const keywordIndex = url.split('/').indexOf('keyword') + 1;
        // キーワードを取得(検索箇所によって区切り文字が違う)
        const currentKeywordText = url.split('/')[keywordIndex];
        let currentKeywords = [];
        if (currentKeywordText.includes('+')) {
            currentKeywords = currentKeywordText.split('+');
        }
        else if (currentKeywordText.includes(' ')) {

            currentKeywords = currentKeywordText.split(' ');
        }
        else {
            currentKeywords.push(currentKeywordText);
        }

        // ブロックワードがある場合、重複しているワードを除外
        if (blockedCircleKeywords.length > 0) {
            blockedCircleKeywords = blockedCircleKeywords.filter(item => !currentKeywords.includes(item));
        }

        // キーワードを結合
        const keyword = currentKeywords.concat(blockedCircleKeywords).join('+');
        // URL内のキーワードを置き換える
        const newUrl = url.replace(currentKeywordText, keyword);
        return newUrl;
    }

    /**
        * ブロックするサークルIDのキーワードをまとめた配列を返す(["-ID1", "-ID2", ...])
        * @return {Array} ブロックするサークルIDの配列、または空の配列
    */
    getblockedKeywords() {
        // ブロックワードが空の場合はそのまま返す
        if (storedData.length == 0) {
            return [];
        }
        // サークルIDを取り出して要素の文頭に"-"を追加
        let blockedCircleKeywords = storedData.map(item => item.circleId);
        blockedCircleKeywords = blockedCircleKeywords.map(id => "-" + id);

        return blockedCircleKeywords;
    }
}



// = = = = = = = = = = = = = = = = = = = =
//  main process
// = = = = = = = = = = = = = = = = = = = =
let storedData = null;
let lastKeywords = null;

(function () {
    // options page
    chrome.browserAction.onClicked.addListener(function (tab) {
        chrome.tabs.create({ "url": "options/options.html" });
    });

    // load blockedCircles
    chrome.storage.sync.get("blockedCircles", function (result) {
        storedData = result.blockedCircles || [];
        console.log("loaded blockedCircles : " + storedData);
    }
    );

    // add listener to update blockedCircles
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        for (let key in changes) {
            if (key === "blockedCircles" && namespace === "sync") {
                console.log("updated blockedCircles : " + changes[key].newValue);
                storedData = changes[key].newValue || [];
            }
        }
    });

    // add listener to install or update extension
    chrome.runtime.onInstalled.addListener(function (details) {
        if (details.reason === "install") {
            // 指定したキーのデータが存在するか確認
            chrome.storage.sync.get("blockedCircles", function (result) {
                // "blockedCircles" キーが存在しない場合、空リストで初期化
                if (result.blockedCircles === undefined) {
                    chrome.storage.sync.set({ "blockedCircles": [] }, function () {
                        console.log("Initialized blockedCircles with empty list.");
                    });
                } else {
                    // キーが存在する場合、何もしない
                    console.log("blockedCircles already initialized.");
                }
            });
            // 使い方ページを開く
            chrome.tabs.create({ "url": "https://github.com/RateteApple/DLsite-Enhancer/blob/main/README.md" });
        } else if (details.reason === "update") {
            // 更新情報ページを開く
            // chrome.tabs.create({ "url": "https://github.com/RateteApple/DLsite-Enhancer/releases/latest" });
        }
    });

    // add listener to catch request
    hoge = new RequestDLsiteSearch();
    hoge.addRequestListener();

})();