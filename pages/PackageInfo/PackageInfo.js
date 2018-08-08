// pages/PackageInfo/PackageInfo.js

var util = require('../../utils/util.js')
var app = getApp()
var canuseUtil = require('../../template/AccountUnuse.js')

var idxS//小单位
var idxB//包装单位
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pageNum: 2,
        packUnitIndex: -1, //包装单位下标
        packUnitName: '', //包装单位
        packageList: [], //包装单位集合
        smUnitIndex: -1, //小单位下标
        smUnitName: '', //小单位
        smUnitList: [], //小单位集合
        ItemId: '',
        packingQuantity: '', //包装数量
        jumpPage: 0, //0. 不显示药品数量view； 1. 显示药品数量view 

    },

    /**
       * 重新加载
       */
    reloadAction: function () {
        var that = this;
        that.GetAllUnits();
    },

    //拨打客服电话
    serviceClick: function () {
        console.log('拨打客服电话')

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this
        console.log('jumpPage', options.jumpPage)
        console.log('options', options)
        if (options.jumpPage == '1') {
            that.setData({
                smUnitName: options.smallunit,//最小单位
                packUnitName: options.bigunit,//包装单位
                jumpPage: options.jumpPage, //跳转页面标示 
                packingQuantity: options.drugScaler, //包装数量
            })
        } else {
            //接收上个页面传的单位
            that.setData({
                ItemId: options.itemId,
                smUnitName: options.smallunit,//最小单位
                packUnitName: options.bigunit,//包装单位
                jumpPage: options.jumpPage,
            })
        }
        that.GetAllUnits()

    },

    //确定按钮
    packageSureBtn: function () {
        console.log('点击确定')
        var that = this
        if (idxS == undefined) {
            wx.showToast({
                icon: "none",
                title: '请选择小单位！',
            })
            return;
        }
        if (idxB == undefined) {
            wx.showToast({
                icon: "none",
                title: '请选择包装单位！',
            })
            return;
        }
        var pages = getCurrentPages();
        //当前页面
        var currPage = pages[pages.length - 1];
        //上一个页面
        var prevPage = pages[pages.length - 2];

        //直接调用上一个页面的方法，改变值
        if (this.data.jumpPage == 1) {
            if (that.data.packingQuantity > 0) {
                prevPage.chooseUnit(that.data.smUnitName, that.data.packUnitName, that.data.packingQuantity)
            } else {
                wx.showToast({
                    icon: "none",
                    title: '请输入包装数量！',
                })
                return;
            }
        } else {
            prevPage.ChangeItemUnit(that.data.ItemId, that.data.smUnitName, that.data.packUnitName)
        }
        wx.navigateBack({})
    },
    /**
     *获取所有包装单位
     */
    GetAllUnits: function () {
        var that = this
        var url = util.BASE_URL + util.ALL_UNITS;
        var param = {}
        wx.showLoading({
            title: '加载中...',
        })
        util.getDataJson(url, param, res => {
            console.log("所有包装单位:", res)
            if (res.data && res.data.code == '0000') {
                that.setData({
                    packageList: res.data.data,
                    smUnitList: res.data.data
                })
            } else {
                that.setData({
                    pageNum: 5
                })
            }
        })
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
        console.log('packingQuantity:', this.data.packingQuantity)
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

    // /**
    //  * 页面相关事件处理函数--监听用户下拉动作
    //  */
    // onPullDownRefresh: function () {

    // },

    // /**
    //  * 页面上拉触底事件的处理函数
    //  */
    // onReachBottom: function () {

    // },

    /**
     * 用户点击右上角分享
     */
    // onShareAppMessage: function () {

    // },

    /**
     * 药品数量
     */
    drugQuantityInputAction: function (e) {
        console.log('e:', e)
        if (e.detail.value > 0) {
            this.data.packingQuantity = e.detail.value;
        } else {
            this.setData({ packingQuantity: '', })
            wx.showToast({
                icon: 'none',
                title: '数量必须大于零！',
            })
        }
    },


    /** 大单位点击
     *
     */
    packageTapClick: function (e) {
        var that = this;
        console.log("大单位点击===========", e.currentTarget.dataset.index);
        idxB = e.currentTarget.dataset.index
        console.log("------------大单位点击-===========", that.data.packageList[idxB].basicPackName);
        that.setData({
            packUnitIndex: idxB,
            packUnitName: that.data.packageList[idxB].basicPackName
        })


    },

    /**
     * 小单位点击
     */
    smallestUnit: function (e) {
        var that = this;
        console.log("小单位点击===========", e.currentTarget.dataset.index);
        idxS = e.currentTarget.dataset.index
        console.log("-------------小单位点击===========", that.data.smUnitList[idxS].basicPackName);
        that.setData({
            smUnitIndex: idxS,
            smUnitName: that.data.smUnitList[idxS].basicPackName
        })

    },

})