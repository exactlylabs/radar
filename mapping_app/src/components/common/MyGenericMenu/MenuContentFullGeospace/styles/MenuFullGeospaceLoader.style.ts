import {CSSProperties} from "react";

const loaderContainerStyle: CSSProperties = {
  width: '100%',
  margin: '0 auto',
  height: 'calc(100vh - 58px - 40px - 30px)',
  display: 'flex',
  flexDirection: 'column',
}

const loaderWrapperStyle: CSSProperties = {

}

export const styles = {
  LoaderContainer: loaderContainerStyle,
  LoaderWrapper: loaderWrapperStyle,
}