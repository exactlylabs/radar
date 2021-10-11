
const initialState = {};

export default function appReducer(state = initialState, action) {
  switch (action.type) {
    case 'first/Added': {
      return {
        ...state,
        first: "added"
      };
    }
    default:
      return state
  }
}