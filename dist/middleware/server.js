"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = serverEventHandler;
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
function serverEventHandler(serverEvents, dispatch) {
  return function (event, data) {
    serverEvents.some(function (e) {
      if (e.action === event) {
        e.dispatch(event, data, dispatch);
        return true;
      }
      return false;
    });
  };
}