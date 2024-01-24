<template>
    <h1>DLsite Enhancerの設定ページ</h1>
    <h2>{{ tableTitle }}</h2>
    <table>
        <thead>
            <tr>
                <th>サークルID</th>
                <th>サークル名</th>
                <th class="delete_col">ブロック解除</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, index) in blockedCircles" :key="index">
                <td class="circle_id_col">{{ item.circleId }}</td>
                <td class="circle_name_col">
                    <a :href="'https://www.dlsite.com/maniax/circle/profile/=/maker_id/' + item.circleId" target="_blank">
                        {{ item.circleName }}
                    </a>
                </td>
                <td class="delete_col">
                    <button @click="removeCircle(index)">解除</button>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script lang="ts">
import { getBlockedCircles, trimBlockedCircleList } from "../components/chromestorage.ts";
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
            blockedCircles.value = await getBlockedCircles();
        }

        // async function
        async function removeCircle(index: number): Promise<void> {
            // get circleId 
            const circleId = blockedCircles.value[index]["circleId"];
            // trim blockedCircleList
            await trimBlockedCircleList(circleId);
            // update view
            blockedCircles.value = await getBlockedCircles();
        }

        // onMounted
        onMounted(async (): Promise<void> => {
            // get blockedCircles
            blockedCircles.value = await getBlockedCircles();

            // set tableTitle
            if ((await getBlockedCircles()).length == 0) {
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
        };
    },
};
</script>

<style>
table {
    width: 50rem;
    border-collapse: collapse;
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

.circle_id_col {
    width: 10rem;
}

.delete_col {
    width: 6rem;

}
</style>