const action = 'connect';
const dispatch = (socket, store, next, action) => () => {
  store.dispatch({ type: 'CONNECTED'});
};

export default {
  action,
  dispatch,
};
