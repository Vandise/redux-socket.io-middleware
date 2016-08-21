import io from 'socket.io-client';

export const defaultOpts = {
  transports: ['websocket'],
};

export const defaultSocketEvents = [
  {
    action: 'NOOP',
    dispatch: (socket, store, action) => {
      console.error('NOOP Called.');
    }, 
  },
];

export const onSocketEvents = (socket, store) => (event, data) => {
  console.error('Not yet implemented, recieved:',
    event,
    ' event with params:',
    data);
};

export const socketIOMiddleware = (
  initialSocket = null,
  dispatchEvents = defaultSocketEvents,
  listenEvents = onSocketEvents,
  connectAction = 'CONNECT',
  options = defaultOpts) => {

  let socket = initialSocket;
  const defaultEvents = dispatchEvents;

  return store => next => action => {
    if (action.type === connectAction) {
      const connStr = `${action.payload.host}:${action.payload.port}`;
      if (socket !== null) {
        socket.close();
      }
    
      socket = io.connect(connStr, options);

      const onevent = socket.onevent;
      socket.onevent = (packet) => {
        const args = packet.data || [];
        packet.data = ['*'].concat(args);
        onevent.call(socket, packet);
      };
    
      socket.on('*', listenEvents(socket, store));

    } else {
      defaultEvents.map((event) => {
        if (action.type === event.action) {
          return event.dispatch(socket, store, action);
        }
      });
    }
    return next(action);
  };
};

export default socketIOMiddleware;
