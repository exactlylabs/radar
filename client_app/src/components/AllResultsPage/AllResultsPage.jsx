import React, { useEffect, useState } from 'react';
import { CircularProgress, Grid, Paper } from '@mui/material';
import { MyButton } from '../common/MyButton';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { STEPS } from '../../constants';
import SpeedResultsBox from './SpeedResultsBox';
import { Box } from '@mui/system';
import { DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD, SPEED_FILTERS } from '../../utils/speeds';
import { mapTileAttribution, mapTileUrl } from '../../utils/map';
import { getAllSpeedTests } from '../../utils/apiRequests';
import { MyMap } from '../common/MyMap';

const AllResultsPage = ({ givenLocation, setStep, maxHeight }) => {
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
    if (download_avg < DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.MID) return { color: 'red', fillColor: 'red' };
    else if (
      download_avg >= DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.MID &&
      download_avg < DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.HIGH
    )
      return { color: '#e2e22d', fillColor: '#e2e22d' };
    else return { color: 'green', fillColor: 'green' };
  };

  const getLimitBasedOnFilter = filter => {
    switch (filter) {
      case SPEED_FILTERS.LOW:
        return [0, DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.MID];
      case SPEED_FILTERS.MID:
        return [DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.MID, DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.HIGH];
      case SPEED_FILTERS.HIGH:
        return [DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.HIGH, Number.MAX_VALUE];
    }
  };

  const setFilter = filter => {
    setSelectedFilter(filter);
    if (!filter) {
      setFilteredResults(results);
      return;
    }
    const limit = getLimitBasedOnFilter(filter);
    setFilteredResults(results.filter(r => r.download_avg >= limit[0] && r.download_avg < limit[1]));
  };

  const goToSpeedTest = () => setStep(STEPS.SPEED_TEST);

  return (
    <div style={{ textAlign: 'center', paddingTop: 10, paddingBottom: 10 }}>
      {loading && <CircularProgress size={25} />}
      {!loading && error && <p>Error fetching results! Try again later.</p>}
      {!loading && results !== null && results.length === 0 && (
        <div>
          <p>No measurements taken so far!</p>
          <MyButton text={'Test'} onClick={goToSpeedTest} />
        </div>
      )}
      {!loading && results !== null && results.length > 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={10}>
            <Box component={Paper} style={{ padding: 10 }}>
              <MapContainer
                center={givenLocation ? givenLocation : [0,0]}
                zoom={givenLocation ? 20 : 2}
                scrollWheelZoom
                style={{ height: `calc(${maxHeight} - 170px`, margin: 'auto' }}
              >
                <MyMap />
                <TileLayer attribution={mapTileAttribution} url={mapTileUrl} />
                {filteredResults.map(measurement => (
                  <CircleMarker
                    key={measurement.id}
                    radius={5}
                    center={[measurement.latitude , measurement.longitude]}
                    pathOptions={getColor(measurement)}
                  >
                    <Popup>
                      {measurement.upload_avg !== null && measurement.upload_avg !== undefined ? (
                        <p>{`Upload: ${measurement.upload_avg.toFixed(3)} Mbps`}</p>
                      ) : (
                        <p>Upload: N/A</p>
                      )}
                      {measurement.download_avg !== null && measurement.download_avg !== undefined ? (
                        <p>{`Download: ${measurement.download_avg.toFixed(3)} Mbps`}</p>
                      ) : (
                        <p>Download: N/A</p>
                      )}
                      {measurement.loss !== null && measurement.loss !== undefined ? (
                        <p>{`Loss: ${measurement.loss}%`}</p>
                      ) : (
                        <p>Loss: N/A</p>
                      )}
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </Box>
          </Grid>
          <Grid item xs={12} md={2}>
            <SpeedResultsBox selectedFilter={selectedFilter} setSelectedFilter={setFilter} />
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default AllResultsPage;
