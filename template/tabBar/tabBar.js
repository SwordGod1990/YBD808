//初始化数据
function tabbarinit() {
    return [
        {
            "current": 0,
            "pagePath": "/pages/buyer/enquiry/enquiry",
            "iconPath": "/Images/notselect.png",
            "selectedIconPath": "/Images/selest.png",
            "text": "询价单"
        },
        {
            "current": 0,
            "pagePath": "/pages/buyer/purchaseNote/purchaseNote",
            "iconPath": "/Images/purchase_no.png",
            "selectedIconPath": "/Images/purchase.png",
            "text": "采购单"

        },
        {
            "current": 0,
            "pagePath": "/pages/buyer/user/user",
            "iconPath": "/Images/my.png",
            "selectedIconPath": "/Images/myselect.png",
            "text": "我的"
        }
    ]

}
//tabbar 主入口
function tabbarmain(bindName = "tabdata", id, target) {
    var that = target;
    var bindData = {};
    var otabbar = tabbarinit();
    otabbar[id]['iconPath'] = otabbar[id]['selectedIconPath']//换当前的icon
    otabbar[id]['current'] = 1;
    bindData[bindName] = otabbar
    that.setData({ bindData });
}

module.exports = {
    tabbar: tabbarmain
}