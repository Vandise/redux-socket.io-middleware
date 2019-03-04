'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EVENTS = exports.SOCKETS = exports.SOCKET_INITIALIZED = exports.DEFAULT_SOCKETIO_OPTIONS = exports.SERVER_EVENT = exports.STATE_EVENT_KEY = exports.SERVER_EVENT_KEY = exports.CLIENT_EVENT_KEY = exports.DEFAULT_SOCKET_ID = undefined;
exports.isInitialized = isInitialized;
exports.isConnectAction = isConnectAction;
exports.getSocket = getSocket;
exports.generateConnectString = generateConnectString;
exports.onEventOverride = onEventOverride;
exports.registerStateEvents = registerStateEvents;
exports.toggleInitStatus = toggleInitStatus;
exports.getInitStatus = getInitStatus;
exports.registerServerEvents = registerServerEvents;
exports.registerSocketEvents = registerSocketEvents;
exports.getSocketEvents = getSocketEvents;
exports.socketio = socketio;

var _ioclient = require('./middleware/ioclient');

var _ioclient2 = _interopRequireDefault(_ioclient);

var _defaultEvents = require('./state/defaultEvents');

var _defaultEvents2 = require('./client/defaultEvents');

var _server = require('./middleware/server');

var _server2 = _interopRequireDefault(_server);

var _client = require('./middleware/client');

var _client2 = _interopRequireDefault(_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
  * The default socket ID when initializing the middleware and no ID is passed
  * @constant
  * @default 'DEFAULT'
  * @type {string}
  * @since v1.0.0
  */
/**
  * Socketio Redux Middleware.
  * @module socketio-middleware
  */

var DEFAULT_SOCKET_ID = exports.DEFAULT_SOCKET_ID = 'DEFAULT';

/**
  * The key prefix for "client" events
  * @constant
  * @default 'client'
  * @type {string}
  * @since v1.0.0
  */
var CLIENT_EVENT_KEY = exports.CLIENT_EVENT_KEY = 'client';

/**
  * The key prefix for "server" events
  * @constant
  * @default 'server'
  * @type {string}
  * @since v1.0.0
  */
var SERVER_EVENT_KEY = exports.SERVER_EVENT_KEY = 'server';

/**
  * The key prefix for "state" events
  * @constant
  * @default 'state'
  * @type {string}
  * @since v1.0.0
  */
var STATE_EVENT_KEY = exports.STATE_EVENT_KEY = 'state';

/**
  * The event for socket.io "on" events
  * @constant
  * @default '*'
  * @type {string}
  * @since v1.0.0
  * @example
  * socket.on('*', function(){  });
  */
var SERVER_EVENT = exports.SERVER_EVENT = '*';

/**
  * The default options to configure socket.io. See socket.io documentation on configuration options.
  * @constant
  * @default '{ transports: ['websocket'] }'
  * @type {object}
  * @since v1.0.0
  * @example
  * import * as socketMiddleware from 'socket.io-middleware'
  * const options = { namespace: '/chat' };
  * export default socketMiddleware.socketio(null, [], [], [], 'CHAT', options);
  */
var DEFAULT_SOCKETIO_OPTIONS = exports.DEFAULT_SOCKETIO_OPTIONS = {
  transports: ['websocket']
};

/**
  * Key-value pair of socket ID's and their initialization state
  * @constant
  * @default '{}'
  * @type {object}
  * @since v1.0.0
  */
var SOCKET_INITIALIZED = exports.SOCKET_INITIALIZED = {};

/**
  * Key-value pair of socket ID's and the websocket
  * @constant
  * @default '{}'
  * @type {object}
  * @since v1.0.0
  */
var SOCKETS = exports.SOCKETS = {};

/**
  * Key-value pair of socket ID's and the redux actions with their associated function handlers
  * @constant
  * @default '{}'
  * @type {object}
  * @since v1.0.0
  */
var EVENTS = exports.EVENTS = {};

/**
  * Check the status of the socket
  * @param {string} id - the socket ID
  * @since v1.0.0
  * @return {boolean} The initialization status
  */
function isInitialized(id) {
  return exports.SOCKET_INITIALIZED[id] || false;
}

/**
  * Check if the redux action type is the ID_CONNECT action and if the socket is connected
  * @param {object} action - the redux action
  * @param {string} id - the socket ID
  * @param {boolean} connected - the socket connected status
  * @since v1.0.0
  * @return {boolean} If it's a connect event and the socket is not connected
  */
function isConnectAction(action, id, connected) {
  return action.type === id + '_CONNECT' && !connected;
};

/**
  * Returns the socket.io instance
  * @param {string} id - the socket ID
  * @since v1.0.0
  * @return {socket|null} the socket.io instance 
  */
function getSocket(id) {
  return exports.SOCKETS[id] || null;
};

/**
  * Generates the socket.io connect string, appends namespace if available in the options
  * @param {object} payload - the options passed from the redux ID_CONNECT action 
  * @since v1.0.0
  * @return {string} The connection string
  * @example
  * http://localhost:3000/chat
  */
function generateConnectString(payload) {
  var connStr = payload.host + ':' + payload.port;
  if (payload.namespace) {
    connStr += '/' + payload.namespace;
  }
  return connStr;
};

/**
  * Overrides socket.io's socket.onevent for server events ( SERVER_EVENT ) with the associated socket ID
  * @param {string} id - the socket ID
  * @since v1.0.0
  */
function onEventOverride(id) {
  var socket = exports.getSocket(id);
  var onevent = socket.onevent;

  socket.onevent = function (packet) {
    var args = packet.data || [];
    packet.data = [SERVER_EVENT].concat(args);
    onevent.call(socket, packet);
  };
};

/**
  * Attaches redux action types to socket.on events with the associated dispatch function handler.
  * @param {string} id - the socket ID
  * @param {array} events - an array of state events { action, dispatch }
  * @param {object} redux - the redux middleware handlers { store, next, action }
  * @since v1.0.0
  */
function registerStateEvents(id, events, redux) {
  var socket = exports.getSocket(id);
  events.map(function (evt) {
    var eventAction = evt.dispatch;
    socket.on(evt.action.toString(), eventAction(socket, redux.store, redux.next, redux.action));
  });
};

/**
  * Toggles the socket initialization ( connection ) status
  * @param {string} id - the socket ID
  * @since v1.0.0
  */
function toggleInitStatus(id) {
  exports.SOCKET_INITIALIZED[id] = !exports.SOCKET_INITIALIZED[id];
}

/**
  * Gets the socket initialization ( connection ) status
  * @param {string} id - the socket ID
  * @since v1.0.0
  * @return {boolean} If the socket is initialized
  */
function getInitStatus(id) {
  return exports.SOCKET_INITIALIZED[id];
}

/**
  * Attaches redux action types to socket.on server ( default: * ) events. A function, serverEventHandler, wraps all the server events
  * @param {string} id - the socket ID
  * @param {array} events - an array of state events { action, dispatch }
  * @param {function} dispatch - the redux middleware dispatch function
  * @since v1.0.0
  */
function registerServerEvents(id, events, dispatch) {
  var socket = exports.getSocket(id);

  exports.onEventOverride(id);
  socket.on(SERVER_EVENT, (0, _server2.default)(events, dispatch));
}

/**
  * Sets all socket events to the associated socket ID
  * @param {string} id - the socket ID
  * @param {array} client - array of client events
  * @param {array} server - array of server events
  * @param {array} state - array of state events
  * @since v1.0.0
  */
function registerSocketEvents(id, client, server, state) {
  exports.EVENTS[id] = {};
  exports.EVENTS[id][CLIENT_EVENT_KEY] = client;
  exports.EVENTS[id][SERVER_EVENT_KEY] = server;
  exports.EVENTS[id][STATE_EVENT_KEY] = state;
}

/**
  * Gets a list of socket events with the associated socket ID and event key
  * @param {string} id - the socket ID
  * @param {string} key - the event key
  * @since v1.0.0
  * @return {array} The events array
  */
function getSocketEvents(id, key) {
  return exports.EVENTS[id][key];
}

/**
  * Initializes the middleware, binds sockets and events to the module state
  * @param {socket} initializedSocket - an initialized socket.io instance
  * @param {array} clientEvents - array of client events
  * @param {array} serverEvents - array of server events
  * @param {array} stateEvents - array of state events
  * @param {string} id - the socket ID to bind all the events to
  * @param {object} options - socket.io configuration options
  * @since v1.0.0
  * @return {function} The next redux action
  */
function socketio() {
  var initializedSocket = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var clientEvents = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _defaultEvents2.defaultSocketEvents;
  var serverEvents = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _defaultEvents2.onSocketEvents;
  var stateEvents = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : _defaultEvents.initialStateEvents;
  var id = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : DEFAULT_SOCKET_ID;
  var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : DEFAULT_SOCKETIO_OPTIONS;


  //
  // Keep track of the socket state and functions used
  //
  exports.SOCKET_INITIALIZED[id] = false;
  exports.SOCKETS[id] = initializedSocket;
  exports.registerSocketEvents(id, clientEvents, serverEvents, stateEvents);

  var IO = (0, _ioclient2.default)();

  return function (store) {
    return function (next) {
      return function (action) {
        var IS_CONNECT_ACTION = exports.isConnectAction(action, id, exports.SOCKET_INITIALIZED[id]);

        // got socketID_CONNECT event
        if (IS_CONNECT_ACTION) {

          //
          // If no socket has been initialized
          //
          if (exports.getSocket(id) === null) {
            var CONN_STRING = exports.generateConnectString(action.payload);

            exports.SOCKETS[id] = IO.connect(CONN_STRING, options);

            exports.registerServerEvents(id, exports.getSocketEvents(id, SERVER_EVENT_KEY), store.dispatch);

            exports.registerStateEvents(id, exports.getSocketEvents(id, STATE_EVENT_KEY), { store: store, next: next, action: action });

            //
            // Socket has been initialized, but is disconnected
            //
          } else {
            var _socket = exports.getSocket(id);
            _socket.connect();
          }

          //
          // Toggle status from disconnected, to connected ( false -> true )
          //
          exports.toggleInitStatus(id);
        }

        var socket = exports.getSocket(id);

        if (socket != null && exports.getInitStatus(id) === true) {
          switch (action.type) {

            //
            // Server Events
            //
            case id + '_' + SERVER_EVENT:
              (0, _server2.default)(exports.getSocketEvents(id, SERVER_EVENT_KEY), store.dispatch)(action.payload.type, action.payload.data);
              break;

            //
            // State Events
            //
            case id + '_' + STATE_EVENT_KEY:
              exports.getSocketEvents(id, STATE_EVENT_KEY).some(function (evt) {
                if (evt.action.toString() === action.payload.type) {
                  evt.dispatch(socket, store, next, action)();
                  return true;
                }
                return false;
              });
              break;

            //
            // socketID_DISCONNECT ( disconnect event )
            //
            case id + '_DISCONNECT':
              socket.disconnect();
              exports.toggleInitStatus(id);
              break;

            //
            // Client Events
            //
            default:
              exports.getSocketEvents(id, CLIENT_EVENT_KEY).some(function (event) {
                if (action.type === event.action) {
                  (0, _client2.default)(event, socket, store, action);
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