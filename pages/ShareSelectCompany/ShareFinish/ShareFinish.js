// pages/sendFinish/sendFinish.js
var app = getApp

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageUrl: "/Images/finish_2x.png"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    if (options.stus == '') {
      //此处为如果上个页面选中则显示
      that.setData({
          imageUrl: "/Images/finish_2x.png"
      })
    } else if (options.stus == 0) {
      //此处为如果上个页面选中则隐藏
      that.setData({
          imageUrl: "/Images/weixuan_2x.png"
      })
    } else {

    }
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
