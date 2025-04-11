// キャッシュとしてタブ情報を保持
let activeTabs = {};

chrome.storage.local.remove('closedTabs', () => {
    console.log('閉じたタブ情報を削除しました');
  });  

// 起動時：保存されたタブURLを復元
chrome.runtime.onStartup.addListener(() => {
    console.log("Chromeが起動されました！");

    chrome.storage.local.get({ closedTabs: [] }, (result) => {
        const closedTabs = result.closedTabs || [];
        const tabsToRestore = closedTabs.slice(-5); // 最新5件を復元

        tabsToRestore.forEach(tabInfo => {
            if (tabInfo.url) {
                chrome.tabs.create({ url: tabInfo.url });
            }
        });

        // 必要に応じてクリア可能
        // chrome.storage.local.set({ closedTabs: [] });
    });
});

// タブ作成時：タブ情報を保存
chrome.tabs.onCreated.addListener((tab) => {
    console.log("新しいタブが開かれました:", tab);

    const newTabData = {
        title: tab.title || '',
        url: tab.url || '',
        createdAt: new Date().toISOString()
    };

    chrome.storage.local.get({ openedTabs: [] }, (result) => {
        const openedTabs = result.openedTabs;
        openedTabs.push(newTabData);
        chrome.storage.local.set({ openedTabs });
    });
});

// タブ更新時：キャッシュに最新情報を保持
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        activeTabs[tabId] = {
            title: tab.title || '',
            url: tab.url || '',
            windowId: tab.windowId,
            updatedAt: new Date().toISOString()
        };
    }
});

// タブが閉じられたとき：キャッシュから取得して保存
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    const closedTabData = activeTabs[tabId];
    if (!closedTabData) return;

    closedTabData.closedAt = new Date().toISOString();

    chrome.storage.local.get({ closedTabs: [] }, (result) => {
        const closedTabs = result.closedTabs;
        closedTabs.push(closedTabData);
        chrome.storage.local.set({ closedTabs });
    });

    delete activeTabs[tabId]; // メモリ掃除
});

// ページ遷移時：タブ履歴を保存（tabIdごと）
chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.frameId !== 0) return; // メインフレームのみ

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
