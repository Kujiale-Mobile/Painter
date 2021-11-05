String.prototype.substr = function (start, length) {
  if (start === undefined) {
    return this.toString()
  }
  if (typeof start !== 'number' || (typeof length !== 'number' && length !== undefined) ) {
    return ''
  }
  const strArr = [...this]
  const _length = strArr.length
  if (_length + start < 0) {
    start = 0
  }
  if (length === undefined || (start < 0 && start + length > 0)) {
    return strArr.slice(start).join('')
  } else {
    return strArr.slice(start, start + length).join('')
  }
}


String.prototype.substring = function (start, end) {
  if (start === undefined) {
    return this.toString()
  }
  if (typeof start !== 'number' || (typeof end !== 'number' && end !== undefined) ) {
    return ''
  }
  if (!(start > 0)) {
    start = 0
  }
  if (!(end > 0) && end !== undefined) {
    end = 0
  }
  const strArr = [...this]
  const _length = strArr.length
  if (start > _length) {
    start = _length
  }
  if (end > _length) {
    end = _length
  }
  if (end < start) {
    [start, end] = [end, start]
  }
  return strArr.slice(start, end).join('')
}