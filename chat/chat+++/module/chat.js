/**
 * Created by zhouxinyu on 2017/8/19.
 */
const mongoose = require('mongoose');
const db = require('./db');

const ChatSchema = mongoose.Schema({
    tmpID: String,
    message: [{
        msg: String,
        time: {
            type: Date,
            default: Date.now
        },
        to: {
            type: String,
            default: 'all'
        }
    }],
    socketID: String,
    ImgURL: [{
        data: String,
        time: {
            type: Date,
            default: Date.now
        },
        to: {
            type: String,
            default: 'all'
        }
    }],
    IP: String,
    connectTime: Date,
});

ChatSchema.statics.findByTmpID = function (tmpID, callback) {
    return this.model('Chat').find({tmpId: tmpID},callback);
};

ChatSchema.statics.updateByTmpID = function (tmpID, now, options, callback) {
    this.model('Chat').update(tmpID, now, options, callback);
};

const ChatModel = db.model('Chat', ChatSchema);

module.exports = ChatModel;