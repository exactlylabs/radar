import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
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
import './MapPage.css';
import { notifyError } from '../../utils/errors';
import { storeRunData } from '../../utils/storage';
import { getGeocodedAddress, sendRawData } from '../../utils/apiRequests';
import { customMarker, mapTileAttribution, mapTileUrl } from '../../utils/map';

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

  let counter = 0;

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    // check that at least one test has been triggered
    if (!loading && !runningTest && startTimestamp !== '') {
      finishTestRun(error ? -1 : 0, error);
    }
  }, [loading, runningTest, startTimestamp]);

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

  const downloadWorkerMinJs =
    'const workerMain=function(e){"use strict";const n=e.data["///ndt/v7/download"],t=new WebSocket(n,"net.measurementlab.ndt.v7");let o;o="undefined"!=typeof performance&&"function"==typeof performance.now?()=>performance.now():()=>Date.now(),downloadTest(t,postMessage,o)},downloadTest=function(e,n,t){e.onclose=function(){n({MsgType:"complete"})},e.onerror=function(e){n({MsgType:"error",Error:e.type})};let o=t(),s=o,a=0;e.onopen=function(){o=t(),s=o,a=0,n({MsgType:"start",Data:{ClientStartTime:o}})},e.onmessage=function(e){a+=void 0!==e.data.size?e.data.size:e.data.length;const r=t();r-s>250&&(n({MsgType:"measurement",ClientData:{ElapsedTime:(r-o)/1e3,NumBytes:a,MeanClientMbps:a/(r-o)*.008},Source:"client"}),s=r),"string"==typeof e.data&&n({MsgType:"measurement",ServerMessage:e.data,Source:"server"})}};"undefined"!=typeof self?self.onmessage=workerMain:void 0!==this?this.onmessage=workerMain:"undefined"!=typeof onmessage&&(onmessage=workerMain);\n';
  const uploadWorkerMinJs =
    'const workerMain=function(e){const n=e.data["///ndt/v7/upload"],t=new WebSocket(n,"net.measurementlab.ndt.v7");let o;o="undefined"!=typeof performance&&"function"==typeof performance.now?()=>performance.now():()=>Date.now(),uploadTest(t,postMessage,o)},uploadTest=function(e,n,t){let o=!1;function r(n,a,u,i,f){if(o)return;const c=t();if(c>=u)return e.close(),void s(f,e.bufferedAmount,a);const d=n.length>=8388608?1/0:16*n.length;f-e.bufferedAmount>=d&&(n=new Uint8Array(2*n.length));const m=7*n.length;e.bufferedAmount<m&&(e.send(n),f+=n.length),c>=i+250&&(s(f,e.bufferedAmount,a),i=c),setTimeout((()=>r(n,a,u,i,f)),0)}function s(e,o,r){const s=e-o,a=(t()-r)/1e3;n({MsgType:"measurement",ClientData:{ElapsedTime:a,NumBytes:s,MeanClientMbps:8*s/1e6/a},Source:"client",Test:"upload"})}e.onclose=function(){o||(o=!0,n({MsgType:"complete"}))},e.onerror=function(e){n({MsgType:"error",Error:e.type})},e.onmessage=function(e){void 0!==e.data&&n({MsgType:"measurement",Source:"server",ServerMessage:e.data})},e.onopen=function(){const e=new Uint8Array(8192),o=t(),s=o+1e4;n({MsgType:"start",Data:{StartTime:o/1e3,ExpectedEndTime:s/1e3}}),r(e,o,s,o,0)}};"undefined"!=typeof self?self.onmessage=workerMain:void 0!==this?this.onmessage=workerMain:"undefined"!=typeof onmessage&&(onmessage=workerMain);\n';

  const runSpeedTest = () => {
    setStartTimestamp(new Date().toISOString());
    if (runningTest) return;
    clearValues();
    const config = {
      userAcceptedDataPolicy: true,
      downloadWorkerFile: downloadWorkerMinJs,
      uploadWorkerFile: uploadWorkerMinJs,
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
              <MapContainer
                center={location}
                zoom={20}
                scrollWheelZoom
                style={{ height: maxHeight - 200, minWidth: 450, maxWidth: 800, margin: '20px auto' }}
              >
                <TileLayer attribution={mapTileAttribution} url={mapTileUrl} />
                <Marker position={location} icon={customMarker} />
              </MapContainer>
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
