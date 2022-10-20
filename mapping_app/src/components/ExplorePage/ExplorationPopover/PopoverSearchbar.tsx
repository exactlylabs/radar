import {ChangeEventHandler, ReactElement} from "react";
import SearchIcon from '../../../assets/search-icon.png';
import {styles} from "./styles/PopoverSearchbar.style";
import {ClearRounded} from "@mui/icons-material";
import {InputText} from "../../../utils/types";

interface PopoverSearchbarProps {
  handleInputChange: ChangeEventHandler;
  text: InputText;
  setText: (text: string) => void;
  disabled?: boolean;
}

const PopoverSearchbar = ({
  handleInputChange,
  text,
  setText,
  disabled
}: PopoverSearchbarProps): ReactElement => {

  const clearInput = () => setText('');

  return (
    <div style={styles.PopoverSearchbarContainer}>
      <div style={styles.IconContainer}>
        <img src={SearchIcon} style={styles.SearchIcon} alt={'search-icon'}/>
      </div>
      <input placeholder={'Search...'}
             id={'popover-searchbar'}
             className={'fw-light'}
             style={styles.Input}
             onChange={handleInputChange}
             value={text}
             disabled={!!disabled}
       />
      {
        !!text &&
        <div className={'hover-opaque'}
             style={styles.ClearIconContainer}
             onClick={clearInput}
        >
          <ClearRounded style={styles.ClearIcon}/>
        </div>
      }
      {
        !text &&
        <div style={styles.ClearIconContainer}></div>
      }
    </div>
  )
}

export default PopoverSearchbar;