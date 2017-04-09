/**
 * 2017/04/05 
 */
export default (function () {
    let api = {}
    let __es = function (target, url, fn) {
        let es = target.es = new EventSource(String(url));
        es.onmessage = function (event) {
            fn && fn(event)
        }
    }
    __es.close = function (target) {
        let es = target.es;
        if (es && es.onmessage) {
            es.close();
            es = es.onmessage = null;
            target.es = null;
        }
    }


    api.oauth2 = function (o) {
        o = o || {}
        let next = function (d) {
            o.access_token = d || ''
            o.authorization = 'Bearer ' + (d || '')
        }

       return $.ajax({
            type: 'post',
            url: o.server + '/oauth2/token',
            headers: {
                'Authorization': 'Basic ' + btoa(o.developer + ':' + o.password)
            },
            data: {
                "grant_type": "client_credentials"
            },
            success: function (data) {
                o.access_token = data.access_token
                next(data.access_token)
            }
        })
    }
    api.on = function (e, fn) {
        api.on[e] = fn
        if (e === 'notify' && !api.notify.es) {
            api.notify(true)
        }
        return api
    }
    api.off = function (e) {
        api.on[e] = null
        delete api.on[e]
        if (e === 'notify') {
            api.notify(false)
        }
        if (e === 'scan') {
            __es.close(api.scan)
        }
        return api
    }
    api.trigger = function (e, args) {
        api.on[e] && (typeof api.on[e] === 'function') && (api.on[e].apply(api, args))
        return api
    }

    api.scan = function (chip) {
        __es(api.scan, api.server + '/gap/nodes/?event=1&mac=' + api.hub + '&chip=' + (chip || 0) + '&access_token=' + api.access_token,
            function (event) {

                api.trigger('scan', [api.hub, event.data])
            });
        return api
    };
    api.scan.close = function () {
        __es.close(api.scan)
        return api
    };
    api.conn = function (o) {
        o = o || {}
        $.ajax({
            type: 'post',
            url: api.server + '/gap/nodes/' + o.node + '/connection?mac=' + (o.hub || api.hub),
            headers: api.local ? '' : {
                'Authorization': api.authorization
            },
            data: {
                "type": o.type || "public"
            },
            success: function (data) {
                // debugger
                console.log(data)
                o.success && o.success(o.hub || api.hub, o.node, data)
                api.trigger('conn', [o.hub || api.hub, o.node, data])
            }
        })
        return api
    }
    api.disconn = function (o) {
        o = o || {}
        $.ajax({
            type: 'delete',
            url: api.server + '/gap/nodes/' + o.node + '/connection?mac=' + (o.hub || api.hub),
            headers: api.local ? '' : {
                'Authorization': api.authorization
            },
            success: function (data) {
                console.log(data)
                o.success && o.success(o.hub || api.hub, o.node, data)
                api.trigger('disconn', [o.hub || api.hub, o.node, data])
            }
        })
        return api
    }
    api.conn.close = function (o) {
        o = o || {}
        $.ajax({
            type: 'delete',
            url: api.server + '/gap/nodes/' + o.node + '/connection?mac=' + (o.hub || api.hub),
            headers: api.local ? '' : {
                'Authorization': api.authorization
            },
            success: function (data) {
                console.log(data)
                o.success && o.success(o.hub || api.hub, o.node, data)
                api.trigger('conn.close', [o.hub || api.hub, o.node, data])
            }
        })
        return api
    }

    api.devices = function (o) {
        o = o || {}
        $.ajax({
            type: 'get',
            url: api.server + '/gap/nodes/?connection_state=connected&mac=' + (o.hub || api.hub),
            headers: api.local ? '' : {
                'Authorization': api.authorization
            },
            success: function (data) {
                o.success && o.success(data)
            }
        })
        return api
    }

    api.discover = function (o) {
        o = o || {}
        $.ajax({
            type: 'get',
            url: api.server + '/gatt/nodes/' + o.node + '/services/characteristics/descriptors?mac=' + (o.hub || api.hub),
            headers: api.local ? '' : {
                'Authorization': api.authorization
            },
            success: function (data) {
                console.log(data)
                o.success && o.success(data)
            }
        })
        return api
    }

    api.write = function (o) {
        o = o || {}
        $.ajax({
            type: 'get',
            url: api.server + '/gatt/nodes/' + o.node + '/handle/' + o.handle + '/value/' + o.value + '/?mac=' + (o.hub || api.hub),
            // headers: {'Authorization': api.authorization},
            success: function (data) {
                o.success && o.success(data)
            }
        })
        return api
    }

    api.read = function (o) {
        o = o || {}
        $.ajax({
            type: 'get',
            url: api.server + '/gatt/nodes/' + o.node + '/handle/' + o.handle + '/value/?mac=' + (o.hub || api.hub),
            headers: {
                'Authorization': api.authorization
            },
            success: function (data) {
                o.success && o.success(data)
            }
        })
        return api
    }

    api.notify = function (toggle,info) {
        if (toggle && !api.notify.es) {
            __es(api.notify, api.server + '/gatt/nodes/?event=1&mac=' + api.hub + '&access_token=' + api.access_token,
                function (event) {
                    api.trigger('notify', [info.hubMac, event.data])
                })
        } else {
            __es.close(api.notify)
        }
        return api
    }

    api.online = function (o) {
        o = o || {}
        debugger
        let _url = api.server
        if (api.local) {
            _url += `/cassia/info/`
        } else {
            _url += `/cassia/hubs/${api.hub}`
        }

        $.ajax({
            type: 'get',
            url: _url,
            headers: api.local ? '' : {
                'Authorization': api.authorization
            },
            context: o.context || this,
            dataType: 'json',
            success: function (data) {
                o.success && o.success(data)
            },
            timeout: 5000,
            error: function () {
                o.error && o.error(arguments)
            }
        })
        return api
    }
    return api
    // G.api = api
});