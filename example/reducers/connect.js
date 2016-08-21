import { handleActions } from 'redux-actions';

export default handleActions({
  CONNECT: (state, action) => {
    return {
      ...state,
      host: action.payload.host,
      port: action.payload.port
    };
  }
}, {
  host: '',
  port: ''
});
