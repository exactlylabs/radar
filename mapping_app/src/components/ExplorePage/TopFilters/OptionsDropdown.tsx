import {ChangeEventHandler, ReactElement} from "react";
import {styles} from "./styles/OptionsDropdown.style";
import Option from './Option';
import {Filter} from "../../../utils/types";
import {Asn, isAsn} from "../../../api/asns/types";
import MyOptionsDropdownSearchbar from "./MyOptionsDropdownSearchbar";
import {allProvidersElement} from "./utils/providers";
import { motion } from "framer-motion";

interface OptionsDropdownProps {
  options: Array<Filter>;
  selectedOption: Filter,
  setSelectedOption: (option: Filter) => void;
  dropLeft: boolean;
  dropRight: boolean;
  withSearchbar?: boolean;
  searchbarOnChange?: ChangeEventHandler;
}

const OptionsDropdown = ({
  options,
  selectedOption,
  setSelectedOption,
  dropLeft,
  dropRight,
  withSearchbar,
  searchbarOnChange
}: OptionsDropdownProps): ReactElement => {

  const handleSelectOption = (option: Filter) => setSelectedOption(option);

  return (
    <motion.div style={styles.OptionsDropdownContainer(dropLeft, dropRight)}
                initial={{opacity: 0, top: 45}}
                exit={{opacity: 0, top: 45}}
                animate={{opacity: 1, top: 50}}
                transition={{duration: 0.2}}
    >
      {
        withSearchbar &&
        <MyOptionsDropdownSearchbar
          type={'provider'}
          stickyOption={allProvidersElement}
          stickyOptionOnSelect={setSelectedOption}
          stickyOptionSelected={allProvidersElement.id === (selectedOption as Asn).id}
          onChange={searchbarOnChange}
        />
      }
      {
        options.map((option, index) => (
          <Option key={isAsn(option) ? option.id : option}
                  option={option}
                  selected={isAsn(option) ? (option as Asn).id === (selectedOption as Asn).id : option === selectedOption}
                  onClick={handleSelectOption}
                  isLast={index === (options.length - 1)}
          />
        ))
      }
    </motion.div>
  )
}

export default OptionsDropdown;