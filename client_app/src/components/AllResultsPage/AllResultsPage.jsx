import React, { useEffect, useState, useRef } from 'react';
import { MyTitle } from '../common/MyTitle';
import { CircularProgress, Grid, Paper, Typography } from '@mui/material';
import { MyButton } from '../common/MyButton';
import { STEPS } from '../../constants';
import SpeedResultsBox from './SpeedResultsBox';
import { Box } from '@mui/system';
import { DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD, SPEED_FILTERS, SPEED_THRESHOLD_COLORS } from '../../utils/speeds';
import { getAllSpeedTests } from '../../utils/apiRequests';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import './AllResultsPage.css';
import { notifyError } from '../../utils/errors';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const AllResultsPage = ({ setStep, maxHeight }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [geolocationLoading, setGeolocationLoading] = useState(true);
  const [filteredResults, setFilteredResults] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [location, setLocation] = useState();
  const [zoom, setZoom] = useState(15);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLocation([pos.coords.latitude, pos.coords.longitude]);
          setGeolocationLoading(false);
        },
        notifyError,
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
    getAllSpeedTests(setResults, setFilteredResults, setError, setResultsLoading);
  }, []);

  useEffect(() => {
    if (resultsLoading || geolocationLoading) return;
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: document.querySelector('.map-container'),
      style: 'mapbox://styles/eugedamm/cl6cpklwt002v14qz6eto3mjb',
      center: [location[1], location[0]],
      zoom: zoom,
    });
    createMarkers();
  }, [resultsLoading, geolocationLoading]);

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
    if (filteredResults) {
      for (const feature of filteredResults.features) {
        const el = document.createElement('div');
        el.className = 'all-results--marker';
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
      {resultsLoading && geolocationLoading && <CircularProgress size={25} />}
      {!resultsLoading && error && <p>Error fetching results! Try again later.</p>}
      {!resultsLoading && results !== null && results.features.length === 0 && (
        <div>
          <p>No measurements taken so far!</p>
          <MyButton text={'Test'} onClick={goToMap} />
        </div>
      )}
      {!resultsLoading && results !== null && results.features.length > 0 && (
        <div style={{ height: maxHeight - 150, width: '100%' }}>
          <div style={{ position: 'relative', top: 0, left: 0 }}>
            {geolocationLoading ? (
              <div style={{ height: maxHeight - 150, width: '100%' }}>
                <CircularProgress size={50} />
              </div>
            ) : (
              <div className="map-container" style={{ height: maxHeight - 150, margin: 'auto' }} />
            )}
          </div>
          <SpeedResultsBox selectedFilter={selectedFilter} setSelectedFilter={setFilter} />
        </div>
      )}
    </div>
  );
};

export default AllResultsPage;
