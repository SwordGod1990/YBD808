// pages/buyer/purchaseNote/purchaseNote.js
var template = require('../../../template/tabBar/tabBar.js')
var util = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        currentTab: 0, //当前tab的位置
        isDoubleClick: true,  // 防止多次点击
        surePurchase: true, //弹出再次确认窗口
        toastContent: '确认收货吗？',
        toastCancel: '取消',
        toastSure: '确定',
        orderStatus: 0, //状态 0:待发货 ； 1:待收货 ； 2:已收货; 3: 已取消
        clinicId: '', //诊所ID
        errorMsg: '没有此类型的采购单哦！',
        errorImg: '/Images/error_icon.png',
        pageStart: 1, //请求起始页码
        orderList: [], //询价单集合
        orderId: '', //点击询价单Id
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        template.tabbar("tabBar", 1, this)//0表示第一个tabbar
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        this.decideUserOperation();
        //获取采购单列表
        this.data.orderStatus = 0;
        
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.data.isDoubleClick = true; 
        this.data.clinicId = wx.getStorageSync('CLINICID');
    
        this.purchaseNoteRequest();
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
        console.log('下拉')
        if (this.decideUserOperation()){
            return;
        }

        this.data.pageStart = 1;
        this.purchaseNoteRequest();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        console.log('上拉')
        if (this.decideUserOperation()) {
            return;
        }

        this.data.pageStart = this.data.pageStart + 1;
        this.purchaseNoteRequest();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    /**
     * 判断用户注册, 绑定诊所状态
     */
    decideUserOperation: function () {
        var userInfoStatus = wx.getStorageSync('USERINFOSTATUS');
        var userInfoRegister = wx.getStorageSync('USERINFOREGISTER');
        if (userInfoRegister != 1) {
            //若果未登录，先登录
            wx.navigateTo({
                url: '../../register/register',
            })
            return true;
        } else if (userInfoStatus != 1) {
            wx.navigateTo({
                url: '../../bindCompany/bindCompany',
            })
            return true;
        }
        return false;
    },


    /**
     * tab点击事件
     */
    tabAction: function (e) {
        //   console.log('tab点击事件:',e)
        var id = e.currentTarget.id;
        if (id == this.data.currentTab) {
            //如果相等不请求服务器，不从新绘制页面
            return;
        }
        if (this.decideUserOperation()) {
            return;
        }

        this.data.pageStart = 1;
        this.data.orderStatus = id;
        this.purchaseNoteRequest();
        this.setData({
            currentTab: id,
        })
    },

    /**
     * 确定收货
     */
    sureFreightAction: function (e) {
        console.log('确定收货e:', e)
        var index = e.currentTarget.id;
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            this.data.orderId = this.data.orderList[index].orderBusinessId
            this.setData({ surePurchase: false })
        }
    },

    /**
     * 供货单详情
     */
    purchaseNoteItemAction: function (e) {
        console.log('供货单详情 e:', e)
        var index = e.currentTarget.id;
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            wx.navigateTo({
                url: '../purchaseNoteDetail/purchaseNoteDetail?Id=' + this.data.orderList[index].orderBusinessId+'&orderType=2',
            })
        }
    },

    /**
   * 取消
   */
    cancelAction: function () {
        console.log('取消')
        this.data.isDoubleClick = true;
        this.setData({ surePurchase: true })
    },

    /**
     * 确定
     */
    sureAction: function () {
        console.log('确定')
        this.data.isDoubleClick = true;
        this.setData({ surePurchase: true })
        //处理请求
        var that = this;
        var param = { orderId: that.data.orderId };
        var url = util.BASE_URL + util.ORDERS_CONFIRM_ORDER;
        util.getDataJson(url, param, res => {
            console.log('确定收货', res)
            if (res.data && res.data.code == '0000'){
                that.purchaseNoteRequest();
            } else if (res.data && res.data.code == '9001'){
                wx.showToast({
                    icon: 'none',
                    title: '该订单已发货',
                })
            } else if (res.data && res.data.code == '9002') {
                wx.showToast({
                    icon: 'none',
                    title: '该订单已收货',
                })
            } else if (res.data && res.data.code == '9003') {
                wx.showToast({
                    icon: 'none',
                    title: '该订单已取消',
                })
            }else{
                wx.showToast({
                    icon: 'none',
                    title: '请求失败',
                })
            }
            
        })
        // wx.showModal({
        //     title: '',
        //     content: '确认收货吗',
        //     success: function (res) {
        //         if (res.confirm) {
        //             var param = { orderId: that.data.orderId };
        //             var url = util.BASE_URL + util.ORDERS_CONFIRM_ORDER;
        //             util.getDataJson(url, param, res => {
        //                 console.log('确定收货', res)
        //                 that.purchaseNoteRequest();
        //             })
        //         }
        //     }
        // })
    },

    /**
     * 获取采购单列表
     */
    purchaseNoteRequest: function () {
        var that = this;
        var param = { clinicId: that.data.clinicId, pageStart: this.data.pageStart, pageNum: 10, status: that.data.orderStatus, };
        var url = util.BASE_URL + util.ORDERS_ALL_ORDER;
        util.getDataJson(url, param, res => {
            console.log('获取采购单列表 res:', res)
            wx.stopPullDownRefresh();
            if (res.data && res.data.code == '0000' && res.data.content.length >= 0) {
                if (that.data.pageStart == 1){
                    that.setData({
                        orderList: res.data.content,
                    })
                }else{
                    that.setData({
                        orderList: that.data.orderList.concat(res.data.content),
                    })
                }
            }
        })
    },

    /**
     * 确认收货 orders/confirmOrder
     */
    // confirmOrderRequest: function () {
    //     var that = this;
    //     var param = { orderId: that.data.orderId };
    //     var url = util.BASE_URL + util.ORDERS_CONFIRM_ORDER;
    //     util.getDataJson(url, param, res => {
    //         console.log('获取采购单列表 res:', res)
    //         wx.stopPullDownRefresh();
    //         if (res.data && res.data.code == '0000' && res.data.content.length >= 0) {
    //             if (that.data.pageStart == 1) {
    //                 that.setData({
    //                     orderList: res.data.content,
    //                 })
    //             } else {
    //                 that.setData({
    //                     orderList: that.data.orderList.concat(res.data.content),
    //                 })
    //             }
    //         }
    //     })
    // },

})