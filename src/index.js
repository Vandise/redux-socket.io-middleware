import io from 'socket.io-client';

export const defaultOpts = {
  transports: ['websocket'],
};

export const initialStateEvents = [
  {
    action: 'connecting',
    dispatch: (store, next, action) => (socket) => {
      console.log('Socket is connecting.');
    }
  },
  {
    action: 'connect',
    dispatch: (store, next, action) => (socket) => {
      console.log('Socket connected.');
    }
  },
  {
    action: 'disconnect',
    dispatch: (store, next, action) => (socket) => {
      console.log('Socket disconnected.');
    }
  },
  {
    action: 'reconnecting',
    dispatch: (store, next, action) => (socket) => {
      console.log('Socket reconnecting.');
    }
  }
];

export const defaultSocketEvents = [
  {
    action: 'NOOP',
    dispatch: (socket, store, action) => {
      console.debug('NOOP event called. Have you implemented your events?');
    }, 
  },
];

export const onSocketEvents = (socket, store, next, action) => (event, data) => {
  console.error('Socket not listening for any events.');
};

let initializedSocket = [];

export const socketIOMiddleware = (
  initialSocket = null,
  dispatchEvents = defaultSocketEvents,
  listenEvents = onSocketEvents,
  stateEvents = initialStateEvents,
  connectAction = 'CONNECT',
  options = defaultOpts) => {

  let socket = initialSocket;
  const onEvent = listenEvents;
  initializedSocket[connectAction] = false;

  const serverEvent = (socket, store, next, action) => (event, data) => {
    listenEvents.some((e) => {
      if (e.action === event) {
        e.dispatch(event, data, store.dispatch);
        return true;
      }
      return false;
    });
  };

  return store => next => action => {
    if (action.type === connectAction && !initializedSocket[connectAction]) {
      let nextAction = false;
      if (socket === null) {
        nextAction = true;
        const connStr = `${action.payload.host}:${action.payload.port}`;
        if (socket !== null) {
          socket.close();
        }
        
        socket = io.connect(connStr, options);
 
      }

      const onevent = socket.onevent;
      socket.onevent = (packet) => {
        const args = packet.data || [];
        packet.data = ['*'].concat(args);
        onevent.call(socket, packet);
      };
      
      socket.on('*', serverEvent(socket, store, next, action));

      stateEvents.map((evt) => {
        let eventAction = evt.dispatch;
        socket.on(evt.action.toString(), eventAction(
          store,
          next,
          action,
          socket
        ));
      });
      initializedSocket[connectAction] = true;
    }

    if (socket != null) {
      dispatchEvents.map((event) => {
        if (action.type === event.action) {
          return event.dispatch(socket, store, action);
        }
      });
    }

    return next(action);
  };
};

export default socketIOMiddleware;
