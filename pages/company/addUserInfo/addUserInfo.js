// pages/company/addUserInfo/addUserInfo.js
var app = getApp()
var areaUtil = require('../../../utils/allArea.js')
var changeIndex = [0, 0, 0] //滑动时地区下标
Page({

    /**
     * 页面的初始数据
     */
    data: {
        areaValue: '', //用户所在区域
        deliverRegion: '', //配送区域
        isDoubleClick: true, //防多次点击
        isDisplay: true, //地区隐藏，显示
        animationData: {}, //地区动画
        AllAreas: [], //所有的区域
        provinces: [], //省数组
        citys: [], //市数组
        areas: [], //区数组
        areaItemValue: [0, 0, 0], //默认地区下标
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //得到所有的省市区信息
        this.GetAllAreas();
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
        if (this.data.jumpType == 3) {
            this.setData({
                deliverRegion: this.getPCANum(),
            })
        }
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
     * 保存用户信息
     */
    saveUserInfoAction: function (e) {
        console.log('e:', e)
        var userName = e.detail.value.userName;
        var userCall = e.detail.value.userCall;
        var userAddr = e.detail.value.userAddr;

        console.log('userName:', userName, 'userCall:',userCall, 'userAddr:', userAddr)
    },

    sureAction: function (e){
        console.log('e:', e)
        var inputContent = e.datail.value.inputContent;
    },

    /**
     * 保存商业公司信息和业务员信息
     */
    saveCompanyInfo: function () {
        var that = this;
        var param = {
            sysUserId: that.data.sysUserId,
            realName: that.data.realName,
            userProvince: that.data.userProvince,
            userCity: that.data.userCity,
            userArea: that.data.userArea,
            userProvinceCode: that.data.userProvinceCode,
            userCityCode: that.data.userCityCode,
            userAreaCode: that.data.userAreaCode,
            businessId: that.data.businessId,
            companyName: that.data.companyName,
            companyProvince: that.data.companyProvince,
            companyCity: that.data.companyCity,
            companyArea: that.data.companyArea,
            companyProvinceCode: that.data.companyProvinceCode,
            companyCityCode: that.data.companyCityCode,
            companyAreaCode: that.data.companyAreaCode,
            address: that.data.address
        };
        var url = util.BASE_URL + util.BUSINESS_BINDING_BUSINESS_AND_USER;
        util.getDataJson(url, param, res => {
            console.log('查看医药公司 res:', res)
            if (res.data && res.data.code == '0000' && res.data.data == '') {
                var str = JSON.stringify(this.data.companyInfo)
                wx.navigateBack({
                    delta: 4
                })
            }
        })
    },

    /**
       * 配送区域选择
       */
    deliverRegionAction: function () {
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            //赋值已经选择的配送区域
            app.globalData.selectArea = this.data.deliverRegion;
            wx.navigateTo({
                url: '../../DistributionArea/DistributionArea?jumpType=3',
            })
        }
    },

    /**
     * 获取省的个数，市的个数，区的个数
     */
    getPCANum: function () {
        // console.log('app.globalData.selectArea:', app.globalData.selectArea)
        var that = this;
        if (app.globalData.selectArea.length == 0) {
            return '';
        } else {
            var str = '';
            var provinceNum = app.globalData.selectArea.length;
            var allList = areaUtil.getAllArea();
            var cityNum = 0;
            var areaNum = 0;
            for (var index in app.globalData.selectArea) {
                if (app.globalData.selectArea[index].provinceName == '全国') {
                    continue;
                }
                if (app.globalData.selectArea[index].flag == 2) {
                    for (var allIndex in allList) {
                        if (app.globalData.selectArea[index].provinceCode == allList[allIndex].provinceCode) {
                            cityNum = cityNum + allList[allIndex].cityList.length - 1;
                            areaNum = areaNum + that.getTotalAreaNum(app.globalData.selectArea[index].provinceCode, allList)
                        }
                    }
                } else if (app.globalData.selectArea[index].flag == 1) {
                    if (app.globalData.selectArea[index].cityList.length > 0) {
                        cityNum = cityNum + app.globalData.selectArea[index].cityList.length - 1;
                    }
                    for (var allIndex in allList) {
                        if (app.globalData.selectArea[index].provinceCode == allList[allIndex].provinceCode) {
                            areaNum = areaNum + that.getPartAreaNum(app.globalData.selectArea[index].cityList, allList[allIndex].cityList)
                        }
                    }
                }
            }
            if (provinceNum > 0) {
                str = (provinceNum - 1) + '个省';
            }
            if (provinceNum > 0 && cityNum > 0) {
                str = str + '、'
            }
            if (cityNum > 0) {
                str = str + cityNum + '个市';
            }
            if (areaNum > 0 && cityNum > 0) {
                str = str + '、'
            }
            if (areaNum > 0) {
                str = str + areaNum + '个区(县)';
            }
            return str;
        }
    },

    /**
     * 计算全省的区的个数
     */
    getTotalAreaNum: function (provinceCode, allList) {
        var that = this;
        var areaNum = 0;
        for (var index in allList) {
            if (allList[index].provinceCode == provinceCode) {
                for (var i in allList[index].cityList) {
                    if (allList[index].cityList[i].cityName != '不限') {
                        areaNum = areaNum + allList[index].cityList[i].areaList.length - 1;
                    }
                }
                break;
            }
        }

        return areaNum;
    },

    /**
     * 计算所选市的区的个数
     */
    getPartAreaNum: function (selectCityList, cityList) {
        var that = this;
        var areaNum = 0;
        for (var sIndex in selectCityList) {
            for (var index in cityList) {
                if (selectCityList[sIndex].cityName == '不限') {
                    break;
                }
                if (selectCityList[sIndex].flag == 2 && selectCityList[sIndex].cityCode == cityList[index].cityCode) {
                    areaNum = areaNum + cityList[index].areaList.length - 1;
                    // console.log('areaNum999:', selectCityList[sIndex])
                    break;
                } else if (selectCityList[sIndex].flag == 1 && selectCityList[sIndex].cityCode == cityList[index].cityCode) {
                    areaNum = areaNum + selectCityList[sIndex].areaList.length;
                    // console.log('areaNum888:', selectCityList[sIndex])
                    break;
                }

            }
        }

        return areaNum;
    },

    /**
       * 选择地区
       */
    areaChooseAction: function () {
        console.log('地区选择', this.data.areaItemValue)
        console.log('地区选择changeIndex', changeIndex)
        var that = this;
        if (that.data.AllAreas.length == 0) {
            return;
        }
        var index = this.data.areaItemValue;
        that.getProvinceCityAreaList(index[0], index[1])

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
       * 得到所有的省市区信息
       */
    GetAllAreas: function () {
        var that = this;
        that.data.AllAreas = areaUtil.getAllArea();
        //省：1 ，市：1
        that.getProvinceCityAreaList(0, 0)
    },

    /**
     * 设置省列表
     */
    setProvinceList: function () {
        var that = this;
        var pList = [];
        for (var i = 1; i < that.data.AllAreas.length; i++) {
            pList.push(that.data.AllAreas[i].provinceName)
        }
        that.data.provinces = pList;
    },

    /**
     * 设置市列表
     */
    setCityList: function (arg1) {
        var that = this;
        var cList = [];
        for (var i = 1; i < that.data.AllAreas[arg1 + 1].cityList.length; i++) {
            cList.push(that.data.AllAreas[arg1 + 1].cityList[i].cityName)
        }
        that.data.citys = cList;
    },

    /**
     * 设置区列表
     */
    setAreaList: function (arg1, arg2) {
        var that = this;
        var aList = [];
        var arg1 = arg1 + 1;
        var arg2 = arg2 + 1;
        if (arg2 > that.data.citys.length) {
            arg2 = that.data.citys.length - 1;
        }
        for (var i = 1; i < that.data.AllAreas[arg1].cityList[arg2].areaList.length; i++) {
            aList.push(that.data.AllAreas[arg1].cityList[arg2].areaList[i].areaName)
        }
        that.data.areas = aList;
    },

    /**
     * 获取所选择省，市， 区集合
     * arg1:省的下标
     * arg2:市的下标
     */
    getProvinceCityAreaList: function (arg1, arg2) {
        this.setProvinceList();
        this.setCityList(arg1)
        this.setAreaList(arg1, arg2)
        this.setData({
            provinces: this.data.provinces,
            citys: this.data.citys,
            areas: this.data.areas,
        })
    },

    /**
     * 根据省，市，区名称，回显
     */
    setEchoAddress: function (province, city, area) {
        this.setProvinceList();
        var p = this.data.provinces.indexOf(province) >= 0 ? this.data.provinces.indexOf(province) : 0;
        this.setCityList(p)
        var c = this.data.citys.indexOf(city) >= 0 ? this.data.citys.indexOf(city) : 0;
        this.setAreaList(p, c)
        var a = this.data.areas.indexOf(area) >= 0 ? this.data.areas.indexOf(area) : 0;

        this.setData({
            areaItemValue: [p, c, a],
            provinces: this.data.provinces,
            citys: this.data.citys,
            areas: this.data.areas,
        })
        changeIndex = this.data.areaItemValue;
    },

    //选择滑动
    bindChange: function (e) {
        var that = this
        // console.log('所有区域', that.data.AllAreas)
        console.log('分列下标:', e.detail.value)
        if (!that.data.isDisplay) {
            changeIndex = e.detail.value

            that.getProvinceCityAreaList(changeIndex[0], changeIndex[1])
        }
    },

    //取消
    cancelAction: function () {
        this.animationTimeInto()
        changeIndex = this.data.areaItemValue;
        this.setData({
            isDisplay: true,
        })
    },

    // 确定
    sureAction: function (e) {
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

        this.getAddrCode();
    },

    /**
     * 得到省， 市， 区 code码
     */
    getAddrCode: function () {
        var index = this.data.areaItemValue;
        this.data.provinceName = this.data.provinces[index[0]];
        this.data.cityName = this.data.citys[index[1]];
        this.data.areaName = this.data.areas[index[2]];
        this.data.provinceCode = this.data.AllAreas[index[0] + 1].provinceCode;
        this.data.cityCode = this.data.AllAreas[index[0] + 1].cityList[index[1] + 1].cityCode;
        this.data.areaCode = this.data.AllAreas[index[0] + 1].cityList[index[1] + 1].areaList[index[2] + 1].areaCode;
    },

    animationTimeOut: function () {
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

    animationTimeInto: function () {
        var animation = wx.createAnimation({
            duration: 300,
            timingFunction: 'ease-out',
        })
        this.animation = animation
        animation.translateY(300).step({ duration: 300 })
        this.setData({
            animationData: this.animation.export()
        })
    },
})