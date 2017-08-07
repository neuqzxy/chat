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
            $('#content').append("<p style='background: lightskyblue'></p>");
        } else {
            $('#content').append("<p style='background: lightpink'></p>");
        }
        $("#content p:last").text(message);
        let height = $(window).height()>$('#content p:last').offset().top+$('#content p:last').height()*2?$(window).height():$('#content p:last').offset().top+$('#content p:last').height()*2;
        console.log(height);
        _$chatinput.css({'top': height});
    };

    let beginChat = function(username) {
        $('#loginbox').hide('slow');
        // 移除绑定事件
        _$inputname.off('keyup');
        _$loginButton.off('click');

        //显示聊天界面
        $(`<p></p>`).insertBefore($('#content'));
        $('#chatbox p').text('欢迎'+username);
        $('#chatbox').show('slow');
    };

    _$inputname.on('keyup',function (event) {
        if(event.keyCode === 13) {
            setUsername();
        }
    });
    _$loginButton.on('click',function(event) {
        setUsername();
    });

    _$chatinput.on('keyup',function (event) {
        if(event.keyCode === 13) {
            sendMessage();
            _$chatinput.val('');
        }
    });



    //socket.on
    socket.on('loginSuccess',(data)=>{
        if(_username === data.username) {
            beginChat(_username);
        }else {
            alert("请重新登录");
        }
    });

    socket.on('receiveMessage',(data)=> {
        console.log("可以显示信息");
        let _message = data.message;
        showMessage(_message,data.username);
    })
});
