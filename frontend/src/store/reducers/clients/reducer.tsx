// ./src/store/heroes/reducer.ts

import { Reducer } from 'redux'
import { ClientsState, ClientActionTypes } from './types'

// Type-safe initialState!
const initialState: ClientsState = {
  data: [],
  errors: undefined,
  loading: false
}

// Thanks to Redux 4's much simpler typings, we can take away a lot of typings on the reducer side,
// everything will remain type-safe.
const reducer: Reducer<ClientsState> = (state = initialState, action) => {
  switch (action.type) {
    case ClientActionTypes.FETCH_REQUEST: {
      return { ...state, loading: true }
    }
    case ClientActionTypes.FETCH_SUCCESS: {
      return { ...state, loading: false, data: action.payload }
    }
    case ClientActionTypes.FETCH_ERROR: {
      return { ...state, loading: false, errors: action.payload }
    }
    default: {
      return state
    }
  }
}

export { reducer as clientsReducer }
