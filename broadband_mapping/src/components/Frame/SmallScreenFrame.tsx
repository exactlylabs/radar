import {ReactElement, useState} from "react";
import OpenedTopMenuSmallScreen from "./TopMenuSmallScreen/OpenedTopMenuSmallScreen";
import SmallScreenTopMenu from "./TopMenuSmallScreen/SmallScreenTopMenu";
import NoGeolocationAlert from "./NoGeolocationAlert/NoGeolocationAlert";

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
  const [isNoGeolocationAlertOpen, setIsNoGeolocationAlertOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const toggleTopMenu = () => setIsTopMenuOpen(!isTopMenuOpen);
  const closeMenu = () => setIsTopMenuOpen(false);

  return (
    <div style={{position: 'relative'}}>
      <SmallScreenTopMenu toggleTopMenu={toggleTopMenu} isTopMenuOpen={isTopMenuOpen}/>
      { isTopMenuOpen &&
        <OpenedTopMenuSmallScreen centerOnUser={centerOnUser}
                                  closeMenu={closeMenu}
                                  setIsNoGeolocationAlertOpen={setIsNoGeolocationAlertOpen}
                                  setIsOpening={setIsOpening}
                                  setIsClosing={setIsClosing}
        />
      }
      { children }
      <NoGeolocationAlert isOpen={isNoGeolocationAlertOpen}
                          isOpening={isOpening}
                          isClosing={isClosing}
      />
    </div>
  )
}

export default SmallScreenFrame;