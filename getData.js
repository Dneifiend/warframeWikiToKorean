const http = require('http');
const path = require('path');
const fs = require('fs');

var target = {
    hash: "5EE81E40",
    lang: "ko",
    table: {
        ko: {
            ExportCustoms: "ExportCustoms_ko.json!00_oExkPSE3pGkZjo5ClmE6RQ",
            ExportDrones: "ExportDrones_ko.json!00_fM7HUC6a3-8FEGmQhkZWYA",
            ExportFlavour: "ExportFlavour_ko.json!00_1YMcGIN4OPOzdtiHx+cT1w",
            ExportFusionBundles: "ExportFusionBundles_ko.json!00_HzoZYxZz33XYe-1K5QwI3g",
            ExportGear: "ExportGear_ko.json!00_Z6eqam-SIDGsjtm+bIRMrw",
            ExportKeys: "ExportKeys_ko.json!00_YmZJWW0GNxLH4PFiI+t3uw",
            ExportRecipes: "ExportRecipes_ko.json!00_apn7CNNDKSJC2a+y2WDOYw",
            ExportRegions: "ExportRegions_ko.json!00_UCy2aaQd8z-Qgp8qftllsQ",
            ExportRelicArcane: "ExportRelicArcane_ko.json!00_APruVD08IXIy42DOni2Jbg",
            ExportResources: "ExportResources_ko.json!00_hqY-NqMfrGSPq2eftvek4Q",
            ExportSentinels: "ExportSentinels_ko.json!00_5emYffsmB1MNPnhuyW48-g",
            ExportSortieRewards: "ExportSortieRewards_ko.json!00_LBPSkZgfGHL5zXvgrq5YUA",
            ExportUpgrades: "ExportUpgrades_ko.json!00_s5f7CyoTUjmYbg3eU+t+NA",
            ExportWarframes: "ExportWarframes_ko.json!00_Uvj+65yC+qq12VE1hY-T3A",
            ExportWeapons: "ExportWeapons_ko.json!00_1YLACiM8CgbWco0Qnzsmkw"
        },
        en: {
            ExportCustoms: "ExportCustoms_en.json!00_B-rhTW-ZsCnuGDcIFgAsXQ",
            ExportDrones: "ExportDrones_en.json!00_srFDy7+TuctM9+z6159P3Q",
            ExportFlavour: "ExportFlavour_en.json!00_R+PZ49sDIEyV7k35GuqW8g",
            ExportFusionBundles: "ExportFusionBundles_en.json!00_CxaHllVSdyInQMyCwcK5tQ",
            ExportGear: "ExportGear_en.json!00_jOuW95ZF7vW-3pmnwo3eHA",
            ExportKeys: "ExportKeys_en.json!00_aQLu6YNYRpAptifdT0iDvA",
            ExportRecipes: "ExportRecipes_en.json!00_apn7CNNDKSJC2a+y2WDOYw",
            ExportRegions: "ExportRegions_en.json!00_4g8wPbepV0CTb7rD79CF1g",
            ExportRelicArcane: "ExportRelicArcane_en.json!00_I5IF27FKF+lhPm8JBb7Brg",
            ExportResources: "ExportResources_en.json!00_QxBXXunh6g7SRqXQKepRwA",
            ExportSentinels: "ExportSentinels_en.json!00_TOFDSWGOPBHo0ZJNA+DbiA",
            ExportSortieRewards: "ExportSortieRewards_en.json!00_ptfU0r7i1J9TDJVS5BpefQ",
            ExportUpgrades: "ExportUpgrades_en.json!00_nlRiDepc6bpjqcijzHEpOA",
            ExportWarframes: "ExportWarframes_en.json!00_1AvcLaxPdRrMIqFq92PfWA",
            ExportWeapons: "ExportWeapons_en.json!00_73XSSoHfi+mmnYVHuWQdlw"
        }
    }
};


var getData = function (url) {
    return new Promise((resolve, rej) => {
        var streamData = '';
        http.get(url, (res) => {
            res.setEncoding('utf8')
            res.on('data', data => {
                streamData += data;
            });
            res.on('end', () => {
                var nowData = JSON.parse(streamData.replace(/(\\r|\r|\\n|\n){1,}/g, "\\n"));
                resolve(nowData);
            });
            res.on('error', err => {
                rej(err);
            });
        });
    });
};



fs.mkdir(path.resolve() + '/export', {
    recursive: true
}, err => {
    if (err) throw err;
});

var lastData = {};
var promiseArr = [];

function appDataParser() {
    var progress = 0;
    try {

        Object.keys(target.table).forEach((lang) => {
            Object.keys(target.table[lang]).forEach((tableName) => {
                var url = 'http://origin.warframe.com/origin/5E69C1D0/PublicExport/Manifest/' + target.table[lang][tableName];

                function pr() {
                    return new Promise(res => {

                        getData(url)
                            .then(json => {
                                json[tableName].forEach((data) => {
                                    if (!lastData[data.uniqueName]) {
                                        lastData[data.uniqueName] = {};
                                    }

                                    if (lang === "ko") {
                                        lastData[data.uniqueName].koName = data.name;
                                    }
                                    if (lang === "en" && data.name !== undefined) {
                                        lastData[data.uniqueName].enName = data.name.toUpperCase();
                                    }
                                });
                                progress++;
                                console.log('[' + progress + '/' +
                                    Object.keys(target.table).length * Object.keys(target.table[lang]).length + '] --- ' +
                                    lang + "_" + tableName + " ----   " + url);
                                res();
                            })
                            .catch(err => {
                                console.log(err);
                            });
                    });
                }
                promiseArr.push(pr());

            });
        });
    } catch (err) {
        throw err;
    }
}



appDataParser();
Promise.all(promiseArr).then((e) => {
    console.log('All data Parse and Output Done.');
    fs.writeFile('export/totalData.json', JSON.stringify(lastData), 'utf8', () => { });
});