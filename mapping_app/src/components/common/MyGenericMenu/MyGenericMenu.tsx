import {ReactElement} from "react";
import {styles} from "./styles/MyGenericMenu.style";
import CloseIcon from "../../../assets/close-icon.png";
import {Optional} from "../../../utils/types";

interface MyGenericMenuProps {
  children: Optional<ReactElement>;
  closeMenu: () => void;
}

const MyGenericMenu = ({
  children,
  closeMenu
}: MyGenericMenuProps): ReactElement => {
  return (
    <>
      <div style={styles.Shadow} onClick={closeMenu}></div>
      <div style={styles.MyGenericMenu} id={'my-generic-menu'}>
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

export default MyGenericMenu;