import fetch from "node-fetch"
import path from "path"
import fs from "fs"

const appDatas = [
    "ExportCustoms_",
    "ExportDrones_",
    "ExportFlavour_",
    "ExportGear_",
    "ExportKeys_",
    "ExportRegions_",
    "ExportRelicArcane_",
    "ExportResources_",
    "ExportSentinels_",
    "ExportUpgrades_",
    "ExportWarframes_",
    "ExportWeapons_"
]



function getData(filename) {
    return new Promise((resolve, rej) => {
        return fs.readFile(filename, (err, data) => {
            if (err) {
                throw err
            }
            resolve(JSON.parse(data))
        })
    })
}




fs.mkdir(path.resolve() + '/export', {
    recursive: true
}, err => {
    if (err) throw err;
});

var promiseArr = []
var lastData = {}

function updateLastData(_lastData, uniqueName, koString, enString) {
  if (uniqueName?.length || koString?.length || enString?.length) {
    if (!_lastData[uniqueName]) {
      _lastData[uniqueName] = {};
    }
    _lastData[uniqueName].koName = koString;
    _lastData[uniqueName].enName = enString;
  }
}

function setData(_lastData,_ko, _en, filename='') {
    for (let key in _ko) {
        try {
            
            let uniqueName, koString, enString

            uniqueName = _ko[key]?.uniqueName ?? _ko[key]?.abilityUniqueName
            koString = _ko[key]?.name ?? _ko[key]?.abilityName
            enString = _en[key]?.name?.toUpperCase() ?? _en[key]?.abilityName?.toUpperCase()

            if(uniqueName && koString && enString){
                updateLastData(lastData, uniqueName, koString, enString);
            }

            if (_ko[key] && typeof _ko[key] === 'object') {
                // 배열이나 객체이면 재귀 호출
                const childKo = _ko[key];
                const childEn = (_en && _en[key] !== undefined) ? _en[key] : _en;
                setData(lastData, childKo, childEn, filename);
                continue;
            }
            

    
        }
        catch (err) {
            var koString = _ko[key]?.name ?? _ko[key].abilityName
            console.log('---------------------')
            console.error(filename, "---", key, "---", koString)
        }
    }


}

for (let i = 0; i < appDatas.length; i++) {
    let filename = appDatas[i]
    let ko = await getData(path.resolve() + '/app_appdata/' + filename + 'ko.txt')
    let en = await getData(path.resolve() + '/app_appdata/' + filename + 'en.txt')

    setData(lastData,ko, en, filename)
    console.log("\t"+filename + ' Parse Done.');
}



fs.writeFile('export/totalData.json', JSON.stringify(lastData), 'utf8', () => { });
console.log('All data Parse and Output Done.');
