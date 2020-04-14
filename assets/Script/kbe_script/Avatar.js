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

KBEngine.Avatar = KBEngine.Entity.extend({
    
    __init__() {
        this._super();

        if(this.isPlayer()){
            this.installEvents();

            // 是否可以发送加载完成状态
            this.bLoadDone = false;

            // 当前操作玩家
            this.curChairID = 0;
        }
    },

    //-------------------------------------------------------
    // 本地消息 begin
    //-------------------------------------------------------

    installEvents() {
        KBEngine.Event.register('startMatch', this, 'startMatch');
        KBEngine.Event.register('cancelMatch', this, 'cancelMatch');
        KBEngine.Event.register('loadDone', this, 'loadDone');
        KBEngine.Event.register('ready', this, 'ready');
        KBEngine.Event.register('reqChess', this, 'reqChess');
    },
    
    // 开始匹配
    startMatch(roomType){
        console.log('BExs_reqStartMatch:' + roomType);

        this.baseCall('BExs_reqStartMatch', roomType);
    },
    
    // 取消匹配
    cancelMatch(){
        console.log('cancelMatch.');

        this.baseCall('BExs_reqCancelMatch');
    },

    // 房间初始化完成
    loadDone(){
        console.log('loadDone.');
        
        // 发送加载完成的时机为：
        // 1.场景初始化完成
        // 2.角色进入空间
        if(this.bLoadDone){
            this.cellCall('CExs_reqLoadDone')
        }
        else{
            this.bLoadDone = true;
        }
    },

    // 准备
    ready(){
        console.log('ready.');

        this.cellCall('CExs_reqReady');
    },

    // 请求下子
    reqChess(x, y){
        console.log('reqChess. x:' + x + ", y:" + y);

        this.cellCall('CExs_reqChess', x, y);
    },
    
    //-------------------------------------------------------
    // 服务器消息 begin
    //-------------------------------------------------------

    onEnterSpace(){
        console.log('onEnterSpace:' + this.id);
        
        if(this.bLoadDone){
            this.cellCall('CExs_reqLoadDone')
        }
        else{
            this.bLoadDone = true;
        }
    },

    onLeaveSpace(){
        console.log('onLeaveSpace:' + this.id);
        
        // 离开空间时恢复状态
        this.bLoadDone = false;
    },

    set_avatarID(old){
        KBEngine.Event.fire('set_avatarID', this);
    },

    set_nickName(old){
        KBEngine.Event.fire('set_nickName', this);
    },

    set_avatarUrl(old){
        KBEngine.Event.fire('set_avatarUrl', this);
    },

    set_gender(old){
        KBEngine.Event.fire('set_gender', this);
    },

    set_pub_nickName(old){
        KBEngine.Event.fire('set_pub_nickName', this, old);
    },

    set_pub_avatarUrl(old){
        KBEngine.Event.fire('set_pub_avatarUrl', this, old);
    },

    set_pub_gender(old){
        KBEngine.Event.fire('set_pub_gender', this, old);
    },

    set_pub_chairID(old){
        KBEngine.Event.fire('set_pub_chairID', this, old);
    },
    
    set_pub_ready(old){
        KBEngine.Event.fire('set_pub_ready', this, old);
    },

    set_pub_online(old){
        KBEngine.Event.fire('set_pub_online', this, old);
    },

    // 通知当前大厅名称
    Exs_tellCurHalls(hallsName){
        console.log('Exs_tellCurHalls:' + hallsName);

        KBEngine.Event.fire('msg_tellCurHalls', hallsName);
    },

    // 通知开始匹配结果
    // 参数1：是否成功
	// 参数2：相关消息
    Exs_ackStartMatch(bSucc, msg){
        console.log('Exs_ackStartMatch:' + bSucc + msg);

        KBEngine.Event.fire('msg_ackStartMatch', bSucc, msg);
    },

    // 通知取消匹配结果
    // 参数1：是否取消成功
    // 参数2：相关消息
    Exs_ackCancelMatch(bSucc, msg){
        console.log('Exs_ackCancelMatch:' + bSucc + msg);

        KBEngine.Event.fire('msg_ackCancelMatch', bSucc, msg);
    },

    // 通知加入房间
    // 参数1：房间的游戏ID
    Exs_tellJoinRoom(gameID){
        console.log('Exs_tellJoinRoom:' + gameID);

        // 通知加入房间时 初始化状态
        // 其实在离开空间时角色状态已经设置 这里做容错
        this.bLoadDone = false;

        KBEngine.Event.fire('msg_tellJoinRoom', gameID);
    },

    // 通知开始游戏
    Exs_onStartGame(){
        console.log('Exs_onStartGame.');

        KBEngine.Event.fire('msg_onStartGame');
    },

    //通知当前操作玩家
	// 参数1：当然玩家座位号
    Exs_tellCurPlayer(curChairID){
        console.log('Exs_tellCurPlayer.' + curChairID);

        this.curChairID = curChairID;
        KBEngine.Event.fire('msg_tellCurPlayere', curChairID);
    },

    // 通知玩家下子
	// 参数1：下子玩家座位号
	// 参数2：下子位置x
	// 参数2：下子位置y
    Exs_tellPlayerChess(chairID, pos_x, pos_y){
        console.log('Exs_tellPlayerChess.' + chairID + ", pos_x:" + pos_x + ", pos_y:" + pos_y);

        KBEngine.Event.fire('msg_tellPlayerChes', chairID, pos_x, pos_y);
    },

    Exs_onEndGame(winChairID){
        console.log('Exs_onEndGame.' + winChairID);

        this.curChairID = 0;
        KBEngine.Event.fire('msg_onEndGame', winChairID);
    },
});
