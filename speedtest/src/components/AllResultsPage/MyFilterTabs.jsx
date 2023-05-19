import {DEFAULT_FILTERS_TABS_BACKGROUND_COLOR} from "../../utils/colors";

const myFilterTabsStyle = {
  width: '100%',
  height: 36,
  borderRadius: 18,
  backgroundColor: DEFAULT_FILTERS_TABS_BACKGROUND_COLOR,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-evenly',
  marginTop: 20,
  marginBottom: 15,
}

const MyFilterTabs = ({ children }) => {
  return (
    <div style={myFilterTabsStyle}>
      {children}
    </div>
  )
}

export default MyFilterTabs;