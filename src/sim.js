import net from 'net'
import { decode, encode, toMessageArray, buildMsg, popMessage } from './encoder_decoder'
import { DEFAULT_LENGTH, START_SEND, REQUEST_TYPE, SEND_CMD, RESP_CMD, EMPTY_DATA, PING_SEND_CMD, RESPONSE_TYPE } from './message-constants'
import * as fs from 'fs' 

const sendRaw = (socket, message) => {
    console.log('> ' + message.toString('hex'))
    socket.write(message)
} 

const send = (socket, message) => sendRaw(socket,encode(message))

const swapNibble = byte => {
    if(byte == 0xf2) return 0x2f
    if(byte == 0xf6) return 0x6f
    if(byte == 0xf9) return 0x9f
    return 0
}
const responder = ((data, socket) => {
    popMessage(data,(message) => {
        const cmd = decode(message)
        const response = {
            command : swapNibble(cmd.command),
            length  : DEFAULT_LENGTH,
            type    : RESPONSE_TYPE,
            register : cmd.register,
            data    : EMPTY_DATA, 
        }

        send(socket,response)
    })
})
const startSocket = () => {
    const server = net.createServer(socket => {
        console.log('Connected')
        responder2(socket)
  
        socket.on('error', err => console.log('Error ' + err))
        socket.on('end', () => console.log('Disconnected'))
        socket.on('data', data => {
            console.log('< ' + data.toString('hex'))
            responder(data,socket)
        })
    })

    server.on('error', err => console.log('Error ' + err))
    server.listen(8080, () => console.log('Server listening on port 8080'))
}

const responder2 = socket => {
    let i = 0
    const data = fs.readFileSync('resources/data.txt')
    const str = data.toString()
    
    const arr = str.split('\n')

    const res = arr.filter(x => x.charAt(0) == ' ')
        .map(x => x.substring(14,62)
            .split(' ')
            .filter(y => y.length == 2)
            .reduce((buf,x,idx) => Buffer.concat([buf,Buffer.from(x,'hex')]),Buffer.from([])))
    
    setInterval(() => sendRaw(socket,res[(i < res.length ? i++:process.exit())]),200)
    
}

startSocket()