import MyFilterTabs from "./MyFilterTabs";
import MyFilterTab from "./MyFilterTab";

const MyFiltersTypeSwitcher = ({
  currentType,
  setCurrentType,
}) => {

  const setCurrentTypeOnZero = () => setCurrentType(0);

  const setCurrentTypeOnOne = () => setCurrentType(1);

  return (
    <MyFilterTabs currentIndex={currentType}>
      <MyFilterTab label={'Download'} selected={currentType === 0} onClick={setCurrentTypeOnZero}/>
      <MyFilterTab label={'Upload'} selected={currentType === 1} onClick={setCurrentTypeOnOne}/>
    </MyFilterTabs>
  )
}

export default MyFiltersTypeSwitcher;