import * as React from "react";
import { render } from "react-dom";

import { Provider } from 'react-redux'

import Master from 'screens/master';
import store from 'store';

import { continueSession } from "store/reducers/user/actions";

continueSession();

const rootEl = document.getElementById("root");

render(
  <Provider store={store}>
    <Master />
  </Provider>,
  rootEl);
