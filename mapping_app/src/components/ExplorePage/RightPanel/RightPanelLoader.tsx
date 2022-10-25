import ContentLoader from "react-content-loader";
import RightPanelHeader from "./RightPanelHeader";
import {ReactElement} from "react";
import {styles} from "./styles/RightPanel.style";

interface RightPanelLoaderProps {
  geospaceName: string;
  country: string;
  parentName?: string;
  stateSignalState: string;
  closePanel: () => void;
}

const RightPanelLoader = ({
  geospaceName,
  parentName,
  country,
  stateSignalState,
  closePanel,
}: RightPanelLoaderProps): ReactElement => (

  <div style={styles.RightPanelContentContainer}>
    <div style={styles.RightPanelContentWrapper}>
      <RightPanelHeader geospaceName={geospaceName}
                        parentName={parentName}
                        country={country}
                        stateSignalState={stateSignalState}
                        closePanel={closePanel}
      />
      <ContentLoader
        speed={1}
        width={445}
        height={500}
        viewBox="0 10 445 500"
        backgroundColor={'rgba(151, 161, 157, 0.15)'}
        foregroundColor={'rgba(151, 161, 157, 0.2)'}
      >

        <rect x="0" y="15" rx="6" ry="6" width="445" height="30"/>

        <rect x="0" y="95" rx="6" ry="6" width="134" height="18"/>
        <rect x="155" y="95" rx="6" ry="6" width="134" height="18"/>
        <rect x="310" y="95" rx="6" ry="6" width="134" height="18"/>

        <rect x="0" y="125" rx="6" ry="6" width="74" height="12"/>
        <rect x="155" y="125" rx="6" ry="6" width="74" height="12"/>
        <rect x="310" y="125" rx="6" ry="6" width="74" height="12"/>

        <rect x="0" y="192" rx="6" ry="6" width="134" height="18"/>
        <rect x="0" y="230" rx="6" ry="6" width="314" height="12"/>
        <rect x="0" y="258" rx="6" ry="6" width="214" height="12"/>
        <rect x="0" y="286" rx="6" ry="6" width="164" height="12"/>

        <rect x="0" y="353" rx="6" ry="6" width="134" height="18"/>
        <rect x="0" y="391" rx="6" ry="6" width="314" height="12"/>
        <rect x="0" y="419" rx="6" ry="6" width="214" height="12"/>
        <rect x="0" y="447" rx="6" ry="6" width="164" height="12"/>


      </ContentLoader>
    </div>
  </div>
)

export default RightPanelLoader;