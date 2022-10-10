import {ReactElement} from "react";
import {styles} from "./styles/Option.style";
import {CheckRounded} from "@mui/icons-material";
import {Filter} from "../../../utils/types";
import {isAsn} from "../../../api/asns/types";
import {capitalize} from "../../../utils/strings";
import OptionHorizontalDivider from "./OptionHorizontalDivider";

interface OptionProps {
  option: Filter;
  selected: boolean;
  onClick: (option: Filter) => void;
}

const Option = ({
  option,
  selected,
  onClick
}: OptionProps): ReactElement => {

  const handleClick = () => {
    onClick(option);
  }

  const getText = () => isAsn(option) ? capitalize(option.organization) : option;

  return (
    <>
      <div style={styles.Option} onClick={handleClick}>
        <p className={'hover-opaque'} style={styles.Text(selected)}>{getText()}</p>
        { !selected && <div style={styles.Icon}></div> }
        {  selected && <CheckRounded style={styles.Icon}/> }
      </div>
      <OptionHorizontalDivider />
    </>
  )
}

export default Option;