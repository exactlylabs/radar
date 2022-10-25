import {ReactElement} from "react";
import {styles} from "./styles/ApplyDateRangeButton.style";

interface ApplyDateRangeButtonProps {
  onClick: () => void;
}

const ApplyDateRangeButton = ({
  onClick,
}: ApplyDateRangeButtonProps): ReactElement => {
  return (
    <button style={styles.ApplyDateRangeButton}
            className={'fw-medium hover-opaque'}
            onClick={onClick}
    >
      Apply date range
    </button>
  )
}

export default ApplyDateRangeButton;