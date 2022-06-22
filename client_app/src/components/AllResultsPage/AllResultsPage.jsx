import React, {useEffect, useState} from 'react';
import {MyTitle} from "../common/MyTitle";
import {CircularProgress, Grid, Paper} from "@mui/material";
import {MyButton} from "../common/MyButton";
import {CircleMarker, MapContainer, Popup, TileLayer} from "react-leaflet";
import {API_URL, SPEED_FILTERS, STEPS} from "../../constants";
import SpeedResultsBox from './SpeedResultsBox';
import { Box } from '@mui/system';

const AllResultsPage = ({
  setStep,
  maxHeight
}) => {

  const [results, setResults] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filteredResults, setFilteredResults] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(null);

  useEffect(() => {
    // FETCH ALL RESULTS FROM BACKEND
    setLoading(true);
    fetch(`${API_URL}/raw`)
    .then(res => res.json())
    .then(res => {
      setResults(res); setFilteredResults(res);
    })
    .catch(err => setError(err))
    .finally(() => setLoading(false));
  }, []);

  const getColor = measurement => {
    const { download_avg } = measurement;
    if(download_avg < 15) return {color: 'red', fillColor: 'red'}
    else if(download_avg >= 15 && download_avg < 30) return {color: '#e2e22d', fillColor: '#e2e22d'}
    else return {color: 'green', fillColor: 'green'}
  }

  const getLimitBasedOnFilter = filter => {
    switch(filter) {
      case SPEED_FILTERS.LOW: return [0, 15];
      case SPEED_FILTERS.MID: return [15, 30];
      case SPEED_FILTERS.HIGH: return [30, Number.MAX_VALUE];
    }
  }

  const setFilter = (filter) => {
    if(!filter || filter === selectedFilter) {
      setSelectedFilter(null);
      setFilteredResults(results);
      return;
    }
    setSelectedFilter(filter);
    const limit = getLimitBasedOnFilter(filter);
    setFilteredResults(results.filter(r => r.download_avg >= limit[0] && r.download_avg < limit[1]))
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
          <MyButton text={'Test'} onClick={() => setStep(STEPS.MAP)}/>
        </div>
      }
      {
        !loading && results !== null && results.length > 0 &&
        <Grid container spacing={2}>
          <Grid item xs={12} md={10}>
            <Box component={Paper} style={{padding: 10}}>
              <MapContainer 
                center={[0, 0]} 
                zoom={2} 
                scrollWheelZoom 
                style={{height: maxHeight - 150, margin: 'auto'}}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {
                  filteredResults.map(measurement => (
                    <CircleMarker 
                      key={measurement.id} 
                      radius={5} 
                      center={[measurement.latitude, measurement.longitude]} 
                      pathOptions={getColor(measurement)}
                    >
                      <Popup>
                        <p>{`Upload: ${measurement.upload_avg.toFixed(3)} Mbps`}</p>
                        <p>{`Download: ${measurement.download_avg.toFixed(3)} Mbps`}</p>
                        <p>{`Loss: ${measurement.loss}%`}</p>
                      </Popup>
                    </CircleMarker>))
                }
              </MapContainer>
            </Box>
          </Grid>
          <Grid item xs={12} md={2}>
            <SpeedResultsBox setFilter={setFilter} />
          </Grid>
        </Grid>
      }
    </div>
  );
}

export default AllResultsPage;