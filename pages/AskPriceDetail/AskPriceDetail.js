var util = require('../../utils/util.js')
var app = getApp()
var errorUtil = require('../../template/AccountUnuse.js')

Page({

    /**
     * 扫码进入页面
     * 页面的初始数据
     */
    data: {
        //页面状态 1是账号停用页面，2是正常数据页面，3加载失败
        pageNum: 9,
        drugList: [],
        medicinalTypeNum: '',
        doctorImg: '',
        userId: '',
        enquiryOrderId: '', //运货单ID
        orderId: '', 
        errortxt: '二维码错误', //错误提示
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        that.data.userId = wx.getStorageSync('USERID')
        
        
        // if (that.data.userId){
        //   var userInfo = wx.getStorageSync('UserInfo')

        //   //读取微信扫码得到数据
        //   if (options) {
        //     console.log('options', options)
        //     var codeparams = decodeURIComponent(options.q);
        //     console.log('----微信读取------', codeparams)
        //     var askpriceId = codeparams.match(/enquiryOrderId=(\S*)/)[1];
        //     console.log('----询价单id------', askpriceId)
        //     that.setData({
        //       doctorImg: userInfo.avatarUrl,
        //       enquiryOrderId: askpriceId
        //     })
        //     //截取到扫码信息就发起请求
        //     if (askpriceId) {
        //       that.getDrugInfo();
        //     }
        //   }
        // }else{
        app.GetUserInfo(function (userId, userInfo) {
            //更新数据
            console.log("userInfo:", userInfo)
            console.log("avatarUrl:", userInfo.avatarUrl)
            that.setData({
                doctorImg: userInfo.avatarUrl,
                userId: userId
            })
            if (options) {
                console.log('options', options)
                var codeparams = decodeURIComponent(options.q);
                console.log('----微信读取------', codeparams)
                if (typeof codeparams == 'undefined'){
                    that.setData({
                        pageNum: 1,
                    })
                }else{
                    var askpriceId = codeparams.match(/enquiryOrderId=(\S*)/)[1];
                    console.log('----询价单id------', askpriceId)
                    that.setData({
                        doctorImg: userInfo.avatarUrl,
                        enquiryOrderId: askpriceId
                    })
                    //截取到扫码信息就发起请求
                    if (askpriceId) {
                        that.getDrugInfo();
                    }
                }
            }
        })
        // }
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
        // this.getDrugInfo();
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
    onShareAppMessage: function (e) {
        var that = this;

        //更新分享
        that.UpdataShare()
        return {
            title: '您有新的询价单，请报价！',
            path: 'pages/impower/impower?enquiryOrderId=' + that.data.enquiryOrderId + '&userType=2',
            success: function (res) {
                console.log('分享成功')

            },
            fail: function (error) {
                console.log('分享失败')
            }
        }

    },



    //通知后台分享了
    UpdataShare: function () {
        var that = this
        var url = util.BASE_URL + util.UPLOAD_SHARE;
        var param = { enquiryOrderId: that.data.enquiryOrderId }
        util.getDataJson(url, param, res => {
            console.log("分享:", res)
        })

    },
    //页面按钮的分享
    onShare: function () {
        this.onShareAppMessage();
    },

    //打电话
    calling: function () {
        var that = this
        wx.makePhoneCall({
            phoneNumber: that.data.receiverTell, //此号码并非真实电话号码，仅用于测试  
            success: function () {
                console.log("拨打电话成功！")
            },
            fail: function () {
                console.log("拨打电话失败！")
            }
        })
    },

    //拨打客服电话
    serviceClick: function () {
        console.log('拨打客服电话')
    },

    /**
     * 获取药品信息
     */
    getDrugInfo: function () {
        var that = this;
        wx.showLoading({
            title: '加载中...',
        })
        var param = { sysUserId: that.data.userId, enquiryOrderId: that.data.enquiryOrderId };
        var url = util.BASE_URL + util.ENQUIRY_ORDER_DETAIL;
        util.getDataJson(url, param, res => {
            console.log("药品信息:", res)
            wx.hideLoading();
            if (res.data && res.data.code == '0000') {
                that.setData({
                    medicinalTypeNum: res.data.content.length,
                    drugList: res.data.content,
                    pageNum: 2,
                })
            } else if (res.data && res.data.code == '2003'){
                this.setData({
                    errortxt: '询价单不存在', //错误提示
                    pageNum: 1
                })
            } else if (res.statusCode == 404) {
                that.setData({ pageNum: 3 })
            } else {
                that.setData({ 
                    pageNum: 1,
                    errortxt: '二维码错误', //错误提示
                 })
            }
        })
    },

    /**
     * 重新加载
     */
    reloadAction: function () {
        this.getDrugInfo();
    }

})