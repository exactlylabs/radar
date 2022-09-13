import {ReactElement} from "react";
import {styles} from "./styles/MyButton.style";

interface MyButtonProps {
  text: string;
  icon?: ReactElement;
  backgroundColor?: string;
  color?: string;
  iconFirst?: boolean;
  onClick: () => void;
}

const MyButton = ({
  text,
  icon,
  backgroundColor,
  color,
  iconFirst,
  onClick
}: MyButtonProps): ReactElement => {

  return iconFirst ?
    <div className={'fw-medium hover-opaque'}
         style={styles.MyButton(backgroundColor, color)}
         onClick={onClick}
    >
      {icon}
      {text}
    </div> :
    <div className={'fw-medium hover-opaque'}
         style={styles.MyButton(backgroundColor, color)}
         onClick={onClick}
    >
      {text}
      {icon}
    </div>
}

export default MyButton;