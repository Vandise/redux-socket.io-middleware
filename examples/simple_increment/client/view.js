import React from 'react';
import { connect } from 'react-redux';
import { actions } from './actions';

const Menu = class extends React.Component {

  componentDidMount() {
    // connect the socket to the server once the component mounts
    this.props.dispatch(actions.INCREMENT_CONNECT('localhost', 44500));
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
            <button
              className='disconnect-button'
              onClick={() => props.dispatch(actions.INCREMENT_DISCONNECT())}
            >Disconnect</button>
            <button
              className='connect-button'
              onClick={() => props.dispatch(actions.INCREMENT_CONNECT('localhost', 44500))}
            >Connect</button>
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

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps)(Menu);