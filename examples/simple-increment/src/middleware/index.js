import socketMiddleware from '../../../../dist/';
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
  'CONNECT',
);