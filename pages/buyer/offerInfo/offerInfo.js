// pages/company/offerInfo/offerInfo.js
var util = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        orderId: '', //报价单Id
        offerInfoList: [], //报价列表信息
        userId: '', //用户Id
        enquiryOrderId: '', //询价单ID
        words: '', //报价单留言

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
        //获取报价信息
        this.getOfferInfoRequest();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

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

    // /**
    //  * 页面上拉触底事件的处理函数
    //  */
    // onReachBottom: function () {

    // },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    /**
     * 继续询价
     */
    againOfferAction: function () {
        console.log('继续询价')
    },

    /**
     * 查看报价信息
     */
    offerAction: function (e) {
        console.log('查看报价信息e:', e)
        var index = e.currentTarget.id;
        this.data.userId = this.data.offerInfoList.dataArray[index].sysUserId;
        this.data.enquiryOrderId = this.data.offerInfoList.dataArray[index].enquiryOrderId;
        var businessId = this.data.offerInfoList.dataArray[index].businessId;
        wx.navigateTo({
            url: '../offer/offer?businessId=' + businessId + '&sysUserId=' + this.data.userId + '&enquiryOrderId=' + this.data.enquiryOrderId + '&words=' + this.data.words,
        })
    },
    
    /**
     * 获取报价信息
     */
    getOfferInfoRequest: function() {
        var that = this;
        var param = { enquiryId: that.data.orderId, startPage: 1 };
        var url = util.BASE_URL + util.OFFER_ORDER_QUERY_OFFER_ORDER_BY_ENQUIRY_ID;
        util.getDataJson(url, param, res => {
            console.log('获取报价信息 res:', res)
            if (res.data && res.data.dataArray.length > 0) {
                res.data.enquiry_date_created = res.data.enquiry_date_created.substring(5, res.data.enquiry_date_created.length)
                that.setData({
                    offerInfoList: res.data,
                    words: res.data.words,
                })
            }
        })
    }

})