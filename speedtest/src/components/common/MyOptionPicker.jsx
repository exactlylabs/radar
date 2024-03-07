import MyOption from "./MyOption";
import MyVerticalDivider from "./MyVerticalDivider";
import MyHorizontalOptionDivider from "./MyHorizontalOptionDivider";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import {useContext} from "react";
import ConfigContext from "../../context/ConfigContext";

const optionsPickerStyle = {
  display: 'flex',
  flexDirection: 'row',
  width: 'max-content',
  margin: '40px auto',
  gap: '10px',
}

const mobileOptionsPickerStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '95%',
  margin: '30px auto',
  gap: '10px',
}

const widgetOptionsPickerStyle = {
  display: 'flex',
  flexDirection: 'row',
  width: 'max-content',
  maxWidth: '95%',
  gap: '10px',
  margin: '16px auto',
}

const verticalDividerOptionStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}

const horizontalDividerOptionStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}

/**
 * Custom options display for unique selection from a list of options.
 * @param options: Array of options [{iconSrc, selectedIconSrc, text}]
 * @param needsDivider: boolean. Indicates if carrousel requires a vertical divider.
 * @param setSelectedOption: number. Current selected option index.
 * @param setSelectedOption: func. State setter passed down from wrapper element to choose an option.
 * @param selectedOption: number. Indicates which option is currently selected.
 * @param dividerIndex: number. Indicates which option's index comes prepended with a divider.
 * --> Example: {options, needsDivider: true, dividerIndex: 2} ==> render: [Option0] [Option1] | [Option2] ... [OptionN]
 * @returns {JSX.Element}
 */
const MyOptionPicker = ({
  options,
  needsDivider,
  dividerIndex,
  setSelectedOption,
  selectedOption,
}) => {

  const config = useContext(ConfigContext);
  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  const getOptionsPickerStyle = () => {
    if(config.widgetMode) return widgetOptionsPickerStyle;
    if(isSmallSizeScreen || isMediumSizeScreen) return mobileOptionsPickerStyle;
    return optionsPickerStyle;
  }

  return (
    <div style={getOptionsPickerStyle()}>
      {
        !needsDivider &&
        options.map((option, index) => <MyOption key={index}
                                                 option={option}
                                                 index={index}
                                                 isLast={index === (options.length - 1)}
                                                 selectedOption={selectedOption}
                                                 setSelectedOption={setSelectedOption}
        />)
      }
      {
        needsDivider && dividerIndex &&
        options.map((option, index) => {
          if(index === dividerIndex) {
            return (<div key={`divider-${index}`} style={!config.widgetMode && (isMediumSizeScreen || isSmallSizeScreen) ? horizontalDividerOptionStyle : verticalDividerOptionStyle}>
              {
                !config.widgetMode && (isMediumSizeScreen || isSmallSizeScreen) ?
                  <MyHorizontalOptionDivider/> :
                  <MyVerticalDivider/>
              }
              <MyOption option={option}
                        index={index}
                        isLast={index === (options.length - 1)}
                        selectedOption={selectedOption}
                        setSelectedOption={setSelectedOption}
              />
            </div>);
          } else {
            return <MyOption key={index}
                             index={index}
                             option={option}
                             isLast={index === (options.length - 1)}
                             selectedOption={selectedOption}
                             setSelectedOption={setSelectedOption}
            />
          }
        })
      }
    </div>
  );
}

export default MyOptionPicker;