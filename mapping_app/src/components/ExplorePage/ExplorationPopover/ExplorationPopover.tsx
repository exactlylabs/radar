import {ReactElement, useState} from "react";
import {styles} from "./styles/ExplorationPopover.style";
import {ArrowOutward, ArrowOutwardRounded} from "@mui/icons-material";
import {WHITE} from "../../../styles/colors";
import InitialExplorationPopoverContent from "./InitialExplorationPopoverContent";
import SpecificExplorationPopoverContent from "./SpecificExplorationPopoverContent";

interface ExplorationPopoverProps {
  closePopover: () => void;
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

const ExplorationPopover = ({closePopover}: ExplorationPopoverProps): ReactElement => {

  const [currentPopoverState, setCurrentPopoverState] = useState(popoverStates.INITIAL);

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
           style={styles.ShrinkButtonContainer()}
           onClick={closePopover}
      >
        <ArrowOutwardRounded style={{transform: 'rotate(180deg)', color: WHITE, opacity: 0.8}}
                             fontSize={'small'}
        />
      </div>
      {
        currentPopoverState === popoverStates.INITIAL &&
        <InitialExplorationPopoverContent setCurrentPopoverState={handleChangePopoverState} />
      }
      {
        currentPopoverState !== popoverStates.INITIAL &&
        <SpecificExplorationPopoverContent type={currentPopoverState}
                                           setType={handleChangePopoverState}
                                           goBack={goBackToInitial}
        />
      }
    </div>
  )
}

export default ExplorationPopover;