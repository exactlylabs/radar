import {ReactElement, useState} from "react";
import {styles} from "./styles/MenuContentHalf.style";
import GoBackIcon from "../../../../assets/go-back-arrow-icon.png";
import Option from "../../../ExplorePage/TopFilters/Option";
import {halves} from "../../../../utils/filters";
import CustomFullWidthButton from "../../CustomFullWidthButton";

interface MenuContentHalfProps {
  goBack: () => void;
  selectedOption: string;
  setSelectedOption: (option: string) => void;
}

const MenuContentHalf = ({
  goBack,
  selectedOption,
  setSelectedOption
}: MenuContentHalfProps): ReactElement => {

  const [innerValue, setInnerValue] = useState(selectedOption);

  const selectH1 = () => setInnerValue(halves[0]);
  const selectH2 = () => setInnerValue(halves[1]);

  const confirmSelection = () => {
    setSelectedOption(innerValue);
    goBack();
  }

  return (
    <div style={styles.MenuContentHalf}>
      <img src={GoBackIcon}
           style={styles.GoBackIcon}
           alt={'go-back'}
           onClick={goBack}
      />
      <p className={'fw-medium'} style={styles.Title}>Choose half-year</p>
      <div style={styles.ItemsContainer}>
        <Option option={halves[0]} selected={innerValue === halves[0]} onClick={selectH1}/>
        <Option option={halves[1]} selected={innerValue === halves[1]} onClick={selectH2}/>
      </div>
      <CustomFullWidthButton text={'Confirm'} onClick={confirmSelection}/>
    </div>
  )
}

export default MenuContentHalf;