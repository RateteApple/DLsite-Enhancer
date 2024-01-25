export { };

import { insertBlockedCircle, trimBlockedCircleList, isBlockedCircleId } from '../components/chromestorage';


// = = = = = = = = = = = = = = = = = = = =
// insert block button
// = = = = = = = = = = = = = = = = = = = =

async function insertBlockButton(workElments: NodeListOf<HTMLElement>): Promise<void> {
    // add button
    workElments.forEach(async elm => {
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
    });

    // logging
    console.log('completed inserting block button to ' + workElments.length + ' works');
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
    }

    public static async updateButton(circleId: string | null = null): Promise<void> {
        let buttons: HTMLButtonElement[];

        // get button from circleId
        if (circleId === null) {
            // get button from circleId
            buttons = Array.from(document.querySelectorAll('button.block_btn'));
        } else if (typeof circleId === 'string') {
            // get button from circleId
            buttons = Array.from(document.querySelectorAll('button.block_btn#' + circleId));
        }
        else {
            throw new Error('circleId is not string or null');
        }

        // throw error if button is not found
        if (buttons.length === 0) {
            throw new Error('button is not found');
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

async function hideBlockedCircleWorks(workElments: NodeListOf<HTMLElement>): Promise<void> {
    // for each li element
    workElments.forEach(async elm => {
        // get circle id
        const circle_url: string | null = (elm.querySelector('dd.maker_name a') as HTMLAnchorElement)?.href;
        const circleId: string | null = (circle_url?.split('/').slice(-1)[0] as string).replace('.html', '');
        // hide blocked circle works
        const isBlocked = await isBlockedCircleId(circleId);
        if (isBlocked) {
            (elm as HTMLElement).style.display = 'none';
        }

    });

    // logging
    console.log('completed hiding blocked circle works');
}


async function showBlockedCircleWorks(workElments: NodeListOf<HTMLElement>): Promise<void> {
    // for each li element
    workElments.forEach(async elm => {
        // show blocked circle works
        (elm as HTMLElement).style.display = 'block';
    });
}

async function addReshowBlockedCirlceWorksButton(workElments: NodeListOf<HTMLElement>): Promise<void> {
    // if already exists, remove
    if (document.querySelector('.reshow_blocked_circle_works') !== null) {
        document.querySelector('.reshow_blocked_circle_works')?.remove();
    }
    // create button
    const reshowButton = document.createElement('a');
    reshowButton.textContent = 'ブロック中のサークル作品を再表示する';
    reshowButton.classList.add('reshow_blocked_circle_works');

    // size 1em
    reshowButton.style.fontSize = '0.8em';
    //color blue
    reshowButton.style.color = '#0000ff';
    
    // event
    reshowButton.addEventListener('click', async () => {
        await showBlockedCircleWorks(workElments);
    });
    const insertTarget = document.querySelector(CSSselector.reshowButtonLeft) as HTMLElement;
    insertTarget.insertAdjacentElement('afterend', reshowButton);
}

// = = = = = = = = = = = = = = = = = = = =
// watch Chrome Storage
// = = = = = = = = = = = = = = = = = = = =

async function updateBlockedCircles(): Promise<void> {
    // update button
    await BlockButton.updateButton();
}

// = = = = = = = = = = = = = = = = = = = =
// show type (block or column)
// = = = = = = = = = = = = = = = = = = = =

async function findDisplayTypeSelectButton(): Promise<Record<string, HTMLLIElement | null>> {
    const turnBlockButton: HTMLLIElement | null = document.querySelector('li.display_block');
    const turnColumnButton: HTMLLIElement | null = document.querySelector('li.display_normal');
    // ブロックボタンとカラムボタンを連想配列で返す
    return { 'block': turnBlockButton, 'column': turnColumnButton };
}

async function determineShowType(): Promise<'block' | 'column'> {
    const buttons = await findDisplayTypeSelectButton();
    const block_button = buttons['block'];
    const column_button = buttons['column'];
    if (block_button?.classList.contains('on')) {
        return 'block';
    } else if (column_button?.classList.contains('on')) {
        return 'column';
    } else {
        throw new Error('show type cannot be determined');
    }
}


// = = = = = = = = = = = = = = = = = = = =
//  Mutation Observer
// = = = = = = = = = = = = = = = = = = = =

class DOMChangeObserver {
    private observer: MutationObserver;
    private debounceTimer: number | null;
    private callback: () => void;
    private is_observing: boolean = false;

    constructor(
        callback: () => void,
        private debounceTime = 1000,
        private target: Node = document.body,
        private config = { attributes: true, childList: true, subtree: true }
    ) {
        this.callback = () => {
            console.log(this.debounceTime / 1000 + 's passed after DOM changed');
            callback();
        };
        this.observer = new MutationObserver(this.handleMutations.bind(this));
        this.debounceTimer = null;
    }

    public observe(): void {
        // if already observing, do nothing
        if (this.is_observing) {
            console.log('already observing');
            return;
        }

        this.is_observing = true;
        console.log('start observing');
        this.observer.observe(this.target, this.config);
    }

    public disconnect(): void {
        // if not observing, do nothing
        if (!this.is_observing) {
            console.log('not observing');
            return;
        }

        this.is_observing = false;
        console.log('stop observing');
        this.observer.disconnect();
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
    }

    private handleMutations(_mutations: MutationRecord[]): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
            this.callback();
        }, this.debounceTime);
    }
}

// = = = = = = = = = = = = = = = = = = = =
//  add click listener
// = = = = = = = = = = = = = = = = = = = =
async function addClickListener(elemetns: Array<HTMLElement>): Promise<void> {
    elemetns.forEach(async elm => {
        if (elm === null) {
            return;
        }
        elm.addEventListener('click', async () => {
            observer.observe();
        });
    });
}


// = = = = = = = = = = = = = = = = = = = =
// main
// = = = = = = = = = = = = = = = = = = = =

class CSSselector {
    static works = {'block': 'li.search_result_img_box_inner', 'column': 'table.n_worklist tr'};
    static notFoundWorks = '.work_not_found'
    static leftFilter = '#left';
    static sortBox = '.sort_box';
    static searchTop = '.search_top';
    static reshowButtonLeft = '.original_name';
}

const observer = new DOMChangeObserver(
    async () => {
        await manipulateWorks();
        observer.disconnect();
    },
    500
);

(async () => {
    console.log('start dlsite_search.ts');
    await manipulateWorks();
    await addClickListener([
        document.querySelector(CSSselector.leftFilter) as HTMLElement,
        document.querySelector(CSSselector.sortBox) as HTMLElement,
        document.querySelector(CSSselector.searchTop) as HTMLElement
    ]);
})();


// = = = = = = = = = = = = = = = = = = = =
// manipulate works
// = = = = = = = = = = = = = = = = = = = =

async function manipulateWorks(): Promise<void> {
    console.log('- - - start manipulate works - - -');

    let showType: 'block' | 'column';
    let workElments: NodeListOf<HTMLElement>;
    
    showType = await determineShowType();

    // waiting for loading
    while (true) {
        // get work elements (if found, break)
        workElments = document.querySelectorAll(CSSselector.works[showType]);
        if (workElments.length > 0) {
            break;
        }

        // get not found element (if not found, return)
        const notFoundElement = document.querySelector(CSSselector.notFoundWorks);
        if (notFoundElement !== null) {
            console.log('work not found');
            return;
        }
        
        // sleep 500ms
        console.log('waiting for loading works...');
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // add block button
    await insertBlockButton(workElments);
    await BlockButton.updateButton();

    // watch chrome storage
    chrome.storage.onChanged.addListener(updateBlockedCircles);

    // hide blocked circle works
    await hideBlockedCircleWorks(workElments);
    // add reshow button
    await addReshowBlockedCirlceWorksButton(workElments);

    console.log('- - - completed manipulate works - - -');
}
