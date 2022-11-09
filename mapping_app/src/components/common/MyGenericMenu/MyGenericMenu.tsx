import {ReactElement} from "react";
import {styles} from "./styles/MyGenericMenu.style";
import CloseIcon from "../../../assets/close-icon.png";
import {Optional} from "../../../utils/types";

interface MyGenericMenuProps {
  content: Optional<ReactElement>;
  hasGoBack?: boolean;
  closeMenu: () => void;
}

const MyGenericMenu = ({
  content,
  hasGoBack,
  closeMenu
}: MyGenericMenuProps): ReactElement => {
  return (
    <div style={styles.MyGenericMenu} id={'my-generic-menu'}>
      <>
        {content}
      </>
      <img className={'hover-opaque'}
           src={CloseIcon}
           style={styles.CloseIcon}
           alt={'close-icon'}
           onClick={closeMenu}
      />
    </div>
  )
}

export default MyGenericMenu;