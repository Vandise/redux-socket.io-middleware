import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunk from 'redux-thunk';
import * as actions from './actions/index';
import reducer from './reducers';
import socketIOMiddleware from './middleware/socketMiddleware';

const onSocketEvents = (event, data) => {
  // we also have access to the store and socket parameters
  console.log('Captured event: ', event.toString());
};

const middleware = socketIOMiddleware(
  null,
  [],
  onSocketEvents
);

const reducers = combineReducers({
  ...reducer
});

const store = createStore(reducers, compose(
  applyMiddleware(thunk, middleware)
));

store.dispatch(actions.CONNECT('http://127.0.0.1','44500'));

