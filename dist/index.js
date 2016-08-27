'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.socketIOMiddleware = exports.onSocketEvents = exports.defaultSocketEvents = exports.initialStateEvents = exports.defaultOpts = undefined;

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultOpts = exports.defaultOpts = {
  transports: ['websocket']
};

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

var defaultSocketEvents = exports.defaultSocketEvents = [{
  action: 'NOOP',
  dispatch: function dispatch(socket, store, action) {
    console.debug('NOOP event called. Have you implemented your events?');
  }
}];

var onSocketEvents = exports.onSocketEvents = function onSocketEvents(socket, store, next, action) {
  return function (event, data) {
    console.error('Socket not listening for any events.');
  };
};

var initializedSocket = [];

var socketIOMiddleware = exports.socketIOMiddleware = function socketIOMiddleware() {
  var initialSocket = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
  var dispatchEvents = arguments.length <= 1 || arguments[1] === undefined ? defaultSocketEvents : arguments[1];
  var listenEvents = arguments.length <= 2 || arguments[2] === undefined ? onSocketEvents : arguments[2];
  var stateEvents = arguments.length <= 3 || arguments[3] === undefined ? initialStateEvents : arguments[3];
  var connectAction = arguments.length <= 4 || arguments[4] === undefined ? 'CONNECT' : arguments[4];
  var options = arguments.length <= 5 || arguments[5] === undefined ? defaultOpts : arguments[5];


  var socket = initialSocket;
  var onEvent = listenEvents;
  initializedSocket[connectAction] = false;

  return function (store) {
    return function (next) {
      return function (action) {
        if (action.type === connectAction && !initializedSocket[connectAction]) {
          (function () {
            var nextAction = false;
            if (socket === null) {
              nextAction = true;
              var connStr = action.payload.host + ':' + action.payload.port;
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

            socket.on('*', onEvent(socket, store, next, action));
            stateEvents.map(function (evt) {
              var eventAction = evt.dispatch;
              socket.on(evt.action.toString(), eventAction(store, next, action));
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