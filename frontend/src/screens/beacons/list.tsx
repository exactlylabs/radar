import * as React from "react";
import { connect } from "react-redux";
import { ApplicationState } from "store";
import { Beacon } from "store/reducers/beacons/types";

interface BeaconItemProps {
  beacon: Beacon;
}

class BeaconItem extends React.Component<BeaconItemProps> {
  render() {
    return (
      <tr>
        <td>{this.props.beacon.id}</td>
        <td>{this.props.beacon.name}</td>
        <td>{this.props.beacon.address}</td>
        <td>{this.props.beacon.online ? 'online' : 'offline'}</td>
        <td><a href={`/beacons/${this.props.beacon.id}/edit`}>edit</a></td>
      </tr>
    )
  }
}

interface BeaconsListProps {
  beacons: Beacon[];
}

class BeaconsList extends React.Component<BeaconsListProps> {
  render() {
    const beaconItems = this.props.beacons.map((beacon) => <BeaconItem key={beacon.id} beacon={beacon} />);

    return (
      <div>
        <a href="/beacons/add" className="btn btn-primary">Add</a>
        <table className="table">
          <thead>
            <tr>
              <th>id</th>
              <th>name</th>
              <th>address</th>
              <th>status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {beaconItems}
          </tbody>
        </table>
      </div>
    )
  }
}

function mapStateToProps(state: ApplicationState) {
  return {beacons: state.beacons.data};
}

export default connect(mapStateToProps)(BeaconsList);
