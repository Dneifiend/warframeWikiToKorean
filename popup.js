var targetChecker = (url) => {
    var targetSite = [[/\.inven\.co\.kr/, 'inven'],
    [/\.youtube\.com/, 'youtube']
    ]
    return targetSite.findIndex(e => url.search(e[0]) !== -1) !== -1
}


var c = document.getElementById('s')
c.addEventListener('click', () => {
    console.log(chrome.tabs)
    chrome.storage.sync.set({ "dnvalue": c.textContent }, () => {
        chrome.storage.sync.get("dnvalue", (val) => { alert(val.dnvalue) })
    })
})


//summoned me
document.querySelector('#summonedme').addEventListener('click', () => {
    window.open('http://summoned.me')
})




document.getElementById('fullscr').addEventListener('click', () => {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (targetChecker(tabs[0].url)) {
            chrome.tabs.sendMessage(tabs[0].id, { code: 'global.fullscreen()' }, function (response) {
                console.log(response);
            });
        }

    });
})



document.getElementById('refresh').addEventListener('click', () => {
    chrome.runtime.reload();
})
// chrome.runtime.reload();