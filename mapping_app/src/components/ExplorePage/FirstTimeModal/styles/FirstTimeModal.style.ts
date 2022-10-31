import {CSSProperties} from "react";
import {
  BLACK,
  DEFAULT_SECONDARY_TEXT,
  DEFAULT_TEXT,
  EXPLORATION_POPOVER_SECONDARY_BLACK,
  WHITE
} from "../../../../styles/colors";
import {speedColors, SpeedsObject} from "../../../../utils/speeds";

const firstTimeModalStyle: CSSProperties = {
  width: '345px',
  height: '445px',
  borderRadius: '6px',
  backgroundColor: WHITE,
  boxShadow: `0 2px 10px -4px ${EXPLORATION_POPOVER_SECONDARY_BLACK}`,
  position: 'absolute',
  bottom: '25px',
  left: '50%',
  marginLeft: '-172.5px',
  zIndex: 1100,
  padding: '25px 20px'
}

const closeIconStyle: CSSProperties = {
  width: '26px',
  height: '26px',
  position: 'absolute',
  top: '10px',
  right: '10px',
  opacity: 0.75,
}

const titleStyle: CSSProperties = {
  fontSize: '20px',
  color: DEFAULT_TEXT,
  marginBottom: '10px',
}

const subtitleStyle: CSSProperties = {
  width: '100%',
  fontSize: '16px',
  color: DEFAULT_SECONDARY_TEXT,
  lineHeight: '23px'
}

const gridStyle: CSSProperties = {
  width: '100%',
  height: '196px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '36px',
  marginTop: '30px',
}

const rowStyle: CSSProperties = {
  width: '100%',
  height: '48px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
}

const rowIconStyle: CSSProperties = {
  width: '48px',
  height: '48px',
  marginRight: '15px',
}

const rowTextStyle: CSSProperties = {
  width: 'calc(100% - 48px - 15px)',
  height: '48px',
  color: DEFAULT_SECONDARY_TEXT,
  lineHeight: '23px',
}

const ballStyle: CSSProperties = {
  width: '7px',
  height: '7px',
  borderRadius: '50%',
}

const customRowTextStyle: CSSProperties = {
  width: '100%',
  height: '48px',
  display: 'flex',
  flexDirection: 'column',

}

const customRowTextLineStyle: CSSProperties = {
  width: 'max-content',
  minWidth: '225px',
  height: '23px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  color: DEFAULT_SECONDARY_TEXT,
}

const blurredBackgroundStyle: CSSProperties = {
  width: '100%',
  height: '100vh',
  zIndex: 1099,
  position: 'absolute',
  top: '-48px',
  left: 0,
  backgroundColor: BLACK,
  opacity: 0.4,
  cursor: 'pointer'
}

export const styles = {
  FirstTimeModal: firstTimeModalStyle,
  CloseIcon: closeIconStyle,
  Title: titleStyle,
  Subtitle: subtitleStyle,
  Grid: gridStyle,
  Row: rowStyle,
  RowIcon: rowIconStyle,
  RowText: rowTextStyle,
  Ball: (speedType: string) => {
    return {...ballStyle, backgroundColor: speedColors[speedType as keyof SpeedsObject] };
  },
  CustomRowText: customRowTextStyle,
  CustomRowTextLine: customRowTextLineStyle,
  BlurredBackground: blurredBackgroundStyle,
}