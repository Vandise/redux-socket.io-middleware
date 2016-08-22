import io from 'socket.io-client';

export const defaultOpts = {
  transports: ['websocket'],
};

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
  connectAction = 'CONNECT',
  options = defaultOpts) => {

  let socket = initialSocket;
  const onEvent = (socket, store, next, action) => listenEvents;

  return store => next => action => {

    if (action.type === connectAction || socket != null) {
      if (socket === null) {
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