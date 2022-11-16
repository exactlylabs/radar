import {ReactElement, useState} from "react";
import GoBackIcon from "../../../../assets/go-back-arrow-icon.png";
import MyFullWidthButton from "../../MyFullWidthButton";
import Option from "../../../ExplorePage/TopFilters/Option";
import {styles} from "./styles/ModalContentYearOrMonth.style";

interface ModalContentYearOrMonthProps {
  goBack: () => void;
  options: Array<string | number>;
  type: string;
  selectedOption: string | number;
  setSelectedOption: (option: string | number) => void;
}

const ModalContentYearOrMonth = ({
  goBack,
  options,
  type,
  selectedOption,
  setSelectedOption
}: ModalContentYearOrMonthProps): ReactElement => {

  const [innerOption, setInnerOption] = useState<string | number>(selectedOption);

  const confirmSelection = () => {
    setSelectedOption(innerOption);
    goBack();
  }

  return (
    <div style={styles.ModalContentYearOrMonth}>
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
      <MyFullWidthButton text={'Confirm'} onClick={confirmSelection}/>
    </div>
  )
}

export default ModalContentYearOrMonth;