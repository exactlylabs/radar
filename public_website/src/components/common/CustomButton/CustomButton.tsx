import {ReactElement} from "react";
import {styles} from "./styles/CustomButton.style";

interface CustomButtonProps {
  text: string;
  onClick: () => void;
  backgroundColor?: string;
  boxShadow?: string;
  color?: string;
  icon?: ReactElement;
  iconFirst?: boolean;
}

const CustomButton = ({
  text,
  onClick,
  backgroundColor,
  boxShadow,
  color,
  icon,
  iconFirst,
}: CustomButtonProps): ReactElement => {

  const handleClick = () => { onClick(); }

  return (
    <div style={styles.CustomButton(backgroundColor, boxShadow)}
         className={'hover-opaque'}
         onClick={handleClick}
    >
      {iconFirst ?
        <>
          {icon}
          <p className={'fw-bold'} style={styles.Text(color)}>{text}</p>
        </> :
        <>
          <p className={'fw-bold'} style={styles.Text(color)}>{text}</p>
          {icon}
        </>
      }
    </div>
  )
}

export default CustomButton;