import {CSSProperties} from "react";

const filtersContainerStyle: CSSProperties = {
  width: 'max-content',
  maxWidth: '815px',
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

export const styles = {
  FiltersContainer: filtersContainerStyle,
  ConditionalFiltersContainer: conditionalFiltersContainerStyle,
}