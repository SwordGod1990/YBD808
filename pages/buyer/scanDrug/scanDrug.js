// pages/buyer/scanDrug/scanDrug.js
var util = require('../../../utils/util.js')
var stringUtil = require('../../../utils/stringUtil.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isShowgift: false, //true: 展开赠品, false: 收起赠品
        isCheckIn: true, //是否入住诊所 true: 入住, false: 未入住
        drugCatList: [], //药品集合
        drugList: [], //扫码药品集合
        activityInfoId: '', //活动ID
        drugInfo: {}, //扫码获取药品信息和赠品信息
        isScanToast: true, //false:扫码显示药品信息
        isDoubleClick: true, //防止多次点击
        userId: '', //用户Id
        pageNum: 2, //0,不显示任何页面; 1,显示立即注入; 2:显示宣传页面,或显示采购数据页面; 3:商业公司用户扫码,提示扫码错误
        errorMsg: '抱歉，暂不支持商家购买!', //错误提示
        errorImg: '/Images/error_icon.png', //错误提示图片
        toastContent: '确定删除药品吗？',
        toastCancel: '取消',
        toastSure: '确定',
        surePurchase: true,
        deleteIndex: -1, //删除药品下标
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.data.userId = wx.getStorageSync('USERID')
        console.log('userId:', this.data.userId)
        console.log('扫码购药 options:', options)
        if (typeof options.activityInfoId != 'undefined') {
            this.data.activityInfoId = options.activityInfoId;
            this.getDrugRequest();
        }

        //获取缓存的数据
        var str = wx.getStorageSync('SCANDRUGLIST');
        console.log('str:', str)
        
        if (str != '' && typeof str != 'undefined') {
            this.setData({
                drugList: JSON.parse(str),
            })
            console.log('str:', JSON.parse(str))
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        // this.getDrugRequest();
        var pages = getCurrentPages();
        var prePage = pages[pages.length - 2];
        prePage.setData({
            activityInfoId: '',
        })
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
     * 确定
     */
    sureAction: function (){
        this.data.isDoubleClick = true;
        this.setData({ surePurchase: true })
        this.data.drugList.splice(this.data.deleteIndex, 1);
        this.setData({
            drugList: this.data.drugList,
        })
        wx.showToast({
            icon: 'none',
            title: '删除成功',
        })
        //缓存药品
        wx.setStorageSync('SCANDRUGLIST', JSON.stringify(this.data.drugList));
    },

    /**
     * 拨打电话
     */
    callServicePhoneAction: function() {
        wx.makePhoneCall({
            phoneNumber: '4006669196',
        })
    },

    /**
     * 展开赠品信息
     */
    isShowAction: function(e) {
        console.log('展开赠品信息:', e)
        this.setData({
            isShowgift: !this.data.isShowgift,
        })
    },

    /**
     * 删除
     */
    deleteAction: function(e) {
        console.log('删除 e:', e)
        this.data.deleteIndex = e.currentTarget.id;
        this.setData({ surePurchase: false})
    },

    /**
     * 取消
     */
    cancelAction: function() {
        this.setData({
            isScanToast: true,
        })
        this.data.isDoubleClick = true;
        this.setData({ surePurchase: true })
    },

    /**
     * 药品数量减
     */
    minusAction: function(e) {
        console.log('药品数量减:', e)
        var index = e.currentTarget.id;
        var num = this.data.drugList[index].num;
        var minNum = this.data.drugList[index].minNum;
        if (num > minNum) {
            var drugNum = 'drugList[' + index + '].num';
            this.setData({
                [drugNum]: num - 1,
            })
        } else {
            wx.showToast({
                icon: 'none',
                title: '不能低于活动最低采购药品',
            })
        }
        //缓存药品
        wx.setStorageSync('SCANDRUGLIST', JSON.stringify(this.data.drugList));
    },

    /**
     * 药品数量加
     */
    addAction: function(e) {
        console.log('药品数量加:', e)
        var index = e.currentTarget.id;
        var num = parseInt(this.data.drugList[index].num);
        console.log('num:', num + 5)
        if (num < 9995) {
            var drugNum = 'drugList[' + index + '].num';
            this.setData({
                [drugNum]: num + 5,
            })
        } else if (num >= 9995) {
            var drugNum = 'drugList[' + index + '].num';
            this.setData({
                [drugNum]: 9999,
            })
        } else {
            wx.showToast({
                icon: 'none',
                title: '采购数量最多不能超过9999',
            })
        }
        //缓存药品
        wx.setStorageSync('SCANDRUGLIST', JSON.stringify(this.data.drugList));
    },

    /**
     * 加入询价单
     */
    addEnquiryAction: function() {
        this.setData({
            isScanToast: true,
        })
        //添加到药品集合
        for (var i = 0; i < this.data.drugList.length; i++) {
            var tempId = this.data.drugList[i].medicinalBaseId;
            var newId = this.data.drugInfo.medicinalBaseId;
            if (tempId == newId) {
                this.data.drugList[i].num = parseInt(this.data.drugList[i].num) + parseInt(this.data.drugInfo.num);
                this.setData({
                    drugList: this.data.drugList
                })
                wx.showToast({
                    icon: 'none',
                    title: '添加成功',
                })
                //缓存药品
                wx.setStorageSync('SCANDRUGLIST', JSON.stringify(this.data.drugList));
                return;
            }
        }
        this.data.drugList.push(this.data.drugInfo);
        this.setData({
            drugList: this.data.drugList
        })
        wx.showToast({
            icon: 'none',
            title: '添加成功',
        })
        console.log('drugList:', this.data.drugList)
        //缓存药品
        wx.setStorageSync('SCANDRUGLIST', JSON.stringify(this.data.drugList));
    },

    /**
     * 扫一扫
     */
    scanAction: function() {
        console.log('扫一扫')
        var that = this;
        wx.scanCode({
            success: (res) => {
                console.log('扫一扫 res:', res)
                var url = res.result;
                this.data.activityInfoId = stringUtil.getUrlParms(url, "activeInfoId");
                if (typeof this.data.activityInfoId != 'undefined' && this.data.activityInfoId != ''){
                    this.getDrugRequest();
                }else{
                    wx.showToast({
                        icon: 'none',
                        title: '二维码异常，请重新扫码',
                    })
                }
            },
            fail: (res) =>{
                wx.showToast({
                    icon: 'none',
                    title: '二维码异常，请重新扫码',
                })
            }
        })
    },

    /**
     * 立即采购
     */
    purchaseAction: function() {
        this.data.drugCatList = [];
        for (var i = 0; i < this.data.drugList.length; i++) {
            var tempBusinessId = this.data.drugList[i].businessId;
            var tempRealId = this.data.drugList[i].sysUserId;
            var tempMedicinalId = this.data.drugList[i].medicinalBaseId;
            this.sameKindChangeNum(this.data.drugList[i], tempBusinessId, tempRealId, tempMedicinalId);
        }

        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            //添加到购物车代码
            wx.navigateTo({
                url: '../purchase/purchase?sanJumpType=2&words=',
            })
        }
        console.log('drugCatList: ', this.data.drugCatList)
    },

    /**
     * 同一种药品改变数量
     */
    sameKindChangeNum: function(obj, tempBusinessId, tempRealId, tempMedicinalId) {
        for (var i = 0; i < this.data.drugCatList.length; i++) {
            var businessId = this.data.drugCatList[i].business_id;
            var realId = this.data.drugCatList[i].sys_user_id;
            if (tempBusinessId == businessId && tempRealId == realId) {
                for (var j = 0; j < this.data.drugCatList[i].dataArray.length; j++) {
                    var medicinalObject = this.data.drugCatList[i].dataArray[j];
                    if (medicinalObject.medicinalId == tempMedicinalId) {
                        medicinalObject.num = parseInt(medicinalObject.num) + parseInt(obj.num);
                        this.setData({
                            drugCatList: this.data.drugCatList,
                        })
                        return;
                    }
                }
                this.data.drugCatList[i].dataArray.push(this.groupMedicineList(obj));
                return;
            } 
            // else {
            //     this.data.drugCatList.push(this.groupCompanyList(obj));
            //     return;
            // }
        }
        
        console.log('this.groupCompanyList(obj):', this.groupCompanyList(obj))
        this.data.drugCatList.push(this.groupCompanyList(obj));
        return;
    },

    /**
     * 扫码根据活动药品ID查询药品信息
     */
    getDrugRequest: function() {
        var that = this;
        // that.data.activityInfoId = '40289e5e6411a1d9016411a6c9120002';
        var param = {
            activityInfoId: that.data.activityInfoId
        };
        var url = util.BASE_URL + util.ORDERS_QR_PURCHASE;
        util.getDataJson(url, param, res => {
            console.log('根据活动ID获取药品,赠品信息 res:', res)
            if (res.data && res.data.code == '0000' && res.data.data != '') {
                res.data.data.minNum = res.data.data.num;
                res.data.data.activityInfoId = that.data.activityInfoId;
                that.setData({
                    drugInfo: res.data.data,
                    isScanToast: false,
                })
            }else{
                wx.showToast({
                    icon: 'none',
                    title: '二维码错误',
                })
            }
        })
    },

    /**
     * 根据公司和联系人为单位拼接药品集合 drugCatList
     */
    groupCompanyList: function(obj) {
        var companyObj = {};
        var dataArr = [];
        var dataArrayObj = this.groupMedicineList(obj);
        dataArr.push(dataArrayObj);
        companyObj.business_id = obj.businessId;
        companyObj.company_name = obj.businessName;
        companyObj.dataArray = dataArr;
        companyObj.enquiry_order_id = '';
        companyObj.freight = obj.freight;
        companyObj.isLowest = '';
        companyObj.realName = obj.realName;
        companyObj.realPhone = obj.phone;
        companyObj.sys_user_id = obj.sysUserId;
        if (obj.activeType == 1) {
            companyObj.totalAmount2 = Number(obj.discountPrice) * Number(obj.num);
            companyObj.total_price = Number(obj.discountPrice) * Number(obj.num);
        }else{
            companyObj.totalAmount2 = Number(obj.price) * Number(obj.num);
            companyObj.total_price = Number(obj.price) * Number(obj.num);
        }
        companyObj.words = '';


        return companyObj;
    },

    /**
     * 组合药品集合
     */
    groupMedicineList: function(obj) {
        var medicineObj = {};
        medicineObj.invalidTime = obj.invalidTime;
        medicineObj.medicinalCompanyName = obj.factory;
        medicineObj.medicinalId = obj.medicinalBaseId;
        medicineObj.activityInfoId = obj.activityInfoId;
        medicineObj.medicinalName = obj.commodityName;
        medicineObj.norms = obj.norms;
        medicineObj.num = obj.num;
        medicineObj.offerOrderInfoId = '';
        medicineObj.price = obj.price;
        medicineObj.scaler = obj.matrix;
        medicineObj.samllUnit = obj.minUnit;
        medicineObj.unit = obj.commonUnit;
        medicineObj.activeType = obj.activeType;
        medicineObj.activityNum = obj.activityNum;
        medicineObj.description = obj.description;
        medicineObj.discountPrice = obj.discountPrice;
        medicineObj.discounts = obj.discounts;
        medicineObj.theme = obj.theme;
        medicineObj.giftCommodityName = obj.giftCommodityName;
        medicineObj.giftCommonUnit = obj.giftCommonUnit;
        medicineObj.giftFactory = obj.giftFactory;
        medicineObj.giftId = obj.giftId;
        medicineObj.giftMatrix = obj.giftMatrix;
        medicineObj.giftMedicinalBasicId = obj.giftMedicinalBasicId;
        medicineObj.giftMinUnit = obj.giftMinUnit;
        medicineObj.giftName = obj.giftName;
        medicineObj.giftNum = obj.giftNum;
        medicineObj.giftSpecifcations = obj.giftSpecifcations;
        medicineObj.giftType = obj.giftType;
        medicineObj.minNum = obj.minNum;
        return medicineObj;
    },


})