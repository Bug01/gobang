// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var KBEngine = require('kbengine');

KBEngine.Account = KBEngine.Entity.extend({
    
    __init__(){
        this._super();

        // 本游戏需要登陆的服务器ID
        this.serverID = 2;
        this.baseCall('BExs_reqAvatarList');
    },

    Exs_ackAvatarList(avatarList, lastServerID){
        for(var av of avatarList){
            if(av['serverID'] == this.serverID){
                console.log('BExs_reqEnterGame. serverID:' + this.serverID);
                
                this.baseCall('BExs_reqEnterGame', this.serverID);
                return;
            }
        }

        //如果没有角色则创建
        this.baseCall('BExs_reqCreateAvatar', this.serverID);
    },

    Exs_ackCreateAvatar(bSuccess, avatar){
        if(bSuccess){
            this.baseCall('BExs_reqEnterGame', this.serverID);
        }
    },

});
