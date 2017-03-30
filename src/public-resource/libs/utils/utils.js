import lang from '../../../pages/sport/sport/page'
exports.changeLang = function (jsonObj) {
    let _lang = jsonObj||lang
    $('[i18n]').each(function () {
        const key = $(this).attr('i18n')
        _lang[key] && $(this).html(_lang[key])
    })
}
exports.getLang = function () {
    let userlang = (navigator.language) ? navigator.language : navigator.userLanguage;
    userlang = userlang.match(/cn/i) ? 'cn' : 'en'
    return userlang
}