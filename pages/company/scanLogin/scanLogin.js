// pages/company/scanLogin/scanLogin.js
var util = require('../../../utils/util.js')
var stringUtil = require('../../../utils/stringUtil.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userId: '', //用户Id
        pageNum: 1, //0:加载页面, 1:登录页面; 2:立即入住页面; 3:诊所用户扫码,错误提示
        errorMsg: '抱歉，当前仅支持商家进行登录！', //错误提示
        errorImg: '/Images/error_icon.png', //错误提示图片
        key: '', //商城用户登录标示
        location: '', //用户登录位置
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.data.userId = wx.getStorageSync('USERID')
        console.log('扫码登录 options:', options)
        if (typeof options.q != 'undefined') {
            var url = decodeURIComponent(options.q);
            console.log('url:', url)
            this.data.key = stringUtil.getUrlParms(url, "k");
            console.log('key:', this.data.key)
        } else {
            if (typeof options.key != 'undefined') {
                this.data.key = options.key;
            }
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.data.userId = wx.getStorageSync('USERID')
        var userType = wx.getStorageSync('USERSTATUS');
        if (this.data.userId != '' && typeof this.data.userId != 'undefined') {
            wx.setNavigationBarTitle({
                title: '登录确认',
                success: function (res) { },
                fail: function (res) { },
                complete: function (res) { },
            })
            if (userType == 2) {
                //登录
                this.setData({
                    pageNum: 1,
                })
            } else if (userType == 1) {
                //扫码错误
                this.setData({
                    pageNum: 3,
                })
            }else{
                //立即入驻
                this.setData({
                    pageNum: 2,
                })
                wx.setNavigationBarTitle({
                    title: '入驻致医商城',
                    success: function (res) { },
                    fail: function (res) { },
                    complete: function (res) { },
                })
            }
        } else {
            //立即入驻
            this.setData({
                pageNum: 2,
            })
            wx.setNavigationBarTitle({
                title: '入驻致医商城',
                success: function (res) { },
                fail: function (res) { },
                complete: function (res) { },
            })

            wx.navigateTo({
                url: '../../impower/impower?jumpType=1',
            })
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 立即入驻
     */
    checkInAction: function() {
        // wx.navigateTo({
        //     url: '../../impower/impower',
        // })
        //用户属于商业公司
        wx.setStorageSync('USERSTATUS', 2)
        this.decideUserOperation();
    },

    /**
     * 登录
     */
    loginAction: function() {
        this.loginShoppingMallRequest();
    },

    /**
     * 取消
     */
    cancelAction: function() {
        wx.switchTab({
            url: '../user/user',
        })
    },

    /**
     * 判断用户注册, 绑定企业状态
     */
    decideUserOperation: function () {
        var userInfoStatus = wx.getStorageSync('USERINFOSTATUS');
        var userInfoRegister = wx.getStorageSync('USERINFOREGISTER');
        var userOldData = wx.getStorageSync('USEROLDDATA');
        if (userInfoRegister != 1) {
            //若果未登录，先登录
            wx.navigateTo({
                url: '../../register/register',
            })
            return true;
        } else if (userOldData == 1) {
            wx.navigateTo({
                url: '../fillInCompany/fillInCompany?jumpType=3&provinceName=&companyInfo=',
            })
            return true;
        } else if (userInfoStatus != 1) {
            wx.navigateTo({
                url: '../../bindCompany/bindCompany',
            })
            return true;
        }
        return false;
    },

    /**
     * 登录商城请求 
     */
    loginShoppingMallRequest: function() {
        var that = this;
        this.data.location = '北京市';
        var param = {
            sysUserId: that.data.userId,
            key: this.data.key,
            location: this.data.location,
        };
        var url = util.SHOPPING_MALL_BASE_URL + util.LOGIN_W_lOGIN;
        util.getDataJson(url, param, res => {
            console.log('登录商城请求 res:', res)
            if (res.data && res.data.code == '0000' && res.data.data != '') {
                wx.switchTab({
                    url: '../user/user',
                })
                wx.showToast({
                    icon: 'none',
                    title: '登录成功',
                })
            } else if (res.data.code == '0001') {
                wx.showToast({
                    icon: 'none',
                    title: '该用户未绑定商业公司',
                })
            } else if (res.data.code == '0003') {
                wx.showToast({
                    icon: 'none',
                    title: '二维码已经过期',
                })
            }else if (res.data.code == '0004') {
                wx.showToast({
                    icon: 'none',
                    title: '二维码已经被扫描过',
                })
            } else {
                wx.showToast({
                    icon: 'none',
                    title: '登录失败',
                })
            }
        })
    },

})