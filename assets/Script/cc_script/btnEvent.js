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

    properties: { },

    // 开始匹配按钮事件
    onStartMatch() {
        KBEngine.Event.fire('startMatch', 1);
    },

    // 取消匹配按钮事件
    onCancelMatch() {
        KBEngine.Event.fire('cancelMatch');
    },
    
    // 准备按钮事件
    onReady(){
        KBEngine.Event.fire('ready');
    },

    onExit(){
        KBEngine.Event.fire('exit');
    }
});
