import socketMiddleware from 'socket.io-middleware';
import stateEvents from './state/';
import clientEvents from './client/';
import serverEvents from './server/';

export const stateActions = stateEvents;
export const clientActions = clientEvents;
export const serverActions = serverEvents;

export const middleware = socketMiddleware;

const initialSocket = null;

export default socketMiddleware(
  initialSocket,
  clientActions,
  serverActions,
  stateActions,
  'INCREMENT_CONNECT',
);