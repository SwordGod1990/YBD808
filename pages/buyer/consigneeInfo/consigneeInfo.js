// pages/buyer/consigneeInfo/consigneeInfo.js
var areaSelector = require('../../../template/areaSelector/areaSelector.js')
var areaUtil = require('../../../utils/allArea.js')
var stringUtil = require('../../../utils/stringUtil.js')
var util = require('../../../utils/util.js')
var changeIndex = [0, 0, 0] //滑动时地区下标
Page({

    /**
     * 页面的初始数据
     */
    data: {
        areaValue: '', //所在地区
        animationData: {}, //动画
        areaItemValue: [0, 0, 0], //默认地区下标
        isDisplay: true, //地区隐藏，显示
        consigneeName: '', //收货人
        consigneePhone: '', //收货人姓名
        consigneeAddress: '', //收货人地址
        clinicId: '', //诊所ID
        provinceName: '',
        provinceCode: '',
        cityName: '',
        cityCode: '',
        areaName: '',
        areaCode: '',
        isWarning: false, //是否显示警告
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2];
        if (typeof prevPage.data.userInfo.province != 'undefined') {
            this.data.areaValue = prevPage.data.userInfo.province;
        }

        if (typeof prevPage.data.userInfo.city != 'undefined') {
            this.data.areaValue = this.data.areaValue + prevPage.data.userInfo.city;
        }

        if (typeof prevPage.data.userInfo.area != 'undefined') {
            this.data.areaValue = this.data.areaValue + prevPage.data.userInfo.area;
        }

        if (typeof prevPage.data.userInfo.area == 'undefined' || prevPage.data.userInfo.area == '') {
            this.setData({
                isWarning: true
            })
            this.data.areaValue = ''
        }

        this.setData({
            consigneeName: prevPage.data.userInfo.consigneeName,
            consigneePhone: prevPage.data.userInfo.consigneePhone,
            consigneeAddress: prevPage.data.userInfo.consigneeAddress,
            areaValue: this.data.areaValue,
            clinicId: prevPage.data.clinicId,
            provinceName: prevPage.data.userInfo.province,
            provinceCode: prevPage.data.userInfo.provinceCode,
            cityName: prevPage.data.userInfo.city,
            cityCode: prevPage.data.userInfo.cityCode,
            areaName: prevPage.data.userInfo.area,
            areaCode: prevPage.data.userInfo.areaCode,
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.getUserLocation();
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
     * 获取用户位置
     */
    getUserLocation: function(){
        var  that = this;
        areaUtil.getUserLocationInfo(res => {
            console.log('获取用户位置 res:', res);
            if(res.code == '0000'){
                if (that.data.areaValue == ''){
                    that.data.provinceName = res.province;
                    that.data.cityName = res.city;
                    that.data.areaName = res.district;
                    that.setData({
                        areaValue: res.province + ' ' + res.city + ' ' + res.district,
                    })
                }
                areaUtil.baseProvinceCityDistrictResult(that.data.provinceName, that.data.cityName, that.data.areaName, function (cityList, districtList, arr){
                    // console.log('cityList:', cityList, 'districtList:', districtList, 'arr:', arr)
                    that.data.areaItemValue = arr;
                    changeIndex = that.data.areaItemValue;
                    that.getAddrCode(arr);
                });
            }
        });
    },

    /**
     * 选择地区
     */
    areaChooseAction: function() {
        console.log('地区选择', this.data.areaItemValue)
        console.log('地区选择changeIndex', changeIndex)
        var that = this;
        var index = this.data.areaItemValue;
        
        areaSelector.changeArea(index[0], index[1], this)

        that.setData({
            isDisplay: !that.data.isDisplay,
            areaItemValue: that.data.areaItemValue,
        })
        if (that.data.isDisplay) {
            console.log('退出')
            that.animationTimeInto()
        } else {
            console.log('进入')
            that.animationTimeOut();
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    /**
     * 保存收货人信息
     */
    saveUserInfoAction: function(e) {
        console.log('保存收货人信息:', e)
        this.data.consigneeName = e.detail.value.userName;
        this.data.consigneePhone = e.detail.value.userCall;
        this.data.consigneeAddress = e.detail.value.userAddr;

        if (this.data.consigneeName == '') {
            wx.showToast({
                icon: 'none',
                title: '请填写收货人',
            })
            return;
        }
        if (this.data.consigneePhone == '') {
            wx.showToast({
                icon: 'none',
                title: '请填写联系电话',
            })
            return;
        } else if (this.detectionPhone(this.data.consigneePhone) == '') {
            wx.showToast({
                icon: 'none',
                title: '请输入正确的手机号',
            })
            return;
        }
        if (this.data.areaValue == '') {
            wx.showToast({
                icon: 'none',
                title: '请完善所在地区',
            })
            return;
        }
        if (this.data.areaCode == '' || typeof this.data.areaCode == 'undefined') {
            wx.showToast({
                icon: 'none',
                title: '请完善所在地区',
            })
            return;
        }
        if (this.data.consigneeAddress == '') {
            wx.showToast({
                icon: 'none',
                title: '请填写详细地址',
            })
            return;
        }
        this.saveUserInfoRequest();
    },

    /**
     * 检测手机号
     */
    detectionPhone: function(value) {
        if (value.length < 1) {
            return '';
        }
        let t = value.replace(/-/g, '')
        t = stringUtil.trimString(t)
        if (t.length == 11 && t.substr(0, 1) == 1) {
            return value;
        } else if (t.substr(0, 1) != 1 || t.length > 11) {
            wx.showToast({
                title: '手机号格式错误',
                image: '/Images/error.png',
            })
            return '';
        } else {
            return '';
        }
    },

    /**
     * 保存收货人信息请求
     */
    saveUserInfoRequest: function() {
        var that = this;
        var param = {
            clinicId: that.data.clinicId,
            consigneeName: that.data.consigneeName,
            consigneePhone: that.data.consigneePhone,
            province: that.data.provinceName,
            provinceCode: that.data.provinceCode,
            city: that.data.cityName,
            cityCode: that.data.cityCode,
            area: that.data.areaName,
            areaCode: that.data.areaCode,
            consigneeAddress: that.data.consigneeAddress,
        };
        var url = util.BASE_URL + util.ENQUIRY_ORDER_SAVE_CLINIC_ADDRESS;
        util.getDataJson(url, param, res => {
            console.log('保存收货人信息请求 res:', res)
            if (res.data && res.data.code == '0000') {
                var pages = getCurrentPages();
                var prevPage = pages[pages.length - 2];
                prevPage.data.userInfo.consigneeName = that.data.consigneeName;
                prevPage.data.userInfo.consigneePhone = that.data.consigneePhone;
                prevPage.data.userInfo.consigneeAddress = that.data.consigneeAddress;
                prevPage.data.userInfo.province = that.data.provinceName;
                prevPage.data.userInfo.city = that.data.cityName;
                prevPage.data.userInfo.area = that.data.areaName;
                prevPage.data.userInfo.provinceCode = that.data.provinceCode;
                prevPage.data.userInfo.cityCode = that.data.cityCode;
                prevPage.data.userInfo.areaCode = that.data.areaCode;
                prevPage.setData({
                    userInfo: prevPage.data.userInfo
                })

                wx.navigateBack();
            }
        })
    },

    //选择滑动
    bindChange: function(e) {
        var that = this
        console.log('分列下标:', e.detail.value)
        if (!that.data.isDisplay) {
            changeIndex = e.detail.value
            areaSelector.changeArea(changeIndex[0], changeIndex[1], this)
        }
    },

    //取消
    cancelAction: function() {
        this.animationTimeInto()
        changeIndex = this.data.areaItemValue;
        this.setData({
            isDisplay: true,
        })
    },

    // 确定
    sureAction: function(e) {
        var that = this;
        this.animationTimeInto()
        that.data.areaItemValue = changeIndex;
        var index = that.data.areaItemValue;
        console.log('areaItemValue:', that.data.areaItemValue)
        that.setData({
            areaValue: that.data.provinces[index[0]] + ' ' + that.data.citys[index[1]] + ' ' + that.data.areas[index[2]],
        })
        that.setData({
            isDisplay: true,
        })
        that.getAddrCode(index);
    },

    /**
     * 得到省， 市， 区 code码
     */
    getAddrCode: function (index) {
        var that = this;
        areaUtil.getAddrCode(index, function (provinceName, cityName, areaName, provinceCode, cityCode, areaCode) {
            that.data.provinceName = provinceName;
            that.data.cityName = cityName;
            that.data.areaName = areaName;
            that.data.provinceCode = provinceCode;
            that.data.cityCode = cityCode;
            that.data.areaCode = areaCode;
            // console.log('provinceName:', provinceName)
            // console.log('cityName:', cityName)
            // console.log('areaName:', areaName)
            // console.log('provinceCode:', provinceCode)
            // console.log('cityCode:', cityCode)
            // console.log('areaCode:', areaCode)
        })
    },

    animationTimeOut: function() {
        var animation = wx.createAnimation({
            duration: 300,
            timingFunction: 'ease',
        })
        this.animation = animation
        animation.translateY(-300).step()
        this.setData({
            animationData: this.animation.export()
        })
    },

    animationTimeInto: function() {
        var animation = wx.createAnimation({
            duration: 300,
            timingFunction: 'ease-out',
        })
        this.animation = animation
        animation.translateY(300).step({
            duration: 300
        })
        this.setData({
            animationData: this.animation.export()
        })
    },
})