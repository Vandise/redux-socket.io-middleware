import io from 'socket.io-client';
import { initialStateEvents } from "./state/defaultEvents";
import { defaultSocketEvents } from "./client/defaultEvents";
import { onSocketEvents } from "./client/defaultEvents";
import serverEventHandler from "./middleware/server";

export const DEFAULT_SOCKETIO_OPTIONS = {
  transports: ['websocket'],
};

export const SOCKET_INITIALIZED = {};
export const SOCKETS = {};

export function isConnectAction(action, connectAction, connected) {
  return action.type === connectAction && !connected;
};

export function getSocket(id) {
  return exports.SOCKETS[id] || null;
}

export function generateConnectString(payload) {
  let connStr = `${payload.host}:${payload.port}`;
  if (payload.namespace) {
    connStr += `/${payload.namespace}`;
  }
  return connStr;
}

export const socketIOMiddleware = (
  initializedSocket = null,
  clientEvents = defaultSocketEvents,
  serverEvents = onSocketEvents,
  stateEvents = initialStateEvents,
  connectAction = 'CONNECT',
  options = DEFAULT_SOCKETIO_OPTIONS
) => {

  exports.SOCKET_INITIALIZED[connectAction] = false;
  exports.SOCKETS[connectAction] = initializedSocket;

  return store => next => action => {

    const IS_CONNECT_ACTION = exports.isConnectAction(action, connectAction, initializedSocket[connectAction]);

    if (IS_CONNECT_ACTION && exports.getSocket(connectAction) === null) {
      const CONN_STRING = exports.generateConnectString(action.payload);
      exports.SOCKETS[connectAction] = io.connect(CONN_STRING, options);
    }

    
  };
};

export default socketIOMiddleware;