<template>
    <h1>DLsite Enhancerの設定ページ</h1>
    {{ tableTitle }}
    <table>
        <thead>
            <tr>
                <th v-for="(key) in data[0]" :key="key">{{ key }}</th>
                <th>操作</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, index) in data" :key="index">
                <td v-for="(value, key) in item" :key="key">{{ value }}</td>
            </tr>
        </tbody>
    </table>
</template>

<script lang="ts">
import { getBlockedCircles } from "../components/chromestorage.ts";

const blockedCircles: Array<Record<string, string>> = await getBlockedCircles();
const isExistBlockedCircles = blockedCircles.length > 0;
let tableTitle = "ブロック中のサークル";
if (!isExistBlockedCircles) {
    tableTitle += "はありません";
}

export default {
    data() {
        return {
            tableTitle: tableTitle,
            data: blockedCircles,
        };
    }
};
</script>

<style>
table {
    width: 50%;
    border-collapse: collapse;
}

th,
td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

thead {
    background-color: #f2f2f2;
}
</style>
