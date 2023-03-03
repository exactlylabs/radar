import ContentLoader from "react-content-loader";
import {ReactElement} from "react";
import RightPanelHeader from "../../../ExplorePage/RightPanel/RightPanelHeader";
import {styles} from "./styles/MenuFullGeospaceLoader.style";

interface MenuFullGeospaceLoaderProps {
  geospaceName: string;
  country: string;
  parentName?: string;
  stateSignalState: string;
}

const MenuFullGeospaceLoader = ({
  geospaceName,
  parentName,
  country,
  stateSignalState,
}: MenuFullGeospaceLoaderProps): ReactElement => (

  <div style={styles.LoaderContainer}>
    <div style={styles.LoaderWrapper}>
      <RightPanelHeader geospaceName={geospaceName}
                        parentName={parentName}
                        country={country}
                        stateSignalState={stateSignalState}
      />
      <ContentLoader
        speed={1}
        width={'100%'}
        height={500}
        backgroundColor={'rgba(151, 161, 157, 0.15)'}
        foregroundColor={'rgba(151, 161, 157, 0.2)'}
      >

        <rect x="0" y="25" rx="6" ry="6" width="100%" height="30"/>

        <rect x="0" y="90" rx="6" ry="6" width="25%" height="18"/>
        <rect x="37.5%" y="90" rx="6" ry="6" width="25%" height="18"/>
        <rect x="75%" y="90" rx="6" ry="6" width="25%" height="18"/>

        <rect x="0" y="121" rx="6" ry="6" width="20%" height="12"/>
        <rect x="37.5%" y="121" rx="6" ry="6" width="20%" height="12"/>
        <rect x="75%" y="121" rx="6" ry="6" width="20%" height="12"/>

        <rect x="0" y="192" rx="6" ry="6" width="40%" height="18"/>
        <rect x="0" y="230" rx="6" ry="6" width="90%" height="12"/>
        <rect x="0" y="258" rx="6" ry="6" width="60%" height="12"/>
        <rect x="0" y="286" rx="6" ry="6" width="45%" height="12"/>

        <rect x="0" y="353" rx="6" ry="6" width="40%" height="18"/>
        <rect x="0" y="391" rx="6" ry="6" width="90%" height="12"/>
        <rect x="0" y="419" rx="6" ry="6" width="60%" height="12"/>
        <rect x="0" y="447" rx="6" ry="6" width="45%" height="12"/>


      </ContentLoader>
    </div>
  </div>
)

export default MenuFullGeospaceLoader;