import {ReactElement} from "react";
import {styles} from "./styles/MyButton.style";

interface CustomButtonProps {
  text: string;
  icon?: ReactElement;
  backgroundColor?: string;
  color?: string;
  iconFirst?: boolean;
  onClick?: () => void;
  className?: string;
  backdropFilter?: string;
}

const CustomButton = ({
  text,
  icon,
  backgroundColor,
  backdropFilter,
  color,
  iconFirst,
  onClick,
  className
}: CustomButtonProps): ReactElement => {

  return iconFirst ?
    <div className={className ?? 'fw-medium hover-opaque'}
         style={styles.MyButton(backgroundColor, color, backdropFilter)}
         onClick={onClick}
    >
      {icon}
      {text}
    </div> :
    <div className={className ?? 'fw-medium hover-opaque'}
         style={styles.MyButton(backgroundColor, color, backdropFilter)}
         onClick={onClick}
    >
      {text}
      {icon}
    </div>
}

export default CustomButton;