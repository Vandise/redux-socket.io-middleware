const action = 'connect';
const dispatch = (store, next, action, socket) => () => {
  store.dispatch({ type: 'CONNECTED'});
};

export default {
  action,
  dispatch,
};