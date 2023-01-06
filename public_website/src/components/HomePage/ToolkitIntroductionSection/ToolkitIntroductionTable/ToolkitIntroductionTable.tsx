import {ReactElement} from "react";
import {styles} from "./styles/ToolkitIntroductionTable.style";
import {useViewportSizes} from "../../../../hooks/useViewportSizes";

const MapIcon = '/assets/images/map-icon.png';
const InvestmentsIcon = '/assets/images/investments-icon.png';
const CommunitiesIcon = '/assets/images/communities-icon.png';
const SeparatorLine = '/assets/images/separator-line.png';

const ToolkitIntroductionTable = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <div style={styles.ToolkitIntroductionTable(isSmall)}>
      <div style={styles.ToolkitIntroductionTableColumn}>
        <div style={styles.IconContainer(isSmall)}>
          <img src={MapIcon} style={styles.Icon} alt={'map-icon'}/>
        </div>
        <p className={'fw-bold'} style={styles.Title}>Explore the map in detail</p>
        <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Build a better understanding of broadband availability in your neighborhood.</p>
      </div>
      { !isSmall && <img src={SeparatorLine} style={styles.SeparatorLine} alt={'separator-line'}/> }
      <div style={styles.ToolkitIntroductionTableColumn}>
        <div style={styles.IconContainer(isSmall)}>
          <img src={InvestmentsIcon} style={styles.Icon} alt={'map-icon'}/>
        </div>
        <p className={'fw-bold'} style={styles.Title}>Make smart investments</p>
        <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Identify where Internet investment is needed most.</p>
      </div>
      { !isSmall && <img src={SeparatorLine} style={styles.SeparatorLine} alt={'separator-line'}/> }
      <div style={styles.ToolkitIntroductionTableColumn}>
        <div style={styles.IconContainer(isSmall)}>
          <img src={CommunitiesIcon} style={styles.Icon} alt={'map-icon'}/>
        </div>
        <p className={'fw-bold'} style={styles.Title}>Reach more communities</p>
        <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Measure connectivity at important community locations.</p>
      </div>
    </div>
  )
}

export default ToolkitIntroductionTable;