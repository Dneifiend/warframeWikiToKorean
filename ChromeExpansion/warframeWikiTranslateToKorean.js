var WARFRAME_KO_DATA;

function getData() {
    return new Promise((res, rej) => {
        var httpReq = new XMLHttpRequest();
        httpReq.open("GET", 'https://raw.githubusercontent.com/Dneifiend/warframeWikiToKorean/master/export/warframeKO.json');
        httpReq.send();
        httpReq.addEventListener('loadend', (response) => {
            var data = JSON.parse(response.target.response);
            var obj = {};
            Object.keys(data).forEach(e => {
                obj[e.trim().replace(/\s/g, " ").toUpperCase()] = data[e];
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
    document.querySelectorAll('h1, span, p, dt, a, figcaption, font').forEach((ele, idx) => {
        if (ele.childElementCount === 0) {
            var kr = data[ele.textContent.trim().replace(/\s/g, " ").toUpperCase()]
            if (kr) {
                ele.textContent = kr
            }
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
async function getInputEng(txt) {
    var searchInputHtml = document.querySelector('[class*=SearchInput-module_input]')
    if (searchInputHtml) {
        var c = await searchKor(txt.trim())
        return c
    }
}



async function searchChanger() {
    var data = WARFRAME_KO_DATA || await getData()
    var IS_SEARCH_POPUP_OPENED = document.querySelector('[class*=SearchInput-module_input]') !== null

    if (IS_SEARCH_POPUP_OPENED) {
        var searchInputHtml = document.querySelector('[class*=SearchInput-module_input]')
        var dataList = document.createElement('datalist')
        dataList.id = "koLang"

        Object.values(data).forEach((ko, koIdx) => {
            if (ko.length <= 30) {
                var opt = document.createElement('option')
                opt.value = ko
                dataList.append(opt)
            }
        })
        document.body.append(dataList)
        if (searchInputHtml) {

            searchInputHtml.setAttribute('list', "koLang")
            searchInputHtml.placeholder = "한글 입력 후 자동완성 선택 시 공식영어로 자동 전환됩니다."

            var _txt = ''
            searchInputHtml.addEventListener('change', e => {
                getInputEng(searchInputHtml.value).then(e => {
                    if (e) {
                        var _q = e.toLowerCase().replace(/\b(.)/g, (e => {
                            return e.toUpperCase()
                        }))
                        searchInputHtml.value = _q;

                    };
                }).catch('검색 값이 없음')
            })
        }
    }
}


var POPUP_FUNCTION_FLAG = false
var ob = new MutationObserver(evts => {

    var el = document.querySelector('[class*=SearchInput-module_input]')
    if (el === null) {
        POPUP_FUNCTION_FLAG = true
    }

    if (el && POPUP_FUNCTION_FLAG) {
        searchChanger()
        POPUP_FUNCTION_FLAG = false
    }
})

var transOb = new MutationObserver(evts => {
    wikiTrans()
})

ob.observe(document.querySelector('body'), { childList: true, subtree: true })
transOb.observe(document.querySelector('body'), { subtree: true, childList: true })