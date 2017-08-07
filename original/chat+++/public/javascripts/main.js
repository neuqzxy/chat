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
    let _$userGroup = $("#usergroup .list-group");
    let _$chatBox = $("#chatbox");
    let _tmpData = null;
    let url = 'http://127.0.0.1:3000';
    let allUsers = [];
    let _to = null;



    let socket = io.connect(url);

    //初始化样式函数
    let initHeight = function () {
        let _maxHeight = _$inputGrop.offset().top - $('#chattitle').offset().top - $('#chattitle').height() - 50;
        $('#content').css('max-height',_maxHeight);
        let _maxHeight1 = $(window).height() - 150;
        console.log(_maxHeight1);
        $(".list-group").css("max-height",_maxHeight1);
    };

    //随机选择器
    let randomChoose = function (imgUrl) {
        if(typeof imgUrl === 'undefined'){
            console.log('imgUrl为undefined');
            imgUrl = (Math.random()*8)|0;
        }
        switch (imgUrl) {
            case 0 :
                return "icon-river__easyiconnet1";
            case 1 :
                return "icon-river__easyiconnet";
            case 2 :
                return "icon-photo_camera__easyiconnet";
            case 3 :
                return "icon-planet_earth__easyiconnet";
            case 4 :
                return "icon-palace__easyiconnet";
            case 5 :
                return "icon-mountain__easyiconnet";
            case 6 :
                return "icon-parachute__easyiconnet";
            case 7 :
                return "icon-map__easyiconnet";
            case 8 :
                return "icon-mountains__easyiconnet";
            case -1 :
                return "icon-yonghu"
        }
    };

    //初始化模态框
    let initModal = function (event) {
        let _$button = $(event.target); //得到按钮
        _to = _$button.attr('name');
        $("#myModalLabel").text(`发给${_to}`);
    };


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

    let showMessage = function(message,username,imgUrl) {
        if(username === _username) {
            $('#content').append(`<div class="receiver">
                                    <div>
                                        <svg class="icon img-circle" aria-hidden="true" style="font-size: 2em;">
                                            <use xlink:href="#icon-yonghu"></use>
                                        </svg>
                                        <strong style="font-size: 1.5em;">
                                            ${username}&nbsp;
                                        </strong>
                                    </div>
                                    <div>
                                        <div class="right_triangle"></div>
                                        <span>&nbsp;&nbsp;${message}</span>
                                    </div>
                                </div>`);
        } else {
            $('#content').append(`<div class="sender">
                                    <div>
                                        <svg class="icon img-circle" aria-hidden="true" style="font-size: 2em;">
                                            <use xlink:href="#${randomChoose(imgUrl)}"></use>
                                        </svg>
                                        <strong style="font-size: 1.5em;">${username}&nbsp;</strong>
                                    </div>
                                    <div>
                                        <div class="left_triangle"></div>
                                        <span>&nbsp;&nbsp;${message}</span>
                                    </div>
                                    
                                </div>`);
        }
        initHeight();
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

    let showImg = function(DataUrl,username,imgUrl) {
        if(username === _username) {
            $('#content').append(`<div class="receiver">
                                    <div>
                                        <svg class="icon img-circle" aria-hidden="true" style="font-size: 2em;">
                                            <use xlink:href="#icon-yonghu"></use>
                                        </svg>
                                        <strong style="font-size: 1.5em;">
                                            ${username}&nbsp;
                                        </strong>
                                    </div>
                                    <div>
                                        <div class="right_triangle"></div>
                                        <span><img class="img-thumbnail" src="${DataUrl}" style="max-height: 100px"/></span>
                                    </div>
                                </div>`);
        } else {
            $('#content').append(`<div class="sender">
                                    <div>
                                        <svg class="icon img-circle" aria-hidden="true" style="font-size: 2em;">
                                            <use xlink:href="#${randomChoose(imgUrl)}"></use>
                                        </svg>
                                        <strong style="font-size: 1.5em;">${username}&nbsp;</strong>
                                    </div>
                                    <div>
                                        <div class="left_triangle"></div>
                                        <span><img class="img-thumbnail" src="${DataUrl}" style="max-height: 100px"/></span>
                                    </div>
                                    
                                </div>`);
        }
        initHeight();
    };
    let beginChat = function(data) {
        $('#loginbox').hide('slow');
        // 移除绑定事件
        _$inputname.off('keyup');
        _$loginButton.off('click');

        // 显示聊天界面
        $(`<h2 style="text-align: center" id="chattitle">${data.username}的聊天室</h2>`).insertBefore($("#content"));
        /*$(`<p></p>`).insertBefore($('#content'));
         $('#chatbox p').text('欢迎'+username);*/
        $(`<strong>欢迎你</strong><span>${_username}!</span>`).insertAfter($('#myalert button'));
        $("#myalert1").hide();
        $("#myalert2").hide();
        $('#myalert').alert();
        setTimeout(function () {
            $('#myalert').alert('close');
        },2000);
        $('#chatbox').show('slow');

        initHeight();
        //在用户组里设置自己的信息，初始化用户列表
        _$userGroup.append($(`<a href="#" class="list-group-item disabled" name="${_username}"><svg class="icon img-circle" aria-hidden="true" style="font-size: 2em;"><use xlink:href="#icon-yonghu"></use></svg>&nbsp;&nbsp;&nbsp;&nbsp;${_username}</a>`));
        for (let user of data.userGroup) {
            if(user.username !== _username) {  //如果不是自己，就写到在线成员中
                _$userGroup.append($(`<a href="#" class="list-group-item" name="${user.username}" data-toggle="modal" data-target="#myModal"><svg class="icon img-circle" aria-hidden="true" style="font-size: 2em;"><use xlink:href="#${randomChoose(user.imgUrl)}"></use></svg>&nbsp;&nbsp;&nbsp;&nbsp;${user.username}</a>`));
            }
        }
    };

    //显示登录离开信息
    let showComLeave = function (flag,data) {
        /**
         * flag为1表示登录为-1表示离开
         */
        if(flag === 1) {
            //有好友登录了
            console.log("有好友登录:"+data.username);
            // $(`<span>您的好友<strong>${data.name}</strong>上线了!</span>`).insertAfter($('#myalert1 button'));
            $('#myalert1 span').html(`<span>您的好友<strong>${data.username}</strong>上线了!</span>`);
            setTimeout(function(){
                $("#myalert1").hide();
            },1000);
            $("#myalert1").show();
        }
        else if(flag === -1) {
            if(typeof data.username === 'undefined'){
                return;
            }
            //有好友离开了
            $('#myalert2 span').html(`<span>您的好友<strong>${data.username}</strong>下线了!</span>`);
            console.log(data.username);
            setTimeout(function(){
                $("#myalert2").hide();
            },1000);
            $("#myalert2").show();
        }
    };

    //添加删除用户列表
    let addDeleteUsersLise = function (flag,data) {
        /**
         * flag为1表示添加用户，为-1表示删除用户
         */
        if(flag === 1) {
            _$userGroup.append($(`<a href="#" class="list-group-item" name="${data.username}" data-toggle="modal" data-target="#myModal"><svg class="icon img-circle" aria-hidden="true" style="font-size: 2em;"><use xlink:href="#${randomChoose(data.imgUrl)}"></use></svg>&nbsp;&nbsp;&nbsp;&nbsp;${data.username}</a>`));
        }

        if(flag === -1) {
            //先从列表中删除那个人
            allUsers.forEach(function (user,index) {
                if(user.username === data.username) {
                    allUsers.splice(index,1);
                }
            });

            //然后删除列表中的那一项
            _$userGroup.find(`a[name='${data.username}']`).remove();
        }
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

    //监听模态框
    _$userGroup.on('click',function(event){
        //显示模态框
        initModal(event);
    });

    //发送私聊信息
    $("#sendtoo").on('click',function (event) {
        //得到input框中的文字，触发私聊事件
        let _msg = $("#inputtoone").val();
        if(_msg === ''){
            return false;
        }
        socket.emit('sendToOne',{message: _msg, username: _username, to: _to});
        _to = null;
    });


    /*      socket.on      */
    socket.on('loginSuccess',(data)=>{
        if(_username === data.username) {
            //将自己添加到用户数组里
            let user = {username: _username, imgUrl: -1};
            allUsers.push(user);
            //启动聊天界面
            beginChat(data);
        }else {
            showComLeave(1,data);
            //将新成员加入用户数组中
            let user = {username: data.username, imgUrl: data.imgUrl};
            allUsers.push(user);

            //添加到列表中
            addDeleteUsersLise(1,data);
            initHeight();
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
        showMessage(_message,data.username,data.imgUrl);
    });

    socket.on('receiveImg',(data)=> {
        console.log("可以显示图片了");
        let DataUrl = data.DataUrl;
        showImg(DataUrl,data.username,data.imgUrl);
    });

    socket.on('someOneLeave',(data)=>{
        //显示信息
        showComLeave(-1,data);
        //删除用户列表中的该用户
        addDeleteUsersLise(-1,data);
    });

    socket.on('SendToOneSuccess',(data)=>{
        $("#myModalLabel1").text(`${data.username}给你的留言`);
        $(".shoudao").text(data.message);
        $("#showmodal").click();
    });

    socket.on("receiveSendToOne",(data)=>{
        $("#inputtoone").val('');
        $("#closesendtoo").click();
    })
});
