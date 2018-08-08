// pages/company/user/user.js
var app = getApp()
var areaUtil = require('../../../utils/allArea.js')
var util = require('../../../utils/util.js')
var stringUtil = require('../../../utils/stringUtil.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userId: '',
        merchandiserInfo: '', //业务员信息
        isDoubleClick: true, //防多次点击
        distributionArea: '', //配送区域
        deliverRegion: '', //配送区域
        headImg: '/Images/wode.png', //用户头像
        jumpType: 0,
        isLogin: false, //true: 登录商城; false: 未登录
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var img = wx.getStorageSync('avatarUrl');
        if (img != '') {
            this.setData({
                headImg: img,
            })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        this.decideUserOperation();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.data.isDoubleClick = true;
        this.data.userId = wx.getStorageSync('USERID')

        if (this.data.jumpType == 3) {
            this.data.jumpType = 0;
            this.data.distributionArea = app.globalData.selectArea;
            console.log('dd:', app.globalData.selectArea)
            var str = this.getPCANum();
            this.setData({
                deliverRegion: str,
            })
            this.updateMerchandiserInfoRequest();
        } else {
            this.getMerchandiserRequest();
        }
        console.log('deliverRegion:', this.data.deliverRegion)
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
     * 判断用户注册, 绑定企业状态
     */
    decideUserOperation: function() {
        var userInfoStatus = wx.getStorageSync('USERINFOSTATUS');
        var userInfoRegister = wx.getStorageSync('USERINFOREGISTER');
        var userOldData = wx.getStorageSync('USEROLDDATA');
        if (userInfoRegister != 1) {
            //若果未登录，先登录
            wx.navigateTo({
                url: '../../register/register',
            })
            return true;
        } else if (userOldData == 1) {
            wx.navigateTo({
                url: '../fillInCompany/fillInCompany?jumpType=3&provinceName=&companyInfo=',
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
     * 扫码登录商城
     */
    loginAction: function() {
        var that = this;
        if (this.decideUserOperation()){
            return;
        }
        wx.scanCode({
            success: (res) => {
                console.log('res:', res)
                var url = res.result;
                var key = stringUtil.getUrlParms(url, "k");
                wx.navigateTo({
                    url: '../scanLogin/scanLogin?key=' + key,
                })
            },
            fail: (error) => {
                console.log('error', error)

            }
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
            wx.navigateTo({
                url: '../companyInfo/companyInfo?merchandiserInfo=' + JSON.stringify(this.data.merchandiserInfo),
            })
        }
    },

    /**
     * 获取业务员信息
     */
    getMerchandiserRequest: function() {
        var that = this;
        var param = {
            sysUserId: that.data.userId
        };
        var url = util.BASE_URL + util.BUSINESS_GET_BUSINESS_INFO;
        util.getDataJson(url, param, res => {
            console.log('获取业务员信息 res:', res)
            if (res.data && res.data.code == '0000' && res.data.data != '') {
                if (res.data.data.distributionArea != '') {
                    that.data.distributionArea = JSON.parse(res.data.data.distributionArea);
                    app.globalData.selectArea = that.data.distributionArea;
                }
                if (res.data.data.isLogined == 1) {
                    that.setData({
                        isLogin: true
                    })
                } else {
                    that.setData({
                        isLogin: false
                    })
                }
                var str = that.getPCANum();
                console.log('str:', str)
                that.setData({
                    merchandiserInfo: res.data.data,
                    deliverRegion: str,
                    headImg: res.data.data.portraitImg,
                })
            } else {
                // wx.showToast({
                //     icon: 'none',
                //     title: '获取业务员信息失败',
                // })
            }
        })
    },

    /**
     * 修改业务员配送区域 
     */
    updateMerchandiserInfoRequest: function() {
        var that = this;
        var param = {
            sysUserId: that.data.userId,
            distributionArea: JSON.stringify(that.data.distributionArea)
        };
        var url = util.BASE_URL + util.SYSUSER_UPDATE_USER_BY_ID;
        util.getDataJson(url, param, res => {
            console.log('修改业务员配送区域 res:', res)
            if (res.data && res.data.code == '0000' && res.data.data != '') {
                // that.setData({
                //     merchandiserInfo: res.data.data,
                // })
            }
        })
    },

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
            app.globalData.selectArea = this.data.distributionArea;
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
        if (that.data.distributionArea.length == 0) {
            return '';
        } else {
            var str = '';
            var provinceNum = that.data.distributionArea.length;
            var allList = areaUtil.getAllArea();
            var cityNum = 0;
            var areaNum = 0;
            for (var index in that.data.distributionArea) {
                if (that.data.distributionArea[index].provinceName == '全国') {
                    continue;
                }
                if (that.data.distributionArea[index].flag == 2) {
                    for (var allIndex in allList) {
                        if (that.data.distributionArea[index].provinceCode == allList[allIndex].provinceCode) {
                            cityNum = cityNum + allList[allIndex].cityList.length - 1;
                            areaNum = areaNum + that.getTotalAreaNum(that.data.distributionArea[index].provinceCode, allList)
                        }
                    }
                } else if (that.data.distributionArea[index].flag == 1) {
                    if (that.data.distributionArea[index].cityList.length > 0) {
                        cityNum = cityNum + that.data.distributionArea[index].cityList.length - 1;
                    }
                    for (var allIndex in allList) {
                        if (that.data.distributionArea[index].provinceCode == allList[allIndex].provinceCode) {
                            areaNum = areaNum + that.getPartAreaNum(that.data.distributionArea[index].cityList, allList[allIndex].cityList)
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