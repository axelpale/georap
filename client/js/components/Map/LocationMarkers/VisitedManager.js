// Module for the set of visited location ids

var V = function () {
  this._ids = [];
};

V.prototype.set = function (locIdArray) {
  // Assert
  if ('isArray' in Array && !Array.isArray(locIdArray)) {
    throw new Error('invalid array');
  }

  this._ids = locIdArray;
};

V.prototype.add = function (locId) {
  if (this._ids.indexOf(locId) === -1) {
    this._ids.push(locId);
  }
};

V.prototype.has = function (locId) {
  return this._ids.indexOf(locId) >= 0;
};

V.prototype.isVisited = function (locId) {
  return this.has(locId);
};

V.prototype.remove = function (locId) {
  // Return
  //   removed id, string
  //   null if not found
  var i = this._ids.indexOf(locId);
  if (i === -1) {
    return null;
  }
  return this._ids.splice(i, 1);
};

module.exports = V;
