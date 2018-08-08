// pages/company/register/register.js
/**
 * 1, 未绑定企业
 * wx.setStorageSync('USERINFOSTATUS', 0)
 * //0.用户未注册
 * wx.setStorageSync('USERINFOREGISTER', 0)
 * 2, 绑定企业
 * wx.setStorageSync('USERINFOSTATUS', 1)
 * 0.用户已注册
 * wx.setStorageSync('USERINFOREGISTER', 1)
 */
var stringUtil = require('../../utils/stringUtil.js')
var util = require("../../utils/util.js")
var phoneInput
var codeInput

Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgUrl: '/Images/buyer_icon.png', //分类图标
        userStatus: 0,
        mobileNumber: '', //手机号
        authSecond: 0, //验证码时间
        authCode: '', //验证码
        timeInterval: {}, //验证码定时器
        userId: '', //用户ID
        hintTxt: '', //提示语
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.data.userStatus = wx.getStorageSync('USERSTATUS')
        console.log('userStatus:', this.data.userStatus)
        if (this.data.userStatus == 2) {
            this.setData({
                userStatus: this.data.userStatus,
                imgUrl: '/Images/seller_icon.png',
                hintTxt: '药报单，客户需求一目了然',
            })
        } else {
            this.setData({
                userStatus: this.data.userStatus,
                imgUrl: '/Images/buyer_icon.png',
                hintTxt: '药品报单、比价，方便快捷',
            })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.data.userId = wx.getStorageSync('USERID');
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    /**
     * 请输入手机号
     */
    mobileNumberAction: function (e) {
        console.log('e:', e)
        var that = this;
        if (stringUtil.phoneNumberInspect(e.detail.value) == '') {
            setTimeout(function () {
                that.setData({ mobileNumber: '' })
            }, 500)
            return;
        } else {
            this.setData({
                mobileNumber: stringUtil.phoneNumberInspect(e.detail.value)
            })
        }
        var phone = e.detail.value.replace(/-/g, '')
        this.data.mobileNumber = phone;
    },

    /**
     * 验证码输入监听
     */
    codeInputAction: function (e) {
        console.log('e:', e)
        codeInput = e.detail.value
        this.setData({ authCode: e.detail.value })
    },

    /**
     * 清空验证码
     */
    deleteAuthCodeAction: function () {
        console.log('清空验证码')
        this.setData({ authCode: '' })
    },

    /**
     * 重新获取验证码
     */
    arginAuthCodeAction: function () {
        var that = this;
        phoneInput = this.data.mobileNumber//监听得到手机号
        console.log('mobileNumber:', this.data.mobileNumber)
        if (this.data.mobileNumber == '' || this.data.mobileNumber.length < 11) {
            wx.showToast({
                icon: "none",
                title: '请输入手机号',
            })
            return;
        } else if (that.data.authSecond != 0) {
            console.log('无法点击')
            //解决发送验证码多次点击，出现负数的问题
            this.setData({
                disabled: false
            })
        } else {
            var url = util.BASE_URL + util.SYSUSER_SENDCODE
            var param = { phone: phoneInput }
            util.getDataJson(url, param, res => {
                if (res.data.code == "0000") {
                    console.log('res:', res)
                    wx.showToast({
                        icon: "none",
                        title: '发送成功！',
                    })
                } else {
                    wx.showToast({
                        icon: "none",
                        title: '发送失败！',
                    })
                }
            })
        }
        if (that.data.authSecond == 0) {
            var timeInterval = setInterval(function () {
                that.setData({
                    authSecond: --that.data.authSecond,
                })
                if (that.data.authSecond == 0) {
                    clearInterval(timeInterval);
                }
            }, 1000)
            that.setData({
                authSecond: 60,
            })
        }
    },

    /**
     * 注册
     */
    registerAction: function (e) {
        var cellNumber = e.detail.value.cellNumber;
        var code = e.detail.value.code;
        if (cellNumber != '' && code != '') {
            console.log('注册')
            //
            var url = util.BASE_URL + util.SYSUSER_REG
            var param = { phone: phoneInput, sysUserId: this.data.userId, code: codeInput }
            util.getDataJson(url, param, res => {
                console.log("注册 res:", res)
                if (res.data.code == "0000") {
                    wx.setStorageSync('phone', phoneInput)
                    if (res.data.code == "0000") {
                        wx.showToast({
                            icon: "none",
                            title: '注册成功',
                        })
                    }
                    wx.setStorageSync('USERINFOREGISTER', 1)
                    var userInfoStatus = wx.getStorageSync('USERINFOSTATUS');
                    var userOldData = wx.getStorageSync('USEROLDDATA');
                    if (userOldData == 1) {
                        wx.redirectTo({
                            url: '../company/fillInCompany/fillInCompany?jumpType=3&provinceName=&companyInfo=',
                        })
                    } else if (userInfoStatus != 1) {
                        wx.redirectTo({
                            url: '../bindCompany/bindCompany',
                        })
                    } else {
                        wx.navigateBack();
                    }
                } else if (res.data.code == "3005") {//该手机号已注册
                    wx.showToast({
                        icon: "none",
                        title: '该手机号已注册',
                    })
                } else if (res.data.code == "3006") {//验证码已经过期
                    wx.showToast({
                        icon: "none",
                        title: '验证码已经过期',
                    })
                } else if (res.data.code == "3007") {//验证码错误
                    wx.showToast({
                        icon: "none",
                        title: '验证码错误',
                    })
                } else {
                    wx.showToast({
                        icon: "none",
                        title: '注册失败',
                    })
                    return;
                }
            })
        }
    }

})