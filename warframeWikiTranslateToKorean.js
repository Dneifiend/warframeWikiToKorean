var WARFRAME_KO_DATA;

function getData() {
    return new Promise((res, rej) => {
        var httpReq = new XMLHttpRequest();
        httpReq.open("GET", 'https://gist.githubusercontent.com/Dneifiend/7ac3a86b829c08bc2e3b5757349e7b6b/raw/d4ad3accfb105d47e567248c9d6b1f0b16337a4a/warframeKO.json');
        httpReq.send();
        httpReq.addEventListener('loadend', (response) => {
            var data = JSON.parse(response.target.response);
            var obj = {};
            Object.keys(data).forEach(e => {
                obj[e.toUpperCase()] = data[e];
            });
            res(obj);
        });
    });
}
getData().then(e => {
    WARFRAME_KO_DATA = e;
});

async function wikiTrans() {
    var data = WARFRAME_KO_DATA || await getData()
    document.querySelectorAll('h1, span, a, p, dt').forEach(ele => {
        if (data[ele.textContent.trim().toUpperCase()]) {
            var en = ele.textContent.trim()
            var kr = data[ele.textContent.trim().toUpperCase()]
            ele.textContent = ele.textContent.replace(en, kr)
        }
    })
}

async function searchEng(en) {
    var data = WARFRAME_KO_DATA || await getData()
    return data[en]
}

async function searchKor(searchKo) {
    var data = WARFRAME_KO_DATA || await getData()
    var i = Object.values(data).indexOf(searchKo)
    var eng = Object.keys(data)[i]
    if (eng) {
        return eng
    }
}
async function getInputEng() {
    var searchInputHtml = document.querySelector('input[name=query]')
    if (searchInputHtml) {

        var c = await searchKor(searchInputHtml.value.trim())
        return c
    }
}


async function searchChanger() {
    var data = WARFRAME_KO_DATA || await getData()

    var searchInputHtml = document.querySelector('input[name=query]')
    if (searchInputHtml) {
        searchInputHtml.placeholder = "한글 입력 후 Crtl + Enter 입력 시 영문으로 전환됩니다."
    }

    var dataList = document.createElement('datalist')
    dataList.id = "koLang"

    Object.values(data).forEach((ko, koIdx) => {
        var opt = document.createElement('option')
        opt.value = ko
        dataList.append(opt)
    })
    document.body.append(dataList)
    if (searchInputHtml) {

        searchInputHtml.setAttribute('list', "koLang")
        searchInputHtml.addEventListener('keydown', e => {
            if (e.ctrlKey && e.key === "Enter") {
                getInputEng().then(e => {
                    searchInputHtml.value = e.toLowerCase().replace(/\b(.)/g, (e => {
                        return e.toUpperCase()
                    }))
                })
            }
        })
    }

}




var addEventWhenRdy = setInterval(() => {
    if (document.readyState === "interactive" || document.readyState === "complete") {
        console.log('워프레임 위키 한국어 전환 완료')
        wikiTrans()
        searchChanger()
        clearInterval(addEventWhenRdy)
    }
}, 10);