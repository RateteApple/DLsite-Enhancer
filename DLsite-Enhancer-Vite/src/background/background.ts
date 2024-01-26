export {};

// = = = = = = = = = = = = = = = = = = = =
// Cheack for update
// = = = = = = = = = = = = = = = = = = = =

// get current extension version
function getCurrentExtensionVersion(): string {
    return chrome.runtime.getManifest().version;
}

// get latest release version from GitHub API
async function getLatestReleaseVersion(owner: string, repo: string): Promise<string> {
    const url: string = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
        throw new Error("cannot get latest release version");
    }
    return data.tag_name; // return latest release version
}

// convert version string to array
function versionStringToArray(versionStr : string): number[] {
    return versionStr.replace('v', '').split('.').map(Number);
}

// compare version string
function isVersionGreater(version1: string, version2: string): boolean {
    const v1 = versionStringToArray(version1);
    const v2 = versionStringToArray(version2);

    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
        const num1 = v1[i] || 0;
        const num2 = v2[i] || 0;

        if (num1 > num2) return true;
        if (num1 < num2) return false;
    }
    return false; // Versions are equal
}

// = = = = = = = = = = = = = = = = = = = =
// main
// = = = = = = = = = = = = = = = = = = = =
(async () => {
    console.log('start background script');

    const currentVersion = 'v' + getCurrentExtensionVersion();
    const latestVersion = await getLatestReleaseVersion('RateteApple', 'DLsite-Enhancer');
    console.log(`current version: ${currentVersion}, latest version: ${latestVersion}`);

    if (isVersionGreater(latestVersion, currentVersion)) {
        // logging
        console.log('new version released!');

        chrome.notifications.create('12345', {
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icons/128.png'),
            title: 'DLsite Enhancer',
            message: '新しいバージョンがリリースされたよ！ここをクリックしてアップデートしてね！',
        });
        chrome.notifications.onClicked.addListener((notificationId) => {
            if (notificationId === '12345') {
                // open latest release page
                chrome.tabs.create({ url: 'https://github.com/RateteApple/DLsite-Enhancer/releases/latest' });
            }
        });
        
    } else {
        console.log('useing latest version');
    }
})();
