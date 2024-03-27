// = = = = = Import = = = = =
import './style.css';
import { insertBlockedCircle, trimBlockedCircleList, isBlockedCircleId } from '../components/chromestorage';
import words from '../components/words.json';

// = = = = = Page = = = = =
class Page {
    public static getWorkElements(): NodeListOf<Element> {
        let workElements: NodeListOf<Element>;

        // Get show type
        const showType = this.getShowType();
        // Get work elements
        if (showType === 'block') {
            workElements = document.querySelectorAll('.n_worklist > li');
        } else if (showType === 'column') {
            workElements = document.querySelectorAll('.n_worklist > tbody > tr');
        } else {
            throw new Error('Unknown show type');
        }

        // return workElements
        if (workElements) {
            return workElements;
        } else {
            throw new Error('Cannot get work elements');
        }
    }

    public static getShowType(): 'block' | 'column' {
        // Get "Block" and "Column" button
        const turnBlockButton = document.querySelector('li.display_block');
        const turnColumnButton = document.querySelector('li.display_normal');
        if (!turnBlockButton || !turnColumnButton) {
            throw new Error('Cannot get show type elements. Hint: Waiting for the page to load.');
        }

        // Determine show type
        if (turnBlockButton.classList.contains('on')) {
            return 'block';
        } else if (turnColumnButton.classList.contains('on')) {
            return 'column';
        } else {
            throw new Error('Cannot determine show type');
        }
    }
}


// = = = = = Work = = = = =
class Work {

    public title: string
    public circleName: string
    public circleURL: string
    public circleID: string

    constructor(
        public element: Element,
    ) {
        this.element = element;
        this.title = this.getTitle(this.element);
        this.circleName = this.getCircleName(this.element);
        this.circleURL = this.getCircleURL(this.element);
        this.circleID = this.getCircleID(this.circleURL);
    }

    private getTitle(element: Element): string {
        const title = element.querySelector('.work_name a')?.getAttribute('title') || null;
        if (!title) {
            throw new Error('Cannot get title. From this element: ' + element);
        }
        return title;
    }

    private getCircleName(element: Element): string {
        const makerName = element.querySelector('.maker_name > a')?.textContent || null;
        if (!makerName) {
            throw new Error('Cannot get maker name. From this element: ' + element);
        }
        return makerName;
    }

    private getCircleURL(element: Element): string {
        const circleURL = element.querySelector('.maker_name > a')?.getAttribute('href') || null;
        if (!circleURL) {
            throw new Error('Cannot get circle URL. From this element: ' + element);
        }
        return circleURL;
    }

    private getCircleID(circleURL: string): string {
        const circleID = circleURL.split('/').reverse()[0].replace('.html', '');
        return circleID;
    }

    public checkHasFlag(): boolean {
        return this.element.classList.contains('applied');
    }

    public addFlag() {
        this.element.classList.add('applied');
    }

    public replaceTitle(newTitle: string) {
        const titleElement = this.element.querySelector('.work_name a')!;
        titleElement.textContent = newTitle;

        // mouseenter, show original title
        this.element.addEventListener('mouseenter', () => {
            titleElement.textContent = this.title;
        });

        // mouseleave, show new title
        this.element.addEventListener('mouseleave', () => {
            titleElement.textContent = newTitle;
        });
    }

    public addCautionMark() {
        const cautionMark = document.createElement('span');
        cautionMark.textContent = '⚠️';
        cautionMark.classList.add('caution');
        this.element.querySelector('.work_name a')!.before(cautionMark);
    }
}


// = = = = = ReDisplayBtn = = = = =
class ReDisplayBtn {
    private text = 'ブロックしたサークルの作品を再表示'

    public static exist(): boolean {
        return document.querySelector('.reDisplayBtn') !== null;
    }

    add() {
        const reDisplayBtn = document.createElement('a');
        reDisplayBtn.textContent = this.text;
        reDisplayBtn.classList.add('reDisplayBtn');
        reDisplayBtn.addEventListener('click', this.showWorks);
        const resultList = document.querySelector('#search_result_list');
        if (!resultList) {
            throw new Error('Cannot get result list');
        }
        resultList.before(reDisplayBtn);
    }

    showWorks() {
        const hiddenWorks = document.querySelectorAll('.hidden');
        hiddenWorks.forEach(work => {
            work.classList.remove('hidden');
        });
    }
}


// = = = = = BlockBtn = = = = =
class BlockBtn {
    private element: HTMLButtonElement;
    private work: Work;

    constructor(work: Work) {
        this.element = document.createElement('button');
        this.element.classList.add('BlockBtn');
        this.work = work;
        this.element.addEventListener('click', async () => await this.click(work));
    }

    async add() {
        if (await isBlockedCircleId(this.work.circleID)) {
            this.element.textContent = 'Unblock';
            this.element.classList.add('unblock');
        } else {
            this.element.textContent = 'Block!';
            this.element.classList.add('block');
        }

        const makerElement = this.work.element.querySelector('.maker_name');
        makerElement!.after(this.element);
    }

    async click(work: Work) {
        if (this.element.classList.contains('block')) {
            // Request
            await insertBlockedCircle(work.circleID, work.circleName);
            // turn unblock
            this.element.classList.remove('block');
            this.element.classList.add('unblock');
            this.element.textContent = 'Unblock';
        } else {
            // Request
            await trimBlockedCircleList(work.circleID);
            // turn block
            this.element.classList.remove('unblock');
            this.element.classList.add('block');
            this.element.textContent = 'Block!';
        }
    }
}


// = = = = = Main = = = = =
// URL history
let oldUrl = location.href;

// Start observer (Run event "urlChange" when URL changed)
const observer = new MutationObserver(() => {
    if (oldUrl !== location.href) {
        window.dispatchEvent(new CustomEvent('urlChange')); // 
        oldUrl = location.href;
    }
});
setTimeout(() => {
    observer.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true
    });
}, 1000);

// Call when URL changed
function urlChange() {
    // Get work elements
    const workElements = Page.getWorkElements();

    // manipulate work elements
    workElements.forEach(async (workElement) => {
        const work = new Work(workElement);

        // If flag, pass
        if (work.checkHasFlag()) {
            return;
        }

        // Add "BlockBtn"
        const blockBtn = new BlockBtn(work);
        await blockBtn.add();

        // Replace title
        const included = words.map(word => word.after).some(word => work.title.includes(word));
        if (included) {
            let newTitle = work.title;
            words.forEach(word => {
                newTitle = newTitle.replace(new RegExp(word.after, 'g'), word.before);
            });
            work.replaceTitle(newTitle);
            work.addCautionMark();
        }

        // If blocked, hide work
        if (await isBlockedCircleId(work.circleID)) {
            work.element.classList.add('hidden');
        }

        // set flag
        work.addFlag();
    });

    // Add reDisplay button
    if (!ReDisplayBtn.exist()) {
        const reDisplayBtn = new ReDisplayBtn();
        reDisplayBtn.add();
    }
}

window.addEventListener('urlChange', urlChange);

// First run
setTimeout(() => {
    window.dispatchEvent(new CustomEvent('urlChange'));
}, 500);


