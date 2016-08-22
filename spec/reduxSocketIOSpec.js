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

const dispatchEvents = [
  {
    action: 'LOGIN_ATTEMPT',
    dispatch: (socket, store, action) => {
      socket.emit('LOGIN_ATTEMPT', {
        username: action.user.username,
        password: action.user.password
      });
    }
  }
];
const onSocketEvents = sinon.spy();
const noOP = () => { return null; };

describe('Redux SocketIO Middleware', () => {
  describe('Client Actions', () => {
    it('Should dispatch the proper action', () => {
      const events = dispatchEvents;
      events[0].dispatch = sinon.spy();
      const middleware = socketIOMiddleware(
        socket,
        events
      );
      middleware({})(noOP)({
        type: 'LOGIN_ATTEMPT',
        user: {
          username: 'username',
          password: 'password',
        }
      });
      const action = events[0].dispatch.lastCall.thisValue.action;
      expect(action).to.equal('LOGIN_ATTEMPT');
      socket.disconnect(true);
    });
  });
});