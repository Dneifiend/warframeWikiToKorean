import fetch from "node-fetch"
import path from "path"
import fs from "fs"

// 녹스기준 작동함
// C:\Utility\platform-tools\adb.exe connect 127.0.0.1:62001
// C:\Utility\platform-tools\adb.exe -s 127.0.0.1:62001 pull /data/data/com.digitalextremes.warframenexus/app_appdata


// adb -s emulator-5554 pull /data/data/com.digitalextremes.warframenexus/app_appdata 

// su 로 superuser 획득
// adb -s 127.0.0.1:5556 pull /data/data/com.digitalextremes.warframenexus/app_appdata

// shell안에서
//$ cp /data/data/com.digitalextremes.warframenexus/app_appdata/* /sdcard/temp/

// 최신 (Android8 이상 adb)에서는 미작동. debuggable = true 가 켜져있어야 함
// D:\Android\SDK\platform-tools\adb.exe exec-out su -s 127.0.0.1:5556 pull /data/data/com.digitalextremes.warframenexus/app_appdata 

const appDatas = [
    "ExportAbilitiesLibrary_",
    "ExportCustoms_",
    "ExportDrones_",
    "ExportFlavour_",
    "ExportGear_",
    "ExportKeys_",
    "ExportOthers_",
    "ExportRegionNodes_",
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

for (let i = 0; i < appDatas.length; i++) {
    let filename = appDatas[i]
    let ko = await getData(path.resolve() + '/app_appdata/' + filename + 'ko.txt')
    let en = await getData(path.resolve() + '/app_appdata/' + filename + 'en.txt')
    for (let key in ko) {

        try {

            let uniqueName, koString, enString
            uniqueName = ko[key]?.uniqueName ?? ko[key]?.abilityUniqueName
            koString = ko[key]?.name ?? ko[key].abilityName
            enString = en[key]?.name?.toUpperCase() ?? en[key].abilityName?.toUpperCase()

            if (uniqueName.length || koString.length || enString.length) {

                if (!lastData[uniqueName]) {
                    lastData[uniqueName] = {};
                }
                lastData[uniqueName].koName = koString
                lastData[uniqueName].enName = enString
            }

            if (uniqueName === "/Lotus/Powersuits/Yareli/Yareli") {
                // debugger
                // console.log({uniqueName, koString, enString})
            }

        }
        catch (err) {
            var koString = ko[key]?.name ?? ko[key].abilityName
            console.log('---------------------')
            console.log(filename, "---", key, "---", koString)
        }
    }
}



fs.writeFile('export/totalData.json', JSON.stringify(lastData), 'utf8', () => { });
console.log('All data Parse and Output Done.');
