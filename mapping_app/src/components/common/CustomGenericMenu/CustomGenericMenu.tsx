import {ReactElement} from "react";
import {styles} from "./styles/CustomGenericMenu.style";
import CloseIcon from "../../../assets/close-icon.png";
import {Optional} from "../../../utils/types";
import {isIphoneAndSafari} from "../../../utils/iphone";

interface CustomGenericMenuProps {
  children: Optional<ReactElement>;
  closeMenu: () => void;
  isDarker: boolean;
}

const CustomGenericMenu = ({
  children,
  closeMenu,
  isDarker
}: CustomGenericMenuProps): ReactElement => {
  return (
    <>
      <div style={styles.Shadow} onClick={closeMenu}></div>
      <div style={styles.MyGenericMenu(isDarker, isIphoneAndSafari())} id={'my-generic-menu'}>
        <>
          {children}
        </>
        <img className={'hover-opaque'}
             src={CloseIcon}
             style={styles.CloseIcon}
             alt={'close-icon'}
             onClick={closeMenu}
        />
      </div>
    </>
  )
}

export default CustomGenericMenu;