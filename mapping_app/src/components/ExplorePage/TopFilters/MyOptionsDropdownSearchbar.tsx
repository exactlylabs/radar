import {ChangeEventHandler, ReactElement} from "react";
import {styles} from "./styles/MyOptionsDropdownSearchbar.style";
import Option from "./Option";
import {Filter} from "../../../utils/types";

interface MyOptionsDropdownSearchbarProps {
  type: string;
  onChange?: ChangeEventHandler;
  stickyOption?: Filter;
  stickyOptionSelected?: boolean;
  stickyOptionOnSelect?: (option: Filter) => void;
}

const MyOptionsDropdownSearchbar = ({
  type,
  onChange,
  stickyOption,
  stickyOptionSelected,
  stickyOptionOnSelect
}: MyOptionsDropdownSearchbarProps): ReactElement => {
  return (
    <div style={styles.MyOptionsDropdownSearchbarContainer}>
      { stickyOption !== undefined &&
        stickyOptionSelected !== undefined &&
        stickyOptionOnSelect !== undefined &&
        <Option option={stickyOption} selected={stickyOptionSelected} onClick={stickyOptionOnSelect}/>
      }
      <p className={'fw-regular'} style={styles.Title}>{`Or search for a ${type}...`}</p>
      <input style={styles.Input}
             className={'fw-light'}
             onChange={onChange}
             placeholder={`Search...`}
             id={'providers-input'}
      />
    </div>
  )
}

export default MyOptionsDropdownSearchbar;