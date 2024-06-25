import {createContext, useContext, useRef, useState} from "react";
import UserDataContext from "./UserData";
import * as ndt7 from "@m-lab/ndt7";
import {runnerConfig} from "../utils/ndt7Tester";
import {sendRawData} from "../utils/apiRequests";
import {storeRunData} from "../utils/storage";
import {notifyError} from "../utils/errors";
import ConfigContext from "./ConfigContext";
import {STEPS} from "../components/StepsPage/utils/steps";

/**
 * Custom context provider to expose shared config application-wide
 * and prevent prop-drilling.
 * @type {React.Context<{}>}
 */
const SpeedTestContext = createContext({});

export const SpeedTestContextProvider = ({children}) => {

  const {userData, setCurrentStep} = useContext(UserDataContext);
  const config = useContext(ConfigContext);

  const [speedTestData, setSpeedTestData] = useState({
    loading: false,
    startTimestamp: null,
    error: null,
    isRunning: false,
    counter: 0,
    runningTestType: 'download',
    disabled: true,
    testProgress: 0,
    loss: null,
    latency: null,
    downloadValue: null,
    uploadValue: null,
    rawData: [],
    autonomous_system: null,
  });

  const timestampRef = useRef(speedTestData.startTimestamp);
  const downloadRef = useRef(speedTestData.downloadValue);
  const uploadRef = useRef(speedTestData.uploadValue);
  const latencyRef = useRef(speedTestData.latency);
  const lossRef = useRef(speedTestData.loss);

  const setDisabled = disabled => setSpeedTestData(prevState => ({...prevState, disabled: disabled}));
  const setProgress = progress => setSpeedTestData(prevState => ({...prevState, testProgress: progress}));
  const setLoss = loss => setSpeedTestData(prevState => ({...prevState, loss: loss}));
  const setLatency = latency => setSpeedTestData(prevState => ({...prevState, latency: latency}));
  const setDownloadValue = download => setSpeedTestData(prevState => ({...prevState, downloadValue: download}));
  const setUploadValue = upload => setSpeedTestData(prevState => ({...prevState, uploadValue: upload}));
  const setRunningTestType = type => setSpeedTestData(prevState => ({...prevState, runningTestType: type}));
  const setCounter = counter => setSpeedTestData(prevState => ({...prevState, counter: counter}));
  const setIsRunning = isRunning => setSpeedTestData(prevState => ({...prevState, isRunning: isRunning}));
  const setRawData = data => setSpeedTestData(prevState => ({...prevState, rawData: data}));
  const setLoading = loading => setSpeedTestData(prevState => ({...prevState, loading: loading}));
  const setError = error => setSpeedTestData(prevState => ({...prevState, error: error}));
  const setStartTimestamp = timestamp => setSpeedTestData(prevState => ({...prevState, startTimestamp: timestamp}));
  const setAutonomousSystem = asn => setSpeedTestData(prevState => ({...prevState, autonomous_system: asn}));

  const clearValues = () => {
    setCounter(0);
    setDownloadValue(null);
    setUploadValue(null);
    setLoss(null);
    setLatency(null);
    setRawData([]);
    setError(null);
    setDisabled(true);
    setStartTimestamp(null);
    setIsRunning(false);
    setRunningTestType('download');
  }

  const runNdt7Test = () => {
    if(speedTestData.isRunning) return;
    clearValues();
    const startStamp = new Date().toISOString();
    setStartTimestamp(startStamp);
    timestampRef.current = startStamp;
    setIsRunning(true);
    setDisabled(false);
    ndt7.test(runnerConfig, {
      downloadComplete: downloadComplete,
      downloadMeasurement: saveDownloadValue,
      uploadComplete: uploadComplete,
      uploadMeasurement: saveUploadValue,
      error: err => {
        setLoading(false);
        setIsRunning(false);
        setError(err);
      },
    });
  }

  const saveDownloadValue = (data) => {
    if (data.Source === 'client') {
      const mbps = data.Data.MeanClientMbps;
      setDownloadValue(mbps);
      setCounter(prev => prev + 2);
      setProgress(speedTestData.counter > 100 ? 100 : speedTestData.counter);
    }
    let currentData = speedTestData.rawData;
    currentData.push({ ...data, type: 'download' });
    setRawData(currentData);
  };

  const saveUploadValue = (data) => {
    if (data.Source === 'client') {
      const mbps = data.Data.MeanClientMbps;
      setUploadValue(mbps);
      setCounter(prev => prev + 2);
      setProgress(speedTestData.counter > 100 ? 100 : speedTestData.counter);
    }
    let currentData = speedTestData.rawData;
    currentData.push({ ...data, type: 'upload' });
    setRawData(currentData);
  };

  const downloadComplete = (data) => {
    setCounter(0);
    setProgress(0);
    setRunningTestType('upload');
    if(data?.LastClientMeasurement?.MeanClientMbps) {
      downloadRef.current = data.LastClientMeasurement.MeanClientMbps;
      setDownloadValue(data.LastClientMeasurement.MeanClientMbps);
      latencyRef.current = data.LastServerMeasurement.TCPInfo.MinRTT / 1000;
      setLatency(data.LastServerMeasurement.TCPInfo.MinRTT / 1000);
      lossRef.current = (data.LastServerMeasurement.TCPInfo.BytesRetrans / data.LastServerMeasurement.TCPInfo.BytesSent) * 100;
      setLoss((data.LastServerMeasurement.TCPInfo.BytesRetrans / data.LastServerMeasurement.TCPInfo.BytesSent) * 100);
      let currentData = speedTestData.rawData;
      currentData.push({...data, type: 'download'});
      setRawData(currentData);
    }
  };

  const uploadComplete = async (data) => {
    setCounter(100);
    setProgress(100);
    let currentData = speedTestData.rawData;
    if(data?.LastServerMeasurement) {
      uploadRef.current = (data.LastServerMeasurement.TCPInfo.BytesReceived / data.LastServerMeasurement.TCPInfo.ElapsedTime) * 8;
      setUploadValue(
        (data.LastServerMeasurement.TCPInfo.BytesReceived / data.LastServerMeasurement.TCPInfo.ElapsedTime) * 8
      );
      currentData.push({...data, type: 'upload'});
    }
    setRawData(currentData);
    await finishRun();
  };

  const finishRun = async () => {
    try {
      const speedTest = await sendRawData(speedTestData.rawData, timestampRef.current, userData, config.clientId);
      setAutonomousSystem(speedTest.autonomous_system);
      const result = {
        id: speedTest.id,
        startTimestamp: timestampRef.current,
        downloadValue: downloadRef.current ?? 0.0,
        uploadValue: uploadRef.current ?? 0.0,
        loss: lossRef.current ?? 0.0,
        latency: latencyRef.current ?? 0.0,
        networkType: userData.networkType?.text ?? null,
        networkLocation: userData.networkLocation?.text ?? null,
        location: userData.address.coordinates,
        autonomous_system: speedTest.autonomous_system,
        ...userData.address,
      };
      storeRunData(result);
      setIsRunning(false);
      setCurrentStep(STEPS.SPEED_TEST_RESULTS);
    } catch (e) {
      notifyError(e);
    }
  };

  return (
    <SpeedTestContext.Provider value={{speedTestData, setDisabled, setProgress, setLoss, setLatency, setDownloadValue, setUploadValue, setRunningTestType, setCounter, setIsRunning, setLoading, setError, setStartTimestamp, setRawData, clearValues, runNdt7Test}}>
      {children}
    </SpeedTestContext.Provider>
  );
}

export default SpeedTestContext;