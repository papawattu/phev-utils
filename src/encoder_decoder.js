import { log } from './'

const allowedCommands = [0xf2, 0x2f, 0xf6, 0x6f, 0xf9, 0x9f];

const popMessage = (messages, callback) => {
    const message = extract(messages);
    callback(message);
    const idx = findCommand(messages);

    if (idx > -1) {
        if (messages.length - message.length) {
            const remaining = Buffer.alloc(messages.length - message.length);
            messages.copy(remaining, 0, message.length + idx);
            popMessage(remaining, callback);
        }
    } else {
        throw Error('Command not found in message');
    }
}

const findCommand = messages => {
    let idx = 0;
    let command = messages[0];
    while (allowedCommands.indexOf(command) < 0 && idx < messages.length) {
        idx++;
        command = messages[idx];
    }
    if (idx == messages.length) {
        return -1;
    }
    return idx;
}
const extract = messages => {
    const idx = findCommand(messages);
    let command = messages[0];

    if (idx > -1) {
        const length = messages[1 + idx] + 2 || 0;

        if (length > messages.length - idx) {
            throw Error('Message not complete ' + messages.toString('hex') + ' index ' + idx);
        }
        const chunk = Buffer.alloc(length);

        messages.copy(chunk, 0, idx, length + idx);
        return chunk;
    } else {
        throw Error('Message is full of rubbish ' + messages.toString('hex') + ' length ' + idx);
    }
}

const decode = message => {
    const command = message[0];
    const length = message[1];
    const type = message[2];
    const register = message[3];
    const data = message.slice(4, message.length - 1);
    const checksum = message[message.length - 1];

    return { command, length, type, register, data, checksum };
}
const encode = command => {
    if (command === null) return null;
    const message = Buffer.alloc(command.data.length + 5);
    message[0] = command.command;
    message[1] = command.data.length + 3;
    message[2] = command.type;
    message[3] = command.register;
    const d = Buffer.from(command.data);
    d.copy(message, 4);
    message[message.length - 1] = generateChecksum(message);
    return message;
}

const generateChecksum = data => data.reduce((y, x, i) => i < data.length -1 ? y + x & 0xff : y, 0)

const toMessageArray = (messages, current) => {
    const arr = current || []

    return messages.length > 0
        ? toMessageArray(Buffer.from(messages.slice(arr[arr.push(extract(messages)) - 1].length, messages.length)), arr)
        : arr || []
}

const validate = message => {
    if (findCommand(message) < 0) {
        log.error('Cannot find command in message :' + JSON.stringify(message))
        return false
    }
    if (message.length !== message[1] + 2) {
        log.error('Message length incorrect :' + JSON.stringify(message))
        return false
    }
    if (generateChecksum(Buffer.from(message, 0, message.length - 2)) !== message[message.length - 1]) {
        log.error('Checksum incorrect :' +JSON.stringify(message))
        return false
    }
    return true
}

const buildMsg =
    command =>
        type =>
            register =>
                length =>
                    data => ({
                        command: command,
                        type: type,
                        register: register,
                        length: length,
                        data: data
                    })

export { generateChecksum, encode, decode, extract, findCommand, popMessage, toMessageArray, validate, buildMsg }