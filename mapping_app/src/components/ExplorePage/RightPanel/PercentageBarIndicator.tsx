import {ReactElement} from "react";
import {styles} from "./styles/PercentageBarIndicator.style";

interface PercentageBarIndicatorProps {
  left: number | string;
  top?: boolean;
  bottom?: boolean;
  text: string;
}

const PercentageBarIndicator = ({
  left,
  top,
  bottom,
  text,
}: PercentageBarIndicatorProps): ReactElement => {
  return (
    <div style={styles.PercentageBarIndicatorContainer()}>
      <p className={'fw-regular'} style={styles.Text(left, top)}>{text}</p>
      <div style={styles.VerticalLine(left, top)}></div>
    </div>
  )
}

export default PercentageBarIndicator;