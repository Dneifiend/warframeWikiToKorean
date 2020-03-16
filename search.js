//TODO � 해결할 것
const fs = require('fs');
const path = require('path');


var getData = new Promise((res, rej) => {
    fs.readFile(path.resolve() + '\\export\\totalData.json', (err, fd) => {
        if (err) {
            rej(err);
            throw err;
        }
        res(JSON.parse(fd.toString()));
    });

});



var customData = new Promise((res, rej) => {
    fs.readFile(path.resolve() + '\\custom.json', (err, fd) => {
        if (err) {
            rej(err);
            throw err;
        }
        res(JSON.parse(fd.toString()));
    });

});

Promise.all([getData, customData]).then(e => {
    var result = {}
    var changeSimple = Object.keys(e[0]).reduce((p, c) => {

        if (e[0][c].enName) {
            p[e[0][c].enName] = e[0][c].koName
        }
        return p;
    }, {});

    var customData = Object.keys(e[1]).reduce((p, c) => {
        p[c.toUpperCase()] = e[1][c]
        return p;
    }, {});

    Object.assign(result, changeSimple, customData)

    fs.writeFile('export/warframeKO.json', JSON.stringify(result), 'utf8', () => {
        console.log('----------');
        console.log('.');
        console.log('.');
        console.log('.');
        console.log(path.resolve() + '\\export\\warframeKO.json');
        console.log('done.');
    });
}).catch(err => {
    throw err
})