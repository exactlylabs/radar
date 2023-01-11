import {CSSProperties} from "react";
import {DEFAULT_TEXT, HIGHLIGHTER} from "../../../utils/colors";

const privacyPolicyPageStyle: CSSProperties = {
  width: '100vw',
  paddingTop: '80px',
}

const smallPrivacyPolicyPageStyle: CSSProperties = {
  width: '100%',
  paddingTop: '45px',
  marginBottom: '25px',
}

const privacyPolicyPageContentStyle: CSSProperties = {
  width: '90%',
  maxWidth: '1200px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  textAlign: 'left',
  marginLeft: 'auto',
  marginRight: 'auto'
}

const smallPrivacyPolicyPageContentStyle: CSSProperties = {
  width: '90%',
  maxWidth: '588px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
  textAlign: 'left',
  marginLeft: 'auto',
  marginRight: 'auto'
}

const leftColumnStyle: CSSProperties = {
  width: '25%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start'
}

const rightColumnStyle: CSSProperties = {
  width: '70%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  marginTop: '92px',
}

const smallRightColumnStyle: CSSProperties = {
  width: '100%',
  maxWidth: '588px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  margin: '0 auto'
}

const mainTitleStyle: CSSProperties = {
  fontSize: '30px',
  lineHeight: '42px',
  letterSpacing: '-0.6px',
  color: DEFAULT_TEXT,
  margin: '0 0 50px 0',
}

const indexSection: CSSProperties = {
  width: '100%',
  height: '350px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'flex-start'
}

const sectionTitleStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 0 8px 0',
  textDecoration: 'none'
}

const subsectionTitleStyle: CSSProperties = {
  fontSize: '16px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 0 6px 10px',
}

const textSectionTitleStyle: CSSProperties = {
  fontSize: '22px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 0 10px 0'
}

const textSectionParagraphStyle: CSSProperties = {
  fontSize: '16px',
  lineHeight: '28px',
  color: DEFAULT_TEXT,
  margin: '0 0 30px 0',
  textAlign: 'justify',
  width: '100%',
}

const textSectionSubtitleStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 0 5px 0',
  textAlign: 'justify'
}

const highlightSectionStyle: CSSProperties = {
  width: '100%',
  minHeight: '30px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  textAlign: 'justify',
  borderLeft: `solid 4px ${HIGHLIGHTER}`,
  paddingLeft: '20px',
  paddingTop: '15px',
  paddingBottom: '15px',
  marginBottom: '20px'
}

const smallHighlightSectionStyle: CSSProperties = {
  ...highlightSectionStyle,
  width: 'calc(100% - 15px)',
  paddingLeft: '15px',
}

const highlightSectionParagraph: CSSProperties = {
  ...textSectionParagraphStyle,
  margin: '0 0 10px 0'
}

const smallMainTitle: CSSProperties = {
  fontSize: '28px',
  color: DEFAULT_TEXT,
  margin: '0 auto 50px',
  lineHeight: '1.29px',
  letterSpacing: '-0.6px'
}

export const styles = {
  PrivacyPolicyPage: (isSmall: boolean) => isSmall ? smallPrivacyPolicyPageStyle : privacyPolicyPageStyle,
  PrivacyPolicyPageContent: (isSmall: boolean) => isSmall ? smallPrivacyPolicyPageContentStyle : privacyPolicyPageContentStyle,
  LeftColumn: leftColumnStyle,
  RightColumn: (isSmall: boolean) => isSmall ? smallRightColumnStyle : rightColumnStyle,
  MainTitle: mainTitleStyle,
  IndexSection: indexSection,
  SectionTitle: sectionTitleStyle,
  SubsectionTitle: subsectionTitleStyle,
  TextSectionTitle: textSectionTitleStyle,
  TextSectionParagraph: textSectionParagraphStyle,
  TextSectionSubtitle: textSectionSubtitleStyle,
  HighlightSection: (isSmall: boolean) => isSmall ? smallHighlightSectionStyle : highlightSectionStyle,
  HighlightSectionParagraph: highlightSectionParagraph,
  SmallMainTitle: smallMainTitle,
}