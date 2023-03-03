import {Box, Modal} from "@mui/material";
import {ArrowForward, Close} from "@mui/icons-material";
import {MyButton} from "./MyButton";
import {DEFAULT_MAP_MODAL_BACKGROUND_COLOR, DEFAULT_MODAL_BOX_SHADOW, DEFAULT_TEXT_COLOR} from "../../utils/colors";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import {widgetModalFraming} from "../../utils/modals";
import {useContext} from "react";
import ConfigContext from "../../context/ConfigContext";

const commonModalStyle = {
  boxShadow: DEFAULT_MODAL_BOX_SHADOW,
}

const modalStyle = {
  ...commonModalStyle,
  width: '554px',
  height: '318px',
  position: 'absolute',
  top: '10%',
  left: '50%',
  marginLeft: '-277px',
}

const tabletModalStyle = {
  ...commonModalStyle,
  width: '65%',
  height: 'max-content',
  position: 'absolute',
  top: '10%',
  left: '50%',
  marginLeft: '-32.5%',
}

const mobileModalStyle = {
  ...commonModalStyle,
  width: '90%',
  height: 'max-content',
  position: 'absolute',
  top: '10%',
  left: '50%',
  marginLeft: '-45%',
}

const boxStyle = {
  width: 'calc(100% - 120px)',
  height: 'calc(100% - 70px)',
  padding: '40px 60px 30px',
  backgroundColor: DEFAULT_MAP_MODAL_BACKGROUND_COLOR,
  borderRadius: '16px',
  textAlign: 'center',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
}

const smallBoxStyle = {
  ...boxStyle,
  width: 'calc(100% - 80px)',
  height: 'calc(100% - 80px)',
  padding: '40px',
}

const titleStyle = {
  fontSize: '24px',
  color: DEFAULT_TEXT_COLOR,
  margin: '0 0 10px 0',
  width: '100%',
}

const subtitleStyle = {
  width: '100%',
  margin: '0 auto 50px',
  fontSize: '16px',
  lineHeight: '25px',
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
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0',
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
  width: '42px',
  height: '42px',
  position: 'relative',
  marginBottom: '20px',
}

const NoInternetModal = ({
  isOpen,
  closeModal,
}) => {

  const config = useContext(ConfigContext);
  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();
  const isSmall = isMediumSizeScreen || isSmallSizeScreen;

  const getStyle = () => {
    if(config.widgetMode) return widgetModalFraming(config);
    return isSmallSizeScreen ? mobileModalStyle : isMediumSizeScreen ? tabletModalStyle : modalStyle
  }

  return (
    <Modal open={isOpen}
           onClose={closeModal}
           style={getStyle()}
    >
      <Box sx={isSmall ? smallBoxStyle : boxStyle}>
        <div style={closeButtonStyle} onClick={closeModal} className={'modal-dismiss--hoverable'}>
          <Close fontSize={'small'} color={'disabled'}/>
        </div>
        <div style={noInternetIconStyle}>
          <svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(3.818 5.766)" fill="none" fillRule="evenodd">
              <path stroke="#4B7BE5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M4.521 28.277 32.798 0"/>
              <circle fill="#4B7BE5" cx="17.244" cy="27.635" r="2.507"/>
              <path d="M23.94 21.263A11.42 11.42 0 0 0 20.5 18.9M16.038 10.879a18.25 18.25 0 0 0-11.815 5.333M30.14 16.212a18.353 18.353 0 0 0-3.863-2.957M21.69 3.422A25.176 25.176 0 0 0 0 9.784M34.364 9.784A25.145 25.145 0 0 0 30.64 6.91" stroke="#4B7BE5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
          </svg>
        </div>
        <p className={'extra-bold'} style={titleStyle}>No Internet connection</p>
        <p style={subtitleStyle}>Please make sure your device is connected to the Internet before continuing.</p>
        <div style={isSmall ? mobileFooterStyle : footerStyle}>
          <MyButton text={'Continue anyways'}
                    icon={<ArrowForward style={{marginLeft: 15}} fontSize={'small'}/>}
                    onClick={closeModal}
                    fullWidth
          />
        </div>
      </Box>
    </Modal>
  )
}

export default NoInternetModal;