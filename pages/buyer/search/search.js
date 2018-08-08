// pages/company/search/search.js
var util = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isSearch: true, //点击搜索
        drugCode: '', //药品条码
        isShoppingClick: false, //显示购物车
        isScanShow: false, //扫码成功后弹出药品窗口
        drugName: '', //药名
        drugSpecs: '', //规格
        drugCompany: '', //生产厂家
        drugNum: 0, //药品件数
        srarchDrugNum: 0, //弹出窗口药品数量
        cancelTxt: '',
        sureTxt: '',
        drugCatList: [], //购物车集合
        drugList: [], //药品列表
        tostView: 0, //1.显示删除弹窗
        deleteIndex: -1, //删除药品下标
        isFirstShoppingCat: false, //是否点击过购物车，当点击一次后，点击选好了，进入下一页面
        isDoubleClick: true, //防止多次点击
        orderId: '', //询价单ID
        isScan: false, //true: 扫码加药
        isSearchNo: true, //未搜索到数据

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        var pages = getCurrentPages();
        //上一个页面
        var prevPage = pages[pages.length - 2];
        if (prevPage.data.drugCatList.length > 0) {
            this.setData({
                drugCatList: prevPage.data.drugCatList,
            })
            if ("undefined" == typeof prevPage.data.orderId) {
                this.data.orderId = '';
            } else {
                this.data.orderId = prevPage.data.orderId;
            }

            var num = this.calculateDrugAmount();
            this.setData({
                drugNum: num,
            })
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
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
        console.log('onUnload')
        var pages = getCurrentPages();
        //上一个页面
        var prevPage = pages[pages.length - 2];
        prevPage.changeAction(this.data.drugCatList);
    },

    /**
     * 联动搜索
     */
    linkageSearchAction: function(e) {
        console.log('联动搜索 e:', e)
        this.data.drugName = e.detail.value;
        this.searchDrugRequest();
        this.setData({
            isSearch: false,
            isSearchNo: true,
        })
    },

    /**
     * 搜索
     */
    searchAction: function() {
        console.log('搜索')
        this.searchDrugRequest();
        this.setData({
            isSearchNo: true,
            isSearch: false,
        })
    },

    /**
     * 添加购物车
     */
    addEnquiryAction: function() {
        //加入购物车
        this.addCat(this.data.drugList[0]);
        var num = this.calculateDrugAmount();
        this.setData({
            drugNum: num,
        })
        this.setData({
            toastView: 0,
        })
        if (this.data.isScan) {
            this.data.isScan = false;
            this.richScanAction();
        }

    },

    /**
     * 取消
     */
    addDrugAction: function() {
        if (this.data.isScan) {
            this.data.isScan = false;
            this.addCat(this.data.drugList[0]);
            var num = this.calculateDrugAmount();
            this.setData({
                drugNum: num,
            })
            this.setData({
                toastView: 0,
            })
        } else {
            this.setData({
                toastView: 0,
            })
        }
    },

    /**
     * 点击联动药品查询对应的药品
     */
    itemDrugAction: function(e) {
        console.log('点击联动药品查询对应的药品 e:', e)
        var index = e.currentTarget.id;
        if (this.data.isSearch) {
            var num = 'drugList[' + index + '].num';
            this.setData({
                [num]: 5,
            })
            console.log('drugList:', this.data.drugList)
            this.setData({
                toastView: 2,
                cancelTxt: '取消',
                sureTxt: '加入到询价单',
                drugName: this.data.drugList[0].medicinalName,
                drugSpecs: this.data.drugList[0].norms + '*' + this.data.drugList[0].scaler + this.data.drugList[0].smallUnit + '/' + this.data.drugList[0].unit,
                drugCompany: this.data.drugList[0].medicinalCompanyName,
                srarchDrugNum: this.data.drugList[0].num,
            })

        } else {
            var arry = this.data.drugList[index];
            this.data.drugList = [];
            this.setData({
                isSearch: true,
                drugList: this.data.drugList.concat(arry),
            })
        }
    },

    /**
     * 添加药品到购物车
     */
    addCat: function(obj) {
        for (var i = 0; i < this.data.drugCatList.length; i++) {
            if (this.data.drugCatList[i].medicinalId == obj.medicinalId) {
                var num = 'drugCatList[' + i + '].num';
                this.setData({
                    [num]: this.data.drugCatList[i].num + obj.num,
                })
                return;
            }
        }
        this.setData({
            drugCatList: this.data.drugCatList.concat(obj),
        })
        var num = this.calculateDrugAmount();
        this.setData({
            drugNum: num,
        })
    },

    /**
     * 扫一扫
     */
    richScanAction: function() {
        console.log('扫一扫')
        var that = this;
        wx.scanCode({
            success: (res) => {
                console.log('res:', res)
                that.data.isScan = true;
                that.barCodeDrugRequest(res.result);
            }
        })
    },

    /**
     * 条码搜索药品
     */
    barCodeDrugRequest: function(drugCode) {
        var that = this;
        var param = {
            medicinalCode: drugCode
        };
        var url = util.BASE_URL + util.ENQUIRY_ORDER_QUERY_MEDICINAL_BY_CODE;
        util.getDataJson(url, param, res => {
            console.log('条码搜索药品 res:', res)
            if (res.data && res.data.code == '0000' && res.data.data.length > 0) {
                res.data.data[0].num = 5;
                that.data.drugList = res.data.data;
                that.setData({
                    toastView: 2,
                    cancelTxt: '加入询价单',
                    sureTxt: '加入并继续添加',
                    drugName: that.data.drugList[0].medicinalName,
                    drugSpecs: that.data.drugList[0].norms + '*' + that.data.drugList[0].scaler + that.data.drugList[0].smallUnit + '/' + that.data.drugList[0].unit,
                    drugCompany: that.data.drugList[0].medicinalCompanyName,
                    srarchDrugNum: that.data.drugList[0].num,
                })
            }
        })
    },

    /**
     * 手动添加
     */
    manuallyAddAction: function() {
        console.log('手动添加')
        if (this.data.isDoubleClick) {
            this.data.isDoubleClick = false;
            wx.navigateTo({
                url: '../addDrug/addDrug',
            })
        }
    },

    /**
     * 选好了
     */
    sureChooseAction: function() {
        console.log('选好了')
        if (this.data.drugCatList.length > 0) {
            if (this.data.isDoubleClick) {
                this.data.isDoubleClick = false;
                if (this.data.isFirstShoppingCat) {
                    var userId = wx.getStorageSync('USERID');
                    wx.setStorageSync(userId, JSON.stringify(this.data.drugCatList))
                    wx.navigateTo({
                        url: '../sureEnquiry/sureEnquiry?drugNum=' + this.data.drugNum,
                    })
                } else {
                    this.setData({
                        isShoppingClick: true,
                        isFirstShoppingCat: true,
                    })
                    this.data.isDoubleClick = true;
                }
            }
        }
    },

    /**
     * 购物车
     */
    shoppingCatAction: function() {
        console.log('购物车')
        if (this.data.drugCatList.length > 0) {
            this.setData({
                isShoppingClick: true,
                isFirstShoppingCat: true,
            })
        }
    },

    /**
     * 清除输入框
     */
    clearInputAction: function() {
        console.log('清除输入框')
        this.setData({
            drugName: '',
            drugList: [],
        })
    },

    /**
     * 搜索请求
     */
    searchDrugRequest: function() {
        var that = this;
        var param = {
            medicinalName: that.data.drugName,
            pageStart: 0,
            pageNum: 20
        };
        var url = util.BASE_URL + util.ENQUIRY_OUDER_QUERY_MEDICINAL_BY_NAME;
        util.getDataJson(url, param, res => {
            console.log('res:', res)
            if (res.data && res.data.code == '0000' && res.data.data.length >= 0) {
                if (res.data.data.length == 0) {
                    that.setData({
                        isSearchNo: false,
                    })
                }
                for (var index in res.data.data) {
                    res.data.data[index].num = 0;
                }
                this.setData({
                    drugList: res.data.data,
                })
            } else {
                this.setData({
                    drugList: [],
                })
            }
        })
    },

    /**
     * 药品数量减 每次减 1
     */
    minusAction: function(e) {
        console.log('药品数量减 e:', e)
        var index = e.currentTarget.id;
        if (this.data.isShoppingClick) {
            if (this.data.drugCatList[index].num == 1) {
                this.setData({
                    toastView: 1,
                    drugName: this.data.drugCatList[index].medicinalName, //药名
                    drugSpecs: this.data.drugCatList[index].norms + '*' + this.data.drugCatList[index].scaler + this.data.drugCatList[index].smallUnit + '/' + this.data.drugCatList[index].unit, //规格
                    drugCompany: this.data.drugCatList[index].medicinalCompanyName, //生产厂家
                })
                this.data.deleteIndex = index;

            } else {
                var num = 'drugCatList[' + index + '].num';
                var tempNum = (this.data.drugCatList[index].num - 1) > 0 ? (this.data.drugCatList[index].num - 1) : 0;
                this.setData({
                    [num]: tempNum,
                })
                var num = this.calculateDrugAmount();
                this.setData({
                    drugNum: num,
                })
            }
        } else {
            if (this.data.drugList[0].num == 1) {
                return;
            }
            var num = 'drugList[' + 0 + '].num';
            var tempNum = (this.data.drugList[0].num - 1) > 0 ? (this.data.drugList[0].num - 1) : 0;
            this.setData({
                [num]: tempNum,
            })
            this.setData({
                drugName: this.data.drugList[0].medicinalName,
                drugSpecs: this.data.drugList[0].norms + '*' + this.data.drugList[0].scaler + this.data.drugList[0].smallUnit + '/' + this.data.drugList[0].unit,
                drugCompany: this.data.drugList[0].medicinalCompanyName,
                srarchDrugNum: this.data.drugList[0].num,
            })
        }
    },

    /**
     * 药品数量加 每次加 5
     */
    addAction: function(e) {
        console.log('药品数量加 e:', e)
        var index = e.currentTarget.id;
        if (this.data.isShoppingClick) {
            var num = 'drugCatList[' + index + '].num';
            this.setData({
                [num]: this.data.drugCatList[index].num + 5,
            })
            var num = this.calculateDrugAmount();
            this.setData({
                drugNum: num,
            })
        } else {
            var num = 'drugList[' + 0 + '].num';
            this.setData({
                [num]: this.data.drugList[0].num + 5,
            })
            this.setData({
                drugName: this.data.drugList[0].medicinalName,
                drugSpecs: this.data.drugList[0].norms + '*' + this.data.drugList[0].scaler + this.data.drugList[0].smallUnit + '/' + this.data.drugList[0].unit,
                drugCompany: this.data.drugList[0].medicinalCompanyName,
                srarchDrugNum: this.data.drugList[0].num,
            })
        }
    },

    /**
     * 计算药品的件数
     */
    calculateDrugAmount: function() {
        var num = 0;
        for (var i = 0; i < this.data.drugCatList.length; i++) {
            num = num + this.data.drugCatList[i].num;
        }
        return num;
    },

    /**
     * 关闭弹窗
     */
    closeWindowAction: function() {
        this.setData({
            isShoppingClick: false,
        })
    },

    /**
     * 购物车内容部分
     */
    catListAction: function() {
        //什么都不需要做，阻止事件传递
        console.log('购物车内容部分')
    },

    /**
     * 关闭弹窗
     */
    closeAction: function() {
        this.setData({
            toastView: 0,
        })
    },

    /**
     * 删除药品
     */
    deleteAction: function() {
        this.data.drugCatList.splice(this.data.deleteIndex, 1)
        this.setData({
            drugCatList: this.data.drugCatList,
            toastView: 0,
        })
        var num = this.calculateDrugAmount();
        if (num == 0) {
            this.setData({
                isShoppingClick: false,
            })
        }
        this.setData({
            drugNum: num,
        })
        var userId = wx.getStorageSync('USERID');
        wx.setStorageSync(userId, JSON.stringify(this.data.drugCatList))
    },

    /**
     * 取消删除
     */
    cancelAction: function() {
        this.setData({
            toastView: 0
        })
    }


})