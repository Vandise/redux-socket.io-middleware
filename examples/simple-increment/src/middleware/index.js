import socketMiddleware from '../../../../dist/';
import stateEvents from './state/';
import clientEvents from './client/';
import serverEvents from './server/';

export const state = stateEvents;
export const client = clientEvents;
export const server = serverEvents;

const initialSocket = null;

export default socketMiddleware(
  initialSocket,
  client,
  server,
  state,
  'CONNECT',
);