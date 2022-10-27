import {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/ExplorationPopover.style";
import {ArrowOutwardRounded} from "@mui/icons-material";
import InitialExplorationPopoverContent from "./InitialExplorationPopoverContent";
import SpecificExplorationPopoverContent from "./SpecificExplorationPopoverContent";
import {DetailedGeospace, GeospaceOverview} from "../../../api/geospaces/types";
import {getGeospaces} from "../../../api/namespaces/requests";
import {handleError} from "../../../api";

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
  const [states, setStates] = useState<Array<DetailedGeospace>>([]);
  const [counties, setCounties] = useState<Array<DetailedGeospace>>([]);
  const [tribalTracts, setTribalTracts] = useState<Array<DetailedGeospace>>([]);

  useEffect(() => {
    const allNamespaces = Promise.all([
      getGeospaces('states'),
      getGeospaces('counties'),
      getGeospaces('tribal_tracts'),
    ]);
    allNamespaces
      .then(res => {
        setStates(res[0].results);
        setCounties(res[1].results);
        setTribalTracts(res[2].results);
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
        <ArrowOutwardRounded style={styles.Arrow}
                             fontSize={'small'}
        />
      </div>
      {
        currentPopoverState === popoverStates.INITIAL ?
        <InitialExplorationPopoverContent setCurrentPopoverState={handleChangePopoverState} /> :
        <SpecificExplorationPopoverContent type={currentPopoverState}
                                           setType={handleChangePopoverState}
                                           goBack={goBackToInitial}
                                           selectGeospace={selectGeospace}
                                           states={states}
                                           counties={counties}
                                           tribalTracts={tribalTracts}
        />
      }
    </div>
  )
}

export default ExplorationPopover;