'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NOOP = exports.DEFAULT_CONNECT_EVENT = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _redux = require('redux');

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _reduxThunk = require('redux-thunk');

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

var _mockSocket = require('./mockSocket');

var _mockSocket2 = _interopRequireDefault(_mockSocket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_CONNECT_EVENT = exports.DEFAULT_CONNECT_EVENT = 'CONNECT';
var NOOP = exports.NOOP = function NOOP() {
  return null;
};

var _class = function () {
  function _class() {
    var clientEvents = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
    var serverEvents = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    var stateEvents = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
    var connectEvent = arguments.length <= 3 || arguments[3] === undefined ? DEFAULT_CONNECT_EVENT : arguments[3];

    _classCallCheck(this, _class);

    this.socket = new _mockSocket2.default(serverEvents, stateEvents);
    this.middleware = null;
    this.store = null;
    this.initializedMiddleware = false;
    this.clientEvents = clientEvents;
    this.serverEvents = serverEvents;
    this.stateEvents = stateEvents;
    this.connectEvent = connectEvent;
    this.cachedDispatch = null;
    this.initialState = {};
    this.reducers = null;
  }

  _createClass(_class, [{
    key: 'bindMiddleware',
    value: function bindMiddleware(middleware) {
      this.middleware = middleware(this.socket, this.clientEvents, this.serverEvents, this.stateEvents, this.connectEvent);
      return this;
    }
  }, {
    key: 'resetStore',
    value: function resetStore() {
      this.initializeMockStore(this.initialState, this.reducers);
    }
  }, {
    key: 'initializeMockStore',
    value: function initializeMockStore(initialState, combinedReducers) {
      this.store = (0, _redux.createStore)(combinedReducers, initialState, (0, _redux.applyMiddleware)(_reduxThunk2.default, this.middleware));
      this.initialState = initialState;
      this.cachedDispatch = this.store.dispatch;
      this.reducers = combinedReducers;
      return this;
    }
  }, {
    key: 'mockClientEvent',
    value: function mockClientEvent(event) {
      this.store.dispatch(event);
    }
  }, {
    key: 'mockServerEvent',
    value: function mockServerEvent(event, data) {
      var dispatch = arguments.length <= 2 || arguments[2] === undefined ? _sinon2.default.spy() : arguments[2];

      return this.socket.on(event, data, dispatch);
    }
  }, {
    key: 'mockStateEvent',
    value: function mockStateEvent(event, data) {
      var next = arguments.length <= 2 || arguments[2] === undefined ? NOOP : arguments[2];
      var action = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
      var dispatch = arguments.length <= 4 || arguments[4] === undefined ? _sinon2.default.spy() : arguments[4];

      this.store.dispatch = dispatch;
      return this.socket.stateEvent(event, data, next, action, this.store);
    }
  }]);

  return _class;
}();

exports.default = _class;
;