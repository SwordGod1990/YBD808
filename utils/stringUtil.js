/**
   * 验证文字
   */
function inspectionString (s) {
    //匹配以数字开头的一个或多个数字且以数字结尾的字符串
    // var reg = /^\d+$/;
    //表示空白符，包括空格、水平制表符、垂直制表符、换行符、回车符、换页符
    // var reg3 = /\s+/;
    var reg2 = /^[a-zA-Z\u4e00-\u9fa5·]+$/;
    return s.replace(reg2, '')
}

/**
 * 去除所有空格
 */
function trimString(s){
    return s.replace(/\s+/g, "");
}

/**
 * 手机号检查
 */
function phoneNumberInspect(value)
{
    if (value.length < 1) {
        return '';
    }
    let t = value.replace(/-/g, '')
    t = trimString(t)
    if (t.length == 11 && t.substr(0, 1) == 1) {
        return phoneNumberAddLine(t);
    } else if (t.substr(0, 1) != 1 || t.length > 11) {
        wx.showToast({
            title: '手机号格式错误',
            image: '/Images/error.png',
        })
        // setTimeout(function () {
            return '';
        // }, 500)

    } else {
        return value;
    }
}

/**
 * 保留两位小数
 */
function mathToFixed(value){
    if(value == '' || typeof value == 'undefined'){
        return 0;
    }else{
        // console.log('math.floor:', (Math.floor(value * 100) / 100).toFixed(2))
        return (Math.floor(value * 100) / 100);
    }

}

/**
 * 手机号加‘-’
 */
function phoneNumberAddLine (value){
    if(value == ''){
        return;
    }
    return value.substring(0, 3) + '-' + value.substring(3, 7) + '-' + value.substring(7, 11);
}

/**
 * 地址解析
 */
function getUrlParms(url, name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = url.substr(1).match(reg);
    if (r != null)
        return unescape(r[2]);
    return '';
}

module.exports = {
    inspectionString: inspectionString,
    trimString: trimString,
    phoneNumberInspect: phoneNumberInspect,
    phoneNumberAddLine: phoneNumberAddLine,
    getUrlParms: getUrlParms,
    mathToFixed: mathToFixed,
}