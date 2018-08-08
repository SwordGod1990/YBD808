// pages/UserCenter/UserCenter.js
var util = require('../../utils/util.js')
var app = getApp()
var canuseUtil = require('../../template/AccountUnuse.js')
var stringUtil = require('../../utils/stringUtil.js')
var areaUtil = require('../../utils/allArea.js')
var changeIndex = [0, 0, 0] //滑动时地区下标

Page({
    /**
     * 页面的初始数据
     */
    data: {
        //标记是否是列表页因为没有填企业信息进入的
        jumpType: 0, //跳转页面 1：分享进入小程序 2：搜索进入小程序 3,配送区域跳转
        isDisplay: true, //地区隐藏，显示
        animationData: {}, //地区动画
        companyId: '', //企业Id
        disabled: false, //保存按钮状态
        userID: '', //用户Id
        companyName: '', //企业名称
        personName: '', //联系人
        phoneNumber: '', //联系电话
        originizeCode: '', //组织机构代码
        areaValue: '', //所在区域
        detailsAddress: '', //详细地址
        AllAreas: [], //所有的区域
        provinces: [], //省数组
        citys: [], //市数组
        areas: [], //区数组
        //省
        provinceName: '',
        provinceCode: '',
        //市
        cityName: '',
        cityCode: '',
        //区
        areaName: '',
        areaCode: '',
        areaItemValue: [0, 0, 0], //默认地区下标
        isDoubleClick: true, //防止多次点击 true 可点击
        distributionValue: '', //配送区域信息
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this
        console.log('用户中心列表页有分享id进入---', options.haveShareId)
        // console.log('用户中心列表页有分享id进入---', typeof (options.haveShareId))
        // if (typeof (options.haveShareId) === "undefined"){
        //     console.log('ddddddddddddd')
        // }
        if (options) {
            that.data.jumpType = options.jumpType;
        }

        that.data.userID = wx.getStorageSync('USERID')
    },

    /**
   * 生命周期函数--监听页面显示
   */
    onShow: function () {
        var that = this
        this.data.isDoubleClick = true;
        //得到所有的省市区信息
        that.GetAllAreas()
        that.data.areaItemValue = [0, 0, 0]
        changeIndex = [0, 0, 0]
        if (that.data.jumpType == 3) {
            that.setData({
                distributionValue: that.getPCANum(),
            })
        }
    },

    /**
     * 获取省的个数，市的个数，区的个数
     */
    getPCANum: function () {
        console.log('app.globalData.selectArea:', app.globalData.selectArea)
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
                    console.log('areaNum999:', selectCityList[sIndex])
                    break;
                } else if (selectCityList[sIndex].flag == 1 && selectCityList[sIndex].cityCode == cityList[index].cityCode) {
                    areaNum = areaNum + selectCityList[sIndex].areaList.length;
                    console.log('areaNum888:', selectCityList[sIndex])
                    break;
                }

            }
        }

        return areaNum;
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

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
     * 企业名称
     */
    companyNameAction: function (e) {
        console.log('企业名称输入', e.detail.value)
        var that = this
        that.data.companyName = e.detail.value;

        that.verifyString();
    },

    /**
     * 联系人
     */
    personNameAction: function (e) {
        console.log('联系人输入', e.detail.value)
        var that = this
        if (stringUtil.inspectionString(e.detail.value) != '') {
            wx.showToast({
                title: '姓名格式错误',
                image: '/Images/error.png',
            })
        } else {
            that.data.personName = e.detail.value;
        }

        that.verifyString()
    },

    /**
     * 联系电话输入时检查
     */
    phoneAction: function (e) {
        console.log('联系电话：', e.detail.value)

        var that = this;
        if (e.detail.value.length < 1) {
            return;
        }
        let t = e.detail.value.replace(/-/g, '')
        if (t.length >= 11 && t.substr(0, 1) == 1) {
            this.setData({
                phoneNumber: t.substring(0, 3) + '-' + t.substring(3, 7) + '-' + t.substring(7, 11),
            })
        } else if (t.substr(0, 1) != 1) {
            wx.showToast({
                title: '手机号格式错误',
                image: '/Images/error.png',
            })
            setTimeout(function () {
                that.setData({ phoneNumber: '' })
            }, 500)

        } else {
            this.data.phoneNumber = e.detail.value;
        }

        this.verifyString()
    },

    /**
     * 手机号失去焦点检查
     */
    phoneAction2: function (e) {
        console.log('联系电话输入', e.detail.value)
        if (e.detail.value.length < 1) {
            wx.showToast({
                title: '手机号不能为空',
                image: '/Images/error.png',
            })
            return;
        }

        let t = e.detail.value.replace(/-/g, '')
        if (t.length < 11 || t.substr(0, 1) != 1) {
            wx.showToast({
                title: '手机号错误',
                image: '/Images/error.png',
            })
            this.setData({
                phoneNumber: '',
            })
        }
    },

    /**
     * 组织机构代码
     */
    organizeCodeAction: function (e) {
        console.log('组织机构代码输入', e.detail.value)
        var that = this
        that.data.originizeCode = e.detail.value

        that.verifyString()
    },

    /**
     * 详细地址输入
     */
    detailsAddressAction: function (e) {
        console.log('详细地址输入', e.detail.value)

        this.data.detailsAddress = e.detail.value

        this.verifyString()
    },

    /**
     * 选择地区
     */
    areaChooseAction: function () {
        console.log('地区选择')
        var that = this;
        if (that.data.AllAreas.length == 0) {
            return;
        }
        var index = this.data.areaItemValue;
        that.getProvinceCityAreaList(index[0] + 1, index[1] + 1)
        console.log('areaItemValue:', that.data.areaItemValue)
        this.setData({
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
     * 配送区域选择
     */
    distributionAreaAction: function () {
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            wx.navigateTo({
                url: '../DistributionArea/DistributionArea?jumpType=3',
            })
        }
    },

    /**
     * 必填项校验,改变保存按钮状态
     */
    verifyString: function () {
        var that = this
        //都不为空，按钮可以点击
        if (that.data.companyName != '' && that.data.personName != '' && that.data.phoneNumber != '' && that.data.areaValue != '') {
            that.setData({ disabled: true })
        } else {
            that.setData({ disabled: false })
        }
    },

    /**
     * 保存信息
     */
    saveCompanyInfoAction: function (e) {
        var that = this
        console.log('保存', e)
        if (that.data.disabled) {
            that.saveCompanyInfo()
        }
    },

    //新用户保存企业信息
    saveCompanyInfo: function () {
        var that = this
        if (wx.showLoading) {
            wx.showLoading({
                title: '保存中',
            })
        }
        that.getAddrCode();

        var url = util.BASE_URL + util.saveBusinessInfo;
        var param = {
            sysUserId: that.data.userID,
            companyName: that.data.companyName,
            name: that.data.personName,
            phone: that.data.phoneNumber.replace(/-/g, ''),
            companyCode: that.data.originizeCode,
            provinceCode: that.data.provinceCode,
            provinceName: that.data.provinceName,
            cityCode: that.data.cityCode,
            cityName: that.data.cityName,
            areaCode: that.data.areaCode,
            areaName: that.data.areaName,
            address: that.data.detailsAddress,
            distributionArea: app.globalData.selectArea,
        }
        util.getDataJson(url, param, res => {
            console.log('保存企业信息:', res)
            if (res.data && res.data.code == '0000') {
                wx.hideLoading();
                that.setData({
                    companyId: res.data.businessId,
                })
                wx.setStorageSync('COMPANYID', res.data.businessId)
                wx.showToast({
                    title: '保存成功',
                })
                app.globalData.jumpType = 0;
                wx.navigateBack({})
            } else {
                that.setData({ disabled: true })
                wx.showToast({
                    title: '保存失败',
                    image: '/Images/error.png',
                })
            }
        })
    },

    /**
     *获取位置
     */
    getLocation: function () {
        var that = this
        wx.getLocation({
            type: 'wgs84',
            success: function (res) {
                //允许获取位置授权
                wx.setStorageSync('ALLOWLOCATION', '0')
                console.log('同意授权位置:', res)
                console.log('位置经度', res.latitude)
                console.log('位置纬度', res.longitude)

                that.setData({

                })
            },
            fail: function (res) {
                console.log('拒绝授权位置', res)
                wx.showModal({
                    title: '警告',
                    content: '检测到您没打开药报单的定位权限，是否去设置？',
                    confirmText: '确定',
                    showCancel: false,
                    success: function (res) {
                        if (res.confirm) {
                            //同意授权存值标记用户同意授权了
                            wx.openSetting({
                                success: function (res) {
                                    if (!res.authSetting["scope.userLocation"]) {

                                        that.getLocation()


                                    } else {
                                        console.log('不允许同意位置信息')

                                    }
                                },
                                fail: function () {
                                    console.log('不允许设置位置信息')
                                }
                            })

                        }
                    }
                })

            }
        })
    },

    //得到所有的省市区信息
    GetAllAreas: function () {
        var that = this;
        that.data.AllAreas = areaUtil.getAllArea();
        console.log('allArea:-------', that.data.AllAreas)
        //省：1 ，市：1
        that.setProvinceList()
        that.getProvinceCityAreaList(1, 1)
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
        that.setData({
            provinces: pList,
        })
    },

    /**
     * 获取所选择省，市， 区集合
     * arg1:省的下标
     * arg2:市的下标
     */
    getProvinceCityAreaList: function (arg1, arg2) {
        var that = this;
        //获取省，市， 区集合

        var cList = [];
        var aList = [];
        for (var i = 1; i < that.data.AllAreas[arg1].cityList.length; i++) {
            cList.push(that.data.AllAreas[arg1].cityList[i].cityName)
        }
        if (arg2 >= that.data.AllAreas[arg1].cityList.length) {
            arg2 = that.data.AllAreas[arg1].cityList.length - 1;
        }
        for (var i = 1; i < that.data.AllAreas[arg1].cityList[arg2].areaList.length; i++) {
            aList.push(that.data.AllAreas[arg1].cityList[arg2].areaList[i].areaName)
        }
        console.log('cList:', cList)
        console.log('aList:', aList)
        that.setData({
            citys: cList,
            areas: aList,
        })
    },



    //地区回显
    bindChange: function (e) {
        var that = this
        // console.log('所有区域', that.data.AllAreas)
        if (!that.data.isDisplay) {
            changeIndex = e.detail.value
            console.log('分列下标:', e.detail.value)
            that.getProvinceCityAreaList(changeIndex[0] + 1, changeIndex[1] + 1)
        }
        // this.data.areaItemValue = changeIndex;
        // var index = this.data.areaItemValue;

        // this.setData({
        //     areaValue: this.data.provinces[index[0]] + this.data.citys[index[1]] + this.data.areas[index[2]],
        // }) 
    },

    //取消
    cancelAction: function () {
        this.animationTimeInto()
        this.setData({
            isDisplay: true,
        })
    },

    // 确定
    sureAction: function (e) {
        this.animationTimeInto()
        this.data.areaItemValue = changeIndex;
        var index = this.data.areaItemValue;
        this.setData({
            areaValue: this.data.provinces[index[0]] + this.data.citys[index[1]] + this.data.areas[index[2]],
        })
        this.setData({
            isDisplay: true,
        })
        this.verifyString()
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

        console.log("provinceName:", this.data.provinceName)
        console.log("cityName:", this.data.cityName)
        console.log("areaName:", this.data.areaName)
        console.log("provinceCode:", this.data.provinceCode)
        console.log("cityCode:", this.data.cityCode)
        console.log("areaCode:", this.data.areaCode)
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
            timingFunction: 'ease',
        })
        this.animation = animation
        animation.translateY(300).step()
        this.setData({
            animationData: this.animation.export()
        })
    },
})