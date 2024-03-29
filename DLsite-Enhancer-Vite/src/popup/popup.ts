import { createApp, defineComponent, h } from 'vue'
import './style.css'
// import '../components/style.css'

const App = defineComponent({
    setup() {
        // 関数の定義
        async function openOptionPage(): Promise<void> {
            chrome.runtime.openOptionsPage();
            window.close();
        }

        // レンダリング関数
        return () =>
            h('div', [
                h('h1', 'DLsite Enhancer'),
                h('button', { onClick: openOptionPage }, 'オプションページを開く'),
            ]);
    },
});

createApp(App).mount('#app');