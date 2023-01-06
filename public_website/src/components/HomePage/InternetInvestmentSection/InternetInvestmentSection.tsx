import {ReactElement} from "react";
import {styles} from "./styles/InternetInvestmentSection.style";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const TickIcon = '/assets/images/tick-icon.png';

const InternetInvestmentSection = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <div style={styles.InternetInvestmentSection(isSmall)}>
      <div style={styles.InternetInvestmentSectionContent(isSmall)}>
        <div style={styles.ContentContainer(isSmall, false)}>
          <p className={'fw-bold'} style={styles.WhatWeOfferText}>What we offer</p>
          <p className={'fw-extra-bold'} style={styles.LongText(isSmall)}>
            Everything you need when it comes to making decisions on
            <span style={styles.GradientText(isSmall)} className={'internet-investment-section--gradient-text'}> Internet</span>
            <span style={styles.GradientText(isSmall)} className={'internet-investment-section--gradient-text'}> investment.</span>
          </p>
        </div>
        <div style={styles.ContentContainer(isSmall, true)}>
          <div style={styles.ItemContainer()}>
            <img src={TickIcon} style={styles.TickIcon} alt={'tick-icon'}/>
            <p className={'fw-regular'} style={styles.ItemText(isSmall)}>
              <span className={'fw-bold'} style={styles.ItemText(isSmall)}>Open-sourced broadband toolkit </span>
              that simplifies learning about Internet accessibility.
            </p>
          </div>
          <div style={styles.ItemContainer()}>
            <img src={TickIcon} style={styles.TickIcon} alt={'tick-icon'}/>
            <p className={'fw-regular'} style={styles.ItemText(isSmall)}>
              <span className={'fw-bold'} style={styles.ItemText(isSmall)}>Active monitoring </span>
              of Internet speeds to demonstrate that investments meet expected outcomes.
            </p>
          </div>
          <div style={styles.ItemContainer(true)}>
            <img src={TickIcon} style={styles.TickIcon} alt={'tick-icon'}/>
            <p className={'fw-regular'} style={styles.ItemText(isSmall)}>
              <span className={'fw-bold'} style={styles.ItemText(isSmall)}>Support services </span>
              to help deploy monitoring tools to identify community needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InternetInvestmentSection;