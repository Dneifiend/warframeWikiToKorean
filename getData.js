const http = require('http');
const path = require('path');
const fs = require('fs');

var target = {
    hash: "5EE81E40",
    lang: "ko",
    table: {
        ko: {
            ExportCustoms: "ExportCustoms_ko.json!00_Ziy3IgJyA2ZiipmI9Cqk7Q",
            ExportDrones: "ExportDrones_ko.json!00_fM7HUC6a3-8FEGmQhkZWYA",
            ExportFlavour: "ExportFlavour_ko.json!00_tAbzm0Vl+Ta82QCB+IfUdQ",
            ExportFusionBundles: "ExportFusionBundles_ko.json!00_HzoZYxZz33XYe-1K5QwI3g",
            ExportGear: "ExportGear_ko.json!00_Z6eqam-SIDGsjtm+bIRMrw",
            ExportKeys: "ExportKeys_ko.json!00_YmZJWW0GNxLH4PFiI+t3uw",
            ExportRecipes: "ExportRecipes_ko.json!00_f4jGqh87qdLyAKPh83FlmQ",
            ExportRegions: "ExportRegions_ko.json!00_UCy2aaQd8z-Qgp8qftllsQ",
            ExportRelicArcane: "ExportRelicArcane_ko.json!00_9Eh1ML6+Myf+hc0KDwtfdA",
            ExportResources: "ExportResources_ko.json!00_hjkbjyFEcZEcPB0zjLKk1Q",
            ExportSentinels: "ExportSentinels_ko.json!00_5emYffsmB1MNPnhuyW48-g",
            ExportSortieRewards: "ExportSortieRewards_ko.json!00_33VniLAYgRHpQHwJ+kG5xQ",
            ExportUpgrades: "ExportUpgrades_ko.json!00_RYC1vJppQbqbRcmSj3j3jw",
            ExportWarframes: "ExportWarframes_ko.json!00_7xdM4qLEfoKYUphDev6jqg",
            ExportWeapons: "ExportWeapons_ko.json!00_yIFkWUEQtbrxTYpBW6z9lA"
        },
        en: {
            ExportCustoms: "ExportCustoms_en.json!00_TF4Ryr1tj41o83CI9QkOEg",
            ExportDrones: "ExportDrones_en.json!00_srFDy7+TuctM9+z6159P3Q",
            ExportFlavour: "ExportFlavour_en.json!00_EwqpagNasoeR1sj+GHUYtA",
            ExportFusionBundles: "ExportFusionBundles_en.json!00_CxaHllVSdyInQMyCwcK5tQ",
            ExportGear: "ExportGear_en.json!00_jOuW95ZF7vW-3pmnwo3eHA",
            ExportKeys: "ExportKeys_en.json!00_aQLu6YNYRpAptifdT0iDvA",
            ExportRecipes: "ExportRecipes_en.json!00_f4jGqh87qdLyAKPh83FlmQ",
            ExportRegions: "ExportRegions_en.json!00_4g8wPbepV0CTb7rD79CF1g",
            ExportRelicArcane: "ExportRelicArcane_en.json!00_9qY0KVnsq1HZjiF9xC3jbw",
            ExportResources: "ExportResources_en.json!00_0N7-AKLPeJWCUs6XUyap2Q",
            ExportSentinels: "ExportSentinels_en.json!00_TOFDSWGOPBHo0ZJNA+DbiA",
            ExportSortieRewards: "ExportSortieRewards_en.json!00_ptfU0r7i1J9TDJVS5BpefQ",
            ExportUpgrades: "ExportUpgrades_en.json!00_ecwM4VufUpRUjez-4xz75g",
            ExportWarframes: "ExportWarframes_en.json!00_DEf8kcxDFZ2lHGsXN13dsg",
            ExportWeapons: "ExportWeapons_en.json!00_iUHSGHmG3S-Z6dSRurnb8A"
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