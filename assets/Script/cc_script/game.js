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
            player_head: {
                default: null,
                type: cc.Node,
            },

            player_name: {
                default: null,
                type: cc.Node,
            },

            matchStatus: {
                default: null,
                type: cc.Node,
            },

            gameRoom_10: {
                default: null,
                type: cc.Node,
            },
        },

    onLoad () {
        this.installEvents();
        
        // 默认状态
        this.matchStatus.active = false;
        this.gameRoom_10.active = false;
        
        // 关联游戏ID与layout之间的关系
        this.gameRoom = {};
        this.gameRoom[10] = this.gameRoom_10;

        // 当前房间页
        this.curRoom = null;

        // 初始化角色信息
        var player = KBEngine.app.player();
        this.set_nickName(player);
        this.set_avatarUrl(player);
    },

    // 注册事件
    installEvents() {
        KBEngine.Event.register("set_nickName", this, "set_nickName");
        KBEngine.Event.register("set_avatarUrl", this, "set_avatarUrl");

        KBEngine.Event.register("msg_ackStartMatch", this, "msg_ackStartMatch");
        KBEngine.Event.register("msg_ackCancelMatch", this, "msg_ackCancelMatch");
        KBEngine.Event.register("msg_tellJoinRoom", this, "msg_tellJoinRoom");

        KBEngine.Event.register('exit', this, 'exit');
    },

    //-------------------------------------------------------
    // 服务器消息 begin
    //-------------------------------------------------------

    set_nickName(entity){
        this.player_name.getComponent('cc.Label').string = entity.nickName;
    },

    set_avatarUrl(entity){
        if(cc.sys.isMobile){
            var self = this;
            cc.loader.load({url: entity.avatarUrl + '?file=a.png', type: 'png'}, function(err, tex){
                self.player_head.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(tex);
            })
        }
    },

    // 通知开始匹配回复
    msg_ackStartMatch(bSucc, msg){
        if(bSucc){
            this.matchStatus.active = true;
        }
    },

    // 通知取消匹配结果
    msg_ackCancelMatch(bSucc, msg){
        if(bSucc) {
            this.matchStatus.active = false;
        }
    },

    // 通知加入房间
    msg_tellJoinRoom(gameID){
        this.matchStatus.active = false;
        
        // 根据游戏id显示对应的房间layout
        this.curRoom = this.gameRoom[gameID];
        this.curRoom.active = true;
    },

    

    //-------------------------------------------------------
    // 本地消息 begin
    //-------------------------------------------------------
    // 离开
    exit(){
        this.curRoom.active = false;
    },
    
});
