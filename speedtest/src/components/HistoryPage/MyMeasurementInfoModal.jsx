import {useContext} from "react";
import {Modal, Box} from "@mui/material";
import {DEFAULT_POPUP_VALUE_COLOR, WHITE} from "../../utils/colors";
import {MyModalTitle} from "../common/MyModalTitle";
import {prettyPrintDate} from "../../utils/dates";
import {Close} from "@mui/icons-material";
import TestStatsTableContent from "../common/TestStatsTableContent";
import MyMeasurementInfoModalTable from "./MyMeasurementInfoModalTable";
import ConfigContext from "../../context/ConfigContext";
import {widgetModalFraming} from "../../utils/modals";

const mobileModalStyle = {
  width: '90%',
  height: 415,
  position: 'fixed',
  top: '10%',
  left: '5%',
}

const boxStyle = {
  width: '100%',
  height: '100%',
  backgroundColor: WHITE,
  borderRadius: '16px',
  textAlign: 'center',
}

const closeButtonStyle = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  position: 'absolute',
  right: 12,
  top: 12,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
}

const dateStyle = {
  color: DEFAULT_POPUP_VALUE_COLOR,
  fontSize: 15,
  fontFamily: 'MulishRegular',
}

const MyMeasurementInfoModal = ({
  isOpen,
  setIsOpen,
  measurement
}) => {

  const config = useContext(ConfigContext);

  const closeModal = () => setIsOpen(false);

  const getModalStyle = () => {
    if(config.widgetMode) return widgetModalFraming(config);
    return mobileModalStyle;
  }

  return measurement &&
    <Modal open={isOpen} style={getModalStyle()}>
      <Box sx={boxStyle}>
        <div style={closeButtonStyle} onClick={closeModal} className={'speedtest--modal-dismiss--hoverable'}>
          <Close fontSize={'small'} color={'disabled'}/>
        </div>
        <MyModalTitle text={'Test details'}/>
        <div style={dateStyle}>{prettyPrintDate(measurement.timestamp)}</div>
        <MyMeasurementInfoModalTable address={measurement.address} networkType={measurement.networkType} networkLocation={measurement.networkLocation}/>
        <TestStatsTableContent downloadValue={measurement.download.toFixed(2)}
                               uploadValue={measurement.upload.toFixed(2)}
                               latencyValue={measurement.latency.toFixed(0)}
                               lossValue={measurement.loss.toFixed(2)}
        />
      </Box>
    </Modal>
}

export default MyMeasurementInfoModal;