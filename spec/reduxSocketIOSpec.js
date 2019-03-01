import * as socketIOMiddleware from '../src/index';

describe('Redux SocketIO Middleware', () => {

  let middleware;
  let next;
  let store;
  let action;
  let DEFAULT_ID;
  let mockClient;
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      id: 'test-socket',
      onevent: sinon.spy(),
      on: sinon.spy(),
      disconnect: sinon.spy(),
    };

    mockClient = {
      connect: sinon.stub().returns(mockSocket),
    };

    td.replace('../src/middleware/ioclient', () => mockClient);

    middleware = require('../src/index');
    DEFAULT_ID = middleware.DEFAULT_SOCKET_ID;
    td.replace(middleware, 'SOCKET_INITIALIZED', {});
    td.replace(middleware, 'SOCKETS', {});

    store = {};
    next = () => true;
    action = {
      type: DEFAULT_ID,
    };
  });

  afterEach(() => {
    td.reset();
  });

  /*
    isConnectAction
  */

  describe('.isConnectAction', () => {
    const ACTION = { type: 'SOCKET_1_CONNECT' };

    describe('when the action type is the connect event', () => {
      const EVENT = 'SOCKET_1_CONNECT';

      describe('and the socket has not been connected', () => {
        const CONNECTED = false;

        it('returns true', () => {
          expect(middleware.isConnectAction(ACTION, EVENT, CONNECTED)).to.equal(true);
        });
      });

      describe('and the socket has been connected', () => {
        const CONNECTED = true;

        it('returns false', () => {
          expect(middleware.isConnectAction(ACTION, EVENT, CONNECTED)).to.equal(false);
        });
      });
    });

    describe('when the action type is not the connect event', () => {
      const EVENT = 'SOCKET_2_CONNECT';

      it('returns false', () => {
        expect(middleware.isConnectAction(ACTION, EVENT, false)).to.equal(false);
      });
    });
  });

  /*
    getSocket
  */
  describe('.getSocket', () => {
    const CONN_ACTION = 'SOCKET_1_CONNECT';
    const TEST_SOCKET = { id: 'test_socket_id' };

    beforeEach(() => {
      const OBJ = {};
      OBJ[CONN_ACTION] = TEST_SOCKET;
      td.replace(middleware, 'SOCKETS', OBJ);
    });

    describe('when the socket is present', () => {
      it('returns the socket', () => {
        expect(middleware.getSocket(CONN_ACTION)).to.deep.equal(TEST_SOCKET);
      });
    });

    describe('when the socket does not exist', () => {
      it('returns null', () => {
        expect(middleware.getSocket('DNE')).to.equal(null);
      });
    });
  });

  /*
    generateConnectString
  */
  describe('.generateConnectString', () => {
    describe('when a namespace is absent', () => {
      const PAYLOAD = { host: 'test', port: 8080 };

      it('excludes the namespace URL', () => {
        expect(middleware.generateConnectString(PAYLOAD)).to.equal('test:8080');
      });
    });

    describe('when a namespace is present', () => {
      const PAYLOAD = { host: 'test', port: 8080, namespace: 'debug' };

      it('appends the slug', () => {
        expect(middleware.generateConnectString(PAYLOAD)).to.equal('test:8080/debug');
      });
    });
  });

  /*
    isInitialized
  */
  describe('.isInitialized', () => {
    describe('when present', () => {
      beforeEach(() => {
        const OBJ = {};
        OBJ[DEFAULT_ID] = true;
        td.replace(middleware, 'SOCKET_INITIALIZED', OBJ);
      });

      it('returns the status', () => {
        expect(middleware.isInitialized(DEFAULT_ID)).to.equal(true);
      });
    });

    describe('when absent', () => {
      it('returns false', () => {
        expect(middleware.isInitialized(DEFAULT_ID)).to.equal(false);
      });
    });
  });

  /*
    registerSocketEvents
  */
  describe('.registerSocketEvents', () => {
    it('pushes the events to the module EVENTS object', () => {
      middleware.registerSocketEvents('test', [], [], []);
      expect(middleware.EVENTS).to.have.property('test');
    });
  });

  /*
    registerSocketEvents
  */
  describe('.getSocketEvents', () => {
    it('returns an array of events', () => {
      const testClientEvents = ['test', 'test2'];
      middleware.registerSocketEvents('test', testClientEvents, [], []);
      expect(middleware.getSocketEvents('test', middleware.CLIENT_EVENT_KEY)).to.equal(testClientEvents);
    });
  });

  describe('.getInitStatus', () => {
    it('returns the socket status', () => {
      middleware.SOCKET_INITIALIZED[DEFAULT_ID] = false;

      expect(middleware.getInitStatus(DEFAULT_ID)).to.equal(false);
    });
  });

  /*
    socketio
  */
  describe('.socketio', () => {
    describe('on initialization', () => {
      it('sets the socket as uninitialized', () => {
        middleware.socketio();
        expect(middleware.SOCKET_INITIALIZED).to.have.keys(DEFAULT_ID);
        expect(middleware.isInitialized(DEFAULT_ID)).to.equal(false);
      });

      it('adds the socket to the sockets map', () => {
        const MOCK_SOCKET = { id: 'SOCKET_3_TEST' };
        middleware.socketio(MOCK_SOCKET);
        expect(middleware.SOCKETS).to.have.keys(DEFAULT_ID);
      });

      it('registers the events to the module', () => {
        middleware.socketio();
        expect(middleware.EVENTS).to.have.property(DEFAULT_ID);
      });
    });

    describe('when the connect action is passed', () => {
      beforeEach(() => {
        action = Object.assign({}, action, { payload: { host: 'test', port: 1234 } });
      });

      describe('and the socket has not been initialized', () => {
        it('adds the socket to the sockets map', () => {
          middleware.socketio()(store)(next)(action);
          expect(middleware.SOCKETS[DEFAULT_ID]).to.deep.equal(mockSocket);
        });

        it('initializes a new socket', () => {
          middleware.socketio()(store)(next)(action);
          expect(mockClient.connect).to.have.been.calledWith('test:1234', middleware.DEFAULT_SOCKETIO_OPTIONS);
        });

        it('overrides socketio\'s "onevent"', () => {
          const original = mockSocket.onevent;
          middleware.socketio()(store)(next)(action);
          expect(mockSocket.onevent).to.not.equal(original);
        });

        it('registers the wildcard event handler', () => {
          middleware.socketio()(store)(next)(action);
          expect(mockSocket.on).to.have.been.calledWith('*')
        });

        ['connecting', 'connect', 'disconnect', 'reconnecting'].forEach((evt) => {
          it(`registers the ${evt} event`, () => {
            middleware.socketio()(store)(next)(action);
            expect(mockSocket.on).to.have.been.calledWith(evt)
          });
        });

        it('sets the init status to true', () => {
          middleware.socketio()(store)(next)(action);
          expect(middleware.isInitialized(DEFAULT_ID)).to.equal(true);
        });
      });
    });

    describe('when the socket is connected', () => {
      describe('and a client request is sent', () => {
        beforeEach(() => {
          action = Object.assign({}, action, { payload: { host: 'test', port: 1234 } });
        });

        it('dispatches the action', () => {
          const event = {
            action: 'TEST',
            dispatch: sinon.spy()
          };
          const testMiddleware = middleware.socketio(null, [event]);

          testMiddleware(store)(next)(action);
          testMiddleware(store)(next)({ type: 'TEST' });

          expect(event.dispatch).to.have.been.called;
        });
      });

      describe('and SocketName_DISCONNECT is called', () => {
        beforeEach(() => {
          action = Object.assign({}, action, { payload: { host: 'test', port: 1234 } });
        });

        it('calls .disconnect on the socket', () => {
          const testMiddleware = middleware.socketio(mockSocket);

          testMiddleware(store)(next)(action);
          testMiddleware(store)(next)({ type: `${DEFAULT_ID}_DISCONNECT` });

          expect(mockSocket.disconnect).to.have.been.called;
        });

        it('sets the status to uninitialized', () => {
          const testMiddleware = middleware.socketio(mockSocket);

          testMiddleware(store)(next)(action);
          testMiddleware(store)(next)({ type: `${DEFAULT_ID}_DISCONNECT` });

          expect(middleware.getInitStatus(DEFAULT_ID)).to.equal(false);
        });
      });
    });
  });
});