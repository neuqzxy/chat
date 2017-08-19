/**
 * Created by zhouxinyu on 2017/8/6.
 */
$(function() {
    const url = 'http://127.0.0.1:3000';
    let _username = null;
    let _$inputname = $("#name");
    let _$loginButton = $("#loginbutton");
    let _$chatinput = $("#chatinput");
    let _$inputGroup = $("#inputgrop");
    let _$imgButton = $("#imgbutton");
    let _$imgInput = $("#imginput");
    let _$listGroup = $(".list-group");
    let _touXiangUrl = null;
    let _to = null;

    let socket = io.connect(url);

    //随机设置头像的地址
    let touXiang = function(url) {
        let _url = url || (Math.random() * 8 | 0);
        switch (_url) {
            case 0:
                return "icon-river__easyiconnet1";
            case 1:
                return "icon-river__easyiconnet";
            case 2:
                return "icon-photo_camera__easyiconnet";
            case 3:
                return "icon-planet_earth__easyiconnet";
            case 4:
                return "icon-palace__easyiconnet";
            case 5:
                return "icon-mountain__easyiconnet";
            case 6:
                return "icon-parachute__easyiconnet";
            case 7:
                return "icon-map__easyiconnet";
            case 8:
                return "icon-mountains__easyiconnet";
            case -1:
                return "icon-yonghu"
        }
    };

    initModal = function(event) {
        _to = $(event.target).attr('name');
        $("#myModalLabel").text(`发给${_to}`);
    };

    //设置用户名，当用户登录的时候触发
    let setUsername = function() {
        _username = _$inputname.val().trim(); //得到输入框中用户输入的用户名
        _touXiangUrl = touXiang();
        //判断用户名是否存在
        if (_username) {
            socket.emit('login', { username: _username, touXiangUrl: _touXiangUrl }); //如果用户名存在，就代表可以登录了，我们就触发登录事件，就相当于告诉服务器我们要登录了
        }
    };


    let beginChat = function(data) {
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
        $("#myalert2").hide();
        $('#myalert').alert();
        setTimeout(function() {
            $('#myalert').alert('close');
        }, 2000);
        $("#chatbox").show('slow');

        /**
         * 用户列表渲染，首先清空列表
         * 先添加自己，在从data中找到别人添加进去
         */
        _$listGroup.empty();
        _$listGroup.append(`<a href="#" name="${_username}" class="list-group-item disabled"><svg class="icon" aria-hidden="true" style="font-size: 2em"><use xlink:href="#icon-yonghu"></use></svg>&nbsp;&nbsp;${_username}</a>`);
        //添加别人
        for (let _user of data.userGroup) {
            if (_user.username !== _username) {
                _$listGroup.append(`<a href="#" name="${_user.username}" class="list-group-item"  data-toggle="modal" data-target="#myModal"><svg class="icon" aria-hidden="true" style="font-size: 2em"><use xlink:href="#${_user.touXiangUrl}"></use></svg>&nbsp;&nbsp;${_user.username}</a>`);
            }
        }
    };

    let sendMessage = function() {
        /**
         * 得到输入框的聊天信息，如果不为空，就触发sendMessage
         * 将信息和用户名发送过去
         */
        let _message = _$chatinput.val();

        if (_message) {
            socket.emit('sendMessage', { username: _username, message: _message, touXiangUrl: _touXiangUrl });
        }
    };

    let setInputPosition = function() {
        let height = $(window).height() > $('#content p:last').offset().top + $('#content p:last').height() * 2 ? $(window).height() : $('#content p:last').offset().top + $('#content p:last').height() * 2;
        _$inputGroup.css({ 'top': height });
    };

    let showMessage = function(data) {
        //先判断这个消息是不是自己发出的，然后再以不同的样式显示
        if (data.username === _username) {
            $('#content').append(`<div class="receiver">
                                    <div>
                                        <svg class="icon img-circle" aria-hidden="true" style="font-size: 2em;">
                                            <use xlink:href="#icon-yonghu"></use>
                                        </svg>
                                        <strong style="font-size: 1.5em;">
                                            ${data.username}&nbsp;
                                        </strong>
                                    </div>
                                    <div>
                                        <div class="right_triangle"></div>
                                        <span>&nbsp;&nbsp;${data.message}</span>
                                    </div>
                                </div>`);
        } else {
            $('#content').append(`<div class="sender">
                                    <div>
                                        <svg class="icon img-circle" aria-hidden="true" style="font-size: 2em;">
                                            <use xlink:href="#${data.touXiangUrl}"></use>
                                        </svg>
                                        <strong style="font-size: 1.5em;">${data.username}&nbsp;</strong>
                                    </div>
                                    <div>
                                        <div class="left_triangle"></div>
                                        <span>&nbsp;&nbsp;${data.message}</span>
                                    </div>
                                    
                                </div>`);
        }
        setInputPosition();
    };

    let sendImg = function(event) {
        /**
         * 先判断浏览器是否支持FileReader
         */
        if (typeof FileReader === 'undefined') {
            alert('您的浏览器不支持，该更新了');
            //使用bootstrap的样式禁用Button
            _$imgButton.attr('disabled', 'disabled');
        } else {
            let file = event.target.files[0]; //先得到选中的文件
            //判断文件是否是图片
            if (!/image\/\w+/.test(file.type)) { //如果不是图片
                alert("请选择图片");
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
            reader.onload = function(e) {
                socket.emit('sendImg', { username: _username, dataUrl: this.result, touXiangUrl: _touXiangUrl });
            }
        }
    };

    let showImg = function(data) {
        //先判断这个消息是不是自己发出的，然后再以不同的样式显示
        if (data.username === _username) {
            $('#content').append(`<div class="receiver">
                                    <div>
                                        <svg class="icon img-circle" aria-hidden="true" style="font-size: 2em;">
                                            <use xlink:href="#icon-yonghu"></use>
                                        </svg>
                                        <strong style="font-size: 1.5em;">
                                            ${data.username}&nbsp;
                                        </strong>
                                    </div>
                                    <div>
                                        <div class="right_triangle"></div>
                                        <span><img class="img-thumbnail" src="${data.dataUrl}" style="max-height: 100px"/></span>
                                    </div>
                                </div>`);
        } else {
            $('#content').append(`<div class="sender">
                                    <div>
                                        <svg class="icon img-circle" aria-hidden="true" style="font-size: 2em;">
                                            <use xlink:href="#${data.touXiangUrl}"></use>
                                        </svg>
                                        <strong style="font-size: 1.5em;">${data.username}&nbsp;</strong>
                                    </div>
                                    <div>
                                        <div class="left_triangle"></div>
                                        <span><img class="img-thumbnail" src="${data.dataUrl}" style="max-height: 100px"/></span>
                                    </div>
                                    
                                </div>`);
        }
        setInputPosition();
    };

    /**
     *
     * @param flag 为1代表好友上线，-1代表好友下线
     * @param data 存储用户信息
     */
    let comAndLeave = function(flag, data) {
        //上线显示警告框，用户列表添加一个
        if (flag === 1) {
            $('#myalert1 span').html(`<span>您的好友<strong>${data.username}</strong>上线了!</span>`);
            setTimeout(function() {
                $("#myalert1").hide();
            }, 1000);
            $("#myalert1").show();
            //用户列表添加该用户
            _$listGroup.append(`<a href="#" name="${data.username}" class="list-group-item"  data-toggle="modal" data-target="#myModal"><svg class="icon" aria-hidden="true" style="font-size: 2em"><use xlink:href="#${data.touXiangUrl}"></use></svg>${data.username}</a>`);
        } else {
            //下线显示警告框，用户列表删除一个
            $('#myalert2 span').html(`<span>您的好友<strong>${data.username}</strong>下线了!</span>`);
            setTimeout(function() {
                $("#myalert2").hide();
            }, 1000);
            $("#myalert2").show();
            //找到该用户并删除
            _$listGroup.find($(`a[name='${data.username}']`)).remove();
        }
    };


    /*       前端事件         */
    /*登录事件*/
    _$loginButton.on('click', function(event) { //监听按钮的点击事件，如果点击，就说明用户要登录，就执行setUsername函数
        setUsername();
    });

    _$inputname.on('keyup', function(event) { //监听输入框的回车事件，这样用户回车也能登录。
        if (event.keyCode === 13) { //如果用户输入的是回车键，就执行setUsername函数
            setUsername();
        }
    });



    /*聊天事件*/
    _$chatinput.on('keyup', function(event) {
        if (event.keyCode === 13) {
            sendMessage();
            _$chatinput.val('');
        }
    });

    //点击图片按钮触发input
    _$imgButton.on('click', function(event) {
        _$imgInput.click();
        return false;
    });

    _$imgInput.change(function(event) {
        sendImg(event);
        //重置一下form元素，否则如果发同一张图片不会触发change事件
        $("#resetform")[0].reset();
    });

    //监听成员点击事件
    _$listGroup.on('click', function(event) {
        initModal(event);
    });

    //监听私聊的按钮，触发私聊事件
    $("#sendtoo").on('click', function(event) {
        /**
         * 得到用户输入的消息，如果部位空，就发送，清空内容关闭模态框
         */
        let _text = $("#inputtoone").val();
        if (typeof _text !== 'undefined') {
            socket.emit('sendToOne', { to: _to, text: _text, username: _username });
            $("#inputtoone").val('');
            $("#closesendtoo").click();
        }
    });


    /*        socket.io部分逻辑        */
    socket.on('loginSuccess', (data) => {
        /**
         * 如果服务器返回的用户名和刚刚发送的相同的话，就登录
         * 否则说明有地方出问题了，拒绝登录
         */
        if (data.username === _username) {
            beginChat(data);
        } else {
            comAndLeave(1, data);
        }
    });

    socket.on('receiveMessage', (data) => {
        /**
         * 监听到事件发生，就显示信息
         */
        showMessage(data);
    });

    socket.on('usernameErr', (data) => {
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

    socket.on('receiveImg', (data) => {
        /**
         * 监听到receiveImg发生，就显示图片
         */
        showImg(data);
    });

    socket.on('oneLeave', (data) => {
        comAndLeave(-1, data);
    });

    socket.on('receiveToOne', (data) => {
        $("#myModalLabel1").text(`来自${data.username}`);
        $(".shoudao").text(`${data.text}`);
        $("#showmodal").click();
    });

});