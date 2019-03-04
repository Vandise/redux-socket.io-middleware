/**
  * Socketio Redux Middleware Client Event Handler.
  * @module socketio-middleware/middleware/client
  */

/**
  * Default function handler if dispatch isn't present in the event. Emits the action.type and action.payload to the server
  * @param {socket} socket - the web socket
  * @param {object} store - the redux store
  * @param {object} action - the redux action
  * @since v2.0.1
  */
export function defaultSocketEmit(socket, store, action) {
  socket.emit(action.type, action.payload);
}

/**
  * Default function handler if dispatch isn't present in the event. Emits the action.type and action.payload to the server
  * @param {object} event - the user event handler
  * @param {socket} socket - the web socket
  * @param {object} store - the redux store
  * @param {object} action - the redux action
  * @since v2.0.1
  * @return {null}
  */
export default function clientHandler(event, socket, store, action) {
  if (event.dispatch) {
    return event.dispatch(socket, store, action);
  }
  return exports.defaultSocketEmit(socket, store, action);
}