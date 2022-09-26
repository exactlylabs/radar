import {ReactElement} from "react";
import {SpeedsObject, speedTexts, speedTypes} from "../../../utils/speeds";
import PercentageBarIndicator from "./PercentageBarIndicator";
import {addPercentages, isNotZero} from "../../../utils/percentages";
import {styles} from "./styles/SpeedDistributionPercentageBarIndicators.style";

interface SpeedDistributionPercentageBarIndicatorsProps {
  percentages: Array<string>;
  indexesToDisplay: Array<number>;
  top?: boolean;
  bottom?: boolean;
}

const SpeedDistributionPercentageBarIndicators = ({
  percentages,
  indexesToDisplay,
  top,
  bottom
}: SpeedDistributionPercentageBarIndicatorsProps): ReactElement => {

  const shouldDisplay = (index: number): boolean => indexesToDisplay.includes(index);

  return (
    <div style={styles.SpeedDistributionPercentageBarIndicatorsContainer(top, bottom)}>
      {
        shouldDisplay(0) &&
        <PercentageBarIndicator left={0} top={top} bottom={bottom} text={speedTexts['UNSERVED']}/>
      }
      {
        shouldDisplay(1) &&
        <PercentageBarIndicator left={percentages[0]} top={top} bottom={bottom} text={speedTexts['UNDERSERVED']}/>
      }
      {
        shouldDisplay(2) &&
        <PercentageBarIndicator left={addPercentages(percentages[0], percentages[1])} top={top} bottom={bottom} text={speedTexts['SERVED']}/>
      }
    </div>
  )
}

export default SpeedDistributionPercentageBarIndicators;