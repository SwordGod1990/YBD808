// pages/impower/impower.js
var util = require('../../utils/util.js')
var areaUtil = require('../../utils/allArea.js')
var bmap = require('../../utils/bmap-wx.min.js')
var app = getApp()


Page({

    /**
     * 页面的初始数据
     */
    data: {
        code: '', //code 码
        ak: "5xIPPms1c2SxpezrlOeURbgWlrsfPGMq", //填写申请到的ak
        isImpowerPage: true, //如果没有授权,显示授权按钮; 已授权则隐藏授权按钮
        isDoubleClick: true, //防止多次点击
        userType: 0,
        enquiryOrderId: '', //询价单ID
        isShowPage: true, //如果选择了角色不显示页面内容 isShowPage: true, 没有选择角色isShowPage: false
        jumpType: 0, //1: 从扫码登录进入授权页面
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this;
        this.data.enquiryOrderId = options.enquiryOrderId;
        this.data.userType = options.userType;
        this.data.jumpType = options.jumpType;
        console.log('options;', options)
        //新建百度地图对象  
        areaUtil.getUserLocationInfo(res => {
            console.log('res:', res)
            if (res.code == '0000') {
                // areaUtil.baseProvinceCityDistrictResult(res.province, res.city, res.district, function(cityList, areaList, arry) {
                //     console.log('cityList:', cityList)
                //     console.log('areaList:', areaList)
                //     console.log('arry:', arry)
                // })
            }
        });
        // var BMap = new bmap.BMapWX({
        //     ak: that.data.ak
        // });

        // var success = function(data) {
        //     console.log('============================', data);
        //     var province = data.originalData.result.addressComponent.province;
        //     var city = data.originalData.result.addressComponent.city;
        //     var district = data.originalData.result.addressComponent.district;
        //     var code = data.originalData.result.addressComponent.adcode;
        //     areaUtil.baseProvinceCityDistrictResult(province, city, district, code, function(cityList, districtList, [i, j, k] ){
        //         console.log('cityList:', cityList)
        //         console.log('districtList:', districtList)
        //         console.log('[i, j, k]:', [i, j, k])
        //     });
        // }
        // var fail = function(data) {
        //     console.log('定位失败 e:', data)
        //     wx.showToast({
        //         icon: 'none',
        //         title: '定位失败',
        //     })
        // }
        // BMap.regeocoding({
        //     fail: fail,
        //     success: success
        // });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        //判断时候显示授权按钮
        var userId = wx.getStorageSync('USERID');
        if (userId != '') {
            this.setData({
                isImpowerPage: true
            })
            this.userChoosePage();
        } else {
            this.setData({
                isImpowerPage: false
            })
        }
    },

    /**
     * 用户页面跳转
     */
    userChoosePage: function() {
        //扫码登录进入,授权后返回登录页面
        if (this.data.jumpType == 1) {
            wx.navigateBack();
            return;
        }
        //判断时候显示用户选择角色按钮
        var state = wx.getStorageSync('USERSTATUS')
        if (this.data.userType != 2 && state != 1 && state != 2) {
            wx.setNavigationBarTitle({
                title: '请选择您的身份',
            })
            this.setData({
                isShowPage: false,
                isImpowerPage: true
            })
        } else {
            this.setData({
                isShowPage: true,
                isImpowerPage: false
            })
        }

        if (this.data.userType == 2 && state != 1) {
            //点击分享询价单进入,且用户已经是商业公司
            wx.setStorageSync('enquiryOrderId', this.data.enquiryOrderId)
            wx.setStorageSync('userType', '2')
            wx.switchTab({
                url: '../AskPriceList/AskPriceList',
            })
        } else {
            if (state == 1) {
                //用户是药店终端
                wx.redirectTo({
                    url: '../buyer/enquiry/enquiry',
                })
            } else if (state == 2) {
                //用户是商业公司
                wx.switchTab({
                    url: '../AskPriceList/AskPriceList',
                })
            }
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        var that = this;
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
     * 卖家
     */
    sellerAction: function() {
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            wx.setStorageSync('USERSTATUS', 2)

            if (this.data.userType == 2) {
                //点击分享询价单进入,且用户已经是商业公司
                wx.setStorageSync('enquiryOrderId', this.data.enquiryOrderId)
                wx.setStorageSync('userType', '2')
            }
            wx.switchTab({
                url: '../AskPriceList/AskPriceList',
            })
        }
    },

    /**
     * 买家
     */
    buyerAction: function() {
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            wx.setStorageSync('USERSTATUS', 1)
            wx.redirectTo({
                url: '../buyer/enquiry/enquiry',
            })
        }
    },

    /**
     * 获取用户授权
     */
    getUserInfoAction: function(e) {
        console.log("e:", e)
        var that = this;
        wx.login({
            success: function (res) {
                console.log('code', res.code)
                //获得用户授权发送code和加密信息给后台获取userid和openid
                that.data.code = res.code;

                //同意授权
                if (e.detail.errMsg == 'getUserInfo:ok') {
                    that.setData({
                        authorHidden: true
                    })
                    console.log('encryptedData:', e.detail.encryptedData)
                    console.log('iv:', e.detail.iv)
                    console.log('userInfo:', e.detail.userInfo)
                    wx.setStorageSync('UserInfo', e.detail.userInfo)

                    app.userInfo = e.detail.userInfo;

                    that.GetUseridAndDoctorinfo(e, that.data.code)

                } else {
                    console.log('拒绝授权')
                    //拒绝授权
                    that.againLogin();

                }
            },
            fail: function (res) {
                console.log('code-fail')
            }
        })
        
    },

    GetUseridAndDoctorinfo: function(res, code) {
        var that = this;
        //获得用户授权发送code和加密信息给后台获取openid和session_key
        var urlstring = util.BASE_URL + util.Login + '?code=' + code + '&encryptedData=' + res.detail.encryptedData + '&iv=' + res.detail.iv
        util.GetUserid(urlstring, res => {
            console.log('获得用户授权userID res:', res)
            if (res.data && res.data.code == '0000') {
                that.userChoosePage();
            }
        })
    },

    /**
     * 重新授权
     */
    againLogin: function() {
        var that = this;
        wx.showModal({
            title: '要授权后才能使用小程序哦',
            confirmText: '去授权',
            cancelText: '退出',
            success: function(res) {
                if (res.confirm) {
                    that.openSet();
                } else if (res.cancel) {
                    wx.navigateBack({

                    })
                }
            }
        })
    },
    /**
     * 打开设置
     */
    openSet: function() {
        var that = this;
        wx.openSetting({
            success: function(res) {
                if (!res.authSetting["scope.userInfo"] || !res.authSetting["scope.userLocation"]) {
                    wx.login({
                        success: function(res) {
                            // console.log('第二次code:', res.code)
                            that.data.CODE = res.code
                            wx.getUserInfo({
                                success: function(res) {
                                    console.log('---------', res)
                                    wx.setStorageSync('UserInfo', res.userInfo)
                                    var param = {
                                        code: that.data.CODE,
                                        encryptedData: res.encryptedData,
                                        iv: res.iv,
                                        doctorId: that.data.docid
                                    };
                                    var url = util.BASE_URL + util.Login;
                                    util.getDataJson(url, param, res => {
                                        if (res.data.code == '0000') {
                                            wx.setStorageSync('USERID', res.data.userId)
                                            wx.setStorageSync('OPENID', res.data.openId)
                                            console.log('USERID:', res.data.userId)
                                            that.userChoosePage();
                                            // that.data.userID = res.data.userId
                                        }
                                    })
                                },
                            })
                        },
                    })
                }
            }
        })
    },

})