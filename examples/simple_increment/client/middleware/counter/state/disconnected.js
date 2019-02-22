const action = 'disconnect';
const dispatch = (socket, store, next, action) => () => {
  console.log('socket disconnected');
};

export default {
  action,
  dispatch,
};
