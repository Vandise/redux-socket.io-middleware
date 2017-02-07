import { middleware, stateActions, clientActions, serverActions } from '../../src/middleware';
import { counterReducer, initialState, actions } from '../../src/';
import { testClient, mockSocket } from '../../../../dist/';

const setUp = () => {
  const client = new testClient(
    clientActions,
    serverActions,
    stateActions
  );
  client.bindMiddleware(middleware)
        .initializeMockStore(initialState, counterReducer);
  return client;
};

describe("Counter Middleware", () => {
  describe("Client Events", () => {
    describe("INCREMENT", () => {
      it("Emits an INCREMENT event to the server", () => {
        const client = setUp();
        client.mockClientEvent(actions.INCREMENT());
        expect(client.socket.emit.calledOnce);
        expect(client.socket.emit.firstCall.args).to.eql(['INCREMENT', undefined]);
      });
    });
    describe("DECREMENT", () => {
      it("Emits an INCREMENT event to the server", () => {
        const client = setUp();
        client.mockClientEvent(actions.DECREMENT());
        expect(client.socket.emit.calledOnce);
        expect(client.socket.emit.firstCall.args).to.eql(['DECREMENT', undefined]);
      });
    });
  });
});