import { createStore, applyMiddleware } from 'redux';
import sinon from 'sinon';
import thunk from 'redux-thunk';
import mockSocket from './mockSocket';

export const DEFAULT_CONNECT_EVENT = 'CONNECT';
export const NOOP = () => { return null };

export default class {

  constructor(clientEvents = [], serverEvents = [], stateEvents = [], connectEvent = DEFAULT_CONNECT_EVENT) {
    this.socket = new mockSocket(serverEvents, stateEvents);
    this.middleware = null;
    this.store = null;
    this.initializedMiddleware = false;
    this.clientEvents = clientEvents;
    this.serverEvents = serverEvents;
    this.stateEvents  = stateEvents;
    this.connectEvent = connectEvent;
    this.cachedDispatch = null;
    this.initialState = {};
    this.reducers = null;
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

  resetStore() {
    this.initializeMockStore(
      this.initialState,
      this.reducers
    );
  }

  initializeMockStore(initialState, combinedReducers) {
    this.store = createStore(combinedReducers, initialState, 
      applyMiddleware(thunk, this.middleware)
    );
    this.initialState = initialState;
    this.cachedDispatch = this.store.dispatch;
    this.reducers = combinedReducers;
    return this;
  }

  mockClientEvent(event) {
    this.store.dispatch(event);
  }

  mockServerEvent(event, data, dispatch = sinon.spy()) {
    return this.socket.on(event, data, dispatch);
  }

  mockStateEvent(event, data, next = NOOP, action = {}, dispatch = sinon.spy()) {
    this.store.dispatch = dispatch;
    return this.socket.stateEvent(event, data, next, action, this.store);
  }

};