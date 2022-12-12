import {ReactElement} from "react";
import {styles} from "./styles/InternetInvestmentSection.style";
import './styles/InternetInvestmentSection.css';
import TickIcon from '../../../assets/images/tick-icon.png';
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const InternetInvestmentSection = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <div style={styles.InternetInvestmentSection(isSmall)}>
      <div style={styles.InternetInvestmentSectionContent(isSmall)}>
        <div style={styles.ContentContainer(isSmall, false)}>
          <p className={'fw-bold'} style={styles.WhatWeOfferText}>What we offer</p>
          <p className={'fw-extra-bold'} style={styles.LongText(isSmall)}>
            Everything you need when it comes to taking decisions on
            <span style={styles.GradientText(isSmall)} className={'internet-investment-section--gradient-text'}> internet</span>
            <span style={styles.GradientText(isSmall)} className={'internet-investment-section--gradient-text'}> investment.</span>
          </p>
        </div>
        <div style={styles.ContentContainer(isSmall, true)}>
          <div style={styles.ItemContainer()}>
            <img src={TickIcon} style={styles.TickIcon} alt={'tick-icon'}/>
            <p className={'fw-regular'} style={styles.ItemText(isSmall)}>
              <span className={'fw-bold'} style={styles.ItemText(isSmall)}>Open-sourced broadband toolkit </span>
              that simplifies learning about internet accessibility.
            </p>
          </div>
          <div style={styles.ItemContainer()}>
            <img src={TickIcon} style={styles.TickIcon} alt={'tick-icon'}/>
            <p className={'fw-regular'} style={styles.ItemText(isSmall)}>
              <span className={'fw-bold'} style={styles.ItemText(isSmall)}>Active monitoring </span>
              of the impact of new broadband investments to make sure dollars spent have outcomes.
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