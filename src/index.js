import getIOClient from './middleware/ioclient';
import { initialStateEvents } from './state/defaultEvents';
import { defaultSocketEvents } from './client/defaultEvents';
import { onSocketEvents } from './client/defaultEvents';
import serverEventHandler from './middleware/server';

export const DEFAULT_CONNECT_EVENT = 'CONNECT';
export const CLIENT_EVENT_KEY = 'client';
export const SERVER_EVENT_KEY = 'server';
export const STATE_EVENT_KEY = 'state';
export const SERVER_EVENT = '*';

export const DEFAULT_SOCKETIO_OPTIONS = {
  transports: ['websocket'],
};

export const SOCKET_INITIALIZED = {};
export const SOCKETS = {};
export const EVENTS = {};

export function isInitialized(id) {
  return exports.SOCKET_INITIALIZED[id] || false;
}

export function isConnectAction(action, connectAction, connected) {
  return action.type === connectAction && !connected;
};

export function getSocket(id) {
  return exports.SOCKETS[id] || null;
};

export function generateConnectString(payload) {
  let connStr = `${payload.host}:${payload.port}`;
  if (payload.namespace) {
    connStr += `/${payload.namespace}`;
  }
  return connStr;
};

export function onEventOverride(id) {
  const socket = exports.getSocket(id);
  const onevent = socket.onevent;

  socket.onevent = (packet) => {
    const args = packet.data || [];
    packet.data = [SERVER_EVENT].concat(args);
    onevent.call(socket, packet);
  };
};

export function registerStateEvents(id, events, redux) {
  const socket = exports.getSocket(id);
  events.map((evt) => {
    let eventAction = evt.dispatch;
    socket.on(evt.action.toString(), eventAction(
      socket,
      redux.store,
      redux.next,
      redux.action
    ));
  });
};

export function toggleInitStatus(id) {
  exports.SOCKET_INITIALIZED[id] = !exports.SOCKET_INITIALIZED[id];
}

export function registerServerEvents(id, events, dispatch) {
  const socket = exports.getSocket(id);

  exports.onEventOverride(id);
  socket.on(SERVER_EVENT, serverEventHandler(events, dispatch));
}

export function registerSocketEvents(id, client, server, state) {
  exports.EVENTS[id] = {};
  exports.EVENTS[id][CLIENT_EVENT_KEY] = client;
  exports.EVENTS[id][SERVER_EVENT_KEY] = server;
  exports.EVENTS[id][STATE_EVENT_KEY] = state;
}

export function getSocketEvents(id, key) {
  return exports.EVENTS[id][key];
}

export const socketio = (
  initializedSocket = null,
  clientEvents = defaultSocketEvents,
  serverEvents = onSocketEvents,
  stateEvents = initialStateEvents,
  connectAction = DEFAULT_CONNECT_EVENT,
  options = DEFAULT_SOCKETIO_OPTIONS
) => {

  exports.SOCKET_INITIALIZED[connectAction] = false;
  exports.SOCKETS[connectAction] = initializedSocket;
  exports.registerSocketEvents(connectAction, clientEvents, serverEvents, stateEvents);

  const IO = getIOClient();

  return store => next => action => {

    const IS_CONNECT_ACTION = exports.isConnectAction(action, connectAction, exports.SOCKET_INITIALIZED[connectAction]);

    if (IS_CONNECT_ACTION && exports.getSocket(connectAction) === null) {
      const CONN_STRING = exports.generateConnectString(action.payload);

      exports.SOCKETS[connectAction] = IO.connect(CONN_STRING, options);

      exports.registerServerEvents(connectAction,
        exports.getSocketEvents(connectAction, SERVER_EVENT_KEY),
        store.dispatch
      );

      exports.registerStateEvents(connectAction,
        exports.getSocketEvents(connectAction, STATE_EVENT_KEY),
        { store, next, action }
      );

      exports.toggleInitStatus(connectAction);
    }

    const socket = exports.getSocket(connectAction);
    if (socket != null) {
      if (action.type == SERVER_EVENT) {
        serverEventHandler(exports.getSocketEvents(connectAction, SERVER_EVENT_KEY),
          store.dispatch
        )(action.payload.type, action.payload.data);
      }

      exports.getSocketEvents(connectAction, CLIENT_EVENT_KEY).some((event) => {
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

export default socketio;