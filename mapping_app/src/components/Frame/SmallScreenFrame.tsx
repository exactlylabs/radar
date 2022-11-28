import {ReactElement, useState} from "react";
import OpenedTopMenuSmallScreen from "./TopMenuSmallScreen/OpenedTopMenuSmallScreen";
import SmallScreenTopMenu from "./TopMenuSmallScreen/SmallScreenTopMenu";

interface SmallScreenFrameProps {
  children: ReactElement;
  centerOnUser: (center: Array<number>) => void;
  setWantsToProceed: (value: boolean) => void;
}

const SmallScreenFrame = ({
  children,
  centerOnUser,
  setWantsToProceed
}: SmallScreenFrameProps): ReactElement => {

  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);

  const toggleTopMenu = () => setIsTopMenuOpen(!isTopMenuOpen);
  const closeMenu = () => setIsTopMenuOpen(false);

  return (
    <>
      <SmallScreenTopMenu toggleTopMenu={toggleTopMenu} isTopMenuOpen={isTopMenuOpen}/>
      { isTopMenuOpen && <OpenedTopMenuSmallScreen centerOnUser={centerOnUser} closeMenu={closeMenu}/> }
      { children }
    </>
  )
}

export default SmallScreenFrame;