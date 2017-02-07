'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var initialStateEvents = exports.initialStateEvents = [{
  action: 'connecting',
  dispatch: function dispatch(store, next, action) {
    return function (socket) {
      console.log('Socket is connecting.');
    };
  }
}, {
  action: 'connect',
  dispatch: function dispatch(store, next, action) {
    return function (socket) {
      console.log('Socket connected.');
    };
  }
}, {
  action: 'disconnect',
  dispatch: function dispatch(store, next, action) {
    return function (socket) {
      console.log('Socket disconnected.');
    };
  }
}, {
  action: 'reconnecting',
  dispatch: function dispatch(store, next, action) {
    return function (socket) {
      console.log('Socket reconnecting.');
    };
  }
}];