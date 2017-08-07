const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const users = [];      //存储所有用户
let usersNum = 0;
const _sockets = [];

server.listen(3000,'127.0.0.1',()=>{
    console.log("server running at 127.0.0.1:3000");
});

app.set('views',path.join(__dirname,'./views'));
app.set('view engine','ejs');

app.get('/',(req,res)=>{
    res.redirect('/chat.html');
});

app.get('/chat.html',(req,res)=>{
    res.render('chat',(err,html)=>{
        if(err) {
            console.error("读取chat.ejs错误",err);
            res.render('error',(err,html)=>{
                if(err){
                    console.error("读取error.ejs文件错误",err);
                    res.send(`<h1 style="font-size: 2em; text-align: center;">4 0 4</h1>`)
                }else {
                    res.send(html,{message: 404, error: {status: err.status, stack: err.stack}});
                }
            })
        }else {
            res.send(html);
        }
    })
});

app.use(express.static(path.join(__dirname,'./public')));

//socket.io

io.on('connection',(socket)=>{
    usersNum ++;
    // 初始化这个临时用户名
    let tmpUsername = null;
    console.log(`${usersNum}位用户已连接`);
    socket.on('login',(data)=>{
        //保存该临时用户名
        socket.username = data.username;
        //判断用户名是否存在
        users.forEach(function(user){
            if(user.username === socket.username){
                socket.emit('usernameErr',{err: '用户名存在'});
                socket.username = null;
            }
        });
        //如果不存在就保存
        if(socket.username !== null) {
            let imgUrl = (Math.random()*8)|0;
            users.push({
                username: data.username,
                message: [],
                DataUrl: [],
                loginTime: Date.now(),
                imgUrl,
                id: socket.id
            });
            _sockets[data.username] = socket;
            console.log(users);
            // 将所有用户组传过去，用于生成用户列表
            data.userGroup = users;
            data.imgUrl = imgUrl;
            socket.emit('loginSuccess',data);
            socket.broadcast.emit('loginSuccess',data);
        }
    });
    //监听发送消息
    socket.on('sendMessage',(data)=>{
        console.log(data);
        users.forEach(function(user){
            if(user.username === socket.username) {
                user.message.push(data.message);
                data.imgUrl = user.imgUrl;
            }
        });
        socket.broadcast.emit('receiveMessage',data);
        socket.emit('receiveMessage',data);
    });
    //监听发送图片
    socket.on('sendImg',function(data) {
        console.log(data.DataUrl);
        users.forEach(function(user){
            if(user.username === data.username) {
                user.DataUrl.push(data.DataUrl);
                data.imgUrl = user.imgUrl;
            }
        });
        io.emit('receiveImg',data);
    });

    //监听私聊信息
    socket.on("sendToOne",function (data) {
        let _index = null;
        if(users.some(function (item,index) {
            if(item.username === data.username){
                _index = index;
            }
            return (item.username === data.username);
            })) {                             //如果存在该用户，就触发收到私聊事件
            _sockets[data.to].emit('SendToOneSuccess',data);
            socket.emit("receiveSendToOne",data);
        }
    });

    socket.on('disconnect',()=>{
        usersNum--;
        /*console.log(`${tmpUsername}下线了`);*/
        //删除这个用户
        //如果存在用户名，触发someOneLeave
        if(tmpUsername !== 'undefined') {
            socket.broadcast.emit('someOneLeave',{username: socket.username});
        }

        let tmpIndex = null;
        users.forEach(function(item,index,array) {
            if(item.username === socket.username){
                tmpIndex = index;
                console.log(`删除用户：${users[tmpIndex].username}`);
                users.splice(tmpIndex,1);
            }
        });

    })
});


