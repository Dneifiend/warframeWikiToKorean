const http = require('http');
const path = require('path');
const fs = require('fs');

var target = {
    hash: "5F471274",
    lang: "ko",
    table: {
        ko: {
            ExportCustoms: "ExportCustoms_ko.json!00_ZuyNCk8v6Kcwpw1adp686w",
            ExportDrones: "ExportDrones_ko.json!00_fM7HUC6a3-8FEGmQhkZWYA",
            ExportFlavour: "ExportFlavour_ko.json!00_jyAuGbdv+SPSdqcW78t1lQ",
            ExportFusionBundles: "ExportFusionBundles_ko.json!00_HzoZYxZz33XYe-1K5QwI3g",
            ExportGear: "ExportGear_ko.json!00_nPG9ANFOpkx1MbNXDerytQ",
            ExportKeys: "ExportKeys_ko.json!00_3QZ2pwMyjdMuqXa75nCljw",
            ExportRecipes: "ExportRecipes_ko.json!00_fMN7QB4TcmmcJu8r2uQ62A",
            ExportRegions: "ExportRegions_ko.json!00_DLFJNOIOPYYLawKFMmq0-w",
            ExportRelicArcane: "ExportRelicArcane_ko.json!00_X0eFmy7gP8ms+8ZG6f-QVw",
            ExportResources: "ExportResources_ko.json!00_CSDGeyfSNjclqcC2-kXKuw",
            ExportSentinels: "ExportSentinels_ko.json!00_ggBi623sfMQ+B-5HgXRHJA",
            ExportSortieRewards: "ExportSortieRewards_ko.json!00_Mj4yXNvhmP-+SlkKI+slSQ",
            ExportUpgrades: "ExportUpgrades_ko.json!00_cVMqg1mHL-P8BQgGiNfHjA",
            ExportWarframes: "ExportWarframes_ko.json!00_+tjuSPjxNpAYrh8RpP+Lgw",
            ExportWeapons: "ExportWeapons_ko.json!00_B3nkHFGlfuF0F-sOcJ+VsA"
        },
        en: {
            ExportCustoms: "ExportCustoms_en.json!00_MVhVtykMjeIO0DkISh7AEw",
            ExportDrones: "ExportDrones_en.json!00_srFDy7+TuctM9+z6159P3Q",
            ExportFlavour: "ExportFlavour_en.json!00_hkHsepUzrqUCikkCFg9PLw",
            ExportFusionBundles: "ExportFusionBundles_en.json!00_CxaHllVSdyInQMyCwcK5tQ",
            ExportGear: "ExportGear_en.json!00_f1uuZmDSkEJ3G5Y4tpPJQQ",
            ExportKeys: "ExportKeys_en.json!00_eN04hvh1WtCIZ8jQq0eMEQ",
            ExportRecipes: "ExportRecipes_en.json!00_fMN7QB4TcmmcJu8r2uQ62A",
            ExportRegions: "ExportRegions_en.json!00_-AK90Y+6t61nslAkC0jtNQ",
            ExportRelicArcane: "ExportRelicArcane_en.json!00_1ymcG0VLDU-ex8bBWr+rzw",
            ExportResources: "ExportResources_en.json!00_a+oy0G1ISeEMVY43yfBvNQ",
            ExportSentinels: "ExportSentinels_en.json!00_M2lnkRtELtIW+xx069K5Fw",
            ExportSortieRewards: "ExportSortieRewards_en.json!00_QlxPwHD79jaqoY-wqFntvQ",
            ExportUpgrades: "ExportUpgrades_en.json!00_cwkm6s1e5Dq1BMM4ecdvvQ",
            ExportWarframes: "ExportWarframes_en.json!00_FmMkE1yYmrswN7Ll8+pFEw",
            ExportWeapons: "ExportWeapons_en.json!00_2swGhpBuzT4yEdOwMXhpsg"
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