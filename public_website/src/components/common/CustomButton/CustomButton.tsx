import {ReactElement} from "react";
import {styles} from "./styles/CustomButton.style";

interface CustomButtonProps {
  text: string;
  onClick: () => void;
  backgroundColor?: string;
  color?: string;
  icon?: ReactElement;
  iconFirst?: boolean;
}

const CustomButton = ({
  text,
  onClick,
  backgroundColor,
  color,
  icon,
  iconFirst,
}: CustomButtonProps): ReactElement => {
  return (
    <div style={styles.CustomButton}
         className={'hover-opaque'}
         onClick={onClick}
    >
      {iconFirst ?
        <>
          {icon}
          <p className={'fw-bold'} style={styles.Text(backgroundColor, color)}>{text}</p>
        </> :
        <>
          <p className={'fw-bold'} style={styles.Text(backgroundColor, color)}>{text}</p>
          {icon}
        </>
      }
    </div>
  )
}

export default CustomButton;