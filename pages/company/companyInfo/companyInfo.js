// pages/company/companyInfo/companyInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      merchandiserInfo: '', //业务员信息
      companyCode: '', //组织机构代码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      if (typeof options.merchandiserInfo != 'undefined'){
          var merchandiserInfo = JSON.parse(options.merchandiserInfo);
          console.log('merchandiserInfo:', merchandiserInfo)
          if (merchandiserInfo && merchandiserInfo.companyCode != '' && typeof merchandiserInfo.companyCode != 'undefined') {
              this.data.companyCode = merchandiserInfo.companyCode.substring(0, 4) + '******' + merchandiserInfo.companyCode.substring(merchandiserInfo.companyCode.length - 4, merchandiserInfo.companyCode.length)
          }
          this.setData({
              merchandiserInfo: merchandiserInfo,
              companyCode: this.data.companyCode,
          })
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
//   onPullDownRefresh: function () {
  
//   },

//   /**
//    * 页面上拉触底事件的处理函数
//    */
//   onReachBottom: function () {
  
//   },

//   /**
//    * 用户点击右上角分享
//    */
//   onShareAppMessage: function () {
  
//   }
})