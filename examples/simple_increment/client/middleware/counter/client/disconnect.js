const dispatch = (socket, store, action) => {
  socket.disconnect();
};

export default {
  action: 'INCREMENT_DISCONNECT',
  dispatch,
};