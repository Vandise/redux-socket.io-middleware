import io from 'socket.io-client';
import socketIOMiddleware from '../src/index';

const socket = io.connect('http://0.0.0.0:44501', {
  transports: ['websocket'],
  'force new connection': true
});


let iteration = 0;
const timer = setInterval(() => {
  if (socket.connected || iteration >= 10) {
    clearInterval(timer);
  }
  iteration++;
}, 1000);

const attemptDispatch = (socket, store, action) => {
  socket.emit('LOGIN_ATTEMPT', {
    username: action.user.username,
    password: action.user.password
  });
};

const dispatchEvents = [
  {
    action: 'LOGIN_ATTEMPT',
    dispatch: attemptDispatch,
  }
];

const onSocketEvents = () => sinon.spy();
const noOP = () => { return null; };

describe('Redux SocketIO Middleware', () => {

  describe('Client Actions', () => {

    before(() => {
      dispatchEvents[0].dispatch = sinon.spy();
    });

    it('Should dispatch the proper action', (done) => {
      const middleware = socketIOMiddleware(
        socket,
        dispatchEvents,
        onSocketEvents
      );
      middleware({})(noOP)({
        type: 'LOGIN_ATTEMPT',
        user: {
          username: 'username',
          password: 'password',
        }
      });

      const action = dispatchEvents[0].dispatch.lastCall.thisValue.action;
      expect(action).to.equal('LOGIN_ATTEMPT');
      done();

    });

  });

  describe('Server Actions', () => {

    before(() => {
      dispatchEvents[0].dispatch = attemptDispatch;
    });

    it('Should route to the proper event', (done) => {
      const spy = sinon.spy();
      const socketEvents = () => spy;
      const middleware = socketIOMiddleware(
        socket,
        dispatchEvents,
        socketEvents
      );
      middleware({})(noOP)({
        type: 'LOGIN_ATTEMPT',
        user: {
          username: 'username',
          password: 'password',
        }
      });

      let iteration = 0;
      const timer = setInterval(() => {
        if (spy.called || iteration >= 10) {
          const args = spy.getCalls(0)[0].args;
          expect(args[1]).to.equal('LOGIN_SUCCESS');
          expect(args[2]).to.eql({
            username: 'username',
            password: 'password'
          });
          clearInterval(timer);
          done();
        }
        iteration++;
      }, 150);

      done();    
    });

  });

  describe('No initial socket connect', () => {
    it('Should dispatch the next action on connect', () => {
      const middleware = socketIOMiddleware();
      const nextAction = sinon.spy();
      middleware({})(nextAction)({
        type: 'CONNECT',
        payload: {
          host: 'http://0.0.0.0',
          port: '44501'
        }
      });
      expect(nextAction.calledOnce).to.equal(true);
    });

    after(() => {
      //socket.disconnect(true);
    });
  });
});