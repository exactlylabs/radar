import MyFilterTabs from "./MyFilterTabs";
import MyFilterTab from "./MyFilterTab";
import { useTranslation } from 'react-i18next';

const MyFiltersTypeSwitcher = ({
  currentType,
  setCurrentType,
}) => {
  const { t } = useTranslation();

  const setCurrentTypeOnZero = () => setCurrentType(0);

  const setCurrentTypeOnOne = () => setCurrentType(1);

  return (
    <MyFilterTabs currentIndex={currentType}>
      <MyFilterTab label={t('testResults.metrics.download')} selected={currentType === 0} onClick={setCurrentTypeOnZero}/>
      <MyFilterTab label={t('testResults.metrics.upload')} selected={currentType === 1} onClick={setCurrentTypeOnOne}/>
    </MyFilterTabs>
  )
}

export default MyFiltersTypeSwitcher;