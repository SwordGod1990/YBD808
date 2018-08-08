// pages/company/addDrug/addDrug.js
var util = require('../../../utils/util.js')
var app = getApp()

var drugScaler = ""
var drugSmallUnit = ""
var drugUnit = ""

Page({

    /**
     * 页面的初始数据
     */
    data: {
        drugNum: 0, //药品包装数量
        purchaseAmonut: 5, //采购数量默认为 5

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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
     * 包装单位
     */
    drugPackingUnitAction: function () {
        console.log('包装单位')
        wx.navigateTo({
            url: '../../PackageInfo/PackageInfo?jumpPage=1&smallunit=' + drugSmallUnit + '&bigunit=' + drugUnit + '&drugScaler=' + drugScaler,
        })
    },

    /**
     * 返回药品数量
     */
    chooseUnit: function (smUnitName, packUnitName, packingQuantity) {
        this.setData({
            drugNum: packingQuantity + smUnitName + "/" + packUnitName,
        })
        drugScaler = packingQuantity;   //换算量
        drugSmallUnit = smUnitName;     //小单位
        drugUnit = packUnitName;        //单位
    },

    /**
     * 加入询价单
     */
    addDrugInfoAction: function (e) {
        console.log("加入询价单:", e)
        var that = this;
        var drugName = e.detail.value.drugName;      //药品名称
        var drugSize = e.detail.value.drugSize;      //规格
        var drugCompany = e.detail.value.drugCompany;//生产厂家
        console.log('drugCompany:', drugCompany, 'drugName:', drugName, 'drugSize:', drugSize)

        // else if (drugSize.length == 0) {
        //       wx.showToast({
        //           title: '药品规格不能为空',
        //           icon: 'none',
        //           duration: 1500
        //       })
        //   }
        if (drugName.length == 0) {
            wx.showToast({
                title: '药品名称不能为空',
                icon: 'none',
                duration: 1500
            })
        } else if (drugScaler.length == 0) {
            wx.showToast({
                title: '药品包装数量不能为空',
                icon: 'none',
                duration: 1500
            })
        } else if (drugCompany.length == 0) {
            wx.showToast({
                title: '生产厂家不能为空',
                icon: 'none',
                duration: 1500
            })
        } else {
            //请求网络，添加表单数据
            wx.showLoading({
                title: '加载中',
            })
            var url = util.BASE_URL + util.ENQUIRYORDER_ADDMEDICINAL;
            var param = { medicinalName: drugName, norms: drugSize, unit: drugUnit, smallUnit: drugSmallUnit, scaler: drugScaler, medicinalCompanyName: drugCompany }
            util.getDataJson(url, param, res => {
                console.log('res:', res)
                wx.hideLoading();
                if (res.data && res.data.code == '0000' && res.data.data != '') {
                    wx.showToast({
                        icon: 'none',
                        title: '加入成功',
                    })
                    res.data.data.num = that.data.purchaseAmonut;
                    var pages = getCurrentPages();
                    var prevPage = pages[pages.length - 2];
                    prevPage.addCat(res.data.data)
                    wx.navigateBack();//提交表单后返回

                    // 往上一级页面传参
                    var pages = getCurrentPages();
                    var currPage = pages[pages.length - 1]; // 当前页面
                    var prevPage = pages[pages.length - 2]; // 上一级页面

                    // 直接调用上一级页面Page对象，存储数据到上一级页面中
                    var purchaseAmonutNum = this.data.purchaseAmonut;
                    prevPage.setData({
                        'num': purchaseAmonutNum,
                    })

                } else {
                    wx.showToast({
                        icon: 'none',
                        title: '添加失败',
                    })
                    // wx.showToast({
                    //     title: res.data.msg
                    // })
                }
            })
        }
    },

    /**
     * 药品数量减 1
     */
    minusAction: function () {
        // this.setData({ purchaseAmonut: this.data.purchaseAmonut - 1 })
        var purchaseAmonut = this.data.purchaseAmonut;
        // 如果采购数量大于1时，才可以减  
        if (purchaseAmonut > 1) {
            purchaseAmonut--;
        }
        this.setData({
            // 将数值与状态写回
            purchaseAmonut: purchaseAmonut
        })
    },

    /**
     * 药品数量加 5
     */
    addAction: function () {
        var purchaseAmonut = this.data.purchaseAmonut;

        if (purchaseAmonut < 9995) {
            purchaseAmonut += 5
        }
        this.setData({
            purchaseAmonut: purchaseAmonut
        })
    }
})