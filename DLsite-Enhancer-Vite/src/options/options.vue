<template>
    <div id="root">
        <h1>DLsite Enhancerの設定ページ</h1>
        <h2>{{ tableTitle }}</h2>
        <button @click="exportBlockedCircles">エクスポート</button>
        <button @click="extendBlockedCircles">インポート</button>
        <button @click="clearAll">初期化</button>
        <table>
            <thead>
                <tr>
                    <th class="circle_id">サークルID</th>
                    <th class="circle_name">サークル名</th>
                    <th class="delete">ブロック解除</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in blockedCircles" :key="index">
                    <td class="circle_id">{{ item.circleId }}</td>
                    <td class="circle_name">
                        <a :href="'https://www.dlsite.com/maniax/circle/profile/=/maker_id/' + item.circleId"
                            target="_blank">
                            {{ item.circleName }}
                        </a>
                    </td>
                    <td class="delete">
                        <button @click="removeCircle(index)">解除</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
import { BlockedCircles } from "../components/chromestorage.ts";
import { Ref, ref } from 'vue';
import { onMounted } from 'vue'


export default {
    setup() {
        // reactive data
        const tableTitle: Ref<string> = ref("");
        const blockedCircles: Ref<Array<Record<string, string>>> = ref([]);

        // update blockedCircles when storage changed
        async function updateBlockedCircles(): Promise<void> {
            console.log("storage changed");
            const blockedCircles_ = await BlockedCircles.get();
            blockedCircles.value = blockedCircles_;
            // update tableTitle
            if (blockedCircles_.length == 0) {
                tableTitle.value = "ブロックしているサークルはありません";
            } else {
                tableTitle.value = "ブロック中のサークルリスト";
            }
        }

        // remove 1 circle from blockedCircles
        async function removeCircle(index: number): Promise<void> {
            // get circleId 
            const circleId = blockedCircles.value[index]["circleId"];
            // trim blockedCircleList
            await BlockedCircles.remove(circleId);
            // update view
            blockedCircles.value = await BlockedCircles.get();
        }

        // export blockedCircles
        function exportBlockedCircles(): void {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(blockedCircles.value));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "blockedCircles.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }

        // clear all blockedCircles
        async function clearAll(): Promise<void> {
            // alertで確認
            if (!window.confirm("本当に初期化しますか？\n消す前にエクスポートしておくことをお勧めします。")) {
                return;
            }
            await chrome.storage.local.set({blockedCircles: []});
            updateBlockedCircles();
        }

        // extend blockedCircles from file
        async function extendBlockedCircles(): Promise<void> {
            // ファイル入力要素を作成
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.style.display = 'none';

            // ファイルが選択されたときのイベントリスナーを設定
            fileInput.onchange = async () => {
                // get file
                if (!fileInput.files) {
                    throw new Error("fileInput.files is null");
                }
                const file = fileInput.files[0];

                // load file
                if (file) {
                    const text = await file.text();
                    let importedData = JSON.parse(text);
                    const blockedCircles_ = await BlockedCircles.get();
                    // delete duplicate
                    importedData = importedData.filter((item: Record<string, string>) => {
                        return blockedCircles_.every((item_: Record<string, string>) => {
                            return item.circleId != item_.circleId;
                        });
                    });
                    // set new blockedCircles to storage
                    const newBlockedCircles = blockedCircles_.concat(importedData);
                    await chrome.storage.local.set({blockedCircles: newBlockedCircles});
                    await updateBlockedCircles();

                    // alert
                    alert(importedData.length + "件のサークルを追加します。");
                }

                // ファイル入力要素を後始末
                fileInput.remove();
            };

            // ファイル入力要素を「クリック」
            fileInput.click();
        }

        // onMounted
        onMounted(async (): Promise<void> => {
            // get blockedCircles
            const cirles = await BlockedCircles.get();
            blockedCircles.value = cirles;

            // set tableTitle
            if (cirles.length == 0) {
                tableTitle.value = "ブロックしているサークルはありません";
            } else {
                tableTitle.value = "ブロックしているサークル";
            }

            // add storage listener
            chrome.storage.onChanged.addListener(updateBlockedCircles);
        })

        // return
        return {
            blockedCircles,
            tableTitle,
            removeCircle,
            exportBlockedCircles,
            clearAll,
            extendBlockedCircles,
        };
    },
};
</script>

<style>

#root {
    margin: 1rem;
    margin-left: 3rem;
}


a {
    color: #0095da;
    text-decoration: none;
}

th {
    background-color: #414141;
    color: white;
    /* 太字にする */
    font-weight: bold;
}

th,
td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

table {
    width: 50rem;
    border-collapse: collapse;
}

.circle_id {
    width: 10rem;
}

.delete {
    width: 6rem;

}


button {
    color: white;
    /* 文字色 */
    background-color: black;
    /* 背景色 */
    border: 2px solid white;
    /* 枠線 */
    padding: 10px 20px;
    /* パディング */
    margin-right: 10px;
    /* マージン（左） */
    text-align: center;
    /* テキスト中央揃え */
    text-decoration: none;
    /* テキストの下線を消す */
    display: inline-block;
    /* インラインブロック要素 */
    font-size: 16px;
    /* フォントサイズ */
    cursor: pointer;
    /* カーソルを指マークに */
    transition: background-color 0.2s, box-shadow 0.2s;
    /* トランジション効果 */
}

button:hover {
    background-color: #333;
    /* ホバー時の背景色 */
    box-shadow: 0 0 5px 2px rgba(255, 255, 255, 0.3);
    /* ホバー時の光る効果 */
}

</style>