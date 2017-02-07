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