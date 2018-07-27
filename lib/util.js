
function isValidUrl(url) {
  return /(ht|f)tp(s?):\/\/([^ \\/]*\.)+[^ \\/]*(:[0-9]+)?\/?/.test(url);
}

module.exports = {
  isValidUrl,
};

