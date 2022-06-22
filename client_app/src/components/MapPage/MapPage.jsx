import {useEffect, useState} from 'react';
import L from "leaflet";
import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import {MyButton} from "../common/MyButton";
import * as ndt7 from '@m-lab/ndt7/src/ndt7';
import {CircularProgress, Grid, Paper} from "@mui/material";
import HistoricalValuesTable from "./HistoricalValuesTable";
import {API_URL, LOCAL_STORAGE_KEY} from "../../constants";
import {MyTitle} from "../common/MyTitle";
import { NetworkCheck } from '@mui/icons-material';
import { Box } from '@mui/system';
import RunningTest from './RunningTest';
import TestAverages from './TestAverages';
import './MapPage.css';

const tableWrapperStyle = {
  textAlign: 'center',
  margin: '20px auto 10px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '25%',
  maxWidth: 975,
  minWidth: 300
};

const MapPage = ({ manualAddress, maxHeight }) => {

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadValue, setDownloadValue] = useState(null);
  const [uploadValue, setUploadValue] = useState(null);
  const [runningTest, setRunningTest] = useState(false);
  const [historicalValues, setHistoricalValues] = useState(JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY))?.values ?? null)
  const [downloadAvgState, setDownloadAvgState] = useState(null);
  const [uploadAvgState, setUploadAvgState] = useState(null);
  const [progress, setProgress] = useState(0);

  let downloadValues = [];
  let uploadValues = [];
  let downloadAvg = null;
  let uploadAvg = null;
  let latency = null;
  let loss = null;
  let rawData = [];
  let dclientCount = 0;
  let uclientCount = 0;
  let startTimestamp = '';

  const customMarker = new L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [10, 41],
    popupAnchor: [2, -40]
  });

  useEffect(() => {
    if(manualAddress) {
      const formData = new FormData();
      formData.append('address', manualAddress);
      fetch(`${API_URL}/geocode`, {
        method: 'POST',
        body: formData,
      })
        .then(res => res.json())
        .then(res => {
          setLoading(false);
          setLocation(res);
        })
        .catch(err => {
          setLoading(false);
          console.error(err);
        })
    } else if('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLocation([pos.coords.latitude, pos.coords.longitude]);
          setLoading(false);
        },
        err => console.error(err),
        {enableHighAccuracy: true, timeout: 5000, maximumAge: 0}
      );
    }
  }, []);

  const saveDownloadValue = (data) => {
    if(data.Source === 'client') {
      const mbps = data.Data.MeanClientMbps;
      setDownloadValue(mbps);
      downloadValues = [...downloadValues, mbps];
      dclientCount++;
      setProgress(dclientCount > 50 ? 50 : dclientCount);
    }
    rawData = [...rawData, data];
  }

  const saveUploadValue = (data) => {
    if(data.Source === 'client') {
      const mbps = data.Data.MeanClientMbps;
      setUploadValue(mbps);
      uploadValues = [...uploadValues, mbps];
      uclientCount++;
      setProgress(50 + uclientCount > 100 ? 100 : 50 + uclientCount)
    }
    rawData = [...rawData, data];
  }

  const calculateDownloadAvg = (data) => {
    setProgress(50);
    downloadAvg = data.LastClientMeasurement.MeanClientMbps;
    latency = data.LastServerMeasurement.TCPInfo.MinRTT / 1000;
    loss = data.LastServerMeasurement.TCPInfo.BytesRetrans / data.LastServerMeasurement.TCPInfo.BytesSent * 100;
    setDownloadAvgState(downloadAvg);
    rawData = [...rawData, data];
  }

  const calculateUploadAvg = (data) => {
    setProgress(100);
    uploadAvg = (data.LastServerMeasurement.TCPInfo.BytesReceived / data.LastServerMeasurement.TCPInfo.ElapsedTime * 8);
    setUploadAvgState(uploadAvg);
    rawData = [...rawData, data];
  }

  const clearValues = () => {
    setRunningTest(true);
    downloadValues = [];
    uploadValues = [];
    downloadAvg = null;
    uploadAvg = null;
    setDownloadValue(null);
    setUploadValue(null);
    rawData = [];
  }

  const storeRunData = () => {
    const currentValue = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    const newMeasurement = {
      timestamp: startTimestamp,
      download: downloadAvg,
      upload: uploadAvg,
      lat: location[0],
      long: location[1],
      loss,
      latency,
    };
    let values = [];
    if(currentValue) {
      const json = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY));
      values = [...json.values];
    }
    values = [newMeasurement, ...values]; // prepend to have the array sorted since creation by date desc
    const newValues = JSON.stringify({values});
    window.localStorage.setItem(LOCAL_STORAGE_KEY, newValues);
    setHistoricalValues(values);
  }

  const sendRawData = () => {
    fetch(`${API_URL}/raw`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        raw: rawData,
        location: location,
        timestamp: startTimestamp
      })
    })
      .then(res => console.log('raw data sent!'))
      .catch(err => console.error(err));
    console.log('Send >> ', rawData);
  }

  const finishTestRun = (exitCode) => {
    setRunningTest(false);
    if(exitCode === 0) {
      storeRunData();
      sendRawData();
    } else {
      alert('Error running test!');
    }
  }

  const downloadMin = `const workerMain=function(e){"use strict";const n=e.data["///ndt/v7/download"],t=new WebSocket(n,"net.measurementlab.ndt.v7");let o;o="undefined"!=typeof performance&&"function"==typeof performance.now?()=>performance.now():()=>Date.now(),downloadTest(t,postMessage,o)},downloadTest=function(e,n,t){e.onclose=function(){n({MsgType:"complete"})},e.onerror=function(e){n({MsgType:"error",Error:e.type})};let o=t(),s=o,a=0;e.onopen=function(){o=t(),s=o,a=0,n({MsgType:"start",Data:{ClientStartTime:o}})},e.onmessage=function(e){a+=void 0!==e.data.size?e.data.size:e.data.length;const r=t();r-s>250&&(n({MsgType:"measurement",ClientData:{ElapsedTime:(r-o)/1e3,NumBytes:a,MeanClientMbps:a/(r-o)*.008},Source:"client"}),s=r),"string"==typeof e.data&&n({MsgType:"measurement",ServerMessage:e.data,Source:"server"})}};"undefined"!=typeof self?self.onmessage=workerMain:void 0!==this?this.onmessage=workerMain:"undefined"!=typeof onmessage&&(onmessage=workerMain);`
  const uploadMin = `const workerMain=function(e){const n=e.data["///ndt/v7/upload"],t=new WebSocket(n,"net.measurementlab.ndt.v7");let o;o="undefined"!=typeof performance&&"function"==typeof performance.now?()=>performance.now():()=>Date.now(),uploadTest(t,postMessage,o)},uploadTest=function(e,n,t){let o=!1;function r(n,a,u,i,f){if(o)return;const c=t();if(c>=u)return e.close(),void s(f,e.bufferedAmount,a);const d=n.length>=8388608?1/0:16*n.length;f-e.bufferedAmount>=d&&(n=new Uint8Array(2*n.length));const m=7*n.length;e.bufferedAmount<m&&(e.send(n),f+=n.length),c>=i+250&&(s(f,e.bufferedAmount,a),i=c),setTimeout((()=>r(n,a,u,i,f)),0)}function s(e,o,r){const s=e-o,a=(t()-r)/1e3;n({MsgType:"measurement",ClientData:{ElapsedTime:a,NumBytes:s,MeanClientMbps:8*s/1e6/a},Source:"client",Test:"upload"})}e.onclose=function(){o||(o=!0,n({MsgType:"complete"}))},e.onerror=function(e){n({MsgType:"error",Error:e.type})},e.onmessage=function(e){void 0!==e.data&&n({MsgType:"measurement",Source:"server",ServerMessage:e.data})},e.onopen=function(){const e=new Uint8Array(8192),o=t(),s=o+1e4;n({MsgType:"start",Data:{StartTime:o/1e3,ExpectedEndTime:s/1e3}}),r(e,o,s,o,0)}};"undefined"!=typeof self?self.onmessage=workerMain:void 0!==this?this.onmessage=workerMain:"undefined"!=typeof onmessage&&(onmessage=workerMain);`

  const runSpeedTest = () => {
    startTimestamp = new Date().toISOString();
    if(runningTest) return;
    clearValues();
    const config = {
      userAcceptedDataPolicy: true,
      downloadWorkerFile: downloadMin,
      uploadWorkerFile: uploadMin,
      metadata: { client_name: 'ndt7-client' }
    };
    ndt7
      .test(config, {
        downloadComplete: calculateDownloadAvg,
        downloadMeasurement: saveDownloadValue,
        uploadComplete: calculateUploadAvg,
        uploadMeasurement: saveUploadValue,
        error: err => { console.error(err); setRunningTest(false); },
      })
      .then(exitCode => { finishTestRun(exitCode, rawData); setRunningTest(false) });
  }

  return (
    <div style={{margin: 10, textAlign: 'center'}}>
      { loading && 
        <div>
          <MyTitle text={'Loading location data...'}/>
          <CircularProgress text={'Loading...'}/> 
        </div>
      }
      { !loading && !location && <MyTitle text={'Error!'}/> }
      {
        !loading && location !== null &&
        <Grid container spacing={2}>
          <Grid item md={12} lg={6} style={{marginLeft: 'auto', marginRight: 'auto'}}>
            <Box component={Paper} style={{padding: 10}}>
              <MapContainer
                center={location}
                zoom={20}
                scrollWheelZoom
                style={{height: maxHeight - 200, minWidth: 450, maxWidth: 800, margin: '20px auto'}}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={location} icon={customMarker}>
                  <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                  </Popup>
                </Marker>
              </MapContainer
              >
            </Box>
          </Grid>
          <Grid item md={12} lg={6}>
            {
              !runningTest &&
              <MyButton
                text={<>
                  <NetworkCheck style={{marginRight: 3}}/>
                  <span>Run speed test</span>
                </>}
                onClick={runSpeedTest}
                disabled={runningTest}
                style={{width: '30%', margin: '10px auto'}}
              />
            }
            { runningTest && <RunningTest downloadValue={downloadValue} uploadValue={uploadValue} progress={progress}/> }
            {
              !runningTest && uploadAvgState !== null && downloadAvgState !== null &&
              <TestAverages uploadAvg={uploadAvgState} downloadAvg={downloadAvgState}/>
            }
            <HistoricalValuesTable values={historicalValues}/>
          </Grid>
        </Grid>
      }
    </div>
  );
}

export default MapPage;