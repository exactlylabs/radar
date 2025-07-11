import {Box, Modal} from "@mui/material";
import {MyModalTitle} from "../common/MyModalTitle";
import {DEFAULT_MAP_MODAL_BACKGROUND_COLOR, DEFAULT_MODAL_BOX_SHADOW, DEFAULT_TEXT_COLOR} from "../../utils/colors";
import {ArrowForward, Close} from "@mui/icons-material";
import MapPhoto from '../../assets/map-photo.png';
import TooltipPhoto from '../../assets/map-tooltip.png';
import {MyButton} from "../common/MyButton";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import {widgetModalFraming} from "../../utils/modals";
import {useContext} from "react";
import ConfigContext from "../../context/ConfigContext";
import rightArrowWhite from "../../assets/right-arrow-white.png";

const commonModalStyle = {
  boxShadow: DEFAULT_MODAL_BOX_SHADOW,
}

const modalStyle = {
  ...commonModalStyle,
  width: '700px',
  height: '485px',
  position: 'fixed',
  top: '10%',
  left: 'calc(50% - 350px)'
}

const mobileModalStyle = {
  ...commonModalStyle,
  width: '90%',
  height: '75%',
  position: 'fixed',
  top: '10%',
  left: '5%',
  maxHeight: 450,
}

const boxStyle = {
  width: '100%',
  height: '100%',
  backgroundColor: DEFAULT_MAP_MODAL_BACKGROUND_COLOR,
  borderRadius: '16px',
  textAlign: 'center',
}

const widgetBoxStyle = {
  ...boxStyle,
  maxWidth: 440,
  height: 'max-content',
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)'
}

const subtitleStyle = {
  width: 'calc(100% - 80px)',
  margin: 'auto',
  fontSize: 16,
  color: DEFAULT_TEXT_COLOR,
  fontFamily: 'Mulish',
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
  maxWidth: 385,
  justifyContent: 'center',
  alignItems: 'center',
  margin: 'auto'
}

const mobileFooterStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: 'max-content',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 auto 16px',
}

const imageContainerStyle = {
  width: '75%',
  height: 'max-content',
  aspectRatio: '2',
  margin: '30px auto 20px',
  position: 'relative',
}

const mobileImageContainerStyle = {
  ...imageContainerStyle,
  width: '65%',
  height: 'auto',
  margin: '30px auto',
}

const xsImageContainerStyle = {
  ...mobileImageContainerStyle,
  width: '90%',
  height: 'auto',
  minWidth: undefined,
  margin: '5px auto',
}

const mapPhotoStyle = {
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0
}

const tooltipPhotoStyle = {
  width: '56%',
  height: '68.5%',
  position: 'absolute',
  top: '15%'
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

const xsCloseButtonStyle = {
  ...closeButtonStyle,
  top: 10,
  right: 10
}

const FirstTimeModal = ({
  isOpen,
  setIsOpen
}) => {

  const {isExtraSmallSizeScreen, isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();
  const config = useContext(ConfigContext);

  const closeModal = () => setIsOpen(false);

  const getStyle = () => {
    if(config.widgetMode) {
      const mainFrameElement = document.getElementById('speedtest--frame--main-frame-wrapper');
      const { height } = mainFrameElement.getBoundingClientRect()
      return widgetModalFraming({maxWidth: '100%', width: '100%', height, maxHeight: height, top: 94});
    }
    return (isMediumSizeScreen || isSmallSizeScreen) ? mobileModalStyle : modalStyle
  }

  const getImageContainerStyle = () => {
    if(isExtraSmallSizeScreen) return xsImageContainerStyle;
    return (isMediumSizeScreen || isSmallSizeScreen) ? mobileImageContainerStyle : imageContainerStyle
  }

  return (
    <Modal open={isOpen}
           onClose={closeModal}
           style={getStyle()}
           disableAutoFocus={true}
    >
      <Box sx={config.widgetMode ? widgetBoxStyle : boxStyle}>
        <div style={isExtraSmallSizeScreen ? xsCloseButtonStyle : closeButtonStyle} onClick={closeModal} className={'speedtest--modal-dismiss--hoverable'}>
          <Close fontSize={'small'} color={'disabled'}/>
        </div>
        <MyModalTitle text={'Explore Map'}/>
        <div style={isExtraSmallSizeScreen || isSmallSizeScreen ? xsSubtitleStyle : subtitleStyle}>Our map shows all speed tests taken across the country.
          You can click a test to view more details or filter tests by speed results.</div>
        <div style={getImageContainerStyle()}>
          <img src={MapPhoto} style={mapPhotoStyle} alt={'map-photo'}/>
          <img src={TooltipPhoto} style={tooltipPhotoStyle} alt={'tooltip-photo'}/>
        </div>
        <div style={(isMediumSizeScreen || isSmallSizeScreen) ? mobileFooterStyle : footerStyle}>
          <MyButton text={'Go to map'}
                    icon={<img src={rightArrowWhite} alt={'location-button-icon'} width={14} height={14}/>}
                    onClick={closeModal}
                    fullWidth
          />
        </div>
      </Box>
    </Modal>

  );
}

export default FirstTimeModal;