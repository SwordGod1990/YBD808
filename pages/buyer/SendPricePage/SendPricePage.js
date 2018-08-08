// pages/ShareSelectCompany/SendPricePage/SendPricePage.js
var app = getApp
var util = require("../../../utils/util.js")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        drugList: [],
        isDoubleClick: true, //防止多次点击
        orderId: '', //询价单Id
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.data.orderId = options.enquiryOrderId;
        //获取询价药品信息
        this.getEnquiryInfoRequest();
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
        this.data.isDoubleClick = true;
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
        var that = this;
        //更新分享
        wx.updateShareMenu({
            withShareTicket: true,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        })
        return {
            title: '您有新的询价单，请报价！',
            //在此设置需要分享的页面
            path: 'pages/impower/impower?enquiryOrderId=' + that.data.orderId + '&userType=2',
            success: function (res) {
                console.log('分享成功', res)
                wx.reLaunch({
                    //分享成功后跳转
                    url: '../enquiry/enquiry',
                })
            },
            fail: function (error) {
                console.log('分享失败')
            }
        }
    },

    /**
     * 获取询价单信息
     */
    getEnquiryInfoRequest: function () {
        //获取询价药品信息
        var url = util.BASE_URL + util.OFFER_ORDER_QUERY_OFFER_ORDER_BY_ENQUIRY_ID3
        var param = { enquiryId: this.data.orderId }
        util.getDataJson(url, param, res => {
            console.log("res", res)
            this.setData({
                drugList: res.data.data
            })
        })
    },

    /**
     * 发送给医药公司
     */
    SendCompanyAction: function () {
        this.onShareAppMessage();
    },
    /**
     * 稍后再说
     */
    LaterOnAction: function () {
        wx.reLaunch({
            url: '../enquiry/enquiry',
        })
    }
})