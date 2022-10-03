import {ReactElement} from "react";
import {SpeedsObject, speedTextsDownload, speedTextsUpload} from "../../../utils/speeds";
import PercentageBarIndicator from "./PercentageBarIndicator";
import {addPercentages} from "../../../utils/percentages";
import {styles} from "./styles/SpeedDistributionPercentageBarIndicators.style";

interface SpeedDistributionPercentageBarIndicatorsProps {
  percentages: Array<string>;
  indexesToDisplay: Array<number>;
  top?: boolean;
  bottom?: boolean;
  speedType: string;
}

const SpeedDistributionPercentageBarIndicators = ({
  percentages,
  indexesToDisplay,
  top,
  bottom,
  speedType
}: SpeedDistributionPercentageBarIndicatorsProps): ReactElement => {

  const shouldDisplay = (index: number): boolean => indexesToDisplay.includes(index);

  const getSpeedTexts = (key: string): string => {
    return speedType === 'Download' ?
      speedTextsDownload[key as keyof SpeedsObject] : speedTextsUpload[key as keyof SpeedsObject];
  }

  return (
    <div style={styles.SpeedDistributionPercentageBarIndicatorsContainer(top, bottom)}>
      {
        shouldDisplay(0) &&
        <PercentageBarIndicator left={0} top={top} bottom={bottom} text={getSpeedTexts('UNSERVED')}/>
      }
      {
        shouldDisplay(1) &&
        <PercentageBarIndicator left={percentages[0]} top={top} bottom={bottom} text={getSpeedTexts('UNDERSERVED')}/>
      }
      {
        shouldDisplay(2) &&
        <PercentageBarIndicator left={addPercentages(percentages[0], percentages[1])} top={top} bottom={bottom} text={getSpeedTexts('SERVED')}/>
      }
    </div>
  )
}

export default SpeedDistributionPercentageBarIndicators;