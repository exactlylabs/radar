// Import CSS from Leaflet and plugins.
import 'leaflet/dist/leaflet.css';
//import 'leaflet.markercluster/dist/MarkerCluster.css';
//import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Import images directly that got missed via the CSS imports above.
//import 'leaflet/dist/images/marker-icon-2x.png';
//import 'leaflet/dist/images/marker-shadow.png';

import { Component } from "react";
import L, { geoJSON } from "leaflet";

const j = require("./../assets/img/o2.json");

interface Props {
}

interface State {
  direction: string;
  median: number;
  startDate: string;
  endDate: string;
  boundingBox: string;
  geoNamespace: string;
  zoom: number;
}

export default class Map extends Component<Props, State> {
  private map: L.Map;
  private latestData: {
    [key: string]: {
      id: string,
      rate: number
    }
  } = {};
  private geoJson: L.GeoJSON;

  constructor(props) {
    super(props);
    this.state = {
      direction: "up",
      median: 800,
      startDate: "2021-01-01",
      endDate: "2021-03-18",
      boundingBox: "",
      geoNamespace: "US_COUNTIES",
      zoom: 3,
    };
  }
  componentDidMount() {
    this.map = L.map('map');

    var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	    maxZoom: 19,
	    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    this.map.on('moveend', this.handleNewBoundingBox);
    this.map.on('load', this.handleNewBoundingBox);

    this.map.setView([39.82, -98.58], 3);

    osmLayer.addTo(this.map);

    
    fetch(`http://${window.location.hostname}:8081/map`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state)
    }).then((res) => {
      return res.json();
    }).then((j) => {
      this.geoJson = L.geoJSON(j)

      this.geoJson.bindPopup((layer) => {
        if(this.latestData[layer["feature"].properties["GEOID"]]) {
          return `${layer["feature"].properties["NAMELSAD"]}<br />Rate: ${this.latestData[layer["feature"].properties["GEOID"]].rate} MBPS<br />Samples: ${this.latestData[layer["feature"].properties["GEOID"]].samples}`;
        } else {
          return layer["feature"].properties["NAMELSAD"];
        }
      });
      
      this.geoJson.addTo(this.map);
    }).then(() => {
      //return this.updateRates();
    }).catch((err) => console.error(err));
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.geoNamespace !== this.state.geoNamespace) {
      this.geoJson.remove();

      fetch(`http://${window.location.hostname}:8081/map`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.state)
      }).then((res) => {
        return res.json();
      }).then((j) => {
        this.geoJson = L.geoJSON(j)

        this.geoJson.bindPopup((layer) => {
          if(this.latestData[layer["feature"].properties["GEOID"]]) {
            return `${layer["feature"].properties["NAMELSAD"]}<br />Rate: ${this.latestData[layer["feature"].properties["GEOID"]].rate} MBPS<br />Samples: ${this.latestData[layer["feature"].properties["GEOID"]].samples}`;
          } else {
            return layer["feature"].properties["NAMELSAD"];
          }
        });
        
        this.geoJson.addTo(this.map);
      }).then(() => {
        //return this.updateRates();
      }).catch((err) => console.error(err));
    }
  }

  updateRates() {
    return fetch(`http://${window.location.hostname}:8081/metrics`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        geoNamespace: this.state.geoNamespace,
        direction: this.state.direction,
        startDate: this.state.startDate,
        endDate: this.state.endDate,
        median: parseFloat(this.state.median.toString())
      })
    }).then((res) => {
      return res.json();
    }).then((result) => {
      this.latestData = result;
      this.geoJson.setStyle((feature) => {
        if(result[feature.properties["GEOID"]]) {
          let color = this.state.median > this.latestData[feature.properties["GEOID"]].rate ?
                "red" : "blue";
          return {
            color: color,
            fillOpacity: 0.7,
            weight: 1
          }
        } else {
          return {
            color: "gray",
            fillOpacity: 0.2,
            weight: 1
          };
        }
      });
    }).catch(err => console.error(err));
  }

  handleNewBoundingBox = () => {
    const bounds = this.map.getBounds();
    this.setState({
      boundingBox: bounds.toBBoxString(),
      zoom:     this.map.getZoom()
    });
  }

  handleChange = (name: string, value: string) => {
    this.setState({
      ...this.state,
      [name]: value
    });
  }

  handleInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.handleChange(evt.target.name, evt.target.value)
  }

  handleSelectChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    this.handleChange(evt.target.name, evt.target.value)
  }

  handleUpdate = () => {
    this.updateRates();
  }

  render() {
    return (
      <div>
        <div>
          <label htmlFor="geoNamespace">Choose a map:</label>
          <select name="geoNamespace" id="geoNamespace" onChange={this.handleSelectChange} value={this.state.geoNamespace}>
            <option value="US_COUNTIES">US Counties</option>
            <option value="US_TRIBAL_TRACTS">US Tribal Tracts</option>
          </select><br />
          <input type="radio" id="up" name="direction" onChange={this.handleInputChange} value="up" checked={this.state.direction === 'up'} />
            <label htmlFor="up">Up
          </label>
          <input type="radio" id="down" name="direction" onChange={this.handleInputChange} value="down" checked={this.state.direction === 'down'} />
            <label htmlFor="down">Down
          </label><br /><br />

          <label htmlFor="median">Median MBPS</label>
          <input type="number" id="median" name="median" onChange={this.handleInputChange} value={this.state.median} /><br />

          <label htmlFor="startDate">Start Date</label>
          <input type="date" id="startDate" name="startDate" onChange={this.handleInputChange} value={this.state.startDate} /><br />

          <label htmlFor="endDate">End Date</label>
          <input type="date" id="endDate" name="endDate" onChange={this.handleInputChange} value={this.state.endDate}  /><br />

          <button onClick={this.handleUpdate}>Update</button>
        </div>
        <div id="map" style={{height: "500px", width: "500px"}}></div>
      </div>
    );
  }
}