import * as React from "react";
import { hot } from "react-hot-loader";

import "./../assets/scss/App.scss";

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Home from "screens/home";
import Login from "screens/login";
import Signup from "screens/signup";
import BeaconsList from "screens/beacons/list";
import BeaconsAdd from "screens/beacons/add";
import BeaconsEdit from "screens/beacons/edit";
import { connect } from "react-redux";
import { ApplicationState } from "store";
import AuthedNavbar from "components/authedNavbar";

interface MasterProperties {
  token: string;
}

class Master extends React.Component<MasterProperties, undefined> {
  public render() {
    const authedRoutes = (
      <>
        <Switch>
          <Route path="/beacons/:id/edit">
            <AuthedNavbar />
            <BeaconsEdit />
          </Route>
          <Route exact path="/beacons/add">
            <AuthedNavbar />
            <BeaconsAdd />
          </Route>
          <Route exact path="/beacons">
            <AuthedNavbar />
            <BeaconsList />
          </Route>
        </Switch>
      </>
    );

    return (
      <Router>
        <div className="app">
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/signup">
            <Signup />
          </Route>
          { this.props.token != null && authedRoutes }
          <Route exact path="/">
            <Home />
          </Route>
        </div>
      </Router>
    );
  }
}

declare let module: Record<string, unknown>;

function mapStateToProps(state: ApplicationState) {
  return state.user;
}

export default hot(module)(connect(mapStateToProps)(Master));
