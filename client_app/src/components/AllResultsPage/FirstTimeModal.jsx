import {Box, Modal} from "@mui/material";
import {MyModalTitle} from "../common/MyModalTitle";
import {DEFAULT_MAP_MODAL_BACKGROUND_COLOR, DEFAULT_MODAL_BOX_SHADOW, DEFAULT_TEXT_COLOR} from "../../utils/colors";
import {useScreenSize} from "../../hooks/useScreenSize";
import {ArrowForward, Close} from "@mui/icons-material";
import MapPhoto from '../../assets/map-photo.png';
import TooltipPhoto from '../../assets/map-tooltip.png';
import {MyButton} from "../common/MyButton";

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
}

const boxStyle = {
  width: '100%',
  height: '100%',
  backgroundColor: DEFAULT_MAP_MODAL_BACKGROUND_COLOR,
  borderRadius: '16px',
  textAlign: 'center',
}

const subtitleStyle = {
  width: '95%',
  margin: 'auto',
  fontSize: 16,
  color: DEFAULT_TEXT_COLOR
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
  width: '80%',
  justifyContent: 'center',
  alignItems: 'center',
  margin: 'auto',
}

const imageContainerStyle = {
  width: '62.5%',
  height: '50%',
  margin: '30px auto 20px',
  position: 'relative',
}

const mobileImageContainerStyle = {
  ...imageContainerStyle,
  width: '50%',
  height: '40%',
  minWidth: 285,
  minHeight: 130,
  margin: '30px auto',
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

const FirstTimeModal = ({
  isOpen,
  setIsOpen
}) => {

  const isMobile = useScreenSize();

  return (
    <Modal open={isOpen}
           onClose={() => setIsOpen(false)}
           style={isMobile ? mobileModalStyle : modalStyle}
    >
      <Box sx={boxStyle}>
        <div style={closeButtonStyle} onClick={() => setIsOpen(false)} className={'modal-dismiss--hoverable'}>
          <Close fontSize={'small'} color={'disabled'}/>
        </div>
        <MyModalTitle text={'Explore Map'}/>
        <div style={subtitleStyle}>Our map shows all speed tests taken across the country.
          You can click a test to view more details or filter tests by speed results.</div>
        <div style={isMobile ? mobileImageContainerStyle : imageContainerStyle}>
          <img src={MapPhoto} style={mapPhotoStyle} alt={'map-photo'}/>
          <img src={TooltipPhoto} style={tooltipPhotoStyle} alt={'tooltip-photo'}/>
        </div>
        <div style={isMobile ? mobileFooterStyle : footerStyle}>
          <MyButton text={'Go to map'}
                    icon={<ArrowForward style={{marginLeft: 15}} fontSize={'small'}/>}
                    onClick={() => setIsOpen(false)}
                    fullWidth
          />
        </div>
      </Box>
    </Modal>

  );
}

export default FirstTimeModal;