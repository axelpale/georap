// A simple helper to map numbers from a source range to target range.

const Mapper = function (domainBegin, domainEnd, rangeBegin, rangeEnd) {
  this.d0 = domainBegin
  this.d1 = domainEnd
  this.dw = domainEnd - domainBegin
  this.r0 = rangeBegin
  this.r1 = rangeEnd
  this.rw = rangeEnd - rangeBegin
}

const proto = Mapper.prototype

proto.map = function (x) {
  // Map x in domain to y in range.

  // Normalise origin: x' = x - domain_begin
  // Normalise scale: n = x' / (domain_end - domain_begin)
  const n = (x - this.d0) / this.dw

  // Map scale: y' = n * (range_end - range_begin)
  // Map origin: y = y' + range_begin
  return n * this.rw + this.r0
}

module.exports = Mapper
