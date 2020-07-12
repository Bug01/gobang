// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var KBEngine = require("kbengine");

cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad () {
        var args = new KBEngine.KBEngineArgs();
		args.ip = G_Server['ip'];
        args.port = G_Server['port'];
        args.isWss = G_Server['isWss'];
        KBEngine.create(args);

        this.installEvents();

        // 手机端 检查用户授权
        if(cc.sys.isMobile){
            this._checkScope();
        }
    },

    // start () {},

    // 注册事件
    installEvents() {
        KBEngine.Event.register("msg_tellCurHalls", this, "msg_tellCurHalls");
    },

    //-------------------------------------------------------
    // 服务器消息 begin
    //-------------------------------------------------------

    // 加入大厅成功时可以切界面了
    msg_tellCurHalls(hallsName) {
        console.log('msg_tellCurHalls:' + hallsName);

        cc.director.loadScene('game');
    },

    //-------------------------------------------------------
    // 本地消息 begin
    //-------------------------------------------------------
    // 登陆按钮事件
    onLoginClick() {
        // 普通登陆 - 随机账号
        if(cc.sys.isBrowser){
            var account = "account_" + parseInt(Math.random() * 100);
            var userInfo = {
                'nickName' : account,
                'avatarUrl' : '',
                'gender' : 0,
            }
            KBEngine.Event.fire('login', "0:" + account, account, JSON.stringify(userInfo));
        }
        // 微信登陆
        else if(cc.sys.isMobile){
            var self = this;
            // 本地获取微信信息
            wx.getSetting({
                success (res) {
                    if (res.authSetting["scope.userInfo"]) {
                        self._wxLogin();
                    }
                }
            })
        }
    },

    // 检查授权情况
    _checkScope(){
        var self = this;

        wx.getSetting({
            success (res) {
                if (res.authSetting["scope.userInfo"]) {
                    console.log("用户已授权.");
                }
                else{
                    console.log("用户未授权.");
                    
                    // 授权按钮
                    let button = wx.createUserInfoButton({
                        type: 'text',
                        text: '获取用户信息',
                        style: {
                          left: 10,
                          top: 76,
                          width: 200,
                          height: 40,
                          lineHeight: 40,
                          backgroundColor: '#ff0000',
                          color: '#ffffff',
                          textAlign: 'center',
                          fontSize: 16,
                          borderRadius: 4
                        }
                      })

                    button.onTap((res) => {
                        if (res.userInfo) {
                            console.log("用户授权成功.");

                            // 走登陆
                            self._wxLogin();
                        }
                    })
                }
            }
        });
    },

    // 微信登陆
    _wxLogin(){
        wx.login({
        success (res) {
            if (res.code) {
                wx.getUserInfo({
                    success(userInfo) {
                        //发起网络请求
                        console.log("登陆成功！");
                        //JSON.stringify(userInfo['signature']);
                        KBEngine.Event.fire('login', "1:" + res.code, userInfo['signature'], userInfo['rawData']);
                    }
                })
            }
            else {
                console.log('登录失败！' + res.errMsg)
            }
        }
        })
    },
    
});
