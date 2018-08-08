// pages/UserCenter/UserCenter.js
var util = require('../../utils/util.js')
var app = getApp()
var canuseUtil = require('../../template/AccountUnuse.js')
var stringUtil = require('../../utils/stringUtil.js')
var arrayUtil = require('../../utils/arrayUtil.js')
var areaUtil = require('../../utils/allArea.js')
var changeIndex = [0, 0, 0] //滑动时地区下标
var areaSelector = require('../../template/areaSelector/areaSelector.js')

Page({
    /**
     * 页面的初始数据
     */
    data: {
        //标记是否是列表页因为没有填企业信息进入的
        jumpType: 0, //跳转页面 1：分享进入小程序 2：搜索进入小程序
        isDisplay: true, //地区隐藏，显示
        animationData: {}, //地区动画
        companyId: '', //企业Id
        disabled: false, //保存按钮状态
        userId: '', //用户Id
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
        oldCompanyInfo: '', //修改之前的企业新信息
        isDoubleClick: true, //防止多次点击 true 可点击
        distributionValue: '', //配送区域信息 省，市，区，个数
        distributionArea: [], //所选的配送地址信息
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this
        console.log('用户中心列表页有分享id进入---', options.haveShareId)
        if (options.haveShareId === undefined){
            console.log('ddddddd')
        }
        if (options.haveShareId == undefined) {
            console.log('******')
        }
        if(options){
            console.log('&&&&&&&&&&&&&&&')
        }
        if (options) {
            that.data.jumpType = options.jumpType;
        }
        that.data.userId = wx.getStorageSync('USERID')
        //得到所有的省市区信息
        that.GetAllAreas()

    },

    /**
   * 生命周期函数--监听页面显示
   */
    onShow: function () {
        var that = this
        that.data.userId = wx.getStorageSync('USERID')
        that.data.isDoubleClick = true;
        //得到所有的省市区信息
        // that.GetAllAreas()
        //修改配送地址返回企业信息
        if (that.data.jumpType == 3) {
            that.data.jumpType = -1;
            this.data.distributionArea = app.globalData.selectArea;
            that.setData({
                distributionValue: that.getPCANum(app.globalData.selectArea),
            })
            this.verifyString()
            // console.log('that.getPCANum():', that.getPCANum(app.globalData.selectArea))
        } else if(that.data.jumpType == 4) {
            //点击返回键什么都不操作
        } else {
            that.getCompanyInfo();
            //2:为企业信息未通过，跳转过来不用再次请求
            if (app.globalData.auditState != 2) {
                that.getCompanyState();
            } else {
                //审核未通过提示框
                if (app.globalData.auditState == 2) {
                    that.unapproveCompanyShowModel();
                }
            }
        }
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
        that.setData({
            companyName: stringUtil.trimString(e.detail.value),
        })

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
            that.setData({
                personName: stringUtil.trimString(e.detail.value),
            })
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
        t = stringUtil.trimString(t)
        console.log('t:', t)
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
        t = stringUtil.trimString(t)
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
        that.setData({
            originizeCode: stringUtil.trimString(e.detail.value)
        })
        that.verifyString()
    },

    /**
     * 详细地址输入
     */
    detailsAddressAction: function (e) {
        console.log('详细地址输入', e.detail.value)
        this.setData({
            detailsAddress: stringUtil.trimString(e.detail.value)
        })
        this.verifyString()
    },

    /**
     * 配送区域选择
     */
    distributionAreaAction: function () {
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            app.globalData.selectArea = this.data.distributionArea;
            wx.navigateTo({
                url: '../DistributionArea/DistributionArea?jumpType=3',
            })
        }
    },

    /**
     * 选择地区
     */
    areaChooseAction: function () {
        console.log('地区选择', this.data.areaItemValue)
        console.log('地区选择changeIndex', changeIndex)
        var that = this;
        // if (that.data.AllAreas.length == 0) {
        //     return;
        // }
        var index = this.data.areaItemValue;
        // that.getProvinceCityAreaList(index[0], index[1])
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
     * 必填项校验,改变保存按钮状态
     */
    verifyString: function () {
        var that = this
        //都不为空，按钮可以点击
        if (that.data.companyName != '' && that.data.personName != '' && that.data.phoneNumber != '' && that.data.areaValue != '' && that.compareString()) {
            that.setData({ disabled: true })
        } else {
            that.setData({ disabled: false })
        }
    },

    //得到企业信息
    getCompanyInfo: function () {
        var that = this
        wx.showLoading({
            title: '加载中...',
        })

        var url = util.BASE_URL + util.getBusinessInfo;
        var param = { sysUserId: that.data.userId }
        util.getDataJson(url, param, res => {
            console.log('得到企业信息22', res)
            if (res.data && res.data.code == '0000' && res.data.content != '') {
                that.data.companyId = res.data.content.businessId;
                that.data.provinceCode = res.data.content.provinceCode;
                that.data.cityCode = res.data.content.cityCode;
                that.data.areaCode = res.data.content.areaCode;
                that.data.provinceName = res.data.content.provinceName;
                that.data.cityName = res.data.content.cityName;
                that.data.areaName = res.data.content.areaName;
                //回显所在区域
                that.setEchoAddress(that.data.provinceName, that.data.cityName, that.data.areaName);
                that.setData({
                    companyName: res.data.content.companyName,
                    personName: res.data.content.name,
                    phoneNumber: res.data.content.phone.substring(0, 3) + '-' + res.data.content.phone.substring(3, 7) + '-' + res.data.content.phone.substring(7, 11),
                    originizeCode: res.data.content.companyCode,
                    areaValue: res.data.content.provinceName + res.data.content.cityName + res.data.content.areaName,
                    detailsAddress: res.data.content.address,
                })
                if (res.data.content.distributionArea != "") {
                    that.setData({
                        distributionValue: that.getPCANum(JSON.parse(res.data.content.distributionArea)),
                        distributionArea: JSON.parse(res.data.content.distributionArea),
                    })
                }

                var area = ""
                if (res.data.content.distributionArea != "") {
                    area = JSON.parse(res.data.content.distributionArea)
                }
                that.data.oldCompanyInfo = {
                    companyName: res.data.content.companyName,
                    personName: res.data.content.name,
                    phoneNumber: res.data.content.phone.substring(0, 3) + '-' + res.data.content.phone.substring(3, 7) + '-' + res.data.content.phone.substring(7, 11),
                    originizeCode: res.data.content.companyCode,
                    areaValue: res.data.content.provinceName + res.data.content.cityName + res.data.content.areaName,
                    detailsAddress: res.data.content.address,
                    distributionArea: area,
                }
            }
        })
    },

    /**
     * 比较企业信息是否修改
     */
    compareString: function () {
        var that = this;
        var newCompanyInfo = {
            companyName: that.data.companyName,
            personName: that.data.personName,
            phoneNumber: that.data.phoneNumber,
            originizeCode: that.data.originizeCode,
            areaValue: that.data.areaValue,
            detailsAddress: that.data.detailsAddress,
            distributionArea: that.data.distributionArea,
        }

        // console.log('newCompanyInfo', JSON.stringify(newCompanyInfo))
        // console.log('oldCompanyInfo', JSON.stringify(that.data.oldCompanyInfo))
        if (JSON.stringify(newCompanyInfo) != JSON.stringify(that.data.oldCompanyInfo)) {
            //不相等企业信息修改，保存按钮高亮, 提示企业信息被修改
            return true;
        }
    },

    /**
     * 保存信息
     */
    saveCompanyInfoAction: function (e) {
        var that = this
        console.log('保存', e)
        if (that.data.disabled) {
            that.getAddrCode();
            that.uploadCompanyInfo()
        }
    },

    /**
     * 更新企业信息
     */
    uploadCompanyInfo: function () {
        var that = this;
        var url = util.BASE_URL + util.UpdateInfo;
        var param = {
            businessId: that.data.companyId,
            sysUserId: that.data.userId,
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
            distributionArea: that.data.distributionArea,
        }

        util.getDataJson(url, param, res => {
            console.log('更新企业信息：', res)
            if (res.data && res.data.code == '0000') {
                wx.hideLoading();
                app.globalData.auditState = 1;
                that.setData({
                    disabled: false,
                })
                wx.showToast({
                    title: '更新成功',
                })
                //跳转到询价单列表页面
                wx.switchTab({
                    url: '../AskPriceList/AskPriceList'
                })
            } else {
                wx.showToast({
                    title: '更新失败',
                    image: '/Images/error.png',
                })
            }
        })
    },


    /**
     * 企业信息查询
     */
    getCompanyState: function () {
        var that = this;
        app.getCompanyState(that.data.userId, res => {
            if (res.data.code == '0000') {
                //审核通过或未审核

            } else {
                that.errorExceptionDispose(res)
            }
        })
    },

    /**
     * 错误,异常处理
     */
    errorExceptionDispose: function (res) {
        if (res.data.code == '0005') {
            app.globalData.auditState = 2;
            app.globalData.unapproveContent = res.data.content;
            that.unapproveCompanyShowModel();
        } else if (res.data.code == '0003') {
            //企业停用
            wx.reLaunch({
                url: '../Disable/Disable'
            })
        } else if (res.data.code == '0004') {
            //没有企业新信息
            wx.navigateTo({
                url: '../EmptyCompanyInfo/EmptyCompanyInfo?jumpType=0'
            })
        }
    },

    /**
     * 企业审核未通过提示框
     */
    unapproveCompanyShowModel: function () {
        wx.showModal({
            title: '企业信息审核未通过！',
            content: app.globalData.unapproveContent,
            showCancel: false,
            confirmText: '去修改',
            confirmColor: '#EB3E2D',
            success: function (res) {
            
            }
        })
    },



    /**
     * 获取省的个数，市的个数，区的个数
     */
    getPCANum: function (selectArea) {
        console.log('selectArea:', selectArea)
        var that = this;
        if (selectArea.length == 0) {
            return '';
        } else {
            var str = '';
            var provinceNum = selectArea.length;
            var allList = areaUtil.getAllArea();
            var cityNum = 0;
            var areaNum = 0;
            for (var index in selectArea) {
                if (selectArea[index].provinceName == '全国') {
                    continue;
                }
                if (selectArea[index].flag == 2) {
                    for (var allIndex in allList) {
                        if (selectArea[index].provinceCode == allList[allIndex].provinceCode) {
                            cityNum = cityNum + allList[allIndex].cityList.length - 1;
                            areaNum = areaNum + that.getTotalAreaNum(selectArea[index].provinceCode, allList)
                        }
                    }
                } else if (selectArea[index].flag == 1) {
                    if (selectArea[index].cityList.length > 0) {
                        cityNum = cityNum + selectArea[index].cityList.length - 1;
                    }
                    for (var allIndex in allList) {
                        if (selectArea[index].provinceCode == allList[allIndex].provinceCode) {
                            areaNum = areaNum + that.getPartAreaNum(selectArea[index].cityList, allList[allIndex].cityList)
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
                    break;
                } else if (selectCityList[sIndex].flag == 1 && selectCityList[sIndex].cityCode == cityList[index].cityCode) {
                    areaNum = areaNum + selectCityList[sIndex].areaList.length;
                    break;
                }

            }
        }

        return areaNum;
    },

    /**
     * 得到所有的省市区信息
     */
    GetAllAreas: function () {
        var that = this;
        // that.data.AllAreas = areaUtil.getAllArea();
        //省：1 ，市：1
        // that.getProvinceCityAreaList(0, 0)

        areaSelector.changeArea(0, 0, this)
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
        var arg1 = arg1+1;
        var arg2 = arg2+1;
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
            areaSelector.changeArea(changeIndex[0], changeIndex[1], this)
            // that.getProvinceCityAreaList(changeIndex[0], changeIndex[1])
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
            areaValue: that.data.provinces[index[0]] + that.data.citys[index[1]] + that.data.areas[index[2]],
        })
        that.setData({
            isDisplay: true,
        })

        this.verifyString();
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

