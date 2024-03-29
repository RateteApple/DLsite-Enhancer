let oldUrl = location.href;

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

export function addUrlChangeListener(callback: () => void) {
    window.addEventListener('urlChange', callback);
}

