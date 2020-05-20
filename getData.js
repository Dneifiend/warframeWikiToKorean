const http = require('http');
const path = require('path');
const fs = require('fs');

var target = {
    hash: "5E69C1D0",
    lang: "ko",
    table: {
        ko: {
            ExportCustoms: "ExportCustoms_ko.json!00_ew+fTPv+SMMx65agwXfHkw",
            ExportDrones: "ExportDrones_ko.json!00_fM7HUC6a3-8FEGmQhkZWYA",
            ExportFlavour: "ExportFlavour_ko.json!00_jeF591vfw2fAMLcJNCEvUg",
            ExportFusionBundles: "ExportFusionBundles_ko.json!00_V4-+r7psZN2DtumbEL4jNw",
            ExportGear: "ExportGear_ko.json!00_8T-GlgDjzY7AEtG-2W+fAQ",
            ExportKeys: "ExportKeys_ko.json!00_nSqEA85xPyoymehal28ICg",
            ExportRecipes: "ExportRecipes_ko.json!00_zfKPBzLpSmFdg9tDjYuH0A",
            ExportRegions: "ExportRegions_ko.json!00_ujE5QMtNFqw-AQGTCbPqLA",
            ExportRelicArcane: "ExportRelicArcane_ko.json!00_3KYdfMPlAmjwKm5eXUrCjg",
            ExportResources: "ExportResources_ko.json!00_UgnzzJoMRiC5q6PO3Uf9jw",
            ExportSentinels: "ExportSentinels_ko.json!00_5emYffsmB1MNPnhuyW48-g",
            ExportSortieRewards: "ExportSortieRewards_ko.json!00_OGOcz9FCkju7rxLHW4WxrQ",
            ExportUpgrades: "ExportUpgrades_ko.json!00_0BQOs5kqXZKlYcDTAeQsjA",
            ExportWarframes: "ExportWarframes_ko.json!00_etMk+0emPwDWZj3z+u8P2w",
            ExportWeapons: "ExportWeapons_ko.json!00_S2FFAD5sDTxp3NvhGpkZZw"
        },
        en: {
            ExportCustoms: "ExportCustoms_en.json!00_xuvhUablLheFHmNEj2PHfw",
            ExportDrones: "ExportDrones_en.json!00_srFDy7+TuctM9+z6159P3Q",
            ExportFlavour: "ExportFlavour_en.json!00_lOtCvdOTXwMdaZX8LH5jHw",
            ExportFusionBundles: "ExportFusionBundles_en.json!00_Ox371jQ8rH-0lapPEqwQzA",
            ExportGear: "ExportGear_en.json!00_qL7OKKQIgsueu9vfvKIDfA",
            ExportKeys: "ExportKeys_en.json!00_4MKPovXL9BOoPivvn9CiIw",
            ExportRecipes: "ExportRecipes_en.json!00_zfKPBzLpSmFdg9tDjYuH0A",
            ExportRegions: "ExportRegions_en.json!00_REEhFtB1tHQ5UlaYDDORdA",
            ExportRelicArcane: "ExportRelicArcane_en.json!00_6q7n+gVc6cR9t2JBMw89UA",
            ExportResources: "ExportResources_en.json!00_VJ78JG4MQiVU16lR+78akQ",
            ExportSentinels: "ExportSentinels_en.json!00_TOFDSWGOPBHo0ZJNA+DbiA",
            ExportSortieRewards: "ExportSortieRewards_en.json!00_CpqL1h0mfupNZEgqZxGkGg",
            ExportUpgrades: "ExportUpgrades_en.json!00_o14VX+YZ+pUUWd77oN+dLg",
            ExportWarframes: "ExportWarframes_en.json!00_AgYkq4lMBFbstSZjCL01eg",
            ExportWeapons: "ExportWeapons_en.json!00_MTr04dY69fUxZBXX3FRm2Q"
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