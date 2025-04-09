// テンプレートでテキスト生成
const createTextFromTemplate = (title, url, template) => {
    let txt = template;
    txt = txt.replace(/%%title%%/g, title);
    txt = txt.replace(/%%url%%/g, url);
    return txt;
}

// タブの一覧を生成して textarea に表示
const run = () => {
    chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
        let txt = '';
        const delimiter = '\n';
        const template = '[%%title%%](%%url%% "%%title%%")';

        document.querySelector('#numOfTabs').value = tabs.length;

        tabs.forEach((tab, i) => {
            if (i !== 0) txt += delimiter;
            txt += createTextFromTemplate(tab.title, tab.url, template);
        });

        document.querySelector('#txt').value = txt;
    });
}

// コピー処理
const copy = () => {
    const copyText = document.querySelector('#txt');
    copyText.select();
    document.execCommand('copy');
}

// 初期化
window.addEventListener('load', () => {
    run();
    document.querySelector("#copy").addEventListener("click", copy);
}, false);

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
