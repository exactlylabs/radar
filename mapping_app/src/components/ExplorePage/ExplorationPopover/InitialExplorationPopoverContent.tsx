import {ReactElement} from "react";
import {styles} from "./styles/InitialExplorationPopoverContent.style";
import PopoverOption from "./PopoverOption";
import {popoverStates} from "./ExplorationPopover";

interface InitialExplorationPopoverContentProps {
  setCurrentPopoverState: (newState: string) => void;
}

const InitialExplorationPopoverContent = ({
  setCurrentPopoverState
}: InitialExplorationPopoverContentProps): ReactElement => {

  const selectStates = () => setCurrentPopoverState(popoverStates.STATES);

  const selectCounties = () => setCurrentPopoverState(popoverStates.COUNTIES);

  const selectTribalLands = () => setCurrentPopoverState(popoverStates.TRIBAL_LANDS);

  return (
    <div style={styles.InitialExplorationPopoverContentContainer()}>
      <p className={'fw-medium'} style={styles.Title()}>Explore the U.S.A.</p>
      <p className={'fw-light'} style={styles.Subtitle()}>Explore the map or browse by geography to see how broadband access is made.</p>
      <PopoverOption text={'Browse by States'} light onClick={selectStates}/>
      <PopoverOption text={'Browse by Counties'} light onClick={selectCounties}/>
      <PopoverOption text={'Browse by Tribal Lands'} light onClick={selectTribalLands}/>
    </div>
  )
}

export default InitialExplorationPopoverContent;