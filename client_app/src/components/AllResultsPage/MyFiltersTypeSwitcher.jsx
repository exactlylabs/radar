import MyFilterTabs from "./MyFilterTabs";
import MyFilterTab from "./MyFilterTab";

const MyFiltersTypeSwitcher = ({
  currentType,
  setCurrentType,
}) => {

  return (
    <MyFilterTabs currentIndex={currentType}>
      <MyFilterTab label={'Download'} selected={currentType === 0} onClick={() => setCurrentType(0)}/>
      <MyFilterTab label={'Upload'} selected={currentType === 1} onClick={() => setCurrentType(1)}/>
    </MyFilterTabs>
  )
}

export default MyFiltersTypeSwitcher;