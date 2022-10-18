import React, {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/ExplorationPopover.style";
import InitialExplorationPopoverContent from "./InitialExplorationPopoverContent";
import SpecificExplorationPopoverContent from "./SpecificExplorationPopoverContent";
import {Geospace, GeospaceOverview} from "../../../api/geospaces/types";
import {getGeospaces} from "../../../api/namespaces/requests";
import {handleError} from "../../../api";
import DiagonalArrow from '../../../assets/diagonal-arrow.png';
import {tabs} from "../../../utils/filters";
import {motion} from "framer-motion";
import PopoverClosedIcon from "../../../assets/popover-closed-icon.png";


interface ExplorationPopoverProps {
  closePopover: () => void;
  selectGeospace: (geospace: GeospaceOverview) => void;
  setGeospaceNamespace: (namespace: string) => void;
  recenterMap: () => void;
  setCenter: (center: Array<number>) => void;
  setZoom: (zoom: number) => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export type PopoverStateObject = {
  INITIAL: string;
  STATES: string;
  COUNTIES: string;
  SPECIFIC_STATE: string;
  TRIBAL_LANDS: string;
}

export const popoverStates: PopoverStateObject = {
  INITIAL: 'INITIAL',
  STATES: 'STATES',
  SPECIFIC_STATE: 'SPECIFIC_STATE',
  COUNTIES: 'COUNTIES',
  TRIBAL_LANDS: 'TRIBAL_LANDS',
}

const ExplorationPopover = ({
  selectGeospace,
  setGeospaceNamespace,
  recenterMap,
  setCenter,
  setZoom,
  isOpen,
  setIsOpen
}: ExplorationPopoverProps): ReactElement => {

  const animationDuration = 0.25;
  const [currentPopoverState, setCurrentPopoverState] = useState(popoverStates.INITIAL);
  const [states, setStates] = useState<Array<Geospace>>([]);
  const [counties, setCounties] = useState<Array<Geospace>>([]);
  const [indexedCounties, setIndexedCounties] = useState({});
  const [tribalTracts, setTribalTracts] = useState<Array<Geospace>>([]);
  const [animationOver, setAnimationOver] = useState(true);

  useEffect(() => {
    const allNamespaces = Promise.all([
      getGeospaces('states'),
      getGeospaces('counties'),
      getGeospaces('tribal_tracts'),
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
      .catch(err => handleError(err));
  }, []);

  const handleChangePopoverState = (newState: string): void => {
    setCurrentPopoverState(newState);
    if(newState === popoverStates.COUNTIES) return;
    recenterMap();
    if(newState === popoverStates.STATES) setGeospaceNamespace(tabs.STATES);
    else if(newState === popoverStates.SPECIFIC_STATE) setGeospaceNamespace(tabs.COUNTIES);
    else if(newState === popoverStates.TRIBAL_LANDS) setGeospaceNamespace(tabs.TRIBAL_TRACTS);
  }

  const goBackToInitial = (): void => {
    recenterMap();
    if(currentPopoverState === popoverStates.SPECIFIC_STATE) {
      setCurrentPopoverState(popoverStates.COUNTIES);
    } else {
      setCurrentPopoverState(popoverStates.INITIAL);
    }
  }

  const closePopover = () => setIsOpen(false);
  const openPopover = () => {
    setAnimationOver(false);
    setIsOpen(true);
    setTimeout(() => setAnimationOver(true), animationDuration * 1000 + 100);
  }

  const handleChangeGeospace = (geospace: GeospaceOverview) => {
    selectGeospace(geospace);
    closePopover();
  }

  const getHeight = () => {
    if(!isOpen) return 46;
    return currentPopoverState === popoverStates.INITIAL ? 365 : 540;
  }

  return (
    <motion.div style={styles.ExplorationPopoverContainer(currentPopoverState, isOpen)}
                animate={{
                  height: getHeight(),
                  width: isOpen ? 375 : 46,
                }}
                transition={{ duration: animationDuration }}
                onClick={!isOpen ? openPopover : () => {}}
    >
      {
        isOpen && animationOver &&
        <div className={'hover-opaque'}
             style={styles.ShrinkButtonContainer}
             onClick={closePopover}
        >
          <img src={DiagonalArrow} style={styles.Arrow} alt={'diagonal-arrow'}/>
        </div>
      }
      {
        isOpen && currentPopoverState === popoverStates.INITIAL && animationOver &&
        <InitialExplorationPopoverContent setCurrentPopoverState={handleChangePopoverState}/>
      }
      {
        isOpen && currentPopoverState !== popoverStates.INITIAL && animationOver &&
        <SpecificExplorationPopoverContent type={currentPopoverState}
                                           setType={handleChangePopoverState}
                                           goBack={goBackToInitial}
                                           selectGeospace={handleChangeGeospace}
                                           states={states}
                                           indexedCounties={indexedCounties}
                                           tribalTracts={tribalTracts}
                                           setCenter={setCenter}
                                           setZoom={setZoom}
        />
      }
      {!isOpen &&
        <img src={PopoverClosedIcon}
             style={styles.Icon}
             alt={'popover-closed-icon'}
        />
      }
    </motion.div>
  )
}

export default React.memo(ExplorationPopover);