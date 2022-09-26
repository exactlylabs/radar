import {ReactElement} from "react";
import SpeedDistributionPercentageBar from "./SpeedDistributionPercentageBar";
import {speedTexts, speedTypes} from "../../../utils/speeds";
import SpeedDistributionRow from "./SpeedDistributionRow";
import {styles} from "./styles/SpeedDistribution.style";
import RightPanelHorizontalDivider from "./RightPanelHorizontalDivider";
import SpeedDistributionPercentageBarIndicators from "./SpeedDistributionPercentageBarIndicators";
import {isNotZero} from "../../../utils/percentages";

interface SpeedDistributionProps {
  unservedPeopleCount: number;
  underservedPeopleCount: number;
  servedPeopleCount: number;
}

const SpeedDistribution = ({
  unservedPeopleCount,
  underservedPeopleCount,
  servedPeopleCount
}: SpeedDistributionProps): ReactElement => {

  const totalPeople = unservedPeopleCount + underservedPeopleCount + servedPeopleCount;
  const unservedPercentage = (unservedPeopleCount * 100 / totalPeople).toFixed(1) + '%';
  const underservedPercentage = (underservedPeopleCount * 100/ totalPeople).toFixed(1) + '%';
  const servedPercentage = (servedPeopleCount * 100/ totalPeople).toFixed(1) + '%';

  const getIndexesForTopHalf = (): Array<number> => {
    let indexes: Array<number> = [];
    const unservedHasValue: boolean = isNotZero(unservedPercentage);
    const underservedHasValue: boolean = isNotZero(underservedPercentage);
    const servedHasValue: boolean = isNotZero(servedPercentage);
    // by default show unserved at top if present
    if(unservedHasValue) indexes.push(0);
    // if unserved is 0, then by default show underserved at top if present
    if(!unservedHasValue && underservedHasValue) indexes.push(1);
    // if the 3 values are present, alternate them to prevent overlapping of divs,
    // so 0 and 2 go on the top half, 1 goes on the bottom, OR
    // only served is present, default to top
    if(((unservedHasValue && underservedHasValue) ||
      (!unservedHasValue && !underservedHasValue)) &&
      servedHasValue) indexes.push(2);
    return indexes;
  }

  const getIndexesForBottomHalf = (): Array<number> => {
    let indexes: Array<number> = [];
    const unservedHasValue: boolean = isNotZero(unservedPercentage);
    const underservedHasValue: boolean = isNotZero(underservedPercentage);
    const servedHasValue: boolean = isNotZero(servedPercentage);
    // if 0 is on top, 1 goes on bottom
    if(unservedHasValue && underservedHasValue) indexes.push(1);
    // if 0 is not present, 1 is on top, then 2 on bottom
    if(!unservedHasValue && underservedHasValue && servedHasValue) indexes.push(2);
    return indexes;
  }

  return (
    <div style={styles.SpeedDistributionContainer()}>
      <p className={'fw-semi-bold'} style={styles.Title()}>SPEED DISTRIBUTION</p>
      <SpeedDistributionPercentageBarIndicators percentages={[unservedPercentage, underservedPercentage, servedPercentage]}
                                                indexesToDisplay={getIndexesForTopHalf()}
                                                top
      />
      <SpeedDistributionPercentageBar unservedPercentage={unservedPercentage}
                                      underservedPercentage={underservedPercentage}
                                      servedPercentage={servedPercentage}
      />
      <SpeedDistributionPercentageBarIndicators percentages={[unservedPercentage, underservedPercentage, servedPercentage]}
                                                indexesToDisplay={getIndexesForBottomHalf()}
                                                bottom
      />
      <SpeedDistributionRow type={speedTypes.UNSERVED}
                            peopleCount={unservedPeopleCount}
                            percentage={unservedPercentage}
      />
      <RightPanelHorizontalDivider/>
      <SpeedDistributionRow type={speedTypes.UNDERSERVED}
                            peopleCount={underservedPeopleCount}
                            percentage={underservedPercentage}
      />
      <RightPanelHorizontalDivider/>
      <SpeedDistributionRow type={speedTypes.SERVED}
                            peopleCount={servedPeopleCount}
                            percentage={servedPercentage}
      />
      <RightPanelHorizontalDivider/>
    </div>
  )
}

export default SpeedDistribution;