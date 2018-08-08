// pages/company/offer/offer.js
var util = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isDoubleClick: true, //防止多次点击
        isShoppingClick: false, //是否点击过购物车,当点击过一次购物车后直接跳转到下一页面
        currentTab: 0, //0：医药公司报价， 1， 单个药品报价
        shoppingDouble: 0, //0,未点击过购物车（弹出清单列表）， 1，弹出过一次清单
        companyIndex: 0, //默认，选中公司下标
        drugIndex: 0, //默认，选中药品下标
        userId: '', //用户ID
        orderId: '', //订单ID
        drugList: '', //单个药品报价列表
        companyList: '', //查看医药公司报价公司列表
        offerList: '', //右边报价信息列表
        freight: '', //运费
        leaveMessage: '', //留言
        drugCatList: [], //购物车集合
        drugNum: 0, //药品件数
        drugType: [], //药品的种类存储ID
        words: '', //询价单留言
        currentCompanyId: '', //当前公司ID
        currentMedicinalId: '', //当前药品ID
        salesmanName: '', //业务员
        toastView: 0, //是否显示删除
        deleteIndex: -1, //记录删除下标
        deleteDrugIndex: -1, //记录删除下标
        businessId:'', //公司ID

        arr:[1,2,3,4,5,5,6]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('index:', options)
        // this.data.companyIndex = options.index;
        // if (options.businessId >= 0) {
            this.setData({
                businessId: options.businessId,
                userId: options.sysUserId,
                orderId: options.enquiryOrderId,
                words: options.words,
            })
        // }


    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        //查询单个商品报价信息
        this.searchCompanyRequest();
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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    /**
     * 添加采购
     */
    addPurchaseAction: function (e) {
        console.log('e:', e);
        var index = e.currentTarget.id;
        //添加到购物车代码
        console.log('offerList:', this.data.offerList[index])
        if (this.data.currentTab == 0) {
            this.addCat(this.data.offerList[index]);

        } else {
            this.data.currentCompanyId = this.data.offerList[index].businessId;
            this.data.salesmanName = this.data.offerList[index].realName;
            this.addCat(this.data.offerList[index]);
        }

        console.log('drugCatList:', this.data.drugCatList)
        var num = this.calculateDrugAmount();
        this.setData({ drugNum: num, })
        this.calculateTotalAmount();
        console.log('index:', index)

    },

    /**
     * 添加药品到购物车
     */
    addCat: function (obj) {
        var medicinalId = '';
        if (this.data.currentTab == 0) {
            medicinalId = obj.medicinalId;
        } else {
            medicinalId = this.data.currentMedicinalId;
        }
        if (this.data.drugType.indexOf(medicinalId) == -1) {
            this.data.drugType.push(medicinalId)
            this.setData({
                drugType: this.data.drugType,
            })

        }
        console.log(this.data.drugType);
        console.log('=======', this.data.drugCatList);
        for (var i = 0; i < this.data.drugCatList.length; i++) {
            if ((this.data.drugCatList[i].business_id == this.data.currentCompanyId) && (this.data.drugCatList[i].realName == this.data.salesmanName)) {
                for (var j = 0; j < this.data.drugCatList[i].dataArray.length; j++) {
                    var medicinalObject = this.data.drugCatList[i].dataArray[j];
                    if (medicinalObject.medicinalId == medicinalId) {
                        medicinalObject.num = medicinalObject.num + obj.num;
                        this.setData({
                            drugCatList: this.data.drugCatList,
                        })
                        return;
                    }
                }
                this.data.drugCatList[i].dataArray.push(this.groupDrugObj(obj, medicinalId));
                this.setData({
                    drugCatList: this.data.drugCatList,
                })
                return;
            }
        }
        this.setData({
            drugCatList: this.data.drugCatList.concat(this.groupShoppingCat(obj, medicinalId)),
        })

    },

    /**
     * 计算药品种类
     */
    calculateDrugType: function () {
        var tempType = [];
        console.log('this.data.drugCatList:', this.data.drugCatList)
        if (this.data.drugCatList.length > 0) {
            for (var i = 0; i < this.data.drugCatList.length; i++) {
                for (var j = 0; j < this.data.drugCatList[i].dataArray.length; j++) {
                    var medicinalId = this.data.drugCatList[i].dataArray[j].medicinalId;
                    console.log('d:', medicinalId)
                    if (tempType.indexOf(medicinalId) == -1) {
                        console.log('d')
                        tempType.push(medicinalId)
                    }
                }
            }
        }
        console.log('tempType:', tempType)
        return tempType;
    },

    /**
     * 组合集合
     * obj： 药品集合
     */
    groupShoppingCat: function (obj, medicinalId) {
        var arry = [];
        // var medicinalId = '';
        var businessId = '';
        var companyName = '';
        var enquiryOrderId = '';
        var freight = '';
        var isLowest = '';
        var offerOrderId = '';
        var sysUserId = '';
        var totalPrice = '';
        var words = '';
        var realName = '';
        var realPhone = '';
        if (this.data.currentTab == 0) {
            var temp = this.data.companyList[this.data.companyIndex];
            console.log('temp:', temp)
            businessId = temp.business_id;
            companyName = temp.company_name;
            enquiryOrderId = this.data.orderId;
            freight = temp.freight;
            isLowest = temp.isLowest;
            sysUserId = temp.sys_user_id;
            totalPrice = parseFloat(temp.price) * parseFloat(temp.num);
            words = temp.words;
            realName = temp.realName;
            realPhone = temp.realPhone;
        } else {
            businessId = obj.businessId;
            companyName = obj.companyName;
            enquiryOrderId = this.data.orderId;
            freight = obj.freight;
            // isLowest = temp.isLowest;
            sysUserId = obj.sysUserId;
            totalPrice = parseFloat(obj.price) * parseFloat(obj.num);
            words = obj.words;
            realName = obj.realName;
            realPhone = obj.realPhone;
        }

        var drugObj = this.groupDrugObj(obj, medicinalId);
        arry.push(drugObj);
        var companyObj = {
            business_id: businessId,
            company_name: companyName,
            dataArray: arry,
            enquiry_order_id: enquiryOrderId,
            freight: freight,
            isLowest: isLowest,
            realName: realName,
            realPhone: realPhone,
            sys_user_id: sysUserId,
            total_price: totalPrice,
            words: words,
        }

        return companyObj;
    },

    /**
     * 组合药品对象
     */
    groupDrugObj: function (obj, medicinalId) {
        var drugObj = {
            invalidTime: obj.invalidTime,
            medicinalCompanyName: obj.medicinalCompanyName,
            medicinalId: medicinalId,
            medicinalName: obj.medicinalName,
            norms: obj.norms,
            num: obj.num,
            price: obj.price,
            scaler: obj.scaler,
            smallUnit: obj.smallUnit,
            unit: obj.unit,
            offerOrderInfoId: obj.offerOrderInfoId,
        }
        return drugObj;
    },

    /**
     * 计算药品的件数
     */
    calculateDrugAmount: function () {
        var num = 0;
        for (var i = 0; i < this.data.drugCatList.length; i++) {
            for (var j = 0; j < this.data.drugCatList[i].dataArray.length; j++) {
                var medicinalObject = this.data.drugCatList[i].dataArray[j];
                num = num + medicinalObject.num;
            }
        }
        return num;
    },

    /**
     * 计算总价
     */
    calculateTotalAmount: function () {
        for (var i = 0; i < this.data.drugCatList.length; i++) {
            var total = 0;
            var temp = this.data.drugCatList[i].dataArray;
            for (var j = 0; j < temp.length; j++) {
                total = (total + parseFloat(temp[j].num) * parseFloat(temp[j].price));
            }
            this.data.drugCatList[i].total_price = total;
        }
        console.log('calculateTotalAmount:', this.data.drugCatList)
    },

    /**
     * 药品数量减 每次减 1
     */
    minusAction: function (e) {
        console.log('药品数量减 e:', e)
        var drugIndex = e.target.dataset.drugindex;
        var index = e.currentTarget.id;

        if (this.data.isShoppingClick) {
            if (this.data.drugCatList[drugIndex].dataArray[index].num == 1) {
                this.setData({
                    toastView: 1,
                    drugName: this.data.drugCatList[drugIndex].dataArray[index].medicinalName, //药名
                    drugSpecs: this.data.drugCatList[drugIndex].dataArray[index].norms + '*' + this.data.drugCatList[drugIndex].dataArray[index].scaler + this.data.drugCatList[drugIndex].dataArray[index].smallUnit + '/' + this.data.drugCatList[drugIndex].dataArray[index].unit, //规格
                    drugCompany: this.data.drugCatList[drugIndex].dataArray[index].medicinalCompanyName, //生产厂家
                })
                this.data.deleteIndex = index;
                this.data.deleteDrugIndex = drugIndex;
            } else {
                this.data.drugCatList[drugIndex].dataArray[index].num = this.data.drugCatList[drugIndex].dataArray[index].num - 1;
                if (this.data.drugCatList[drugIndex].dataArray[index].num < 0) {
                    this.data.drugCatList[drugIndex].dataArray[index].num = 0;
                }
                this.setData({
                    drugCatList: this.data.drugCatList,
                })
                var num = this.calculateDrugAmount();
                this.setData({ drugNum: num, })
            }
        }
        this.calculateTotalAmount();
       
    },

    /**
     * 药品数量加 每次加 5
     */
    addAction: function (e) {
        console.log('药品数量加 e:', e)
        var drugIndex = e.target.dataset.drugindex;
        var index = e.currentTarget.id;
        if (this.data.isShoppingClick) {
            this.data.drugCatList[drugIndex].dataArray[index].num = this.data.drugCatList[drugIndex].dataArray[index].num + 5;
            if (this.data.drugCatList[drugIndex].dataArray[index].num > 9999) {
                this.data.drugCatList[drugIndex].dataArray[index].num = 9999;
            }
            this.setData({
                drugCatList: this.data.drugCatList,
            })
            var num = this.calculateDrugAmount();
            this.setData({ drugNum: num, })
        }
        this.calculateTotalAmount();
    },

    /**
     * 报价单信息
     */
    offerAction: function (e) {
        console.log('报价单信息:', e);
        var index = e.currentTarget.id;
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            //添加到购物车代码
            wx.navigateTo({
                url: '../offerInfo/offerInfo?id=',
            })

        }
        console.log('index:', index)
    },

    /**
     * 确定
     */
    sureChooseAction: function () {
        console.log('确定e')
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            //添加到购物车代码
            wx.navigateTo({
                url: '../purchase/purchase?words=' + this.data.words,
            })
            this.setData({ isShoppingClick: false })
        }
    },

    /**
     * 选好了
     */
    sureChooseActionD: function () {
        console.log('选好了')
        if (this.data.drugCatList.length > 0) {
            if (this.data.shoppingDouble == 1) {
                this.sureChooseAction();
            } else {
                this.setData({ isShoppingClick: true });
            }
            this.data.shoppingDouble = 1;
        }
    },

    /**
     * 购物车点击
     */
    shoppingCatAction: function () {
        console.log('购物车点击')
        if (this.data.drugCatList.length > 0) {
            this.data.shoppingDouble = 1;
            this.setData({ isShoppingClick: true });
        }
    },

    /**
     * 关闭弹出窗口
     */
    closeAction: function () {
        console.log('关闭弹出窗口')
        this.setData({ isShoppingClick: false })
    },

    closeAction2: function () {
        console.log('拦截关闭窗口事件')
    },

    /**
     * 查看医药公司报价
     */
    companyOfferAction: function () {
        console.log('查看医药公司报价')
        this.setData({ currentTab: 0 })
        //查询单个商品报价信息
        this.searchCompanyRequest();
    },

    /**
     * 查看药品报价
     */
    drugOfferAction: function () {
        console.log('查看药品报价')
        this.setData({ currentTab: 1 })
        //查询单个商品报价信息
        this.searchDrugRequest();
    },

    /**
     * 点击公司
     */
    companyAction: function (e) {
        console.log('点击公司')
        var index = e.currentTarget.id;
        this.setData({ companyIndex: index })
        this.setData({
            offerList: this.data.companyList[index].dataArray,
            freight: this.data.companyList[index].freight,
            leaveMessage: this.data.companyList[index].words,
            currentCompanyId: this.data.companyList[index].business_id,
            salesmanName: this.data.companyList[index].realName,
        })
    },

    /**
     * 点击药品
     */
    drugAction: function (e) {
        console.log('点击药品')
        var index = e.currentTarget.id;
        this.setData({ drugIndex: index })
        this.setData({ offerList: this.data.drugList[index].value })
        this.data.currentMedicinalId = this.data.drugList[index].medicinalId,
            console.log('offerList:', this.data.offerList)
    },

    /**
     * 查看单个药品报价
     */
    searchDrugRequest: function () {
        var that = this;
        var param = { sysUserId: that.data.userId, enquiryOrderId: that.data.orderId };
        var url = util.BASE_URL + util.OFFER_ORDER_ENQUIRY_MEDICINAL_OFFER;
        util.getDataJson(url, param, res => {
            console.log('查询单个商品报价信息res:', res)
            if (res.data && res.data.code == '0000' && res.data.content.length > 0) {
                that.setData({
                    drugList: res.data.content,
                    offerList: res.data.content[that.data.drugIndex].value,
                    currentMedicinalId: res.data.content[that.data.drugIndex].medicinalId,
                })
            }

        })
    },

    /**
     * 查看医药公司报价
     */
    searchCompanyRequest: function () {
        var that = this;
        var param = { enquiryId: that.data.orderId };
        var url = util.BASE_URL + util.OFFER_ORDER_ENQUIRY_COMPANIES_OFFER;
        util.getDataJson(url, param, res => {
            console.log('查看医药公司报价 res:', res)
            if (res.data && res.data.code == '0000' && res.data.busdataArray.length > 0) {
                if (that.data.businessId != ''){
                    for (var i = 0; i < res.data.busdataArray.length; i++) {
                        if (that.data.businessId == res.data.busdataArray[i].business_id) {
                            that.setData({
                                companyIndex:i,
                            })
                        }
                    }
                }
                
                that.setData({
                    companyList: res.data.busdataArray,
                    offerList: res.data.busdataArray[that.data.companyIndex].dataArray,
                    freight: res.data.busdataArray[that.data.companyIndex].freight,
                    leaveMessage: res.data.busdataArray[that.data.companyIndex].words,
                    currentCompanyId: res.data.busdataArray[that.data.companyIndex].business_id,
                    salesmanName: res.data.busdataArray[that.data.companyIndex].realName,
                })
            }

        })
    },

    /**
     * 删除
     */
    deleteAction: function () {
        console.log('drugCatList:', this.data.drugCatList)
        if (this.data.drugCatList.length > 1) {
            if (this.data.drugCatList[this.data.deleteDrugIndex].dataArray.length > 1) {
                this.data.drugCatList[this.data.deleteDrugIndex].dataArray.splice(this.data.deleteIndex, 1);
            } else {
                var medicinalId = this.data.drugCatList[this.data.deleteDrugIndex].dataArray[this.data.deleteIndex].medicinalId;
                var indexId = this.data.drugType.indexOf(medicinalId)
                this.data.drugType.splice(indexId, 1);
                console.log('drugType:', this.data.drugType)
                this.data.drugCatList.splice(this.data.deleteDrugIndex, 1);
            }
           
        } else {
            if (this.data.drugCatList[this.data.deleteDrugIndex].dataArray.length > 1) {
                var medicinalId = this.data.drugCatList[this.data.deleteDrugIndex].dataArray[this.data.deleteIndex].medicinalId;
                var indexId = this.data.drugType.indexOf(medicinalId)
                this.data.drugType.splice(indexId, 1);
                console.log('drugType:', this.data.drugType)
                this.data.drugCatList[this.data.deleteDrugIndex].dataArray.splice(this.data.deleteIndex, 1);

            } else {
                this.data.drugCatList = [];
                this.data.drugType = [];
                this.setData({ isShoppingClick: false })
            }
            
        }
        this.data.drugType = this.calculateDrugType();
        this.setData({
            toastView: 0,
            drugCatList: this.data.drugCatList,
            drugType: this.data.drugType,
        })
        var num = this.calculateDrugAmount();
        this.setData({ drugNum: num, })
        this.calculateTotalAmount();
    },

    /**
     * 取消
     */
    cancelAction: function () {
        this.setData({
            isShoppingClick: false,
            toastView: 0,
        })
    },

})