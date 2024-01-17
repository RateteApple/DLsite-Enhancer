let storedData = null;

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

// ボタンを追加する
(function () {
    const work_elms = document.querySelectorAll('li.search_result_img_box_inner');

    work_elms.forEach(elm => {
        // サークル情報を取得
        const circle_url = elm.querySelector('dd.maker_name a').href;
        const circleId = circle_url.split('/').at(-1).replace(".html", '');
        const circleName = elm.querySelector('dd.maker_name a').textContent;

        // ボタンを作成
        const button = document.createElement('button');
        button.textContent = 'Block!!';
        button.classList.add('block_button');
        // スタイルを設定
        button.style.fontWeight = 'bold';
        button.style.borderBottom = '5px solid #9f000c';
        button.style.borderRadius = '100vh';

        // イベントリスナーを追加
        button.addEventListener('click', function () {
            clickEvent(circleId, circleName);
        });

        // ボタンをmakerNameElementの次に挿入
        const makerNameElement = elm.querySelector('dd.maker_name');
        makerNameElement.insertAdjacentElement('afterend', button);
    });
})();


function clickEvent(circleId, circleName) {
    // サークルIDがすでにブロックされているか確認
    const isBlocked = storedData.some(item => item.circleId === circleId);

    // ブロック済み
    if (isBlocked) {
        alert("すでにブロック済みです");
    } 
    // 未ブロック
    else {
        // 新しいサークル情報を追加
        storedData.push({ circleId: circleId, circleName: circleName });
        // chrome.storageに保存
        chrome.storage.sync.set({ "blockedCircles": storedData }, function () {
            alert("ブロックしました" + "\nID : " + circleId + "\nNAME : " + circleName);
        });
    }
};