import { handleActions } from 'redux-actions';

export const counterReducer = handleActions({
  SET_VALUE_FROM_SERVER: (state, action) => {
    return {
      ...state,
      value: action.payload.value,
    };    
  },
  CONNECTED: (state, action) => {
    return {
      ...state,
      connected: true,
    };
  },
}, {
  value: 0,
  connected: false,
});