import {CSSProperties} from "react";
import {CUSTOM_INPUT_ERROR_MESSAGE_COLOR, DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT} from "../../../../utils/colors";

const pageWrapperStyle: CSSProperties = {
  width: '100vw',
  position: 'relative',
}

const gradientsLayer: CSSProperties = {
  width: '100vw',
  height: 'auto',
  position: 'absolute',
  left: 0,
  top: '-65px',
  zIndex: 0
}

const smallGradientsLayer: CSSProperties = {
  width: '100vw',
  height: 'auto',
  position: 'absolute',
  left: 0,
  top: 0,
  zIndex: 0
}

const contentWrapperStyle: CSSProperties = {
  width: '90%',
  maxWidth: '480px',
  margin: '90px auto 80px',
  position: 'relative',
  zIndex: 2,
  textAlign: 'center'
}

const smallContentWrapperStyle: CSSProperties = {
  width: 'calc(100% - 50px)',
  maxWidth: '588px',
  margin: '50px auto 60px',
  position: 'relative',
  zIndex: 2,
  textAlign: 'center'
}

const titleStyle: CSSProperties = {
  fontSize: '34px',
  lineHeight: '42px',
  letterSpacing: '-0.7px',
  color: DEFAULT_TEXT,
  margin: '0 auto 20px'
}

const smallTitleStyle: CSSProperties = {
  fontSize: '36px',
  lineHeight: '34px',
  letterSpacing: '-0.56px',
  color: DEFAULT_TEXT,
  margin: '0 auto 15px'
}

const subtitleStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '26px',
  letterSpacing: '-0.7px',
  color: DEFAULT_TEXT,
  margin: '0 auto 40px',
  width: '100%'
}

const smallSubtitleStyle: CSSProperties = {
  fontSize: '16px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 auto 40px',
  width: '100%'
}

const formContainer: CSSProperties = {
  width: 'calc(100% - 40px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  margin: '0 auto'
}

const smallFormContainer: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  margin: '0 auto'
}

const formGroupStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  margin: '0 auto 16px',
}

const labelStyle: CSSProperties = {
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 5px 0',
  color: DEFAULT_TEXT
}

const optionalLabelStyle: CSSProperties = {
  fontSize: '15px',
  lineHeight: '26px',
  color: DEFAULT_SECONDARY_TEXT
}

const interestsGroupStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start'
}

const checkboxRowStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center'
}

const checkboxCellStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  marginRight: '40px',
}

const checkboxLabelStyle: CSSProperties = {
  fontSize: '16px',
  lineHeight: '25px',
  color: DEFAULT_TEXT,
  margin: '0',
  whiteSpace: 'nowrap'
}

const consentTextContainerStyle: CSSProperties = {
  width: '100%',
  textAlign: 'left',
  marginLeft: 0,
  marginRight: 0,
  marginBottom: '30px'
}

const consentTextStyle: CSSProperties = {
  fontSize: '15px',
  lineHeight: '22px',
  letterSpacing: '-0.2px',
  color: DEFAULT_SECONDARY_TEXT,
  margin: 0
}

const buttonContainerStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

const smallButtonContainerStyle: CSSProperties = {
  width: '100%',
  maxWidth: '300px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 auto'
}

const errorLabelStyle: CSSProperties = {
  fontSize: '15px',
  lineHeight: '23px',
  color: CUSTOM_INPUT_ERROR_MESSAGE_COLOR,
  margin: '4px 0 0 0'
}

const contactBg1Style: CSSProperties = {
  position: 'absolute',
  width: '69%',
  height: 'auto',
  zIndex: 0,
  right: 0,
  top: '-80px',
  maxHeight: '50vh',
  opacity: 0.3
}

const contactBg2Style: CSSProperties = {
  position: 'absolute',
  width: '63%',
  height: 'auto',
  zIndex: 0,
  left: '10%',
  top: '-55px',
  maxHeight: '50vh',
  opacity: 0.3
}

const contactWhiteCircleStyle: CSSProperties = {
  position: 'absolute',
  width: '100vw',
  height: 'auto',
  zIndex: 1,
  left: 0,
  top: '75px',
  maxHeight: '50vh'
}

const smallContactWhiteCircleStyle: CSSProperties = {
  position: 'absolute',
  width: '120vw',
  height: 'auto',
  zIndex: 1,
  left: 0,
  top: 0,
  maxHeight: '120vh'
}

const smallContactBg1Style: CSSProperties = {
  width: '100vw',
  height: 'auto',
  position: 'absolute',
  top: '-35vh',
  right: 0,
  zIndex: 0,
  opacity: 0.6
}

const smallContactBg2Style: CSSProperties = {
  width: '100vw',
  height: 'auto',
  position: 'absolute',
  top: '-40vh',
  left: 0,
  zIndex: 0,
  opacity: 0.6
}


export const styles = {
  PageWrapper: pageWrapperStyle,
  ContentWrapper: (isSmall: boolean) => isSmall ? smallContentWrapperStyle : contentWrapperStyle,
  GradientsLayer: (isSmall: boolean) => isSmall ? smallGradientsLayer : gradientsLayer,
  Title: (isSmall: boolean) => isSmall ? smallTitleStyle : titleStyle,
  Subtitle: (isSmall: boolean) => isSmall ? smallSubtitleStyle : subtitleStyle,
  FormContainer: (isSmall: boolean) => isSmall ? smallFormContainer : formContainer,
  FormGroup: formGroupStyle,
  Label: labelStyle,
  OptionalLabel: optionalLabelStyle,
  InterestsGroup: interestsGroupStyle,
  CheckboxRow: (isLast: boolean) => {
    return {...checkboxRowStyle, marginBottom: isLast ? '16px' : '6px'};
  },
  CheckboxCell: (width: string) => {
    return {...checkboxCellStyle, width};
  },
  CheckboxLabel: checkboxLabelStyle,
  ConsentTextContainer: (isInputVisible: boolean) => {
    return {...consentTextContainerStyle, marginTop: isInputVisible ? '40px' : '24px'};
  },
  ConsentText: consentTextStyle,
  ButtonContainer: (isSmall: boolean) => isSmall ? smallButtonContainerStyle : buttonContainerStyle,
  ErrorLabel: errorLabelStyle,
  ContactBg1: contactBg1Style,
  ContactBg2: contactBg2Style,
  ContactWhiteCircle: (isSmall: boolean) => isSmall ? smallContactWhiteCircleStyle : contactWhiteCircleStyle,
  SmallContactBg1: smallContactBg1Style,
  SmallContactBg2: smallContactBg2Style,
}