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
    "ExportWeapons_",
    "items_",
    "mods_",
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

for (let i = 0; i < appDatas.length; i++) {
    let filename = appDatas[i]
    let ko = await getData(path.resolve() + '/app_appdata/' + filename + 'ko.txt')
    let en = await getData(path.resolve() + '/app_appdata/' + filename + 'en.txt')
    for (let key in ko) {

        try {

            let uniqueName, koString, enString
            if(Object.prototype.toString.call(ko[key]) === '[object Array]'){

                var dataArr = Object.values(ko[key])
                dataArr.forEach((dataObj,dataObjIdx)=> {
                    uniqueName = dataObj.uniqueName ?? dataObj.abilityUniqueName
                    koString = dataObj.name ?? dataObj.abilityName
                    enString = en[key][dataObjIdx]?.name ?? en[key][dataObjIdx]?.abilityName
    
                });
            }
            else if(Object.prototype.toString.call(ko[key]) === '[object Object]'){
                uniqueName = ko[key]?.uniqueName ?? ko[key].abilityUniqueName
                koString = ko[key]?.name ?? ko[key].abilityName
                enString = en[key]?.name?.toUpperCase() ?? en[key].abilityName?.toUpperCase()
            }



            if (uniqueName?.length || koString?.length || enString?.length) {

                if (!lastData[uniqueName]) {
                    lastData[uniqueName] = {};
                }
                lastData[uniqueName].koName = koString
                lastData[uniqueName].enName = enString
            }

        }
        catch (err) {
            var koString = ko[key]?.name ?? ko[key].abilityName
            console.log('---------------------')
            console.error(filename, "---", key, "---", koString)
        }
    }
}



fs.writeFile('export/totalData.json', JSON.stringify(lastData), 'utf8', () => { });
console.log('All data Parse and Output Done.');
