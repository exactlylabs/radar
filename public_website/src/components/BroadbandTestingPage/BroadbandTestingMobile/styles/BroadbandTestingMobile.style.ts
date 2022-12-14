import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT} from "../../../../utils/colors";

const broadbandTestingMobileStyle: CSSProperties = {
  width: '100%',
  paddingTop: '100px',
  paddingBottom: '215px',
}

const broadbandTestingMobileContentStyle: CSSProperties = {
  width: '90%',
  maxWidth: '1200px',
  height: '455px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  margin: '0 auto'
}

const illustrationStyle: CSSProperties = {
  width: '445px',
  height: 'auto',
}

const chevronRightStyle: CSSProperties = {
  width: '14px',
  height: '14px',
  marginLeft: '5px',
}

const headerStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '26px',
  color: DEFAULT_SECONDARY_TEXT,
  margin: '58px 0 15px 0',
}

const titleStyle: CSSProperties = {
  fontSize: '34px',
  lineHeight: '42px',
  letterSpacing: '-0.7px',
  color: DEFAULT_TEXT,
  margin: '0 0 25px 0',
}

const paragraphStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '28px',
  color: DEFAULT_TEXT,
  margin: '0 0 25px 0',
}

const rightColumnStyle: CSSProperties = {
  width: '445px',
  textAlign: 'left',

}

export const styles = {
  BroadbandTestingMobile: broadbandTestingMobileStyle,
  BroadbandTestingMobileContent: broadbandTestingMobileContentStyle,
  Illustration: illustrationStyle,
  Header: headerStyle,
  Title: titleStyle,
  Paragraph: paragraphStyle,
  ChevronRight: chevronRightStyle,
  RightColumn: rightColumnStyle,
}