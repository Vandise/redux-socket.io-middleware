# redux-socket.io-middleware [![Build Status](https://travis-ci.org/Vandise/redux-socket.io-middleware.svg?branch=v0.1.1)](https://travis-ci.org/Vandise/redux-socket.io-middleware)
An implementation of a generic socket.io middleware. Implemented with the notion that the application will be utilizing mutliple sockets.

## Introduction
This is an opinionated implementation of how redux should work with sockets. The philosophy is simple: only the middleware should have
knowledge of the socket and the connection. Messages from the client should be sent by dispatching actions to the store and messages from the server should be dispatched as actions once received. 

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
const dispatch = (store, next, action, socket) => () => {
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
                     /* this also serves as a unique idendifier for multiple socket applications */
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

## Implementing Unit Tests
The following example is incomplete, but should give a good direction on how to test socket events without the need for a live server. This is more of a suggestion as how to test the events. The simple explanation on how to test the middleware events is to add an instantiated `mock socket` to the middleware initialization (See *Bundling the Middleware*).

In order to mock the socket and capture the event data, you would construct a function to be reused like below.

```javascript

import sinon from 'sinon';

global.mockClientSocket = () => {
  return {
    emit: sinon.spy(),
  };
};

```

We can then mock an event. Note that this can be simplified based on the test suite you are utilizing.

```javascript

import * as MyMiddleware from '../middleware/myMiddlewareName';
import * as actions from '../actions';

describe('My Middleware', () => {
  describe('validateClientAttempt', () => {
    it('Attempts to connect to the specified server', () => {

      const socket = mockClientSocket();
      const middleware = MyMiddleware.middleware(socket, MyMiddleware.client);
      const store = mockStore({}, middleware);
      const server = {}; // fake data

      const expected = [events.VALIDATE_CLIENT_ATTEMPT, {
        host: server.ip,
        port: server.port,
        version: server.version,
      }];
      store.dispatch(actions.validateClientAttempt(server));
      expect(socket.emit.lastCall.args).to.eql(expected);
    });
  });
});


```

### Contributing

Send a pull request noting the change, why it's required, and assign to Vandise. Current on-going issues include:
- Standardizing the socket message interfaces so functions are concise between message types.
- Implementing a function within the core middleware that will check if a server event has executed (as opposed to having the user check)
- Add package documentation
- Add working example

## License
GPL v3.0
