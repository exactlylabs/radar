import * as React from "react";
import { ChangeEvent } from "react";
import client from "services/client";
import { withRouter, RouteComponentProps } from "react-router-dom";

interface SignupState {
  email: string
  password: string
}

class Login extends React.Component<RouteComponentProps, SignupState> {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: ""
    }
  }

  handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // @ts-ignore
    this.setState({[e.target.name]: e.target.value});
  }

  handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    await client.signup(this.state.email, this.state.password);
    this.props.location.push('/beacons');
  }

  render() {
    return (
      <div className="body-signin text-center">
        <main className="form-signin">
          <form onSubmit={this.handleSubmit}>
            <h1 className="h1">Radar</h1>
            <h1 className="h3 mb-3 fw-normal">Start tracking bandwidth</h1>

            <div className="form-floating">
              <input name="email" type="email" className="form-control" id="floatingInput" placeholder="name@example.com" value={this.state.email} onChange={this.handleChange} />
              <label htmlFor="floatingInput">Email address</label>
            </div>
            <div className="form-floating">
              <input name="password" type="password" className="form-control" id="floatingPassword" placeholder="Password" value={this.state.password} onChange={this.handleChange} />
              <label htmlFor="floatingPassword">Password</label>
            </div>

            <button className="w-100 btn btn-lg btn-primary" type="submit">Sign up</button>
            <br /><br />
            <a href="/" className="link-secondary">Home</a>
          </form>
        </main>
      </div>
    )
  }
}

export default withRouter(Login);
