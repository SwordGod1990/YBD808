// pages/company/createEnquiry/createEnquiry.js
var util = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        drugTypeNum: 0, //药品种类
        drugCode: '', //药品条码
        isShoppingClick: false, //是否点击过购物车,当点击过一次购物车后直接跳转到下一页面
        isScanShow: false, //扫码成功后弹出药品窗口
        drugName: '', //药名
        drugSpecs: '', //规格
        drugCompany: '', //生产厂家
        drugNum: 0, //药品数量
        drugCatList: [], //购物车集合
        tostView: 0, //1.显示删除弹窗, 2.扫码添加药品弹窗
        jumpType: 0, //1. 编辑页面
        orderId: '', //询价单ID
        cancelTxt: '',
        sureTxt: '',
        srarchDrugNum: 0,
        isFirstShoppingCat: false, //判断购物车是否第一次点击
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.data.jumpType = options.jumpType;
        this.data.orderId = options.enquiryId;
        var userId = wx.getStorageSync('USERID');
        if (userId != '') {
            var str = wx.getStorageSync(userId);
            console.log('str:', str)
            if (str != '') {
                var drugList = JSON.parse(str)
                this.setData({
                    drugCatList: drugList,
                })
                var num = this.calculateDrugAmount();
                this.setData({ drugNum: num, })
            }

        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        if (this.data.jumpType == 1) {
            this.getOfferInfoRequest();
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.data.isDoubleClick = true;
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
        //缓存购物车
        var userId = wx.getStorageSync('USERID');
        var state = wx.getStorageSync(userId);
        if(state != '1'){
            wx.setStorageSync(userId, JSON.stringify(this.data.drugCatList))
        }else{
            wx.setStorageSync(userId, '')
        }
        
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    changeAction: function (arry) {
        this.setData({
            drugCatList: arry,
        })
        var num = this.calculateDrugAmount();
        this.setData({ drugNum: num, })
        // console.log('drugCatList:', this.data.drugCatList)
    },

    /**
     * 搜索添加药品
     */
    searchAction: function () {
        console.log('搜索添加药品')
        wx.navigateTo({
            url: '../search/search',
        })
    },

    /**
     * 扫码添加药品
     */
    scanAction: function () {
        console.log('扫码添加药品')
        var that = this;
        wx.scanCode({
            scanType: 'barCode',
            success: (res) => {
                console.log('res:', res)
                that.data.drugCode = res.result;
                that.barCodeDrugRequest(res.result);
            },
        })
    },



    /**
     * 取消
     */
    addDrugAction: function () {
        this.data.isScan = false;
        this.addCat(this.data.drugList[0]);
        var num = this.calculateDrugAmount();
        this.setData({ drugNum: num, })
        this.setData({ toastView: 0, })
    },

    /**
     * 手动添加药品
     */
    manualAction: function () {
        console.log('手动添加药品')
        wx.navigateTo({
            url: '../addDrug/addDrug',
        })
    },

    /**
     * 购物车
     */
    shoppingCatAction: function () {
        console.log('购物车')
        if (this.data.drugCatList.length == 0) {
            return;
        }
        this.setData({ isShoppingClick: true })
        this.data.isFirstShoppingCat = true;
    },

    /**
     * 确定
     */
    sureChooseAction: function () {
        console.log('确定')
        // wx.setStorageSync('bindingUser', true);
        var bindingUser = wx.getStorageSync('bindingUser')
        var userId = wx.getStorageSync('USERID');
        wx.setStorageSync(userId, JSON.stringify(this.data.drugCatList))


        if (this.data.drugCatList.length > 0) {
            if (this.data.isDoubleClick) {
                this.data.isDoubleClick = false;
                if (this.data.isFirstShoppingCat) {
                    var userId = wx.getStorageSync('USERID');
                    wx.setStorageSync(userId, JSON.stringify(this.data.drugCatList))
                    wx.navigateTo({
                        url: '../sureEnquiry/sureEnquiry?drugNum=' + this.data.drugNum,
                    })
                } else {
                    this.setData({
                        isShoppingClick: true,
                        isFirstShoppingCat: true,
                    })
                    this.data.isDoubleClick = true;
                }
            }
        }
    },

    /**
     * 条码搜索药品
     */
    barCodeDrugRequest: function (drugCode) {
        var that = this;
        var param = { medicinalCode: drugCode };
        var url = util.BASE_URL + util.ENQUIRY_ORDER_QUERY_MEDICINAL_BY_CODE;
        util.getDataJson(url, param, res => {
            console.log('条码搜索药品 res:', res)
            if (res.data && res.data.code == '0000' && res.data.data.length > 0) {
                res.data.data[0].num = 5;
                that.data.drugList = res.data.data;
                that.setData({
                    toastView: 2,
                    cancelTxt: '加入询价单',
                    sureTxt: '加入并继续添加',
                    drugName: that.data.drugList[0].medicinalName,
                    drugSpecs: that.data.drugList[0].norms + '*' + that.data.drugList[0].scaler + that.data.drugList[0].smallUnit + '/' + that.data.drugList[0].unit,
                    drugCompany: that.data.drugList[0].medicinalCompanyName,
                    srarchDrugNum: that.data.drugList[0].num,
                })
            }else{
                wx.showToast({
                    icon: 'none',
                    title: '未搜索到药品信息',
                })
            }
        })
    },

    /**
     * 药品数量减 每次减 1
     */
    minusAction: function (e) {
        console.log('药品数量减 e:', e)
        var index = e.currentTarget.id;
        if (this.data.isShoppingClick) {
            if (this.data.drugCatList[index].num == 1) {
                this.setData({
                    toastView: 1,
                    drugName: this.data.drugCatList[index].medicinalName, //药名
                    drugSpecs: this.data.drugCatList[index].norms + '*' + this.data.drugCatList[index].scaler + this.data.drugCatList[index].smallUnit + '/' + this.data.drugCatList[index].unit, //规格
                    drugCompany: this.data.drugCatList[index].medicinalCompanyName, //生产厂家
                })
                this.data.deleteIndex = index;
            } else {
                var num = 'drugCatList[' + index + '].num';
                var tempNum = (this.data.drugCatList[index].num - 1) > 0 ? (this.data.drugCatList[index].num - 1) : 0;
                this.setData({
                    [num]: tempNum,
                })
                var num = this.calculateDrugAmount();
                this.setData({ drugNum: num, })
            }
        } else {
            if (this.data.drugList[0].num == 1) {
                return;
            }
            var num = 'drugList[' + 0 + '].num';
            var tempNum = (this.data.drugList[0].num - 1) > 0 ? (this.data.drugList[0].num - 1) : 0;
            this.setData({
                [num]: tempNum,
            })
            this.setData({
                drugName: this.data.drugList[0].medicinalName,
                drugSpecs: this.data.drugList[0].norms + '*' + this.data.drugList[0].scaler + this.data.drugList[0].smallUnit + '/' + this.data.drugList[0].unit,
                drugCompany: this.data.drugList[0].medicinalCompanyName,
                srarchDrugNum: this.data.drugList[0].num,
            })
        }
    },

    /**
     * 药品数量加 每次加 5
     */
    addAction: function (e) {
        console.log('药品数量加 e:', e)
        var index = e.currentTarget.id;
        if (this.data.isShoppingClick) {
            var num = 'drugCatList[' + index + '].num';
            this.setData({
                [num]: this.data.drugCatList[index].num + 5,
            })
            var num = this.calculateDrugAmount();
            this.setData({ drugNum: num, })
        } else {
            var num = 'drugList[' + 0 + '].num';
            this.setData({
                [num]: this.data.drugList[0].num + 5,
            })
            this.setData({
                drugName: this.data.drugList[0].medicinalName,
                drugSpecs: this.data.drugList[0].norms + '*' + this.data.drugList[0].scaler + this.data.drugList[0].smallUnit + '/' + this.data.drugList[0].unit,
                drugCompany: this.data.drugList[0].medicinalCompanyName,
                srarchDrugNum: this.data.drugList[0].num,
            })
        }
    },

    /**
     * 添加药品到购物车
     */
    addCat: function (obj) {
        for (var i = 0; i < this.data.drugCatList.length; i++) {
            if (this.data.drugCatList[i].medicinalId == obj.medicinalId) {
                var num = 'drugCatList[' + i + '].num';
                this.setData({
                    [num]: this.data.drugCatList[i].num + obj.num,
                })
                return;
            }
        }
        this.setData({
            drugCatList: this.data.drugCatList.concat(obj),
        })
        var num = this.calculateDrugAmount();
        this.setData({ drugNum: num, })
    },

   
    /**
     * 关闭弹窗
     */
    closeAction: function () {
        this.setData({
            toastView: 0,
            isScanShow: true,
        })
    },

    /**
     * 添加购物车
     */
    addEnquiryAction: function () {
        //加入购物车
        this.addCat(this.data.drugList[0]);
        var num = this.calculateDrugAmount();
        this.setData({ drugNum: num, })
        this.setData({ toastView: 0, })
        this.scanAction();
    },

    /**
     * 计算药品的件数
     */
    calculateDrugAmount: function () {
        var num = 0;
        for (var i = 0; i < this.data.drugCatList.length; i++) {
            num = num + this.data.drugCatList[i].num;
        }
        return num;
    },

    /**
     * 关闭弹窗
     */
    closeWindowAction: function () {
        this.setData({
            isShoppingClick: false,
        })
    },

    /**
     * 购物车内容部分
     */
    catListAction: function () {
        //什么都不需要做，阻止事件传递
        console.log('购物车内容部分')
    },

    /**
         * 删除药品
         */
    deleteAction: function () {
        this.data.drugCatList.splice(this.data.deleteIndex, 1)
        this.setData({
            drugCatList: this.data.drugCatList,
            toastView: 0,
        })
        var num = this.calculateDrugAmount();
        if (num == 0) {
            this.setData({
                isShoppingClick: false,
            })
        }
        this.setData({ drugNum: num, })
        var userId = wx.getStorageSync('USERID');
        wx.setStorageSync(userId, JSON.stringify(this.data.drugCatList))
    },

    /**
     * 取消删除
     */
    cancelAction: function () {
        this.setData({ toastView: 0 })
    },

    /**
    * 获取报价信息
    */
    getOfferInfoRequest: function () {
        var that = this;
        var param = { enquiryId: that.data.orderId };
        var url = util.BASE_URL + util.OFFER_ORDER_QUERY_OFFER_ORDER_BY_ENQUIRY_ID2;
        util.getDataJson(url, param, res => {
            console.log('获取报价信息 res:', res)
            if (res.data && res.data.code == '0000' && res.data.data.length > 0) {
                that.setData({
                    drugCatList: res.data.data,
                })
                if (that.data.drugCatList.length == 0) {
                    return;
                }
                that.setData({ isShoppingClick: true })
                var num = that.calculateDrugAmount();
                that.setData({ drugNum: num, })
            }
        })
    },

    

})