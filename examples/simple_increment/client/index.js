import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import View from './view';
import { store } from './store';

const el = document.getElementById('app');

export default ReactDOM.render(
  <Provider store={store}>
    <View />
  </Provider>, el
);