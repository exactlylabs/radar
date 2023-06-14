import {ReactElement} from "react";
import {styles} from "./styles/PopoverOption.style";
import {ArrowForwardRounded} from "@mui/icons-material";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

interface PopoverOptionProps {
  text: string;
  secondaryText?: string;
  light?: boolean;
  onClick: () => void;
  listMode?: boolean;
}

const PopoverOption = ({
  text,
  secondaryText,
  light,
  onClick,
  listMode
}: PopoverOptionProps): ReactElement => {

  const {isSmallScreen} = useViewportSizes();

  const getRegularContent = () => (
    <>
      <p className={'fw-medium'} style={styles.Text}>{text}</p>
      {secondaryText && <p className={'fw-light'} style={styles.SecondaryText}>{secondaryText}</p>}
      <ArrowForwardRounded style={styles.Arrow}/>
    </>
  )

  const getListContent = () => (
    <div className={'popover-option--content-wrapper'} style={styles.PopoverOptionContentWrapper}>
      <p className={'fw-medium'} style={styles.Text}>{text}</p>
      {secondaryText && <p className={'fw-light'} style={styles.SecondaryText}>{secondaryText}</p>}
      <ArrowForwardRounded style={styles.Arrow}/>
    </div>
  )

  const getContent = () => {
    return listMode ? getListContent() : getRegularContent();
  }

  return (
    <div className={`hover-popover-option-lighter ${light ? 'popover-light' : 'popover-dark'}`}
         style={styles.PopoverOptionContainer(isSmallScreen, light)}
         onClick={onClick}
    >
      { getContent() }
    </div>
  )
}

export default PopoverOption;