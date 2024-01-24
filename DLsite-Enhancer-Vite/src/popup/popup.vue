<template>
    <h1>DLsite Enhancer</h1>
    <button @click="openOptionPage">オプションページを開く</button>
</template>


<script setup lang="ts">

async function openOptionPage(): Promise<void> {
    chrome.runtime.openOptionsPage();
    window.close();
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
