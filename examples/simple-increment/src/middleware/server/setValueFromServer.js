export default (action, data, dispatch) => {
  if (action === 'SET_VALUE_FROM_SERVER') {
    dispatch({
      type: 'SET_VALUE_FROM_SERVER',
      payload: data,
    });
    return true;
  }
  return false;
};