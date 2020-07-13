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
    document.querySelectorAll('h1, span, p, dt, a, figcaption, font').forEach(ele => {
        if (ele.childElementCount === 0) {

            if (data[ele.textContent.trim().toUpperCase()]) {
                var en = ele.textContent.trim()
                var kr = data[ele.textContent.trim().toUpperCase()]
                ele.textContent = ele.textContent.replace(en, kr)
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
    var searchInputHtml = document.querySelector('input[name=query]')
    if (searchInputHtml) {
        var c = await searchKor(txt.trim())
        return c
    }
}


async function searchChanger() {
    var data = WARFRAME_KO_DATA || await getData()

    console.log('s')
    //한글검색 체크박스
    checkbox = document.querySelector('#koSearchCheck');
    if (!checkbox) {
        var _label = document.createElement('label')
        var _check = document.createElement('input')
        _label.style.marginRight = "10px"
        _check.type = "checkbox"
        _check.id = "koSearchCheck"
        _check.setAttribute('checked', "")
        _label.textContent = "한글검색";
        _label.prepend(_check)
        document.querySelector('.wds-global-navigation__search')?.prepend(_label)
        _check.addEventListener('click', (evt) => {
            var checkBox = evt.target;
            var checked = checkBox.checked;
            if (checked) {
                document.querySelector('.wds-global-navigation__search-input').setAttribute('list', 'koLang')
                document.querySelector('.wds-global-navigation__search-input').placeholder = "한글 입력 후 Enter 입력 시 영문 전환"
            }
            if (!checked) {
                document.querySelector('.wds-global-navigation__search-input').removeAttribute('list')
                document.querySelector('.wds-global-navigation__search-input').placeholder = "한글검색 체크 시 한글검색 가능"
            }
        })
    }





    var searchInputHtml = document.querySelector('input[name=query]')
    if (searchInputHtml) {
        searchInputHtml.placeholder = "한글 입력 후 Enter 입력 시 영문 전환"
    }

    var dataList = document.createElement('datalist')
    dataList.id = "koLang"

    Object.values(data).forEach((ko, koIdx) => {
        if (ko.length <= 15) {
            var opt = document.createElement('option')
            opt.value = ko
            dataList.append(opt)
        }
    })
    document.body.append(dataList)
    if (searchInputHtml) {

        searchInputHtml.setAttribute('list', "koLang")
        var _txt = ''
        searchInputHtml.addEventListener('keyup', e => {
            checkbox = document.querySelector('#koSearchCheck');
            if (checkbox.checked) {
                if (e.key !== "Enter") {
                    _txt = searchInputHtml.value
                }
                if (e.key === "Enter") {
                    // if (e.ctrlKey && e.key === "Enter") {
                    searchInputHtml.value = _txt
                    console.log(_txt)
                    getInputEng(_txt).then(e => {

                        if (e) {
                            var _q = e.toLowerCase().replace(/\b(.)/g, (e => {
                                return e.toUpperCase()
                            }))
                            searchInputHtml.value = _q;
                            window.location = 'https://warframe.fandom.com/wiki/Special:Search?query=' + _q;
                        };
                    }).catch('검색 값이 없음')
                }
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