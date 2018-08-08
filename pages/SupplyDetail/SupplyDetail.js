// pages/SupplyDetail/SupplyDetail.js

var util = require('../../utils/util.js')
var reloadUtil = require('../../template/AccountUnuse.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        words: '', //留言
        orderId: '', //订单ID
        medicalList: [], //药品列表
        time: '', //采购时间
        deliveryTime: '', //发货时间
        receivingTime: '', //收货时间
        refuseTime: '', //收货时间
        refuseReason: '', //驳回原因
        isEmptyRefuseReason: true, //fasle:驳回原因为空
        medicalInfo: '', //采购单信息
        isFrom: -1, //0: 标示活动
        toastContent: '确认发货吗？',
        toastCancel: '取消',
        toastSure: '确定',
        pageNum: 1, //1,加载成功 2，加载失败
        sureShipments: true, //确认发货提示框
        isReject: true, //驳回显示框
        isDoubleClick: true, //防止多次点击

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log('options:', options)
        if (typeof options.orderId != 'undefined') {
            this.data.orderId = options.orderId;
            this.setData({
                isFrom: options.isFrom
            })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        this.getOrderDetail();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.data.isDoubleClick = true;
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
     * 确定发货
     */
    sendReceiveAction: function() {
        var that = this;
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            this.setData({
                sureShipments: false
            })
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
        this.data.orderIdIndex = -1;
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
     * 监听驳回信息输入
     */
    rejectChangeAction: function(e) {
        console.log('监听驳回信息输入 e:', e)
        this.data.refuseReason = e.detail.value;
        if (this.data.refuseReason != '') {
            this.setData({
                isEmptyRefuseReason: true,
            })
        }
    },

    /**
     * 驳回
     */
    rejectReceiveAction: function() {
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            this.setData({
                isReject: false
            })
        }
    },

    /**
     * 确定驳回
     */
    sureRejectAction: function() {
        if (this.data.refuseReason == '') {
            this.setData({
                isEmptyRefuseReason: false,
            })
            return;
        }
        this.rejectRequest();
        this.data.isDoubleClick = true;
        this.setData({
            isReject: true
        })
    },

    /**
     * 驳回取消
     */
    cancelRejectAction: function() {
        this.data.isDoubleClick = true;
        this.setData({
            isReject: true
        })
    },

    /**
     * 获取供货单详情
     */
    getOrderDetail: function() {
        var that = this;
        var param = {
            orderBusinessId: that.data.orderId
        }
        var url = util.BASE_URL + util.ORDERS_QUERY_ORDER_DETAIL_BY_ID;
        util.getDataJson(url, param, res => {
            console.log('获取供货单详情:', res);
            if (res.data && res.data.code == '0000' && res.data.data != '') {
                that.setData({
                    medicalInfo: res.data.data[0],
                    medicalList: res.data.data[0].medicinalList,
                    pageNum: 1,
                })
                //采购时间
                if (that.data.medicalInfo.dateCreate != '' && that.data.medicalInfo.dateCreate.substring(0, 4) > 2017) {
                    that.setData({
                        time: that.data.medicalInfo.dateCreate.substring(5, that.data.medicalInfo.dateCreate.length),
                    })
                } else {
                    that.setData({
                        time: that.data.medicalInfo.dateCreate,
                    })
                }
                //发货时间
                if (that.data.medicalInfo.deliveryTime != '' && that.data.medicalInfo.deliveryTime.substring(0, 4) > 2017) {
                    that.setData({
                        deliveryTime: that.data.medicalInfo.deliveryTime.substring(5, that.data.medicalInfo.deliveryTime.length),
                    })
                } else {
                    that.setData({
                        deliveryTime: that.data.medicalInfo.deliveryTime,
                    })
                }
                //收货时间
                if (that.data.medicalInfo.receivingTime != '' && that.data.medicalInfo.receivingTime.substring(0, 4) > 2017) {
                    that.setData({
                        receivingTime: that.data.medicalInfo.receivingTime.substring(5, that.data.medicalInfo.receivingTime.length),
                    })
                } else {
                    that.setData({
                        receivingTime: that.data.medicalInfo.receivingTime,
                    })
                }
                //取消时间 
                if (that.data.medicalInfo.refuseTime != '' && that.data.medicalInfo.refuseTime.substring(0, 4) > 2017) {
                    that.setData({
                        refuseTime: that.data.medicalInfo.refuseTime.substring(5, that.data.medicalInfo.refuseTime.length),
                    })
                } else {
                    that.setData({
                        refuseTime: that.data.medicalInfo.refuseTime,
                    })
                }
            } else {
                that.setData({
                    pageNum: 2,
                })
            }
        })
    },

    /**
     * 确定发货
     */
    shipmentsRequest: function() {
        var that = this;
        var param = {
            orderBusinessId: that.data.orderId
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
                wx.navigateBack({
                    delta: 1,
                })
            }else if (res.data && res.data.code == '9001') {
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

    /**
     * 驳回订单
     */
    rejectRequest: function() {
        var that = this;
        var param = {
            orderBusinessId: that.data.orderId,
            refuseReason: this.data.refuseReason,
        };
        var url = util.BASE_URL + util.ORDERS_REFUSE_ORDER;
        util.getDataJson(url, param, res => {
            console.log('驳回订单', res)
            this.data.isDoubleClick = true;
            if (res.data && res.data.code == '0000') {
                wx.showToast({
                    duration: 1500,
                    icon: 'none',
                    title: '已驳回',
                })
                wx.navigateBack({
                    delta: 1,
                })
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
                    title: '取消失败',
                })
            }
        })
    },

    /**
     * 重新加载
     */
    // reloadAction: function() {
    //     var that = this;
    //     this.getOrderDetail();
    // }

})