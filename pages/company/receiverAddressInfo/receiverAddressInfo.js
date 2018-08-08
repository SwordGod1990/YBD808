// pages/company/receiverAddressInfo/receiverAddressInfo.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userLocation: '', //用户所在区域
        inputValue: ''
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
     * 保存用户信息
     */
    saveUserInfoAction: function (e) {
        console.log('e:', e)
        var userName = e.detail.value.userName;
        var userCall = e.detail.value.userCall;
        var userAddr = e.detail.value.userAddr;

        console.log('userName:', userName, 'userCall:', userCall, 'userAddr:', userAddr)
    },

    sureAction: function (e) {
        console.log('e:', e)
        var inputContent = e.datail.value.inputContent;
    }
})