exports.getAccrual = function getAccrual (balance, rate) {
  return Math.floor(balance * rate)
}

exports.getTimeFromString = function getTimeFromString (str) {
  return new Date(str).getTime()
}
