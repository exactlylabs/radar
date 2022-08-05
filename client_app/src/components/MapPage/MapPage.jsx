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
import { getGeocodedAddress, sendRawData } from '../../utils/apiRequests';
import { customMarker, mapTileAttribution, mapTileUrl, SMALL_SCREEN_MAP_HEIGHT } from '../../utils/map';
import { RESIZING_WIDTH_PX_LIMIT } from '../../utils/screenDimensions';

const MapPage = ({ manualAddress, maxHeight }) => {
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadValue, setDownloadValue] = useState(null);
  const [uploadValue, setUploadValue] = useState(null);
  const [runningTest, setRunningTest] = useState(false);
  const [historicalValues, setHistoricalValues] = useState(
    JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY))?.values ?? null
  );
  const [progress, setProgress] = useState(0);
  const [rawData, setRawData] = useState([]);
  const [loss, setLoss] = useState(0);
  const [latency, setLatency] = useState(0);
  const [startTimestamp, setStartTimestamp] = useState('');
  const [mapScreenHeight, setMapScreenHeight] = useState(`calc(${maxHeight} - 200px)`);

  let counter = 0;
  let observer;

  useEffect(() => {
    updateMapDimensions();
    window.addEventListener('resize', updateMapDimensions);
    if (manualAddress) {
      const formData = new FormData();
      formData.append('address', manualAddress);
      getGeocodedAddress(formData, setLoading, setLocation);
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

  useEffect(() => {
    // check that at least one test has been triggered
    if (!loading && !runningTest && startTimestamp !== '') {
      finishTestRun(error ? -1 : 0, error);
    }
  }, [loading, runningTest, startTimestamp]);

  const updateMapDimensions = () => {
    const height = window.innerWidth >= RESIZING_WIDTH_PX_LIMIT ? `calc(${maxHeight} - 200px)` : SMALL_SCREEN_MAP_HEIGHT;
    setMapScreenHeight(height);
  };

  const saveDownloadValue = (data, rawData) => {
    if (data.Source === 'client') {
      const mbps = data.Data.MeanClientMbps;
      setDownloadValue(mbps);
      counter += 1;
      setProgress(counter > 50 ? 50 : counter);
    }
    let currentData = rawData;
    currentData.push({ ...data, type: 'download' });
    setRawData(currentData);
  };

  const saveUploadValue = (data, rawData) => {
    if (data.Source === 'client') {
      const mbps = data.Data.MeanClientMbps;
      setUploadValue(mbps);
      counter += 1;
      setProgress(counter > 100 ? 100 : counter);
    }
    let currentData = rawData;
    currentData.push({ ...data, type: 'upload' });
    setRawData(currentData);
  };

  const downloadComplete = (data, rawData) => {
    counter = 50;
    setProgress(50);
    setDownloadValue(data.LastClientMeasurement.MeanClientMbps);
    setLatency(data.LastServerMeasurement.TCPInfo.MinRTT / 1000);
    setLoss((data.LastServerMeasurement.TCPInfo.BytesRetrans / data.LastServerMeasurement.TCPInfo.BytesSent) * 100);
    let currentData = rawData;
    currentData.push({ ...data, type: 'download' });
    setRawData(currentData);
  };

  const uploadComplete = (data, rawData) => {
    counter = 100;
    setProgress(100);
    setUploadValue(
      (data.LastServerMeasurement.TCPInfo.BytesReceived / data.LastServerMeasurement.TCPInfo.ElapsedTime) * 8
    );
    let currentData = rawData;
    currentData.push({ ...data, type: 'upload' });
    setRawData(currentData);
    setLoading(false);
    setRunningTest(false);
    setError(null);
  };

  const clearValues = () => {
    counter = 0;
    setRunningTest(true);
    setDownloadValue(null);
    setUploadValue(null);
    setDownloadValue(null);
    setUploadValue(null);
    setRawData([]);
    setError(null);
  };

  const finishTestRun = (exitCode, error) => {
    if (exitCode === 0) {
      storeRunData(
        {
          startTimestamp,
          downloadValue,
          uploadValue,
          location,
          loss,
          latency,
        },
        setHistoricalValues
      );
      sendRawData(rawData, location, startTimestamp);
    } else {
      alert('Error running test!');
      notifyError(error);
    }
  };

  let downloadWorkerUrl = URL.createObjectURL(
    new Blob(
      [
        '"undefined"==typeof WebSocket&&(global.WebSocket=require("isomorphic-ws"));const workerMain=function(e){"use strict";const n=e.data["///ndt/v7/download"],o=new WebSocket(n,"net.measurementlab.ndt.v7");let t=()=>(new Date).getTime();"undefined"!=typeof performance&&void 0!==performance.now&&(t=()=>performance.now()),downloadTest(o,postMessage,t)},downloadTest=function(e,n,o){e.onclose=function(){n({MsgType:"complete"})},e.onerror=function(e){n({MsgType:"error",Error:e})};let t=o(),s=t,a=0;e.onopen=function(){t=o(),s=t,a=0,n({MsgType:"start",Data:{ClientStartTime:t}})},e.onmessage=function(e){a+=void 0!==e.data.size?e.data.size:e.data.length;const r=o();r-s>250&&(n({MsgType:"measurement",ClientData:{ElapsedTime:(r-t)/1e3,NumBytes:a,MeanClientMbps:a/(r-t)*.008},Source:"client"}),s=r),"string"==typeof e.data&&n({MsgType:"measurement",ServerMessage:e.data,Source:"server"})}};"undefined"!=typeof self?self.onmessage=workerMain:void 0!==this?this.onmessage=workerMain:"undefined"!=typeof onmessage&&(onmessage=workerMain);',
      ],
      { type: 'text/javascript' }
    )
  );

  let uploadWorkerUrl = URL.createObjectURL(
    new Blob(
      [
        '"undefined"==typeof WebSocket&&(global.WebSocket=require("isomorphic-ws"));const workerMain=function(e){const n=e.data["///ndt/v7/upload"],t=new WebSocket(n,"net.measurementlab.ndt.v7");let o=()=>(new Date).getTime();"undefined"!=typeof performance&&void 0!==performance.now&&(o=()=>performance.now()),uploadTest(t,postMessage,o)},uploadTest=function(e,n,t){let o=!1;function r(s,a,i,u,f){if(o)return;const c=t();if(c>=i)return void e.close();const d=s.length>=8388608?1/0:16*s.length;f-e.bufferedAmount>=d&&(s=new Uint8Array(2*s.length));const m=7*s.length;if(e.bufferedAmount<m&&(e.send(s),f+=s.length),c>=u+250){const t=f-e.bufferedAmount,o=(c-a)/1e3;n({MsgType:"measurement",ClientData:{ElapsedTime:o,NumBytes:t,MeanClientMbps:8*t/1e6/o},Source:"client",Test:"upload"}),u=c}setTimeout((()=>r(s,a,i,u,f)),0)}e.onclose=function(){o||(o=!0,n({MsgType:"complete"}))},e.onerror=function(e){n({MsgType:"error",Error:e})},e.onmessage=function(e){void 0!==e.data&&n({MsgType:"measurement",Source:"server",ServerMessage:e.data})},e.onopen=function(){const e=new Uint8Array(8192),o=t(),s=o+1e4;n({MsgType:"start",Data:{StartTime:o/1e3,ExpectedEndTime:s/1e3}}),r(e,o,s,o,0)}};"undefined"!=typeof self?self.onmessage=workerMain:void 0!==this?this.onmessage=workerMain:"undefined"!=typeof onmessage&&(onmessage=workerMain);',
      ],
      { type: 'text/javascript' }
    )
  );

  const runSpeedTest = () => {
    setStartTimestamp(new Date().toISOString());
    if (runningTest) return;
    clearValues();
    const config = {
      userAcceptedDataPolicy: true,
      downloadWorkerFile: downloadWorkerUrl,
      uploadWorkerFile: uploadWorkerUrl,
      metadata: { client_name: 'ndt7-client' },
    };
    ndt7.test(config, {
      downloadComplete: data => downloadComplete(data, rawData),
      downloadMeasurement: data => saveDownloadValue(data, rawData),
      uploadComplete: data => uploadComplete(data, rawData),
      uploadMeasurement: data => saveUploadValue(data, rawData),
      error: err => {
        setLoading(false);
        setRunningTest(false);
        setError(err);
      },
    });
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
                  <TileLayer attribution={mapTileAttribution} url={mapTileUrl} />
                  <Marker position={location} icon={customMarker} />
                </MapContainer>
              </div>
            </Box>
          </Grid>
          <Grid item md={12} lg={6}>
            {!runningTest && (
              <MyButton
                text={
                  <>
                    <NetworkCheck style={{ marginRight: 3 }} />
                    <span>Run speed test</span>
                  </>
                }
                onClick={runSpeedTest}
                disabled={runningTest}
                style={{ width: '30%', margin: '10px auto' }}
              />
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
