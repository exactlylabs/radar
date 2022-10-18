import {CSSProperties} from "react";

const filtersContainerStyle: CSSProperties = {
  width: 'max-content',
  maxWidth: '825px',
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  flexWrap: 'wrap',
}

const conditionalFiltersContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row'
}

const animatedContainer: CSSProperties = {
  display: 'flex',
  position: 'absolute',
  left: '-250px',
}

const extendedAnimatedContainer: CSSProperties = {
  ...animatedContainer,
  left: '-730px',
}

export const styles = {
  FiltersContainer: filtersContainerStyle,
  ConditionalFiltersContainer: conditionalFiltersContainerStyle,
  AnimatedContainer: (extended: boolean) => {
    return extended ? extendedAnimatedContainer : animatedContainer;
  }
}