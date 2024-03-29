export class BlockedCircles {
    public static async clear(): Promise<void> {
        chrome.storage.local.set({ blockedCircles: [] }, function () {
            console.log('Successfully cleared!');
        });
    }

    public static async set(blockedCircles: { circleId: string, circleName: string }[]): Promise<void> {
        chrome.storage.local.set({ blockedCircles: blockedCircles }, function () {
        });
    }

    public static async get(): Promise<{ circleId: string, circleName: string }[]> {
        return new Promise((resolve) => {
            chrome.storage.local.get(['blockedCircles'], function (result) {
                const blockedCircles = result.blockedCircles || [];
                resolve(blockedCircles);
            });
        });
    }

    public static async add(circleId: string, circleName: string): Promise<void> {
        const blockedCircles = await this.get();
        const circleInfo = { circleId: circleId, circleName: circleName };
        blockedCircles.push(circleInfo);
        this.set(blockedCircles);
    }

    public static async remove(circleId: string): Promise<void> {
        const blockedCircles = await this.get();
        const newBlockedCircles = blockedCircles.filter(circle => circle.circleId !== circleId);
        this.set(newBlockedCircles);
    }

    public static async checkBlocked(circleId: string): Promise<boolean> {
        const blockedCircles = await this.get();
        return blockedCircles.some(circle => circle.circleId === circleId);
    }

    public static addListener(callback: () => void): void {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local' && changes.blockedCircles) {
                callback();
            }
        });
    }
}

export class Options {
    public static async clear(): Promise<void> {
        chrome.storage.local.set({ options: {} }, function () {
            console.log('Successfully cleared!');
        });
    }

    private static async set(options: { [key: string]: any }): Promise<void> {
        chrome.storage.local.set({ options: options }, function () {
        });
    }

    public static async get(): Promise<{ [key: string]: any }> {
        return new Promise((resolve) => {
            chrome.storage.local.get(['options'], function (result) {
                const options = result.options || {};
                resolve(options);
            });
        });
    }

    public static async add(key: string, value: any): Promise<void> {
        const options = await this.get();
        options[key] = value;
        this.set(options);
    }
}

