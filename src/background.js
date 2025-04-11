// タブのキャッシュ（title, url）を保存するための変数
const activeTabs = {};

// タブの更新時にタイトルやURLを保存
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.startsWith("http")) {
    activeTabs[tabId] = {
      title: tab.title || '',
      url: tab.url || '',
      updatedAt: new Date().toISOString()
    };
  }
});

// タブが閉じられたときに履歴保存
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (removeInfo.isWindowClosing) {
    const closedTab = activeTabs[tabId];
    if (closedTab) {
      chrome.storage.local.get({ closedTabs: [] }, (result) => {
        const closedTabs = result.closedTabs;
        closedTabs.push({ ...closedTab, closedAt: new Date().toISOString() });
        chrome.storage.local.set({ closedTabs });
        delete activeTabs[tabId];
      });
    }
  }
});

// 起動時に保存されたタブを復元（最大5件）
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get({ closedTabs: [] }, (result) => {
    const restoreTabs = result.closedTabs.slice(-5);
    restoreTabs.forEach(tabInfo => {
      if (tabInfo.url) {
        chrome.tabs.create({ url: tabInfo.url });
      }
    });
  });
});

// ページ遷移履歴の保存
chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId !== 0) return;
  chrome.storage.local.get({ tabHistory: {} }, (result) => {
    const tabHistory = result.tabHistory;
    if (!tabHistory[details.tabId]) tabHistory[details.tabId] = [];
    const history = tabHistory[details.tabId];
    if (history[history.length - 1] !== details.url) {
      history.push(details.url);
    }
    chrome.storage.local.set({ tabHistory });
  });
});
