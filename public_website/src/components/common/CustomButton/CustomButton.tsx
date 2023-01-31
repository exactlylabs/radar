import {ReactElement} from "react";
import {styles} from "./styles/CustomButton.style";

interface CustomButtonProps {
  text: string;
  backgroundColor?: string;
  boxShadow?: string;
  color?: string;
  icon?: ReactElement;
  iconFirst?: boolean;
  link: string;
  openNewTab?: boolean;
}

const CustomButton = ({
  text,
  backgroundColor,
  boxShadow,
  color,
  icon,
  iconFirst,
  link,
  openNewTab
}: CustomButtonProps): ReactElement => {

  return (
    <a style={styles.CustomButton(backgroundColor, boxShadow)}
         className={'hover-opaque'}
         href={link}
         target={openNewTab ? '_blank' : '_self'}
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
    </a>
  )
}

export default CustomButton;