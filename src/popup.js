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
