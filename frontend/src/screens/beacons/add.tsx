import * as React from "react";
import client from "services/client";
import { withRouter, RouteComponentProps } from "react-router-dom";

interface BeaconsAddState {
  clientId: string;
  clientSecret: string;
  name: string;
  address: string;
}

class BeaconsAdd extends React.Component<RouteComponentProps, BeaconsAddState> {
  constructor(props) {
    super(props);
    this.state = {
      clientId: "",
      clientSecret: "",
      name: "",
      address: ""
    }
  }
  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // @ts-ignore
    this.setState({[e.target.name]: e.target.value});
  }

  handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    await client.addBeacon(this.state.clientId, this.state.clientSecret, this.state.name, this.state.address);
    this.props.location.push('/beacons');
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <h3 className="h3">Add Beacon</h3>
          <form onSubmit={this.handleSubmit}>
            <div className="mb-3">
              <label htmlFor="clientId" className="form-label">Client ID</label>
              <input className="form-control" id="clientId" name="clientId"  value={this.state.clientId} onChange={this.handleChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="clientSecret" className="form-label">Client Secret</label>
              <input className="form-control" id="clientId" name="clientSecret"  value={this.state.clientSecret} onChange={this.handleChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input className="form-control" id="clientId" name="name"  value={this.state.name} onChange={this.handleChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="address" className="form-label">Address</label>
              <input className="form-control" id="clientId" name="address"  value={this.state.address} onChange={this.handleChange} />
            </div>

            <button className="w-100 btn btn-lg btn-primary" type="submit">Add</button>
          </form>
        </div>
      </div>
    )
  }
}

export default withRouter(BeaconsAdd);
