import {useEffect, useState} from 'react';
import L from "leaflet";
import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import {MyButton} from "../common/MyButton";
import * as ndt7 from '@m-lab/ndt7/src/ndt7';
import {CircularProgress, Container} from "@mui/material";
import HistoricalValuesTable from "./HistoricalValuesTable";
import {API_URL, LOCAL_STORAGE_KEY} from "../../constants";

const MapPage = ({ manualAddress }) => {

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
      fetch(`${API_URL}/geocode/`, {
        method: 'POST',
        headers: { 'Access-Control-Allow-Origin': '*' },
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
      timestamp: new Date().toISOString(),
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
    /*fetch(`${API_URL}/raw`, {
      method: 'POST',
      body: rawData
    })
      .then(res => console.log('raw data sent!'))
      .catch(err => console.error(err));*/
    console.log('Send >> ', rawData);
  }

  const finishTestRun = (exitCode) => {
    setRunningTest(false);
    console.log(dclientCount, uclientCount);
    if(exitCode === 0) {
      storeRunData();
      sendRawData();
    } else {
      alert('Error running test!');
    }
  }

  const runSpeedTest = () => {
    if(runningTest) return;
    clearValues();
    const config = {
      userAcceptedDataPolicy: true,
      downloadWorkerFile: '@m-lab/ndt7/src/ndt7-download-worker.js',
      uploadWorkerFile: '@m-lab/ndt7/src/ndt7-upload-worker.js',
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
    <div>
      { loading && <div style={{fontSize: 50, textAlign: "center"}}>Loading...</div>}
      { !loading && !location && <div style={{fontSize: 30, textAlign: "center"}}>Error!</div> }
      {
        !loading && location !== null &&
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <MapContainer center={location} zoom={20} scrollWheelZoom style={{height: 500, width: 500, margin: 'auto'}}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={location} icon={customMarker}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
          </MapContainer>
          <Container style={{textAlign: 'center', marginTop: 20, display: 'flex', flexDirection: 'column'}}>
            {
              !runningTest &&
              <MyButton
                text={'Run speed test'}
                onClick={runSpeedTest}
                disabled={runningTest}
              />
            }
            {
              runningTest &&
              <div>
                <CircularProgress variant="determinate" size={100} value={progress}/>
                <div style={{position: 'relative', display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly'}}>
                  {downloadValue !== null && uploadValue === null && <p>{`Download: ${downloadValue.toFixed(3)} mbps`}</p>}
                  {uploadValue !== null && <p>{`Upload: ${uploadValue.toFixed(3)} mbps`}</p>}
                </div>
              </div>
            }
            {
              !runningTest && downloadAvgState !== null && uploadAvgState !== null &&
              <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly'}}>
                <p>{`Download avg: ${downloadAvgState.toFixed(3)} mbps`}</p>
                <p>{`Upload avg: ${uploadAvgState.toFixed(3)} mbps`}</p>
              </div>
            }
            <HistoricalValuesTable values={historicalValues}/>
          </Container>
        </div>
      }
    </div>
  );
}

export default MapPage;