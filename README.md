# redux-socket.io-middleware
An implementation of a generic socket.io middleware.

## Introduction
This is an opinionated implementation of how redux should work with sockets. The philosophy is simple: only the middleware should have
knowledge of the socket and the connection. Messages from the client should be sent by dispatching actions to the store and messages from
the server should be dispatched as actions once recieved.

## Dispatching messages from the client
Like all sockets, we begin by setting up a connection. In redux we need to specify an action to establish the connection from the client
to the server. By default this action is set as CONNECT. See the documentation on how to change this action.

#### actions/index.js
```javascript
import { createAction } from 'redux-actions';
export const CONNECT = createAction(
  'CONNECT', (host, port) => {
    return {
      host,
      port,
    };
  }
);
```
#### reducers/connect.js
The expected behavior of the CONNECT action is to expect a host and port property in the payload. Currently there is no implementation to
overload this.
```javascript
import { handleActions } from 'redux-actions';
export default handleActions({
  CONNECT: (state, action) => {
    return {
      ...state,
      host: action.payload.host,
      port: action.payload.port
    };
  }
}, {
  host: '',
  port: ''
});
```
## Receiving messages from the server
To capture events sent from the server, the middleware expects a function to be defined that accepts an event and data parameter.
The event is the event name emitted from the server, and the data is the data sent with the message. Four other parameters are exposed
in this function: the current socket (socket), the store (store), the next function (next), and the action (action).
```javascript
const onSocketEvents = (event, data) => {
  if (event === 'SOME_EMITTED_EVENT') {
    store.dispatch(actions.SOME_ACTION(parameters));
  }
  return next(action);
};
```

## Putting it all together
The only requirement for the socket.io middleware is to apply thunk with it. Set up your redux store like any other redux application.
```javascript
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunk from 'redux-thunk';
import { socketIOMiddleware } from 'redux-socket.io-middleware';
...
const onSocketEvents = (event, data) => {
  if (event === 'SOME_EMITTED_EVENT') {
    store.dispatch(actions.SOME_ACTION(parameters));
  }
  return next(action);
};

const dispatchEvents = [
  {
    action: 'NOOP',
    dispatch: (socket, store, action) => {
      store.dispatch(actions.NOOP());
    },
  }
];

const middleware = socketIOMiddleware(
  null,             // initial socket, one will be created on CONNECT
  dispatchEvents,   // actions to capture to dispatch to the server
  onSocketEvents    // actions to capture from the server to update the store
  'CONNECT',        // conncetion action, default = CONNECT
  {},               // SocketIO socket options, transports, etc.
);

const reducers = combineReducers({
  ...reducer
});

const store = createStore(reducers, compose(
  applyMiddleware(thunk, middleware)
));

store.dispatch(actions.CONNECT('http://127.0.0.1','44500'));
```

## License
GPL v3.0
