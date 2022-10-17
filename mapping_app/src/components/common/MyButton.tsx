import {ReactElement} from "react";
import {styles} from "./styles/MyButton.style";

interface MyButtonProps {
  text: string;
  icon?: ReactElement;
  backgroundColor?: string;
  color?: string;
  iconFirst?: boolean;
  onClick: () => void;
  className?: string;
  backdropFilter?: string;
}

const MyButton = ({
  text,
  icon,
  backgroundColor,
  backdropFilter,
  color,
  iconFirst,
  onClick,
  className
}: MyButtonProps): ReactElement => {

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

export default MyButton;