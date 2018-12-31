export default function serverEventHandler(serverEvents, dispatch) {
  return (event, data) => {
    serverEvents.some((e) => {
      if (e.action === event) {
        e.dispatch(event, data, dispatch);
        return true;
      }
      return false;
    });
  };
}