import React, {ReactElement, useContext, useEffect, useState} from "react";
import {styles} from "./styles/ExplorationPopover.style";
import InitialExplorationPopoverContent from "./InitialExplorationPopoverContent";
import SpecificExplorationPopoverContent from "./SpecificExplorationPopoverContent";
import {DetailedGeospace, GeospaceOverview} from "../../../api/geospaces/types";
import {getGeospaces} from "../../../api/namespaces/requests";
import {handleError} from "../../../api";
import DiagonalArrow from '../../../assets/diagonal-arrow.png';
import CloseIconLight from '../../../assets/close-icon-light.png';
import {GeospacesTabs} from "../../../utils/filters";
import ExplorationPopoverIcon from "./ExplorationPopoverIcon";
import {Optional} from "../../../utils/types";
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import AlertsContext, {SNACKBAR_TYPES} from "../../../context/AlertsContext";


interface ExplorationPopoverProps {
  closePopover: () => void;
  selectGeospace: (geospace: GeospaceOverview) => void;
  setGeospaceNamespace: (namespace: string) => void;
  recenterMap: () => void;
  setCenter: (center: Array<number>) => void;
  setZoom: (zoom: number) => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  isRightPanelOpen: boolean;
  isRightPanelHidden: boolean;
}

export enum popoverStates {
  INITIAL = 'INITIAL',
  STATES = 'STATES',
  SPECIFIC_STATE = 'SPECIFIC_STATE',
  COUNTIES = 'COUNTIES',
  TRIBAL_LANDS = 'TRIBAL_LANDS',
}

const ExplorationPopover = ({
  selectGeospace,
  setGeospaceNamespace,
  recenterMap,
  setCenter,
  setZoom,
  isOpen,
  setIsOpen,
  isRightPanelOpen,
  isRightPanelHidden
}: ExplorationPopoverProps): ReactElement => {

  const { showSnackbarMessage } = useContext(AlertsContext);
  const {isSmallScreen, isSmallTabletScreen, isLargeTabletScreen, isTabletScreen} = useViewportSizes();
  const isSmallExplorationPopover = isSmallScreen || isSmallTabletScreen || isLargeTabletScreen;

  const [loading, setLoading] = useState(true);
  const [currentPopoverState, setCurrentPopoverState] = useState<string>(popoverStates.INITIAL);
  const [states, setStates] = useState<Array<DetailedGeospace>>([]);
  const [counties, setCounties] = useState<Array<DetailedGeospace>>([]);
  const [indexedCounties, setIndexedCounties] = useState({});
  const [tribalTracts, setTribalTracts] = useState<Array<DetailedGeospace>>([]);
  const [selectedOption, setSelectedOption] = useState<Optional<DetailedGeospace>>(null);

  useEffect(() => {
    const allNamespaces = Promise.all([
      getGeospaces(GeospacesTabs.STATES.toLowerCase()),
      getGeospaces(GeospacesTabs.COUNTIES.toLowerCase()),
      getGeospaces(GeospacesTabs.TRIBAL_TRACTS.toLowerCase()),
    ]);
    allNamespaces
      .then(res => {
        setStates(res[0].results);
        setTribalTracts(res[2].results.filter(tt => !!tt.name && tt.name !== 'NULL'));
        // index counties by state
        let indexed: any = {};
        res[1].results.forEach(county => {
          if(county.parent) {
            if (!(county.parent.name in indexed)) {
              indexed[county.parent.name] = [];
            }
            indexed[county.parent.name].push(county);
          }
        });
        setIndexedCounties(indexed);
        setCounties(res[1].results);
      })
      .catch(err => {
        handleError(err);
        showSnackbarMessage('An error has occurred while loading namespaces. Please try again later.', SNACKBAR_TYPES.ERROR);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChangePopoverState = (newState: string): void => {
    setCurrentPopoverState(newState);
    if(newState === popoverStates.COUNTIES) return;
    recenterMap();
    if(newState === popoverStates.STATES) setGeospaceNamespace(GeospacesTabs.STATES);
    else if(newState === popoverStates.SPECIFIC_STATE) setGeospaceNamespace(GeospacesTabs.COUNTIES);
    else if(newState === popoverStates.TRIBAL_LANDS) setGeospaceNamespace(GeospacesTabs.TRIBAL_TRACTS);
  }

  const goBackToInitial = () => {
    recenterMap();
    if(currentPopoverState === popoverStates.SPECIFIC_STATE) {
      setCurrentPopoverState(popoverStates.COUNTIES);
    } else {
      setCurrentPopoverState(popoverStates.INITIAL);
    }
  }

  const closePopover = () => setIsOpen(false);
  const openPopover = () => setIsOpen(true);

  const handleChangeGeospace = (geospace: GeospaceOverview) => {
    selectGeospace(geospace);
    closePopover();
  }

  return (
    <>
    {
      isOpen ?
        <>
          { (isSmallScreen || isTabletScreen) && <div style={styles.Shadow} onClick={closePopover}></div> }
          <div style={styles.ExplorationPopoverContainer(currentPopoverState, isSmallScreen, isSmallTabletScreen, isLargeTabletScreen)}>
            <div className={'hover-opaque'}
                 style={styles.ShrinkButtonContainer(isSmallExplorationPopover)}
                 onClick={closePopover}
            >
              <img src={isSmallExplorationPopover ? CloseIconLight : DiagonalArrow}
                   style={styles.Arrow(isSmallExplorationPopover)}
                   alt={'diagonal-arrow'}/>
            </div>
            {
              currentPopoverState === popoverStates.INITIAL ?
                <InitialExplorationPopoverContent setCurrentPopoverState={handleChangePopoverState}/> :
                <SpecificExplorationPopoverContent type={currentPopoverState}
                                                   setType={handleChangePopoverState}
                                                   goBack={goBackToInitial}
                                                   selectGeospace={handleChangeGeospace}
                                                   states={states}
                                                   indexedCounties={indexedCounties}
                                                   tribalTracts={tribalTracts}
                                                   setCenter={setCenter}
                                                   setZoom={setZoom}
                                                   loading={loading}
                                                   setLoading={setLoading}
                                                   selectedOption={selectedOption}
                                                   setSelectedOption={setSelectedOption}
                />
            }
          </div>
        </> :
        <div style={styles.ClosedExplorationPopoverContainer}>
          <ExplorationPopoverIcon onClick={openPopover} isRightPanelOpen={isRightPanelOpen} isRightPanelHidden={isRightPanelHidden}/>
        </div>
    }
    </>
  );
}

export default React.memo(ExplorationPopover);