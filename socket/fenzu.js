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

io.on('connection', (socket) => {
    socket.on('addgroup1', () => {
        socket.join('group1', () => {
            let data = {id: '系统', msg: '新用户加入'};
            socket.to('group1').emit('receiveMsg', data);
            console.log(Object.keys(socket.rooms));
        })
    });
    socket.on('addgroup2', () => {
        socket.join('group2', () => {
            let data = {id: '系统', msg: '新用户加入'};
            socket.to('group2').emit('receiveMsg', data);
            console.log(Object.keys(socket.rooms));
        })
    });
    socket.on('sendMsg', (data) => {
        data.id = socket.id;
        io.emit('receiveMsg', data);
    });
    socket.on('sendToOurGroup', (data) => {
        data.id = socket.id;
        let groups = Object.keys(socket.rooms);
        for(let i = 1; i <= groups.length; i++) {
            socket.to(groups[i]).emit('receiveMsg', data);
        }
        socket.emit('receiveMsg', data);
    })
});