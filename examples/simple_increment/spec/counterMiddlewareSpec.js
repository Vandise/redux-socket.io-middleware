describe('Counter Middleware', () => {

  let id;
  let store;
  let mockSocket;
  let mockMiddleware;
  let socketMiddleware;

  const stubMockSocket = (id, mockSocket) => {
    socketMiddleware.SOCKETS[id] = mockSocket;
    socketMiddleware.toggleInitStatus(id);  
  };

  const stubMiddleware = () => {
    store = require('../client/store').store;
    const counterMiddleware = require('../client/middleware/counter');

    socketMiddleware = counterMiddleware.middleware;

    id = counterMiddleware.id;
    mockMiddleware = counterMiddleware.default;

    stubMockSocket(id, mockSocket);
  };

  beforeEach(() => {
    mockSocket = {
      emit: sinon.spy(),
    };
  });

  describe('Client Events', () => {
    beforeEach(() => {
      stubMiddleware();
    });

    describe('INCREMENT', () => {
      it('emits the event to the server', () => {
        mockMiddleware(store)(() => true)({ type: 'INCREMENT' });
        expect(mockSocket.emit).to.have.been.calledWith('INCREMENT');
      });
    });

    describe('DECREMENT', () => {
      it('emits the event to the server', () => {
        mockMiddleware(store)(() => true)({ type: 'DECREMENT' });
        expect(mockSocket.emit).to.have.been.calledWith('DECREMENT');
      });
    });
  });

  describe('Server Events', () => {
    beforeEach(() => {
      td.replace(store, 'dispatch', sinon.spy());
    });

    describe('SET_VALUE_FROM_SERVER', () => {
      it('is handled by the middleware', () => {
        mockMiddleware(store)(() => true)({
          type: `${id}_*`, payload: {
            type: 'SET_VALUE_FROM_SERVER',
            data: { value: 1 }  
          }
        });
        expect(store.dispatch).to.have.been.called;
      });
    });
  });

  describe('State Events', () => {
    beforeEach(() => {
      td.replace(store, 'dispatch', sinon.spy());
    });

    describe('connect', () => {
      it('dispatches the connected action', () => {
        mockMiddleware(store)(() => true)({
          type: `${id}_state`, payload: {
            type: 'connect'
          }
        });
        expect(store.dispatch).to.have.been.calledWith({ type: 'CONNECTED'});
      });
    });
  });
});