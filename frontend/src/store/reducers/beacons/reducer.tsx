import { Reducer } from 'redux'
import { BeaconsState, BeaconsActionTypes } from './types'

const initialState: BeaconsState = {
  data: [],
  errors: undefined,
  loading: false
}

const reducer: Reducer<BeaconsState> = (state = initialState, action) => {
  switch (action.type) {
    case BeaconsActionTypes.FETCH_REQUEST: {
      return { ...state, loading: true }
    }
    case BeaconsActionTypes.FETCH_SUCCESS: {
      return { ...state, loading: false, data: action.payload }
    }
    case BeaconsActionTypes.FETCH_ERROR: {
      return { ...state, loading: false, errors: action.payload }
    }
    case BeaconsActionTypes.ADD: {
      return { ...state, data: [...state.data, action.payload]}
    }
    default: {
      return state
    }
  }
}

export { reducer as beaconsReducer }
