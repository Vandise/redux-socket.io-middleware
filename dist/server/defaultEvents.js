'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var onSocketEvents = exports.onSocketEvents = function onSocketEvents(socket, store, next, action) {
  return function (event, data) {
    console.error('Socket not listening for any events.');
  };
};