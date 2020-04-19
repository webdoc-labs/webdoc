"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Tag = require("./Tag");

Object.keys(_Tag).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Tag[key];
    }
  });
});