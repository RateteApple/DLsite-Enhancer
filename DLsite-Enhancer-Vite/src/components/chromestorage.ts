export {};

// = = = = = = = = = = = = = = = = = = = =
// clear blocked circle list
// = = = = = = = = = = = = = = = = = = = =

export async function clearBlockedCircles(): Promise<void> {
    chrome.storage.sync.clear(function () {
        console.log('Successfully cleared!');
    });
}

// = = = = = = = = = = = = = = = = = = = =
// get blocked circle list
// = = = = = = = = = = = = = = = = = = = =

export async function getBlockedCircles(): Promise<{circleId: string, circleName: string}[]> {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['blockedCircles'], function (result) {
            const blockedCircles = result.blockedCircles || [];
            resolve(blockedCircles);
        });
    });
}

// = = = = = = = = = = = = = = = = = = = =
// set blocked circle list
// = = = = = = = = = = = = = = = = = = = =

export async function setBlockedCircles(blockedCircles: {circleId: string, circleName: string}[]): Promise<void> {
    chrome.storage.sync.set({blockedCircles: blockedCircles}, function () {
    });
}

// = = = = = = = = = = = = = = = = = = = =
// insert to blocked circle list
// = = = = = = = = = = = = = = = = = = = =

export async function insertBlockedCircle(circleId: string, circleName: string): Promise<void> {
    // get blocked circle list
    const blockedCircles = await getBlockedCircles();

    // insert circle info to blocked circle list
    const circleInfo = {circleId: circleId, circleName: circleName};
    blockedCircles.push(circleInfo);

    // save blocked circle list
    await setBlockedCircles(blockedCircles);

    // show blocked circle list
    console.log('Successfully blocked!');
}

// = = = = = = = = = = = = = = = = = = = =
// trim blocked circle list
// = = = = = = = = = = = = = = = = = = = =

export async function trimBlockedCircleList(circleId: string): Promise<void> {
    // get blocked circle list
    const blockedCircles = await getBlockedCircles();

    // remove circle info from blocked circle list
    const newBlockedCircles = blockedCircles.filter(circle => circle.circleId !== circleId);

    // save blocked circle list
    await setBlockedCircles(newBlockedCircles);

    console.log('Successfully unblocked!');
}

// = = = = = = = = = = = = = = = = = = = =
// is blocked?
// = = = = = = = = = = = = = = = = = = = =

export async function isBlockedCircleId(circleId: string): Promise<boolean> {
    // get blocked circle list
    const blockedCircles = await getBlockedCircles();

    // is blocked?
    if (blockedCircles.map(circle => circle.circleId).includes(circleId)) {
        return true;
    } else {
        return false;
    }
}