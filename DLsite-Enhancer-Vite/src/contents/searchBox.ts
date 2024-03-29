import exchangeWords from '../components/exchangeWords.json';


class SearchBox {
    element: HTMLInputElement;
    submitBtnElement: HTMLButtonElement;

    constructor() {
        this.element = document.querySelector('#search_text')!;
        this.submitBtnElement = document.querySelector('#search_button')!;
    }

    public addListener() {
        this.element.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.callbackSubmit(event);
            }
        });
    }

    private callbackSubmit(event: Event) {
        const target = event.target as HTMLInputElement;
        // Cancel default search
        event.preventDefault();
        // Replace True words to False words
        let modifiedInput = this.replaceWords(target.value);
        console.log(`Before : ${target.value}\nAfter : ${modifiedInput}`);
        target.value = modifiedInput;
        // Execute search
        this.submitBtnElement.click(); // TODO: uncomment
    }

    private replaceWords(input: string) {
        // check if the input contains any true words
        const trueWords = exchangeWords.flatMap(word => word.true);
        const included = trueWords.some(word => input.includes(word));
        if (!included) {
            return input;
        }

        // Replace True words to False words
        let result = input;
        exchangeWords.forEach(wordPair => {
            if (input.includes(wordPair.true)) {
                const falseWords = wordPair.false.filter(word => !word.includes('○')).join('|');
                result = result.replace(
                    new RegExp(wordPair.true, 'g'),
                    falseWords
                );
            }
        });
        return result;
    }
}

const searchBox = new SearchBox();
searchBox.addListener();