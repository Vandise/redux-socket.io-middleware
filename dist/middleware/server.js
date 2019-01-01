"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = serverEventHandler;
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