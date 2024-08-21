let visitedLinks = [];

chrome.history.onVisited.addListener((historyItem) => {
    chrome.tabs.sendMessage({ type: 'getPageInfo' }, (pageInfo) => {
        visitedLinks.push({ url: historyItem.url, title: pageInfo.title, description: pageInfo.description });
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'getLinks') {
        sendResponse(visitedLinks);
    }
});
