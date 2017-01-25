import setValueFromServer from './setValueFromServer';

const events = [
  setValueFromServer,
];

export default (socket, store, next, action) => (event, data) => {
  return events.some((e) => {
    return e(event, data, store.dispatch);
  });
};