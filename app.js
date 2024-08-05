const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const dy = require('./src/dyParser');

async function feed1() {
    const feed = [];
    return new Promise((resolve, reject) => {
        let fileName = dy.feed1FileName.toLowerCase().replace('.csv','') + '.csv';

        fs.createReadStream(path.resolve(__dirname,'assets',fileName))
        .pipe(csv.parse({ headers: true }))
        .on('data', row => {feed.push(row);})
        .on('error', (error) => reject(error))
        .on('end', () => resolve(feed));
    });
}

async function feed2() {
    const feed = [];
    return new Promise((resolve, reject) => {
        let fileName = dy.feed2FileName.toLowerCase().replace('.csv','') + '.csv';

        fs.createReadStream(path.resolve(__dirname,'assets',fileName))
        .pipe(csv.parse({ headers: true }))
        .on('data', row => {feed.push(row);})
        .on('error', (error) => reject(error))
        .on('end', () => resolve(feed));
    });
}

Promise.allSettled([feed1(), feed2()]).then(([feed1, feed2]) => {
    try {
        let outputJson = dy.parser(feed1.value, feed2.value);
        console.log('item count:', outputJson.length);
        fs.writeFileSync(
            path.resolve(
                __dirname,
                'logs',
                'log.json'
            ),
            JSON.stringify(
                outputJson,
                null,
                2
            ),
            'utf8'
        );
    } catch (err) {
        console.log('ERROR:',err);
    }
})
