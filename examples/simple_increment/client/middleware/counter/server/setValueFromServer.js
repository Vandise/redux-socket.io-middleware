export const dispatch = (action, data, dispatch) => {
  dispatch({
    type: 'SET_VALUE_FROM_SERVER',
    payload: data,
  });
};

export default {
  action: 'SET_VALUE_FROM_SERVER',
  dispatch,
};