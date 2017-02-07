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

  describe("Server Events", () => {
    describe("SET_VALUE_FROM_SERVER", () => {

      it("Dispatches a SET_VALUE_FROM_SERVER event", () => {
        const client = setUp();
        const event = client.mockServerEvent('SET_VALUE_FROM_SERVER', { value: 1 } );
        expect(event.firstCall.args).to.eql([ { type: 'SET_VALUE_FROM_SERVER', payload: { value: 1 } } ]);
      });

      it("Updates the state to a specified value", () => {
        const client = setUp();
        const event = client.mockServerEvent('SET_VALUE_FROM_SERVER', { value: 1 }, client.store.dispatch);
        expect(client.store.getState().value).to.equal(1);
      });

    });
  });

  describe("State Events", () => {
    describe("connect", () => {

      it("Dispatched the CONNECTED action", () => {
        const client = setUp();
        const event = client.mockStateEvent('connect'); 
        expect(event.firstCall.args).to.eql([ { type: 'CONNECTED' } ]);   
      });

    });
  });

});