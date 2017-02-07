import sinon from 'sinon';

export default class {

  constructor(serverEvents, stateEvents) {
    this.emit = sinon.spy();
    this.lastDispatch = null;
    this.serverEvents = serverEvents;
    this.stateEvents = stateEvents;
  }

  on(e, data, dispatch) {
    this.serverEvents.some((event) => {
      if (event.action === e) {
        event.dispatch(e, data, dispatch);
        return true;
      }
      return false;
    });
    this.lastDispatch = dispatch;
    return dispatch;
  }

  stateEvent(e, data, next, action, store) {
    this.stateEvents.some((event) => {
      if (event.action === e) {
        const stateAction = event.dispatch(store, next, action, this);
        stateAction();
        return true;
      }
      return false;
    });
    this.lastDispatch = store.dispatch;
    return store.dispatch;
  }

};