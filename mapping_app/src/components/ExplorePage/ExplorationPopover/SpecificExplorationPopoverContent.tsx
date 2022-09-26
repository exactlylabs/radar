import {ChangeEvent, ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/SpecificExplorationPopoverContent.style";
import {ArrowBackRounded} from "@mui/icons-material";
import {popoverStates} from "./ExplorationPopover";
import PopoverSearchbar from "./PopoverSearchbar";
import {counties, GeographicalCategory, isState, State, states, tribalLands} from "../../../utils/geographicalLists";
import PopoverOption from "./PopoverOption";
import {InputText, Optional} from "../../../utils/types";

interface SpecificExplorationPopoverContentProps {
  type: string;
  setType: (type: string) => void;
  goBack: () => void;
}

const SpecificExplorationPopoverContent = ({
  type,
  setType,
  goBack,
}: SpecificExplorationPopoverContentProps): ReactElement => {

  const [allItems, setAllItems] = useState<Array<GeographicalCategory>>([]);
  const [filteredItems, setFilteredItems] = useState<Array<GeographicalCategory>>([]);
  const [selectedOption, setSelectedOption] = useState<Optional<GeographicalCategory>>(null);
  const [inputText, setInputText] = useState<string>('');

  useEffect(() => {
    let items: Array<GeographicalCategory>;
    switch (type) {
      case popoverStates.STATES:
        items = states;
        break;
      case popoverStates.COUNTIES:
        items = states;
        break;
      case popoverStates.SPECIFIC_STATE:
        if (selectedOption !== null && selectedOption !== undefined)
          items = counties.filter(county => county.state.title === selectedOption.title);
        else
          items = [];
        break;
      case popoverStates.TRIBAL_LANDS:
        items = tribalLands;
        break;
      default:
        items = states;
        break;
    }
    setAllItems(items);
    setFilteredItems(items);
  }, [type]);

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
        if(selectedOption) title = selectedOption.title;
        else title = '';
        break;
      default:
        title = 'States';
        break;
    }
    return title;
  }

  const handleSelectOption = (option: GeographicalCategory) => {
    setSelectedOption(option);
    if(type === popoverStates.COUNTIES) setType(popoverStates.SPECIFIC_STATE);
  }

  const getContent = () => {
    if(filteredItems.length === 0) {
      return (
        <div style={styles.NoResultsContainer()}>
          <p className={'fw-light'}>No results for </p>
          <p className={'fw-medium'} style={styles.SearchedTerm()}>{inputText}</p>
        </div>
      );
    } else {
      return filteredItems.map(item =>
        <PopoverOption key={item.title}
                       text={item.title}
                       secondaryText={isState(item) ? item.abbreviation : undefined}
                       onClick={() => handleSelectOption(item)}
        />
      );
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const filterText = e.target.value;
    setInputText(filterText);
    setFilteredItems(allItems.filter(item => item.title.toLowerCase().includes(filterText.toLowerCase())));
  }

  const handleSetText = (text: string) => {
    setInputText(text);
    setFilteredItems(allItems.filter(item => item.title.toLowerCase().includes(text.toLowerCase())));
  }

  return (
    <div style={styles.SpecificExplorationPopoverContentContainer()}>
      <div style={styles.Header()}>
        <ArrowBackRounded style={styles.ArrowBack()} onClick={goBack}/>
        <p className={'fw-medium'} style={styles.Title()}>{getTitle()}</p>
      </div>
      <PopoverSearchbar handleInputChange={handleInputChange}
                        text={inputText}
                        setText={handleSetText}
      />
      { type === popoverStates.COUNTIES && <p className={'fw-light'} style={styles.StateSelectionText()}>Start by choosing a state...</p> }
      <div style={styles.ContentContainer(type)}>
        {getContent()}
      </div>
    </div>
  )
}

export default SpecificExplorationPopoverContent;