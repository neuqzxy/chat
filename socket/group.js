/**
 * Created by zhouxinyu on 2017/8/24.
 */
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(3000, () => {
    console.log('server running at 127.0.0.1:3000');
});

app.use(express.static('./public'));

/*     socket.io 逻辑     */
let group1 = io.of('/group1');
let group2 = io.of('/group2');

group1.on('connection', (socket) => {
    socket.on('sendMsg', (data) => {
        data.id = socket.id;
        group1.emit('receiveMsg', data);
    })
});

group2.on('connection', (socket) => {
    socket.on('sendMsg', (data) => {
        data.id = socket.id;
        group2.emit('receiveMsg', data);
    })
});

