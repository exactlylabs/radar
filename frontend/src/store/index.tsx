import { applyMiddleware, compose, createStore } from 'redux';

import loggerMiddleware from './middleware/logger';
import monitorReducersEnhancer from './enhancers/monitorReducers';

import appReducer from './reducers';

export default function configureStore(preloadedState) {
  const middlewares = [loggerMiddleware];
  const middlewareEnhancer = applyMiddleware(...middlewares);

  const enhancers = [middlewareEnhancer, monitorReducersEnhancer];

  const composedEnhancers = compose<StoreEnhancer>(...enhancers);

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./reducers', () => store.replaceReducer(appReducer))
  }

  const store = createStore(appReducer, preloadedState, composedEnhancers);
}
