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



// = = = = = = = = = = = = = = = = = = = =
// main
// = = = = = = = = = = = = = = = = = = = =
(async () => {
    // notice that background script is started
    console.log('start background script');

    // check for update
    const currentVersion: string = 'v' + getCurrentExtensionVersion();
    const latestVersion: string = await getLatestReleaseVersion('RateteApple', 'DLsite-Enhancer');
    console.log(`current version: ${currentVersion}, latest version: ${latestVersion}`);
    if (currentVersion !== latestVersion) {
        chrome.tabs.create(
            {url: 'https://github.com/RateteApple/DLsite-Enhancer/releases/latest'},
            (_tab: chrome.tabs.Tab) => {
                chrome.notifications.create('', {
                    type: 'basic',
                    iconUrl: 'https://github.com/RateteApple/DLsite-Enhancer/blob/v1.0.0/DLsite-Enhancer-Vite/public/icons/128.png?raw=true',
                    title: 'DLsite Enhancer',
                    message: '新しいバージョンがリリースされてるよ！',
                });
            }
        );
    }
})();