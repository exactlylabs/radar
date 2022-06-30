import React, {useEffect, useState} from 'react';
import {MyTitle} from "../common/MyTitle";
import {CircularProgress, Grid, Paper} from "@mui/material";
import {MyButton} from "../common/MyButton";
import {CircleMarker, MapContainer, Popup, TileLayer} from "react-leaflet";
import {API_URL, STEPS} from "../../constants";
import SpeedResultsBox from './SpeedResultsBox';
import { Box } from '@mui/system';
import {DOWNLOAD_SPEED_LIMIT, SPEED_FILTERS} from "../../utils/speeds";
import {mapTileAttribution, mapTileUrl} from "../../utils/map";
import {getAllSpeedTests} from "../../utils/apiRequests";

const AllResultsPage = ({
  setStep,
  maxHeight
}) => {

  const [results, setResults] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filteredResults, setFilteredResults] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(null);

  useEffect(() => {
    getAllSpeedTests(setResults, setFilteredResults, setError, setLoading);
  }, []);

  const getColor = measurement => {
    const { download_avg } = measurement;
    if(download_avg < DOWNLOAD_SPEED_LIMIT.MID) return {color: 'red', fillColor: 'red'}
    else if(download_avg >= DOWNLOAD_SPEED_LIMIT.MID && download_avg < DOWNLOAD_SPEED_LIMIT.HIGH) return {color: '#e2e22d', fillColor: '#e2e22d'}
    else return {color: 'green', fillColor: 'green'}
  }

  const getLimitBasedOnFilter = filter => {
    switch(filter) {
      case SPEED_FILTERS.LOW: return [0, DOWNLOAD_SPEED_LIMIT.MID];
      case SPEED_FILTERS.MID: return [DOWNLOAD_SPEED_LIMIT.MID, DOWNLOAD_SPEED_LIMIT.HIGH];
      case SPEED_FILTERS.HIGH: return [DOWNLOAD_SPEED_LIMIT.HIGH, Number.MAX_VALUE];
    }
  }

  const setFilter = (filter) => {
    setSelectedFilter(filter);
    if(!filter) {
      setFilteredResults(results);
      return;
    }
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
        // TODO: REPORT ERROR TO SENTRY
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
                  attribution={mapTileAttribution}
                  url={mapTileUrl}
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
                    </CircleMarker>
                  ))
                }
              </MapContainer>
            </Box>
          </Grid>
          <Grid item xs={12} md={2}>
            <SpeedResultsBox selectedFilter={selectedFilter} setSelectedFilter={setFilter} />
          </Grid>
        </Grid>
      }
    </div>
  );
}

export default AllResultsPage;