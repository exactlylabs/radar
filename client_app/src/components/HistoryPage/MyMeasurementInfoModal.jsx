import {Modal, Box} from "@mui/material";
import {DEFAULT_POPUP_VALUE_COLOR, WHITE} from "../../utils/colors";
import {MyModalTitle} from "../common/MyModalTitle";
import {prettyPrintDate} from "../../utils/dates";
import {Close} from "@mui/icons-material";
import TestStatsTable from "../StepsPage/Pages/SpeedTestStep/TestStatsTable";
import TestStatsTableContent from "../common/TestStatsTableContent";
import MyMeasurementInfoModalTable from "./MyMeasurementInfoModalTable";

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
  backgroundColor: '#dedce8',
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
}

const MyMeasurementInfoModal = ({
  isOpen,
  setIsOpen,
  measurement
}) => {

  const closeModal = () => setIsOpen(false);

  return measurement &&
    <Modal open={isOpen} style={mobileModalStyle}>
      <Box sx={boxStyle}>
        <div style={closeButtonStyle} onClick={closeModal}>
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