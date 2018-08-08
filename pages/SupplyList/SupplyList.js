// pages/SupplyList/SupplyList.js
var util = require('../../utils/util.js')
var app = getApp()
var requestTask = '';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userId: '', //用户ID
        isDoubleClick: true, //防止多次点击
        pageStart: 1, //数据的起始页
        pageCount: 10, //每页请求的数据条数
        orderStatus: 0, //请求的数据状态: 0: 待发货, 1: 待收货, 2: 已收货, 3:已驳回;
        orderList: [], //供货单数据集合
        currentTab: 0, //当前页面标示
        errorMsg: '没有此类型的供货单哦！', //错误提示
        errorImg: '/Images/error_icon.png', //错误提示图片
        isError: true, //显示无数据页面
        toastContent: '确认发货吗？',
        toastCancel: '取消',
        toastSure: '确定',
        sureShipments: true, //确认发货确认框
        orderIdIndex: -1, //发货Id
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.data.userId = wx.getStorageSync('USERID')
        this.decideUserOperation();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.data.isDoubleClick = true;
        // //1,用户绑定了企业
        // var userInfoStatus = wx.getStorageSync('USERINFOSTATUS');
        // //1,用户没有注册
        // var userInfoRegister = wx.getStorageSync('USERINFOREGISTER');
        // //1,用户为历史用户数据
        // var userOldData = wx.getStorageSync('USEROLDDATA');
        // if (userInfoRegister != 1) {
        //     //若果未登录，先登录
        //     wx.navigateTo({
        //         url: '../register/register',
        //     })
        // } else if (userOldData == 1) {
        //     wx.navigateTo({
        //         url: '../company/fillInCompany/fillInCompany?jumpType=3&provinceName=&companyInfo=',
        //     })
        // } else if (userInfoStatus != 1) {
        //     wx.navigateTo({
        //         url: '../bindCompany/bindCompany',
        //     })
        // }
        this.supplyRequest();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        console.log('下拉')
        if (this.decideUserOperation()) {
            return;
        }
        wx.showLoading({
            title: '加载中...',
        })
        this.data.pageStart = 1;
        this.supplyRequest();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        console.log('上拉')
        if (this.decideUserOperation()) {
            return;
        }
        this.data.pageStart = this.data.pageStart + 1;
        this.supplyRequest();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    /**
     * 判断用户注册, 绑定企业状态
     */
    decideUserOperation: function () {
        var userInfoStatus = wx.getStorageSync('USERINFOSTATUS');
        var userInfoRegister = wx.getStorageSync('USERINFOREGISTER');
        var userOldData = wx.getStorageSync('USEROLDDATA');
        if (userInfoRegister != 1) {
            //若果未登录，先登录
            wx.navigateTo({
                url: '../register/register',
            })
            return true;
        } else if (userOldData == 1) {
            wx.navigateTo({
                url: '../company/fillInCompany/fillInCompany?jumpType=3&provinceName=&companyInfo=',
            })
            return true;
        } else if (userInfoStatus != 1) {
            wx.navigateTo({
                url: '../bindCompany/bindCompany',
            })
            return true;
        }
        return false;
    },

    /**
     * tab点击事件
     */
    tabAction: function(e) {
        //   console.log('tab点击事件:',e)
        var id = e.currentTarget.id;
        if (id == this.data.currentTab) {
            //如果相等不请求服务器，不从新绘制页面
            return;
        }
        if (this.decideUserOperation()){
            return;
        }
        this.data.pageStart = 1;
        this.data.orderStatus = id;
        if (this.data.pageStart == 1) {
            wx.showLoading({
                title: '加载中...',
            })
        }
        this.data.orderList = [];
        this.supplyRequest();
        this.setData({
            currentTab: id,
            orderList: [],
        })
    },

    /**
     * item 跳转到详情
     */
    supplyItemAction: function(e) {
        console.log('跳转到详情 e:', e)
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            var index = e.currentTarget.id;
            var orderId = this.data.orderList[index].orderBusinessId;
            var isFrom = this.data.orderList[index].isFrom;
            wx.navigateTo({
                url: '../SupplyDetail/SupplyDetail?orderId=' + orderId + '&isFrom=' + isFrom,
            })
        }
    },

    /**
     * 确认发货
     */
    sureFreightAction: function(e) {
        console.log('确认发货 e:', e)
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            var index = e.currentTarget.id;
            this.setData({
                sureShipments: false
            })
            this.data.orderIdIndex = index;
            this.data.isDoubleClick = true;
        }
    },

    /**
     * 确定 
     */
    sureAction: function() {
        this.shipmentsRequest();
        this.setData({
            sureShipments: true
        })
    },

    /**
     * 取消
     */
    cancelAction: function() {
        this.setData({
            sureShipments: true
        })
        this.data.orderIdIndex = -1;
        this.data.isDoubleClick = true;
    },

    /**
     * 获取供货单集合
     */
    supplyRequest: function() {
        var that = this;
        if (requestTask != '') {
            requestTask.abort();
        }
        var param = {
            sysUserId: that.data.userId,
            pageStart: that.data.pageStart,
            pageNum: that.data.pageCount,
            status: that.data.orderStatus
        }
        var url = util.BASE_URL + util.ALL_SUPPLY_ORDER;
        requestTask = util.getDataJson(url, param, res => {
            console.log('获取供货单集合 res:', res)
            wx.stopPullDownRefresh();
            wx.hideLoading();
            if (res.data && res.data.code == '0000' && res.data.content.length >= 0) {
                if (that.data.pageStart == 1) {
                    if (res.data.content.length == 0) {
                        that.setData({
                            isError: false
                        })
                    } else {
                        that.setData({
                            isError: true
                        })
                    }
                    that.setData({
                        orderList: res.data.content,
                    })
                } else {
                    that.setData({
                        orderList: that.data.orderList.concat(res.data.content),
                    })
                }
            } else {
                if (that.data.orderList.length == 0) {
                    that.setData({
                        isError: false
                    })
                } else {
                    that.setData({
                        isError: true
                    })
                }
            }
        })
    },

    /**
     * 确定发货
     */
    shipmentsRequest: function() {
        var that = this;
        var orderId = this.data.orderList[this.data.orderIdIndex].orderBusinessId;
        var param = {
            orderBusinessId: orderId
        };
        var url = util.BASE_URL + util.UPDATE_ORDER_BUSINESS_STATUS;
        util.getDataJson(url, param, res => {
            console.log('确定发货', res)
            this.data.isDoubleClick = true;
            if (res.data && res.data.code == '0000') {
                wx.showToast({
                    duration: 1500,
                    icon: 'none',
                    title: '发货成功',
                })
                that.data.pageStart = 1;
                that.supplyRequest();
            } else if (res.data && res.data.code == '9001') {
                wx.showToast({
                    duration: 1500,
                    icon: 'none',
                    title: '该订单已发货',
                })
            } else if (res.data && res.data.code == '9002') {
                wx.showToast({
                    duration: 1500,
                    icon: 'none',
                    title: '该订单已收货',
                })
            } else if (res.data && res.data.code == '9003') {
                wx.showToast({
                    duration: 1500,
                    icon: 'none',
                    title: '该订单已取消',
                })
            } else {
                wx.showToast({
                    duration: 1500,
                    icon: 'none',
                    title: '发货失败',
                })
            }
        })
    },

})
