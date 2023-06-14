import {ReactElement, useState} from "react";
import {Quarters, quartersWithRange} from "../../../../utils/filters";
import {styles} from "./styles/ModalContentQuarter.style";
import GoBackIcon from "../../../../assets/go-back-arrow-icon.png";
import Option from "../../../ExplorePage/TopFilters/Option";
import CustomFullWidthButton from "../../CustomFullWidthButton";

interface ModalContentQuarterProps {
  goBack: () => void;
  selectedOption: string;
  setSelectedOption: (option: string) => void;
}

const ModalContentQuarter = ({
  goBack,
  selectedOption,
  setSelectedOption,
}: ModalContentQuarterProps): ReactElement => {

  const [innerValue, setInnerValue] = useState(selectedOption);

  const selectQ1 = () => setInnerValue(Quarters.Q1);
  const selectQ2 = () => setInnerValue(Quarters.Q2);
  const selectQ3 = () => setInnerValue(Quarters.Q3);
  const selectQ4 = () => setInnerValue(Quarters.Q4);

  const confirmSelection = () => {
    setSelectedOption(innerValue);
    goBack();
  }

  return (
    <div style={styles.ModalContentQuarter}>
      <img src={GoBackIcon}
           style={styles.GoBackIcon}
           alt={'go-back'}
           onClick={goBack}
      />
      <p className={'fw-medium'} style={styles.Title}>Choose a quarter</p>
      <div style={styles.ItemsContainer}>
        <Option option={quartersWithRange[Quarters.Q1]} selected={innerValue === Quarters.Q1} onClick={selectQ1}/>
        <Option option={quartersWithRange[Quarters.Q2]} selected={innerValue === Quarters.Q2} onClick={selectQ2}/>
        <Option option={quartersWithRange[Quarters.Q3]} selected={innerValue === Quarters.Q3} onClick={selectQ3}/>
        <Option option={quartersWithRange[Quarters.Q4]} selected={innerValue === Quarters.Q4} onClick={selectQ4}/>
      </div>
      <CustomFullWidthButton text={'Confirm'} onClick={confirmSelection}/>
    </div>
  )
}

export default ModalContentQuarter;