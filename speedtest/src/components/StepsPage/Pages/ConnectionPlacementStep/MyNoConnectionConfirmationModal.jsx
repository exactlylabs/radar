import {Box, Modal} from "@mui/material";
import {
  DEFAULT_MAP_MODAL_BACKGROUND_COLOR,
  DEFAULT_MODAL_BOX_SHADOW,
  DEFAULT_TEXT_COLOR,
} from "../../../../utils/colors";
import {ArrowForward, Close} from "@mui/icons-material";
import NoInternetIconBlue from '../../../../assets/icon-location-nointernet-selected.png';
import {MyBackButton} from "../../../common/MyBackButton";
import {MyForwardButton} from "../../../common/MyForwardButton";
import {useViewportSizes} from "../../../../hooks/useViewportSizes";
import MySecondaryModalTitle from "../../../common/MySecondaryModalTitle";
import {widgetModalFraming} from "../../../../utils/modals";
import {useContext} from "react";
import ConfigContext from "../../../../context/ConfigContext";

const commonModalStyle = {
  boxShadow: DEFAULT_MODAL_BOX_SHADOW,
}

const modalStyle = {
  ...commonModalStyle,
  width: '555px',
  height: '380px',
  position: 'fixed',
  top: '20%',
  left: 'calc(50% - 290px)'
}

const mobileModalStyle = {
  ...commonModalStyle,
  width: '90%',
  height: '70%',
  position: 'fixed',
  top: '10%',
  left: '5%',
}

const boxStyle = {
  width: '100%',
  height: '85%',
  backgroundColor: DEFAULT_MAP_MODAL_BACKGROUND_COLOR,
  borderRadius: '16px',
  textAlign: 'center',
}

const subtitleStyle = {
  width: '80%',
  margin: 'auto',
  fontFamily: 'MulishRegular',
  fontSize: 16,
  lineHeight: '25px',
  color: DEFAULT_TEXT_COLOR,
  marginBottom: 35,
}

const xsSubtitleStyle = {
  ...subtitleStyle,
  fontSize: 13,
  lineHeight: '20px',
  marginBottom: '10px'
}

const footerStyle = {
  display: 'flex',
  flexDirection: 'row',
  maxWidth: 345,
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: 'auto'
}

const mobileFooterStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '80%',
  height: 100,
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: 'auto',
}

const xsFooterStyle = {
  display: 'flex',
  flexDirection: 'row',
  width: '90%',
  maxWidth: '310px',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '5px auto',
}

const closeButtonStyle = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  position: 'absolute',
  right: 20,
  top: 20,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
}

const noInternetIconStyle = {
  marginTop: 40,
}

const MyNoConnectionConfirmationModal = ({
  open,
  close,
  goToLastFlowStep
}) => {

  const config = useContext(ConfigContext);
  const {isExtraSmallSizeScreen, isMediumSizeScreen, isSmallSizeScreen} = useViewportSizes();

  const getModalStyle = () => {
    if(config.widgetMode) return widgetModalFraming(config, isExtraSmallSizeScreen || isSmallSizeScreen);
    return (isMediumSizeScreen || isSmallSizeScreen) ? mobileModalStyle : modalStyle;
  }

  const getFooterStyle = () => {
    if(isExtraSmallSizeScreen) return xsFooterStyle;
    return (isMediumSizeScreen || isSmallSizeScreen) ? mobileFooterStyle : footerStyle;
  }

  return (
    <Modal open={open}
           onClose={close}
           style={getModalStyle()}
    >
      <Box sx={boxStyle}>
        <div style={closeButtonStyle} onClick={close} className={'speedtest--modal-dismiss--hoverable'}>
          <Close fontSize={'small'} color={'disabled'}/>
        </div>
        <img style={noInternetIconStyle} src={NoInternetIconBlue} alt={'no-internet-icon'} width={42} height={42}/>
        <MySecondaryModalTitle text={'Confirm you don\'t have internet'}/>
        <p style={isExtraSmallSizeScreen || isSmallSizeScreen ? xsSubtitleStyle : subtitleStyle}>Are you sure you don’t have an Internet connection at your current location?</p>
        <div style={getFooterStyle()}>
          <MyBackButton text={'Cancel'}
                        onClick={close}
          />
          <MyForwardButton text={isExtraSmallSizeScreen ? 'Confirm' : 'I don\'t have internet'}
                           icon={<ArrowForward style={{marginLeft: 15}} fontSize={'small'}/>}
                           onClick={goToLastFlowStep}
          />
        </div>
      </Box>
    </Modal>
  )
}

export default MyNoConnectionConfirmationModal;