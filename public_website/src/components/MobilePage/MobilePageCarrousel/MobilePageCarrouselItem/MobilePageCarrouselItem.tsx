import {ReactElement, useState} from "react";
import {styles} from "./styles/MobilePageCarrouselItem.style";
import {useViewportSizes} from "../../../../hooks/useViewportSizes";

interface MobilePageCarrouselItemProps {
  selected: boolean;
  icon: ReactElement;
  title: string;
  subtitle: string;
  progress: number;
  index: number;
  setSelectedItem: (newItem: number) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const MobilePageCarrouselItem = ({
  selected,
  icon,
  title,
  subtitle,
  progress,
  index,
  setSelectedItem,
  isFirst,
  isLast
}: MobilePageCarrouselItemProps): ReactElement => {

  const {isSmallScreen, isMidScreen, isLargeScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen || isLargeScreen;

  const [hovered, setHovered] = useState(false);

  const hover = () => setHovered(true);
  const unhover = () => setHovered(false);

  const selectItem = () => setSelectedItem(index);

  return (
    <div style={styles.MobilePageCarrouselItem(selected || hovered, isSmall, isFirst, isLast)}
         onMouseOver={hover}
         onMouseLeave={unhover}
         onClick={selectItem}
         id={`carrousel-item-${index}`}
    >
      <div style={styles.IconContainer}>
        {icon}
      </div>
      <p className={'fw-bold'} style={styles.Title}>{title}</p>
      <p className={'fw-medium'} style={styles.Subtitle}>{subtitle}</p>
      { selected && <div style={styles.LoadingBar(progress)}></div> }
    </div>
  );
}

export default MobilePageCarrouselItem;