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
        // 棋桌
        table: {
            default: null,
            type: cc.Node,
        },

        // 棋子摸板（1黑色，2白色）
        allPiece : {
            default: [],
            type: [cc.Prefab],
        },

        // 最新落子标记
        newPiece : {
            default: null,
            type: cc.Node,
        },

        // 准备按钮
        btn_ready: {
            default: null,
            type: cc.Node,
        },

        // 自己的信息
        myPlayer: {
            default: null,
            type: cc.Node,
        },

        // 对家的信息
        tarPlayer: {
            default: null,
            type: cc.Node,
        },

        // 开始页
        startLayer: {
            default: null,
            type: cc.Node,
        },

        // 结束页
        endLayer: {
            default: null,
            type: cc.Node,
        },

        // 和棋页
        drawLayer: {
            default: null,
            type: cc.Node,
        },

        // 悔棋页
        backChessLayer: {
            default: null,
            type: cc.Node,
        },
    },

    // 控件可见时 做初始化界面
    onEnable(){
        // 注册事件
        this.installEvents();
        
        // 初始化牌桌信息
        this.width = 45;
        this.radius = 20;
        this.tableData = new Array();
        for(var i = 0; i < 15; i++){
            this.tableData[i] = new Array();
            for(var j = 0; j < 15; j++){
                this.tableData[i][j] = null;
            }
        }

        // 默认控件状态
        this.btn_ready.active = false;
        this.myPlayer.active = false;
        this.tarPlayer.active = false;
        this.newPiece.active = false;
        this.startLayer.active = false;
        this.endLayer.active = false;
        this.drawLayer.active = false;
        this.backChessLayer.active = false;

        // 加载完成
        KBEngine.Event.fire('loadDone');
    },

    // 控件隐藏时 做清理
    onDisable(){
        console.log('room_10:onDisable.');
        
        // 取消注册事件
        this.unInstallEvents();

        // 清理棋子
        for(var i = 0; i < 15; i++){
            for(var j = 0; j < 15; j++){
                if(this.tableData[i][j] != null){
                    this.tableData[i][j].destroy();
                    this.tableData[i][j] = null;
                }
            }
        }
        // 清理玩家棋子标识
        this.tarPlayer.getChildByName('color').removeAllChildren();
        this.myPlayer.getChildByName('color').removeAllChildren();
    },

    // 注册事件
    installEvents() {
        this.table.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);

        KBEngine.Event.register("onEnterWorld", this, "onEnterWorld");
        KBEngine.Event.register("onLeaveWorld", this, "onLeaveWorld");

        KBEngine.Event.register("set_pub_chairID", this, "set_chairID");
        KBEngine.Event.register("set_pub_online", this, "set_online");
        KBEngine.Event.register("set_pub_ready", this, "set_ready");

        KBEngine.Event.register("msg_onStartGame", this, "msg_onStartGame");
        KBEngine.Event.register("msg_tellCurPlayere", this, "msg_tellCurPlayere");
        KBEngine.Event.register("msg_tellPlayerChes", this, "msg_tellPlayerChes");
        KBEngine.Event.register("msg_tellPlayerConsent", this, "msg_tellPlayerConsent");
        KBEngine.Event.register("msg_tellPlayerConsentBack", this, "msg_tellPlayerConsentBack");
        KBEngine.Event.register("msg_onEndGame", this, "msg_onEndGame");
    },

    // 取消注册事件
    unInstallEvents() {
        this.table.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);

        KBEngine.Event.deregisterAll(this);
    },

    // 准备按钮事件
    onReady(){
        KBEngine.Event.fire('reqReady');
    },

    onExit(){
        KBEngine.Event.fire('reqExit');
    },

    // 请求和棋
    reqDraw(){
        KBEngine.Event.fire('reqConsent', 1);
    },

    // 和棋回应
    reqDrawBack(event, bAgree){
        console.log('bAgree' + bAgree);
        KBEngine.Event.fire('reqConsentBack', 1, parseInt(bAgree));
    },

    // 请求悔棋
    reqBackChess(){
        KBEngine.Event.fire('reqConsent', 2);
    },

    // 悔棋回应
    reqBackChessBack(event, bAgree){
        KBEngine.Event.fire('reqConsentBack', 2, parseInt(bAgree));
    },

    // 请求认输
    reqLose(){
        KBEngine.Event.fire('reqLose');
    },

    //-------------------------------------------------------
    // 服务器消息 begin
    //-------------------------------------------------------

    onEnterWorld(entity){
        console.log('onEnterWorld:' + entity.pub_nickName);
    },

    onLeaveWorld(entity){
        console.log('onLeaveWorld:' + entity.pub_nickName);
    },

    set_chairID(entity, old){
        console.log('set_chairID.' + entity.id);
        // 如果是玩家刚坐下
        if(entity.pub_chairID != 0){
            // 根据玩家位置展示玩家信息
            this.showPlayer(entity);
            
            // 如果是自己 展示准备
            if(entity.isPlayer() && !entity.pub_ready){
                this.btn_ready.active = true;
            }
        }
    },

    set_ready(entity, old){
        console.log('set_ready.' + entity.id);

        // 当前玩家
        var p = this.tarPlayer;
        if(entity.isPlayer()){
            p = this.myPlayer;
        }
        
        var ready = p.getChildByName('ready');
        if(entity.pub_ready){
            ready.active = true;
        }
        else{
            ready.active = false;
        }

        // 如果是自己准备 隐藏按钮
        if(entity.isPlayer() && entity.pub_ready){
            this.btn_ready.active = false;
        }
    },

    set_online(entity, old){
        console.log('set_online.' + entity.id);
        // 当前玩家
        var p = this.tarPlayer;
        if(entity.isPlayer()){
            p = this.myPlayer;
        }

        var online = p.getChildByName('online');
        if(entity.pub_online){
            online.active = false;
        }
        else{
            online.active = true;
        }
    },

    // 开始游戏
    msg_onStartGame(){
        console.log('msg_onStartGame');

        // 新棋子光标显示
        this.newPiece.active = true;
        this.newPiece.setPosition(1000, 0);

        //构造动画
        this.startLayer.setPosition(-650, 0);
        this.startLayer.active = true;
        var finish = cc.callFunc(function(){ this.startLayer.active = false; }, this)
        var seq = cc.sequence(  cc.moveTo(0.2, 0, 0),
                                cc.delayTime(0.5),
                                cc.moveTo(0.2, 650, 0),
                                finish);
        this.startLayer.runAction(seq);
    },

    msg_tellCurPlayere(curRound, curChairID){
        console.log('msg_tellCurPlayere' + curChairID);
        
        // 第一回合 开启计时器
        if(curRound == 1){
            this.schedule(this.onTimerCallback, 1);
        }

        // 显示操作定时器
        var player = KBEngine.app.player();
        if(player.pub_chairID == curChairID) {
            this.myPlayer.getChildByName('time').getComponent('cc.Label').string = 30;
            this.tarPlayer.getChildByName('time').getComponent('cc.Label').string = '';
        }
        else {
            this.myPlayer.getChildByName('time').getComponent('cc.Label').string = '';
            this.tarPlayer.getChildByName('time').getComponent('cc.Label').string = 30;
        }
    },

    msg_tellPlayerChes(chairID, pos_x, pos_y){
        // 绘制棋子
        var pos = this.posToPoint(pos_x, pos_y)
        var piece = this.drawCirl(chairID, pos.x, pos.y);

        // 最新棋子标记
        this.newPiece.setPosition(pos.x, pos.y);

        // 记录棋子数据
        this.tableData[pos_x][pos_y] = piece;
    },

    msg_tellPlayerConsent(chairID, tp) {
        var player = KBEngine.app.player();
        if(player.pub_chairID != chairID) {
            // 和棋请求
            if(tp == 1) {
                this.drawLayer.active = true;
            }
            // 悔棋请求
            else if(tp == 2) {
                this.backChessLayer.active = true;
            }
        }
    },


    msg_tellPlayerConsentBack(chairID, tp, bAgree) {
        var player = KBEngine.app.player();
        if(player.pub_chairID == chairID) {
            // 和棋请求
            if(tp == 1) {
                this.drawLayer.active = false;
            }
            // 悔棋请求
            else if(tp == 2) {
                this.backChessLayer.active = false;
            }
        }
    },

    msg_onEndGame(winChairID){
        console.log('msg_onEndGame' + winChairID);
        
        // 取消定时器
        this.unschedule(this.onTimerCallback);

        // 展示结局
        var player = KBEngine.app.player();
        this.endLayer.active = true;
        var winStaus = this.endLayer.getChildByName('winStaus').getComponent('cc.Label');

        if(winChairID == 0) {
            winStaus.string = '和棋啦！';
        }
        else if(player.pub_chairID == winChairID){
            winStaus.string = '你赢啦！';
        }
        else{
            winStaus.string = '你输啦！';
        }
    },

    //-------------------------------------------------------
    // 本地消息 begin
    //-------------------------------------------------------

    // 绘制棋子
    drawCirl(chairID, x, y){
        var piece = cc.instantiate(this.allPiece[chairID]);
        piece.setPosition(x, y);
        this.table.addChild(piece);

        return piece;
    },

    // 显示玩家信息
    showPlayer(entity){
        // 要显示的玩家
        var p = this.tarPlayer;
        if(entity.isPlayer()){
            p = this.myPlayer;
        }
        
        // 展示控件
        p.active = true;
        
        // 名字控件
        var name = p.getChildByName('name').getComponent('cc.Label');
        name.string = entity.pub_nickName;

        // 头像控件
        if(cc.sys.isMobile){
            var head = p.getChildByName('headImg');
            cc.loader.load({url: entity.pub_avatarUrl + '?file=a.png', type: 'png'}, function(err, tex){
                head.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(tex);
            })
        }
        
        // 准备状态控件
        var ready = p.getChildByName('ready');
        if(entity.pub_ready){
            ready.active = true;
        }
        else{
            ready.active = false;
        }

        // 在线状态
        var online = p.getChildByName('online');
        if(entity.pub_online){
            online.active = false;
        }
        else{
            online.active = true;
        }

        // 颜色状态
        var color = p.getChildByName('color');
        var piece = cc.instantiate(this.allPiece[entity.pub_chairID]);
        piece.scale = 2;
        color.addChild(piece);
    },

    onTouchEnd(event){
        var player = KBEngine.app.player();
        // 当前操作玩家是我
        if(player.curChairID == player.pub_chairID){
            let localPoint = this.table.convertToNodeSpace(event.getLocation());
            var pos = this.pointToPos(localPoint.x, localPoint.y);
            
            //无效位置
            if(pos.x == -1 || pos.y == -1 || this.tableData[pos.x][pos.y] != null){
                return false;
            }
            console.log(localPoint, pos);
            KBEngine.Event.fire('reqChess', pos.x, pos.y);
        }
    },

    // 坐标点转换为坐标
    pointToPos(x, y){
        var kx = parseInt(x / this.width)
        var ky = parseInt(y / this.width)
        
        // 计算x的点
        if(x <= kx * this.width + this.radius && 
            x >= kx * this.width - this.radius){
                x = kx;
        }
        else if(x <= (kx + 1) * this.width + this.radius &&
            x >= (kx + 1) * this.width - this.radius){
                x = kx + 1;
        }
        else{
            // 无效位置
            return cc.v2(-1,-1);
        }

        // 计算y的点
        if(y <= ky * this.width + this.radius && 
            y >= ky * this.width - this.radius){
                y = ky;
        }
        else if(y <= (ky + 1) * this.width + this.radius &&
            y >= (ky + 1) * this.width - this.radius){
                y = ky + 1;
        }
        else{
            // 无效位置
            return cc.v2(-1,-1);
        }
        return cc.v2(x, y);
    },

    // 位置转换为坐标点
    posToPoint(x, y){
        // 棋盘与边框距离为10
        x = x * this.width;
        y = y * this.width;

        return cc.v2(x, y);
    },

    onTimerCallback(){
        if(this.myPlayer.getChildByName('time').getComponent('cc.Label').string != '' &&
            this.myPlayer.getChildByName('time').getComponent('cc.Label').string > 0){
            this.myPlayer.getChildByName('time').getComponent('cc.Label').string -= 1;
        }
        else if(this.tarPlayer.getChildByName('time').getComponent('cc.Label').string != '' &&
            this.tarPlayer.getChildByName('time').getComponent('cc.Label').string > 0){
            this.tarPlayer.getChildByName('time').getComponent('cc.Label').string -= 1;
        }
        
    }
});
