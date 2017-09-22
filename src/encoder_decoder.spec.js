import chai from 'chai';
import * as EncoderDecoder from './encoder_decoder';

const assert = chai.assert;

const singleMessage = Buffer.from([0x6f, 0x0a, 0x00, 0x12, 0x11, 0x05, 0x16, 0x15, 0x03, 0x0d, 0x01, 0xff]);
const doubleMessage = Buffer.from([0x6f, 0x0a, 0x00, 0x12, 0x11, 0x05, 0x16, 0x15, 0x03, 0x0d, 0x01, 0xff, 0x6f, 0x0a, 0x00, 0x12, 0x11, 0x05, 0x16, 0x15, 0x03, 0x0d, 0x01, 0xff]);
const remaining = Buffer.from([0x6f, 0x0a, 0x00, 0x12, 0x11, 0x05, 0x16, 0x15, 0x03, 0x0d, 0x01, 0xff]);
const incompleteMessage = Buffer.from([0x00,0x00,0x00,0x6f, 0x0a, 0x00, 0x12, 0x11, 0x05, 0x16, 0x15, 0x03, 0x0d, 0x01, 0xff]);
const gargbageMessage = Buffer.from([0x00,0x00,0x00,0x0d, 0x01, 0xff]);
const wrongLengthMessage = Buffer.from([0xf6,0xff,0x00,0x0d, 0x01, 0xff]);
const lengthPastEndMessage = Buffer.from([0x00,0xf6,0xff,0x00,0x0d, 0x01, 0xff]);

const empty = Buffer.from([]);
const commandObj = {
    command: 0x6f,
    length: 0x04,
    type: 0x00,
    register: 0x11,
    data: Buffer.from([0]),
};
describe('Decode', () => {
    it('Should decode single message', () => {
        EncoderDecoder.popMessage(singleMessage,(message) => {
            assert.deepEqual(message, singleMessage);
        });
    });
    it('Should decode double message', () => {
        EncoderDecoder.popMessage(doubleMessage,(message) => {
            assert.deepEqual(message, singleMessage);
        });

    });
    it('Should handle empty message', () => {
        assert.throws(()=>{EncoderDecoder.popMessage(empty,()=>{})});

    });
    //TODO:  Fix me the code is broken not this test
    it('Should handle incomplete message', () => {
        assert.throws(()=>{EncoderDecoder.popMessage(incompleteMessage,(message) => {})});
    });
    it('Should handle garbage message', () => {
        assert.throws(()=>{EncoderDecoder.popMessage(gargbageMessage,()=>{})});
    });
    it('Should handle wrong length message', () => {
        assert.throws(()=>{EncoderDecoder.popMessage(wrongLengthMessage,()=>{})});
    });
    it('Should handle length past end message', () => {
        assert.throws(()=>{EncoderDecoder.popMessage(lengthPastEndMessage,()=>{})});
    });
    it('Should throw error when command not found', () => {
        assert.throws(()=>{EncoderDecoder.popMessage(gargbageMessage,()=>{})});
    });
});
describe('Decode Message', () => {
    it('Should decode message', () => {
        const cmd = EncoderDecoder.decode(singleMessage)

        assert.equal(cmd.command, 0x6f);
        assert.equal(cmd.length, 0x0a);
        assert.equal(cmd.type, 0x00);
        assert.equal(cmd.register, 0x12);
        assert.equal(cmd.checksum, 0xff);
        assert.deepEqual(cmd.data, Buffer.from([0x11, 0x05, 0x16, 0x15, 0x03, 0x0d, 0x01]));

    });
});
describe('Encode Message', () => {
    it('Should encode message', () => {

        const cmd = EncoderDecoder.encode(commandObj);

        assert.equal(cmd[0], 0x6f);
        assert.equal(cmd[1], 0x04);
        assert.equal(cmd[2], 0x00);
        assert.equal(cmd[3], 0x11);
        assert.equal(cmd[4], 0x00);
        assert.equal(cmd[5], 0x84);
  
    });
});

describe('Checksum', () => {
    it('Should return checksum', () => {
        const checksum = EncoderDecoder.generateChecksum(singleMessage);

        assert.equal(checksum, 0xdd);
    });
});
describe('To message array', () => {
    it('Should return array of split messages', () => {
        const arr = EncoderDecoder.toMessageArray(doubleMessage)
        assert.isArray(arr)
        assert.equal(arr.length,2)
        assert.deepEqual(arr[0],singleMessage)
        assert.deepEqual(arr[1],singleMessage)
        
    });
    it('Should return array of split messages with one message', () => {
        const arr = EncoderDecoder.toMessageArray(singleMessage)
        assert.isArray(arr)
    });
});
describe('Find command', () => {
    it('Should find command', () => {
        const idx = EncoderDecoder.findCommand(singleMessage);
        assert.equal(idx, 0);
    });
    it('Should find command in garbage message', () => {
        const idx = EncoderDecoder.findCommand(incompleteMessage);
        assert.equal(idx, 3);
    });
    it('Should return -1 when command not found', () => {
        const idx = EncoderDecoder.findCommand(gargbageMessage);
        assert.equal(idx, -1);
    });
});