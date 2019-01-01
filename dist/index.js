'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.socketio = exports.SOCKETS = exports.SOCKET_INITIALIZED = exports.DEFAULT_SOCKETIO_OPTIONS = exports.DEFAULT_CONNECT_EVENT = undefined;
exports.isInitialized = isInitialized;
exports.isConnectAction = isConnectAction;
exports.getSocket = getSocket;
exports.generateConnectString = generateConnectString;
exports.onEventOverride = onEventOverride;
exports.registerStateEvents = registerStateEvents;
exports.toggleInitStatus = toggleInitStatus;

var _ioclient = require('./middleware/ioclient');

var _ioclient2 = _interopRequireDefault(_ioclient);

var _defaultEvents = require('./state/defaultEvents');

var _defaultEvents2 = require('./client/defaultEvents');

var _server = require('./middleware/server');

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_CONNECT_EVENT = exports.DEFAULT_CONNECT_EVENT = 'CONNECT';

var DEFAULT_SOCKETIO_OPTIONS = exports.DEFAULT_SOCKETIO_OPTIONS = {
  transports: ['websocket']
};

var SOCKET_INITIALIZED = exports.SOCKET_INITIALIZED = {};
var SOCKETS = exports.SOCKETS = {};

function isInitialized(id) {
  return exports.SOCKET_INITIALIZED[id] || false;
}

function isConnectAction(action, connectAction, connected) {
  return action.type === connectAction && !connected;
};

function getSocket(id) {
  return exports.SOCKETS[id] || null;
};

function generateConnectString(payload) {
  var connStr = payload.host + ':' + payload.port;
  if (payload.namespace) {
    connStr += '/' + payload.namespace;
  }
  return connStr;
};

function onEventOverride(id) {
  var socket = exports.getSocket(id);
  var onevent = socket.onevent;

  socket.onevent = function (packet) {
    var args = packet.data || [];
    packet.data = ['*'].concat(args);
    onevent.call(socket, packet);
  };
};

function registerStateEvents(id, events, redux) {
  var socket = exports.getSocket(id);
  events.map(function (evt) {
    var eventAction = evt.dispatch;
    socket.on(evt.action.toString(), eventAction(socket, redux.store, redux.next, redux.action));
  });
};

function toggleInitStatus(id) {
  exports.SOCKET_INITIALIZED[id] = !exports.SOCKET_INITIALIZED[id];
}

var socketio = exports.socketio = function socketio() {
  var initializedSocket = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var clientEvents = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _defaultEvents2.defaultSocketEvents;
  var serverEvents = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _defaultEvents2.onSocketEvents;
  var stateEvents = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : _defaultEvents.initialStateEvents;
  var connectAction = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : DEFAULT_CONNECT_EVENT;
  var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : DEFAULT_SOCKETIO_OPTIONS;


  exports.SOCKET_INITIALIZED[connectAction] = false;
  exports.SOCKETS[connectAction] = initializedSocket;

  var IO = (0, _ioclient2.default)();
  var socket = null;

  return function (store) {
    return function (next) {
      return function (action) {

        var IS_CONNECT_ACTION = exports.isConnectAction(action, connectAction, exports.SOCKET_INITIALIZED[connectAction]);

        if (IS_CONNECT_ACTION && exports.getSocket(connectAction) === null) {
          var CONN_STRING = exports.generateConnectString(action.payload);

          exports.SOCKETS[connectAction] = IO.connect(CONN_STRING, options);
          socket = exports.getSocket(connectAction);

          exports.onEventOverride(connectAction);
          socket.on('*', (0, _server2.default)(serverEvents, store.dispatch));
          exports.registerStateEvents(connectAction, stateEvents, { store: store, next: next, action: action });

          exports.toggleInitStatus(connectAction);
        }

        if (socket != null) {
          clientEvents.some(function (event) {
            if (action.type === event.action) {
              event.dispatch(socket, store, action);
              return true;
            }
            return false;
          });
        }

        return next(action);
      };
    };
  };
};

exports.default = socketio;