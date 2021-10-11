import * as React from "react";
import { render } from "react-dom";

import { Provider } from 'react-redux'

import App from "./components/App";

const rootEl = document.getElementById("root");

render(<App />, rootEl);
