/**
 * Created by zhouxinyu on 2017/8/24.
 */
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const formidable = require('formidable');
const path = require('path');
const util = require('util');

server.listen(3000, () => {
    console.log('server running at 127.0.0.1:3000');
});

app.use(express.static('./public'));
app.use('/static', express.static(path.join(__dirname, './static')));

app.post('/sendimg', (req, res, next) => {
    let imgname = null;
    let form = new formidable.IncomingForm();
    form.uploadDir = './static/images';
    form.parse(req, (err, fields, files) => {
        res.send(imgname);
    });
    form.on('fileBegin', (name, file) => {
        file.path = path.join(__dirname, `./static/images/${file.name}`);
        imgname = file.name;
    });
});

/*     socket.io 逻辑     */

io.on('connection', (socket) => {
    socket.on('sendMessage', (data) => {
        data.id = socket.id;
        io.emit('receiveMessage', data);
    });

    socket.on('sendImg', (data) => {
        data.id = socket.id;
        io.emit('receiveImg', data);
    });

    socket.on('ajaxImgSendSuccess', (data) => {
        data.id = socket.id;
        data.imgUrl = `/static/images/${data.imgName}`;
        io.emit('receiveAjaxImgSend', data);
    })
});