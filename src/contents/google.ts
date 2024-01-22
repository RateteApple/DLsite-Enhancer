// logを出力する
console.log('content.ts');

// insert text to textarea
const textArea: HTMLTextAreaElement | null = document.querySelector('textarea');
if (textArea) {
    textArea.value = 'text insert';
    console.log('insert text to textarea');
}
else {
    console.log('not found textarea');
}