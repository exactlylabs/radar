import { Reducer } from 'redux'
import { UserState, UserActionTypes } from './types'

const initialState: UserState = {
  token: null
};

const reducer: Reducer<UserState> = (state = initialState, action) => {
  switch (action.type) {
    case UserActionTypes.LOGGED_IN: {
      return { ...state, token: action.payload['token'] }
    }
    case UserActionTypes.LOGGED_OUT: {
      return { ...state, token: null }
    }
    default: {
      return state
    }
  }
}

export { reducer as userReducer }
