const createTextFromTemplate = (title, url, templete) => {
    let txt = templete;

    txt = txt.replace(/%%title%%/g,title);
    txt = txt.replace(/%%url%%/g,url);
    return txt;
}

const run = () => {
    chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT},(tabs) => {
        let txt = '';
        const delimiter = '\n';
        const templete = '[%%title%%](%%URL%% \"%%title%%_")';

        document.querySelector('#numOfTabs').value = tabs.length;

        tabs.forEach((tab,i) => {
            if(i!=0) txt += delimiter;
            console.log(tab.title+" "+tab.url);
            txt += createTextFromTemplate(tab.title,tab.url,templete);
        })

        document.querySelector('#txt').value = txt;
    });
}

const copy = () => {
    const copyText = document.querySelector('#txt');
    copyText.ariaSelected();
    document.execCommand('copy');
}

window.addEvetnListener('load',()=>{
    run();
    document.querySelector("#copy").addEventListener("click", copy);
})