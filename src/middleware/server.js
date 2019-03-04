/**
  * Socketio Redux Middleware Server Event Handler.
  * @module socketio-middleware/middleware/server
  */

/**
  * Event handler for server events
  * @param {array} serverEvents - the user server events list
  * @param {function} dispatch - the redux dispatch function
  * @since v0.0.1
  */
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