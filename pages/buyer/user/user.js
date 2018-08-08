// pages/company/user/user.js
var app = getApp()
var areaUtil = require('../../../utils/allArea.js')
var template = require('../../../template/tabBar/tabBar.js')
var util = require("../../../utils/util.js")
var stringUtil = require('../../../utils/stringUtil.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isDoubleClick: true, //防多次点击
        deliverRegion: '', //配送区域
        realName: "", //诊所人员真实名称
        companyName: "", //公司
        phone: "", //手机
        portraitImg: "", //头像
        userId: '', //用户ID
        clinicId: '', //诊所ID
        pageNum: 2, //0,不显示任何页面; 1,显示立即注入; 2:显示宣传页面,或显示采购数据页面; 3:商业公司用户扫码,提示扫码错误
        isScan: true, //扫码进入
        errorMsg: '抱歉，暂不支持商家购买!', //错误提示
        errorImg: '/Images/error_icon.png', //错误提示图片
        activityInfoId: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        template.tabbar("tabBar", 2, this) //0表示第一个tabbar
        var that = this
        var img = wx.getStorageSync('avatarUrl');
        if (img != '') {
            this.setData({
                portraitImg: img,
            })
        }

        if (typeof options.q != 'undefined') {
            this.data.isScan = false;
            var url = decodeURIComponent(options.q);
            console.log('url:', url)
            this.data.activityInfoId = stringUtil.getUrlParms(url, "activeInfoId");
            // this.decideScan();
            // this.data.userId = wx.getStorageSync('USERID')
            // var userType = wx.getStorageSync('USERSTATUS');
            // if (this.data.userId != '' || typeof this.data.userId != 'undefined') {
            //     wx.setNavigationBarTitle({
            //         title: '我的',
            //         success: function (res) { },
            //         fail: function (res) { },
            //         complete: function (res) { },
            //     })
            //     if (userType == 1) {
            //         //诊所
            //         wx.navigateTo({
            //             url: '../scanDrug/scanDrug?activityInfoId=' + this.data.activityInfoId,
            //         })
            //         this.data.isScan = true;
            //         this.setData({
            //             pageNum: 2,
            //         })
            //     } else if (userType == 2) {
            //         //商业公司
            //         this.setData({
            //             pageNum: 3,
            //         })
            //     }
            // } else {
            //     this.setData({
            //         pageNum: 1,
            //     })
            //     wx.setNavigationBarTitle({
            //         title: '入驻药报单',
            //         success: function(res) {},
            //         fail: function(res) {},
            //         complete: function(res) {},
            //     })
            // }
            console.log('activityInfoId:', this.data.activityInfoId)
        } else {
            this.setData({
                pageNum: 2,
            })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        if (this.data.activityInfoId == '' || typeof this.data.activityInfoId == 'undefined') {
            this.decideUserOperation();
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        console.log('**********************')
        this.data.isDoubleClick = true;
        if (this.data.activityInfoId != '' && typeof this.data.activityInfoId != 'undefined') {
            this.decideScan();
        }

        console.log('isScan:', this.data.isScan)
        if (this.data.isScan) {
            this.data.clinicId = wx.getStorageSync('CLINICID');
            this.data.userId = wx.getStorageSync('USERID')
            console.log("userId:", this.data.userId)
            if (this.data.jumpType == 3) {
                this.setData({
                    deliverRegion: this.getPCANum(),
                })
            }
            console.log('deliverRegion:', this.data.deliverRegion)

            //获取诊所用户信息
            this.getByerUserInfo();
            // this.getClinicIdAndClinicName();
        }


    },

    /**
     * 判断用户注册, 绑定诊所状态
     */
    decideUserOperation: function() {
        var userInfoStatus = wx.getStorageSync('USERINFOSTATUS');
        var userInfoRegister = wx.getStorageSync('USERINFOREGISTER');
        if (userInfoRegister != 1) {
            //若果未登录，先登录
            wx.navigateTo({
                url: '../../register/register',
            })
            return true;
        } else if (userInfoStatus != 1) {
            wx.navigateTo({
                url: '../../bindCompany/bindCompany',
            })
            return true;
        }
        return false;
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
     * 扫码进入,判断是否跳转页面
     */
    decideScan: function() {
        this.data.userId = wx.getStorageSync('USERID')
        var userType = wx.getStorageSync('USERSTATUS');
        if (this.data.userId != '' && typeof this.data.userId != 'undefined') {
            wx.setNavigationBarTitle({
                title: '我的',
                success: function(res) {},
                fail: function(res) {},
                complete: function(res) {},
            })
            if (userType == 1) {
                //诊所
                wx.navigateTo({
                    url: '../scanDrug/scanDrug?activityInfoId=' + this.data.activityInfoId,
                })
                this.data.isScan = true;
                this.setData({
                    pageNum: 2,
                })
            } else if (userType == 2) {
                //商业公司
                this.setData({
                    pageNum: 3,
                })
            }else{
                this.setData({
                    pageNum: 1,
                })
                wx.setNavigationBarTitle({
                    title: '入驻药报单',
                    success: function (res) { },
                    fail: function (res) { },
                    complete: function (res) { },
                })
            }
        } else {
            this.setData({
                pageNum: 1,
            })
            wx.setNavigationBarTitle({
                title: '入驻药报单',
                success: function(res) {},
                fail: function(res) {},
                complete: function(res) {},
            })

            wx.navigateTo({
                url: '../../impower/impower?jumpType=1',
            })
        }
    },

    /**
     * 立即入驻
     */
    checkInAction: function() {
        //用户属于诊所
        wx.setStorageSync('USERSTATUS', 1)
        this.decideUserOperation();
    },

    /**
     * 商城扫码
     */
    shoppingMallScanAction: function() {
        if (this.decideUserOperation()) {
            return;
        }
        wx.navigateTo({
            url: '../scanDrug/scanDrug',
        })
    },

    /**
     * 获取用户信息
     */
    getByerUserInfo: function() {
        var that = this;
        //请求网络获取到用户信息
        var url = util.BASE_URL + util.CLINIC_CLINICMY
        var param = {
            sysUserId: this.data.userId
        }
        wx.showLoading({
            title: '加载中...',
        })
        util.getDataJson(url, param, res => {
            console.log("获取用户信息 res", res)
            if (res.data != '' && res.data.code == '0000') {
                that.data.clinicId = res.data.data.clinicId
                var realName = res.data.data.realName
                var companyName = res.data.data.companyName
                var phone = res.data.data.phone
                var portraitImg = res.data.data.portraitImg

                that.setData({
                    realName: realName,
                    phone: phone,
                    companyName: companyName,
                    portraitImg: portraitImg
                })
            } else {
                wx.showToast({
                    icon: 'none',
                    title: '获取用户信息失败',
                })
            }
        })
    },

    /**
     * 拨打电话
     */
    phoneCallAction: function() {
        console.log('拨打电话')
        wx.makePhoneCall({
            phoneNumber: '4006669196',
        })

    },

    /**
     * 跳转到企业信息页面
     */
    companyInfoAction: function() {
        console.log('跳转到企业信息页面')
        if (this.decideUserOperation()) {
            return;
        }
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            if (this.data.clinicId == undefined) {} else {
                wx.navigateTo({
                    //传入诊所Id
                    url: '../currentCompanyInfo/currentCompanyInfo?clinicId=' + this.data.clinicId,
                })
            }
        }
    },

    /**
     * 获取诊所ID和名称 
     */
    // getClinicIdAndClinicName: function () {
    //     var that = this;
    //     var param = { userId: this.data.userId };
    //     var url = util.BASE_URL + util.CLINIC_QUERY_CLINIC_BY_USER_ID;
    //     util.getDataJson(url, param, res => {
    //         console.log('获取诊所ID和名称 res:', res)
    //         if (res.data && res.data.code == '0000') {
    //             that.data.clinicId = res.data.data.clinicId;
    //             console.log('that.data.clinicId', that.data.clinicId)
    //             wx.setStorageSync("CLINICID", res.data.data.clinicId);
    //             wx.setStorageSync("CLINICNAME", res.data.data.clinicName);
    //         }
    //     })
    // },

    /**
     * 配送区域选择
     */
    distributionAreaAction: function() {
        if (this.decideUserOperation()) {
            return;
        }
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
    getPCANum: function() {
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
    getTotalAreaNum: function(provinceCode, allList) {
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
    getPartAreaNum: function(selectCityList, cityList) {
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
})