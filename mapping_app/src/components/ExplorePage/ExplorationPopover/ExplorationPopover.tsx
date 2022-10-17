import React, {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/ExplorationPopover.style";
import InitialExplorationPopoverContent from "./InitialExplorationPopoverContent";
import SpecificExplorationPopoverContent from "./SpecificExplorationPopoverContent";
import {Geospace, GeospaceOverview} from "../../../api/geospaces/types";
import {getGeospaces} from "../../../api/namespaces/requests";
import {handleError} from "../../../api";
import DiagonalArrow from '../../../assets/diagonal-arrow.png';

interface ExplorationPopoverProps {
  closePopover: () => void;
  selectGeospace: (geospace: GeospaceOverview) => void;
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

const ExplorationPopover = ({closePopover, selectGeospace}: ExplorationPopoverProps): ReactElement => {

  const [currentPopoverState, setCurrentPopoverState] = useState(popoverStates.INITIAL);
  const [states, setStates] = useState<Array<Geospace>>([]);
  const [counties, setCounties] = useState<Array<Geospace>>([]);
  const [indexedCounties, setIndexedCounties] = useState({});
  const [tribalTracts, setTribalTracts] = useState<Array<Geospace>>([]);

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
  }

  const goBackToInitial = (): void => {
    if(currentPopoverState === popoverStates.SPECIFIC_STATE) {
      setCurrentPopoverState(popoverStates.COUNTIES);
    } else {
      setCurrentPopoverState(popoverStates.INITIAL);
    }
  }

  return (
      <div style={styles.ExplorationPopoverContainer(currentPopoverState)}>
        <div className={'hover-opaque'}
             style={styles.ShrinkButtonContainer}
             onClick={closePopover}
        >
          <img src={DiagonalArrow} style={styles.Arrow} alt={'diagonal-arrow'}/>
        </div>
        {
          currentPopoverState === popoverStates.INITIAL &&
          <InitialExplorationPopoverContent setCurrentPopoverState={handleChangePopoverState}/>
        }
        {
          currentPopoverState !== popoverStates.INITIAL &&
          <SpecificExplorationPopoverContent type={currentPopoverState}
                                             setType={handleChangePopoverState}
                                             goBack={goBackToInitial}
                                             selectGeospace={selectGeospace}
                                             states={states}
                                             indexedCounties={indexedCounties}
                                             tribalTracts={tribalTracts}
          />
        }
      </div>
  )
}

export default React.memo(ExplorationPopover);