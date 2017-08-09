/**
 * Created by zhouxinyu on 2017/8/6.
 */
$(function(){
    const url = 'http://127.0.0.1:3000';
    let _username = null;
    let _$inputname = $("#name");
    let _$loginButton = $("#loginbutton");
    let _$chatinput = $("#chatinput");
    let _$inputGroup = $("#inputgrop");
    let _$imgButton = $("#imgbutton");
    let _$imgInput = $("#imginput");

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
         * 显示聊天界面，并显示一行文字，表示是谁的聊天界面
         * 一个2s的弹框，显示欢迎字样
         * 这里我使用了ES6的语法``中可以使用${}在里面写的变量可以直接被浏览器渲染
         */
        $(`<h2 style="text-align: center">${_username}的聊天室</h2>`).insertBefore($("#content"));
        $(`<strong>欢迎你</strong><span>${_username}!</span>`).insertAfter($('#myalert button'));
        $("#myalert1").hide();
        $('#myalert').alert();
        setTimeout(function () {
            $('#myalert').alert('close');
        },2000);
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
        _$inputGroup.css({'top': height});
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

    let sendImg = function (event) {
        /**
         * 先判断浏览器是否支持FileReader
         */
        if (typeof FileReader === 'undefined') {
            alert('您的浏览器不支持，该更新了');
            //使用bootstrap的样式禁用Button
            _$imgButton.attr('disabled', 'disabled');
        } else {
            let file = event.target.files[0];  //先得到选中的文件
            //判断文件是否是图片
            if(!/image\/\w+/.test(file.type)){   //如果不是图片
                alert ("请选择图片");
                return false;
            }
            /**
             * 然后使用FileReader读取文件
             */
            let reader = new FileReader();
            reader.readAsDataURL(file);
            /**
             * 读取完自动触发onload函数,我们触发sendImg事件给服务器
             */
            reader.onload = function (e) {
                socket.emit('sendImg',{username: _username, dataUrl: this.result});
            }
        }
    };

    let showImg = function (data) {
        //先判断这个消息是不是自己发出的，然后再以不同的样式显示
        if(data.username === _username) {
            $('#content').append(`<p class="bg-primary" style=' text-align:center;'><strong style="font-size: 1.5em;">${_username}&nbsp;</strong>: &nbsp;<img class="img-thumbnail" src="${data.dataUrl}" style="max-height: 100px"/></p>`);
        } else {
            $('#content').append(`<p class="bg-info" style=''><strong style="font-size: 1.5em;">${_username}&nbsp;</strong>: &nbsp;<img class="img-thumbnail" src="${data.dataUrl}" style="max-height: 100px"/></p>`);
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

    //点击图片按钮触发input
    _$imgButton.on('click',function (event) {
        _$imgInput.click();
        return false;
    });

    _$imgInput.change(function (event) {
        sendImg(event);
        //重置一下form元素，否则如果发同一张图片不会触发change事件
        $("#resetform")[0].reset();
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
            $('#myalert1 span').html(`<span>您的好友<strong>${data.username}</strong>上线了!</span>`);
            setTimeout(function() {
                $("#myalert1").hide();
            }, 1000);
            $("#myalert1").show();
        }
    });

    socket.on('receiveMessage',(data)=>{
        /**
         * 监听到事件发生，就显示信息
         */
        showMessage(data);
    });

    socket.on('usernameErr',(data)=>{
        /**
         * 我们给外部div添加 .has-error
         * 拷贝label插入
         * 控制显示的时间为1.5s
         */
        $(".login .form-inline .form-group").addClass("has-error");
        $('<label class="control-label" for="inputError1">用户名重复</label>').insertAfter($('#name'));
        setTimeout(function() {
            $('.login .form-inline .form-group').removeClass('has-error');
            $("#name + label").remove();
        }, 1500)
    });

    socket.on('receiveImg',(data)=>{
        /**
         * 监听到receiveImg发生，就显示图片
         */
        showImg(data);
    });

});