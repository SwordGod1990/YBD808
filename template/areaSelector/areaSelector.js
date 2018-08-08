var areaUtil = require('../../utils/allArea.js')

/**
   * 获取所选择省，市， 区集合
   * arg1:省的下标
   * arg2:市的下标
   */
function getProvinceCityAreaList(arg1, arg2, target) {
    console.log('arg1:', arg1, 'arg2:', arg2)
    var that = target;
    var provinces = areaUtil.getProvinceList();
    var citys = areaUtil.getCityList(arg1)
    var areas = areaUtil.getAreaList(arg1, arg2)
    that.setData({
        provinces: provinces,
        citys: citys,
        areas: areas,
    })
}


  /**
   * 根据省，市，区名称，回显
   */
  function setEchoAddress(province, city, area) {
      var provinces = setProvinceList();
      var p = provinces.indexOf(province) >= 0 ? provinces.indexOf(province) : 0;
      var citys = setCityList(p)
      var c = citys.indexOf(city) >= 0 ? citys.indexOf(city) : 0;
      var areas = setAreaList(p, c)
      var a = areas.indexOf(area) >= 0 ? areas.indexOf(area) : 0;

      this.setData({
          areaItemValue: [p, c, a],
          provinces: provinces,
          citys: citys,
          areas: areas,
      })
      changeIndex = areaItemValue;
  }

module.exports = {
    changeArea: getProvinceCityAreaList,
}

