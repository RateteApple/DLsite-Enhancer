console.log('content.ts');

// DOMが構築されるまで待機
if (document.readyState === 'loading') {
    // 読み込み中ならDOMContentLoadedで関数を実行
    document.addEventListener('DOMContentLoaded', main);
} else {
    // 読み込み完了しているなら即実行
    main();
}

function addGetSearchTextListener() {
    // input#search_textを取得
    let input_elm = document.getElementById('search_text') as HTMLInputElement;
    // 値を監視するリスナーを登録
    input_elm.addEventListener('input', function() {
        // 値が変更されたら、グローバル変数に値を格納
        console.log('change value : ' + input_elm.value);
        search_text = input_elm.value;
    });
}

let search_text: string;
function main() {
    console.log('main()');
    addGetSearchTextListener();
}

