// pages/buyer/purchaseNoteDetail/purchaseNoteDetail.js
var util = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        leavingMessage: '',
        medicalList: [], //药品列表
        medicalInfo: '', //采购单信息
        time: '', //采购时间
        Id: '', //货单ID
        status: '', //发货状态
        pageNum: 1, //1,加载成功 2，加载失败
        deliveryTime: '', //发货时间
        receivingTime: '', //收货时间
        orderType: '', //订单类型
        refuseTime: '', //取消时间
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        if (options) {
            this.data.Id = options.Id;
        }
        this.data.orderType = options.orderType;
        console.log('orderType:', options.orderType)
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        this.getPurchaseOrderDetail();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

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
     * 确认收货 
     */
    sendReceiveAction: function() {
        var that = this;
        wx.showModal({
            title: '',
            content: '确认收货吗',
            success: function(res) {
                if (res.confirm) {
                    var param = {
                        orderId: that.data.Id
                    };
                    var url = util.BASE_URL + util.ORDERS_CONFIRM_ORDER;
                    util.getDataJson(url, param, res => {
                        console.log('确定收货', res)
                        if (res.data && res.data.code == '0000') {
                            wx.showToast({
                                icon: 'none',
                                title: '收货成功',
                            })
                        } else if (res.data && res.data.code == '9001') {
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
                        } else {
                            wx.showToast({
                                icon: 'none',
                                title: '请求失败',
                            })
                        }
                        
                        var pages = getCurrentPages();
                        var prePage = pages[pages.length - 2];
                        prePage.purchaseNoteRequest();
                        //返回上衣页面
                        wx.navigateBack({
                            delta: 1,
                        })
                    })
                }
            }
        })
    },

    /**
     * 查询采购单详情 
     */
    getPurchaseOrderDetail: function() {
        var that = this;
        var param = {
            orderBusinessId: that.data.Id
        }
        var url = util.BASE_URL + util.ORDERS_ORDER_INFO;
        util.getDataJson(url, param, res => {
            console.log('查询采购单详情:', res);
            if (res.data && res.data.code == '0000') {
                if (res.data.data.businessName.length > 10) {
                    res.data.data.businessName2 = res.data.data.businessName.substring(0, 10) + '...'
                } else {
                    res.data.data.businessName2 = res.data.data.businessName
                }
                res.data.data.consigneeAddress = res.data.data.consigneeAddress.replace('undefined', '');
                that.setData({
                    medicalInfo: res.data.data,
                    medicalList: res.data.data.meds,
                    pageNum: 1,
                })
                //采购时间
                if (that.data.medicalInfo.dateCreated != '' && that.data.medicalInfo.dateCreated.substring(0, 4) > 2017) {
                    that.setData({
                        time: that.data.medicalInfo.dateCreated.substring(5, that.data.medicalInfo.dateCreated.length),
                    })
                } else {
                    that.setData({
                        time: that.data.medicalInfo.dateCreated,
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
                if (typeof that.data.medicalInfo.refuseTime != 'undefined') {
                    if (that.data.medicalInfo.refuseTime != '' && that.data.medicalInfo.refuseTime.substring(0, 4) > 2017) {
                        that.setData({
                            refuseTime: that.data.medicalInfo.refuseTime.substring(5, that.data.medicalInfo.refuseTime.length),
                        })
                    } else {
                        that.setData({
                            refuseTime: that.data.medicalInfo.refuseTime,
                        })
                    }
                }

            } else {
                that.setData({
                    pageNum: 2,
                })
            }
        })
    },
})