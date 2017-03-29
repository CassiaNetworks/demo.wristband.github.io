exports.changeLang = function (jsonObj) {
    if (Object.prototype.toString.apply(jsonObj) !== '[object Object]')
        return
    $('[i18n]').each(function () {
        const key = $(this).attr('i18n')
        jsonObj[key] && $(this).html(jsonObj[key])
    })
}
exports.getLang = function () {
    let userlang = (navigator.language) ? navigator.language : navigator.userLanguage;
    userlang = userlang.match(/cn/i) ? 'cn' : 'en'
    return userlang
}