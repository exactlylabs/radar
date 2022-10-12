import {ChangeEventHandler, ReactElement} from "react";
import {styles} from "./styles/MyOptionsDropdownSearchbar.style";

interface MyOptionsDropdownSearchbarProps {
  onChange?: ChangeEventHandler;
}

const MyOptionsDropdownSearchbar = ({
  onChange
}: MyOptionsDropdownSearchbarProps): ReactElement => {
  return (
    <input style={styles.Input}
           className={'fw-medium'}
           onChange={onChange}
           placeholder={`Enter provider's name...`}
    />
  )
}

export default MyOptionsDropdownSearchbar;