const http = require('http');
const path = require('path');
const fs = require('fs');

var target = {
    hash: "5EE81E40",
    lang: "ko",
    table: {
        ko: {
            ExportCustoms: "ExportCustoms_ko.json!00_E7UGrPJZ6MHJCuDyTDAMGA",
            ExportDrones: "ExportDrones_ko.json!00_fM7HUC6a3-8FEGmQhkZWYA",
            ExportFlavour: "ExportFlavour_ko.json!00_jM89WpNST3KdHJgcZagzmg",
            ExportFusionBundles: "ExportFusionBundles_ko.json!00_HzoZYxZz33XYe-1K5QwI3g",
            ExportGear: "ExportGear_ko.json!00_9iexPor1wujGICiTNXo9Bg",
            ExportKeys: "ExportKeys_ko.json!00_YmZJWW0GNxLH4PFiI+t3uw",
            ExportRecipes: "ExportRecipes_ko.json!00_Ewx+CuA8wmSHK0lA24chcQ",
            ExportRegions: "ExportRegions_ko.json!00_tVmiL0q6jzasgurZzpn9zg",
            ExportRelicArcane: "ExportRelicArcane_ko.json!00_vSZ9TXXOEbmRF0QDOzd1Jw",
            ExportResources: "ExportResources_ko.json!00_8EY1NMDlcTQwlMFNGmCLeg",
            ExportSentinels: "ExportSentinels_ko.json!00_5emYffsmB1MNPnhuyW48-g",
            ExportSortieRewards: "ExportSortieRewards_ko.json!00_oQ8qaZQsJ8uLi1DoP9eaYg",
            ExportUpgrades: "ExportUpgrades_ko.json!00_UQ3x-iHNZ790LLEVTWy-jA",
            ExportWarframes: "ExportWarframes_ko.json!00_PXuEP3roRgklmxMVlYoBjA",
            ExportWeapons: "ExportWeapons_ko.json!00_te0q3o52Sswj0X6tKb0Neg"
        },
        en: {
            ExportCustoms: "ExportCustoms_en.json!00_bBeQQOWW1wOqycwEdzo2uw",
            ExportDrones: "ExportDrones_en.json!00_srFDy7+TuctM9+z6159P3Q",
            ExportFlavour: "ExportFlavour_en.json!00_Jw9sNPoHReUxFmpMCOWjmg",
            ExportFusionBundles: "ExportFusionBundles_en.json!00_CxaHllVSdyInQMyCwcK5tQ",
            ExportGear: "ExportGear_en.json!00_C460GlzlG+hsQM5+8d5ODA",
            ExportKeys: "ExportKeys_en.json!00_aQLu6YNYRpAptifdT0iDvA",
            ExportRecipes: "ExportRecipes_en.json!00_Ewx+CuA8wmSHK0lA24chcQ",
            ExportRegions: "ExportRegions_en.json!00_moqH-B78JH8vRs09rnHnpg",
            ExportRelicArcane: "ExportRelicArcane_en.json!00_6ZFA7h2KjAdwFxQ54M1NjQ",
            ExportResources: "ExportResources_en.json!00_OjSonaKtI5ZZV3dUwIJMTg",
            ExportSentinels: "ExportSentinels_en.json!00_TOFDSWGOPBHo0ZJNA+DbiA",
            ExportSortieRewards: "ExportSortieRewards_en.json!00_ESegi3luunAq8JeKTd4fjw",
            ExportUpgrades: "ExportUpgrades_en.json!00_nlRiDepc6bpjqcijzHEpOA",
            ExportWarframes: "ExportWarframes_en.json!00_GdWB2EviQTfeS0QhY38PbQ",
            ExportWeapons: "ExportWeapons_en.json!00_TSaDH5Xh483EfdsJzhVvDw"
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