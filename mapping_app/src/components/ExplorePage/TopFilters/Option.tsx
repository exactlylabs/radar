import {ReactElement} from "react";
import {styles} from "./styles/Option.style";
import GreenCheckIcon from '../../../assets/green-check-icon.png';
import ChevronRight from '../../../assets/chevron-right.png';
import {Filter} from "../../../utils/types";
import {isAsn} from "../../../api/asns/types";
import {capitalize} from "../../../utils/strings";
import OptionHorizontalDivider from "./OptionHorizontalDivider";
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import {CalendarFilters} from "../../../utils/filters";

interface OptionProps {
  option: Filter;
  selected: boolean;
  onClick: (option: Filter) => void;
  isLast?: boolean;
}

const Option = ({
  option,
  selected,
  onClick,
  isLast,
}: OptionProps): ReactElement => {

  const {isSmallScreen} = useViewportSizes();

  const handleClick = () => {
    onClick(option);
  }

  const getText = () => isAsn(option) ? capitalize(option.organization) : option;

  const lastOption = (
    <>
      <div style={styles.Option(isSmallScreen, false)} onClick={handleClick}>
        <p className={`hover-opaque ${selected ? 'fw-medium' : 'fw-regular'}`} style={styles.Text(selected, isSmallScreen)}>{getText()}</p>
        { !selected && <div style={styles.Icon}></div> }
        {  selected && <img src={GreenCheckIcon} style={styles.Icon} alt={'green-check-icon'}/> }
      </div>
    </>
  );

  const lastOptionWithStyle = (
    <>
      <OptionHorizontalDivider/>
      <div style={styles.Option(isSmallScreen, true)} onClick={handleClick}>
        <p className={`hover-opaque ${selected ? 'fw-medium' : 'fw-regular'}`} style={styles.Text(selected, isSmallScreen)}>{getText()}</p>
        { !selected && <div style={styles.Icon}></div> }
        {  selected && <img src={GreenCheckIcon} style={styles.Icon} alt={'green-check-icon'}/> }
        { !isAsn(option) && option === CalendarFilters.CUSTOM_DATE && <img src={ChevronRight} style={styles.Icon} alt={'right-chevron'}/> }
      </div>
    </>
  );

  return isLast ? lastOptionWithStyle : lastOption;
}

export default Option;