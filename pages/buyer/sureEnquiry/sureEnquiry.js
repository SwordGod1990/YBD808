// pages/buyer/sureEnquiry/sureEnquiry.js
var util = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        drugList: [], //药品集合
        isDoubleClick: true, //防止多次点击
        userInfo: {}, //收货人信息
        words: '', //医生留言
        clinicId: '', //诊所ID
        clinicName: '', //诊所名称
        drugNum: '', //药品件数
        userId: '', //用户ID
        userName: '', //用户姓名
        orderId: '', //询价单ID
        consigneePhone: '', //收货人手机号
        isFirst: true, //判断是否第一次进入
        syncShopping: 1, //0:未分享到商城 1:分享到商城
        isSureToast: true, //判断时候要去完善信息
        toastContent: '请您去完善收货信息',
        toastCancel: '',
        toastSure: '确定',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            drugNum: options.drugNum,
        })

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        this.preGetDrugList();

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.data.userId = wx.getStorageSync('USERID');
        this.data.clinicId = wx.getStorageSync('CLINICID');
        this.data.clinicName = wx.getStorageSync('CLINICNAME');
        this.data.isDoubleClick = true;
        console.log('userInfo:', this.data.userInfo)

        console.log('CLINICID:', this.data.clinicId)
        var userInfoStatus = wx.getStorageSync('USERINFOSTATUS');
        var userInfoRegister = wx.getStorageSync('USERINFOREGISTER');
        if (userInfoRegister != 1) {
            //若果未登录，先登录
            wx.navigateTo({
                url: '../../register/register',
            })
        } else if (userInfoStatus != 1) {
            wx.navigateTo({
                url: '../../bindCompany/bindCompany',
            })
        }
        this.getUserRequest();
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
     * 数据同步到商城
     */
    shareShoppingMallAction: function(e){
        // console.log('数据同步到商城 e:', e)
        var id = e.currentTarget.id;
        if(id == 1){
            this.setData({
                syncShopping: 0,
            })
        }else{
            this.setData({
                syncShopping: 1,
            })
        }
        
    },

    /**
     * 完善信息
     */
    sureAction: function () {
        wx.navigateTo({
            url: '../consigneeInfo/consigneeInfo',
        })
        this.setData({ isSureToast: true })
    },

    /**
     * 保存询价单
     */
    saveEnquiryAction: function () {
        console.log('保存询价单')
        if (this.data.userInfo.consigneePhone == '' || typeof this.data.userInfo.consigneePhone == 'undefined') {
            wx.showToast({
                icon: 'none',
                title: '请完成收货人手机号!',
            })
            return;
        }
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            this.saveEnquiryRequest();
        }
    },

    /**
     * 获取留言
     */
    wordsAction: function (e) {
        console.log('e:', e)
        this.data.words = e.detail.value;
    },

    /**
     * 获取药品集合
     */
    preGetDrugList: function () {
        var pages = getCurrentPages();
        console.log('pages:', pages)
        var prevPage = pages[pages.length - 2];
        console.log('prevPage', prevPage)
        this.setData({
            drugList: prevPage.data.drugCatList,
        })
        if ("undefined" == typeof prevPage.data.orderId) {
            this.data.orderId = '';
        } else {
            this.data.orderId = prevPage.data.orderId;
        }
        console.log('drugList:', this.data.drugList)
    },

    /**
     * 修改收货人信息
     */
    editUserInfoAction: function () {
        console.log('修改收货人信息')
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            wx.navigateTo({
                url: '../consigneeInfo/consigneeInfo',
            })
        }
    },

    /**
     * 获取收货人信息
     */
    getUserRequest: function () {
        var that = this;
        if (("undefined" == typeof that.data.clinicId) || that.data.clinicId == '') {
            return;
        }
        var param = { clinicId: that.data.clinicId };
        var url = util.BASE_URL + util.ENQUIRY_ORDER_NEW_CLINIC_ADDRESS_TO_WX;
        util.getDataJson(url, param, res => {
            console.log('获取收货人信息 res:', res)
            if (res.data && res.data.code == '0000') {
                that.setData({
                    userInfo: res.data.data,
                })
                if (that.data.isFirst && that.data.userInfo.area == ''){
                    that.data.isFirst = false;
                }
            }
        })
    },

    /**
     * 组合询价单请求数据
     */
    groupEnquiryData: function () {
        this.data.medicinalId = this.getMedicinalElement('medicinalId');
        this.data.medicinalName = this.getMedicinalElement('medicinalName');
        this.data.norms = this.getMedicinalElement('norms');
        this.data.medicinalCompanyName = this.getMedicinalElement('medicinalCompanyName');
        this.data.num = this.getMedicinalElement('num');
        this.data.unit = this.getMedicinalElement('unit');
        this.data.smallUnit = this.getMedicinalElement('smallUnit');
        this.data.scaler = this.getMedicinalElement('scaler');
        var param = {
            clinicId: this.data.clinicId,
            enquiryOrderId: this.data.orderId,
            clinicName: this.data.clinicName,
            medicinalTypeNum: this.data.drugList.length,
            totalNum: this.data.drugNum,
            sysUserId: this.data.userId,
            sysUserName: this.data.userInfo.consigneeName,
            words: this.data.words,
            medicinalId: this.data.medicinalId,
            medicinalName: this.data.medicinalName,
            norms: this.data.norms,
            medicinalCompanyName: this.data.medicinalCompanyName,
            num: this.data.num,
            unit: this.data.unit,
            smallUnit: this.data.smallUnit,
            scaler: this.data.scaler,
            province: this.data.userInfo.province,
            city: this.data.userInfo.city,
            area: this.data.userInfo.area,
            provinceCode: this.data.userInfo.provinceCode,
            cityCode: this.data.userInfo.cityCode,
            areaCode: this.data.userInfo.areaCode,
            consigneeName: this.data.userInfo.consigneeName,
            consigneePhone: this.data.userInfo.consigneePhone,
            consigneeAddress: this.data.userInfo.consigneeAddress,
            source: 2,
            share: this.data.syncShopping,
        }

        return param;
    },

    /**
     * 获取药品ID
     */
    getMedicinalElement: function (str) {
        var result = '';
        for (var i = 0; i < this.data.drugList.length; i++) {
            if (i > 0) {
                result = result + ',';
            }
            result = result + this.data.drugList[i][str];
        }
        return result;
    },

    /**
     * 保存询价单
     */
    saveEnquiryRequest: function () {
        var that = this;
        var param = this.groupEnquiryData();
        var url = util.BASE_URL + util.ENQUIRY_ORDER_UPDATE_SAVE_ENQUIRY_ORDER_TO_WX;
        util.getDataJson(url, param, res => {
            console.log('保存询价单 res:', res)
            this.data.isDoubleClick = true;
            if (res.data && res.data.code == '0000') {
                //清除缓存购物车数据
                var userId = wx.getStorageSync('USERID');
                wx.setStorageSync(userId, '1')
                console.log('str--------------------:', wx.getStorageSync(userId))
                wx.showToast({
                    icon: "none",
                    title: '保存成功',
                })
                wx.reLaunch({
                    url: '../SendPricePage/SendPricePage?enquiryOrderId=' + res.data.data.enquiryOrderId,
                })
            } else if (res.data && res.data.code == '0009'){
                that.setData({
                    isSureToast: false,
                })
            } else {
                
                wx.showToast({
                    icon: "none",
                    title: '保存失败',
                })
            }
        })
    }


})