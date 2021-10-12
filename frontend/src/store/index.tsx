import { applyMiddleware, createStore, Store, StoreEnhancerStoreCreator, combineReducers } from 'redux';

import loggerMiddleware from './middleware/logger';
import monitorReducersEnhancer from './enhancers/monitorReducers';
import { composeWithDevTools } from 'redux-devtools-extension';

import appReducer from './reducers';
import { BeaconsState } from './reducers/beacons/types';
import { beaconsReducer } from './reducers/beacons/reducer';
import { UserState } from './reducers/user/types';
import { userReducer } from './reducers/user/reducer';

// The top-level state object
export interface ApplicationState {
  beacons: BeaconsState;
  user: UserState;
}
export const createRootReducer = () =>
  combineReducers({
    beacons: beaconsReducer,
    user: userReducer,
  });

export function configureStore(
  initialState: ApplicationState,
): Store<ApplicationState> {
  const middlewares = [loggerMiddleware];
  const middlewareEnhancer = applyMiddleware(...middlewares);

  const enhancers = [middlewareEnhancer, monitorReducersEnhancer];

  const composeEnhancers = composeWithDevTools({});
  const composedEnhancers = composeEnhancers<StoreEnhancerStoreCreator<unknown, {}>>(...enhancers);

  const store = createStore(createRootReducer(), initialState, composedEnhancers);

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./reducers', () => store.replaceReducer(createRootReducer()));
  }

  return store as Store<ApplicationState, any>;
}

const store = configureStore({} as ApplicationState);
export default store;
