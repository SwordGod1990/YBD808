// pages/buyer/currentCompanyInfo/currentCompanyInfo.js
var util = require("../../../utils/util.js")
var clinicId

Page({

  /**
   * 页面的初始数据
   */
  data: {
    clinicName: "",          //诊所名字
    clinicType: "",          //企业类型(1:诊所 2:诊所+药房,3:药房4:综合诊所 5:社区服务中心)
    licenceNo: "",           //营业执照号
    location: "",            //所在地区
    address: "",             //地址
    contactsPerson: "",      //诊所联系人
    contactsPhone: "",       //诊所联系人电话
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    clinicId = options.clinicId
    console.log("clinicId:", clinicId)
    //根据上个页面（我的），传过来的参数clinicId，获取数据
    var url = util.BASE_URL + util.CLINIC_QUERYCLINIC_BY_CID
    var param = { clinicId: clinicId }
    wx.showLoading({
      title: '加载中...',
    })
    util.getDataJson(url, param, res => {
      console.log("res", res)
      var licenceNo1 = res.data.data.licenceNo
      if (licenceNo1 != ''){
          licenceNo1 = licenceNo1.substring(0, 2) + "****" + licenceNo1.substring(4, 5);
      }
      if (res.statusCode == 200) {
        this.setData({
          clinicName: res.data.data.clinicName,
          clinicType: res.data.data.clinicType,
          //字符串截取前两位和后两位，中间以*代替
          licenceNo: licenceNo1,
          location: res.data.data.provinceName + " " + res.data.data.cityName + " " + res.data.data.areaName,
          address: res.data.data.address,
          contactsPerson: res.data.data.contactsPerson,
          contactsPhone: res.data.data.contactsPhone,
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

  }
})