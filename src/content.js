// 起動時処理：保存されたタブURLを復元
chrome.runtime.onStartup.addListener(() => {
    console.log("Chromeが起動されました！");

    chrome.storage.local.get({ closedTabs: [] }, (result) => {
        const closedTabs = result.closedTabs || [];
        const tabsToRestore = closedTabs.slice(-5); // 最新5件だけ復元

        tabsToRestore.forEach(tabInfo => {
            if (tabInfo.url) {
                chrome.tabs.create({ url: tabInfo.url });
            }
        });

        // 必要に応じて保存データをクリア
        // chrome.storage.local.set({ closedTabs: [] });
    });
});

// タブ作成時に保存
chrome.tabs.onCreated.addListener((tab) => {
    console.log("新しいタブが開かれました:", tab);

    chrome.storage.local.get({ openedTabs: [] }, (result) => {
        const openedTabs = result.openedTabs;
        const newTabData = {
            title: tab.title || '',
            url: tab.url || '',
            createdAt: new Date().toISOString()
        };
        openedTabs.push(newTabData);
        chrome.storage.local.set({ openedTabs });
    });
});

// タブが閉じられたとき（ウィンドウが閉じられた場合も検知）に保存
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    if (removeInfo.isWindowClosing) {
        chrome.tabs.get(tabId, (tab) => {
            if (chrome.runtime.lastError) return;

            const closedTabData = {
                title: tab.title || '',
                url: tab.url || '',
                windowId: tab.windowId,
                closedAt: new Date().toISOString()
            };

            chrome.storage.local.get({ closedTabs: [] }, (result) => {
                const closedTabs = result.closedTabs;
                closedTabs.push(closedTabData);
                chrome.storage.local.set({ closedTabs });
            });
        });
    }
});

// ページ遷移を履歴として保存（タブID単位で）
chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.frameId !== 0) return;

    const tabId = details.tabId;
    const url = details.url;

    chrome.storage.local.get({ tabHistory: {} }, (result) => {
        const tabHistory = result.tabHistory;

        if (!tabHistory[tabId]) {
            tabHistory[tabId] = [];
        }

        const history = tabHistory[tabId];
        if (history.length === 0 || history[history.length - 1] !== url) {
            history.push(url);
        }

        chrome.storage.local.set({ tabHistory });
    });
});
