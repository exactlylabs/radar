import {ReactElement} from "react";
import {styles} from "./styles/OptionsDropright.style";
import Option from "../TopFilters/Option";

interface OptionsDroprightProps {
  options: Array<any>;
  selectedOption: any;
  setSelectedOption: (option: any) => void;
  bottomAligned?: boolean;
  isSelectedFn?: (option: any, selectedOption: any) => boolean;
}

const OptionsDropright = ({
  options,
  selectedOption,
  setSelectedOption,
  bottomAligned,
  isSelectedFn,
}: OptionsDroprightProps): ReactElement => {
  return (
    <div style={styles.OptionsDroprightContainer(bottomAligned)}>
      {
        options.map(option => (
          <Option key={option}
                  option={option}
                  selected={!!isSelectedFn ? isSelectedFn(option, selectedOption) : option === selectedOption}
                  onClick={() => setSelectedOption(option)}
          />
        ))
      }
    </div>
  )
}

export default OptionsDropright;