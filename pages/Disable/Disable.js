// pages/Disable/Disable.js
var util = require('../../utils/util.js')
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        errorMsg: '该账号已被停用！请及时联系客服!',
        errorImg: '/Images/cannotuse.png',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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
        this.getCompanyInfo();
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

    callPhoneAction: function (e) {
        console.log("e:", e)
        wx.makePhoneCall({
            phoneNumber: '4006669196' //仅为示例，并非真实的电话号码
        })
    },

    /**
       * 企业信息查询
       */
    getCompanyInfo: function () {
        var that = this;
        var userId = wx.getStorageSync('USERID')
        app.getCompanyState(userId, res => {
            if (res.data.code == '0000') {
                //审核通过或未审核
                wx.switchTab({
                    url: '../AskPriceList/AskPriceList',
                })
            }
            // else {
            // that.errorExceptionDispose(res)
            // }
        })
    },

    /**
     * 错误,异常处理
     */
    // errorExceptionDispose: function (res) {
    //     if (res.data.code == '0005') {
    //         //审核未通过
    //         this.setData({ pageNo: 1 })
    //         app.globalData.auditState = 2;
    //         app.globalData.unapproveContent = res.data.content;
    //         wx.switchTab({
    //             url: '../UserCenter/UserCenter'
    //         })
    //     } else if (res.data.code == '0003') {
    //         //企业停用
    //         wx.navigateTo({
    //             url: '../Disable/Disable'
    //         })
    //     } else if (res.data.code == '0004') {
    //         //没有企业新信息
    //         wx.navigateTo({
    //             url: '../EmptyCompanyInfo/EmptyCompanyInfo?jumpTpye=0'
    //         })
    //     }
    // },
})