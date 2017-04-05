import lang from '../../../pages/sport/sport/page'
exports.changeLang = function (jsonObj) {
    let _lang = jsonObj || lang
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

exports.Reg = {
    mac: /^([0-9a-f]{2}\:){5}[0-9a-f]{2}$/i,
    ip: /^(?:(?:2[0-4][0-9]\.)|(?:25[0-5]\.)|(?:1[0-9][0-9]\.)|(?:[1-9][0-9]\.)|(?:[0-9]\.)){3}(?:(?:2[0-5][0-5])|(?:25[0-5])|(?:1[0-9][0-9])|(?:[1-9][0-9])|(?:[0-9]))$/,
    server: /\。/,
    developer: /^[a-z_]+[a-z0-9_]*$/i

}

exports.trimeClone = function (obj) {
    let data = {},
        _obj = obj || {}
    for (let key in obj) {
        data[key] = $.trim(_obj[key])
    }
    return data
}