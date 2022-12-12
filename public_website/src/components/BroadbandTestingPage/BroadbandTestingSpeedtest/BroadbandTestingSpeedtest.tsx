import {ReactElement} from "react";
import {styles} from "./styles/BroadbandTestingSpeedtest.style";

const BroadbandTestingSpeedtest = (): ReactElement => {

  /*useEffect(() => {
    // @ts-ignore
    SpeedTest.config({
      clientId: 'local',
      widgetMode: true,
      elementId: 'embedded-widget',
      frameStyle: {
        width: '500px',
        height: '500px',
        margin: '0',
      },
    });
    // @ts-ignore
    SpeedTest.new().mount();
  }, []);*/

  return (
    <div style={styles.BroadbandTestingSpeedtest}>
      <div style={styles.BroadbandTestingSpeedtestContent}>

      </div>
    </div>
  );
}

export default BroadbandTestingSpeedtest;