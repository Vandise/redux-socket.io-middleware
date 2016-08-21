import io from 'socket.io-client';

export const defaultOpts = {
  transports: ['websocket'],
};

export const initialEvents = {
  connect: {
    action: 'CONNECT',
    dispatch: connectAction, 
  },
};

export const connectAction = () => {
  const connStr = `${action.data.host}:${action.data.port}`;
  if (socket !== null) {
    socket.close();
  }

  socket = io.connect(connStr, opts);

  const onevent = socket.onevent;
  socket.onevent = (packet) => {
    const args = packet.data || [];
    packet.data = ['*'].concat(args);
    onevent.call(socket, packet);
  };

  socket.on('*', onEvent(store, socket));

};

export const initialOnEvent = (event, data) => {
  console.error('Socket not listening for any events.');
};

export const defaultActions = () => {
  console.error('Socket not dispatching any events.');
};

export const socketIOMiddleware = (
  initialSocket = null,
  initialActions = defaultActions,
  initialEvents = initialOnEvent,
  defaultEvents = initialEvents,
  initialOpts = defaultOpts) => {

  let socket = initialSocket;
  const onEvent = (store, socket) => initialOnEvent;

  return store => next => action => {
    defaultEvents.map((event) => {
      if (action.type === event.action) {
        return (store, socket) => event.dispatch();
      }
      return (store, socket) => initialEvents();
    });
  };
};

export default socketIOMiddleware;