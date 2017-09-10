import chai from 'chai'

import { log } from './logger'

const assert = chai.assert

describe('Log',() => {
    it('Should bootstrap',() => {
        assert.isNotNull(log)
    })
})
