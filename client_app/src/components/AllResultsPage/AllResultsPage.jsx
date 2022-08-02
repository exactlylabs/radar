import React, { useEffect, useState, useRef } from 'react';
import { MyTitle } from '../common/MyTitle';
import { CircularProgress, Grid, Paper } from '@mui/material';
import { MyButton } from '../common/MyButton';
import { STEPS } from '../../constants';
import SpeedResultsBox from './SpeedResultsBox';
import { Box } from '@mui/system';
import { DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD, SPEED_FILTERS, SPEED_THRESHOLD_COLORS } from '../../utils/speeds';
import { getAllSpeedTests } from '../../utils/apiRequests';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import './AllResultsPage.css';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const AllResultsPage = ({ setStep, maxHeight }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filteredResults, setFilteredResults] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [location, setLocation] = useState([0, 0]);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    getAllSpeedTests(setResults, setFilteredResults, setError, setLoading);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: document.querySelector('.map-container'),
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [location[1], location[0]],
      zoom,
    });
    createMarkers();
  }, [loading]);

  useEffect(() => {
    if (!map.current) return;
    map.current.on('move', () => {
      const long = map.current.getCenter().lng.toFixed(4);
      const lat = map.current.getCenter().lat.toFixed(4);
      setZoom(map.current.getZoom().toFixed(2));
      setLocation([long, lat]);
    });
  });

  const createMarkers = () => {
    if (filteredResults && !loading) {
      for (const feature of filteredResults.features) {
        const el = document.createElement('div');
        el.className = 'marker';
        const markerColor = getColor(feature.properties);
        el.style.backgroundColor = markerColor;
        el.style.border = `solid 1px ${markerColor}`;
        new mapboxgl.Marker(el).setLngLat(feature.geometry.coordinates).addTo(map.current);
      }
    }
  };

  const getColor = measurement => {
    const { download_avg } = measurement;
    if (download_avg < DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.LOWEST) return SPEED_THRESHOLD_COLORS.LOWEST;
    else if (
      download_avg >= DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.LOWEST &&
      download_avg < DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.LOW
    )
      return SPEED_THRESHOLD_COLORS.LOW;
    else if (
      download_avg >= DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.LOW &&
      download_avg < DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.MID
    )
      return SPEED_THRESHOLD_COLORS.MID;
    else if (
      download_avg >= DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.MID &&
      download_avg < DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.HIGH
    )
      return SPEED_THRESHOLD_COLORS.HIGH;
    else return SPEED_THRESHOLD_COLORS.HIGHEST;
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
    setFilteredResults(results.features.filter(r => r.download_avg >= limit[0] && r.download_avg < limit[1]));
  };

  const goToMap = () => setStep(STEPS.MAP);

  return (
    <div style={{ textAlign: 'center' }}>
      <MyTitle text={'All results'} />
      {loading && <CircularProgress size={25} />}
      {!loading && error && <p>Error fetching results! Try again later.</p>}
      {!loading && results !== null && results.features.length === 0 && (
        <div>
          <p>No measurements taken so far!</p>
          <MyButton text={'Test'} onClick={goToMap} />
        </div>
      )}
      {!loading && results !== null && results.features.length > 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={10}>
            <Box component={Paper} style={{ padding: 10 }}>
              <div className="map-container" style={{ height: maxHeight - 150, margin: 'auto' }} />
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
