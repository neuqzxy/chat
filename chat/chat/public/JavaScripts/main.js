/**
 * Created by zhouxinyu on 2017/8/6.
 */
$(function(){
    const url = 'http://127.0.0.1:3000';
    let _username = null;
    let _$inputname = $("#name");
    let _$loginButton = $("#loginbutton");
    let _$chatinput = $("#chatinput");

    let socket = io.connect(url);

    //设置用户名，当用户登录的时候触发
    let setUsername = function () {
        _username = _$inputname.val().trim();    //得到输入框中用户输入的用户名

        //判断用户名是否存在
        if(_username) {
            socket.emit('login',{username: _username});   //如果用户名存在，就代表可以登录了，我们就触发登录事件，就相当于告诉服务器我们要登录了
        }
    };

    let beginChat = function () {
        /**
         * 1.隐藏登录框，取消它绑定的事件
         * 2.显示聊天界面
         */
        $("#loginbox").hide('slow');
        _$inputname.off('keyup');
        _$loginButton.off('click');

        /**
         * 显示聊天界面，并显示一行文字，欢迎用户
         * 这里我使用了ES6的语法``中可以使用${}在里面写的变量可以直接被浏览器渲染
         */
        $(`<p>欢迎你${_username}</p>`).insertBefore($("#content"));
        $("#chatbox").show('slow');
    };

    let sendMessage = function () {
        /**
         * 得到输入框的聊天信息，如果不为空，就触发sendMessage
         * 将信息和用户名发送过去
         */
        let _message = _$chatinput.val();

        if(_message) {
            socket.emit('sendMessage',{username: _username, message: _message});
        }
    };

    let setInputPosition = function () {
        let height = $(window).height()>$('#content p:last').offset().top+$('#content p:last').height()*2?$(window).height():$('#content p:last').offset().top+$('#content p:last').height()*2;
        _$chatinput.css({'top': height});
    };

    let showMessage = function (data) {
        //先判断这个消息是不是自己发出的，然后再以不同的样式显示
        if(data.username === _username){
            $("#content").append(`<p style='background: lightskyblue'><span>${data.username} : </span> ${data.message}</p>`);
        }else {
            $("#content").append(`<p style='background: lightpink'><span>${data.username} : </span> ${data.message}</p>`);
        }
        setInputPosition();
    };


    /*       前端事件         */
    /*登录事件*/
    _$loginButton.on('click',function (event) {    //监听按钮的点击事件，如果点击，就说明用户要登录，就执行setUsername函数
        setUsername();
    });

    _$inputname.on('keyup',function (event) {     //监听输入框的回车事件，这样用户回车也能登录。
        if(event.keyCode === 13) {                //如果用户输入的是回车键，就执行setUsername函数
            setUsername();
        }
    });


    /*聊天事件*/
    _$chatinput.on('keyup',function (event) {
        if(event.keyCode === 13) {
            sendMessage();
            _$chatinput.val('');
        }
    });


    /*        socket.io部分逻辑        */
    socket.on('loginSuccess',(data)=>{
        /**
         * 如果服务器返回的用户名和刚刚发送的相同的话，就登录
         * 否则说明有地方出问题了，拒绝登录
         */
        if(data.username === _username) {
            beginChat(data);
        }else {
            alert("用户名不匹配，请重试");
        }
    });

    socket.on('receiveMessage',(data)=>{
        /**
         * 监听到事件发生，就显示信息
         */
        showMessage(data);
    })

});