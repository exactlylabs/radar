import {ChangeEvent, ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/SpecificExplorationPopoverContent.style";
import {ArrowBackRounded} from "@mui/icons-material";
import {popoverStates} from "./ExplorationPopover";
import PopoverSearchbar from "./PopoverSearchbar";
import PopoverOption from "./PopoverOption";
import {Optional} from "../../../utils/types";
import {Geospace, GeospaceInfo, GeospaceOverview} from "../../../api/geospaces/types";
import {getOverview} from "../../../api/geospaces/requests";

interface SpecificExplorationPopoverContentProps {
  type: string;
  setType: (type: string) => void;
  goBack: () => void;
  selectGeospace: (geospace: GeospaceOverview) => void;
  states: Array<Geospace>;
  indexedCounties: any;
  tribalTracts: Array<Geospace>;
}

const SpecificExplorationPopoverContent = ({
  type,
  setType,
  goBack,
  selectGeospace,
  states,
  indexedCounties,
  tribalTracts
}: SpecificExplorationPopoverContentProps): ReactElement => {

  const [allItems, setAllItems] = useState<Array<Geospace>>([]);
  const [filteredItems, setFilteredItems] = useState<Array<Geospace>>([]);
  const [selectedOption, setSelectedOption] = useState<Optional<Geospace>>(null);
  const [inputText, setInputText] = useState<string>('');

  useEffect(() => {
    let items: Array<Geospace>;
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
        if(selectedOption) title = selectedOption.name;
        else title = '';
        break;
      default:
        title = 'States';
        break;
    }
    return title;
  }

  const handleSelectOption = async (option: Geospace, index: number) => {
    setSelectedOption(option);
    if(type !== popoverStates.COUNTIES) {
      const response: GeospaceOverview = await getOverview(option.id, '');
      const allData: GeospaceInfo = {
        ...response,
        geospace: {...option},
      };
      await selectGeospace(allData);
    } else {
      setType(popoverStates.SPECIFIC_STATE);
      setInputText('');
    }
  }

  const getContent = () => {
    if(filteredItems.length === 0) {
      return (
        <div style={styles.NoResultsContainer}>
          <p className={'fw-light'}>No results for </p>
          <p className={'fw-medium'} style={styles.SearchedTerm}>{inputText}</p>
        </div>
      );
    } else {
      return filteredItems.map((item, index) =>
        <PopoverOption key={item.id}
                       text={item.name}
                       secondaryText={type === popoverStates.COUNTIES && item.parent ? item.parent.name : undefined}
                       onClick={() => handleSelectOption(item, index)}
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
      <PopoverSearchbar handleInputChange={handleInputChange}
                        text={inputText}
                        setText={handleSetText}
      />
      {type === popoverStates.COUNTIES && <p className={'fw-light'} style={styles.StateSelectionText()}>Start by choosing a state...</p>}
      <div style={styles.ContentContainer(type)}>
        {getContent()}
      </div>
    </div>
  )
}

export default SpecificExplorationPopoverContent;