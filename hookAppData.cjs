var fs = require("fs")

var hash = "638D9498"
var koUrl = `http://origin.warframe.com/origin/${hash}/PublicExport/index_ko.txt.lzma`
var enUrl = `http://origin.warframe.com/origin/${hash}/PublicExport/index_en.txt.lzma`




fs.readdir("./app_appdata",(err,files)=>{
    files.forEach(file=>{
        if(file.slice(0,6)==="Export"){
            var path = "./app_appdata/"+file
            console.log(path)
            fs.unlink(path, ()=>{})
        }
    })
})


var enTxts = fs.readFileSync('./app_appdata/index_en.txt').toString().trim().split("\r\n")
var koTxts = fs.readFileSync('./app_appdata/index_ko.txt').toString().trim().split("\r\n")


var koObj = extractObject(koTxts)
var enObj = extractObject(enTxts)

function extractObject(arr){
    return arr.reduce((obj,txt)=>{
        var key = txt.match(/(?<=^Export).+?(?=_(ko|en)\.json)/)?.[0]
        if (key){
            obj[key] = txt
        }
    
        return obj
    
    },{})
}



var resObj = {}
resObj.hash = hash
resObj.lang = "ko"
resObj.table = {}
resObj.table.ko = koObj
resObj.table.en = enObj

fs.writeFileSync('./app_appdata/tableData.json', JSON.stringify(resObj),'utf-8')