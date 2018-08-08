// pages/ceshi/ceshi.js
var checkArr = ""
var app = getApp
Page({

    /**
     * 页面的初始数据
     */
    data: {
        zy_items: [
            { title: "我认识的医药公司", name: '微信好友／群', value: '0', checked: true },
        ],
        items: [
            { title: "同时发布到致医商城", name: '致医商城', value: '0', checked: false },
        ],

        enquiryOrderId: '', //分享询价单ID
    },
    /**
     * 选择判断
     */
    checkboxChange: function (e) {
        console.log("信息：", e.detail.value)
        var that = this;
        var items = this.data.items;
        checkArr = e.detail.value;
        for (var i = 0; i < items.length; i++) {
            if (checkArr.indexOf(i + "") != -1) {
                items[i].checked = true;
            } else {
                items[i].checked = false;
            }
        }
        this.setData({
            items: items,
        })
    },
    /**
     *  选好了，发送
     */
    selectSend: function (e) {
        this.onShareAppMessage(e);
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.data.enquiryOrderId = options.enquiryOrderId;
        //   console.log(this.data.enquiryOrderId)
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
        console.log("we", "");
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
            //   path: 'pages/AskPriceList/AskPriceList?enquiryOrderId=' + that.data.enquiryOrderId + '&userType=2', 
            path: 'pages/impower/impower?enquiryOrderId=' + that.data.enquiryOrderId + '&userType=2',
            success: function (res) {
                console.log('分享成功', checkArr)
                wx.navigateTo({
                    //分享成功后跳转
                    url: '/pages/ShareSelectCompany/ShareFinish/ShareFinish?stus=' + checkArr,
                })
            },
            fail: function (error) {
                console.log('分享失败')
            }
        }
    },
})