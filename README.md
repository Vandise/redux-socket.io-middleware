# redux-socket.io-middleware [![Build Status](https://travis-ci.org/Vandise/redux-socket.io-middleware.svg?branch=master)](https://travis-ci.org/Vandise/redux-socket.io-middleware)
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
A helper class is provided to simplify unit testing. To include the test class, simply import it from the `socket.io-middleware` package:

```javascript
import { testClient } from 'socket.io-middleware';
```

### Initializing the test client
To initialize the test client with your middleware, you must have access to your defined `client events`, `state events`, `server events`, and `connect action`. You must also provide the `raw construct function of your middleware` so a mock socket can be initialized. Look at the examples for implementation.

You can then `bind your middleware` and initialize a mock store with your `reducers` to create an environment to test your middleware.

```javascript
const setUp = () => {
  const client = new testClient(
    clientActions,
    serverActions,
    stateActions
  );
  client.bindMiddleware(middleware)
        .initializeMockStore(initialState, counterReducer);
  return client;
};
```

### Mocking socket events
The test client provides various functions that allow you to execute events in a secluded middleware environment. These include: `mockClientEvent`, `mockServerEvent`, and `mockStateEvent`.


>mockClientEvent(event), event = { action, dispatch }

>mockServerEvent(event, data, dispatch = sinon.spy()), event = string, dispatch = spy||store.dispatch

>mockStateEvent(event, data, next = NOOP, action = {}, dispatch = sinon.spy()), event = string, data = {}

>Client Events

```javascript
describe("INCREMENT", () => {
  it("Emits an INCREMENT event to the server", () => {
    const client = setUp();
    client.mockClientEvent(actions.INCREMENT());
    expect(client.socket.emit.calledOnce);
    expect(client.socket.emit.firstCall.args).to.eql(['INCREMENT', undefined]);
  });
});
```

>Server Events

```javascript
describe("SET_VALUE_FROM_SERVER", () => {

  it("Dispatches a SET_VALUE_FROM_SERVER event", () => {
    const client = setUp();
    const event = client.mockServerEvent('SET_VALUE_FROM_SERVER', { value: 1 } );
    expect(event.firstCall.args).to.eql([ { type: 'SET_VALUE_FROM_SERVER', payload: { value: 1 } } ]);
  });

  it("Updates the state to a specified value", () => {
    const client = setUp();
    const event = client.mockServerEvent('SET_VALUE_FROM_SERVER', { value: 1 }, client.store.dispatch);
    expect(client.store.getState().value).to.equal(1);
  });
});
```

>State Events

```javascript
describe("State Events", () => {
  describe("connect", () => {

    it("Dispatched the CONNECTED action", () => {
      const client = setUp();
      const event = client.mockStateEvent('connect'); 
      expect(event.firstCall.args).to.eql([ { type: 'CONNECTED' } ]);   
    });

  });
});
```

### Resetting your middleware store
Call `resetStore` on the test client to reset the store state and dispatch functions. Best to utilize after every test.

## Contributing

Send a pull request noting the change, why it's required, and assign to Vandise. Current on-going issues include:
- Standardizing the socket message interfaces so functions are concise between message types.
- Implementing a function within the core middleware that will check if a server event has executed (as opposed to having the user check)
- Add package documentation
- Add working example

## License
GPL v3.0

Any updates or enhancements to this package must be open-source.
Any commercial products utilizing this package must be open-source or provide source code when requested.
