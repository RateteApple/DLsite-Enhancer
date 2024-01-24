<template>
    <h1>this is popup</h1>
    <button @click="openOptionPage">open option page</button>
    <button @click="clearChromeStorage">clear chrome storage</button>
</template>


<script setup lang="ts">
import {clearBlockedCircles} from '../components/chromestorage.ts';

async function openOptionPage(): Promise<void> {
    chrome.runtime.openOptionsPage();
}

async function clearChromeStorage(): Promise<void> {
    await clearBlockedCircles();
}
</script>



<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}

.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
