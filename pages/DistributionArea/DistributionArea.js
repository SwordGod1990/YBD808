// pages/DistributionArea/DistributionArea.js
var areaUtil = require('../../utils/allArea.js')
var util = require('../../utils/util.js')
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        allList: [], //所有地区信息
        provinceList: [], //所有省份信息
        cityList: [], //选中的城市信息
        areaList: [], //选中的地区信息
        cChecked: -1, //记录展开市下面的地区的下标
        pChecked: 1, //标示省份选中
        animationData: {},
        jumpType: 0, //1,EmptyCompanyInfo 为页面跳转
        cityNum: 90,
        isBack: true, //是否点击返回键 true 是
    },

      //得到所有的省市区信息
    GetAllAreas: function() {
        var that = this;
        var url = util.BASE_URL + util.allArea;

        var param = {}
        util.getDataJson(url, param, res => {
            console.log('区域res:', res)
            if (res.data && res.data.code == '0000') {
                // that.data.AllAreas = res.data.content;
                //省：1 ，市：1
                // that.getProvinceCityAreaList(1, 1)
            } else {
                console.log('区域信息请求失败')
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        if (options) {
            this.data.jumpType = options.jumpType;
        }
        this.data.allList = areaUtil.getAllAreaFlag();
        this.data.provinceList = areaUtil.getAllProvinceList();
        if (app.globalData.selectArea.length != 0) {
            this.provinceEcho(app.globalData.selectArea);
        }
        console.log('app.globalData.selectArea:', app.globalData.selectArea)

        // this.GetAllAreas();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.setData({
            provinceList: this.data.provinceList,
            cityList: this.data.allList[this.data.pChecked].cityList,
        })
        console.log('allList:', this.data.allList)
    },
    /*************************** 地址回显 start **************************** */
    /**
     * 省区回显
     */
    provinceEcho: function(selectAreaList) {
        var that = this;

        for (var pi in selectAreaList) {
            for (var index in that.data.provinceList) {
                if (that.data.provinceList[index].provinceCode == selectAreaList[pi].provinceCode) {
                    that.data.provinceList[index].flag = selectAreaList[pi].flag;
                    that.data.allList[index].flag = selectAreaList[pi].flag;
                    if (selectAreaList[pi].flag == 1) {
                        that.cityEcho(index, that.data.allList[index].cityList, selectAreaList[pi].cityList)
                    } else if (selectAreaList[pi].flag == 2 && index == 1) {
                        //设置默认值北京市的状态
                        that.data.allList[index].cityList = that.setSelected(that.data.allList[index].cityList, 2)
                        //添加默认值北京市区的code
                        that.addProvinceAreaCode(index, 2)
                    }

                    if (selectAreaList[pi].flag == 2 && index > 0) {
                        that.data.provinceList[index].cityNum = that.addCityCode(that.data.allList[index].cityList)
                    }
                }
            }
        }
    },

    /**
     * 市回显
     */
    cityEcho: function(arg1, cityList, selectCityList) {
        var that = this;
        for (var pi in selectCityList) {
            // console.log('cityList:', cityList)
            for (var index in cityList) {
                if (cityList[index].cityCode == selectCityList[pi].cityCode) {
                    cityList[index].flag = selectCityList[pi].flag;
                    //处理默认市选项code集合初始值
                    if (cityList[index].cityName != '不限') {
                        var cityNum = that.addSingleCityCode(that.data.allList[arg1].cityNum, selectCityList[pi].cityCode)
                        that.data.provinceList[arg1].cityNum = cityNum;
                        if (selectCityList[pi].flag == 1) {
                            that.areaEcho(cityList[index].areaNum, cityList[index].areaList, selectCityList[pi].areaList)
                        } else if (selectCityList[pi].flag == 2) {
                            cityList[index].areaNum = that.addAreaCode(cityList[index].areaList)
                        }
                    }
                }
            }
        }
    },

    /**
     * 区回显
     */
    areaEcho: function(areaNum, areaList, selectAreaList) {
        var that = this;
        for (var pi in selectAreaList) {
            for (var index in areaList) {
                if (areaList[index].areaCode == selectAreaList[pi].areaCode) {
                    areaList[index].flag = selectAreaList[pi].flag;
                }
                if (selectAreaList[pi].flag == 2) {
                    areaNum = that.addSingleCityCode(areaNum, selectAreaList[pi].areaCode)
                }
            }
        }
    },
    /*************************** 地址回显 end **************************** */

    /**
     * 切换省份
     */
    provienceActionEcho: function() {
        var that = this;
        var index = 1;
        //当全选选中或者选择了全市时，展开地区把状态修改为选中状态
        if (that.data.provinceList[index].flag == 2) {
            that.data.allList[index].cityList = that.setSelected(that.data.allList[index].cityList, 2)
        }

        that.setData({
            provinceChecked: index,
            checked: -1,
            cityList: that.data.provinceList[index].cityList,
        });
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
        if (this.data.isBack) {
            var pages = getCurrentPages();
            var pre = pages[pages.length - 2];
            pre.setData({
                jumpType: 4,
            })
        }
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 确定选择的地址
     */
    sureAction: function() {
        var that = this;
        that.data.isBack = false;
        console.log('sureAction******************************')
        // console.log('allList', that.data.allList)
        var obj = that.getProvinceArry(that.data.allList)
        console.log("newObj:", obj)
        if (this.data.jumpType == 3) {
            app.globalData.selectArea = obj;
            var pages = getCurrentPages();
            var pre = pages[pages.length - 2];
            pre.setData({
                jumpType: 3,
            })
            wx.navigateBack();
        }
    },

    /**
     * 组合选中地址集合
     */
    /***************star********************/
    getAreaArry: function(arr) {
        var arry = []
        for (var index in arr) {
            var obj = {}
            if (arr[index].flag == 2 && arr[index].areaName != '不限') {
                obj.flag = 2
                obj.areaCode = arr[index].areaCode
                obj.areaName = arr[index].areaName
                arry.push(obj)
            }
        }
        return arry;
    },

    getCityArry: function(arr) {
        var arry = []
        for (var index in arr) {
            var obj = {}
            if (arr[index].flag == 2) {
                obj.flag = 2
                obj.areaList = []
                obj.cityCode = arr[index].cityCode
                obj.cityName = arr[index].cityName
                arry.push(obj)
            } else if (arr[index].flag == 1) {
                obj.flag = 1
                if (arr[index].cityName != '不限') {
                    obj.areaList = this.getAreaArry(arr[index].areaList)
                }
                obj.cityCode = arr[index].cityCode
                obj.cityName = arr[index].cityName
                arry.push(obj)
            }
        }
        return arry;
    },

    getProvinceArry: function(arr) {
        var arry = []
        for (var index in arr) {
            var obj = {}
            if (arr[index].flag == 2) {
                obj.flag = 2
                obj.cityList = []
                obj.provinceCode = arr[index].provinceCode
                obj.provinceName = arr[index].provinceName
                arry.push(obj)
            } else if (arr[index].flag == 1) {
                obj.flag = 1
                obj.cityList = this.getCityArry(arr[index].cityList)
                obj.provinceCode = arr[index].provinceCode
                obj.provinceName = arr[index].provinceName
                arry.push(obj)
            }
        }
        return arry;
    },
    /***************end********************/

    /**
     * 添加全国的code码
     */
    addNationalCode: function(state) {
        var that = this;
        if (state == 2) {
            for (var index in that.data.provinceList) {
                if (that.data.provinceList[index].provinceName == '全国') {
                    continue;
                } else {
                    that.data.provinceList[index].cityNum = that.addCityCode(that.data.allList[index].cityList);
                    that.data.allList[index].cityNum = that.addCityCode(that.data.allList[index].cityList);
                }
            }
        } else {
            for (var index in that.data.provinceList) {
                if (that.data.provinceList[index].provinceName == '全国') {
                    continue;
                } else {
                    that.data.provinceList[index].cityNum = [];
                    that.data.allList[index].cityNum = [];
                }
            }
        }

    },

    /**
     * 添加一个省全部市的code码到数组
     */
    addCityCode: function(arry) {
        var that = this;
        var arryCode = [];
        for (var index in arry) {
            if (arry[index].cityName == '不限') {
                continue;
            }
            if (arryCode.indexOf(arry[index].cityCode) == -1) {
                arryCode.push(arry[index].cityCode)
            }
        }
        return arryCode;
    },

    /**
     * 添加全省区的code码
     */
    addProvinceAreaCode: function(index, state) {
        var that = this;
        if (state == 2) {
            for (var i in that.data.allList[index].cityList) {
                if (that.data.allList[index].cityList[i].cityName == '不限') {
                    continue;
                } else {
                    that.data.allList[index].cityList[i].areaNum = that.addAreaCode(that.data.allList[index].cityList[i].areaList)
                }
            }
        } else {
            for (var i in that.data.allList[index].cityList) {
                if (that.data.allList[index].cityList[i].cityName == '不限') {
                    continue;
                } else {
                    that.data.allList[index].cityList[i].areaNum = []
                }
            }
        }
    },

    /**
     * 添加一个市全部区的code码到数组
     */
    addAreaCode: function(arry) {
        var that = this;
        var arryCode = [];
        for (var index in arry) {
            if (arry[index].areaName == '不限') {
                continue;
            }
            if (arryCode.indexOf(arry[index].areaCode) == -1) {
                arryCode.push(arry[index].areaCode)
            }
        }
        return arryCode;
    },

    /**
     * 添加一个code码到数组
     */
    addSingleCityCode: function(arryCode, code) {

        if (arryCode.indexOf(code) == -1) {
            arryCode.push(code)
        }
        return arryCode
    },

    /**
     * 移除一个code码
     */
    removeCode: function(arryCode, code) {
        if (arryCode.length > 0) {
            if (arryCode.indexOf(code) != -1) {
                var index = arryCode.indexOf(code);
                if (index > -1) {
                    arryCode.splice(index, 1);
                }
            }
        }
        return arryCode;
    },


    /**
     * 改变省份的状态
     */
    changeProvinceFlag: function() {
        var that = this;
        for (var index in that.data.provinceList) {
            that.data.allList[index].flag = that.data.provinceList[index].flag;
            that.data.allList[index].cityNum = that.data.provinceList[index].cityNum;
        }
    },

    /**
     * 修改全省市的状态
     */
    changeCityFlag: function(index) {
        var that = this;

        if (that.data.provinceList[index].flag == 2) {
            that.setSelected(that.data.allList[index].cityList, 2)
            that.addProvinceAreaCode(index, 2)
        } else if (that.data.provinceList[index].flag == 0) {
            that.setSelected(that.data.allList[index].cityList, 0)
            that.addProvinceAreaCode(index, 0)
        }

        that.setData({
            cityList: that.data.allList[index].cityList,
        })
    },

    /**
     * 切换省份
     */
    provienceAction: function(e) {
        var that = this;
        var index = e.currentTarget.dataset.idx;
        if (index == 0) {
            return;
        }
        // allList
        //改变市对应的状态
        that.changeCityFlag(index)

        that.setData({
            pChecked: index,
            cChecked: -1,
        })
    },

    /**
     * 选择全省或取消全省
     * var flag = 'provinceList[' + index +'].flag';
     *  that.setData({
     *      [flag]:2,
     *  })
     */
    provinceSelectAction: function(e) {
        var that = this;
        var index = e.currentTarget.dataset.idx;
        if (index == 0) {
            if (that.data.provinceList[index].flag == 2) {
                //移除全国的code码
                that.addNationalCode(0);
                that.setData({
                    provinceList: that.setSelected(that.data.provinceList, 0)
                })
            } else {
                //添加全国的code码
                that.addNationalCode(2);
                that.setData({
                    provinceList: that.setSelected(that.data.provinceList, 2)
                })
            }
            //改变市对应的状态
            that.changeCityFlag(that.data.pChecked)

        } else {
            if (that.data.provinceList[index].flag == 2) {
                that.data.provinceList[index].flag = 0;
                //修改省的code码
                that.data.provinceList[index].cityNum = [];
            } else {
                that.data.provinceList[index].flag = 2;
                //修改省的code码
                that.data.provinceList[index].cityNum = that.addCityCode(that.data.allList[index].cityList)
            }
            //当不存在0，或者1则全国显示状态为2
            if (that.isAllSelected(that.data.provinceList, 0, 1)) {
                that.data.provinceList[0].flag = 2;
            } else if (that.isAllSelected(that.data.provinceList, 1, 2)) {
                that.data.provinceList[0].flag = 0;
            } else {
                that.data.provinceList[0].flag = 1;
            }
            that.setData({
                provinceList: that.data.provinceList,
            })
            //如果勾选的省的市当前在显示状态，也需要改变对应的状态
            if (that.data.pChecked == index) {
                that.changeCityFlag(index)
            }
        }
        //修改集合中省的状态值
        that.changeProvinceFlag();
        //修改全市区的状态
        if (that.data.cChecked != -1) {
            that.changeAreaFlag(that.data.cChecked);
        }
    },

    /**
     * 修改全市区的状态
     */
    changeAreaFlag: function(index) {
        var that = this;

        if (that.data.cityList[index].flag == 2) {
            that.setSelected(that.data.cityList[index].areaList, 2)
        } else if (that.data.cityList[index].flag == 0) {
            that.setSelected(that.data.cityList[index].areaList, 0)
        }

        that.setData({
            areaList: that.data.cityList[index].areaList,
        })
    },

    /**
     * 展开地区，进行选择
     */
    cityCheckAction: function(e) {
        var that = this;
        var index = e.currentTarget.dataset.idx;
        //去除全选项
        if (index == 0) {
            return;
        }
        //当全选选中或者选择了全市时，展开地区把状态修改为选中状态
        that.changeAreaFlag(index)

        if (that.data.cChecked == index) {
            that.setData({
                cChecked: -1
            });
        } else {
            that.setData({
                cChecked: index,
            });
        }
    },

    /**
     * 全市或取消全市
     */
    citySelectAction: function(e) {
        var that = this;
        var index = e.currentTarget.dataset.idx;
        if (index == 0) {
            if (that.data.cityList[index].flag == 2) {
                that.data.provinceList[that.data.pChecked].flag = 0;
                //移除市code码
                that.addProvinceAreaCode(that.data.pChecked, 0)
                that.data.cityList = that.data.allList[that.data.pChecked].cityList;
                that.data.provinceList[that.data.pChecked].cityNum = []
                that.setData({
                    cityList: that.setSelected(that.data.cityList, 0)
                })
            } else {
                that.data.provinceList[that.data.pChecked].flag = 2;
                //添加市code码
                that.addProvinceAreaCode(that.data.pChecked, 2)
                that.data.cityList = that.data.allList[that.data.pChecked].cityList;
                that.data.provinceList[that.data.pChecked].cityNum = that.addCityCode(that.data.allList[that.data.pChecked].cityList)
                that.setData({
                    cityList: that.setSelected(that.data.cityList, 2)
                })
            }
        } else {
            if (that.data.cityList[index].flag == 2) {
                that.data.cityList[index].flag = 0;
                //移除区的code码
                that.data.cityList[index].areaNum = []
                that.removeCode(that.data.provinceList[that.data.pChecked].cityNum, that.data.cityList[index].cityCode)

            } else {
                that.data.cityList[index].flag = 2;
                //添加区的code码
                that.data.cityList[index].areaNum = that.addAreaCode(that.data.cityList[index].areaList);
                that.addSingleCityCode(that.data.provinceList[that.data.pChecked].cityNum, that.data.cityList[index].cityCode)
            }

            //当勾选市的时候，同时改变市全选框的选择状态
            if (that.isAllSelected(that.data.cityList, 0, 1)) {
                that.data.cityList[0].flag = 2;
            } else if (that.isAllSelected(that.data.cityList, 1, 2)) {
                that.data.cityList[0].flag = 0;
            } else {
                that.data.cityList[0].flag = 1;
            }

            that.setData({
                cityList: that.data.cityList,
            })

            //当勾选市的时候，同时改变省的选择状态
            if (that.isAllSelected(that.data.cityList, 0, 1)) {
                that.data.provinceList[that.data.pChecked].flag = 2;
            } else if (that.isAllSelected(that.data.cityList, 1, 2)) {
                that.data.provinceList[that.data.pChecked].flag = 0;
            } else {
                that.data.provinceList[that.data.pChecked].flag = 1;
            }
        }
        //省的状态改变，同时改变全国的状态
        if (that.isAllSelected(that.data.provinceList, 0, 1)) {
            that.data.provinceList[0].flag = 2;
        } else if (that.isAllSelected(that.data.provinceList, 1, 2)) {
            that.data.provinceList[0].flag = 0;
        } else {
            that.data.provinceList[0].flag = 1;
        }
        //修改省的状态
        that.setData({
            provinceList: that.data.provinceList,
        })

        //修改全市区的状态
        if (that.data.cChecked != -1) {
            that.changeAreaFlag(that.data.cChecked);
        }

        that.data.allList[that.data.pChecked].cityList = that.data.cityList;
        that.changeProvinceFlag();
    },

    /**
     * 地区选择
     */
    areaSelectAction: function(e) {
        var that = this;
        var index = e.currentTarget.dataset.idx;
        if (that.data.areaList[index].flag == 2) {
            that.data.areaList[index].flag = 0
            var arryCode = that.removeCode(that.data.cityList[that.data.cChecked].areaNum, that.data.areaList[index].areaCode)
            that.data.cityList[that.data.cChecked].cityNum = arryCode;
        } else {
            that.data.areaList[index].flag = 2
            var arryCode = that.addSingleCityCode(that.data.cityList[that.data.cChecked].areaNum, that.data.areaList[index].areaCode)
            that.data.cityList[that.data.cChecked].cityNum = arryCode;
        }
        that.setData({
            areaList: that.data.areaList,
        })

        //当勾选区的时候，同时改变市全选框的选择状态
        if (that.isAllSelected(that.data.areaList, 0, 0)) {
            that.data.cityList[that.data.cChecked].flag = 2;
            var arryCode = that.addSingleCityCode(that.data.provinceList[that.data.pChecked].cityNum, that.data.cityList[that.data.cChecked].cityCode)
            that.data.provinceList[that.data.pChecked].cityNum = arryCode;
        } else if (that.isAllSelected(that.data.areaList, 2, 2)) {
            that.data.cityList[that.data.cChecked].flag = 0;
            var arryCode = that.removeCode(that.data.provinceList[that.data.pChecked].cityNum, that.data.cityList[that.data.cChecked].cityCode)
            that.data.provinceList[that.data.pChecked].cityNum = arryCode;
        } else {
            that.data.cityList[that.data.cChecked].flag = 1;
            var arryCode = that.addSingleCityCode(that.data.provinceList[that.data.pChecked].cityNum, that.data.cityList[that.data.cChecked].cityCode)
            that.data.provinceList[that.data.pChecked].cityNum = arryCode;
        }

        //当勾选市的时候，同时改变市全选框的选择状态
        if (that.isAllSelected(that.data.cityList, 0, 1)) {
            that.data.cityList[0].flag = 2;
        } else if (that.isAllSelected(that.data.cityList, 1, 2)) {
            that.data.cityList[0].flag = 0;
        } else {
            that.data.cityList[0].flag = 1;
        }

        that.setData({
            cityList: that.data.cityList,
        })

        //当勾选市的时候，同时改变省的选择状态
        if (that.isAllSelected(that.data.cityList, 0, 1)) {
            that.data.provinceList[that.data.pChecked].flag = 2;
        } else if (that.isAllSelected(that.data.cityList, 1, 2)) {
            that.data.provinceList[that.data.pChecked].flag = 0;
        } else {
            that.data.provinceList[that.data.pChecked].flag = 1;
        }

        //省的状态改变，同时改变全国的状态
        if (that.isAllSelected(that.data.provinceList, 0, 1)) {
            that.data.provinceList[0].flag = 2;
        } else if (that.isAllSelected(that.data.provinceList, 1, 2)) {
            that.data.provinceList[0].flag = 0;
        } else {
            that.data.provinceList[0].flag = 1;
        }
        //修改省的状态
        that.setData({
            provinceList: that.data.provinceList,
        })

        that.data.cityList[that.data.cChecked].areaList = that.data.areaList;
        that.data.allList[that.data.pChecked].cityList = that.data.cityList;
        that.changeProvinceFlag();
    },

    /**
     * 判断是否全选，来修改状态
     */
    isAllSelected: function(array, agr1, agr2) {
        var that = this;
        for (var index in array) {
            if (index == 0) {
                continue;
            }
            if (array[index].flag == agr1 || array[index].flag == agr2) {
                return false;
            }
        }
        return true;
    },

    /**
     * 设置集合选中的状态
     */
    setSelected(array, state) {
        if (array.length == 0) {
            return;
        } else {
            for (var index in array) {
                array[index].flag = state;
            }
            return array;
        }
    },
})