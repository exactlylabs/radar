import {CSSProperties} from "react";
import {DEFAULT_TEXT, GENERIC_MENU} from "../../../../../styles/colors";

const menuContentWeekStyle: CSSProperties = {
  width: '100%',
  marginTop: '35px',
}

const goBackIconStyle: CSSProperties = {
  width: '20px',
  height: '20px',
  position: 'absolute',
  top: '18px',
  left: '20px',
}

const titleStyle: CSSProperties = {
  fontSize: '20px',
  color: DEFAULT_TEXT,
  marginBottom: '20px',
}

const itemsContainerStyle: CSSProperties = {
  width: '100%',
  marginBottom: '30px',
}

export const styles = {
  MenuContentWeek: menuContentWeekStyle,
  GoBackIcon: goBackIconStyle,
  Title: titleStyle,
  ItemsContainer: itemsContainerStyle,
}