// pages/company/fillInCompany/fillInCompany.js
var areaUtil = require('../../../utils/allArea.js')
var util = require('../../../utils/util.js')
var bmap = require('../../../utils/bmap-wx.min.js')
var changeIndex = [0, 0, 0] //滑动时地区下标
Page({

    /**
     * 页面的初始数据
     */
    data: {

        isDoubleClick: true, //防止多次点击
        companyInfo: {}, //公司信息
        jumpType: 0, //2.手动添加 3. 历史用户,完善信息
        companyName: '', //公司名称
        provinceName: '', //所在区域
        areaName: '', //区域
        cityName: '', //市
        cityName: '', //市
        companyCode: '', //公司许可证号码
        provinceCode: '', //省code
        cityCode: '', //市code
        areaCode: '', //区code
        address: '', //详细地址
        isDisplay: true, //地区隐藏，显示
        animationData: {}, //地区动画
        AllAreas: [], //所有的区域
        provinces: [], //省数组
        citys: [], //市数组
        areas: [], //区数组
        areaItemValue: [0, 0, 0], //默认地区下标
        areaValue: '', //所在区域
        userId: '', //用户ID
        pic: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.data.userId = wx.getStorageSync('USERID')
        this.setData({
            jumpType: options.jumpType,
        })
        if (options.jumpType == 1 && options.companyInfo != '') {
            this.data.companyInfo = JSON.parse(options.companyInfo)
            this.setData({
                companyName: this.data.companyInfo.companyName,
                companyCode: this.data.companyInfo.companyCode,
                address: this.data.companyInfo.address,
                areaValue: this.data.companyInfo.provinceName + '' + this.data.companyInfo.cityName + '' + this.data.companyInfo.areaName,
                pic:this.data.companyInfo.pic,
            })
        } else if (options.jumpType == 3) {
            this.getMerchandiserRequest();
        }

        //得到所有的省市区信息
        this.GetAllAreas();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        var that = this;
        areaUtil.getUserLocationInfo(res => {
            console.log('定位 res:', res)
            if(res.code == '0000'){
                that.data.provinceName = res.province;
            }
        });
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
     * 选择商业公司
     */
    chooseCompanyAction: function () {
        console.log('选择商业公司')
        wx.navigateBack({

        })
    },

    /**
     * 获取业务员信息
     */
    getMerchandiserRequest: function () {
        var that = this;
        var param = { sysUserId: that.data.userId };
        var url = util.BASE_URL + util.BUSINESS_GET_BUSINESS_INFO;
        util.getDataJson(url, param, res => {
            console.log('获取业务员信息 res:', res)
            if (res.data && res.data.code == '0000' && res.data.data != '') {
                this.data.companyInfo = res.data.data;
                this.setData({
                    companyName: res.data.data.companyName,
                    companyCode: res.data.data.companyCode,
                    address: res.data.data.address,
                    areaValue: res.data.data.provinceName + '' + res.data.data.cityName + '' + res.data.data.areaName,
                })
            } else {
                wx.showToast({
                    icon: 'none',
                    title: '获取业务员信息失败',
                })
            }
        })
    },

    /**
     * 下一步
     */
    nextAction: function (e) {
        console.log('e:', e)
        if (this.data.jumpType == 2) {
            this.data.companyName = e.detail.value.companyName;      //企业名称
            this.data.companyCode = e.detail.value.companyCode;      //经营许可证编号
            this.data.address = e.detail.value.address;//详细地址
            if (this.data.companyName == '') {
                wx.showToast({
                    icon: "none",
                    title: '企业名称不能为空'
                })
                return;
            }
            if (this.data.areaValue == '') {
                wx.showToast({
                    icon: "none",
                    title: '所在区域不能为空'
                })
                return;
            }
            if (this.data.address == '') {
                wx.showToast({
                    icon: "none",
                    title: '详细地址不能为空'
                })
                return;
            }
        } else {
            if (this.data.companyInfo.address == '') {
                if (e.detail.value.address == '') {
                    wx.showToast({
                        icon: "none",
                        title: '详细地址不能为空'
                    })
                    return;
                }
                this.data.companyInfo.address = e.detail.value.address;//详细地址
            }

            if (this.data.areaValue == '') {
                wx.showToast({
                    icon: "none",
                    title: '所在区域不能为空'
                })
                return;
            }
            if (this.data.companyInfo.companyCode == '') {
                if (e.detail.value.companyCode != '') {
                    this.data.companyInfo.companyCode = e.detail.value.companyCode;//经营许可证编号
                }

            }
        }

        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            if (this.data.jumpType == 2) {
                //判断添加的商业公司是否已存在数据库
                this.searchCompanyRequest();
            } else if (this.data.jumpType == 3) {
                var str = JSON.stringify(this.data.companyInfo)
                wx.navigateTo({
                    url: '../merchandiser/merchandiser?companyInfo=' + str + '&jumpType=3',
                })
            } else {
                var str = JSON.stringify(this.data.companyInfo)
                wx.navigateTo({
                    url: '../merchandiser/merchandiser?companyInfo=' + str,
                })
            }
        }
    },

    /**
     * 查看商业公司唯一性
     */
    searchCompanyRequest: function () {
        var that = this;
        this.groupCompanyInfo();
        var param = { companyName: that.data.companyName, provinceCode: that.data.provinceCode, cityCode: that.data.cityCode, areaCode: that.data.areaCode, address: that.data.address };
        var url = util.BASE_URL + util.BUSINESS_CHECK_BUSINESS_IS_ONLY;
        util.getDataJson(url, param, res => {
            console.log('查看商业公司唯一性 res:', res)
            that.data.isDoubleClick = true;
            if (res.data && res.data.code == '0000' && res.data.data == '') {
                var str = JSON.stringify(that.data.companyInfo)
                wx.navigateTo({
                    url: '../merchandiser/merchandiser?companyInfo=' + str,
                })
            } else if (res.data && res.data.code == '0000' && res.data.data != '') {
                // var str = JSON.stringify(res.data.data)
                var temp = res.data.data[0];
                that.data.companyInfo = temp;
                wx.showModal({
                    title: '',
                    showCancel: false,
                    content: '根据您提交的公司信息，系统自动帮您匹配到了所属医药公司，请查看',
                    confirmText: '查看',
                    confirmColor: '#EB3E2D',
                    success: function (res) {
                        that.setData({
                            jumpType: 3,
                            companyName: temp.companyName,
                            companyCode: temp.companyCode,
                            address: temp.address,
                            areaValue: temp.provinceName + '' + temp.cityName + '' + temp.areaName,
                        })
                        
                    }
                })
            } else {
                var str = JSON.stringify(this.data.companyInfo)
                wx.navigateTo({
                    url: '../merchandiser/merchandiser?companyInfo=' + str,
                })
            }
        })
    },

    /**
     * 组合企业信息
     */
    groupCompanyInfo: function () {
        var that = this;
        var param = {}
        param.companyName = that.data.companyName;
        param.provinceCode = that.data.provinceCode;
        param.cityCode = that.data.cityCode;
        param.areaCode = that.data.areaCode;
        param.address = that.data.address;
        param.areaName = that.data.areaName;
        param.cityName = that.data.cityName;
        param.companyCode = that.data.companyCode;
        param.pic = that.data.pic;
        param.provinceName = that.data.provinceName;
        param.businessId = '';

        this.data.companyInfo = param;
    },

    /**
       * 选择地区
       */
    areaChooseAction: function () {
        console.log('地区选择', this.data.areaItemValue)
        console.log('地区选择changeIndex', changeIndex)
        // if (this.data.areaValue != '请选择' && ) {
        //     return;
        // }
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
            areaValue: that.data.provinces[index[0]] + '' + that.data.citys[index[1]] + '' + that.data.areas[index[2]],
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