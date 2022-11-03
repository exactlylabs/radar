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
    <div style={styles.MyGenericMenuProps}>
      <img className={'hover-opaque'}
           src={CloseIcon}
           style={styles.CloseIcon}
           alt={'close-icon'}
           onClick={closeMenu}
      />
      <>
        {content}
      </>
    </div>
  )
}

export default MyGenericMenu;