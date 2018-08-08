function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':')
}
//获取时间返回年月日时分秒
function formatTime2(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
//获取时间返回年月日
function formatTime3(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('-')
}

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}


/**
 * 是否填写企业信息，返回true 或者 false
 * code:"0003", "公司账号已被停用!"
 * code:"0005", "企业信息审核未通过!"
 * code:"0014", "所在地区不能为空"
 * code:"0004", "暂时没有您的公司信息"
 * code:"0000", 通过，或未审核  isPass：0:未审核；1:通过
 */
function WhetherHaveCompanyInfo(callback) {
    var util = require('../utils/util.js')
    var userId = wx.getStorageSync('USERID')

    var url = util.BASE_URL + util.getBusinessInfo;
    var param = {
        sysUserId: userId
    }
    util.getDataJson(url, param, res => {
        console.log('得到企业信息res:', res)
        if (res.data && res.data.code == '0000') {
            if (res.data.content.isPass == 0) {

            } else if (res.data.content.isPass == 1) {

            }
        }
    })
}

/**
 * 获取userid
 */
function GetUserid(URL, callback) {
    var that = this;
    console.log('URL:', URL)
    wx.request({
        url: URL,
        header: {
            'content-type': 'application/json'
        },
        method: 'POST',
        success: function(res) {
            console.log('获取userid数据', res)
            if (res.data.code == '0000') {
                wx.setStorageSync('USERID', res.data.userId)
                wx.setStorageSync('OPENID', res.data.openId)
                if (res.data.phone != '' && ("undefined" != typeof res.data.phone) && res.data.phone != "undefined") {
                    wx.setStorageSync('USERINFOREGISTER', 1)
                    wx.setStorageSync('phone', res.data.phone)
                }
                if (res.data.phone == '' && res.data.type == '2') {
                    //商业公司
                    wx.setStorageSync('USERSTATUS', 2)
                    //1 历史数据处理
                    wx.setStorageSync('USEROLDDATA', 1)
                } else if (res.data.type == '2') {
                    //商业公司
                    wx.setStorageSync('USERSTATUS', 2)
                    //已经绑定
                    wx.setStorageSync('USERINFOSTATUS', 1)
                }
                if (res.data.type == '1') {
                    //诊所
                    wx.setStorageSync('USERSTATUS', 1)
                    //已经绑定
                    wx.setStorageSync('USERINFOSTATUS', 1)
                }

            } else {
                // wx.hideLoading()
                console.log('通过后台获取openID不是0000')
            }
            callback(res)
        },
        fail: function(res) {
            console.log('通过后台获取openID失败')
            callback(res)
        }
    })
}

/**
 * 网络请求
 */
function getDataJson(url, param, callback) {
    console.log('url: ', url)
    console.log('param: ', param)
    const requestTask = wx.request({
        url: url,
        data: param,
        header: {
            'content-type': 'application/json'
        },
        success: function(res) {
            wx.hideLoading()
            callback(res)
        },
        fail: function(res) {
            wx.hideLoading()
            callback(res)
        }
    })
    return requestTask;
}


// 日期月份/天的显示，如果是1位数，则在前面加上'0'
function getFormatDate(arg) {
    if (arg == undefined || arg == '') {
        return '';
    }

    var re = arg + '';
    if (re.length < 2) {
        re = '0' + re;
    }

    return re;
}

//数组深度拷贝
function deepCopy(obj) {
    if (typeof obj != 'object') {
        return obj;
    }
    var newobj = {};
    for (var attr in obj) {
        newobj[attr] = deepCopy(obj[attr]);
    }
    return newobj;
}

module.exports = {
    deepCopy: deepCopy,
    getFormatDate: getFormatDate,
    GetUserid: GetUserid,
    formatTime: formatTime,
    formatTime2: formatTime2,
    formatTime3: formatTime3,
    getDataJson: getDataJson,
    WhetherHaveCompanyInfo: WhetherHaveCompanyInfo,
    //商城域名 本地地址
    // SHOPPING_MALL_BASE_URL: 'http://192.168.29.166:8081/ecMall/',
    //商城域名 开发地址
    // SHOPPING_MALL_BASE_URL: 'https://local-ecmall.zhiyiyunzhenshi.com/',
    //商城域名 测试地址
    // SHOPPING_MALL_BASE_URL: 'https://test6.zhiyiyunzhenshi.com/',
    //商城域名 正式地址
    SHOPPING_MALL_BASE_URL: 'https://www.zhiyimall.com/',



    //本地地址
    // BASE_URL: 'http://192.168.29.166:8085/',
    // BASE_URL: 'http://192.168.29.166:8081/',
    // 正式地址
    BASE_URL: 'https://m.zhiyijiankang.com/',
    //测试
    // BASE_URL: 'https://test-mqps.zhiyiyunzhenshi.com/',
    // 开发
    // BASE_URL: 'https://local-mqps.zhiyiyunzhenshi.com/',
    
    //bate
    // BASE_URL: 'https://bt-mqps.yunzhenshi.com/',


    key: '5xIPPms1c2SxpezrlOeURbgWlrsfPGMq',

    //所有的省市区
    allArea: 'sysDictArea/allArea',
    //授权登录
    Login: 'sysUser/loginByWeChat',
    //更新企业信息
    UpdateInfo: 'business/updateBusinessInfo',
    //我的页面保存企业信息
    saveBusinessInfo: 'business/saveBusinessInfo',
    //我的页面得到企业信息
    getBusinessInfo: 'business/getBusinessInfo?',
    //获取药品报单信息
    ENQUIRY_ORDER_DETAIL: 'offerOrder/enquiryOrderDetail?',
    //获取报价单列表信息
    ALL_OFFER_ORDER: 'offerOrder/allOfferOrder?',
    //已报价详情信息
    DETAIL_PRICE_INFO: 'offerOrder/orderDetail?',
    //未报价和已忽略详情
    IGNORE_DETAIL_INFO: 'offerOrder/orderInfoDetail?',
    //忽略报价
    IGNORE_ORDER: 'offerOrder/ignoreOffer?',
    //包装单位
    ALL_UNITS: 'saveStorage/findDosage',
    //上传分享
    UPLOAD_SHARE: 'offerOrder/updateIsShare?',
    //确认收货
    UPDATE_ORDER_BUSINESS_STATUS: 'offerOrder/updateOrderBusinessStatusById?',
    //查询供货单详情
    // SUPPLY_ORDER_DETAIL: 'offerOrder/supplyOrderDetail?',
    //获取供货单数量
    COUNT_SUPPLY_ORDER: 'offerOrder/countSupplyOrder?',
    //获取供货单列表
    ALL_SUPPLY_ORDER: 'offerOrder/allSupplyOrder?',
    //上传报价单
    UPLOAD_PRICELIST: 'offerOrder/addOrderInfo?',
    //该单子是否可以报价
    CAN_ORDER: 'offerOrder/isOffer?',
    //分享的id是否已经报价
    BOOLE_OFFER: 'offerOrder/booleanOffer?',
    //创建报价单(用户和单子id关联)
    Add_OrderId: 'offerOrder/addOfferOrder?',
    //返回企业状态
    BUSINESS_CHECK_USER: 'business/checkUser?',
    //查看单个药品报价
    OFFER_ORDER_ENQUIRY_MEDICINAL_OFFER: 'offerOrder/enquiryMedicinalOffer',
    //查询医药公司报价
    OFFER_ORDER_ENQUIRY_COMPANIES_OFFER: 'offerOrder/enquiryCompaniesOffer',
    //获取已报价信息
    OFFER_ORDER_QUERY_OFFER_ORDER_BY_ENQUIRY_ID: 'offerOrder/queryOfferOrderByEnquiryId',
    //获取未报价信息
    OFFER_ORDER_QUERY_OFFER_ORDER_BY_ENQUIRY_ID2: 'offerOrder/queryOfferOrderByEnquiryId2',
    //获取询价单列表
    OFFER_ORDER_QUERY_OFFER_ORDER_BY_ENQUIRY_ID3: 'offerOrder/queryOfferOrderByEnquiryId3',
    //获取采购单列表
    ORDERS_ALL_ORDER: 'orders/allOrder',
    //确认收货
    ORDERS_CONFIRM_ORDER: 'orders/confirmOrder',
    //搜索商业公司
    BUSINESS_QUERY_BUSINESS_BY_NAME: 'business/queryBusinessByName',
    //判断商业公司是否已存在
    BUSINESS_CHECK_BUSINESS_IS_ONLY: 'business/checkBusinessIsOnly',
    //保存商业公司和业务员信息
    BUSINESS_BINDING_BUSINESS_AND_USER: 'business/bindingBusinessAndUser',
    //更新商业公司信息
    BUSINESS_UPDATE_BUSINESS_AND_USER: 'business/updateBusinessAndUser',
    //获取询价单集合
    ENQUIRY_ORDER_QUERY_ENQUIRY_ORDER_LIST: 'enquiryOrder/queryEnquiryOrderList',
    //获取业务员信息
    BUSINESS_GET_BUSINESS_INFO: 'business/getBusinessInfo',
    //修改业务员配送区域
    SYSUSER_UPDATE_USER_BY_ID: 'sysUser/updateUserById',
    //获取收货人信息
    ENQUIRY_ORDER_NEW_CLINIC_ADDRESS_TO_WX: 'enquiryOrder/newClinicAddressToWx',
    //更新收货人信息
    ENQUIRY_ORDER_SAVE_CLINIC_ADDRESS: 'enquiryOrder/saveClinicAddress',
    //确认采购单
    ORDERS_CREATE_ORDER_ALSO_SPLIT: 'orders/createOrderAlsoSplit',
    //保存或修改询价单信息
    ENQUIRY_ORDER_UPDATE_SAVE_ENQUIRY_ORDER_TO_WX: 'enquiryOrder/updateSaveEnquiryOrderToWx',
    //搜索查询药品
    ENQUIRY_OUDER_QUERY_MEDICINAL_BY_NAME: 'enquiryOrder/queryMedicinalByName',
    //条码搜索药品
    ENQUIRY_ORDER_QUERY_MEDICINAL_BY_CODE: 'enquiryOrder/queryMedicinalByCode',
    //手动添加药品(创建询价搜索添加药品展示页)
    ENQUIRYORDER_ADDMEDICINAL: "enquiryOrder/addMedicinal?",
    //诊所我的页面
    CLINIC_CLINICMY: "clinic/clinicMy",
    //根据诊所Id查询 诊所信息
    CLINIC_QUERYCLINIC_BY_CID: "clinic/queryClinicByCID",
    //发送验证码接口
    SYSUSER_SENDCODE: "sysUser/sendCode?",
    //注册
    SYSUSER_REG: "sysUser/reg?",
    //绑定用户类型
    SYSUSER_CHOOSEROLE: "sysUser/chooseRole?",
    //删除询价单
    ENQUIRY_ORDER_DEL_ENQUIRY_INFO: 'enquiryOrder/delEnquiryInfo',
    //诊所查询
    CLINIC_QUERY_CLINIC: 'clinic/queryClinic',
    //保存诊所信息
    CLINIC_BINDING_CLINIC: 'clinic/bindingClinic',
    //根据ID查询诊所
    CLINIC_QUERY_CLINIC_BY_CID: 'clinic/queryClinicByCID',
    //检验诊所信息是否存在
    CLINIC_CHECK_CLINIC_IS_ONLY: 'clinic/checkClinicIsOnly',
    //采购单详情
    ORDERS_QUERY_ORDER_INFO_BY_ORDER_BUS_ID: 'orders/queryOrderInfoByOrderBusId',
    //确认收货
    ORDERS_CONFIRM_ORDER: 'orders/confirmOrder',
    //获取诊所ID和诊所名称
    CLINIC_QUERY_CLINIC_BY_USER_ID: 'clinic/queryClinicByUserId',
    //获取供货单详情
    ORDERS_QUERY_ORDER_DETAIL_BY_ID: 'orders/queryOrderDetailById',
    //扫码根据活动药品ID查询药品信息
    ORDERS_QR_PURCHASE: 'orders/qrPurchase',
    //订单驳回
    ORDERS_REFUSE_ORDER: 'orders/refuseOrder?',
    //扫码商城药品确认采购
    ORDERS_SAVE_ACTIVE_ORDERS: 'orders/saveActiveOrders',
    //获取供货单详情
    ORDERS_ORDER_INFO: 'orders/orderInfo',
    //登录商城账号
    LOGIN_W_lOGIN: 'login/wlogin',

}