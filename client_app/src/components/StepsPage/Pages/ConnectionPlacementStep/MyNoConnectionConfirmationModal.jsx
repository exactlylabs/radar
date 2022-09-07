import {Box, Modal} from "@mui/material";
import {useScreenSize} from "../../../../hooks/useScreenSize";
import {
  DEFAULT_FOOTER_HORIZONTAL_DIVIDER_BG_COLOR,
  DEFAULT_MAP_MODAL_BACKGROUND_COLOR,
  DEFAULT_MODAL_BOX_SHADOW,
  DEFAULT_TEXT_COLOR
} from "../../../../utils/colors";
import {ArrowForward, Close} from "@mui/icons-material";
import NoInternetIconBlue from '../../../../assets/icon-location-nointernet-selected.png';
import LocationPinIcon from '../../../../assets/address-icon-rounded.png';
import {MyModalTitle} from "../../../common/MyModalTitle";
import {MyBackButton} from "../../../common/MyBackButton";
import {MyForwardButton} from "../../../common/MyForwardButton";

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
  height: '100%',
  backgroundColor: DEFAULT_MAP_MODAL_BACKGROUND_COLOR,
  borderRadius: '16px',
  textAlign: 'center',
}

const subtitleStyle = {
  width: '95%',
  margin: 'auto',
  fontSize: 16,
  color: DEFAULT_TEXT_COLOR,
  marginBottom: 35,
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

const addressWrapperStyle = {
  width: 'max-content',
  maxWidth: 485,
  margin: '0 auto 50px',
  display: 'flex',
  flexDirection: 'row',
  paddingLeft: 20,
  paddingRight: 20,
  paddingTop: 12,
  paddingBottom: 12,
  border: `solid 1px ${DEFAULT_FOOTER_HORIZONTAL_DIVIDER_BG_COLOR}`,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}

const mobileAddressWrapperStyle = {
  ...addressWrapperStyle,
  maxWidth: 350,
  margin: '0 auto 30px',
}

const locationPinIconStyle = {
  marginRight: 10,
}

const addressTextStyle = {
  maxWidth: 400,
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}

const mobileAddressTextStyle = {
  ...addressTextStyle,
  maxWidth: 250
}

const MyNoConnectionConfirmationModal = ({
  open,
  close,
  address,
  goToLastFlowStep
}) => {

  const isMobile = useScreenSize();

  return (
    <Modal open={open}
           onClose={close}
           style={isMobile ? mobileModalStyle : modalStyle}
    >
      <Box sx={boxStyle}>
        <div style={closeButtonStyle} onClick={close} className={'modal-dismiss--hoverable'}>
          <Close fontSize={'small'} color={'disabled'}/>
        </div>
        <img style={noInternetIconStyle} src={NoInternetIconBlue} alt={'no-internet-icon'} width={42} height={42}/>
        <MyModalTitle text={'Confirm you don\'t have internet'} style={{paddingTop: 20}}/>
        <div style={subtitleStyle}>Are you sure you don’t have Internet at the address below?</div>
        <div style={ isMobile ? mobileAddressWrapperStyle : addressWrapperStyle}>
          <img style={locationPinIconStyle} src={LocationPinIcon} width={28} height={28} alt={'location-pin'}/>
          <p style={isMobile ? mobileAddressTextStyle : addressTextStyle}>{address}</p>
        </div>
        <div style={isMobile ? mobileFooterStyle : footerStyle}>
          <MyBackButton text={'Cancel'}
                        onClick={close}
          />
          <MyForwardButton text={'I don\'t have internet'}
                           icon={<ArrowForward style={{marginLeft: 15}} fontSize={'small'}/>}
                           onClick={goToLastFlowStep}
          />
        </div>
      </Box>
    </Modal>
  )
}

export default MyNoConnectionConfirmationModal;