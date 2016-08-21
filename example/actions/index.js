import { createAction } from 'redux-actions';

export const CONNECT = createAction(
  'CONNECT', (host, port) => {
    return {
      host,
      port,
    };
  }
);
