import {ChangeEvent, ReactElement, useContext, useEffect, useState} from "react";
import {Filter, Optional} from "../../../../utils/types";
import {Asn} from "../../../../api/asns/types";
import {allProvidersElement} from "../../../ExplorePage/TopFilters/utils/providers";
import {getAsns, getAsnsForGeospace} from "../../../../api/asns/requests";
import {handleError} from "../../../../api";
import {debounce} from "../../../../api/utils/debouncer";
import SearchbarIcon from "../../../../assets/search-icon.png";
import Option from "../../../ExplorePage/TopFilters/Option";
import OptionHorizontalDivider from "../../../ExplorePage/TopFilters/OptionHorizontalDivider";
import {styles} from "./styles/ModalContentProviders.style";
import CustomFullWidthButton from "../../CustomFullWidthButton";
import AlertsContext, {SNACKBAR_TYPES} from "../../../../context/AlertsContext";

interface ModalContentProvidersProps {
  geospaceId: Optional<string>;
  selectedOption: Asn;
  setSelectedOption: (option: Asn) => void;
  closeModal: () => void;
}


const ModalContentProviders = ({
  geospaceId,
  selectedOption,
  setSelectedOption,
  closeModal
}: ModalContentProvidersProps): ReactElement => {

  const { showSnackbarMessage } = useContext(AlertsContext);
  const [innerOption, setInnerOption] = useState<Optional<Asn>>(selectedOption);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providers, setProviders] = useState<Array<Asn>>([allProvidersElement]);

  useEffect(() => {
    setProvidersLoading(true);
    if(geospaceId) {
      getAsnsForGeospace(geospaceId)
        .then(res => { setProviders(res.results) })
        .catch(err => {
          handleError(err);
          showSnackbarMessage('An error has occurred while loading namespaces. Please try again later.', SNACKBAR_TYPES.ERROR);
        })
        .finally(() => setProvidersLoading(false));
    } else {
      getAsns()
        .then(res => {
          setProviders(res.results);
        })
        .catch(err => {
          handleError(err);
          showSnackbarMessage('An error has occurred while loading providers. Please try again later.', SNACKBAR_TYPES.ERROR);
        })
        .finally(() => setProvidersLoading(false));
    }
  }, [geospaceId]);

  const handleProviderSearchbarChange = debounce(async (e: ChangeEvent<HTMLInputElement>) => {
    setProvidersLoading(true);
    const value: string = e.target.value;
    if(geospaceId) {
      getAsnsForGeospace(geospaceId, value)
        .then(res => setProviders(res.results))
        .catch(err => {
          handleError(err);
          showSnackbarMessage('An error has occurred while loading providers. Please try again later.', SNACKBAR_TYPES.ERROR);
        })
        .finally(() => setProvidersLoading(false));
    } else {
      getAsns(value)
        .then(res => setProviders(res.results))
        .catch(err => {
          handleError(err);
          showSnackbarMessage('An error has occurred while loading providers. Please try again later.', SNACKBAR_TYPES.ERROR);
        })
        .finally(() => setProvidersLoading(false));
    }
  });

  const applyOptionSelected = () => {
    setSelectedOption(innerOption ?? allProvidersElement);
    closeModal();
  }

  const handleSelectOption = (option: Filter) => {
    setInnerOption(option as Asn);
  }

  return (
    <div style={styles.ModalContentProviders}>
      <p className={'fw-medium'} style={styles.Title}>Filter by provider</p>
      <div style={styles.ModalContentProvidersSearchbarContainer}>
        <img src={SearchbarIcon} style={styles.SearchbarIcon} alt={'searchbar-icon'}/>
        <input style={styles.Input}
               placeholder={'Search'}
               onChange={handleProviderSearchbarChange}
               className={'fw-light'}
               id={'menu-content-providers--searchbar'}
        />
      </div>
      <div style={styles.ModalContentProvidersContainer}>
        <div style={styles.ScrollableContainer}>
          <Option option={allProvidersElement}
                  selected={allProvidersElement.id === innerOption?.id}
                  onClick={() => handleSelectOption(allProvidersElement)}
          />
          {
            !!selectedOption &&
            selectedOption?.id !== allProvidersElement.id &&
            <Option option={selectedOption} selected={selectedOption?.id === innerOption?.id} onClick={() => handleSelectOption(selectedOption)}/>
          }
          <OptionHorizontalDivider/>
          {
            providers
              .filter(provider => provider.id !== selectedOption?.id)
              .map(provider => (
                <Option key={provider.id}
                        option={provider}
                        selected={provider.id === innerOption?.id}
                        onClick={() => handleSelectOption(provider)}
                />
              ))
          }
        </div>
      </div>
      <CustomFullWidthButton text={'Apply'} onClick={applyOptionSelected}/>
    </div>
  )
}

export default ModalContentProviders;