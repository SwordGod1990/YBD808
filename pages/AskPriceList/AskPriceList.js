// pages/AskPriceList/AskPriceList.js
var util = require('../../utils/util.js')

var app = getApp()
var canuseUtil = require('../../template/AccountUnuse.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        offerWaitList: [], //待报价集合
        offerCompleteList: [], //已报价集合
        offerIgnoreList: [], //已忽略报价集合
        tabPage1: 1, //待报价 2：重新加载
        tabPage2: 1, //已报价 2：重新加载
        tabPage3: 1, //已忽略 2：重新加载
        currentTab: '0', //当前tab显示的位置
        navbar: ['待报价', '已报价', '已忽略'], //tab文字
        nubCount: '', //待报价条数
        userId: '', //用户Id
        maxtoastHidden: true, //提示报价人数达到上限
        pageWaitStart: 1, //待报价查询起始页码
        pageCompleteStart: 1, //已报价查询起始页码
        pageIgnoreStart: 1, //已忽略查询起始页码
        itemCount: 10, //每页请求的条数
        enquiryOrderId: '', //分享进入是报价单Id
        offorderid: '', //创建后创建的报价单Id
        Toasttext: '', //Toast文字(报价商家已达上限， 不可报价/询价单已失效)
        isFirst: false, //是否第一次进入 true: 第二次打开
        jumpType: 2, //跳转页面 1：分享进入小程序 2：搜索进入小程序
        errorMsg: '企业信息填写后，才可查看供货单 !',
        errorImg: '/Images/cannotuse.png',
        pageNo: 2, //1：没有填写企业信息
        showLoading: false, //加载中动画
        isDoubleClick: true, //true可点击、防止多次点击
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('onload---------------------options:', options)
        var that = this
        that.data.userId = wx.getStorageSync('USERID')
        var shareType = wx.getStorageSync('userType')
        if (shareType == '2'){
            this.data.enquiryOrderId = wx.getStorageSync('enquiryOrderId')
        }else{
            that.data.enquiryOrderId = options.enquiryOrderId;
            
        }
        
        //用户属于商业公司
        wx.setStorageSync('USERSTATUS', 2)

        // if (that.data.userId == '') {
        //     app.GetUserInfo(function (userid, userInfo) {
        //         console.log('userid:', userid)
        //         that.data.userId = userid;
        //         if (userid) {
        //             that.initDataView();
        //         }
        //     })
        // } else {
        that.initDataView();
        // }

    },

    /**
     * 初次进入页面加载数据
     */
    initDataView: function () {
        var that = this;
        //在手机上请求企业信息比较慢，需要修改请求方式---------------------
        if (that.data.enquiryOrderId) {
            //分享进入
            that.data.jumpType = 1;
            //创建报价单，关联数据
            that.CreatOrder()
        } else {
            that.data.jumpType = 2;
            that.getSwitchTabData(1);
            // that.getCompanyInfo();
        }
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
        var that = this
        that.data.isDoubleClick = true;
        if (that.data.userId != '' && that.data.isFirst) {
            //用户提交信息后不用请求企业状态
            // if (app.globalData.jumpType == 0) {
                //审核通过或未审核
                // app.globalData.jumpType = -1;
                // if (that.data.jumpType == 1) {
                    // that.isBooleOffer();
                // } else {
                    that.getSwitchTabData(1);
                // }
            // } else {
                // if (app.globalData.auditState == 2) {
                //     wx.switchTab({
                //         url: '../UserCenter/UserCenter'
                //     })
                // } else {
                //     that.getCompanyInfo();
                // }
            // }
        }
        //进入之后修改isFirst状态
        that.data.isFirst = true;
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
        console.log('下拉刷新')
        this.refresh();
        // var that = this
        // that.data.pageStart = 1;
        // //是否填写企业信息，true是填写完整(请求数据)，否则跳转页面(我的页面)
        // // if (app.globalData.auditState == 1) {
        // that.getSwitchTabData(1);
        // // }
    },

    refresh: function () {
        var that = this

        that.data.pageIgnoreStart = 1;
        that.data.pageCompleteStart = 1;
        that.data.pageWaitStart = 1;
        that.getSwitchTabData(1);
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        console.log('上拉加载')
        this.loadMore();
    },

    loadMore: function () {
        console.log('上拉加载')
        var that = this
        var start = 2;
        if (that.data.currentTab == 1) {
            //已报价的数据请求
            start = that.data.pageCompleteStart + 1;
            that.getOfferComplete(start, 1)
        } else if (that.data.currentTab == 2) {
            //已忽略的数据请求
            start = that.data.pageIgnoreStart + 1;
            that.getOfferIgnore(start, 2)

        } else {
            //待报价的数据请求
            start = that.data.pageWaitStart + 1;
            that.getOfferWait(start, 0);
        }
    },


    /**
     * tap点击事件
     */
    navbarTab: function (e) {
        var that = this;
        console.log(' tap点击事件:', e.currentTarget.id)
        that.setData({
            currentTab: e.currentTarget.id,
        })
        //点击tab获取数据
        that.getSwitchTabData(1);
    },

    /**
     * 点击tab获取数据
     */
    getSwitchTabData: function (start) {
        var that = this;
        that.setData({ showLoading: true })
        if (that.data.currentTab == 1) {
            //已报价的数据请求
            that.getOfferComplete(start, 1)
        } else if (that.data.currentTab == 2) {
            //已忽略的数据请求
            that.getOfferIgnore(start, 2)
        } else {
            //待报价的数据请求
            that.getOfferWait(start, 0);
        }
    },

    /**
     * 待报价忽略点击
     */
    ignoreAction: function (e) {
        var that = this
        console.log('忽略点击', e.target.dataset.index)
        var ignoreId = that.data.offerWaitList[e.target.dataset.index].offerOrderId
        wx.showModal({
            content: '确认忽略询价单吗',
            confirmText: '确定',
            confirmColor: '#EB3E2D',
            cancelColor: '#333333',
            success: function (res) {
                if (res.confirm) {
                    console.log('确定忽略')
                    that.sureIgnoreOrder(ignoreId)
                } else if (res.cancel) {
                    console.log('取消忽略测试已报价详情')
                }
            },
        })
    },

    /**
     * 创建报价单
     */
    CreatOrder: function () {
        var that = this
        var url = util.BASE_URL + util.Add_OrderId;
        var param = { sysUserId: that.data.userId, enquiryOrderId: that.data.enquiryOrderId }
        console.log('创建报价单userId----', that.data.userId)
        console.log('创建报价单enquiryOrderId----', that.data.enquiryOrderId)

        util.getDataJson(url, param, res => {
            console.log("创建报价单:", res)
            if (res.data && res.data.code == '0000') {
                that.setData({
                    offorderid: res.data.content.offerOrderId
                })
                wx.setStorageSync('BACKORDERID', res.data.content.offerOrderId)
                //审核通过
                that.isBooleOffer();

                //查企业信息状态，查该报价单状态
                // app.getCompanyState(that.data.userId, res => {
                //     // if (res.data.code == '0000') {
                //     //     //审核通过
                //     //     that.isBooleOffer();
                //     // } else {
                //     //     that.errorExceptionDispose(res)
                //     // }
                // })
            }
        })
    },

    /**
       * 确认忽略该报价单
       */
    sureIgnoreOrder: function (orderID) {
        var that = this
        var param = { sysUserId: that.data.userId, offerOrderId: orderID }
        var url = util.BASE_URL + util.IGNORE_ORDER;
        util.getDataJson(url, param, res => {
            console.log("忽略报单信息:", res)
            if (res.data && res.data.code == '0000') {
                wx.showToast({
                    title: '忽略成功',
                })
                //刷新数据
                that.getSwitchTabData(1)
            }
        })
    },

    //待报价报价按钮点击 
    offerAction: function (e) {
        var that = this
        console.log('待报价item点击', e.currentTarget.dataset.index)
        if (that.data.isDoubleClick) {
            that.data.isDoubleClick = false;
            var index = e.currentTarget.dataset.index
            var itempriceId = that.data.offerWaitList[index].offerOrderId
            console.log('待报价itempriceId', itempriceId)
            that.WhetherCanOrder(itempriceId)
        }
    },

    //已报价item点击
    offerCompleteAction: function (e) {
        var that = this
        console.log('已报价item点击', e.currentTarget.dataset.index)
        if (that.data.isDoubleClick) {
            that.data.isDoubleClick = false;
            var index = e.currentTarget.dataset.index
            var itempriceId = that.data.offerCompleteList[index].offerOrderId
            console.log('已报价itempriceId', itempriceId)
            wx.navigateTo({
                url: '../AlreadyPriceDetail/AlreadyPriceDetail?itempriceId=' + itempriceId,
            })
        }
    },

    //已忽略报价点击 offerIgnoreList
    ignoreofferAction: function (e) {
        var that = this
        console.log('待报价item点击', e.currentTarget.dataset.index)
        if (that.data.isDoubleClick) {
            that.data.isDoubleClick = false;
            var index = e.currentTarget.dataset.index
            var itempriceId = that.data.offerIgnoreList[index].offerOrderId
            console.log('待报价itempriceId', itempriceId)
            that.WhetherCanOrder(itempriceId)
        }
    },

    /**
     * 待报价集合 
     */
    getOfferWait: function (start, state) {
        var that = this;
        var param = { sysUserId: that.data.userId, pageStart: start, pageNum: that.data.itemCount, isOffer: state };
        var url = util.BASE_URL + util.ALL_OFFER_ORDER;
        util.getDataJson(url, param, res => {
            console.log('待报价：', res)
            wx.stopPullDownRefresh();
            that.setData({ pageNo: 2 })
            that.setData({ showLoading: false })
            if (res.data && res.data.code == '0000' && res.data.content.offer.length >= 0) {
                //设置待报价数量
                if (res.data.content.totalNum > 99) {
                    that.setData({
                        nubCount: '99+',
                    })
                } else {
                    that.setData({
                        nubCount: res.data.content.totalNum,
                    })
                }
                var temp = res.data.content.offer;
                for (var i = 0; i < temp.length; i++) {
                    //诊所名称大于10个字只显示10个字
                    if (temp[i].clinicName.length > 10) {
                        temp[i].clinicName = temp[i].clinicName.substr(0, 10) + '...'
                    }
                    //药品信息列表只显示3种
                    // if (temp[i].offderInfoDetail.length > 3) {
                    //     temp[i].offderInfoDetail = temp[i].offderInfoDetail.slice(0, 3)
                    // }
                    //出生日期本年份的不显示年
                    if (temp[i].publishDate.substring(0, 4) > 2017) {
                        temp[i].publishDate = temp[i].publishDate.substr(5, 11)
                    }
                }
                if (start == 1) {
                    that.setData({ offerWaitList: res.data.content.offer })
                    if (res.data.content.offer.length == 0) {
                        that.setData({ tabPage2: 1 })
                    }
                } else {
                    that.setData({
                        offerWaitList: that.data.offerWaitList.concat(res.data.content.offer),
                    })
                }
                console.log('offerWaitList', that.data.offerWaitList)
            } else if (res.data && (res.data.code == '0005' || res.data.code == '0004' || res.data.code == '0003')) {
                that.errorExceptionDispose(res)
            } else if (res.statusCode == 404) {
                that.setData({ tabPage2: 2 })
            } else {
                that.setData({ tabPage2: 1 })
            }
        })
    },

    /**
     * 获取已报价集合
     */
    getOfferComplete: function (start, state) {
        var that = this;
        var param = { sysUserId: that.data.userId, pageStart: start, pageNum: that.data.itemCount, isOffer: state };
        var url = util.BASE_URL + util.ALL_OFFER_ORDER;
        util.getDataJson(url, param, res => {
            console.log('已报价：', res)
            wx.stopPullDownRefresh();
            that.setData({ pageNo: 2 })
            that.setData({ showLoading: false })
            if (res.data && res.data.code == '0000' && res.data.content.offer.length >= 0) {
                var temp = res.data.content.offer;
                for (var i = 0; i < temp.length; i++) {
                    //诊所名称大于10个字只显示10个字
                    if (temp[i].clinicName.length > 10) {
                        temp[i].clinicName = temp[i].clinicName.substr(0, 10) + '...'
                    }
                    //药品信息列表只显示3种
                    // if (temp[i].offderInfoDetail.length > 3) {
                    //     temp[i].offderInfoDetail = temp[i].offderInfoDetail.slice(0, 3)
                    // }
                    //出生日期本年份的不显示年
                    if (temp[i].publishDate.substring(0, 4) > 2017) {
                        temp[i].publishDate = temp[i].publishDate.substr(5, 11)
                    }
                }
                if (start == 1) {
                    that.setData({ offerCompleteList: res.data.content.offer })
                    if (res.data.content.offer.length == 0) {
                        that.setData({ tabPage2: 1 })
                    }
                } else {
                    that.setData({
                        offerCompleteList: that.data.offerCompleteList.concat(res.data.content.offer),
                    })
                }
            } else if (res.data && (res.data.code == '0005' || res.data.code == '0004' || res.data.code == '0003')) {
                that.errorExceptionDispose(res)
            } else if (res.statusCode == 404) {
                that.setData({ tabPage2: 2 })
            } else {
                that.setData({ tabPage2: 1 })
            }
        })
    },

    /**
     * 已忽略报价单集合 
     */
    getOfferIgnore: function (start, state) {
        var that = this;
        var param = { sysUserId: that.data.userId, pageStart: start, pageNum: that.data.itemCount, isOffer: state };
        var url = util.BASE_URL + util.ALL_OFFER_ORDER;
        util.getDataJson(url, param, res => {
            console.log('已忽略：', res)
            wx.stopPullDownRefresh();
            that.setData({ pageNo: 2 })
            that.setData({ showLoading: false })
            if (res.data && res.data.code == '0000' && res.data.content.offer.length >= 0) {
                var temp = res.data.content.offer;
                for (var i = 0; i < temp.length; i++) {
                    //诊所名称大于10个字只显示10个字
                    if (temp[i].clinicName.length > 10) {
                        temp[i].clinicName = temp[i].clinicName.substr(0, 10) + '...'
                    }
                    //药品信息列表只显示3种
                    // if (temp[i].offderInfoDetail.length > 3) {
                    //     temp[i].offderInfoDetail = temp[i].offderInfoDetail.slice(0, 3)
                    // }
                    //出生日期本年份的不显示年
                    if (temp[i].publishDate.substring(0, 4) > 2017) {
                        temp[i].publishDate = temp[i].publishDate.substr(5, 11)
                    }
                }
                if (start == 1) {
                    that.setData({ offerIgnoreList: res.data.content.offer })
                    if (res.data.content.offer.length == 0) {
                        that.setData({ tabPage3: 1 })
                    }
                } else {
                    that.setData({
                        offerIgnoreList: that.data.offerIgnoreList.concat(res.data.content.offer),
                    })
                }
            } else if (res.data && (res.data.code == '0005' || res.data.code == '0004' || res.data.code == '0003')) {
                that.errorExceptionDispose(res)
            } else if (res.statusCode == 404) {
                that.setData({ tabPage3: 2 })
            } else {
                that.setData({ tabPage3: 1 })
            }
        })
    },

    /**
       * 是否可以报价
       */
    WhetherCanOrder: function (itempriceId) {
        var that = this;

        that.data.userId = wx.getStorageSync('USERID')
        var param = { sysUserId: that.data.userId, offerOrderId: itempriceId }
        var url = util.BASE_URL + util.CAN_ORDER;
        util.getDataJson(url, param, res => {
            console.log("是否可以报价:", res)
            that.data.isDoubleClick = true;
            if (res.data && res.data.code == '2012') {
                that.setData({
                    maxtoastHidden: false,
                    Toasttext: '报价商家已达上限,不可报价',
                })
                setTimeout(function () {
                    that.setData({
                        maxtoastHidden: true,
                        Toasttext: '',
                    })
                }, 2000)
            } else if (res.data && res.data.code == '2011') {
                that.setData({
                    maxtoastHidden: false,
                    Toasttext: '询价单已失效',
                })
                setTimeout(function () {
                    that.setData({
                        maxtoastHidden: true,
                        Toasttext: '',
                    })
                }, 2000)
            } else if (res.data && (res.data.code == '0005' || res.data.code == '0004' || res.data.code == '0003')) {
                that.errorExceptionDispose(res)
            } else {
                wx.setStorageSync('enquiryOrderId', '')
                wx.setStorageSync('userType', '')
                wx.navigateTo({
                    url: '../WaitPriceDetail/WaitPriceDetail?itempriceId=' + itempriceId,
                })
            }
        })
    },

    /**
       * 重新加载
       */
    reloadAction: function () {
        var that = this;
        that.getSwitchTabData(1);
    },

    /**
     * 是否已经报价
     */
    isBooleOffer: function () {
        var that = this;
        var param = { sysUserId: that.data.userId, offerOrderId: that.data.offorderid }
        var url = util.BASE_URL + util.BOOLE_OFFER;
        util.getDataJson(url, param, res => {
            //0 ： 未报价  ； 1 ：已报价
            console.log('单子是否报价', res)
            //分享进入到详情页面后修改分享标志为2，以免下次进入当前页面再次自动跳转到详情页
            that.data.jumpType = 2;
            if (res.data.content.isOffer == 1 && res.data.code == '0000') {
                console.log('单子已经报价')
                that.setData({ currentTab: 1 })
                //分享进入到详情页面后修改分享标志为2，以免下次进入当前页面再次自动跳转到详情页
                // that.data.jumpType = 2;
                wx.navigateTo({
                    url: '../AlreadyPriceDetail/AlreadyPriceDetail?itempriceId=' + that.data.offorderid,
                })
            } else if (res.data.content.isOffer == 0 && res.data.code == '0000') {
                console.log('单子未报价')
                that.setData({ currentTab: 0 })
                //分享进入到详情页面后修改分享标志为2，以免下次进入当前页面再次自动跳转到详情页
                // that.data.jumpType = 2;
                var backOrderid = wx.getStorageSync('BACKORDERID')
                wx.navigateTo({
                    url: '../WaitPriceDetail/WaitPriceDetail?itempriceId=' + backOrderid,
                })

            } else if (res.data.content.isOffer == 2 && res.data.code == '0000') {
                console.log('单子未报价')
                that.setData({ currentTab: 2 })
                //分享进入到详情页面后修改分享标志为2，以免下次进入当前页面再次自动跳转到详情页
                // that.data.jumpType = 2;
                var backOrderid = wx.getStorageSync('BACKORDERID')
                wx.navigateTo({
                    url: '../WaitPriceDetail/WaitPriceDetail?itempriceId=' + backOrderid,
                })
            } else if (res.data && (res.data.code == '0005' || res.data.code == '0004' || res.data.code == '0003')) {
                that.errorExceptionDispose(res)
            } else {
                console.log('分享单子接口请求失败')
            }
        })
    },

    /**
     * 企业信息查询
     */
    getCompanyInfo: function () {
        var that = this;
        app.getCompanyState(that.data.userId, res => {
            if (res.data.code == '0000') {
                //审核通过或未审核
                if (that.data.jumpType == 1) {
                    that.isBooleOffer();
                    that.data.jumpType = 2;
                } else {
                    if (that.data.pageNo != 2) {
                        that.getSwitchTabData(1);
                    }
                }
            } else {
                that.errorExceptionDispose(res)
            }
        })
    },

    /**
     * 错误,异常处理
     */
    errorExceptionDispose: function (res) {
        if (res.data.code == '0005') {
            //审核未通过
            this.setData({ pageNo: 1 })
            app.globalData.auditState = 2;
            app.globalData.unapproveContent = res.data.content;
            wx.switchTab({
                url: '../UserCenter/UserCenter'
            })
        } else if (res.data.code == '0003') {
            //企业停用
            wx.reLaunch({
                url: '../Disable/Disable'
            })
        } else if (res.data.code == '0004') {
            //没有企业新信息
            wx.navigateTo({
                url: '../EmptyCompanyInfo/EmptyCompanyInfo?jumpTpye=0'
            })
        }
    },

    // enterAnimation: function(){
    //     wx.pageScrollTo({
    //         scrollTop: 0,
    //         duration: 100,
    // })
    // var animation = wx.createAnimation({
    //     transformOrigin: "50% 50%",
    //     duration: 500,
    //     timingFunction: "ease",
    //     delay: 0
    // })
    // this.animation = animation
    // animation.translateY(-0).step({ duration: 500 })
    // this.setData({
    //     animationData: this.animation.export()
    // })  
    // }

})