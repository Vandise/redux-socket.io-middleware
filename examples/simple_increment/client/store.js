import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { counterReducer } from './reducers';
import counterMiddleware from './middleware/counter';

export const initialState = {
  value: 0,
  connected: false,
};

export const store = createStore(counterReducer, initialState,
  applyMiddleware(thunk, counterMiddleware)
);