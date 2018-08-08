// pages/buyer/addCompanyInfo/addCompanyInfo.js
var areaUtil = require('../../../utils/allArea.js')
var util = require('../../../utils/util.js')
var stringUtil = require('../../../utils/stringUtil.js')
var changeIndex = [0, 0, 0] //滑动时地区下标

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isDisplay: true, //地区隐藏，显示
        animationData: {}, //地区动画
        AllAreas: [], //所有的区域
        provinces: [], //省数组
        citys: [], //市数组
        areas: [], //区数组
        areaItemValue: [0, 0, 0], //默认地区下标
        areaValue: '', //所在区域
        companyInfo: '', //公司信息
        jumpType: 0, //2.手动添加 
        userId: '', //用户ID
        provinceName: '',
        cityName: '',
        areaName: '',
        provinceCode: '',
        cityCode: '',
        areaCode: '',
        clinicTypeArray: ['诊所', '单体药店', '连锁药店', '综合医疗机构', '社区服务中心'], //1:诊所 2:单体药店 ,3: 连锁药店 4:综合医疗机构 5:社区服务中心
        clinicTypeTxt: '请选择', //诊所类型
        clinicType: -1, //诊所类型数值
        clinicName: '', //诊所名字
        clinicId: '', //诊所ID
        inputValue: '', //去掉手机号前面空格
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('companyInfo:', options.companyInfo)
        this.data.jumpType = options.jumpType;
        //得到所有的省市区信息
        this.GetAllAreas()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        this.getUserLocation();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.data.userId = wx.getStorageSync('USERID');
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
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    /**
     * 获取用户位置
     */
    getUserLocation: function () {
        var that = this;
        areaUtil.getUserLocationInfo(res => {
            console.log('获取用户位置 res:', res);
            if (res.code == '0000') {
                if (that.data.areaValue == '') {
                    that.data.provinceName = res.province;
                    that.data.cityName = res.city;
                    that.data.areaName = res.district;
                    that.setData({
                        areaValue: res.province + ' ' + res.city + ' ' + res.district,
                    })
                }
                areaUtil.baseProvinceCityDistrictResult(that.data.provinceName, that.data.cityName, that.data.areaName, function (cityList, districtList, arr) {
                    that.data.areaItemValue = arr;
                    changeIndex = that.data.areaItemValue;
                    that.getAddrCode(arr);
                });
            }
        });
    },

    /**
     * 去掉前面空格
     */
    changeBlurAction: function(e){
        console.log('去掉首位空格 e:', e)
        var str = e.detail.value;
        if(str == ' '){
            this.setData({
                inputValue: '',
            })
        }
    },

    /**
     * 选择类型
     */
    bindPickerChange: function (e) {
        console.log('e:', e)
        var index = e.detail.value;
        this.setData({
            clinicTypeTxt: this.data.clinicTypeArray[index]
        })
        this.data.clinicType = parseInt(index) + 1;
    },

    /**
     * 检验诊所唯一性 
     */
    clinicIsOnly: function (clinicName, address, obj) {
        var that = this;
        // clinicName = 诊所名字12 & provinceCode=430000 & cityCode=430500 & areaCode=430522 & address=详细地址是我2
        var param = {
            clinicName: clinicName,
            provinceCode: this.data.provinceCode,
            cityCode: this.data.cityCode,
            areaCode: this.data.areaCode,
            address: address
        };
        var url = util.BASE_URL + util.CLINIC_CHECK_CLINIC_IS_ONLY;
        util.getDataJson(url, param, res => {
            console.log('检验诊所唯一性 res:', res)
            if (res.data && res.data.code == '0000' && res.data.data == '') {
                //保存诊所ID
                this.saveClinicInfoRequest(obj);
            } else if (res.data && res.data.code == '0000' && res.data.data != '') {
                that.data.clinicId = res.data.data[0].clinicId;
                wx.showModal({
                    title: '',
                    showCancel: false,
                    content: '根据您提交的信息，系统自动帮您匹配到了所属企业，请查看',
                    confirmText: '查看',
                    confirmColor: '#EB3E2D',
                    success: function (res) {
                        wx.redirectTo({
                            url: '../fillInCompany/fillInCompany?clinicId=' + that.data.clinicId,
                        })
                    }
                })
            } else {
                wx.showToast({
                    icon: "none",
                    title: res.data.msg,
                })
            }
        })
    },

    /**
     * 提交
     */
    submitAction: function (e) {
        console.log("提交 e:", e)
        var clinicName = e.detail.value.clinicName;      //企业名称
        var clinicType = this.data.clinicType;      //企业类型
        var clinicNumber = e.detail.value.clinicNumber;      //经营许可证编号
        var clinicAddr = e.detail.value.clinicAddr;//详细地址
        var clinicLinkman = e.detail.value.clinicLinkman;//联系人
        var clinicPhone = e.detail.value.clinicPhone;//联系电话
        this.data.clinicName = clinicName;
        
        if (clinicName == '') {
            wx.showToast({
                icon: "none",
                title: '企业名称不能为空',
            })
            return;
        } 
        if (clinicType == '') {
            wx.showToast({
                icon: "none",
                title: '企业类型不能为空',
            })
            return;
        } 
        if (this.data.areaValue == '') {
            wx.showToast({
                icon: "none",
                title: '所在地区不能为空',
            })
            return;
        } 
        if (clinicAddr == '') {
            wx.showToast({
                icon: "none",
                title: '详细地址不能为空',
            })
            return;
        } 
        if (clinicLinkman == '') {
            wx.showToast({
                icon: "none",
                title: '联系人不能为空',
            })
            return;
        } 
        if (this.detectionPhone(clinicPhone) == '') {
            wx.showToast({
                icon: "none",
                title: '请输入正确的手机号',
            })
            return;
        } else {

        }

        var param = {
            sysUserId: this.data.userId,
            clinicName: clinicName,
            provinceCode: this.data.provinceCode,
            cityCode: this.data.cityCode,
            areaCode: this.data.areaCode,
            clinicType: clinicType,
            cityName: this.data.cityName,
            areaName: this.data.areaName,
            provinceName: this.data.provinceName,
            licenceNo: clinicNumber,
            contactsPhone: clinicPhone,
            contactsPerson: clinicLinkman,
            address: clinicAddr,
        };
        this.clinicIsOnly(clinicName, clinicAddr, param);
    },

    /**
     * 保存诊所请求
     */
    saveClinicInfoRequest: function (param) {
        var that = this;
        var url = util.BASE_URL + util.CLINIC_BINDING_CLINIC;
        util.getDataJson(url, param, res => {
            console.log('保存诊所请求 res:', res)
            if (res.data && res.data.code == '0000' && res.data.data != '') {
                //提交提示信息
                wx.showToast({
                    icon: "none",
                    title: '保存成功',
                })
                //保存诊所ID
                wx.setStorageSync("CLINICID", res.data.data.clinicId)
                wx.setStorageSync("CLINICNAME", this.data.clinicName)

                wx.setStorageSync('USERINFOSTATUS', 1)
                that.bindUserType()
            }
        })
    },

    /**
     * 绑定用户类型
     */
    bindUserType: function () {
        var that = this;

        var userStatus = wx.getStorageSync('USERSTATUS')
        var userType = '1';
        if (userStatus == 2) {
            userType = '2';
        }
        var url = util.BASE_URL + util.SYSUSER_CHOOSEROLE;
        var param = { sysUserId: this.data.userId, type: userType }
        util.getDataJson(url, param, res => {
            console.log("绑定用户类型 res", res)
            wx.navigateBack({
                delta: 3
            })
        })
    },

    /**
     * 检测手机号
     */
    detectionPhone: function (value) {
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
                icon: 'none',
            })
            return '';
        } else {
            return '';
        }
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
        // areaUtil.baseProvinceCityDistrictResult()
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

        this.getAddrCode(index);
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

    // /**
    //  * 得到省， 市， 区 code码
    //  */
    // getAddrCode: function () {
    //     var index = this.data.areaItemValue;
    //     this.data.provinceName = this.data.provinces[index[0]];
    //     this.data.cityName = this.data.citys[index[1]];
    //     this.data.areaName = this.data.areas[index[2]];
    //     this.data.provinceCode = this.data.AllAreas[index[0] + 1].provinceCode;
    //     this.data.cityCode = this.data.AllAreas[index[0] + 1].cityList[index[1] + 1].cityCode;
    //     this.data.areaCode = this.data.AllAreas[index[0] + 1].cityList[index[1] + 1].areaList[index[2] + 1].areaCode;
    // },

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