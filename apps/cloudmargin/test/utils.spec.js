const utils = require('../utils')

describe('Utils', function () {
  describe('.getAccrual()', function () {
    it('should calculate accrual', function () {
      expect(utils.getAccrual(10, 2)).toEqual(20)
      expect(utils.getAccrual(10.5, 2.000423)).toEqual(21)
    })
  })
})
