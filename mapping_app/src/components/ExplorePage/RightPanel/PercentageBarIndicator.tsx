import {ReactElement} from "react";
import {styles} from "./styles/PercentageBarIndicator.style";

interface PercentageBarIndicatorProps {
  left: string;
  top?: boolean;
  text: string;
  percentage: string;
}

const PercentageBarIndicator = ({
  left,
  top,
  text,
  percentage
}: PercentageBarIndicatorProps): ReactElement => {
  return (
    <div style={styles.PercentageBarIndicatorContainer}>
      <p className={'fw-regular'} style={styles.Text(left, percentage, top)}>{text}</p>
      <div style={styles.VerticalLine(left, top)}></div>
    </div>
  )
}

export default PercentageBarIndicator;