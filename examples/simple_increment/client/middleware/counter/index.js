//import * as socketMiddleware from 'socket.io-middleware';
import * as socketMiddleware from '../../../../../dist';
import stateEvents from './state/';
import clientEvents from './client/';
import serverEvents from './server/';

export const stateActions = stateEvents;
export const clientActions = clientEvents;
export const serverActions = serverEvents;

export const middleware = socketMiddleware;
export const id = 'INCREMENT_CONNECT';

const initialSocket = null;

export default socketMiddleware.socketio(
  initialSocket,
  clientActions,
  serverActions,
  stateActions,
  id
);