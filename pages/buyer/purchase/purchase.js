// pages/company/purchase/purchase.js
var template = require('../../../template/tabBar/tabBar.js')
var util = require('../../../utils/util.js')
var stringUtil = require('../../../utils/stringUtil.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        surePurchase: true, //弹出再次确认窗口
        toastContent: '确定采购药品吗？',
        toastCancel: '取消',
        toastSure: '确定',
        clinicId: '', //诊所ID
        userInfo: '', //收货人信息
        words: '', //询价单留言
        purchaseList: [], //采购单列表
        sanJumpType: 0, //2:扫码后立即采购
        isSureToast: true, //判断时候要去完善信息
        
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        template.tabbar("tabBar", 2, this) //0表示第一个tabbar
        this.setData({
            words: options.words
        })
        this.data.sanJumpType = options.sanJumpType;
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

        var pages = getCurrentPages();
        //上一个页面
        var prevPage = pages[pages.length - 2];
        console.log('prevPage.data.drugCatList:', prevPage.data.drugCatList)
        if (prevPage.data.drugCatList.length > 0) {
            this.setData({
                purchaseList: prevPage.data.drugCatList,
            })
            this.calculateFreight();
        }

        console.log('purchaseList:', this.data.purchaseList)
    },

    /**
     * 计算总价
     */
    calculateFreight: function() {
        for (var i = 0; i < this.data.purchaseList.length; i++) {
            var arr = this.data.purchaseList[i];
            var total = 0;
            for (var j = 0; j < arr.dataArray.length; j++) {
                // if (typeof arr.dataArray[j].activeType != 'undefined'){
                //     console.log('total:', total)
                //     if (arr.dataArray[j].activeType == 1) {
                //         total = total + stringUtil.mathToFixed(Number(arr.dataArray[j].num) * Number(arr.dataArray[j].discountPrice));
                //     } else {
                //         total = total + stringUtil.mathToFixed(Number(arr.dataArray[j].num) * Number(arr.dataArray[j].price));
                //     }
                // }else{
                //     total = total + stringUtil.mathToFixed(Number(arr.dataArray[j].num) * Number(arr.dataArray[j].price));
                // }

                if (typeof arr.dataArray[j].activeType != 'undefined') {
                    console.log('total:', total)
                    if (arr.dataArray[j].activeType == 1) {
                        total = total + Number(arr.dataArray[j].num) * Number(arr.dataArray[j].discountPrice * 100);
                    } else {
                        total = total + Number(arr.dataArray[j].num) * Number(arr.dataArray[j].price * 100);
                    }
                } else {
                    total = total + Number(arr.dataArray[j].num) * Number(arr.dataArray[j].price * 100);
                }
                console.log('total:', total)
            }

            arr.total_price = total/100;
            if (arr.total_price != '' && arr.freight != '') {
                arr.totalAmount2 = ((Number(arr.total_price * 100) + Number(arr.freight * 100))/100).toFixed(2);
            } else if (arr.total_price != '' && arr.freight == '') {
                arr.totalAmount2 = (stringUtil.mathToFixed(Number(arr.total_price))).toFixed(2);
            } else if (arr.total_price == '' && arr.freight != '') {
                arr.totalAmount2 = (stringUtil.mathToFixed(Number(arr.freight))).toFixed(2);
            } else {
                arr.totalAmount2 = 0;
            }
        }
        this.setData({
            purchaseList: this.data.purchaseList,
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.data.clinicId = wx.getStorageSync('CLINICID');
        this.getUserRequest();
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

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    /**
     * 完善信息
     */
    // sureAction: function () {
    //     wx.navigateTo({
    //         url: '../consigneeInfo/consigneeInfo',
    //     })
    //     this.setData({ isSureToast: true })
    // },

    /**
     * 修改运费
     */
    freightUpdateAction: function(e) {
        console.log('修改运费 e:', e);
        var index = e.currentTarget.id;
        var that = this
        console.log('运费输入:', e.detail.value)
        if (e.detail.value == '') {
            if (this.data.purchaseList[index].freight == '') {
                this.data.purchaseList[index].total_price = (Number(this.data.purchaseList[index].totalAmount2)).toFixed(2);
            } else {
                this.data.purchaseList[index].total_price = ((Number(this.data.purchaseList[index].totalAmount2*100) - Number(this.data.purchaseList[index].freight*100))/100).toFixed(2);
                this.data.purchaseList[index].totalAmount2 = (stringUtil.mathToFixed(this.data.purchaseList[index].total_price)).toFixed(2);
            }
            this.data.purchaseList[index].freight = 0;
            this.setData({
                purchaseList: this.data.purchaseList,
            })
            return;
        }
        var price = e.detail.value;
        if (/(^\d{1,4})+(\.\d{1,2})?$/.test(price)) {
            if (price > 1 && !/^([1-9][0-9]*)+(\.\d{1,2})?$/.test(price)) {
                wx.showToast({
                    title: '运费不能零开始',
                    icon: 'none',
                })
                price = '';
            } else if (/^\d+(\.\d{1,2})?$/.test(price)) {
                console.log('yd:', price)
            } else {
                wx.showToast({
                    icon: 'none',
                    title: '只能带两位小数',
                })
                price = '';
            }
        } else {
            wx.showToast({
                title: '运费格式错误',
                icon: 'none',
            })
            price = '';
        }
        if (price != '') {
            if (this.data.purchaseList[index].freight == '') {
                this.data.purchaseList[index].total_price = ((Number(this.data.purchaseList[index].totalAmount2*100) + Number(e.detail.value*100))/100).toFixed(2);
                this.data.purchaseList[index].totalAmount2 = (stringUtil.mathToFixed(this.data.purchaseList[index].total_price)).toFixed(2);
                this.data.purchaseList[index].freight = price;
            } else {
                this.data.purchaseList[index].total_price = ((Number(this.data.purchaseList[index].totalAmount2*100) - Number(this.data.purchaseList[index].freight*100) + Number(e.detail.value*100))/100).toFixed(2);
                this.data.purchaseList[index].totalAmount2 = (stringUtil.mathToFixed(this.data.purchaseList[index].total_price)).toFixed(2);
                this.data.purchaseList[index].freight = price;
            }
        } else {
            if (this.data.purchaseList[index].freight == '') {
                this.data.purchaseList[index].total_price = (Number(this.data.purchaseList[index].totalAmount2)).toFixed(2);
            } else {
                this.data.purchaseList[index].total_price = ((Number(this.data.purchaseList[index].totalAmount2*100) - Number(this.data.purchaseList[index].freight*100))/100).toFixed(2);
            }
        }
        
        this.setData({
            purchaseList: this.data.purchaseList,
        })

        console.log('purchaseList:', this.data.purchaseList)

    },

    /**
     * 确认采购
     */
    surePurchaseAction: function() {
        console.log('确认采购')
        this.setData({
            surePurchase: false,
            toastContent: '确定采购药品吗？',
            toastCancel: '取消',
            toastSure: '确定',
        })
    },

    /**
     * 取消
     */
    cancelAction: function() {
        console.log('取消')
        this.setData({
            surePurchase: true
        })
    },

    /**
     * 确定
     */
    sureAction: function() {
        console.log('确定')
        if (!this.data.isSureToast){
            wx.navigateTo({
                url: '../consigneeInfo/consigneeInfo',
            })
            this.setData({ isSureToast: true })
        }else{
            this.setData({
                surePurchase: true
            })
            if (this.data.sanJumpType == 2) {
                this.surePurchaseScanRequest();
            } else {
                //处理请求
                this.surePurchaseRequest();
            }
        }
        
    },

    /**
     * 获取收货人信息
     */
    getUserRequest: function() {
        var that = this;
        var param = {
            clinicId: that.data.clinicId
        };
        var url = util.BASE_URL + util.ENQUIRY_ORDER_NEW_CLINIC_ADDRESS_TO_WX;
        util.getDataJson(url, param, res => {
            console.log('获取收货人信息 res:', res)
            if (res.data && res.data.code == '0000') {
                that.setData({
                    userInfo: res.data.data,
                })
            }
        })
    },

    /**
     * 确认采购
     */
    surePurchaseRequest: function() {
        var that = this;
        var data = this.groupPurchaseData();
        console.log('data:', data)

        var param = {
            data: JSON.stringify(data)
        };
        var url = util.BASE_URL + util.ORDERS_CREATE_ORDER_ALSO_SPLIT;
        util.getDataJson(url, param, res => {
            console.log('确认采购 res:', res)
            if (res.data && res.data.code == '0000') {
                wx.reLaunch({
                    url: '../purchaseNote/purchaseNote',
                })
            } else {
                wx.showToast({
                    icon: 'none',
                    title: '采购失败',
                })
            }
        })
    },

    /**
     * 商城扫码确认采购
     */
    surePurchaseScanRequest: function() {
        var that = this;
        if (this.data.userInfo.areaCode == '' || typeof this.data.userInfo.areaCode == 'undefined') {
            // wx.showToast({
            //     icon: 'none',
            //     title: '地区信息不完善',
            // })
            that.setData({
                isSureToast: false,
                toastContent: '请您去完善收货信息',
                toastCancel: '',
                toastSure: '确定',
            })
            return;
        }
        var data = this.groupPurchaseScanData();
        console.log('data:', data)

        var param = {
            data: JSON.stringify(data)
        };
        var url = util.BASE_URL + util.ORDERS_SAVE_ACTIVE_ORDERS;
        util.getDataJson(url, param, res => {
            console.log('确认采购 res:', res)
            if (res.data && res.data.code == '0000') {
                //小程序退出时情况扫码采购药品
                wx.setStorageSync('SCANDRUGLIST', '')
                wx.reLaunch({
                    url: '../purchaseNote/purchaseNote',
                })
            } else {
                wx.showToast({
                    icon: 'none',
                    title: '采购失败',
                })
            }
        })
    },

    /**
     * 组合数据
     */
    groupPurchaseData: function() {
        var dList = [];
        for (var i = 0; i < this.data.purchaseList.length; i++) {
            dList.push(this.groupDataListData(this.data.purchaseList[i]))
        }

        var param = {
            clinicId: this.data.clinicId,
            enquiryId: this.data.purchaseList[0].enquiry_order_id,
            dataList: dList,
        };

        return param;
    },

    /**
     * 商城扫码确认采购组合数据
     */
    groupPurchaseScanData: function() {
        var dList = [];
        for (var i = 0; i < this.data.purchaseList.length; i++) {
            dList.push(this.groupDataListData(this.data.purchaseList[i]))
        }

        var param = {
            clinicId: this.data.clinicId,
            enquiryId: this.data.purchaseList[0].enquiry_order_id,
            consigneeName: this.data.userInfo.consigneeName,
            consigneePhone: this.data.userInfo.consigneePhone,
            provinceCode: this.data.userInfo.provinceCode,
            cityCode: this.data.userInfo.cityCode,
            areaCode: this.data.userInfo.areaCode,
            address: this.data.userInfo.consigneeAddress,
            words: '',
            dataList: dList,
        };

        return param;
    },

    groupDataListData: function(companyObj) {
        var busList = [];
        for (var i = 0; i < companyObj.dataArray.length; i++) {
            busList.push(this.groupBusListData(companyObj.dataArray[i]))
        }
        if (companyObj.freight == '') {
            companyObj.freight = '0';
        }
        var obj = {
            busId: companyObj.business_id,
            sysUserId: companyObj.sys_user_id,
            freight: companyObj.freight,
            busList: busList,
        };

        return obj;
    },

    groupBusListData: function(offerObj) {
        var discountPrice = typeof offerObj.discountPrice != 'undefined' ? offerObj.discountPrice : '';
        var activityInfoId = typeof offerObj.activityInfoId != 'undefined' ? offerObj.activityInfoId : '';
        var obj = {
            num: offerObj.num,
            offerOrderInfoId: offerObj.offerOrderInfoId,
            discountPrice: discountPrice,
            activityInfoId: activityInfoId,
            medicinalId: offerObj.medicinalId,
            medicinalName: offerObj.medicinalName,
            unit: offerObj.unit,
            smallUnit: offerObj.samllUnit,
            scaler: offerObj.scaler,
            norms: offerObj.norms,
            medicinalCompanyName: offerObj.medicinalCompanyName,
            price: offerObj.price,
            invalidTime: offerObj.invalidTime,
        };

        return obj;
    },
})