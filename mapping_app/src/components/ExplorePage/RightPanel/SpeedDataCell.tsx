import {ReactElement} from "react";
import {styles} from "./styles/SpeedDataCell.style";

interface SpeedDataCellProps {
  icon: ReactElement;
  text: string;
  value: number;
  unit: string;
}

const SpeedDataCell = ({
  icon,
  text,
  value,
  unit
}: SpeedDataCellProps): ReactElement => {
  return (
    <div style={styles.SpeedDataCellContainer()}>
      <div style={styles.SpeedDataCellHeader()}>
        {icon}
        <p className={'fw-regular'} style={styles.Text()}>{text}</p>
      </div>
      <div style={styles.ValueContainer()}>
        <p className={'fw-medium'} style={styles.Value()}>{value}</p>
        <p className={'fw-regular'} style={styles.Unit()}>{unit}</p>
      </div>
    </div>
  )
}

export default SpeedDataCell;