const http = require('http');
const path = require('path');
const fs = require('fs');

var target = {
    hash: "5F471274",
    lang: "ko",
    table: {
        ko: {
            ExportCustoms: "ExportCustoms_ko.json!00_mvvC8CJx5MyTHm1veKVwog",
            ExportDrones: "ExportDrones_ko.json!00_lod6Op8+PlDxW-NtrdPWqA",
            ExportFlavour: "ExportFlavour_ko.json!00_hrWFac1msXgPUXncbd1ylQ",
            ExportFusionBundles: "ExportFusionBundles_ko.json!00_iIi5Jr7nvTJiQoi-TzcdQw",
            ExportGear: "ExportGear_ko.json!00_FcKSnQ053WjrR4tadmHFIw",
            ExportKeys: "ExportKeys_ko.json!00_rbklrDf92rbQRPYr-ikgsw",
            ExportRecipes: "ExportRecipes_ko.json!00_8ys2mt1cRPTRtkqDfZUINQ",
            ExportRegions: "ExportRegions_ko.json!00_dhP3gNKS7gYu34E-yeI6LA",
            ExportRelicArcane: "ExportRelicArcane_ko.json!00_MFuvsXAwZq4BXu32F1KwZw",
            ExportResources: "ExportResources_ko.json!00_l9fEz83052ZUFdKBn3SF+g",
            ExportSentinels: "ExportSentinels_ko.json!00_lHL60vueEMXf16GllpN6gA",
            ExportSortieRewards: "ExportSortieRewards_ko.json!00_ek-jiEc9Y7UzSMfn8Le7xA",
            ExportUpgrades: "ExportUpgrades_ko.json!00_lcz9oHA8+mLBhwGP3Pj9bw",
            ExportWarframes: "ExportWarframes_ko.json!00_A4US8Y8W6ygzlbxqBCwDgg",
            ExportWeapons: "ExportWeapons_ko.json!00_UlDhqGJLWQro3fLmjFrx0A"
        },
        en: {
            ExportCustoms: "ExportCustoms_en.json!00_qT1-bMg9GUG6GHHdTOAmkw",
            ExportDrones: "ExportDrones_en.json!00_g0Sft3UN7r-XufewwdLJGA",
            ExportFlavour: "ExportFlavour_en.json!00_IBGFa+-YMAeScbKPxirjTw",
            ExportFusionBundles: "ExportFusionBundles_en.json!00_BVjM2wq12FQQ1a6LNy5Ttw",
            ExportGear: "ExportGear_en.json!00_0CeCkcDGL6d-JwKbcwaO7A",
            ExportKeys: "ExportKeys_en.json!00_l-TVxYt7zmO4-y8Gimncog",
            ExportRecipes: "ExportRecipes_en.json!00_8ys2mt1cRPTRtkqDfZUINQ",
            ExportRegions: "ExportRegions_en.json!00_hEp9rPFtWjJQardK81J90w",
            ExportRelicArcane: "ExportRelicArcane_en.json!00_1x2zbbAGQoBu2SKR5YmV9w",
            ExportResources: "ExportResources_en.json!00_2UZl-K9Gf+cZu5wDj4hXJA",
            ExportSentinels: "ExportSentinels_en.json!00_oBXv7lX3Gw7eBj9sf8novA",
            ExportSortieRewards: "ExportSortieRewards_en.json!00_wQNtjzSIDEkexVj1G5MCrg",
            ExportUpgrades: "ExportUpgrades_en.json!00_0jCWxVTGqJS2owYE5SjxGA",
            ExportWarframes: "ExportWarframes_en.json!00_Szvhmy1cNuSLraeNtRDxTw",
            ExportWeapons: "ExportWeapons_en.json!00_kdmL-uitDXvU+1NpxI2TLQ"
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
                var url = 'http://origin.warframe.com/origin/612EE6D4/PublicExport/Manifest/' + target.table[lang][tableName];

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