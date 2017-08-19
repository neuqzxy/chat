/**
 * Created by zhouxinyu on 2017/8/19.
 */
const mongoose = require('mongoose');
const db = mongoose.createConnection('mongodb://127.0.0.1:27017/chat');

db.on('error', (err) => {
    console.log(err);
});

db.on('connected', () => {
    console.log('mongoose connected');
});

module.exports = db;