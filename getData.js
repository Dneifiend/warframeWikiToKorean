import fetch from "node-fetch"
import path from "path"
import fs from "fs"

var target = {
    hash: "614D34A4",
    lang: "ko",
    table: {
        ko: {
            ExportCustoms: "ExportCustoms_ko.json!00_3wCI0EK+2AxXaZtEnMuD+g",
            ExportDrones: "ExportDrones_ko.json!00_lod6Op8+PlDxW-NtrdPWqA",
            ExportFlavour: "ExportFlavour_ko.json!00_4s5ROdbUyivrs-9cxdlh+A",
            ExportFusionBundles: "ExportFusionBundles_ko.json!00_iIi5Jr7nvTJiQoi-TzcdQw",
            ExportGear: "ExportGear_ko.json!00_FcKSnQ053WjrR4tadmHFIw",
            ExportKeys: "ExportKeys_ko.json!00_rbklrDf92rbQRPYr-ikgsw",
            ExportRecipes: "ExportRecipes_ko.json!00_oeOzLsBJxsMX+gGZH2GZnw",
            ExportRegions: "ExportRegions_ko.json!00_dhP3gNKS7gYu34E-yeI6LA",
            ExportRelicArcane: "ExportRelicArcane_ko.json!00_jwS771XrOUci7MexFzE9eg",
            ExportResources: "ExportResources_ko.json!00_kz9eCef6kd6bRUEnnsw3FA",
            ExportSentinels: "ExportSentinels_ko.json!00_lHL60vueEMXf16GllpN6gA",
            ExportSortieRewards: "ExportSortieRewards_ko.json!00_76HEZeujCrQwn4pTc4QP7w",
            ExportUpgrades: "ExportUpgrades_ko.json!00_EyeLXoJnuT4NX4AxDIoo7A",
            ExportWarframes: "ExportWarframes_ko.json!00_Jd0dsRyIexRwbfBolOei8g",
            ExportWeapons: "ExportWeapons_ko.json!00_H5hLcdl+bX3-Q70KdqyN6A"
        },
        en: {
            ExportCustoms: "ExportCustoms_en.json!00_uxbrm+cu3HU-I5yyC7wXSw",
            ExportDrones: "ExportDrones_en.json!00_g0Sft3UN7r-XufewwdLJGA",
            ExportFlavour: "ExportFlavour_en.json!00_aRC+e1TNvq8fLheWYtv1sg",
            ExportFusionBundles: "ExportFusionBundles_en.json!00_BVjM2wq12FQQ1a6LNy5Ttw",
            ExportGear: "ExportGear_en.json!00_0CeCkcDGL6d-JwKbcwaO7A",
            ExportKeys: "ExportKeys_en.json!00_l-TVxYt7zmO4-y8Gimncog",
            ExportRecipes: "ExportRecipes_en.json!00_oeOzLsBJxsMX+gGZH2GZnw",
            ExportRegions: "ExportRegions_en.json!00_hEp9rPFtWjJQardK81J90w",
            ExportRelicArcane: "ExportRelicArcane_en.json!00_tB5o0CaJFzlCtdi7x5uCvQ",
            ExportResources: "ExportResources_en.json!00_r6sxOcPW+aatiqSz8p3DZg",
            ExportSentinels: "ExportSentinels_en.json!00_oBXv7lX3Gw7eBj9sf8novA",
            ExportSortieRewards: "ExportSortieRewards_en.json!00_2ytGnc+Ln86yMY4wToOa1g",
            ExportUpgrades: "ExportUpgrades_en.json!00_PajqZVOfUaoM7AbK43jy6g",
            ExportWarframes: "ExportWarframes_en.json!00_Jv3TnL+KUnJe+MNk6GWkLw",
            ExportWeapons: "ExportWeapons_en.json!00_tagcu2QCDQKzaUYnUzSs6g"
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