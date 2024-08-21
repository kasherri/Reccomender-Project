chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'getPageInfo') {
        const pageTitle = document.title;
        const metaDescription = document.querySelector("meta[name='description']")?.content;
        sendResponse({ title: pageTitle, description: metaDescription });
    }
});
