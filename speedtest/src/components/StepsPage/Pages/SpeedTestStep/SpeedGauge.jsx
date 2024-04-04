import {useContext, useEffect, useState} from "react";
import {Donut} from '../../../../../vendor/lib/gauge';
import {sendRawData} from "../../../../utils/apiRequests";
import {notifyError} from "../../../../utils/errors";
import SpeedGaugeInterior from "./SpeedGaugeInterior";
import {normalizeValue} from "./utils/normalizer";
import {useViewportSizes} from "../../../../hooks/useViewportSizes";
import ConfigContext from "../../../../context/ConfigContext";
import UserDataContext from "../../../../context/UserData";
import SpeedTestContext from "../../../../context/SpeedTestContext";

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

const SpeedGauge = () => {

  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();
  const config = useContext(ConfigContext);
  const {speedTestData} = useContext(SpeedTestContext);
  const {
    downloadValue,
    uploadValue,
    runningTestType,
  } = speedTestData;
  const [donut, setDonut] = useState(null);

  useEffect(() => {
    const downloadTarget = document.getElementById('speedtest--gauge-canvas');
    setDonut(new Donut(downloadTarget).setOptions(runningTestType === 'download' ? downloadOptions : uploadOptions));
  }, []);

  useEffect(() => {
    if(!donut) return;
    donut.maxValue = 100;
    donut.setMinValue(0);
    donut.animationSpeed = 10;
    donut.set(runningTestType === 'download' ? normalizeValue(downloadValue) : normalizeValue(uploadValue));
  }, [donut]);

  useEffect(() => {
    if(!donut) return;
    donut.set(0);
    if(runningTestType === 'download') {
      donut.setOptions(downloadOptions);
    } else {
      donut.setOptions(uploadOptions);
    }
  }, [runningTestType]);

  useEffect(() => {
    if(!donut) return;
    donut.set(normalizeValue(uploadValue));
  }, [uploadValue]);

  useEffect(() => {
    if(!donut) return;
    donut.set(normalizeValue(downloadValue));
  }, [downloadValue]);

  const getWrapperStyle = () => {
    if(!config.widgetMode && (isSmallSizeScreen || isMediumSizeScreen)) return mobileCanvasWrapperStyle;
    return canvasWrapperStyle;
  }

  return (
    <div style={getWrapperStyle()}>
      <canvas id={'speedtest--gauge-canvas'} width={250} height={250}></canvas>
      <SpeedGaugeInterior currentValue={runningTestType === 'download' ? downloadValue?.toFixed(2) : uploadValue?.toFixed(2)} isDownloading={runningTestType === 'download'}/>
    </div>
  )
}

export default SpeedGauge;