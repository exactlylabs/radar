import {CSSProperties} from "react";
import {
  INVESTMENT_SECTION_BLUE,
  INVESTMENT_SECTION_BLUE_BOX_SHADOW,
  WHAT_WE_OFFER_TEXT, WHITE
} from "../../../../utils/colors";

const internetInvestmentSectionStyle: CSSProperties = {
  width: '90%',
  maxWidth: '1200px',
  minHeight: '318px',
  borderRadius: '20px',
  backgroundColor: INVESTMENT_SECTION_BLUE,
  boxShadow: `0 14px 40px -4px ${INVESTMENT_SECTION_BLUE_BOX_SHADOW}`,
  margin: '70px auto',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

const smallInternetInvestmentSectionStyle: CSSProperties = {
  ...internetInvestmentSectionStyle,
  height: 'max-content',
  borderRadius: 0
}

const internetInvestmentSectionContentStyle: CSSProperties = {
  width: '80%',
  height: '90%',
  margin: 'auto',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-start'
}

const smallInternetInvestmentSectionContentStyle: CSSProperties = {
  ...internetInvestmentSectionContentStyle,
  width: 'calc(100% - 50px)',
  height: 'calc(100% - 60px)',
  flexDirection: 'column',
}

const contentContainerStyle: CSSProperties = {
  width: '50%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  marginTop: '30px',
  marginBottom: '30px',
}

const smallContentContainerStyle: CSSProperties = {
  ...contentContainerStyle,
  width: '100%',
  marginTop: '30px',
  marginBottom: '0',
}

const whatWeOfferTextStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '26px',
  color: WHAT_WE_OFFER_TEXT,
  marginTop: 0,
  marginBottom: '10px'
}

const longTextStyle: CSSProperties = {
  fontSize: '34px',
  lineHeight: '42px',
  letterSpacing: '-0.7px',
  color: WHITE,
  margin: 0,
  maxWidth: '415px',
}

const smallLongTextStyle: CSSProperties = {
  ...longTextStyle,
  fontSize: '26px',
  lineHeight: '34px',
  letterSpacing: '-0.56px'
}

const gradientTextStyle: CSSProperties = {
  ...longTextStyle,
  background: 'linear-gradient(123deg, #4b7be5 -4%, #e565bb 54%)'
}

const smallGradientTextStyle: CSSProperties = {
  ...smallLongTextStyle,
  background: 'linear-gradient(123deg, #4b7be5 -4%, #e565bb 54%)'
}

const itemContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  marginBottom: '25px'
}

const lastItemContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
}

const tickIconStyle: CSSProperties = {
  width: '20px',
  height: '20px',
  marginRight: '19px',
  marginTop: '5px'
}

const itemTextStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '28px',
  color: WHITE,
  margin: 0
}

const smallItemTextStyle: CSSProperties = {
  fontSize: '16px',
  lineHeight: '26px',
  color: WHITE,
  margin: 0
}

export const styles = {
  InternetInvestmentSection: (isSmall: boolean) => {
    return isSmall ? smallInternetInvestmentSectionStyle : internetInvestmentSectionStyle;
  },
  InternetInvestmentSectionContent: (isSmall: boolean) => {
    return isSmall ? smallInternetInvestmentSectionContentStyle : internetInvestmentSectionContentStyle;
  },
  ContentContainer: (isSmall: boolean, isLast: boolean) => {
    let style;
    if(isSmall) {
      style = isLast ? {...smallContentContainerStyle, marginBottom: '30px'} : smallContentContainerStyle;
    } else {
      style = contentContainerStyle;
    }
    return style;
  },
  WhatWeOfferText: whatWeOfferTextStyle,
  LongText: (isSmall: boolean) => {
    return isSmall ? smallLongTextStyle : longTextStyle;
  },
  GradientText: (isSmall: boolean) => {
    return isSmall ? smallGradientTextStyle : gradientTextStyle;
  },
  ItemContainer: (isLast?: boolean) => {
    return isLast ? lastItemContainerStyle : itemContainerStyle;
  },
  TickIcon: tickIconStyle,
  ItemText: (isSmall: boolean) => {
    return isSmall ? smallItemTextStyle : itemTextStyle;
  },
}