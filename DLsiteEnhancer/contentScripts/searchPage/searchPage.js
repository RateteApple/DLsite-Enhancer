// = = = = = = = = = = = = = = = = = = = =
//  class
// = = = = = = = = = = = = = = = = = = = =

function addBlockButton() {
    const work_elms = document.querySelectorAll('li.search_result_img_box_inner');

    work_elms.forEach(elm => {
        // get circle info
        const circle_url = elm.querySelector('dd.maker_name a').href;
        const circleId = circle_url.split('/').at(-1).replace(".html", '');
        const circleName = elm.querySelector('dd.maker_name a').textContent;

        // create button
        const button = document.createElement('button');
        button.textContent = 'Block';
        button.classList.add('block_button');

        // setting style
        button.style.fontWeight = 'bold';
        button.style.borderBottom = '5px solid #9f000c';
        button.style.borderRadius = '100vh';

        // add click event
        button.addEventListener('click', function () {
            blockEvent(circleId, circleName);
        });

        // insert button
        const makerNameElement = elm.querySelector('dd.maker_name');
        makerNameElement.insertAdjacentElement('afterend', button);
    });
}

// click event when block button is clicked
function blockEvent(circleId, circleName) {
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

// = = = = = = = = = = = = = = = = = = = =
//  main process
// = = = = = = = = = = = = = = = = = = = =
let storedData = null;
(function () {
    // logging
    console.log("searchPage.js loaded");

    // load blockedCircles on start
    chrome.storage.sync.get("blockedCircles", function (result) {
        storedData = result.blockedCircles || [];
        console.log("loaded blockedCircles : " + storedData);
        // add block button
        addBlockButton();
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


})();