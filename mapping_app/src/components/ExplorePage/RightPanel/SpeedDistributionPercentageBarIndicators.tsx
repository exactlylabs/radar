import {ReactElement} from "react";
import {SpeedsObject, speedTextsDownload, speedTextsUpload} from "../../../utils/speeds";
import PercentageBarIndicator from "./PercentageBarIndicator";
import {addPercentages} from "../../../utils/percentages";
import {styles} from "./styles/SpeedDistributionPercentageBarIndicators.style";
import {Filter} from "../../../utils/types";

interface SpeedDistributionPercentageBarIndicatorsProps {
  percentages: Array<string>;
  indexesToDisplay: Array<number>;
  top?: boolean;
  bottom?: boolean;
  speedType: Filter;
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
    <div style={styles.SpeedDistributionPercentageBarIndicatorsContainer(top)}>
      {
        shouldDisplay(0) &&
        <PercentageBarIndicator left={'0%'}
                                top={top}
                                text={getSpeedTexts('UNSERVED')}
                                percentage={percentages[0]}
        />
      }
      {
        shouldDisplay(1) &&
        <PercentageBarIndicator left={percentages[0]}
                                top={top}
                                text={getSpeedTexts('UNDERSERVED')}
                                percentage={percentages[1]}
        />
      }
      {
        shouldDisplay(2) &&
        <PercentageBarIndicator left={addPercentages(percentages[0], percentages[1])}
                                top={top}
                                text={getSpeedTexts('SERVED')}
                                percentage={percentages[2]}
        />
      }
    </div>
  )
}

export default SpeedDistributionPercentageBarIndicators;