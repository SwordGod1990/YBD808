// pages/WaitPriceDetail/WaitPriceDetail.js
var util = require('../../utils/util.js')
var app = getApp()
var canuseUtil = require('../../template/AccountUnuse.js')
var stringUtil = require('../../utils/stringUtil.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userId: '', //用户Id
        disabled: true, //确认按钮是否可点击
        orderInfo: '', //订单信息
        drugList: [], //药品集合信息
        offerDrugNum: 0, //报价的数量
        totalPrice: 0, //总预计销售额
        orderId: '', //询价单ID
        pageNum: 2, //1：加载失败 2：加载成功
        leaveMessage: '', //留言
        freightMoney: '', //运费
        startDate: '', //起始日期
        validitydate: '请输入有效期', //有效期
        isDoubleClick: true, //防止多次点击 true: 可以点击， false: 不可点击
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        that.data.userId = wx.getStorageSync('USERID')
        console.log('options:', options)
        if (options) {
            that.data.orderId = options.itempriceId
            if (that.data.userId != '' && that.data.orderId != '') {
                that.getOrderDetail();
            }
        }

        // 调用函数时，传入new Date()参数，返回值是日期和时间,日期加一天  
        var time = that.addDate(util.formatTime3(new Date()), 1);
        that.setData({
            startDate: time,
            validitydate: time
        });
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
     * 计算预计销售额
     */
    salesPrice: function () {
        var that = this
        var t = 0;
        for (var i = 0; i < that.data.drugList.length; i++) {
            if (that.data.drugList[i].showView) {
                t = t + that.data.drugList[i].num * that.data.drugList[i].price
            }
        }
        return t.toFixed(2);
    },


    /**
     * 单价输入点击
     */
    priceAction: function (e) {
        var that = this
        console.log('单价', e)
        if(e.detail.value == ''){
            return;
        }
        var singlePrice = that.astrictImport(e.detail.value, 4, 2)
        if (singlePrice != 0) {
            var index = e.currentTarget.dataset.index
            that.data.drugList[index].price = e.detail.value
            var money = that.salesPrice()
            that.setData({
                totalPrice: money
            })
        }
    },

    /**
     * 添加供货信息
     */
    addDrugInforAction: function (e) {
        console.log('添加供货信息', e.currentTarget.dataset.index)

        var that = this;
        var index = e.currentTarget.dataset.index;
        //计数报价药品数量
        that.setData({
            offerDrugNum: that.data.offerDrugNum + 1,
        })

        var showView = 'drugList[' + index + '].showView';
        that.setData({
            [showView]: true,
        })

        console.log('drugList:----------------', that.data.drugList)
    },

    /**
     * 关闭编辑药品
     */
    closeDrugInfoAction: function (e) {
        console.log('关闭编辑药品', e.currentTarget.dataset.index)
        var that = this;
        var index = e.currentTarget.dataset.index;
        //计数报价药品数量
        if (that.data.offerDrugNum > 0) {
            that.setData({
                offerDrugNum: that.data.offerDrugNum - 1,
            })
        } else {
            that.setData({
                offerDrugNum: 0,
            })
        }

        //关闭报价是还原之前的数据
        var showView = 'drugList[' + index + '].showView';
        var scaler = 'drugList[' + index + '].scaler';
        var smallUnit = 'drugList[' + index + '].smallUnit';
        var unit = 'drugList[' + index + '].unit';
        var norms = 'drugList[' + index + '].norms';
        that.setData({
            [showView]: false,
            [scaler]: that.data.drugList[index].scaler2,
            [smallUnit]: that.data.drugList[index].smallUnit2,
            [unit]: that.data.drugList[index].unit2,
            [norms]: that.data.drugList[index].norms2,
        })
        var money = that.salesPrice()
        that.setData({
            totalPrice: money
        })
    },

    /**
     * 规格右边（转化多少规格）必须为4位数字
     */
    scalerAction: function (e) {
        var that = this
        console.log('转化率', e)
        var index = e.currentTarget.dataset.index
        console.log('drugList:', that.data.drugList)
        if (that.data.drugList[index].smallUnit != '' && that.data.drugList[index].smallUnit == that.data.drugList[index].unit) {
            var scaler = 'drugList[' + index + '].scaler';
            that.setData({
                [scaler]: 1,
            })
            wx.showToast({
                title: '相同单位换算量为1',
            })
        }else{
            var scaler = 'drugList[' + index + '].scaler';
            that.setData({
                [scaler]: e.detail.value,
            })
        }
    },

    /**
     * 规格输入
     */
    specificationAction: function (e) {
        var that = this
        console.log('规格', e)
        
        var index = e.currentTarget.dataset.index
        var norms = 'drugList[' + index + '].norms';
        console.log('norms:', norms)
        that.setData({
            [norms]: e.detail.value,
        })
        if (e.detail.value == '') {
            wx.showToast({
                title: '规格不能为空',
            })
            return;
        }
        console.log('drugList:', that.data.drugList)
    },

    /**
     * 规格单位点击
     */
    unitAction: function (e) {
        console.log('规格单位点击', e)
        var that = this
        var index = e.currentTarget.dataset.index
        var smallunit = that.data.drugList[index].smallUnit
        var bigunit = that.data.drugList[index].unit
        wx.navigateTo({
            url: '../PackageInfo/PackageInfo?smallunit=' + smallunit + '&bigunit=' + bigunit + '&itemId=' + index,
        })
    },

    //改变相对应的item单位
    ChangeItemUnit: function (index, smallunit, bigunit) {
        var that = this
        var idx = index
        console.log(idx, smallunit, bigunit)

        // that.data.drugList[idx].showView = true

        if (smallunit == bigunit){
            var scaler = 'drugList[' + index + '].scaler';
            that.setData({
                [scaler]: 1,
            }) 
        }
        var smallUnit = 'drugList[' + idx + '].smallUnit';
        var unit = 'drugList[' + idx + '].unit';
        that.setData({
            [smallUnit]: smallunit,
            [unit]: bigunit,
        })
    },

    //弹出有效期
    bindDateChange: function (e) {
        var that = this
        var index = e.currentTarget.dataset.index
        var invalidTime = 'drugList[' + index + '].invalidTime';
        that.setData({
            [invalidTime]: e.detail.value,
        })
    },

    /**
     * 日期，在原有日期基础上，增加days天数，默认增加1天
     */
    addDate: function (date, days) {
        if (days == undefined || days == '') {
            days = 1;
        }
        var date = new Date(date);
        date.setDate(date.getDate() + days);
        var month = date.getMonth() + 1;
        var day = date.getDate();

        return date.getFullYear() + '-' + util.getFormatDate(month) + '-' + util.getFormatDate(day);
    },

    /**
    * 重新加载
    */
    reloadAction: function () {
        var that = this;
        that.QueryPriceDetail();
    },

    /**
     * 确认报价按钮点击
     */
    confirmClick: function () {
        var that = this
        var arr = that.groupUploadList();
        //校验属性是否为空
        if (that.propertyIsEmpty(arr) && that.data.isDoubleClick) {
            that.data.isDoubleClick = false;

            var userInfoStatus = wx.getStorageSync('USERINFOSTATUS');
            var userInfoRegister = wx.getStorageSync('USERINFOREGISTER');
            if (userInfoRegister != 1) {
                //若果未登录，先登录
                wx.navigateTo({
                    url: '../register/register',
                })
            } else if (userInfoStatus != 1) {
                wx.navigateTo({
                    url: '../bindCompany/bindCompany',
                })
            } else {
                //没有空数据上传报价单
                that.upLoadDrugList(arr)
            }
        }
    },

    /**
     * 组合上传集合
     */
    groupUploadList: function () {
        var arry = [];

        for (var i = 0; i < this.data.drugList.length; i++) {
            if (this.data.drugList[i].showView == true) {
                var newObj = {};
                newObj.invalidTime = this.data.drugList[i].invalidTime;
                newObj.norms = this.data.drugList[i].norms;
                newObj.offerOrderInfoId = this.data.drugList[i].offerOrderInfoId;
                newObj.price = this.data.drugList[i].price;
                newObj.scaler = this.data.drugList[i].scaler;
                newObj.smallUnit = this.data.drugList[i].smallUnit;
                newObj.unit = this.data.drugList[i].unit;
                arry.push(newObj);
            }
        }
        console.log("arry:", arry)
        return arry;
    },

    //校验属性是否为空
    propertyIsEmpty: function (arr) {
        var that = this
        // var isEmptyData = false
        console.log('上传的数组--===---', arr)
        for (var i = 0; i < arr.length; i++) {
            if (stringUtil.trimString(arr[i].invalidTime) == '' || arr[i].invalidTime == '请输入有效期') {
                wx.showToast({
                    title: '效期不能为空',
                    image: '/Images/error.png',
                })
                return false;
            } else if (stringUtil.trimString(arr[i].norms) == '') {
                wx.showToast({
                    title: '规格不能为空',
                    image: '/Images/error.png',
                })
                return false;
            } else if (arr[i].scaler == '' || arr[i].scaler == 0) {
                wx.showToast({
                    title: '请填写包装数量',
                    image: '/Images/error.png',
                })
                return false;
            } else if (stringUtil.trimString(arr[i].smallUnit) == '') {
                wx.showToast({
                    title: '小单位不能为空',
                    image: '/Images/error.png',
                })
                return false;
            } else if (stringUtil.trimString(arr[i].unit) == '') {
                wx.showToast({
                    title: '大单位不能为空',
                    image: '/Images/error.png',
                })
                return false;
            } else if (stringUtil.trimString(arr[i].price) == '' || arr[i].price == 0) {
                wx.showToast({
                    title: '单价大于零',
                    image: '/Images/error.png',
                })
                return false;
            }
        }
        return true;
    },

    /**
     * 获取报价单详情
     */
    getOrderDetail: function () {
        var that = this;
        wx.showLoading({
            title: '加载中...',
        })

        var param = { sysUserId: that.data.userId, offerOrderId: that.data.orderId }
        var url = util.BASE_URL + util.IGNORE_DETAIL_INFO;
        util.getDataJson(url, param, res => {
            console.log('未报价报单详情：', res)
            if (res.data && res.data.code == '0000') {
                var temp = res.data.content.offerOrder;
                //为2018年的去掉年份
                if (temp.dateCreated.substring(0, 4) > 2017) {
                    temp.dateCreated = temp.dateCreated.substr(5, 11);
                }
                //企业名称最多显示10个字
                if (temp.clinicName.length > 10) {
                    temp.clinicName = temp.clinicName.substr(0, 10) + '...'
                }
                //手机号处理
                if (temp.consigneePhone != '') {
                    temp.consigneePhone1 = temp.consigneePhone.substring(0, 3) + '-' + temp.consigneePhone.substring(3, 7) + '-' + temp.consigneePhone.substring(7, 11)
                } else {
                    temp.consigneePhone1 = '';
                }
                //收货地址
                temp.receivingAddr = temp.province + temp.city + temp.area + temp.consigneeAddress

                //对药品信息处理
                var tempDetail = res.data.content.offerOrderDetail;
                for (var i = 0; i < tempDetail.length; i++) {
                    //初始化药品报价显示状态
                    tempDetail[i].showView = false;
                    //初始化有效期时间
                    // tempDetail[i].invalidTime = that.addDate(util.formatTime3(new Date()), 1);
                    tempDetail[i].invalidTime = '请输入有效期'
                    //规格处理 大于10个字符
                    if (tempDetail[i].norms.length > 10) {
                        tempDetail[i].norms1 = tempDetail[i].norms.substring(0, 10) + '...'
                    } else {
                        tempDetail[i].norms1 = tempDetail[i].norms
                    }
                    //最小单位 大于4个字符
                    if (tempDetail[i].smallUnit.length > 4) {
                        tempDetail[i].smallUnit1 = tempDetail[i].smallUnit.substring(0, 4) + '...'
                    } else {
                        tempDetail[i].smallUnit1 = tempDetail[i].smallUnit
                    }
                    //包装单位 大于4个字符
                    if (tempDetail[i].unit.length > 4) {
                        tempDetail[i].unit1 = tempDetail[i].unit.substring(0, 4) + '...'
                    } else {
                        tempDetail[i].unit1 = tempDetail[i].unit
                    }
                    //生产厂家最多显示10个字符
                    if (tempDetail[i].unit.length > 10) {
                        tempDetail[i].medicinalCompanyName = tempDetail[i].medicinalCompanyName.substring(0, 10) + '...'
                    }
                    //创建规格，大小单位，剂量副本用于还原数据
                    tempDetail[i].norms2 = tempDetail[i].norms
                    tempDetail[i].smallUnit2 = tempDetail[i].smallUnit
                    tempDetail[i].unit2 = tempDetail[i].unit
                    tempDetail[i].scaler2 = tempDetail[i].scaler
                }

                that.setData({
                    orderInfo: res.data.content.offerOrder,
                    drugList: res.data.content.offerOrderDetail,
                })
            } else {
                that.setData({
                    pageNum: 1
                })
            }
        })
    },

    //上传报价单
    upLoadDrugList: function (arr) {
        var that = this
        wx.showLoading({
            title: '加载中...',
        })
        if (that.data.freightMoney == '') {
            that.data.freightMoney = 0
        }
        var param = { sysUserId: that.data.userId, offerOrderId: that.data.orderId, words: that.data.leaveMessage, freight: that.data.freightMoney, offerOrderDetail: arr }
        var url = util.BASE_URL + util.UPLOAD_PRICELIST;
        util.getDataJson(url, param, res => {
            console.log('上传报价单:', res)
            if (res.data && res.data.code == '0000') {
                wx.showToast({
                    icon: 'none',
                    title: '报价成功',
                })
                that.setData({ offerDrugNum: 0 })
                
                var pages = getCurrentPages();
                //当前页面
                var currPage = pages[pages.length - 1];
                //上一个页面
                var prevPage = pages[pages.length - 2];
                prevPage.getSwitchTabData(1);
                wx.navigateBack({})
                
            } else if (res.data && res.data.code == '2012') {
                wx.showToast({
                    title: '报价商家已达上限,不可报价',
                    icon: 'none',
                })
                that.setData({ offerDrugNum: 0 })
            } else if (res.data && res.data.code == '2011') {
                wx.showToast({
                    icon: 'none',
                    title: '询价单已失效',
                })
                that.setData({ offerDrugNum: 0 })
            } else if (res.data && res.data.code == '9001') {
                wx.showToast({
                    title: '该订单已报价',
                    icon: 'none',
                })
                that.setData({ offerDrugNum: 0 })
            } else {
                wx.showToast({
                    title: '失败请重试',
                    icon: 'none',
                })
            }
            that.data.isDoubleClick = true;
        })
    },


    /**
     * 运费输入
     */
    freightAction: function (e) {
        var that = this
        console.log('运费输入:', e.detail.value)
        if (e.detail.value == '') {
            return;
        }
        // var singlePrice = that.astrictImport(e.detail.value, 4, 2)
        var price = e.detail.value;
        if (/(^\d{1,4})+(\.\d{1,2})?$/.test(price)) {
            if (price > 1 && !/^([1-9][0-9]*)+(\.\d{1,2})?$/.test(price)) {
                wx.showToast({
                    title: '运费不能零开始',
                    image: '/Images/error.png',
                })
                that.setData({ freightMoney: '' })
            } else if (/^\d+(\.\d{1,2})?$/.test(price)) {
                that.setData({freightMoney: price})
            } else {
                wx.showToast({
                    title: '输入两位的小数',
                    image: '/Images/error.png',
                })
                that.setData({ freightMoney: '' })
            }
        } else {
            wx.showToast({
                title: '运费格式错误',
                image: '/Images/error.png',
            })
            that.setData({ freightMoney: '' })
        }
    },

    /**
     * 留言输入
     */
    leaveMsgAction: function (e) {
        var that = this
        console.log('留言：', e.detail.value)
        that.setData({
            leaveMessage: e.detail.value
        })
    },

    /**
     * 限制输入的字数为int位整数float位小数
     */
    astrictImport: function (price, int, float) {

        if (/(^\d{1,4})+(\.\d{1,2})?$/.test(price)) {
            if (price > 1 && !/^([1-9][0-9]*)+(\.\d{1,6})?$/.test(price)) {
                wx.showToast({
                    title: '价格不能零开始',
                    image: '/Images/error.png',
                })
                return 0;
            } else if (/^\d+(\.\d{1,2})?$/.test(price)) {
                return price;
            } else {
                wx.showToast({
                    title: '输入两位的小数',
                    image: '/Images/error.png',
                })
                return 0;
            }
        } else {
            wx.showToast({
                title: '价格错误',
                image: '/Images/error.png',
            })
            return 0;
        }
    },
})