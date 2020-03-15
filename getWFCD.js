const https = require('https');
const path = require('path');
const fs = require('fs');

var totalData = {}
var WFCDdata = {
  type1: [
    "https://raw.githubusercontent.com/WFCD/warframe-worldstate-data/master/data/ko/syndicatesData.json"
  ],
  type2: [
    "https://raw.githubusercontent.com/WFCD/warframe-worldstate-data/master/data/ko/missionTypes.json",
    "https://raw.githubusercontent.com/WFCD/warframe-worldstate-data/master/data/ko/solNodes.json",
    "https://raw.githubusercontent.com/WFCD/warframe-worldstate-data/master/data/ko/languages.json"
  ],
  type3: [
    "https://raw.githubusercontent.com/WFCD/warframe-worldstate-data/master/data/ko/arcanes.json"
  ]
}

function getHTML(url) {
  return new Promise((resolve, rej) => {
    https.get(url, (res) => {
      var str = ''
      res.on('data', (d) => {
        str += d
      });
      res.on('end', () => {
        resolve(str)
      })

    }).on('error', (e) => {
      rej(e);
    });
  })
}


var promiseAll = []

function getWFCD() {

  Object.keys(WFCDdata).forEach(type => {
    WFCDdata[type].forEach(url => {
      var promiseEle = () => {
        return new Promise(res => {
          Promise.all([getHTML(url), getHTML(url.replace(/\/ko\//g, "/"))]).then(e => {
              var jsonKo = JSON.parse(e[0])
              var jsonEn = JSON.parse(e[1])


              var assignData = Object.keys(jsonKo).reduce((p, c, i) => {
                var valKey;

                if (type === "type1" || type === "type3") {
                  valKey = "name"
                }
                if (type === "type2") {
                  valKey = "value"
                }
                if (type === "type1" || type === "type2") {
                  if (p[c] === undefined) {
                    p[c] = {
                      "koName": jsonKo[c][valKey],
                      "enName": jsonEn[c][valKey].toUpperCase(),
                    }
                  }
                }
                if (type === "type3") {
                  if (p[jsonEn[c]["name"]] === undefined) {
                    p[jsonEn[c]["name"]] = {
                      "koName": jsonKo[c][valKey],
                      "enName": jsonEn[c][valKey].toUpperCase(),
                    }
                  }
                }
                return p
              }, {})
              res(assignData)
            })
            .catch(err => {
              throw err
            })
        })
      }
      promiseAll.push(promiseEle())
    })
  })
}
getWFCD()

function WFCDpromise() {
  return new Promise(res => {
    Promise.all(promiseAll).then(e => {
      e.forEach(e => {
        Object.assign(totalData, e)
      })
      res(totalData)
    })

  })
}


var getData = new Promise((res, rej) => {
  fs.readFile(path.resolve() + '\\export\\totalData.json', (err, fd) => {
    if (err) {
      rej(err);
      throw err;
    }
    res(JSON.parse(fd.toString()));
  });

});



Promise.all([WFCDpromise(), getData]).then(e => {
  var _obj = {}
  Object.assign(_obj, e[0], e[1])
  fs.writeFile('export/totalData.json', JSON.stringify(_obj), 'utf8', () => {
    console.log(path.resolve() + '\\export\\totalData.json');
    console.log('done.');
  });
})