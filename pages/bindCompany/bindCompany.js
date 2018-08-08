// pages/company/bindCompany/bindCompany.js
var util = require('../../utils/util.js')
var bmap = require('../../utils/bmap-wx.min.js')
var areaUtil = require('../../utils/allArea.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgUrl: '/Images/company_bind_icon.png', //提示图片
        markedWords1: '请绑定您的商业公司/生产厂家', //第一行文字
        markedWords2: '信息填写确认后，才可进行报价等操作', //灰色部分文字
        bottonTxt: '立即绑定', //按钮文字
        isShwoSearch: true, //展示搜索功能
        companyName: '', //企业名称
        provinceName: '', //所在省份
        pageState: 0, //页面状态
        companyList: [], //公司集合
        userId: "", //用户ID
        searchHintText: '请输入企业名称', //搜索提示框字符
        isSearchNo: true, //搜索无数据
        errorTxt: '未搜到，您的公司已经比别人慢了，快来入驻吧'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var userStatus = wx.getStorageSync('USERSTATUS')
        if (userStatus == 2) {
            this.setData({
                imgUrl: '/Images/company_bind_icon.png', //提示图片
                markedWords1: '请绑定您的医药公司',
                markedWords2: '信息填写确认后，才可进行报价等操作', //灰色部分文字
                searchHintText: '请输入企业名称',
            })
            wx.setNavigationBarTitle({
                title: '绑定医药公司',
            })
        } else {
            this.setData({
                imgUrl: '/Images/company_bind_icon.png', //提示图片
                markedWords1: '请绑定您的诊所、药房或药店',
                markedWords2: '信息填写确认后，才可进行报价等操作', //灰色部分文字
                searchHintText: '请输入诊所/药房/药店名称',
            })
            wx.setNavigationBarTitle({
                title: '选择诊所/药房/药店',
            })
        }
        this.setData({
            //第一行文字
            bottonTxt: '立即绑定', //按钮文字
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        //新建百度地图对象 
        var that = this; 

        areaUtil.getUserLocationInfo(res => {
            console.log('定位 res:', res)
            if (res.code == '0000') {
                that.data.provinceName = res.province;
            }
        });
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
     * 绑定商业公司/去修改商业公司
     */
    bindCompanyAction: function () {
        console.log('绑定商业公司')
        this.setData({ isShwoSearch: false })
        
    },

    /**
     * 文字输入时触发
     */
    inputAction: function (e) {
        console.log('e:', e)
        var value = e.detail.value;
        this.data.companyName = value;
    },

    /**
     * 搜索
     */
    searchAction: function (e) {
        
        if (this.data.companyName == '') {
            this.setData({
                companyList:[],
            })
            wx.showToast({
                icon: 'none',
                title: '请输入公司名称',
            })
            return;
        }
        if (this.data.companyName.length < 2){
            this.setData({
                companyList: [],
            })
            wx.showToast({
                icon: 'none',
                title: '请输入两个字以上',
            })
            return;
        }
        var userStatus = wx.getStorageSync('USERSTATUS')
        if (userStatus == 1) {
            // 诊所”、“药店”、“药房”、“医院
            if (this.data.companyName == '诊所' || this.data.companyName == '药店' || this.data.companyName == '药房' || this.data.companyName == '医院') {
                wx.showToast({
                    icon: 'none',
                    title: '请输入公司全称',
                })
                return;
            }
            this.searchClinicRequest();
        } else {
            // 公司”、“集团”、“医药”、“商业
            if (this.data.companyName == '公司' || this.data.companyName == '集团' || this.data.companyName == '医药' || this.data.companyName == '商业') {
                wx.showToast({
                    icon: 'none',
                    title: '请输入公司全称',
                })
                return;
            }
            this.searchCompanyRequest();
        }
    },

    /**
     * 选择企业
     */
    itemAction: function (e) {
        console.log('e:', e)
        var index = e.currentTarget.id;
        var userStatus = wx.getStorageSync('USERSTATUS')
        var str = JSON.stringify(this.data.companyList[index])
        if (userStatus == 1) {
            //诊所
            var ID = this.data.companyList[index].clinic_id;
            if (this.data.companyList[index].is_use == 1) {
                wx.showToast({
                    icon: "none",
                    title: '已经被人占用',
                })
                return;
            }
            wx.navigateTo({
                url: '../buyer/fillInCompany/fillInCompany?clinicId=' + ID,
            })
        } else {
            wx.navigateTo({
                url: '../company/fillInCompany/fillInCompany?jumpType=1&companyInfo=' + str + '&provinceName=' + this.data.provinceName,
            })
        }

    },

    /**
     * 立即入驻
     */
    addCompanyAction: function () {
        var userStatus = wx.getStorageSync('USERSTATUS')
        if (userStatus == 1) {
            //诊所
            wx.navigateTo({
                url: '../buyer/addCompanyInfo/addCompanyInfo?jumpType=2&companyInfo=',
            })
        } else {
            wx.navigateTo({
                url: '../company/fillInCompany/fillInCompany?jumpType=2&provinceName=' + this.data.provinceName + '&companyInfo=',
            })
        }
    },

    /**
     * 搜索医药公司
     */
    searchCompanyRequest: function () {
        var that = this;
        var param = { companyName: that.data.companyName, provinceName: that.data.provinceName };
        var url = util.BASE_URL + util.BUSINESS_QUERY_BUSINESS_BY_NAME;
        util.getDataJson(url, param, res => {
            console.log('搜索医药公司 res:', res)
            if (res.data && res.data.code == '0000' && res.data.data.length > 0) {
                that.setData({
                    companyList: res.data.data,
                    isSearchNo: true,
                })
            } else {
                this.setData({
                    isSearchNo: false,
                    errorTxt: '未搜到，您的公司已经比别人慢了，快来入驻吧',
                })
                // wx.showToast({
                //     icon: 'none',
                //     title: '未搜索到医药公司信息',
                // })
            }
        })
    },

    /**
     * 搜索诊所信息 
     */
    searchClinicRequest: function () {
        var that = this;
        var param = { likeName: that.data.companyName, province: that.data.provinceName };
        var url = util.BASE_URL + util.CLINIC_QUERY_CLINIC;
        util.getDataJson(url, param, res => {
            console.log('搜索诊所信息 res:', res)
            if (res.data && res.data.code == '0000' && res.data.data.length > 0) {
                var temp = res.data.data;
                for (var i = 0; i < temp.length; i++) {
                    temp[i].companyName = temp[i].clinic_name;
                    temp[i].cityName = temp[i].city_name;
                    temp[i].address = temp[i].address;
                }
                that.setData({
                    companyList: res.data.data,
                    isSearchNo: true,
                })
            } else if (res.data && res.data.code == '0000' && res.data.data.length == 0) {
                this.setData({
                    isSearchNo: false,
                    errorTxt: '未搜到，您已经比别人慢了，快来入驻吧'
                })
                that.setData({
                    companyList: [],
                })
            } else {
                this.setData({
                    isSearchNo: false,
                    errorTxt: '未搜到，您已经比别人慢了，快来入驻吧'
                })
                
            }
        })
    },
})