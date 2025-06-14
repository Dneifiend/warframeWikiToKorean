// TODO 스토리지 써서 옵션 만들 것.끄면 다 꺼지게

var WARFRAME_KO_DATA;
var koArr;

var css = `

li.search:hover{
background-color: #99d9ff !important;
color: #00006b;
}

li.search:focus{
background-color: #1e76e3 !important;
color: white !important;
}

li.search {
background-color: #506c83;
list-style: none;
padding: 0.5rem;
outline: none;
color: #ffffff;
}

input#ko-search-input:focus {
background-color: #ffffff;
color: #031a4c;
}

.ko-search-container{
z-Index: 999;
color: black;
background-color: rgba(0,0,0,0.6);
}
.ko-search-container input{
z-Index: 1000;
background-color: #abb2c1;
color: #5c5c5c;
}
.ko-search-container li{
z-Index: 1001;
}
.ko-search-result-container {
outline: none;
}


`;
var style = document.createElement("style");

if (style.styleSheet) {
  style.styleSheet.cssText = css;
} else {
  style.appendChild(document.createTextNode(css));
}
document.getElementsByTagName("head")[0].appendChild(style);

(function () {
  var btn = document.createElement("button");
  btn.classList.add("search-ko-btn");
  btn.setAttribute("flag","enable")
  btn.style.cssText = `height: 40px;
background-color: #153c56;
outline: none;
border: none;
filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.5));`;
  btn.textContent = "검색";

  document.querySelector("#right-navigation ").append(btn);
  btn.addEventListener("click", koSearch);
})();

function koSearch(event) {
  event.preventDefault();
  document
    .querySelectorAll(".ko-search-container, .ko-search-container *")
    .forEach((el) => el.remove());
  var container = document.createElement("div");
  container.classList.add("ko-search-container");
  var input = document.createElement("input");
  input.id = "ko-search-input";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.placeholder = "한글로 검색어를 입력하세요";

  container.style.width = "100vw";
  container.style.height = "100vh";
  container.style.position = "fixed";
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.flexDirection = "column";

  var pop = document.createElement("pop");
  pop.style.width = "max(30vw, 600px)";
  pop.style.height = "20rem";
  pop.style.overflowY = "auto";
  pop.style.maxHeight = "20rem";
  pop.classList.add("ko-search-result-container");

  container.append(input);
  container.append(pop);
  document.body.prepend(container);

  input.style.width = "max(30vw, 600px)";
  input.style.fontSize = "1.2rem";
  input.style.padding = "1rem";
  input.style.outline = "none";
  input.style.marginTop = "15rem";

  input.focus();

  input.addEventListener("keydown", (evt) => {
    if (evt.key == "Escape") {
      document
        .querySelectorAll(".ko-search-container, .ko-search-container *")
        .forEach((el) => el.remove());
      return;
    }

    if (evt.key == "ArrowDown") {
      document.querySelector(".search")?.focus();
      evt.preventDefault();
    } else if (evt.key == "Enter") {
      window.location.href =
        "https://wiki.warframe.com/?search=" +
        encodeURIComponent(document.querySelector(".search").dataset.en);
    } else if (input.value.length < 2) {
      while (pop.childElementCount > 0) {
        pop.childNodes.forEach((node) => node.remove());
      }
    }
  });

  input.addEventListener("input", (evt) => {
    if (input.value.length > 1) {
      var searchResult = hansearch(koArr, input.value.replace(/\s+/g, "")).mark(
        "b"
      );
      var res = searchResult.items
        .sort((a, b) => {
          var _a =
            input.value.replace(/\s+/g, "").length /
            Object.values(a)[0][0].replace(/\s+|(<b>)|(<\/b>)/g, "").length;
          var _b =
            input.value.replace(/\s+/g, "").length /
            Object.values(b)[0][0].replace(/\s+|(<b>)|(<\/b>)/g, "").length;
          return _b - _a;
        })
        .sort((a, b) => {
          return (
            Object.values(a)[0][0]
              .replace(/\s+/g, "")
              .indexOf(input.value.replace(/\s+/g, "")) -
            Object.values(b)[0][0]
              .replace(/\s+/g, "")
              .indexOf(input.value.replace(/\s/g, ""))
          );
        })
        .map((result, resultIdx) => {
          var li = document.createElement("li");
          li.innerHTML = Object.values(result)[0][0];
          li.classList.add("search");
          li.dataset.ko = Object.values(result)[0][0].replace(
            /(<b>)|(<\/b>)/g,
            ""
          );
          li.dataset.en = Object.keys(result)[0].replace(/(<b>)|(<\/b>)/g, "");
          li.tabIndex = 0;

          li.addEventListener("keydown", (evt) => {
            evt.preventDefault();
            if (evt.key == "Escape") {
              document
                .querySelectorAll(
                  ".ko-search-container, .ko-search-container *"
                )
                .forEach((el) => el.remove());
              return;
            }
            if (evt.key == "ArrowDown") {
              input.value = evt.target.nextSibling.dataset.ko;
              evt.target.nextSibling.focus();
            } else if (evt.key == "ArrowUp") {
              input.value = evt.target.previousSibling.dataset.ko;
              evt.target.previousSibling.focus();
            } else if (evt.key == "Backspace") {
              input.value = input.value.slice(0, -1);
              input.focus();
            } else if (evt.key == "Enter") {
              window.location.href =
                "https://wiki.warframe.com/?search=" +
                encodeURI(Object.keys(result)[0]);
            }
          });

          li.addEventListener("click", (evt) => {
            window.location.href =
              "https://wiki.warframe.com/?search=" +
              encodeURI(Object.keys(result)[0]);
          });

          return li;
        });

      while (pop.childElementCount > 0) {
        pop.childNodes.forEach((node) => node.remove());
      }

      pop.append(...res);

      document
        .querySelector("li.search:first-child")
        .addEventListener("keydown", (evt) => {
          if (evt.key == "ArrowUp") {
            input.focus();
          }
          evt.preventDefault();
        });
    } else {
      while (pop.childElementCount > 0) {
        pop.childNodes.forEach((node) => node.remove());
      }
    }
  });

  document.addEventListener("click", (evt) => {
    console.log(evt);
    if (
      evt.target.id == "ko-search-input" ||
      evt.target.className == "search" ||
      evt.target.className == "search-ko-btn" ||
      evt.target.parentElement.parentElement.className == "search-ko-btn"
    ) {
      return;
    } else {
      console.log("do remove");
      document
        .querySelectorAll(".ko-search-container, .ko-search-container *")
        .forEach((el) => el.remove());
    }
  });
}

function getData() {
  return new Promise((res, rej) => {
    var httpReq = new XMLHttpRequest();
    httpReq.open(
      "GET",
      "https://raw.githubusercontent.com/Dneifiend/warframeWikiToKorean/master/export/warframeKO.json"
    );
    httpReq.send();
    httpReq.addEventListener("loadend", (response) => {
      var data = JSON.parse(response.target.response);
      var obj = {};
      Object.keys(data).forEach((e) => {
        obj[e.trim().replace(/\s+/g, " ").toUpperCase()] = data[e];
      });
      res(obj);
    });
  });
}
getData().then((e) => {
  WARFRAME_KO_DATA = e;
  koArr = Object.keys(WARFRAME_KO_DATA).map((e) => {
    var obj = {};
    obj[e] = [WARFRAME_KO_DATA[e], WARFRAME_KO_DATA[e].replace(/\s+/g, "")];
    return obj;
  });
});

async function wikiTrans() {
  var data = WARFRAME_KO_DATA || (await getData());
  document
    .querySelectorAll("h1, span, p, dt, a, figcaption, font")
    .forEach((ele, idx) => {
      if (ele.childElementCount === 0) {
        var kr = data[ele.textContent.trim().replace(/\s/g, " ").toUpperCase()];
        if (kr) {
          ele.textContent = kr;
        }
      }
    });
}

async function searchEng(en) {
  var data = WARFRAME_KO_DATA || (await getData());
  return data[en];
}

async function searchKor(searchKo) {
  var data = WARFRAME_KO_DATA || (await getData());
  var i = Object.values(data).indexOf(searchKo);
  var eng = Object.keys(data)[i];
  if (eng) {
    return eng;
  }
}
async function getInputEng(txt) {
  var searchInputHtml = document.querySelector(
    "[class*=SearchInput-module_input]"
  );
  if (searchInputHtml) {
    var c = await searchKor(txt.trim());
    return c;
  }
}

wikiTrans();
