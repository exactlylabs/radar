import {ChangeEvent, ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/SpecificExplorationPopoverContent.style";
import {ArrowBackRounded} from "@mui/icons-material";
import {popoverStates} from "./ExplorationPopover";
import PopoverSearchbar from "./PopoverSearchbar";
import PopoverOption from "./PopoverOption";
import {Optional} from "../../../utils/types";
import {DetailedGeospace, GeospaceInfo, GeospaceOverview} from "../../../api/geospaces/types";
import {getOverview} from "../../../api/geospaces/requests";
import './styles/SpecificExplorationPopoverContent.css';
import {emptyGeoJSONFilters} from "../../../api/geojson/types";
import {getZoomForNamespace, GeospacesTabs} from "../../../utils/filters";
import MyExplorationPopoverLoader from "./MyExplorationPopoverLoader";
import './styles/SpecificExplorationPopoverContent.css';

interface SpecificExplorationPopoverContentProps {
  type: string;
  setType: (type: string) => void;
  goBack: () => void;
  selectGeospace: (geospace: GeospaceOverview) => void;
  states: Array<DetailedGeospace>;
  tribalTracts: Array<DetailedGeospace>;
  indexedCounties: any;
  setCenter: (center: Array<number>) => void;
  setZoom: (zoom: number) => void;
  loading: boolean;
  setLoading: (state: boolean) => void;
  selectedOption: Optional<DetailedGeospace>;
  setSelectedOption: (newOption: DetailedGeospace) => void;
}

const SpecificExplorationPopoverContent = ({
  type,
  setType,
  goBack,
  selectGeospace,
  states,
  indexedCounties,
  tribalTracts,
  setCenter,
  setZoom,
  loading,
  setLoading,
  selectedOption,
  setSelectedOption
}: SpecificExplorationPopoverContentProps): ReactElement => {

  const [allItems, setAllItems] = useState<Array<DetailedGeospace>>([]);
  const [filteredItems, setFilteredItems] = useState<Array<DetailedGeospace>>([]);
  const [inputText, setInputText] = useState<string>('');

  useEffect(() => {
    let items: Array<DetailedGeospace>;
    switch (type) {
      case popoverStates.STATES:
        items = states;
        break;
      case popoverStates.COUNTIES:
        items = states;
        break;
      case popoverStates.SPECIFIC_STATE:
        if (selectedOption !== null && selectedOption !== undefined)
          items = indexedCounties[selectedOption.name];
        else
          items = [];
        break;
      case popoverStates.TRIBAL_LANDS:
        items = tribalTracts;
        break;
      default:
        items = states;
        break;
    }
    setAllItems(items);
    setFilteredItems(items);
  }, [type, loading, states, tribalTracts]);

  const getTitle = () => {
    let title: string = '';
    switch (type) {
      case popoverStates.STATES:
        title = 'Browse by States';
        break;
      case popoverStates.COUNTIES:
        title = 'Browse by Counties';
        break;
      case popoverStates.TRIBAL_LANDS:
        title = 'Browse by Tribal Lands';
        break;
      case popoverStates.SPECIFIC_STATE:
        if(selectedOption) title = selectedOption.name;
        else title = '';
        break;
      default:
        title = 'States';
        break;
    }
    return title;
  }

  const handleSelectOption = async (option: DetailedGeospace) => {
    if(type !== popoverStates.SPECIFIC_STATE) setSelectedOption(option);
    if(type !== popoverStates.COUNTIES) {
      const response: GeospaceOverview = await getOverview(option.id, emptyGeoJSONFilters);
      const allData: GeospaceInfo = {
        ...response,
        geospace: option,
      };
      await selectGeospace(allData);
    } else {
      const center: Array<number> = [option.centroid[0], option.centroid[1]];
      setCenter(center);
      setZoom(getZoomForNamespace(GeospacesTabs.STATES));
      setType(popoverStates.SPECIFIC_STATE);
      setInputText('');
    }
  }

  const getContent = () => {
    if(!filteredItems || filteredItems.length === 0) {
      return (
        <div style={styles.NoResultsContainer}>
          <p className={'fw-light'}>No results for </p>
          <p className={'fw-medium'} style={styles.SearchedTerm}>{inputText}</p>
          <p className={'fw-light'}>.</p>
        </div>
      );
    } else {
      return filteredItems.map((item) =>
        <PopoverOption key={item.id}
                       text={item.name}
                       secondaryText={type === popoverStates.COUNTIES && item.parent ? item.parent.name : undefined}
                       onClick={() => handleSelectOption(item)}
                       listMode
        />
      );
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const filterText = e.target.value;
    setInputText(filterText);
    setFilteredItems(allItems.filter(item => item.name?.toLowerCase().includes(filterText.toLowerCase())));
  }

  const handleSetText = (text: string) => {
    setInputText(text);
    setFilteredItems(allItems.filter(item => item.name.toLowerCase().includes(text.toLowerCase())));
  }

  return (
    <div style={styles.SpecificExplorationPopoverContentContainer}>
      <div style={styles.Header}>
        <ArrowBackRounded style={styles.ArrowBack} onClick={goBack}/>
        <p className={'fw-medium'} style={styles.Title}>{getTitle()}</p>
      </div>
      { loading && <MyExplorationPopoverLoader/> }
      {
        !loading &&
        <>
          <PopoverSearchbar handleInputChange={handleInputChange}
                            text={inputText}
                            setText={handleSetText}
                            disabled={loading}
          />
          {!loading && type === popoverStates.COUNTIES && <p className={'fw-light'} style={styles.StateSelectionText}>Choose a state...</p>}
          <div style={styles.ContentContainer(type)} id={'exploration-popover--content-container'}>
            {getContent()}
          </div>
        </>
      }
    </div>
  )
}

export default SpecificExplorationPopoverContent;