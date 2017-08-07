/**
 * Created by zhouxinyu on 2017/8/4.
 */
$(function () {
    /**
     * 初始化变量
     */
    let _username = null;
    let _usermessage = null;
    let _$inputname = $('#name');
    let _$loginButton = $("#loginbutton");
    let _$chatinput = $("#chatinput");
    let _$inputGrop = $("#inputgrop");
    let _$imgButton = $("#imgbutton");
    let _$imgInput = $("#imginput");
    let _$chatBox = $("#chatbox");
    let _tmpData = null;
    let url = 'http://127.0.0.1:3000';

    let socket = io.connect(url);

    let setUsername = function() {
        _username = _$inputname.val().trim();

        if(_username) {
            socket.emit('login',{username: _username});
            console.log(_username);
        }
    };

    let sendMessage = function() {
        let _message = _$chatinput.val().trim();

        if(_message) {
            socket.emit('sendMessage',{message: _message, username: _username});
            console.log(_message);
        }
    };

    let showMessage = function(message,username) {
        if(username === _username) {
            $('#content').append(`<p class="bg-primary" style=' text-align:center;'><strong style="font-size: 1.5em;">${username}&nbsp;</strong>: &nbsp;<span>&nbsp;${message}</p>`);
        } else {
            $('#content').append(`<p class="bg-info" style=''><strong style="font-size: 1.5em;">${username}&nbsp;</strong>: &nbsp;<span>&nbsp;${message}</p>`);
        }

        // 使input框始终在底部
        // $("#content p:last").html(`<strong style="font-size: 2em; text-align: left">${username}&nbsp;</strong>: &nbsp;<span>&nbsp;${message}</span>`);
        let height = $(window).height()>$('#content p:last').offset().top+$('#content p:last').height()*2?$(window).height():$('#content p:last').offset().top+$('#content p:last').height()*2;
        console.log(height);
        _$inputGrop.css({'top': height});
    };

    let sendImg = function(event) {
        //检测浏览器是否支持FileRead
        if(typeof FileReader === 'undefined'){
            alert('您的浏览器不支持，该更新了');
            //禁用Button
            _$imgButton.attr('disabled','disabled');
        }
        let file = event.target.files[0];
        //重置一下form元素，否则如果发同一张图片不会触发change事件
        $("#resetform")[0].reset();
        // console.log(`files: ${event.target.files}`);
        // console.log(file);
        if(!/image\/\w+/.test(file.type)) {
            alert('只能选择图片');
            return false;
        }
        let reader = new FileReader();
        // console.log(reader);

        reader.readAsDataURL(file);
        reader.onload = function(e){
            let _this = this;
            socket.emit('sendImg',{username: _username, DataUrl: _this.result});
        }
    };

    let showImg = function(DataUrl,username) {
        if(username === _username) {
            $('#content').append(`<p class="bg-primary" style=' text-align:center;'><strong style="font-size: 1.5em;">${username}&nbsp;</strong>: &nbsp;<img class="img-thumbnail" src="${DataUrl}" style="max-height: 100px"/></p>`);
        } else {
            $('#content').append(`<p class="bg-info" style=''><strong style="font-size: 1.5em;">${username}&nbsp;</strong>: &nbsp;<img class="img-thumbnail" src="${DataUrl}" style="max-height: 100px"/></p>`);
        }
        let height = $(window).height()>$('#content p:last').offset().top+$('#content p:last').height()*2?$(window).height():$('#content p:last').offset().top+$('#content p:last').height()*2;
        // console.log(height);
        _$inputGrop.css({'top': height});
    };

    let beginChat = function(username) {
        $('#loginbox').hide('slow');
        // 移除绑定事件
        _$inputname.off('keyup');
        _$loginButton.off('click');

        // 显示聊天界面
        $(`<h2 style="text-align: center">${username}的聊天室</h2>`).insertBefore($("#content"));
        /*$(`<p></p>`).insertBefore($('#content'));
         $('#chatbox p').text('欢迎'+username);*/
        $(`<strong>欢迎你</strong><span>${_username}!</span>`).insertAfter($('#myalert button'));
        $("#myalert1").hide();
        $('#myalert').alert();
        setTimeout(function () {
            $('#myalert').alert('close');
        },2000);
        $('#chatbox').show('slow');
    };

    _$inputname.on('keyup',function (event) {
        if(event.keyCode === 13) {
            setUsername();
            return false;
        }
    });
    _$loginButton.on('click',function(event) {
        setUsername();
        return false;
    });

    _$chatinput.on('keydown',function (event) {
        if(event.keyCode === 13) {
            sendMessage();
            _$chatinput.val('');
        }
    });

    _$imgButton.on('click',function (event) {
        _$imgInput.click();
        return false;
    });

    /*_$imgInput.on('click',function(event){
        sendImg(event);
    });*/

    _$imgInput.change(function(event) {
        // console.log("触发了");
        sendImg(event);
    });


    //socket.on
    socket.on('loginSuccess',(data)=>{
        if(_username === data.username) {
            beginChat(_username);
        }else {
            /*alert("请重新登录");*/
            //有好友登录了
            console.log("有好友登录:"+data.username);
            // $(`<span>您的好友<strong>${data.name}</strong>上线了!</span>`).insertAfter($('#myalert1 button'));
            $('#myalert1 span').html(`<span>您的好友<strong>${data.username}</strong>上线了!</span>`);
            setTimeout(function(){
                $("#myalert1").hide();
            },1000);
            $("#myalert1").show();
        }
    });

    socket.on('usernameErr',(data)=>{
        /*alert("用户名重复");*/
        //提醒用户用户名重复
        $('.form-group').addClass('has-error');
        $('<label class="control-label" for="inputError1">用户名重复</label>').insertAfter($('#name'));
        setTimeout(function () {
            $('.form-group').removeClass('has-error');
            $('#name + label').remove();
        },1500)
    });

    socket.on('receiveMessage',(data)=> {
        console.log("可以显示信息");
        let _message = data.message;
        showMessage(_message,data.username);
    });

    socket.on('receiveImg',(data)=> {
        console.log("可以显示图片了");
        let DataUrl = data.DataUrl;
        showImg(DataUrl,data.username);
    })
});
