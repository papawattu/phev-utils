import chai from 'chai'
import sinon from 'sinon'

import Log from './logger'
process.env.DEBUG=true
import LogWithDebug from './logger'


const assert = chai.assert

const sut = Log()

describe('Log',() => {
    it('Should bootstrap',() => {
        assert.isNotNull(sut)
    })
    it('Should have info method',() => {
        assert.isFunction(sut.info)
    }) 
    it('Should have debug method',() => {
        assert.isFunction(sut.debug)
    })
    it('Should have error method',() => {
        assert.isNotNull(sut.error)
    })
    it('Should have warn(ing) method',() => {
        assert.isNotNull(sut.warn)
    })
    it('Should default to log level zero',() => {
        assert(sut.level === 0)
    })
    it('Should only show debug output when debug environment var is set',() => {
        
        const spy = sinon.spy(console,'log')

        sut.debug('Hello') 
        
        sut.setLevel(1)
        
        sut.debug('Hello again')        

        assert(spy.calledOnce, 'console.log should be called once')
        assert(spy.withArgs, 'Hello again')
    })
})
