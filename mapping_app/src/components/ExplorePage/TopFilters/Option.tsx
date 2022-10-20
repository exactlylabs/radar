import {ReactElement} from "react";
import {styles} from "./styles/Option.style";
import GreenCheckIcon from '../../../assets/green-check-icon.png';
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
  onClick,
}: OptionProps): ReactElement => {

  const handleClick = () => {
    onClick(option);
  }

  const getText = () => isAsn(option) ? capitalize(option.organization) : option;

  return (
    <>
      <div style={styles.Option} onClick={handleClick}>
        <p className={`hover-opaque ${selected ? 'fw-medium' : 'fw-regular'}`} style={styles.Text(selected)}>{getText()}</p>
        { !selected && <div style={styles.Icon}></div> }
        {  selected && <img src={GreenCheckIcon} style={styles.Icon} alt={'green-check-icon'}/> }
      </div>
    </>
  )
}

export default Option;