// @flow

if (!Object.fromEntries) {
  require("object.fromentries").shim();
}

if (!Array.prototype.flatMap) {
  require("array.prototype.flatmap").shim();
}
