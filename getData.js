import fetch from "node-fetch"
import path from "path"
import fs from "fs"

var target = {
    hash: "6265FAC4",
    lang: "ko",
    table: {
        ko: {
            ExportCustoms:"ExportCustoms_ko.json!00_jI06wkriKVy--dBgVjVu9w",
            ExportDrones:"ExportDrones_ko.json!00_AkzppEtrX0+PDxEM5+QkyA",
            ExportFlavour:"ExportFlavour_ko.json!00_ZrSVp1aNA-rcag6QmZugGQ",
            ExportFusionBundles:"ExportFusionBundles_ko.json!00_yqMqeIUzN5nsGrhcyh69BA",
            ExportGear:"ExportGear_ko.json!00_TvOKlnBkxtPYvdHmRJFuIw",
            ExportKeys:"ExportKeys_ko.json!00_t9Cl-BEPh3-tMSl3B3Mn4Q",
            ExportRecipes:"ExportRecipes_ko.json!00_-qFkC0fOMqlEepYDHUsVUw",
            ExportRegions:"ExportRegions_ko.json!00_dhP3gNKS7gYu34E-yeI6LA",
            ExportRelicArcane:"ExportRelicArcane_ko.json!00_H0p3qO9ISpp0uD6HK0FYag",
            ExportResources:"ExportResources_ko.json!00_jt2Y6UsqIXcHnIZH0KuUVQ",
            ExportSentinels:"ExportSentinels_ko.json!00_lHL60vueEMXf16GllpN6gA",
            ExportSortieRewards:"ExportSortieRewards_ko.json!00_-CplS-JdT66-vMicF6SQ6Q",
            ExportUpgrades:"ExportUpgrades_ko.json!00_grkj72AKMBno42ma3LfCSA",
            ExportWarframes:"ExportWarframes_ko.json!00_7Ye8KYoKTKCysDMBrP4PGA",
            ExportWeapons:"ExportWeapons_ko.json!00_AxLdnmcUGiG0H3deMALq8g"
        },
        en: {
            ExportCustoms: "ExportCustoms_en.json!00_mM4rDgLVB4Pel6aq5Vrqjw",
            ExportDrones: "ExportDrones_en.json!00_g0Sft3UN7r-XufewwdLJGA",
            ExportFlavour: "ExportFlavour_en.json!00_zqLQmP3NVmttTx0YZklk7Q",
            ExportFusionBundles: "ExportFusionBundles_en.json!00_mievusFTvE1yg4jxseyL9w",
            ExportGear: "ExportGear_en.json!00_0CeCkcDGL6d-JwKbcwaO7A",
            ExportKeys: "ExportKeys_en.json!00_Ed9vGe1K77PVuUlHiJzV-w",
            ExportRecipes: "ExportRecipes_en.json!00_X3NeVr+Bev+omYZhoiFiJQ",
            ExportRegions: "ExportRegions_en.json!00_hEp9rPFtWjJQardK81J90w",
            ExportRelicArcane: "ExportRelicArcane_en.json!00_mHcdeauJl8Y1fKcCOpQP6w",
            ExportResources: "ExportResources_en.json!00_OrP7voZ5HU0Rn2wN9lAWxg",
            ExportSentinels: "ExportSentinels_en.json!00_oBXv7lX3Gw7eBj9sf8novA",
            ExportSortieRewards: "ExportSortieRewards_en.json!00_IUEjPn0BwSS0yUB-iJwYpg",
            ExportUpgrades: "ExportUpgrades_en.json!00_wDOi1G9LAVSEBgeANd8l2Q",
            ExportWarframes: "ExportWarframes_en.json!00_vgj1DjDIzxnTO8xCbQh9yw",
            ExportWeapons: "ExportWeapons_en.json!00_iHhwjDgW601CjCko3k7Jfg"
        }
    }
};


var getData = function (url) {
    return new Promise((resolve, rej) => {
        fetch(url)
            .then(res => res.text())
            .then(txt => {
                var nowData = JSON.parse(txt.replace(/(\\r|\r|\\n|\n){1,}/g, "\\n"));
                resolve(nowData)
            })
            .catch(err => {
                rej(err)
            })
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
                var url = 'http://origin.warframe.com/origin/' + target.hash + '/PublicExport/Manifest/' + target.table[lang][tableName];

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