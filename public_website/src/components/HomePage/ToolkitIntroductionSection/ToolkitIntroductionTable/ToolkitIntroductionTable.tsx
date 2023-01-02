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
        <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Have a better understanding of where broadband is available down to the street.</p>
      </div>
      { !isSmall && <img src={SeparatorLine} style={styles.SeparatorLine} alt={'separator-line'}/> }
      <div style={styles.ToolkitIntroductionTableColumn}>
        <div style={styles.IconContainer(isSmall)}>
          <img src={InvestmentsIcon} style={styles.Icon} alt={'map-icon'}/>
        </div>
        <p className={'fw-bold'} style={styles.Title}>Make smart investments</p>
        <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Identify where internet investment will go the furthest.</p>
      </div>
      { !isSmall && <img src={SeparatorLine} style={styles.SeparatorLine} alt={'separator-line'}/> }
      <div style={styles.ToolkitIntroductionTableColumn}>
        <div style={styles.IconContainer(isSmall)}>
          <img src={CommunitiesIcon} style={styles.Icon} alt={'map-icon'}/>
        </div>
        <p className={'fw-bold'} style={styles.Title}>Reach more communities</p>
        <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Identify and ensure connectivity at important community locations.</p>
      </div>
    </div>
  )
}

export default ToolkitIntroductionTable;