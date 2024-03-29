// = = = = = Import = = = = =
import './style.css';
import { BlockedCircles } from '../components/chromestorage';
import exchangeWords from '../components/exchangeWords.json';
import { addUrlChangeListener } from '../components/urlChangeObserver';

// = = = = = Page = = = = =
class Page {
    private works: Work[] = [];

    public addEventListener(): void {
        addUrlChangeListener(this.callbackUrlChange.bind(this));
        BlockedCircles.addListener(this.callbackUpdateBlockedCircles.bind(this));
    }

    public addReDisplayBtn(): void {
        if (!ReDisplayBtn.exist()) {
            ReDisplayBtn.add();
        }
    }

    public firstRun(): void {
        console.log('Start First Run');
        this.callbackUrlChange();
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

    private callbackUrlChange(): void {
        console.log('URL changed');
        // Initialize works
        this.works = Work.getWorks();

        // manipulate work elements
        this.works.forEach(async (work) => {
            // If flag, pass
            if (work.checkHasFlag()) {
                return;
            }
            // Add "BlockBtn"
            await work.blockBtn.add();
            await work.blockBtn.update();
            // Replace title
            work.revertTrueWord();
            // If blocked, hide work
            await work.toggleDisplay();
            // set flag
            work.addFlag();
        });
    }

    private async callbackUpdateBlockedCircles(): Promise<void> {
        // Hide works & Update BlockBtn
        this.works.forEach(async work => {
            await work.blockBtn.update();
        });
    }
}


// = = = = = Work = = = = =
class Work {
    public element: Element
    public title: string
    public circleName: string
    public circleURL: string
    public circleID: string
    public blockBtn: BlockBtn

    constructor(
        element: Element,
    ) {
        this.element = element;
        this.title = this.getTitle();
        this.circleName = this.getCircleName();
        this.circleURL = this.getCircleURL();
        this.circleID = this.getCircleID(this.circleURL);
        this.blockBtn = new BlockBtn(this);
    }

    private static getWorkElements(): NodeListOf<Element> {
        let workElements: NodeListOf<Element>;

        // Get show type
        const showType = Page.getShowType();
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

    public static getWorks(): Work[] {
        const workElements = this.getWorkElements();
        const works: Work[] = [];
        workElements.forEach(workElement => {
            try {
                works.push(new Work(workElement));
            } catch (error) {
                console.error(error);
            }
        });
        return works;
    }

    private getTitle(): string {
        const title = this.element.querySelector('.work_name a')?.getAttribute('title') || null;
        if (!title) {
            throw new Error('Cannot get title. From this element: ' + this.element);
        }
        return title;
    }

    private getCircleName(): string {
        const makerName = this.element.querySelector('.maker_name > a')?.textContent || null;
        if (!makerName) {
            throw new Error(`Cannot get maker name. From this element: ${this.title}`);
        }
        return makerName;
    }

    private getCircleURL(): string {
        const circleURL = this.element.querySelector('.maker_name > a')?.getAttribute('href') || null;
        if (!circleURL) {
            throw new Error('Cannot get circle URL. From this element: ' + this.element);
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

    public addFlag(): void {
        this.element.classList.add('applied');
    }

    public revertTrueWord() {
        const falseWords = exchangeWords.flatMap(word => word.false);
        const included = falseWords.some(word => this.title.includes(word));
        if (!included) {
            return;
        }

        let newTitle = this.title;
        falseWords.forEach(falseWord => {
            const trueWord = exchangeWords.find(word => word.false.includes(falseWord))?.true;
            if (trueWord) {
                newTitle = newTitle.replace(new RegExp(falseWord, 'g'), trueWord);
            }
        });

        this.replaceTitle(newTitle);
        this.addCautionMark();
    }

    private replaceTitle(newTitle: string) {
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

    public addCautionMark(): void {
        const cautionMark = document.createElement('span');
        cautionMark.textContent = '⚠️';
        cautionMark.classList.add('caution');
        this.element.querySelector('.work_name a')!.before(cautionMark);
    }

    public async toggleDisplay(): Promise<void> {
        if (await BlockedCircles.checkBlocked(this.circleID)) {
            this.hide();
        } else {
            this.display();
        }
    }

    public display(): void {
        this.element.classList.remove('hidden');
    }

    public hide(): void {
        this.element.classList.add('hidden');
    }
}


// = = = = = ReDisplayBtn = = = = =
class ReDisplayBtn {
    public static text = 'ブロックしたサークルの作品を再表示'
    public static className = 'reDisplayBtn'

    public static exist(): boolean {
        return document.querySelector(`.${this.className}`) !== null;
    }

    public static add() {
        const reDisplayBtn = document.createElement('a');
        reDisplayBtn.textContent = this.text;
        reDisplayBtn.classList.add(this.className);
        reDisplayBtn.addEventListener('click', this.showWorks);
        const resultList = document.querySelector('#search_result_list');
        if (!resultList) {
            throw new Error('Cannot get result list');
        }
        resultList.before(reDisplayBtn);
    }

    public static showWorks() {
        const hiddenWorks = document.querySelectorAll('.hidden');
        hiddenWorks.forEach(work => {
            work.classList.remove('hidden');
        });
    }
}


// = = = = = BlockBtn = = = = =
class BlockBtn {
    private element: HTMLButtonElement;
    private workInfo: { circleID: string, circleName: string, element: Element }

    constructor(workInfo: { circleID: string, circleName: string, element: Element }) {
        this.workInfo = workInfo;
        this.element = document.createElement('button');
        this.element.classList.add('BlockBtn');
        this.element.addEventListener('click', async () => await this.click(workInfo));
    }

    async add() {
        const makerElement = this.workInfo.element.querySelector('.maker_name');
        makerElement!.after(this.element);
    }

    async update() {
        if (await BlockedCircles.checkBlocked(this.workInfo.circleID)) {
            this.element.textContent = 'Unblock';
            this.element.classList.add('unblock');
            this.element.classList.remove('block');
        } else {
            this.element.textContent = 'Block!';
            this.element.classList.add('block');
            this.element.classList.remove('unblock');
        }
    }

    async click(workInfo: { circleID: string, circleName: string, element: Element }) {
        if (this.element.classList.contains('block')) {
            // Request
            await BlockedCircles.add(workInfo.circleID, workInfo.circleName);
            // turn unblock
            this.element.classList.remove('block');
            this.element.classList.add('unblock');
            this.element.textContent = 'Unblock';
        } else {
            // Request
            await BlockedCircles.remove(workInfo.circleID);
            // turn block
            this.element.classList.remove('unblock');
            this.element.classList.add('block');
            this.element.textContent = 'Block!';
        }
    }
}


// = = = = = Main = = = = =
const page = new Page();
page.addEventListener();
page.firstRun();
page.addReDisplayBtn();


