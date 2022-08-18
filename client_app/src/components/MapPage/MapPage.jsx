import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MyButton } from '../common/MyButton';
import * as ndt7 from '@m-lab/ndt7/src/ndt7';
import { CircularProgress, Grid, Paper } from '@mui/material';
import HistoricalValuesTable from './HistoricalValuesTable';
import { LOCAL_STORAGE_KEY } from '../../constants';
import { MyTitle } from '../common/MyTitle';
import { NetworkCheck } from '@mui/icons-material';
import { Box } from '@mui/system';
import RunningTest from './RunningTest';
import TestAverages from './TestAverages';
import { notifyError } from '../../utils/errors';
import { storeRunData } from '../../utils/storage';
import { sendRawData } from '../../utils/apiRequests';
import { customMarker, mapTileAttribution, mapTileUrl, SMALL_SCREEN_MAP_HEIGHT } from '../../utils/map';
import { RESIZING_WIDTH_PX_LIMIT } from '../../utils/screenDimensions';
import { MyMap } from '../common/MyMap';

const MapPage = ({ manualAddress, givenLocation, maxHeight }) => {

  const [location, setLocation] = useState(null);
  const [mapScreenHeight, setMapScreenHeight] = useState(`calc(${maxHeight} - 200px)`);


  let observer;

  useEffect(() => {
    updateMapDimensions();
    window.addEventListener('resize', updateMapDimensions);
    if (manualAddress) {
      setLoading(false);
      setLocation(givenLocation);
    } else if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLocation([pos.coords.latitude, pos.coords.longitude]);
          setLoading(false);
        },
        notifyError,
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    return () => {
      window.removeEventListener('resize', updateMapDimensions);
    };
  }, []);



  const updateMapDimensions = () => {
    const height = window.innerWidth >= RESIZING_WIDTH_PX_LIMIT ? `calc(${maxHeight} - 200px)` : SMALL_SCREEN_MAP_HEIGHT;
    setMapScreenHeight(height);
  };





  return (
    <div style={{ margin: 10, textAlign: 'center' }}>
      {loading && (
        <div>
          <MyTitle text={'Loading location data...'} />
          <CircularProgress text={'Loading...'} />
        </div>
      )}
      {!loading && !location && <MyTitle text={'Error!'} />}
      {!loading && location !== null && (
        <Grid container spacing={2}>
          <Grid item md={12} lg={6} style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            <Box component={Paper} style={{ padding: 10 }}>
              <div style={{ height: mapScreenHeight }}>
                <MapContainer
                  center={location}
                  zoom={20}
                  scrollWheelZoom
                  style={{ height: '100%', minWidth: 450, maxWidth: 800, margin: '20px auto' }}
                >
                  <MyMap />
                  <TileLayer attribution={mapTileAttribution} url={mapTileUrl} />
                  <Marker position={location} icon={customMarker} />
                </MapContainer>
              </div>
            </Box>
          </Grid>
          <Grid item md={12} lg={6}>
            {!runningTest && (
              <div style={{ width: 'max-content', margin: '10px auto' }}>
                <MyButton
                  text={
                    <>
                      <NetworkCheck style={{ marginRight: 3 }} />
                      <span>Run speed test</span>
                    </>
                  }
                  onClick={runSpeedTest}
                  disabled={runningTest}
                />
              </div>
            )}
            {runningTest && <RunningTest downloadValue={downloadValue} uploadValue={uploadValue} progress={progress} />}
            {!runningTest && uploadValue !== null && downloadValue !== null && (
              <TestAverages uploadAvg={uploadValue} downloadAvg={downloadValue} />
            )}
            <HistoricalValuesTable values={historicalValues} />
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default MapPage;
