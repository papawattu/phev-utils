import net from 'net'
import { decode, encode, toMessageArray, buildMsg } from './encoder_decoder'
import { DEFAULT_LENGTH, START_SEND, REQUEST_TYPE, SEND_CMD, RESP_CMD, EMPTY_DATA, PING_SEND_CMD, RESPONSE_TYPE } from './message-constants'
import { log, codes } from '.'


//const sendFullCommand = (register, data) => send(buildMsg(RESP_CMD)(REQUEST_TYPE)(register)(DEFAULT_LENGTH + data.length - 1)(data))

//const sendDateSync = date => sendFullCommand(codes.KO_WF_DATE_INFO_SYNC_EVR, Buffer.from([date.getFullYear() - 2000, date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), 1]))

const startDateSync = () => {
    log.debug('Started Date sync')
    return setInterval(() => {
        const date = new Date()
        log.debug('Send date sync ' + date.toJSON())
        sendDateSync(date)
    }, 30000)
}
/*
messaging.start()
messaging.registerHandler(message => {
    const messages = toMessageArray(message).map(x => decode(x)).filter(x => x.command === 0xf6 && x.type === 0)

    const response = messages.map(message => {

        message.command = 0x6f
        message.type = 1
        message.data = Buffer.from([0])
        send(message)
    })
})
*/
const swapNibble = byte => {
    if(byte == 0xf2) return 0x2f
    if(byte == 0xf6) return 0x6f
    if(byte == 0xf9) return 0x9f
    return 0
}
const responder = ((data, socket) => {
    EncoderDecoder.popMessage(doubleMessage,(message) => {
        const cmd = EncoderDecoder.decode(message)
        const response = {
            command : swapNibble(cmd.command),
            length  : DEFAULT_LENGTH,
            type    : RESPONSE_TYPE,
            register : cmd.register,
            data    : EMPTY_DATA, 
        }

        socket.write(EncoderDecoder.encode(response))
    });
});
const startSocket = () => {
    const server = net.createServer(socket => {
        console.log('Connected')
        socket.on('end', () => console.log('Disconnected'))
        socket.on('data', data => {
            console.log('Data ' + JSON.stringify(decode(data)))
            responder(data,socket)
        })
    })

    server.on('error', err => console.log('Error ' + err))
    server.listen(8080, () => console.log('Server listening on port 8080'))
}


//startDateSync()

startSocket()