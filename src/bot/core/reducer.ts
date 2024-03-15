
import { useRef, useState } from 'react';
import {
  DEFAULT_NODE_PORT,
  DmbtDispatch,
  DmbtMiddlewhare,
  DmbtStore,
  IDmbtEventBus,
  IDmbtMessage,
  IDmbtMessageOutput,
  IDmbtNode,
  IDmbtShape,
  IDmbtState,
  SimpleAction
} from '../../definitions';
import { composeMiddleware } from './middlewares';
import { getInitialState, getNodeMessages, getUserAnswer } from './helpers';
import * as React from 'react';

export const DispatcherContext: React.Context<DmbtDispatch> =
  React.createContext<any>(null);

const getNextNode = (shape: IDmbtShape, fromId: string, fromPort?: string) => {
  const exitPath = `${fromId}-${fromPort || DEFAULT_NODE_PORT}`;
  const defaultExitPath = `${fromId}-${DEFAULT_NODE_PORT}`;
  const nextId = shape.paths[exitPath] || shape.paths[defaultExitPath];
  return nextId ? shape.nodes[nextId] : undefined;
};

const onSetVariable = (
  state: IDmbtState,
  payload: { id: string; value: any }
): IDmbtState => {
  return {
    ...state,
    variables: {
      ...(state.variables || {}),
      [`${payload.id}`]: payload.value
    }
  };
};

const onLoading = (state: IDmbtState, loading: boolean) => {
  return {
    ...state,
    loading
  };
};

const onError = (state: IDmbtState, error: boolean) => {
  return {
    ...state,
    error
  };
};

const onNext = (
  state: IDmbtState,
  lastActive: IDmbtMessage,
  shape: IDmbtShape
): IDmbtState => {
  const processed = state.processed.concat(state.active);
  if (lastActive.interactive) {
    return {
      ...state,
      processed,
      active: [],
      activeInteraction: lastActive.nodeId
    };
  }

  const nextNode = getNextNode(
    shape,
    lastActive.nodeId,
    lastActive.output?.port
  );
  const active = getNodeMessages(nextNode, state.variables);

  return {
    ...state,
    processed,
    active,
    activeInteraction: undefined,
    finished: nextNode ? false : true,
    loading: false
  };
};

const onPrev = (
  state: IDmbtState,
  activeInteraction: string,
  shape: IDmbtShape
): IDmbtState => {
  if (!activeInteraction) {
    return state;
  }

  const interactions = [...state.interactionProgress];
  let nextId = interactions.pop();
  if (!nextId) {
    nextId = state.processed[0].nodeId;
  }

  const nextNode: IDmbtNode = shape.nodes[nextId];
  const active = getNodeMessages(nextNode, state.variables);

  return {
    ...state,
    active,
    interactionProgress: interactions,
    activeInteraction: undefined,
    finished: nextNode ? false : true,
    loading: false
  };
};

const onAnswer = (
  state: IDmbtState,
  answer: IDmbtMessageOutput,
  activeId: string
): IDmbtState => {
  const userAnswerMessage: IDmbtMessage = getUserAnswer(
    activeId,
    answer,
    answer.meta
  );
  const active = [userAnswerMessage];
  const outputVarId = answer.id || activeId;
  const variables = {
    ...state.variables,
    [`${outputVarId}`]: answer.value
  };
  const interactionProgress = !!userAnswerMessage.meta.silent
    ? state.interactionProgress
    : state.interactionProgress.concat([activeId]);

  return {
    ...state,
    variables,
    active,
    interactionProgress,
    activeInteraction: undefined,
    finished: false,
    loading: false,
    error: false
  };
};

const onJumpTo = (state: IDmbtState, nodeId: string, shape: IDmbtShape) => {
  const jumpToNode = shape.nodes[nodeId];
  return {
    ...state,
    active: getNodeMessages(jumpToNode, state.variables),
    activeInteraction: undefined,
    finished: false,
    loading: false
  };
};

const onMessage = (state: IDmbtState, message: IDmbtMessage) => {
  const active = state.active.concat(message);
  return {
    ...state,
    active
  };
};

const onInstantMessage = (state: IDmbtState, message: IDmbtMessage) => {
  const processed = state.processed.concat(message);
  return {
    ...state,
    processed
  };
};

export function useDmbtReducer(
  reducer: (state: IDmbtState, action: SimpleAction) => IDmbtState,
  initialState: IDmbtState,
  middlewares: DmbtMiddlewhare[] = [],
  eventBus: IDmbtEventBus
): [IDmbtState, DmbtDispatch] {
  const hook = useState(initialState);
  const state = hook[0];
  const setState = hook[1];
  const draftState = useRef(initialState);

  const dispatch = (action: SimpleAction) => {
    draftState.current = reducer(draftState.current, action);
    setState(draftState.current);
    return action;
  };
  const store: DmbtStore = {
    getState: () => draftState.current,
    getEventBus: () => eventBus,
     // eslint-disable-next-line
    dispatch: (...args: any[]) => (enhancedDispatch as any)(...args)
  };
  const chain = middlewares.map((middleware) => middleware(store));
  // eslint-disable-next-line
  const enhancedDispatch = composeMiddleware.apply(
    undefined,
    chain
  )(dispatch) as DmbtDispatch;

  (window as any)._Dumbot = {
    enhancedDispatch
  };

  return [state, enhancedDispatch];
}

export const createReducer = (shape: IDmbtShape, externalVariables?: any) => {
  return function dumbotReducer(
    state: IDmbtState,
    action: SimpleAction
  ): IDmbtState {
    let ret: IDmbtState;
    switch (action.type) {
      case '@message':
        ret = onMessage(state, action.payload as IDmbtMessage);
        break;
      case '@instantMessage':
        ret = onInstantMessage(state, action.payload as IDmbtMessage);
        break;
      case '@answer':
        ret = onAnswer(
          state,
          action.payload as IDmbtMessageOutput,
          state.activeInteraction as string
        );
        break;
      case '@next':
        ret = onNext(state, action.payload as IDmbtMessage, shape);
        break;
      case '@prev':
        ret = onPrev(state, action.payload as string, shape);
        break;
      case '@variable':
        ret = onSetVariable(
          state,
          action.payload as { id: string; value: any }
        );
        break;
      case '@restart':
        ret = getInitialState(shape, undefined, externalVariables);
        break;
      case '@jump':
        ret = onJumpTo(state, action.payload as string, shape);
        break;
      case '@loading':
        ret = onLoading(state, action.payload as boolean);
        break;
      case '@error':
        ret = onError(state, action.payload as boolean);
        break;
      default:
        ret = state;
        break;
    }

    return ret;
  };
};

