import {ReactElement, useState} from "react";
import {styles} from "./styles/ModalContentSpeedType.style";
import {speedFilters} from "../../../../utils/filters";
import Option from "../../../ExplorePage/TopFilters/Option";
import MyFullWidthButton from "../../MyFullWidthButton";

interface ModalContentSpeedTypeProps {
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  closeModal: () => void;
}

const ModalContentSpeedType = ({
  selectedOption,
  setSelectedOption,
  closeModal
}: ModalContentSpeedTypeProps): ReactElement => {

  const [innerOption, setInnerOption] = useState(selectedOption);

  const selectDownload = () => setSelectedOption(speedFilters[0]);
  const selectUpload = () => setSelectedOption(speedFilters[1]);

  const previewDownloadSelected = () => setInnerOption(speedFilters[0]);
  const previewUploadSelected = () => setInnerOption(speedFilters[1]);

  const applyOptionSelected = () => {
    innerOption === speedFilters[0] ?
      selectDownload() : selectUpload();
    closeModal();
  }

  return (
    <div style={styles.ModalContentSpeedType}>
      <p className={'fw-medium'} style={styles.Title}>Filter speeds by</p>
      <div style={styles.ModalContentSpeedTypeContainer}>
        <Option option={speedFilters[0]}
                selected={innerOption === speedFilters[0]}
                onClick={previewDownloadSelected}
        />
        <Option option={speedFilters[1]}
                selected={innerOption === speedFilters[1]}
                onClick={previewUploadSelected}
        />
      </div>
      <MyFullWidthButton text={'Apply'} onClick={applyOptionSelected}/>
    </div>
  )
}

export default ModalContentSpeedType;