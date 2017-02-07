import sinon from 'sinon';

export default class {

  constructor(serverEvents) {
    this.emit = sinon.spy();
    this.serverEvents = serverEvents;
  }

  on(event, data, dispatch) {
    console.log(event, data, dispatch);
  }

};