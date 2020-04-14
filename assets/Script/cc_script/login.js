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
        this.installEvents();
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

    
});
