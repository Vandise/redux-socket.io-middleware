# redux-socket.io-middleware [![Build Status](https://travis-ci.org/Vandise/redux-socket.io-middleware.svg?branch=master)](https://travis-ci.org/Vandise/redux-socket.io-middleware) [![Downloads](https://img.shields.io/npm/dt/redux-socket.io-middleware.svg)](https://www.npmjs.com/package/redux-socket.io-middleware)
An implementation of a generic socket.io middleware. Implemented with the notion that the application will be utilizing multiple sockets.

## Introduction
This is an opinionated implementation of how redux should work with sockets. The philosophy is that only the middleware should have
knowledge of the socket and the connection. Messages from the client should be sent by dispatching actions to the store and messages from the server should be dispatched as actions once received. 

Though this package works well with a single socket connection, it is intended to maintain multiple connections in a single application. For single connections, it may be more appropriate to have a "networking" layer dispatching and handling redux events.

## Installing the Middleware
The Middleware can be installed by adding the following to your package.json:
```
"socket.io-middleware":
"https://github.com/Vandise/redux-socket.io-middleware/archive/{branch_name}.tar.gz",
```

or through NPM:

```
npm i socket.io-middleware
```

## Getting Started
Various socket message types, such as `server` messages, `client` messages, and `state` messages
have to utilize a specific export format. This is due to the limited interfacing capabilities with socket.io.
In the future, different message types may become more standardized.

More specific examples and advanced usage can be found in the [Wiki](https://github.com/Vandise/redux-socket.io-middleware/wiki).

### Formatting Your Directory Structure
Utilizing the following directory structure creates an easy-to-test and predictable environment by separating server messages, from client.

```
middleware
  - myMiddleware.js
  - myMiddleware
    - index.js
    - client
      - index.js
    - server
      - index.js
    - state
      - index.js
```

### Client Events
Client Events are events sent from the client (web browser) to the server. Following the directory structure mentioned, we place our client events in `middleware/myMiddlewareName/client/`

When exporting all client events, they must be exported as an `array of objects` containing the `action` name and a `function` to execute.

>middleware/myMiddlewareName/client/validateClient.js

```javascript

import { VALIDATE_CLIENT_ATTEMPT } from '../constants/messages';

const dispatch = (socket, store, action) => {
  // dispatch an action with the store to the server
  socket.emit(action.type, action.payload);
};

export default {
  action: VALIDATE_CLIENT_ATTEMPT,
  dispatch,
};

```

We then add our event to our `index.js` file exporting all the events as an `array`

>middleware/myMiddlewareName/client/index.js

```javascript

import validateClient from './validateClient';

export default [
  validateClient,
];

```

### Server Events
Server events are messages being sent from the server to the client (web browser). This excludes events such as `connect`, `disconnect`, `reconnect`, etc. Following the directory structure mentioned, we place our client events in `middleware/myMiddlewareName/server/`

Like client events, we specify an action that will be sent from the `server` and a function to `dispatch`.

>middleware/myMiddlewareName/server/validateClientAttempt.js

```javascript

export const dispatch = (action, data, dispatch) => {
  dispatch({
    type: 'SET_VALUE_FROM_SERVER',
    payload: data,
  });
};

export default {
  action: 'SET_VALUE_FROM_SERVER',
  dispatch,
};

```

We then export all our server event objects in an `array`.

>middleware/myMiddlewareName/server/index.js

```javascript

import validateClientAttempt from './validateClientAttempt'

export default [
  validateClientAttempt,
];

```

### State Events
State events are events triggered by socket.io, not by user actions. These include: `connect`, `connect_error`, `connect_timeout`, `reconnect`, `reconnect_attempt`, `reconnecting`, `reconnect_error`, `reconnect_failed`, `disconnect`, and `error`. These follow a similar format to client events, except an additional function must be added to a chain to retain parameters. Following the directory structure mentioned, we place our client events in `middleware/myMiddlewareName/state/`

>middleware/myMiddlewareName/state/connect.js

```javascript

import { initialAction } from '../actions/handleConnect';

const action = 'connect';
const dispatch = (socket, store, next, action) => () => {
  store.dispatch(handleConnect());
};

export default {
  action,
  dispatch,
};

```

We then export our state events as an `array`

>middleware/myMiddlewareName/state/index.js

```javascript

import connect from './connect';

export default [
  connect,
];

```

### Bundling the Middleware
The last step is to bundle all your actions into a single file for exporting to the store. To simplify our middleware, we can create an `index` file containing all our events.

>middleware/myMiddlewareName/index.js

```javascript

import stateEvents from './state/';
import clientEvents from './client/';
import serverEvents from './server/';

export const state = stateEvents;
export const client = clientEvents;
export const server = serverEvents;

```

After which, we need to configure the middleware to be aware of these events and the `connect message` that will be sent from redux.

>middleware/myMiddlewareName.js

```javascript

import socketMiddleware from 'socket.io-middleware';
import { CONNECT } from './constants/messages/connect';
import * as EVENTS from './myMiddlewareName/';

const initialSocket = null;

// export events as well for the unit tests
export const client = EVENTS.client;
export const server = EVENTS.server;
export const state = EVENTS.state;
export const event = CONNECT;

export default socketMiddleware(
  initialSocket,     /* unless a socket.io instance is already connected */
  EVENTS.client,
  EVENTS.server,
  EVENTS.state,
  CONNECT,           /* connect action to be sent by redux to initialize the socket */
  /* options */      /* this also serves as a unique idendifier for multiple socket applications */
);

```

### Initializing the Store
With the middleware configured, we can initialize the redux store like any other redux application. The only dependency is you must apply the `thunk` middleware before you add any socket middleware.

>store.js

```javascript

import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import myMiddleware from './middleware/myMiddlewareName';


const initialState = {};
const reducers = {};

export default createStore(reducers, initialState, 
  applyMiddleware(thunk, myMiddleware)
);

```

You're Done!

### Managing Multiple Socket Connections
This package is intended to maintain multiple socket connections. Follow the above exactly until you have to define a `CONNECT` event. This event is your unique identifier for your socket. Rather than name the event `connect`, give it a meaningful value, such as `CHAT_SERVER_CONNECT`.

Be sure to give your Redux actions unique types. Multiple sockets listening to the same event will execute the action.

## Configurations
The sockets follow all the same configurations as specified in the socket.io documentation (devdocs.io/socketio). You can pass these configurations in the options parameter when initializing the middleware ( see: Bundling the Middleware ).

You can learn more from the provided example.

## Unit Testing
The middleware exposes the module state containing the socket connection status and socket reference. This allows you to test your socket middleware *without the need for a real socket connection.* You can mock the socket and connection status like so ( see the example in the examples directory for context ):

```js
  const counterModule = require('../client/middleware/counter');
  const socketModule = counterModule.middleware;
  const mockMiddleware = counterModule.default;
  const id = counterModule.id;
  const mockSocket = { emit: sinon.spy() };

  socketModule.SOCKETS[id] = mockSocket;
  socketModule.toggleInitStatus(id);  
```

### Client Events
To mock client events, you can pass in the action to the middleware.

```js
  describe('INCREMENT', () => {
    it('emits the event to the server', () => {
      mockMiddleware(store)(() => true)({ type: 'INCREMENT' });
      expect(mockSocket.emit).to.have.been.calledWith('INCREMENT');
    });
  });
```

### Server Events
Server events operate differently than client events. The socket listens for a wildcard, `socketid_*`, event and transitions through the list of server events and dispatches the function if there's a match. To execute a server event, the action type must be a wildcard. The payload must contain a `type` specifying the message type and an optional `data` attribute containing any socket data:

```js
  describe('SET_VALUE_FROM_SERVER', () => {
    it('is handled by the middleware', () => {
      mockMiddleware(store)(() => true)({
        type: '${id}_*', payload: {
          type: 'SET_VALUE_FROM_SERVER',
          data: { value: 1 }  
        }
      });
      // check that the SET_VALUE_FROM_SERVER handler executed
      expect(store.dispatch).to.have.been.called;
    });
  });
```

You can also check that the message updates the store state as opposed to stubbing `dispatch`.

### State Events
State events follow the same format as server events, except instead of a wildcard event, it's looking for a `socketid_state` event:

```js
  describe('connect', () => {
    it('dispatches the connected action', () => {
      mockMiddleware(store)(() => true)({
        type: '${id}_state', payload: {
          type: 'connect'
        }
      });
      expect(store.dispatch).to.have.been.calledWith({ type: 'CONNECTED'});
    });
  });
```

## Contributing

Send a pull request noting the change, why it's required, and assign to Vandise.

## License
GPL v3.0

Any updates or enhancements to this package must be open-source.
