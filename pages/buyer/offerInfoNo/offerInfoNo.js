// pages/company/offerInfoNo/offerInfoNo.js
var util = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        orderId: '', //报价单Id
        offerInfoList: [], //报价列表信息
        errorMsg: '没有此类型的采购单哦！',
        errorImg: '/Images/error_icon.png',
        isDoubleClick: true, //防止多次点击
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.data.orderId = options.enquiryId;
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        this.getOfferInfoRequest();
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
     * 用户点击右上角分享
     */
    // onShareAppMessage: function () {
        // return {
        //     title: '您有新的询价单，请报价！',
        //     path: 'pages/AskPriceList/AskPriceList?enquiryOrderId=' + this.data.orderId,
        //     success: function (res) {
        //         console.log('分享成功')

        //     },
        //     fail: function (error) {
        //         console.log('分享失败')
        //     }
        // }
    // },

    /**
     * 转发
     */
    transmitAction: function () {
        console.log('转发')
        if (this.data.isDoubleClick){
            this.data.isDoubleClick = false;
            wx.navigateTo({
                url: '../SendPricePage/SendPricePage?enquiryOrderId=' + this.data.orderId,
            })
        }
    },

    /**
     * 获取报价信息
     */
    getOfferInfoRequest: function () {
        var that = this;
        var param = { enquiryId: that.data.orderId};
        var url = util.BASE_URL + util.OFFER_ORDER_QUERY_OFFER_ORDER_BY_ENQUIRY_ID2;
        util.getDataJson(url, param, res => {
            console.log('获取报价信息 res:', res)
            if (res.data && res.data.code == '0000' && res.data.data.length > 0) {
                that.setData({
                    offerInfoList: res.data.data,
                })
            } else if (res.data && res.data.code == '0000'){
                that.setData({
                    errorMsg: res.data.msg,
                })
            }
        })
    }

})