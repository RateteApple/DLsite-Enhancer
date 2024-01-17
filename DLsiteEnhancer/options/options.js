let storedData = null;

// ページ読み込み時にデータを読み込む
window.addEventListener('load', function() {
    chrome.storage.sync.get("blockedCircles", function (result) {
        console.log('blockedCircles loaded');
        storedData = result.blockedCircles || [];
        updateTable(); // テーブルを更新
    });
});

// ストレージの変更を監視し、変更があった場合はデータを更新する
chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let key in changes) {
        if (key === "blockedCircles" && namespace === "sync") {
            console.log('blockedCircles changed');
            storedData = changes[key].newValue || [];
            updateTable(); // テーブルを更新
        }
    }
});


function updateTable() {
    // 挿入する場所を取得
    const ShowBlockedList = document.getElementById('BlockListTable');
    // 要素を削除
    while (ShowBlockedList.firstChild) {
        ShowBlockedList.removeChild(ShowBlockedList.firstChild);
    }

    // ブロックリストが空の場合はメッセージを表示
    if (storedData.length === 0) {
        // データが空の場合はメッセージを表示
        const message = document.createElement('p');
        message.textContent = 'ブロックリストが空です。';
        ShowBlockedList.appendChild(message);
        return;
    }

    // テーブルを作成
    let table = document.createElement('table');
    table.id = 'BlockedCirclesTable';
    // テーブルのヘッダーを作成
    let tableHead = table.createTHead();
    let headRow = tableHead.insertRow();
    let headCell1 = headRow.insertCell(0);
    let headCell2 = headRow.insertCell(1);
    headCell1.textContent = 'サークル名';
    headCell2.textContent = '削除';
    // テーブルのボディを作成
    let tableBody = table.createTBody();
    // テーブルをHTMLに挿入
    ShowBlockedList.appendChild(table);

    // テーブルにデータを挿入
    storedData.forEach((cirlce) => {
        // サークル名とURLを取得
        let name = cirlce.circleName;
        let url = "https://www.dlsite.com/maniax/circle/profile/=/maker_id/" + cirlce.circleId + ".html";

        // 行を作成
        let row = tableBody.insertRow();

        // ハイパーテキストを追加
        let nameCell = row.insertCell(0);
        let nameLink = document.createElement('a');
        nameLink.href = url;
        nameLink.target = '_blank';
        nameLink.rel = 'noopener noreferrer';
        nameLink.textContent = name;
        nameCell.appendChild(nameLink);

        // 削除ボタンを追加
        let deleteCell = row.insertCell(1);
        let deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.onclick = function() {
            removeKeyword(name);
        };
        deleteCell.appendChild(deleteButton);
    });
}

function removeKeyword(name) {
    console.log('remove : ' + name);
    storedData.forEach((item, index) => {
        if (item.circleName === name) {
            storedData.splice(index, 1);
        }
    });
    chrome.storage.sync.set({"blockedCircles": storedData}, function() {
        updateTable(); // テーブルを更新
    });
}

// Button(ID:ClearBlockList)を押したときの処理
document.getElementById('ClearBlockList').onclick = function() {
    console.log('clear blockedCircles');
    storedData = [];
    chrome.storage.sync.set({"blockedCircles": storedData}, function() {
        updateTable(); // テーブルを更新
    });
};

// Button(ID:ExportBlockList)を押したときの処理
document.getElementById('ExportBlockList').onclick = function() {
    console.log('export blockedCircles');
    const json = JSON.stringify(storedData);
    const blob = new Blob([json], {type: "application/json"});
    const url = URL.createObjectURL(blob);

    // ダウンロード用のa要素を作成
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blockedCircles.json';

    // a要素をDOMに追加し、クリックイベントを発火させる
    document.body.appendChild(a);
    a.click();

    // 使用後にa要素をDOMから削除
    document.body.removeChild(a);

    // Blob URLを開放
    URL.revokeObjectURL(url);
};

// Button(ID:ImportBlockList)を押したときの処理
document.getElementById('ImportBlockList').onclick = function() {
    console.log('import blockedCircles');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    // ファイル選択時の処理
    input.onchange = function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsText(file);

        // ファイル読み込み後の処理
        reader.onload = function() {
            const json = reader.result;
            const data = JSON.parse(json);
            storedData = data;
            chrome.storage.sync.set({"blockedCircles": storedData}, function() {
                updateTable(); // テーブルを更新
            });
        };
    };

    input.click();
};