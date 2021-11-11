const { deepStrictEqual } = require('assert');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const dy = require('./src/dyParser');

async function feed1() {
    const feed =[];
    return new Promise((resolve,reject)=>{
        fs.createReadStream(path.resolve(__dirname,'assets',dy.feed1FileName+'.csv'))
        .pipe(csv.parse({ headers: true }))
        .on('data', row => {feed.push(row);})
        .on('error', (error) => reject(error))
        .on('end', () => resolve(feed));
    });
}

async function feed2() {
    const feed =[];
    return new Promise((resolve,reject)=>{
        fs.createReadStream(path.resolve(__dirname,'assets',dy.feed2FileName+'.csv'))
        .pipe(csv.parse({ headers: true }))
        .on('data', row => {feed.push(row);})
        .on('error', (error) => reject(error))
        .on('end', () => resolve(feed));
    });
}

Promise.allSettled([feed1(),feed2()]).then(res=>{
console.log((dy.parser)(res[0].value,res[1].value))
})
