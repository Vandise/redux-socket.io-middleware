export const initialStateEvents = [
  {
    action: 'connecting',
    dispatch: (store, next, action) => (socket) => {
      console.log('Socket is connecting.');
    }
  },
  {
    action: 'connect',
    dispatch: (store, next, action) => (socket) => {
      console.log('Socket connected.');
    }
  },
  {
    action: 'disconnect',
    dispatch: (store, next, action) => (socket) => {
      console.log('Socket disconnected.');
    }
  },
  {
    action: 'reconnecting',
    dispatch: (store, next, action) => (socket) => {
      console.log('Socket reconnecting.');
    }
  }
];