const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const users = [];
let usersNum = 0;

server.listen(3000,()=>{
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
    // 保存这个用户名
    let tmpUsername = null;
    console.log(`${usersNum}位用户已连接`);
    socket.on('login',(data)=>{
        tmpUsername = data.username;
        users.push({
            username: data.username,
            message: [],
            loginTime: Date.now()
        });
        console.log(users);
        socket.emit('loginSuccess',{username: data.username});
    });
    socket.on('sendMessage',(data)=>{
        console.log(data);
        users.forEach(function(user){
            if(user.name === tmpUsername) {
                user.message.push(data.message);
            }
        });
        socket.broadcast.emit('receiveMessage',data);
        socket.emit('receiveMessage',data);
    });
    socket.on('disconnect',()=>{
        usersNum--;
        console.log(`${tmpUsername}下线了`);
    })
});


