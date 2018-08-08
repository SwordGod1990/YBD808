//app.js
var util = require('/utils/util.js');
App({
    onLaunch: function () {

    },

    GetUserInfo: function (cb) {
        var that = this
        that.globalData.userInfo = wx.getStorageSync('UserInfo')
        that.globalData.userid = wx.getStorageSync('USERID')

        if (that.globalData.userid && that.globalData.userInfo) {
            typeof cb == "function" && cb(that.globalData.userid, that.globalData.userInfo)

            console.log(that.globalData.userid)
            console.log(that.globalData.userInfo)
        } else {
            wx.login({
                success: function (res) {
                    console.log("login:", res)
                    that.globalData.code = res.code
                    that.wxGetUserInfo(cb);
                },
                fail: function () {
                    console.log('授权登录失败')
                }
            })
        }
    },

    /**
     * 获取用户信息
     */
    wxGetUserInfo: function (cb) {
        var that = this;

        wx.getUserInfo({
            success: function (res) {
                //保存用户信息
                wx.setStorageSync('UserInfo', res.userInfo)
                console.log('res', res)
                // cb(that.globalData.userid, res.userInfo)
                console.log('UserInfo:', res.userInfo)
                that.globalData.userInfo = res.userInfo;
                //获得用户授权发送code和加密信息给后台获取openid和session_key
                var urlstring = util.BASE_URL + util.Login + '?code=' + that.globalData.code + '&encryptedData=' + res.encryptedData + '&iv=' + res.iv
                util.GetUserid(urlstring, res => {
                    if (res.data && res.data.code == '0000') {
                        that.globalData.userid = res.data.userId;
                        cb(res.data.userId, that.globalData.userInfo)
                        wx.setStorageSync('avatarUrl', that.globalData.userInfo.avatarUrl)
                    }
                })
            },
            fail: function (error) {
                console.log('授权失败')
                that.againLogin(cb)
            }
        })
    },
    /**
         * 重新授权
         */
    againLogin: function (cb) {
        var that = this;
        wx.showModal({
            title: '要授权后才能使用小程序哦',
            confirmText: '去授权',
            cancelText: '退出',
            success: function (res) {
                if (res.confirm) {
                    that.openSet(cb);
                } else if (res.cancel) {
                    // console.log('退出不允许设置共享信息')
                    wx.navigateBack({

                    })
                }
            }
        })
    },

    /**
     * 打开设置
     */
    openSet: function (cb) {
        var that = this;
        wx.openSetting({
            success: function (res) {
                if (!res.authSetting["scope.userInfo"] || !res.authSetting["scope.userLocation"]) {
                    wx.login({
                        success: function (res) {
                            console.log('第二次code:', res.code)
                            that.globalData.code = res.code
                            that.wxGetUserInfo(cb)
                        },
                    })
                }
            },
            fail: function (error) {
                console.log('error', error)
                that.openSet(cb);
            }
        })
    },

    globalData: {
        userid: null,
        code: null,
        homeTop: '0', //控制从提交按钮到首页显示上部的提醒
        userInfo: null,
        isOnShow: -1, //重新进入小程序
        auditState: -1,//是否审核通过 1:审核通过或未审核 2:审核未通过 3:禁用 4:此用户不存在 5:没有企业信息 6:请求失败
        unapproveContent: '审核未通过', //审核未通过内容
        jumpType: -1, //0:EmptyCompanyInfo页面返回不请求企业状态
        selectArea: [], //记录所选配送区域地址用于传值
    },


    onShow: function () {
        // console.log('appjs页的onshow---------appjs页的onshow----------appjs页的onshow')
        this.globalData.isOnShow = 1;
        
        this.globalData.userid = wx.getStorageSync('USERID')
        // if (this.globalData.userid != '' && this.globalData.userid != null){
            
        //     this.getCompanyInfo();
        // }
    },


    onHide: function () {
        // console.log('appjs页的onhide----appjs页的onhide----appjs页的onhide')
        this.globalData.isOnShow = -1;

    },

    onUnload: function () {
        // console.log('appjs页的onUnload----appjs页的onUnload----appjs页的onUnload')
        //小程序退出时情况扫码采购药品
        wx.setStorageSync('SCANDRUGLIST', '')
    },

    /**
     * 企业信息查询
     * 1:审核通过 2:审核未通过 3:禁用 4:此用户不存在 5:没有企业信息 6:请求失败
     */
    // getCompanyInfo: function (userId, callback) {
    //     var that = this;
    //     //是否填写企业信息，true是填写完整(请求数据)，否则跳转页面(我的页面)

    //     util.WhetherHaveCompanyInfo(res => {
    //         console.log(res)
    //         if (res == '1') {
    //             //审核通过
    //             that.globalData.auditState = 1;
    //         } else if (res == '2') {
    //             //审核未通过
    //             that.globalData.auditState = 2;
    //         } else if (res == '3') {
    //             //禁用
    //             that.globalData.auditState = 3;
    //         } else if (res == '4') {
    //             //用户不存在
    //             that.globalData.auditState = 4;
    //         } else if (res == '5') {
    //             //没有企业信息
    //             that.globalData.auditState = 5;
    //         } else {
    //             //请求失败
    //             that.globalData.auditState = 6;
    //         }
    //     })
    // },

    /**
     * 返回企业状态
     * code=0000,message = "成功"
     * code=0002,message = "参数格式验证失败"
     * code=0003,message = "商业公司账号已被停用"
     * code=0004,message = "暂时没有商业公司信息"
     * code=0005,message = "企业信息审核未通过"
     * code=1001,message = "用户id不能为空"
     * code=1002,message = "用户id格式不对"
     * code=1003,message = "用户不存在"
     * code=1004,message = "您的账户已被禁用，请联系管理员"(暂无该状态)
     */
    getCompanyState: function (userId, callback){
        var that = this;
        var param = { sysUserId: userId }
        var url = util.BASE_URL + util.BUSINESS_CHECK_USER;
        util.getDataJson(url, param, res => {
            console.log('getCompanyState:', res)
            if(res.data){
                callback(res)
            }
        })
    }

})
