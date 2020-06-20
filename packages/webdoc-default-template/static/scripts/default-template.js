/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./scripts-src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./scripts-src/components/App/App.js":
/*!*******************************************!*\
  !*** ./scripts-src/components/App/App.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return App; });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _Explorer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Explorer */ \"./scripts-src/components/Explorer/index.js\");\n\n\nfunction App() {\n  return react__WEBPACK_IMPORTED_MODULE_0__[\"createElement\"](\"div\", {\n    \"class\": \"app-container\"\n  }, react__WEBPACK_IMPORTED_MODULE_0__[\"createElement\"](\"header\", {\n    \"class\": \"app-header\"\n  }), react__WEBPACK_IMPORTED_MODULE_0__[\"createElement\"](\"div\", {\n    \"class\": \"app-layout\"\n  }, react__WEBPACK_IMPORTED_MODULE_0__[\"createElement\"](_Explorer__WEBPACK_IMPORTED_MODULE_1__[\"default\"], null), react__WEBPACK_IMPORTED_MODULE_0__[\"createElement\"](\"div\", {\n    \"class\": \"content\"\n  }, react__WEBPACK_IMPORTED_MODULE_0__[\"createElement\"](\"h1\", null, \"@webdoc/default-template is in development! The example documentation is down as we are transitioning to this new template.\"))));\n}\n\n//# sourceURL=webpack:///./scripts-src/components/App/App.js?");

/***/ }),

/***/ "./scripts-src/components/App/index.js":
/*!*********************************************!*\
  !*** ./scripts-src/components/App/index.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./App */ \"./scripts-src/components/App/App.js\");\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (_App__WEBPACK_IMPORTED_MODULE_0__[\"default\"]);\n\n//# sourceURL=webpack:///./scripts-src/components/App/index.js?");

/***/ }),

/***/ "./scripts-src/components/Explorer/ExplorerTarget.js":
/*!***********************************************************!*\
  !*** ./scripts-src/components/Explorer/ExplorerTarget.js ***!
  \***********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return ExplorerTarget; });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _ExplorerTargetGroup__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ExplorerTargetGroup */ \"./scripts-src/components/Explorer/ExplorerTargetGroup.js\");\nfunction _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\"); }\n\nfunction _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === \"string\") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === \"Object\" && o.constructor) n = o.constructor.name; if (n === \"Map\" || n === \"Set\") return Array.from(o); if (n === \"Arguments\" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }\n\nfunction _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }\n\nfunction _iterableToArrayLimit(arr, i) { if (typeof Symbol === \"undefined\" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\n\n\nfunction ExplorerTarget(props) {\n  var _React$useState = react__WEBPACK_IMPORTED_MODULE_0__[\"useState\"](true),\n      _React$useState2 = _slicedToArray(_React$useState, 2),\n      expanded = _React$useState2[0],\n      setExpanded = _React$useState2[1];\n\n  var keys = props.data.children ? Object.keys(props.data.children) : [];\n  var hasChildren = keys.length > 0;\n  var targetChildren = [];\n\n  for (var _i2 = 0, _Object$entries = Object.entries(props.data.children || {}); _i2 < _Object$entries.length; _i2++) {\n    var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),\n        key = _Object$entries$_i[0],\n        value = _Object$entries$_i[1];\n\n    if (Array.isArray(value)) {\n      targetChildren.push(react__WEBPACK_IMPORTED_MODULE_0__[\"createElement\"](_ExplorerTargetGroup__WEBPACK_IMPORTED_MODULE_1__[\"default\"], {\n        title: key,\n        data: value\n      }));\n    } else {\n      targetChildren.push(react__WEBPACK_IMPORTED_MODULE_0__[\"createElement\"](ExplorerTarget, {\n        data: value\n      }));\n    }\n  }\n\n  return react__WEBPACK_IMPORTED_MODULE_0__[\"createElement\"](\"div\", {\n    className: \"explorer-target\"\n  }, hasChildren ? react__WEBPACK_IMPORTED_MODULE_0__[\"createElement\"](ExpandIcon, null) : [], react__WEBPACK_IMPORTED_MODULE_0__[\"createElement\"](\"a\", {\n    className: \"explorer-link\",\n    href: props.data.page\n  }, props.data.title || \"NoTile\"), react__WEBPACK_IMPORTED_MODULE_0__[\"createElement\"](\"section\", {\n    className: \"explorer-children\",\n    style: {\n      visible: expanded\n    }\n  }, targetChildren));\n}\n\nfunction ExpandIcon() {\n  return react__WEBPACK_IMPORTED_MODULE_0__[\"createElement\"](\"img\", {\n    className: \"explorer-toggle\",\n    src: \"https://cdn.jsdelivr.net/npm/octicons@8.5.0/build/svg/triangle-down.svg\",\n    width: \"12px\",\n    height: \"12px\"\n  });\n}\n\n//# sourceURL=webpack:///./scripts-src/components/Explorer/ExplorerTarget.js?");

/***/ }),

/***/ "./scripts-src/components/Explorer/ExplorerTargetGroup.js":
/*!****************************************************************!*\
  !*** ./scripts-src/components/Explorer/ExplorerTargetGroup.js ***!
  \****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return ExplorerTargetGroup; });\n/* harmony import */ var _ExplorerTarget__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ExplorerTarget */ \"./scripts-src/components/Explorer/ExplorerTarget.js\");\n\nfunction ExplorerTargetGroup(props) {\n  return React.createElement(\"section\", {\n    className: \"explorer-group\"\n  }, React.createElement(ExpandIconG, null), React.createElement(\"span\", {\n    className: \"explorer-group-header\"\n  }, props.title), React.createElement(\"section\", {\n    className: \"explorer-children\"\n  }, props.data.map(function (explorerTarget) {\n    return React.createElement(_ExplorerTarget__WEBPACK_IMPORTED_MODULE_0__[\"default\"], {\n      data: explorerTarget\n    });\n  })));\n}\n\nfunction ExpandIconG() {\n  return React.createElement(\"img\", {\n    className: \"explorer-toggle\",\n    src: \"https://cdn.jsdelivr.net/npm/octicons@8.5.0/build/svg/triangle-down.svg\",\n    width: \"12px\",\n    height: \"12px\"\n  });\n}\n\n//# sourceURL=webpack:///./scripts-src/components/Explorer/ExplorerTargetGroup.js?");

/***/ }),

/***/ "./scripts-src/components/Explorer/index.js":
/*!**************************************************!*\
  !*** ./scripts-src/components/Explorer/index.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Explorer; });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _ExplorerTarget__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ExplorerTarget */ \"./scripts-src/components/Explorer/ExplorerTarget.js\");\n/* harmony import */ var _ExplorerTargetGroup__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ExplorerTargetGroup */ \"./scripts-src/components/Explorer/ExplorerTargetGroup.js\");\nfunction _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\"); }\n\nfunction _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === \"string\") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === \"Object\" && o.constructor) n = o.constructor.name; if (n === \"Map\" || n === \"Set\") return Array.from(o); if (n === \"Arguments\" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }\n\nfunction _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }\n\nfunction _iterableToArrayLimit(arr, i) { if (typeof Symbol === \"undefined\" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\n\n\n\nvar fetched = false;\nfunction Explorer(props) {\n  var _React$useState = react__WEBPACK_IMPORTED_MODULE_0__[\"useState\"](null),\n      _React$useState2 = _slicedToArray(_React$useState, 2),\n      data = _React$useState2[0],\n      setData = _React$useState2[1];\n\n  var children = [];\n\n  if (!fetched) {\n    fetch(\"explorer/reference.json\").then(function (response) {\n      if (response.ok) {\n        response.json().then(function (idata) {\n          console.log(idata);\n          setData(idata || {});\n        });\n      } else {\n        console.error(\"Explorer couldn't load data\");\n      }\n    });\n    fetched = true;\n  }\n\n  if (data) {\n    for (var _i2 = 0, _Object$entries = Object.entries(data.children); _i2 < _Object$entries.length; _i2++) {\n      var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),\n          key = _Object$entries$_i[0],\n          value = _Object$entries$_i[1];\n\n      if (Array.isArray(value)) {\n        children.push(react__WEBPACK_IMPORTED_MODULE_0__[\"createElement\"](_ExplorerTargetGroup__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n          title: key,\n          data: value\n        }));\n      } else {\n        children.push(react__WEBPACK_IMPORTED_MODULE_0__[\"createElement\"](_ExplorerTarget__WEBPACK_IMPORTED_MODULE_1__[\"default\"], {\n          data: value\n        }));\n      }\n    }\n  } else {\n    children.push(react__WEBPACK_IMPORTED_MODULE_0__[\"createElement\"](\"span\", null, \"Loading\"));\n  }\n\n  return react__WEBPACK_IMPORTED_MODULE_0__[\"createElement\"](\"nav\", {\n    className: \"explorer\"\n  }, react__WEBPACK_IMPORTED_MODULE_0__[\"createElement\"](\"section\", {\n    className: \"explorer-children\",\n    style: {\n      paddingLeft: 0\n    }\n  }, children));\n}\n\n//# sourceURL=webpack:///./scripts-src/components/Explorer/index.js?");

/***/ }),

/***/ "./scripts-src/index.js":
/*!******************************!*\
  !*** ./scripts-src/index.js ***!
  \******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ \"react-dom\");\n/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _components_App__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/App */ \"./scripts-src/components/App/index.js\");\n\n\n\n\nwindow.onload = function () {\n  var templateRoot = document.getElementById(\"template-app\");\n  react_dom__WEBPACK_IMPORTED_MODULE_1___default.a.render(react__WEBPACK_IMPORTED_MODULE_0__[\"createElement\"](_components_App__WEBPACK_IMPORTED_MODULE_2__[\"default\"], null), templateRoot);\n};\n\n//# sourceURL=webpack:///./scripts-src/index.js?");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = React;\n\n//# sourceURL=webpack:///external_%22React%22?");

/***/ }),

/***/ "react-dom":
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = ReactDOM;\n\n//# sourceURL=webpack:///external_%22ReactDOM%22?");

/***/ })

/******/ });