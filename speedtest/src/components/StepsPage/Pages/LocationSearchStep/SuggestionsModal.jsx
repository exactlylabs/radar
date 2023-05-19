import {useContext, useState} from "react";
import {Box, Modal} from "@mui/material";
import {widgetModalFraming} from "../../../../utils/modals";
import {
  DEFAULT_LINK_COLOR,
  DEFAULT_MAP_MODAL_BACKGROUND_COLOR,
  DEFAULT_MODAL_BOX_SHADOW,
  DEFAULT_TEXT_COLOR
} from "../../../../utils/colors";
import {MyModalTitle} from "../../../common/MyModalTitle";
import {MyBackButton} from "../../../common/MyBackButton";
import {MyForwardButton} from "../../../common/MyForwardButton";
import {ArrowForward} from "@mui/icons-material";
import {useViewportSizes} from "../../../../hooks/useViewportSizes";
import ConfigContext from "../../../../context/ConfigContext";
import SuggestionModalList from "./SuggestionModalList";
import SmallRightArrow from '../../../../assets/small-right-arrow.png';

const commonModalStyle = {
  boxShadow: DEFAULT_MODAL_BOX_SHADOW,
}

const modalStyle = {
  ...commonModalStyle,
  width: '500px',
  height: '475px',
  position: 'fixed',
  top: '10%',
  left: '50%',
  marginLeft: '-250px'
}

const mobileModalStyle = {
  ...commonModalStyle,
  width: '90%',
  height: '85%',
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

const headerStyle = {
  height: 125
}

const listContainerStyle = {
  height: 250,
}

const mobileListContainerStyle = {
  height: '45%'
}

const footerStyle = {
  height: 110,
  maxWidth: 250,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: 'auto'
}

const smallFooterStyle = {
  ...footerStyle,
  width: '95%',
}

const mobileFooterStyle = {
  display: 'flex',
  height: 120,
  flexDirection: 'column',
  width: '70%',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '30px auto',
}

const subtitleStyle = {
  color: DEFAULT_TEXT_COLOR,
  fontFamily: 'MulishRegular',
}

const notListedTextContainerStyle = {
  width: 'max-content',
  margin: '30px auto 0',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
}

const notListedTextStyle = {
  fontSize: '15px',
  lineHeight: '25px',
  color: DEFAULT_LINK_COLOR,
  margin: '0 5px 0 0',
}

const smallRightArrowStyle = {
  width: '10px',
  height: '10px',
}

const SuggestionsModal = ({
  isOpen,
  suggestions,
  closeModal,
  goToGenericModal,
  goToRegularMapModal
}) => {

  const config = useContext(ConfigContext);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const {isExtraSmallSizeScreen, isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  const getStyle = () => {
    if(config.widgetMode) return widgetModalFraming(config, isExtraSmallSizeScreen || isSmallSizeScreen);
    return isMediumSizeScreen || isSmallSizeScreen ? mobileModalStyle : modalStyle
  }

  const getFooterStyle = () => {
    if(isSmallSizeScreen && config.widgetMode) return smallFooterStyle;
    return isMediumSizeScreen || isSmallSizeScreen ? mobileFooterStyle : footerStyle
  }

  const handleSelectSuggestion = (suggestionIndex) => setSelectedIndex(suggestionIndex);

  const continueWithSelectedSuggestion = () => {
    goToRegularMapModal(selectedIndex);
  }

  const handleCloseModal = () => {
    setSelectedIndex(0);
    closeModal();
  }

  return (
    <Modal open={isOpen}
           onClose={closeModal}
           style={getStyle()}
    >
      <Box sx={boxStyle}>
        <div style={headerStyle}>
          <MyModalTitle text={'Confirm your location'}/>
          <div style={subtitleStyle}>{'Please select your location from the list below.'}</div>
        </div>
        <div style={isMediumSizeScreen || isSmallSizeScreen ? mobileListContainerStyle : listContainerStyle}>
          <SuggestionModalList suggestions={suggestions}
                               selectSuggestion={handleSelectSuggestion}
                               selectedSuggestionIndex={selectedIndex}
          />
          <div style={notListedTextContainerStyle}
               className={'speedtest--opaque-hoverable'}
               onClick={goToGenericModal}
          >
            <p className={'speedtest--p speedtest--bold'} style={notListedTextStyle}>My address is not listed</p>
            <img src={SmallRightArrow} alt={'small right arrow'} style={smallRightArrowStyle}/>
          </div>
        </div>
        <div style={getFooterStyle()}>
          <MyBackButton text={'Cancel'}
                        onClick={handleCloseModal}
          />
          <MyForwardButton text={'Continue'}
                           icon={<ArrowForward style={{marginLeft: 15, marginRight: '-10px'}} fontSize={'small'}/>}
                           onClick={continueWithSelectedSuggestion}
          />
        </div>
      </Box>
    </Modal>
  )
}

export default SuggestionsModal;