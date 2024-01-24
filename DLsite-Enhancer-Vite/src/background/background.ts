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

// compare current version and latest version
async function checkForUpdate(owner: string, repo: string): Promise<boolean> {
    const currentVersion: string = getCurrentExtensionVersion();
    const latestVersion: string = await getLatestReleaseVersion(owner, repo);

    if (currentVersion !== latestVersion) {
        console.log(`更新が利用可能です。現在のバージョン: ${currentVersion}, 最新バージョン: ${latestVersion}`)
        return true;
    } else {
        console.log('最新バージョンを使用中です。');
        return false;
    }
}


// = = = = = = = = = = = = = = = = = = = =
// main
// = = = = = = = = = = = = = = = = = = = =
(async () => {
    // notice that background script is started
    console.log('start background script');

    // check for update
    const isUpdateAvailable: boolean = await checkForUpdate('yukiyuki-0', 'DLsite-Enhancer-Vite');
    if (isUpdateAvailable) {
        chrome.runtime.reload();
    }
})();