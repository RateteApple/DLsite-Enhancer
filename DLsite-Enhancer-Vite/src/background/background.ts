export { };

class VersionChecker {
    private static owner: string = 'RateteApple';
    private static repo: string = 'DLsite-Enhancer';

    /**
     * 最新バージョンをチェックします。
     * 現在のバージョンとリモートの最新バージョンを比較し、
     * 現在のバージョンが最新であれば 0、
     * 古ければ -1、新しければ 1 を返します。
     * 
     * @returns {Promise<number>} 現在のバージョンが最新であれば 0、古ければ -1、新しければ 1
     */
    public static async check(): Promise<number> {
        const currentVersionStr = this.getCurrentVersion();
        const remoteVersionStr = await this.getRemoteVersion();
        console.log(`current version: ${currentVersionStr}, latest version: ${remoteVersionStr}`);

        const currentVersionSplit = currentVersionStr.split('.');
        const remoteVersionSplit = remoteVersionStr.split('.');

        for (let i = 0; i < Math.max(currentVersionSplit.length, remoteVersionSplit.length); i++) {
            const num1 = Number(currentVersionSplit[i] || 0);
            const num2 = Number(remoteVersionSplit[i] || 0);

            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
        }

        return 0;
    }

    private static getCurrentVersion(): string {
        return chrome.runtime.getManifest().version;
    }

    private static async getRemoteVersion(): Promise<string> {
        const url = `https://api.github.com/repos/${this.owner}/${this.repo}/releases/latest`;
        const response = await fetch(url);
        if (!response.ok) {
            console.log(`Failed to fetch latest version.\nURL: ${url}\nResponse: ${response}`);
        }

        const data = await response.json();
        return data.tag_name.replace('v', '');
    }

    public static async notify() {
        const notificationId = Math.floor(Math.random() * 100000).toString();

        chrome.notifications.create(notificationId, {
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icons/128.png'),
            title: 'DLsite Enhancer',
            message: '新しいバージョンがリリースされたよ！ここをクリックしてアップデートしてね！',
        });

        chrome.notifications.onClicked.addListener((notificationId) => {
            if (notificationId === notificationId) {
                // open latest release page
                chrome.tabs.create({ url: `https://github.com/${this.owner}/${this.repo}/releases/latest` });
            }
        });
    }
}

// = = = = = = = = = = = = = = = = = = = =
// main
// = = = = = = = = = = = = = = = = = = = =
(async () => {
    console.log('Start Background Script');
    // compare version
    const status = await VersionChecker.check();
    if (status === 1) {
        console.log('Maybe dev version');
    }
    else if (status === -1) {
        console.log('Need to update');
        await VersionChecker.notify();
    }
    else {
        console.log('Now using latest version');
    }
})();


