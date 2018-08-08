// pages/company/enquiry/enquiry.js
var template = require('../../../template/tabBar/tabBar.js')
var util = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        toastContent: '确定要删除吗？',
        toastCancel: '取消',
        toastSure: '删除',
        isShowDelete: true, //确定显示窗
        isGuide: false, //没有询价单显示引导页false ，有询价单显示询价单列表
        clinicId: '', //诊所ID
        userId: '', //用户ID
        enquiryList: [], //报价单集合
        pageStart: 1, //起始页
        isDoubleClick: true, //防止多次点击
        moreIndex: -1, //标示更多提示框
        deleteIndex: -1, //删除询价单下标
        deleteEnquiryId: '', //删除询价单ID
        isLoadData: false, //时候加载数据 false: 未加载 ,true : 加载完成
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        template.tabbar("tabBar", 0, this)//0表示第一个tabbar
        //用户属于诊所终端公司
        wx.setStorageSync('USERSTATUS', 1)
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
        this.data.clinicId = wx.getStorageSync('CLINICID'); 
        this.data.userId = wx.getStorageSync('USERID');
        if (this.data.clinicId != ''){
            this.getEnquiryListRequest();
        }else{
            this.getClinicIdAndClinicName();
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
        console.log('下拉')
        this.data.pageStart = 1;
        this.getEnquiryListRequest();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        console.log('上拉')
        this.data.pageStart = this.data.pageStart + 1;
        this.getEnquiryListRequest();
    },

    /**
     * 开始询价按钮
     */
    startEquiryAction: function () {
        console.log('开始询价')
        // wx.setStorageSync("ISGUIDE", true)
        // this.setData({ isGuide: true})
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            wx.navigateTo({
                url: '../createEnquiry/createEnquiry',
            })
        }
    },

    /**
     * 更多操作
     */
    moreAction: function (e) {
        console.log("更多操作:", e)
        var id = e.currentTarget.id;
        if (id == this.data.moreIndex) {
            this.setData({
                moreIndex: -1,
            })
        } else {
            this.setData({
                moreIndex: id,
            })
        }
    },

    /**
     * 分享
     */
    shareAction: function (e) {
        console.log("分享:", e)
        if (this.data.isDoubleClick){
            this.data.isDoubleClick = false;
            var index = e.currentTarget.id;
            var enquiryOrderId = this.data.enquiryList[index].enquiryId;
            wx.navigateTo({
                url: '../SendPricePage/SendPricePage?enquiryOrderId=' + enquiryOrderId,
            })
        }
    },

    /**
     * 编辑
     */
    editAction: function (e) {
        console.log("编辑:", e)
        var index = e.currentTarget.id;
        this.setData({
            moreIndex: -1,
        })
        if (this.data.enquiryList[index].offerCount > 0){
            wx.showToast({
                icon: 'none',
                title: '已分享的询价单不可编辑',
            })
            return;
        }
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            var enquiryId = this.data.enquiryList[index].enquiryId;
            wx.navigateTo({
                url: '../createEnquiry/createEnquiry?jumpType=1&enquiryId=' + enquiryId,
            })
        }
    },

    /**
     * 删除
     */
    deleteAction: function (e) {
        console.log("删除:", e)
        var index = e.currentTarget.id;
        this.data.deleteEnquiryId = this.data.enquiryList[index].enquiryId;
        this.data.deleteIndex = index;
        this.setData({
            moreIndex: -1,
        })
        this.setData({ isShowDelete: false })
    },

    /**
     * 创建询价单
     */
    createEnquiryAction: function () {
        if (this.data.isDoubleClick){
            this.data.isDoubleClick = false;
            wx.navigateTo({
                url: '../createEnquiry/createEnquiry',
            })
        }
    },

    /**
     * 取消
     */
    cancelAction: function () {
        this.setData({ isShowDelete: true })
    },

    /**
     * 确定删除
     */
    sureAction: function () {
        this.setData({ isShowDelete: true })
        //处理删除操作
        this.deleteEnquiryListRequest();
    },

    /**
     * 报价详情
     */
    offerAction: function (e) {
        console.log('e:', e)
        var index = e.currentTarget.id;
        if (this.data.moreIndex != -1) {
            this.setData({
                moreIndex: -1,
            })
            return;
        }
        var id = this.data.enquiryList[index].enquiryId;
        if (this.data.enquiryList[index].offerCount > 0) {
            wx.navigateTo({
                url: '../offerInfo/offerInfo?enquiryId=' + id,
            })
        } else {
            wx.navigateTo({
                url: '../offerInfoNo/offerInfoNo?enquiryId=' + id,
            })
        }
    },

    /**
     * 获取报价单
     */
    getEnquiryListRequest: function () {
        var that = this;
        var param = { clinicId: that.data.clinicId, page: that.data.pageStart, limit: 10};
        var url = util.BASE_URL + util.ENQUIRY_ORDER_QUERY_ENQUIRY_ORDER_LIST;
        util.getDataJson(url, param, res => {
            console.log('获取报价单 res:', res)
            wx.stopPullDownRefresh();
            if (res.data && res.data.code == '0000' && res.data.data.length >= 0) {
                if (that.data.pageStart == 1){
                    that.setData({
                        enquiryList: res.data.data,
                    })
                }else{
                    that.setData({
                        enquiryList: that.data.enquiryList.concat(res.data.data),
                    })
                }
            }
            this.setData({isLoadData: true})
        })
    },

    /**
     * 删除询价单 
     */
    deleteEnquiryListRequest: function () {
        var that = this;        
        var param = { enquiryId: this.data.deleteEnquiryId };
        var url = util.BASE_URL + util.ENQUIRY_ORDER_DEL_ENQUIRY_INFO;
        util.getDataJson(url, param, res => {
            console.log('删除询价单 res:', res)
            if(res.data && res.data.code == '0000'){
                that.data.enquiryList.splice(that.data.deleteIndex, 1);
                that.setData({
                    enquiryList: that.data.enquiryList,
                })
            }
        })
    },

    /**
     * 获取诊所ID和名称 
     */
    getClinicIdAndClinicName: function(){
        var that = this;
        var param = { userId: this.data.userId };
        var url = util.BASE_URL + util.CLINIC_QUERY_CLINIC_BY_USER_ID;
        util.getDataJson(url, param, res => {
            console.log('获取诊所ID和名称 res:', res)
            if (res.data && res.data.code == '0000') {
                this.data.clinicId = res.data.data.clinicId;
                wx.setStorageSync("CLINICID", res.data.data.clinicId);
                wx.setStorageSync("CLINICNAME", res.data.data.clinicName);
                that.getEnquiryListRequest();
            }
            this.setData({ isLoadData: true })
        })
    }

})