import io from 'socket.io-client';

export const defaultOpts = {
  transports: ['websocket'],
};

export const initialStateEvents = [
  {
    action: 'connecting',
    dispatch: (socket) => {
      console.log('Socket is connecting.');
    }
  },
  {
    action: 'connect',
    dispatch: (socket) => {
      console.log('Socket connected.');
    }
  },
  {
    action: 'disconnect',
    dispatch: (socket) => {
      console.log('Socket disconnected.');
    }
  },
  {
    action: 'reconnecting',
    dispatch: (socket) => {
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

export const onSocketEvents = (event, data) => {
  console.error('Socket not listening for any events.');
};


export const socketIOMiddleware = (
  initialSocket = null,
  dispatchEvents = defaultSocketEvents,
  listenEvents = onSocketEvents,
  stateEvents = initialStateEvents,
  connectAction = 'CONNECT',
  options = defaultOpts) => {

  let socket = initialSocket;
  const onEvent = (socket, store, next, action) => listenEvents;

  return store => next => action => {

    if (action.type === connectAction || socket != null) {
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
      
      socket.on('*', onEvent(socket, store, next, action));
      stateEvents.map((evt) => {
        let eventAction = (store, next, action) => evt.dispatch;
        socket.on(evt.action.toString(), eventAction(
          store,
          next,
          action
        ));
      });

      if (nextAction) {
        return next(action);
      }
    }

    if (!socket.connected) {
      throw new Error('Socket must call a connect event before dispatching any actions.');
    }

    dispatchEvents.map((event) => {
      if (action.type === event.action) {
        return event.dispatch(socket, store, action);
      }
    });

    return next(action);
  };
};

export default socketIOMiddleware;