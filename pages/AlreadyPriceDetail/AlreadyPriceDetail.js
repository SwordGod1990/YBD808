// pages/AlreadyPriceDetail/AlreadyPriceDetail.js
var util = require('../../utils/util.js')
var app = getApp()
var canuseUtil = require('../../template/AccountUnuse.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userId: '', //用户Id
        orderInfo: '', //订单信息
        isOfferList: [], //已报价药品集合
        noOfferList: [], //未报价药品集合
        isOfferNum: '', //已报价药品数量
        noOfferNum: '', //未报价药品数量
        totalPrice: '', //总价 
        freightNumber: "",//运费
        favourable: '', //卖家留言
        pageNum: 2,
        offer: 1,
        isShowView: true, //true:展示未报价部分 false：隐藏未报价部分
        offerOrderid: '', //订单ID
        animationData: 0, //滑动距离
    },

    /**
       * 重新加载
       */
    reloadAction: function () {
        var that = this;
        that.QueryPriceDetail();
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this
        that.data.userId = wx.getStorageSync('USERID')
        // showView: (options.showView == "true" ? true : false)
        console.log('itempriceid:', options.itempriceId)
        if (options.itempriceId) {
            that.setData({
                offerOrderid: options.itempriceId
            })
            // 获取报单详情
            that.QueryPriceDetail();
        } 
    },

    /**
      * 获取报单详情
      */
    QueryPriceDetail: function () {
        var that = this
        wx.showLoading({
            title: '加载中...',
        })
        var param = { sysUserId: that.data.userId, offerOrderId: that.data.offerOrderid }
        var url = util.BASE_URL + util.DETAIL_PRICE_INFO;
        util.getDataJson(url, param, res => {
            console.log("已报价报单详情:", res)
            if (res.data && res.data.code == '0000') {
                var tempOffer = res.data.content.offer;
                if (tempOffer.clinicName.length > 10) {
                    tempOffer.clinicName = tempOffer.clinicName.substring(0, 10);
                } 
                //时间处理(不要本年)
                if (res.data.content.offer.dateCreated.substring(0, 4) > 2017) {
                    tempOffer.dateCreated = tempOffer.dateCreated.substr(5, 11);
                } 
                if (tempOffer.consigneePhone != '') {
                    tempOffer.consigneePhone1 = tempOffer.consigneePhone.substring(0, 3) + '-' + tempOffer.consigneePhone.substring(3, 7) + '-' + tempOffer.consigneePhone.substring(7, 11)
                } else {
                    tempOffer.consigneePhone1 = '';
                }
                //收货地址
                tempOffer.receivingAddr = tempOffer.province + tempOffer.city + tempOffer.area + tempOffer.consigneeAddress
                that.setData({
                    orderInfo: res.data.content.offer,
                    isOfferNum: res.data.content.isOfferNum,
                    isOfferList: res.data.content.isOffer,
                    totalPrice: res.data.content.offer.totalPrice,
                    freightNumber: res.data.content.offer.freight,
                    favourable: res.data.content.offer.busWords,
                    noOfferList: res.data.content.noOffer,
                    noOfferNum: res.data.content.noOfferNum,
                    pageNum: 2,
                })
            } else {
                //加载失败
                that.setData({ pageNum: 1 })
            }
        })
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

    // 点击查看未报价药品
    isShowAciton: function (e) {
        console.log('e:', e)
        var that = this;
        that.setData({
            isShowView: (!that.data.isShowView)
        })

        if (!that.data.isShowView){
            var animation = wx.createAnimation({
                transformOrigin: "50% 50%",
                duration: 500,
                timingFunction: "ease",
                delay: 0
            })
            this.animation = animation
            animation.translateY(-50).step({ duration: 500 })
            animation.translateY(0).step({ duration: 500 })
            this.setData({
                animationData: this.animation.export()
            })
        }else{
            var animation = wx.createAnimation({
                transformOrigin: "50% 50%",
                duration: 500,
                timingFunction: "ease",
                delay: 0
            })
            this.animation = animation
            animation.translateY(0).step({ duration: 500 })
            this.setData({
                animationData: this.animation.export()
            })  
        }
    },

    //拨打客服电话
    serviceClick: function () {
        console.log('拨打客服电话')
    },

    //拨打电话
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
    }
})