'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var defaultSocketEvents = exports.defaultSocketEvents = [{
  action: 'NOOP',
  dispatch: function dispatch(socket, store, action) {
    console.debug('NOOP event called. Have you implemented your events?');
  }
}];