const { it, expect } = require('@jest/globals')
const sumCommonPrefixLength = require('.')

describe('sumCommonPrefixLength', () => {
    it('should return 10 for abcabcd', () => {
        expect(sumCommonPrefixLength('abcabcd')).toEqual(10)
    })
})