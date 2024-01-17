// import { generateUrl } from "redirect.js";

let storedData = null;
let lastKeywords = null;

// - - - - - テスト用 - - - - -
function clearChromeStorage() {
    chrome.storage.sync.clear(function() {
        console.log("chrome.storage cleared.");
    });
}
// clearChromeStorage();
// - - - - - - - - - - - - - -


// インストール時
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
    }
});

// 初期起動時にデータを読み込む
(function () {
    chrome.storage.sync.get("blockedCircles", function (result) {
        storedData = result.blockedCircles || [];
        console.log("loaded blockedCircles : " + storedData);
    }
    )
})();

// ストレージの変更を監視し、変更があった場合はデータを更新する
chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let key in changes) {
        if (key === "blockedCircles" && namespace === "sync") {
            console.log("updated blockedCircles : " + changes[key].newValue);
            storedData = changes[key].newValue || [];
        }
    }
});

// 特定のURLにアクセスしたときにリダイレクトする
chrome.webRequest.onBeforeRequest.addListener(
    // リクエストを補足したときに実行する関数
    redirectFunc,
    // リクエストを補足するURLパターン
    { urls: ["*://www.dlsite.com/*/fsr/=/*"] },
    // リクエストを補足するタイミング
    ["blocking"]
);

// アイコンクリックしたときに設定ページを開く
chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.create({ "url": "options/options.html" });
});

// リクエストを補足したときに実行する関数
function redirectFunc(details) {
    console.log("catch request :\n" + details.url);
    // リダイレクト先のURLを作成
    const url = generateUrl(details.url);
    console.log("redirect to :\n" + url);
    // リダイレクト先のURLを返す
    return { redirectUrl: url };
}

// リダイレクト先のURLを作成する
function generateUrl(url) {
    // リクエストにキーワードが含まれていない場合
    if (url.indexOf("keyword") == -1) {
        // ブロックするサークルIDを取得
        const blockedCircleKeywords = getblockedCircleKeywords();

        // URLを作成
        if (blockedCircleKeywords.length > 0) {
            // 先頭以外の要素の文頭に"+"を追加
            const keywords = blockedCircleKeywords.map((item, index) => (index > 0 ? '+' : '') + item).join('');
            // URL末尾にキーワードを追加
            let newUrl = url + "/keyword/" + keywords;
            return newUrl;
        }
        else {
            return url;
        }
    }

    // リクエストにキーワードが含まれている場合
    else {
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

        // ブロックするサークルIDを取得
        let blockedCircleKeywords = getblockedCircleKeywords();
        if (blockedCircleKeywords.length > 0) {
            // 重複するブロックワードを除外
            blockedCircleKeywords = blockedCircleKeywords.filter(item => !currentKeywords.includes(item));
            
        }

        // キーワードを結合
        const keyword = currentKeywords.concat(blockedCircleKeywords).join('+');
        // URL内のキーワードを置き換える
        const newUrl = url.replace(currentKeywordText, keyword);
        return newUrl;
    }
}

/**
    * ブロックするサークルIDのキーワードをまとめた配列を返す(["-ID1", "-ID2", ...])
    * @return {Array} ブロックするサークルIDの配列、または空の配列
*/
function getblockedCircleKeywords() {
    // ブロックワードが空の場合はそのまま返す
    if (storedData.length == 0) {
        return [];
    }
    // サークルIDを取り出して要素の文頭に"-"を追加
    let blockedCircleKeywords = storedData.map(item => item.circleId);
    blockedCircleKeywords = blockedCircleKeywords.map(id => "-" + id);

    return blockedCircleKeywords;
}