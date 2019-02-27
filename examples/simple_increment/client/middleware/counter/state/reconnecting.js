const action = 'reconnecting';
const dispatch = (socket, store, next, action) => (attemptNumber) => {
  console.log('Socket is reconnecting', action, attemptNumber);
};

export default {
  action,
  dispatch,
};
