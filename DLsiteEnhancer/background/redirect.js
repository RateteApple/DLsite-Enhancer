// リダイレクト先のURLを作成する
export function generateUrl(url) {
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
        // ブロックするサークルIDを取得
        let blockedCircleKeywords = getblockedCircleKeywords();
        if (blockedCircleKeywords.length > 0) {
            // 重複するブロックワードを除外
            blockedCircleKeywords = blockedCircleKeywords.filter(item => !currentKeywords.includes(item));
            
        }

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

        // キーワードを結合
        const keyword = currentKeywords.concat(blockedCircleKeywords).join('+');
        // URL内のキーワードを置き換える
        const newUrl = url.replace(currentKeywordText, keyword);
        return newUrl;
    }
}