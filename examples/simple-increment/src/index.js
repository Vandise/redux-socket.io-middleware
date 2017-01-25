import React from 'react';
import ReactDOM from 'react-dom';

// Standard Redux 
import thunk from 'redux-thunk';
import { Provider, connect } from 'react-redux';
import { createAction } from 'redux-actions';
import { handleActions } from 'redux-actions';
import { createStore, applyMiddleware } from 'redux';
import serverMiddleware from './middleware/';

// eslint-disable-next-line no-unused-vars
import Style from './stylesheets/main.scss';

const el = document.getElementById('app');

/*
  Application Actions
*/
const actions = {
  INCREMENT: createAction('INCREMENT'),
  DECREMENT: createAction('DECREMENT'),
  CONNECT: createAction('CONNECT', (host, port) => {
    return {
      host, port,
    };
  }),
};

/*
  Reducer for events received by the server
*/
const counterReducer = handleActions({
  SET_VALUE_FROM_SERVER: (state, action) => {
    return {
      ...state,
      value: action.payload.value,
    };    
  },
  CONNECTED: (state, action) => {
    return {
      ...state,
      connected: true,
    };
  },
}, {
  value: 0,
  connected: false,
});

/*
  Initialize store
*/
const initialState = {
  value: 0,
  connected: false,
};

const store = createStore(counterReducer, initialState,
  applyMiddleware(thunk, serverMiddleware)
);

/*
  Specify the form
*/
const Menu = class extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // connect the socket to the server once the component mounts
    this.props.dispatch(actions.CONNECT('localhost', 44500));
  }

  render() {
    const props = this.props;
    if (props.connected) {
      return (
        <div className='value-container'>
          <div className='value-message'>
            <p> The current value is: {props.value} </p>
          </div>
          <div className='actions'>
            <button
              className='increment-button'
              onClick={() => props.dispatch(actions.INCREMENT())}
            >Increment</button>
            <button
              className='decrement-button'
              onClick={() => props.dispatch(actions.DECREMENT())}
            >Decrement</button>
          </div>
        </div>
      );
    }
    return (
      <div>
        <p>Connecting to server...</p>
      </div>
    );
  }
};

/*
  Connect the view to listen to state changes
*/
const mapStateToProps = (state) => {
  return state;
};

const View = connect(mapStateToProps)(Menu);

/*
  Attach the view to the DOM
*/
export default ReactDOM.render(
  <Provider store={store}>
    <View />
  </Provider>, el
);
