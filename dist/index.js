'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var defaultSocketEvents = exports.defaultSocketEvents = [{
  action: 'NOOP',
  dispatch: function dispatch(socket, store, action) {
    console.debug('NOOP event called. Have you implemented your events?');
  }
}];
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.socketIOMiddleware = exports.defaultOpts = exports.mockSocket = exports.testClient = undefined;

var _client = require("./testHelpers/client");

Object.defineProperty(exports, "testClient", {
  enumerable: true,
  get: function get() {
    return _client.testClient;
  }
});

var _mockSocket = require("./testHelpers/mockSocket");

Object.defineProperty(exports, "mockSocket", {
  enumerable: true,
  get: function get() {
    return _mockSocket.mockSocket;
  }
});

var _socket = require("socket.io-client");

var _socket2 = _interopRequireDefault(_socket);

var _defaultEvents = require("./state/defaultEvents");

var _defaultEvents2 = require("./client/defaultEvents");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//if (process.env.NODE_ENV != 'production') {
//}

var defaultOpts = exports.defaultOpts = {
  transports: ['websocket']
};

var initializedSocket = [];

var socketIOMiddleware = exports.socketIOMiddleware = function socketIOMiddleware() {
  var initialSocket = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
  var dispatchEvents = arguments.length <= 1 || arguments[1] === undefined ? _defaultEvents2.defaultSocketEvents : arguments[1];
  var listenEvents = arguments.length <= 2 || arguments[2] === undefined ? _defaultEvents2.onSocketEvents : arguments[2];
  var stateEvents = arguments.length <= 3 || arguments[3] === undefined ? _defaultEvents.initialStateEvents : arguments[3];
  var connectAction = arguments.length <= 4 || arguments[4] === undefined ? 'CONNECT' : arguments[4];
  var options = arguments.length <= 5 || arguments[5] === undefined ? defaultOpts : arguments[5];


  var socket = initialSocket;
  var onEvent = listenEvents;
  initializedSocket[connectAction] = false;

  var serverEvent = function serverEvent(socket, store, next, action) {
    return function (event, data) {
      listenEvents.some(function (e) {
        if (e.action === event) {
          e.dispatch(event, data, store.dispatch);
          return true;
        }
        return false;
      });
    };
  };

  return function (store) {
    return function (next) {
      return function (action) {
        if (action.type === connectAction && !initializedSocket[connectAction]) {
          (function () {
            var nextAction = false;
            if (socket === null) {
              nextAction = true;
              var connStr = action.payload.host + ":" + action.payload.port;
              if (socket !== null) {
                socket.close();
              }

              socket = _socket2.default.connect(connStr, options);
            }

            var onevent = socket.onevent;
            socket.onevent = function (packet) {
              var args = packet.data || [];
              packet.data = ['*'].concat(args);
              onevent.call(socket, packet);
            };

            socket.on('*', serverEvent(socket, store, next, action));

            stateEvents.map(function (evt) {
              var eventAction = evt.dispatch;
              socket.on(evt.action.toString(), eventAction(store, next, action, socket));
            });
            initializedSocket[connectAction] = true;
          })();
        }

        if (socket != null) {
          dispatchEvents.map(function (event) {
            if (action.type === event.action) {
              return event.dispatch(socket, store, action);
            }
          });
        }

        return next(action);
      };
    };
  };
};

exports.default = socketIOMiddleware;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var onSocketEvents = exports.onSocketEvents = function onSocketEvents(socket, store, next, action) {
  return function (event, data) {
    console.error('Socket not listening for any events.');
  };
};
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var initialStateEvents = exports.initialStateEvents = [{
  action: 'connecting',
  dispatch: function dispatch(store, next, action) {
    return function (socket) {
      console.log('Socket is connecting.');
    };
  }
}, {
  action: 'connect',
  dispatch: function dispatch(store, next, action) {
    return function (socket) {
      console.log('Socket connected.');
    };
  }
}, {
  action: 'disconnect',
  dispatch: function dispatch(store, next, action) {
    return function (socket) {
      console.log('Socket disconnected.');
    };
  }
}, {
  action: 'reconnecting',
  dispatch: function dispatch(store, next, action) {
    return function (socket) {
      console.log('Socket reconnecting.');
    };
  }
}];
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_CONNECT_EVENT = undefined;

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

var _class = function () {
  function _class() {
    var clientEvents = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
    var serverEvents = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    var stateEvents = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
    var connectEvent = arguments.length <= 3 || arguments[3] === undefined ? DEFAULT_CONNECT_EVENT : arguments[3];

    _classCallCheck(this, _class);

    this.socket = new _mockSocket2.default(serverEvents);
    this.middleware = null;
    this.store = null;
    this.initializedMiddleware = false;
    this.clientEvents = clientEvents;
    this.serverEvents = serverEvents;
    this.stateEvents = stateEvents;
    this.connectEvent = connectEvent;
  }

  _createClass(_class, [{
    key: 'bindMiddleware',
    value: function bindMiddleware(middleware) {
      this.middleware = middleware(this.socket, this.clientEvents, this.serverEvents, this.stateEvents, this.connectEvent);
      return this;
    }
  }, {
    key: 'initializeMockStore',
    value: function initializeMockStore(initialState, combinedReducers) {
      this.store = (0, _redux.createStore)(combinedReducers, initialState, (0, _redux.applyMiddleware)(_reduxThunk2.default, this.middleware));
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
  }]);

  return _class;
}();

exports.default = _class;
;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(serverEvents) {
    _classCallCheck(this, _class);

    this.emit = _sinon2.default.spy();
    this.serverEvents = serverEvents;
  }

  _createClass(_class, [{
    key: 'on',
    value: function on(event, data, dispatch) {
      console.log(event, data, dispatch);
    }
  }]);

  return _class;
}();

exports.default = _class;
;
