function hw330Write(node, mac, hubs) {
    hubs.write({
        node: node,
        handle: 23,
        value: '0100'
    })
    hubs.once('write', function (data) {
        if (data.handle === 23) {
            hubs.write({
                node,
                handle: 17,
                value: '0100'
            })
        }
        else if (data.handle === 17) {
            hubs.write({
                node,
                handle: 19,
                value: 'ff2006000227'
            })
        }
        else if(data.handle===19){
             hubs.write({
                node,
                handle: 19,
                value: 'ff000c000501100401010128'
            })
        }
    })
}