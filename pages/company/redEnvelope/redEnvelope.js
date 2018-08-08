// pages/company/redEnvelope/redEnvelope.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        redEnvelopeList: [1, 2, 3, 4, 5], //红包列表
        isDoubleClick: true, //防止多次点击
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

    },

    /**
     * 活动说明
     */
    activeExplainAction: function () {
        console.log('活动说明')
    },

    /**
     * 订单详情
     */
    redEnvelopeAction: function () {
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            wx.navigateTo({
                url: '../redEnvelopeDetail/redEnvelopeDetail?orderId=',
            })
        }
    },

    /**
     * 领取红包
     */
    receiveRedEnvelopeAction: function () {
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            wx.navigateTo({
                url: '../redEnvelopeExplain/redEnvelopeExplain',
            })
        }
    }

})