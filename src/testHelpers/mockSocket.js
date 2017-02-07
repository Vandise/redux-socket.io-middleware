import sinon from 'sinon';

export default class {

  constructor(serverEvents) {
    this.emit = sinon.spy();
    this.lastDispatch = null;
    this.serverEvents = serverEvents;
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

};