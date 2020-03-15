const http = require('http');
const path = require('path');
const fs = require('fs');

var target = {
    hash: "5E69C1D0",
    lang: "ko",
    table: {
        ko: {
            ExportCustoms: "ExportCustoms_ko.json!00_ioeo9OuEjQux+S4nBLWKKQ",
            ExportDrones: "ExportDrones_ko.json!00_fM7HUC6a3-8FEGmQhkZWYA",
            ExportFlavour: "ExportFlavour_ko.json!00_19SSoM3nbPW+Mqg49M-rOQ",
            ExportFusionBundles: "ExportFusionBundles_ko.json!00_V4-+r7psZN2DtumbEL4jNw",
            ExportGear: "ExportGear_ko.json!00_lJoYspm6qrEOlZik7Vdzqw",
            ExportKeys: "ExportKeys_ko.json!00_nSqEA85xPyoymehal28ICg",
            ExportRecipes: "ExportRecipes_ko.json!00_OO0+2nF63wN3kD5SESHheQ",
            ExportRegions: "ExportRegions_ko.json!00_n2Oz3ykfCtTochfrG5bvvQ",
            ExportRelicArcane: "ExportRelicArcane_ko.json!00_I7sZGCppNd8K8EZvzLuavg",
            ExportResources: "ExportResources_ko.json!00_LpAvdnOcaA81yRXKyrQlWg",
            ExportSentinels: "ExportSentinels_ko.json!00_5emYffsmB1MNPnhuyW48-g",
            ExportSortieRewards: "ExportSortieRewards_ko.json!00_lyGQTqf3+VuZDzEiuD2Iuw",
            ExportUpgrades: "ExportUpgrades_ko.json!00_3YguQ15CeMLW95o+gVgjUg",
            ExportWarframes: "ExportWarframes_ko.json!00_fMUCmOsMuUbp2dfaiDgM8A",
            ExportWeapons: "ExportWeapons_ko.json!00_T3f3-Yjm3CrPpvo0jiMMHQ"
        },
        en: {
            ExportCustoms: "ExportCustoms_en.json!00_6MmyhLHjoGKcMkl9u5+-cw",
            ExportDrones: "ExportDrones_en.json!00_srFDy7+TuctM9+z6159P3Q",
            ExportFlavour: "ExportFlavour_en.json!00_bCE5RLP6s3EYSh2RH35NcA",
            ExportFusionBundles: "ExportFusionBundles_en.json!00_Ox371jQ8rH-0lapPEqwQzA",
            ExportGear: "ExportGear_en.json!00_u4f-PM+SAUKqzzQyOBVFkg",
            ExportKeys: "ExportKeys_en.json!00_4MKPovXL9BOoPivvn9CiIw",
            ExportRecipes: "ExportRecipes_en.json!00_OO0+2nF63wN3kD5SESHheQ",
            ExportRegions: "ExportRegions_en.json!00_sMRrna3dpBK53giQupSXMw",
            ExportRelicArcane: "ExportRelicArcane_en.json!00_TL-eBa35HbOWovY3T6kF4w",
            ExportResources: "ExportResources_en.json!00_-65xkjvs2UMg-bxKV1hdRQ",
            ExportSentinels: "ExportSentinels_en.json!00_TOFDSWGOPBHo0ZJNA+DbiA",
            ExportSortieRewards: "ExportSortieRewards_en.json!00_rwM1N37-HqSfetrBOmFdNQ",
            ExportUpgrades: "ExportUpgrades_en.json!00_dFO-Ty-toZPwRcb268j9GA",
            ExportWarframes: "ExportWarframes_en.json!00_M2aV0tVEko4McKlVvbNSCg",
            ExportWeapons: "ExportWeapons_en.json!00_SKOBlTPzZb6Tjrgq7xC4VQ"
        }
    }
};


var getData = function (url) {
    return new Promise((resolve, rej) => {
        var streamData = '';
        http.get(url, (res) => {
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

        Object.keys(target.table).forEach((lang, langIdx) => {
            Object.keys(target.table[lang]).forEach((tableName, tableIdx) => {
                var url = 'http://origin.warframe.com/origin/5E69C1D0/PublicExport/Manifest/' + target.table[lang][tableName];

                function pr() {
                    return new Promise(res => {

                        getData(url)
                            .then(json => {
                                json[tableName].forEach((data, idx) => {
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
    fs.writeFile('export/totalData.json', JSON.stringify(lastData), 'utf8', () => {});
});