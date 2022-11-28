import {ReactElement, useState} from "react";
import {styles} from "./styles/MenuContentYearOrMonth.style";
import GoBackIcon from "../../../../assets/go-back-arrow-icon.png";
import Option from "../../../ExplorePage/TopFilters/Option";
import CustomFullWidthButton from "../../CustomFullWidthButton";

interface MenuContentYearOrMonthProps {
  goBack: () => void;
  options: Array<string | number>;
  type: string;
  selectedOption: string | number;
  setSelectedOption: (option: string | number) => void;
}

const MenuContentYearOrMonth = ({
  goBack,
  options,
  type,
  selectedOption,
  setSelectedOption,
}: MenuContentYearOrMonthProps): ReactElement => {

  const [innerOption, setInnerOption] = useState<string | number>(selectedOption);

  const confirmSelection = () => {
    setSelectedOption(innerOption);
    goBack();
  }

  return (
    <div style={styles.MenuContentYearOrMonth}>
      <img src={GoBackIcon}
           style={styles.GoBackIcon}
           alt={'go-back'}
           onClick={goBack}
      />
      <p className={'fw-medium'} style={styles.Title}>{`Choose a ${type}`}</p>
      <div style={styles.ItemsContainer}>
        <div style={styles.ScrollableContainer}>
          {
            options.map((option, index) => (
              <Option key={option}
                      option={option.toString()}
                      selected={innerOption === option}
                      onClick={() => setInnerOption(option)}
              />
            ))
          }
        </div>
      </div>
      <CustomFullWidthButton text={'Confirm'} onClick={confirmSelection}/>
    </div>
  )
}

export default MenuContentYearOrMonth;