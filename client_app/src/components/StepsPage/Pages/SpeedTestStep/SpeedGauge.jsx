import {useEffect, useState} from "react";
import {Donut} from './gauge.min';
import * as ndt7 from "@m-lab/ndt7";
import {storeRunData} from "../../../../utils/storage";
import {sendRawData} from "../../../../utils/apiRequests";
import {notifyError} from "../../../../utils/errors";
import {LOCAL_STORAGE_KEY} from "../../../../constants";
import SpeedGaugeInterior from "./SpeedGaugeInterior";

const canvasWrapperStyle = {
  width: 250,
  height: 250,
  margin: 'auto',
  paddingTop: 40,
}

const commonDonutOptions = {
  angle: 0.25,
  lineWidth: 0.07,
  radiusScale: 1,
  limitMax: true,
  limitMin: true,
  generateGradient: true,
  highDpiSupport: true,
  strokeColor: '#E0DEEC',
}

const downloadOptions = {
  ...commonDonutOptions,
  colorStart: '#5154BB',
  colorStop: '#7ABCDD',
};

const uploadOptions = {
  ...commonDonutOptions,
  colorStart: '#D56DB7',
  colorStop: '#F6C464',
}

const SpeedGauge = ({
  setProgress,
  setLoss,
  setLatency,
  setDownloadValue,
  downloadValue,
  setUploadValue,
  uploadValue,
  location,
  storeRunData
}) => {

  let counter = 0;
  let downloadDonut;

  const [startTimestamp, setStartTimestamp] = useState('');
  const [loading, setLoading] = useState(true);
  const [runningTest, setRunningTest] = useState(false);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownload] = useState(true);
  const [rawData, setRawData] = useState([]);

  useEffect(() => {
    const downloadTarget = document.getElementById('gauge-canvas');
    downloadDonut = new Donut(downloadTarget).setOptions(downloadOptions);
    downloadDonut.maxValue = 100;
    downloadDonut.setMinValue(0);
    downloadDonut.animationSpeed = 10;
    downloadDonut.set(0);
    runSpeedTest();
  }, []);

  useEffect(() => {
    // check that at least one test has been triggered
    if (!loading && !runningTest && startTimestamp !== '') {
      finishTestRun(error ? -1 : 0, error);
    }
  }, [loading, runningTest, startTimestamp]);

  const finishTestRun = (exitCode, error) => {
    if (exitCode === 0) {
      storeRunData(startTimestamp);
      sendRawData(rawData, location, startTimestamp);
    } else {
      alert('Error running test!');
      notifyError(error);
    }
  };

  const normalizeValue = originalValue => {
    if(originalValue <= 20) {
      return originalValue * 2.5;
    } else if(originalValue > 20 && originalValue <= 30) {
      return originalValue * 2.4;
    } else if(originalValue > 30 && originalValue <= 50) {
      return originalValue * 1.7;
    } else if(originalValue > 50 && originalValue <= 60) {
      return originalValue * 1.4;
    } else if(originalValue > 60 && originalValue <= 80) {
      return originalValue * 1.2;
    } else if(originalValue > 80 && originalValue <= 90) {
      return originalValue * 1.05;
    } else {
      return originalValue;
    }
  }

  const saveDownloadValue = (data, rawData, donut) => {
    if (data.Source === 'client') {
      const mbps = data.Data.MeanClientMbps;
      donut.set(normalizeValue(mbps));
      setDownloadValue(mbps);
      counter += 2;
      setProgress(counter > 100 ? 100 : counter);
    }
    let currentData = rawData;
    currentData.push({ ...data, type: 'download' });
    setRawData(currentData);
  };

  const saveUploadValue = (data, rawData, donut) => {
    if (data.Source === 'client') {
      const mbps = data.Data.MeanClientMbps;
      donut.set(normalizeValue(mbps));
      setUploadValue(mbps);
      counter += 2;
      setProgress(counter > 100 ? 100 : counter);
    }
    let currentData = rawData;
    currentData.push({ ...data, type: 'upload' });
    setRawData(currentData);
  };

  const downloadComplete = (data, rawData, donut) => {
    counter = 0;
    setProgress(0);
    donut.set(normalizeValue(data.LastClientMeasurement.MeanClientMbps));
    setDownloadValue(data.LastClientMeasurement.MeanClientMbps);
    setLatency(data.LastServerMeasurement.TCPInfo.MinRTT / 1000);
    setLoss((data.LastServerMeasurement.TCPInfo.BytesRetrans / data.LastServerMeasurement.TCPInfo.BytesSent) * 100);
    let currentData = rawData;
    currentData.push({ ...data, type: 'download' });
    setRawData(currentData);
    donut.setOptions(uploadOptions);
    donut.set(0);
    setIsDownload(false);
  };

  const uploadComplete = (data, rawData, donut) => {
    counter = 100;
    setProgress(100);
    donut.set(normalizeValue((data.LastServerMeasurement.TCPInfo.BytesReceived / data.LastServerMeasurement.TCPInfo.ElapsedTime) * 8))
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
    setRunningTest(true);
    clearValues();
    const config = {
      userAcceptedDataPolicy: true,
      downloadWorkerFile: downloadWorkerUrl,
      uploadWorkerFile: uploadWorkerUrl,
      metadata: { client_name: 'ndt7-client' },
    };
    ndt7.test(config, {
      downloadComplete: data => downloadComplete(data, rawData, downloadDonut),
      downloadMeasurement: data => saveDownloadValue(data, rawData, downloadDonut),
      uploadComplete: data => uploadComplete(data, rawData, downloadDonut),
      uploadMeasurement: data => saveUploadValue(data, rawData, downloadDonut),
      error: err => {
        setLoading(false);
        setRunningTest(false);
        setError(err);
      },
    });
  };

  return (
    <div style={canvasWrapperStyle}>
      <canvas id={'gauge-canvas'} width={250} height={250}></canvas>
      <SpeedGaugeInterior currentValue={isDownloading ? downloadValue?.toFixed(2) : uploadValue?.toFixed(2)} isDownloading={isDownloading}/>
    </div>
  )
}

export default SpeedGauge;