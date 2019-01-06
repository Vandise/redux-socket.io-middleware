'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.socketio = exports.EVENTS = exports.SOCKETS = exports.SOCKET_INITIALIZED = exports.DEFAULT_SOCKETIO_OPTIONS = exports.SERVER_EVENT = exports.STATE_EVENT_KEY = exports.SERVER_EVENT_KEY = exports.CLIENT_EVENT_KEY = exports.DEFAULT_CONNECT_EVENT = undefined;
exports.isInitialized = isInitialized;
exports.isConnectAction = isConnectAction;
exports.getSocket = getSocket;
exports.generateConnectString = generateConnectString;
exports.onEventOverride = onEventOverride;
exports.registerStateEvents = registerStateEvents;
exports.toggleInitStatus = toggleInitStatus;
exports.registerServerEvents = registerServerEvents;
exports.registerSocketEvents = registerSocketEvents;
exports.getSocketEvents = getSocketEvents;

var _ioclient = require('./middleware/ioclient');

var _ioclient2 = _interopRequireDefault(_ioclient);

var _defaultEvents = require('./state/defaultEvents');

var _defaultEvents2 = require('./client/defaultEvents');

var _server = require('./middleware/server');

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_CONNECT_EVENT = exports.DEFAULT_CONNECT_EVENT = 'CONNECT';
var CLIENT_EVENT_KEY = exports.CLIENT_EVENT_KEY = 'client';
var SERVER_EVENT_KEY = exports.SERVER_EVENT_KEY = 'server';
var STATE_EVENT_KEY = exports.STATE_EVENT_KEY = 'state';
var SERVER_EVENT = exports.SERVER_EVENT = '*';

var DEFAULT_SOCKETIO_OPTIONS = exports.DEFAULT_SOCKETIO_OPTIONS = {
  transports: ['websocket']
};

var SOCKET_INITIALIZED = exports.SOCKET_INITIALIZED = {};
var SOCKETS = exports.SOCKETS = {};
var EVENTS = exports.EVENTS = {};

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
    packet.data = [SERVER_EVENT].concat(args);
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

function registerServerEvents(id, events, dispatch) {
  var socket = exports.getSocket(id);

  exports.onEventOverride(id);
  socket.on(SERVER_EVENT, (0, _server2.default)(events, dispatch));
}

function registerSocketEvents(id, client, server, state) {
  exports.EVENTS[id] = {};
  exports.EVENTS[id][CLIENT_EVENT_KEY] = client;
  exports.EVENTS[id][SERVER_EVENT_KEY] = server;
  exports.EVENTS[id][STATE_EVENT_KEY] = state;
}

function getSocketEvents(id, key) {
  return exports.EVENTS[id][key];
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
  exports.registerSocketEvents(connectAction, clientEvents, serverEvents, stateEvents);

  var IO = (0, _ioclient2.default)();

  return function (store) {
    return function (next) {
      return function (action) {
        var IS_CONNECT_ACTION = exports.isConnectAction(action, connectAction, exports.SOCKET_INITIALIZED[connectAction]);

        if (IS_CONNECT_ACTION && exports.getSocket(connectAction) === null) {
          var CONN_STRING = exports.generateConnectString(action.payload);

          exports.SOCKETS[connectAction] = IO.connect(CONN_STRING, options);

          exports.registerServerEvents(connectAction, exports.getSocketEvents(connectAction, SERVER_EVENT_KEY), store.dispatch);

          exports.registerStateEvents(connectAction, exports.getSocketEvents(connectAction, STATE_EVENT_KEY), { store: store, next: next, action: action });

          exports.toggleInitStatus(connectAction);
        }

        var socket = exports.getSocket(connectAction);
        if (socket != null) {
          switch (action.type) {
            case connectAction + '_' + SERVER_EVENT:
              (0, _server2.default)(exports.getSocketEvents(connectAction, SERVER_EVENT_KEY), store.dispatch)(action.payload.type, action.payload.data);
              break;

            case connectAction + '_' + STATE_EVENT_KEY:
              exports.getSocketEvents(connectAction, STATE_EVENT_KEY).some(function (evt) {
                if (evt.action.toString() === action.payload.type) {
                  evt.dispatch(socket, store, next, action)();
                  return true;
                }
                return false;
              });
              break;

            default:
              exports.getSocketEvents(connectAction, CLIENT_EVENT_KEY).some(function (event) {
                if (action.type === event.action) {
                  event.dispatch(socket, store, action);
                  return true;
                }
                return false;
              });
          }
        }

        return next(action);
      };
    };
  };
};

exports.default = socketio;