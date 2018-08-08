// pages/branch/branch.js
/**
 * 0:商业用户
 * wx.setStorageSync('USERSTATUS', 2)
 * 1：诊所用户
 * wx.setStorageSync('USERSTATUS', 1)
 */


Page({

    /**
     * 页面的初始数据
     */
    data: {
        isDoubleClick: true, //防止多次点击
        userType: 0,
        enquiryOrderId: '', //询价单ID
        isShowPage: true, //如果选择了角色不显示页面内容 isShowPage: true, 没有选择角色isShowPage: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('options;', options)
        this.data.enquiryOrderId = options.enquiryOrderId;
        this.data.userType = options.userType;
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        var that = this;
        var state = wx.getStorageSync('USERSTATUS')
        if(state != 1 && state != 2){
            this.setData({ isShowPage: false })
        }else{
            this.setData({ isShowPage: true })
        }
        
        // wx.setStorageSync('enquiryOrderId', that.data.enquiryOrderId)
        // wx.setStorageSync('userType', '2')
        // if (this.data.userType == 2 && state == 2){
        //     wx.switchTab({
        //         url: '../AskPriceList/AskPriceList',
        //     })
        // }else{
        //     if (state == 1) {
        //         wx.redirectTo({
        //             url: '../buyer/enquiry/enquiry',
        //         })
        //     } else if (state == 2) {
        //         wx.switchTab({
        //             url: '../AskPriceList/AskPriceList',
        //         })
        //     }
        // }
        
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
     * 卖家
     */
    sellerAction: function () {
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            wx.setStorageSync('USERSTATUS', 2)
            wx.switchTab({
                url: '../AskPriceList/AskPriceList',
            })
        }
    },

    /**
     * 买家
     */
    buyerAction: function () {
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            wx.setStorageSync('USERSTATUS', 1)
            wx.redirectTo({
                url: '../buyer/enquiry/enquiry',
            })
        }
    }
})