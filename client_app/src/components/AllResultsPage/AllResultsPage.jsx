import React, {useEffect, useState} from 'react';
import {MyTitle} from "../common/MyTitle";
import {CircularProgress} from "@mui/material";
import {MyButton} from "../common/MyButton";
import {CircleMarker, MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import L from "leaflet";
import {API_URL} from "../../constants";

const AllResultsPage = ({
  setStep,
  maxHeight
}) => {

  const [results, setResults] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // FETCH ALL RESULTS FROM BACKEND
    setLoading(true);
    fetch(`${API_URL}/raw`)
    .then(res => res.json())
    .then(res => setResults(res))
    .catch(err => setError(err))
    .finally(() => setLoading(false));
  }, []);

  const getColor = measurement => {
    const { download_avg } = measurement;
    if(download_avg < 15) return {color: 'red', fillColor: 'red'}
    else if(download_avg >= 15 && download_avg < 30) return {color: 'yellow', fillColor: 'yellow'}
    else return {color: 'green', fillColor: 'green'}
  }

  return (
    <div style={{textAlign: 'center'}}>
      <MyTitle text={'All results'}/>
      {
        loading && <CircularProgress size={25} />
      }
      {
        !loading && error && <p>Error fetching results! Try again later.</p>
      }
      {
        !loading && results !== null && results.length === 0 &&
        <div>
          <p>No measurements taken so far!</p>
          <MyButton text={'Test'} onClick={() => setStep('map')}/>
        </div>
      }
      {
        !loading && results !== null && results.length > 0 &&
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <MapContainer center={[0, 0]} zoom={1} scrollWheelZoom style={{height: maxHeight - 150, width: '100%', maxWidth: 800, margin: 'auto'}}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {
              results.map(measurement => (
                <CircleMarker key={measurement.id} radius={5} center={[measurement.latitude, measurement.longitude]} pathOptions={getColor(measurement)}>
                  <Popup>
                    <p>{`Upload: ${measurement.upload_avg} Mbps`}</p>
                    <p>{`Download: ${measurement.download_avg} Mbps`}</p>
                    <p>{`Loss: ${measurement.loss}%`}</p>
                  </Popup>
                </CircleMarker>))
            }
          </MapContainer>
        </div>
      }
    </div>
  );
}

export default AllResultsPage;