# redux-socket.io-middleware
An implementation of a generic socket.io middleware.

## Introduction
This is an opinionated implementation of how redux should work with sockets. The philosophy is simple: only the middleware should have
knowledge of the socket and the connection. Messages from the client should be sent by dispatching actions to the store and messages from the server should be dispatched as actions once recieved. 

## Overview
The middleware accepts the following parameters upon initialization.

### Initial Socket
If a connection is already established outside the middleware, you may specify the socket.

### Client Dispatch Events
An array of *event* objects that the socket can emit to the server. 
#### Event Object
##### Action <string>
The action to listen to dispatched from redux
##### dispatch<function(socket, store, action)>
The function to execute, emit an event to the server with any data in the store or passed to the action.

### Server Events
Events received from the server. These events are wrapped within a function. See an example implementation in the Getting Started section.
#### Parameters
##### Event <string>
The event captured from the server
##### Data <object>
The payload from the server
##### Exposed Variables: 
The following variables are passed from redux: socket, store, next, action.

### State Events
State events are events that occur when the connection state of the object changes. These include connect, connecting, reconnecting, diconnect, etc. This is an array of *event* objects following the same format the client dispatch events.

### Connection Action
The redux action to listen to on the connect event. This event must be dispatched before you make calls against the socket. 

### Socket Options
Configuration options for the socket. Default sets the transports to websocket.

## Getting Started
This middleware is intended to maintain multiple socket connections in a single application (it works just as well with a single socket). The following directory structure is recommended to create a testable environment.

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
### Setting Up Client Events
When the client events are sent to configure the middleware, they must be in an array format. An example of this would appear like below.
#### myMiddleware/client/index.js
```javascript
import { MY_EVENT } from 'constants/messages/myMiddlewareName'
const dispatch = (socket, store, action) => {
  socket.emit(action.type, action.payload);
};
export my_event = {
  action: MY_EVENT,
  dispatch,
};
export default [
  my_event,
];
```
### Setting Up Server Events
Server events are wrapped in a function. How these functions are dispatched are entirely up to you, but the following setup allows easy testability. 
```javascript
// myMiddleware/server/aMessage.js
import * as actions from './actions/serverActions';
export default (action, data, dispatch) => {
  if (action === 'aMessage') {
    dispatch(actions.anAction(data));
  } 
};

// myMiddleware/server/index.js
import aMessage from './aMessage';
const events = [
  aMessage,
];

export default (socket, store, next, action) => (event, data) => {
  return events.some((e) => {
    return e(event, data, store.dispatch);
  });
};
```
### Putting It All Together
After setting up your server and client events, the middleware needs to be configured to use these options. These options also need to be bound to a specific connect event -- this is how the middleware can distinguish between sockets and whether they've been initialized.
```javascript
// mymiddleware.js
import serverEvents from './server/';
import clientEvents from './client/';
import socketMiddleware from 'redux-socket.io-middleware';

export default socketMiddleware(
  null,
  clientEvents,
  serverEvents,
  [], // state events
  'MY_CONNECT_EVENT'
);

```

## License
GPL v3.0
