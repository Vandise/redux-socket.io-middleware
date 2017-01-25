const dispatch = (socket, store, action) => {
  socket.emit(action.type, action.payload);
};

export default {
  action: 'INCREMENT',
  dispatch,
};