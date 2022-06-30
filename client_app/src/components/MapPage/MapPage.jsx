import React, {useEffect, useState} from 'react';
import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import {MyButton} from "../common/MyButton";
import * as ndt7 from '@m-lab/ndt7/src/ndt7';
import {CircularProgress, Grid, Paper} from "@mui/material";
import HistoricalValuesTable from "./HistoricalValuesTable";
import {LOCAL_STORAGE_KEY} from "../../constants";
import {MyTitle} from "../common/MyTitle";
import { NetworkCheck } from '@mui/icons-material';
import { Box } from '@mui/system';
import RunningTest from './RunningTest';
import TestAverages from './TestAverages';
import './MapPage.css';
import {notifyError} from "../../utils/errors";
import {storeRunData} from "../../utils/storage";
import { getGeocodedAddress, sendRawData } from "../../utils/apiRequests";
import {customMarker, mapTileAttribution, mapTileUrl} from "../../utils/map";

const MapPage = ({ manualAddress, maxHeight }) => {

  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadValue, setDownloadValue] = useState(null);
  const [uploadValue, setUploadValue] = useState(null);
  const [runningTest, setRunningTest] = useState(false);
  const [historicalValues, setHistoricalValues] = useState(JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY))?.values ?? null)
  const [progress, setProgress] = useState(0);
  const [rawData, setRawData] = useState([]);
  const [loss, setLoss] = useState(0);
  const [latency, setLatency] = useState(0);
  const [startTimestamp, setStartTimestamp] = useState('');

  let counter = 0;

  useEffect(() => {
    if(manualAddress) {
      const formData = new FormData();
      formData.append('address', manualAddress);
      getGeocodedAddress(formData, setLoading, setLocation);
    } else if('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLocation([pos.coords.latitude, pos.coords.longitude]);
          setLoading(false);
        },
        notifyError,
        {enableHighAccuracy: true, timeout: 5000, maximumAge: 0}
      );
    }
  }, []);

  useEffect(() => {
    // check that at least one test has been triggered
    if(!loading && !runningTest && startTimestamp !== '') {
      finishTestRun(error ? -1 : 0, error);
    }
  }, [loading, runningTest, startTimestamp]);

  const saveDownloadValue = (data, rawData) => {
    if(data.Source === 'client') {
      const mbps = data.Data.MeanClientMbps;
      setDownloadValue(mbps);
      counter += 1;
      setProgress(counter > 50 ? 50 : counter);
    }
    let currentData = rawData;
    currentData.push({...data, type: 'download'});
    setRawData(currentData);
  }

  const saveUploadValue = (data, rawData) => {
    if(data.Source === 'client') {
      const mbps = data.Data.MeanClientMbps;
      setUploadValue(mbps);
      counter += 1;
      setProgress(counter > 100 ? 100 : counter)
    }
    let currentData = rawData;
    currentData.push({...data, type: 'upload'});
    setRawData(currentData);
  }

  const downloadComplete = (data, rawData) => {
    counter = 50;
    setProgress(50);
    setDownloadValue(data.LastClientMeasurement.MeanClientMbps);
    setLatency(data.LastServerMeasurement.TCPInfo.MinRTT / 1000);
    setLoss(data.LastServerMeasurement.TCPInfo.BytesRetrans / data.LastServerMeasurement.TCPInfo.BytesSent * 100);
    let currentData = rawData;
    currentData.push({...data, type: 'download'});
    setRawData(currentData);
  }

  const uploadComplete = (data, rawData) => {
    counter = 100;
    setProgress(100);
    setUploadValue(data.LastServerMeasurement.TCPInfo.BytesReceived / data.LastServerMeasurement.TCPInfo.ElapsedTime * 8);
    let currentData = rawData;
    currentData.push({...data, type: 'upload'});
    setRawData(currentData);
    setLoading(false);
    setRunningTest(false);
    setError(null);
  }

  const clearValues = () => {
    counter = 0;
    setRunningTest(true);
    setDownloadValue(null);
    setUploadValue(null);
    setDownloadValue(null);
    setUploadValue(null);
    setRawData([]);
    setError(null);
  }

  const finishTestRun = (exitCode, error) => {
    if(exitCode === 0) {
      storeRunData({
        startTimestamp,
        downloadValue,
        uploadValue,
        location,
        loss,
        latency
      }, setHistoricalValues);
      sendRawData(rawData, location, startTimestamp);
    } else {
      alert('Error running test!');
      notifyError(error);
    }
  }

  const runSpeedTest = () => {
    setStartTimestamp(new Date().toISOString());
    if(runningTest) return;
    clearValues();
    const config = {
      userAcceptedDataPolicy: true,
      downloadWorkerFile: '../../ndt7/ndt7-download-worker.js',
      uploadWorkerFile: '../../ndt7/ndt7-upload-worker.js',
      metadata: { client_name: 'ndt7-client' }
    };
    ndt7
      .test(config, {
        downloadComplete: data => downloadComplete(data, rawData),
        downloadMeasurement: data => saveDownloadValue(data, rawData),
        uploadComplete: data => uploadComplete(data, rawData),
        uploadMeasurement: data => saveUploadValue(data, rawData),
        error: err => {setLoading(false); setRunningTest(false); setError(err);},
      });
  }

  return (
    <div style={{margin: 10, textAlign: 'center'}}>
      {
        loading &&
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
                <TileLayer attribution={mapTileAttribution} url={mapTileUrl} />
                <Marker position={location} icon={customMarker}/>
              </MapContainer>
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
              !runningTest && uploadValue !== null && downloadValue !== null &&
              <TestAverages uploadAvg={uploadValue} downloadAvg={downloadValue}/>
            }
            <HistoricalValuesTable values={historicalValues}/>
          </Grid>
        </Grid>
      }
    </div>
  );
}

export default MapPage;