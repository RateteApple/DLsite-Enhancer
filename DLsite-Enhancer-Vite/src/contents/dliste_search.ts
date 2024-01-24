export { };

import { getBlockedCircles, setBlockedCircles, insertBlockedCircle, trimBlockedCircleList, isBlockedCircleId } from '../components/chromestorage';

// = = = = = = = = = = = = = = = = = = = =
// wait for DOMContentLoaded
// = = = = = = = = = = = = = = = = = = = =

// wait for DOMContentLoaded
async function waitUntilDomContentLoaded(): Promise<void> {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        main();
    }
}
await waitUntilDomContentLoaded();

// = = = = = = = = = = = = = = = = = = = =
// add style sheet
// = = = = = = = = = = = = = = = = = = = =

// async function addStyleSheet(): Promise<void> {
//     // create link element
//     const link: HTMLLinkElement = document.createElement('link');
//     link.rel = 'stylesheet';
//     link.href = chrome.runtime.getURL('dlsite_search.css');
//     // insert link element
//     const head: HTMLHeadElement | null = document.querySelector('head');
//     if (head === null) {
//         throw new Error('head element cannot be found');
//     }
//     head.insertAdjacentElement('beforeend', link);
//     console.log('inserted style sheet');
// }



// = = = = = = = = = = = = = = = = = = = =
// get search text & replace search button
// = = = = = = = = = = = = = = = = = = = =

async function getSearchText(): Promise<string> {
    return new Promise((resolve) => {
        const input = document.getElementById('search_text') as HTMLInputElement;
        resolve(input.value);
    });
}



// = = = = = = = = = = = = = = = = = = = =
// insert block button
// = = = = = = = = = = = = = = = = = = = =

async function findWorkElms(): Promise<NodeListOf<Element>> {
    return new Promise((resolve) => {
        const work_elms = document.querySelectorAll('li.search_result_img_box_inner');
        resolve(work_elms);
    });
}

async function insertBlockButton(): Promise<void> {
    // add button
    const work_elms = await findWorkElms();
    work_elms.forEach(async elm => {
        // get circle info
        const circle_url: string | null = (elm.querySelector('dd.maker_name a') as HTMLAnchorElement)?.href;
        const circleName: string | null = (elm.querySelector('dd.maker_name a') as HTMLAnchorElement)?.textContent;
        const circleId: string | null = (circle_url?.split('/').slice(-1)[0] as string).replace('.html', '');
        if (circleId === null || circleName === null) {
            throw new Error('circleId or circleName cannot be found');
        }

        // create button
        const button: HTMLButtonElement = await BlockButton.createButton(circleId, circleName);

        // insert button
        const makerNameElement: HTMLElement | null = elm.querySelector('dd.maker_name');
        if (makerNameElement === null) {
            throw new Error('maker name element cannot be found');
        }
        makerNameElement.insertAdjacentElement('afterend', button);

        // update button
        await BlockButton.updateButton('');
    });
}

class BlockButton {
    public static async createButton(circleId: string, circleName: string): Promise<HTMLButtonElement> {
        // create button
        const button: HTMLButtonElement = document.createElement('button');
        // set text
        button.textContent = '???'
        // set id
        button.id = circleId;
        // add class
        button.classList.add('block_btn');
        button.classList.add('status_blocked');
        // setting style
        button.style.fontWeight = 'bold';
        button.style.borderBottom = '5px solid #9f000c';
        button.style.borderRadius = '100vh';
        // add click event
        button.addEventListener('click', async () => {
            await this.blockEvent(button, button.id, circleName);
        });
        // return button
        return button;
    }

    public static async blockEvent(button: HTMLButtonElement, circleId: string, circleName: string): Promise<void> {
        // insert or remove circle info
        if (button.classList.contains('status_blocked')) {
            // insert to blocked circle list
            await insertBlockedCircle(circleId, circleName);
        } else {
            // trim blocked circle list
            await trimBlockedCircleList(circleId);
        }

        // update button
        await this.updateButton(circleId);
    }

    public static async updateButton(circleId: string): Promise<void> {
        let buttons: HTMLButtonElement[];

        // get button from circleId
        if (circleId === '') {
            // get button from circleId
            buttons = Array.from(document.querySelectorAll('button.block_btn'));
        } else {
            // get button from circleId
            buttons = Array.from(document.querySelectorAll('button.block_btn#' + circleId));
        }

        // update button
        buttons.forEach(async button => {
            const isBlocked = await isBlockedCircleId(button.id);
            // update button
            if (isBlocked) {
                // update button
                button.textContent = 'Unblock!';
                button.classList.remove('status_blocked');
                button.classList.add('status_unblocked');
                button.style.borderBottom = '5px solid #00a000';
            } else {
                // update button
                button.textContent = 'Block!';
                button.classList.remove('status_unblocked');
                button.classList.add('status_blocked');
                button.style.borderBottom = '5px solid #9f000c';
            }
        });
    }
}

// = = = = = = = = = = = = = = = = = = = =
// hide blocked circle works
// = = = = = = = = = = = = = = = = = = = =

async function hideBlockedCircleWorks(): Promise<void> {
    // get li elements
    const work_elms = await findWorkElms();

    // for each li element
    work_elms.forEach(async elm => {
        // get circle id
        const circle_url: string | null = (elm.querySelector('dd.maker_name a') as HTMLAnchorElement)?.href;
        const circleId: string | null = (circle_url?.split('/').slice(-1)[0] as string).replace('.html', '');
        // hide blocked circle works
        const isBlocked = await isBlockedCircleId(circleId);
        if (isBlocked) {
            (elm as HTMLElement).style.display = 'none';
            console.log('hide work : ' + circleId);
        }
    });
}

async function showBlockedCircleWorks(): Promise<void> {
    // get li elements
    const work_elms = await findWorkElms();

    // for each li element
    work_elms.forEach(async elm => {
        // show blocked circle works
        (elm as HTMLElement).style.display = 'block';
    });
}


// = = = = = = = = = = = = = = = = = = = =
// main
// = = = = = = = = = = = = = = = = = = = =

async function main() {
    console.log('start dlsite_search.ts');
    console.log('BlockList : ');
    console.log(await getBlockedCircles());
    await insertBlockButton();
    await hideBlockedCircleWorks();
}