import { createStore, applyMiddleware } from 'redux';
import sinon from 'sinon';
import thunk from 'redux-thunk';
import mockSocket from './mockSocket';

export const DEFAULT_CONNECT_EVENT = 'CONNECT';

export default class {

  constructor(clientEvents = [], serverEvents = [], stateEvents = [], connectEvent = DEFAULT_CONNECT_EVENT) {
    this.socket = new mockSocket(serverEvents);
    this.middleware = null;
    this.store = null;
    this.initializedMiddleware = false;
    this.clientEvents = clientEvents;
    this.serverEvents = serverEvents;
    this.stateEvents  = stateEvents;
    this.connectEvent = connectEvent;
  }

  bindMiddleware(middleware) {
    this.middleware = middleware(
      this.socket,
      this.clientEvents,
      this.serverEvents,
      this.stateEvents,
      this.connectEvent
    );
    return this;
  }

  initializeMockStore(initialState, combinedReducers) {
    this.store = createStore(combinedReducers, initialState, 
      applyMiddleware(thunk, this.middleware)
    );
    return this;
  }

  mockClientEvent(event) {
    this.store.dispatch(event);
  }

  mockServerEvent(event, data, dispatch = sinon.spy()) {
    return this.socket.on(event, data, dispatch);
  }

};