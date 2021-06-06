
const fs = require('fs');
const lockFile = require('lockfile');

const paraliesFile = './model/paralies.json'

const lock = './model/lock-file'

exports.getParalies = function (callback) {
    lockFile.lock(lock, (err, isLocked) => {
        //We open the file ./model/paralies.json, read the content and save it in variable
        //'data'
        if (err) {
            callback(err)
        }
        else {
            fs.readFile(paraliesFile, (err, data) => {
                lockFile.unlock(lock)
                if (err) {
                    callback(err)
                }
                const parsething = {object:JSON.parse(data)}
                callback(null, parsething)
            })
        }
    })
}

