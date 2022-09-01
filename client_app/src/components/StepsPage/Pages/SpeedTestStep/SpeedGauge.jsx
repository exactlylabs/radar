import {useEffect, useState} from "react";
import {Donut} from '../../../../../vendor/lib/gauge';
import * as ndt7 from "@m-lab/ndt7";
import {sendRawData} from "../../../../utils/apiRequests";
import {notifyError} from "../../../../utils/errors";
import SpeedGaugeInterior from "./SpeedGaugeInterior";
import {normalizeValue} from "./utils/normalizer";
import {downloadWorkerUrl, runnerConfig, uploadWorkerUrl} from "../../../../utils/ndt7Tester";
import {useMobile} from "../../../../hooks/useMobile";

const canvasWrapperStyle = {
  width: 250,
  height: 250,
  margin: 'auto',
  paddingTop: 40,
}

const mobileCanvasWrapperStyle = {
  ...canvasWrapperStyle,
  paddingTop: 0,
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
  storeRunData,
  userStepData,
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
      sendRawData(rawData, startTimestamp, userStepData);
    } else {
      notifyError(error);
    }
  };

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
    setDownloadValue(null);
    setUploadValue(null);
    setLoss(null);
    setLatency(null);
    setRawData([]);
    setError(null);
  };

  const runSpeedTest = () => {
    setStartTimestamp(new Date().toISOString());
    if (runningTest) return;
    setRunningTest(true);
    clearValues();
    ndt7.test(runnerConfig, {
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

  const isMobile = useMobile();

  return (
    <div style={isMobile ? mobileCanvasWrapperStyle : canvasWrapperStyle}>
      <canvas id={'gauge-canvas'} width={250} height={250}></canvas>
      <SpeedGaugeInterior currentValue={isDownloading ? downloadValue?.toFixed(2) : uploadValue?.toFixed(2)} isDownloading={isDownloading}/>
    </div>
  )
}

export default SpeedGauge;