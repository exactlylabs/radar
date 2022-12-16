import {CSSProperties} from "react";
import {DEFAULT_TEXT, HIGHLIGHTER} from "../../../utils/colors";

const privacyPolicyPageStyle: CSSProperties = {
  width: '100vw',
  paddingTop: '80px'
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

const mainTitleStyle: CSSProperties = {
  fontSize: '30px',
  lineHeight: '42px',
  letterSpacing: '-0.6px',
  color: DEFAULT_TEXT,
  margin: '0 0 50px 0',
}

const indexSection: CSSProperties = {
  width: '100%',
  marginBottom: '25px',
}

const sectionTitleStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 0 8px 0',
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
}

const textSectionSubtitleStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 0 5px 0',
}

const highlightSectionStyle: CSSProperties = {
  width: '100%',
  minHeight: '30px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  textAlign: 'left',
  borderLeft: `solid 4px ${HIGHLIGHTER}`,
  paddingLeft: '20px',
  paddingTop: '15px',
  paddingBottom: '15px',
}

const highlighterStyle: CSSProperties = {
  width: '4px',
  minWidth: '4px',
  height: 'calc(100% + 30px)',
  borderRadius: '10px',
  backgroundColor: HIGHLIGHTER,
  marginRight: '20px',
  minHeight: '100%',
}

const hightlightSectionParagraph: CSSProperties = {
  ...textSectionParagraphStyle,
  margin: 0
}

export const styles = {
  PrivacyPolicyPage: privacyPolicyPageStyle,
  PrivacyPolicyPageContent: privacyPolicyPageContentStyle,
  LeftColumn: leftColumnStyle,
  RightColumn: rightColumnStyle,
  MainTitle: mainTitleStyle,
  IndexSection: indexSection,
  SectionTitle: sectionTitleStyle,
  SubsectionTitle: subsectionTitleStyle,
  TextSectionTitle: textSectionTitleStyle,
  TextSectionParagraph: textSectionParagraphStyle,
  TextSectionSubtitle: textSectionSubtitleStyle,
  HighlightSection: highlightSectionStyle,
  HighlightSectionParagraph: hightlightSectionParagraph,
}