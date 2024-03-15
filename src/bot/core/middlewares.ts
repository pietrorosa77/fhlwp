import {
  DmbtAction,
  DmbtDispatch,
  DmbtEvents,
  DmbtStore,
  SimpleAction
} from '../../definitions';
import { startsWith } from './helpers';

export function composeMiddleware(...fns: any[]) {
  if (fns.length === 0) return (arg: any) => arg;
  if (fns.length === 1) return fns[0];
  return fns.reduce(
    (a, b) =>
      (...args: any[]) =>
        a(b(...args))
  );
}

export function logMiddleware(store: DmbtStore) {
  return (next: DmbtDispatch) => (action: DmbtAction) => {
    console.log('Prev State:', store.getState());
    console.log('Action:', action);
    next(action);
    console.log('Next State:', store.getState());
  };
}

export function thunkMiddleware(store: DmbtStore) {
  return (next: DmbtDispatch) => (action: DmbtAction) => {
    if (typeof action === 'function') {
      // Inject the store
      return action(store);
    }
    // Otherwise, pass the action down the middleware chain as usual
    return next(action);
  };
}

export function eventBusMiddleware(store: DmbtStore) {
  return (next: DmbtDispatch) => (action: DmbtAction) => {
    const type = (action as SimpleAction).type as DmbtEvents;
    if (startsWith(type,'evt-')) {
      return store.getEventBus().emit(type, (action as SimpleAction).payload);
    }
    const prevState = store.getState();
    // Otherwise, pass the action down the middleware chain as usual
    next(action);
    store.getEventBus().emit('dmbt-StateChanged', {
      prev: prevState,
      next: store.getState(),
      action
    });
  };
}
