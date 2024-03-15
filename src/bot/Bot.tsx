import {
  DEFAULT_NODE_PORT,
  DmbtMiddlewhare,
  IDmbtMessage,
  IDmbtNode,
  IDmbtProps,
  IDmbtShape,
  IDmbtState,
  SimpleAction,
  IBotSettings
} from '../definitions';
import {
  useDmbtReducer,
  createReducer,
  DispatcherContext,
  getInitialState,
  eventBusMiddleware,
  logMiddleware,
  thunkMiddleware,
  useEventBus,
  BotSettingsContext,
  DefaultBotSettings
} from './core';
import {
  AutoscrollPanel,
  ChatBotContainer,
  ChatBotContent,
  ChatBotContentWrapper,
  Footer,
  GridLayout,
  Header,
  Messages,
  Trigger,
  getInteraction
} from './components';
import * as React from 'react';
import '../webparts/dumbot/components/Dumbot.module.scss';
import { FluentProvider, IdPrefixProvider, RendererProvider, createDOMRenderer, webDarkTheme, webLightTheme } from '@fluentui/react-components';

const DumbotInner = (
  props: IDmbtProps & {
    reducer: (state: IDmbtState, action: SimpleAction) => IDmbtState;
    middlewares: DmbtMiddlewhare[];
    initialState: IDmbtState;
    onGetInteractionNode: (id?: string) => IDmbtNode | undefined;
    customThemeCss?: string;
    userDisplayName: string;
    settings: IBotSettings;
  }
) => {
  const {
    initiallyClosed,
    className,
    trigger,
    initialState,
    middlewares,
    reducer,
    onGetInteractionNode,
  } = props;

  const botRef = React.useRef<HTMLDivElement>();
  const [opened, setOpened] = React.useState(initiallyClosed ? false : true);
  const DmbtEventBus = useEventBus();
  const [state, dispatch] = useDmbtReducer(
    reducer,
    initialState,
    middlewares,
    DmbtEventBus
  );
  const activeInteraction = onGetInteractionNode(state.activeInteraction);
  const interactionTakesAll =
    activeInteraction && activeInteraction.properties?.displayAs === 'full';
  const interactionOnFooter =
    activeInteraction && activeInteraction.properties?.displayAs === 'footer';
  const { onSendDataToHost, onStateChanged, onToggle, onCallHost } = props;
  const footerVisible = !props.settings.hideFooter && !interactionOnFooter;

  React.useEffect(() => {
    const sendDataToHostHandler = DmbtEventBus.subscribe(
      'evt-SendDataToHost',
      (data) => {
        if (onSendDataToHost) {
          onSendDataToHost(data);
        }
      }
    );

    const stateChangedHandler = DmbtEventBus.subscribe(
      'dmbt-StateChanged',
      (data) => {
        if (onStateChanged) {
          onStateChanged(data);
        }
      }
    );

    const restartdHandler = DmbtEventBus.subscribe('evt-restart', () => {
      dispatch({
        type: '@restart',
        payload: undefined
      });
    });

    return () => {
      DmbtEventBus.unSubscribe('evt-SendDataToHost', sendDataToHostHandler);
      DmbtEventBus.unSubscribe('dmbt-StateChanged', stateChangedHandler);
      DmbtEventBus.unSubscribe('evt-restart', restartdHandler);
    };
  }, [DmbtEventBus, dispatch, onSendDataToHost, onStateChanged]);

  React.useEffect(() => {
    if (onToggle) {
      onToggle(opened);
    }
  }, [opened, onToggle]);

  const onToggleCb = React.useCallback((opened: boolean) => {
    setOpened(opened);
  }, []);

  const onBack = () => {
    if (!state.activeInteraction && !state.finished) {
      return;
    }
    dispatch({
      type: state.finished ? '@restart' : '@prev',
      payload: state.activeInteraction
    });
  };

  const messagesProcessed = (last: IDmbtMessage) => {
    dispatch({
      type: '@next',
      payload: last
    });
  };

  const onCallHostCb = async (hostFunctionName: string, parameters: any) => {
    if (!onCallHost) {
      console.error("on call host isn't defined as Bot property");
      return null;
    }

    return await onCallHost(hostFunctionName, parameters);
  };

  const onErrorAction = () => {
    dispatch({
      type: '@answer',
      payload: {
        value: 'error while running the action',
        port: DEFAULT_NODE_PORT,
        type: 'error',
        id: activeInteraction?.id
      }
    });
  };

  const Interaction = getInteraction(
    state,
    dispatch,
    onErrorAction,
    activeInteraction,
    props.customInteractions,
    onCallHostCb,
    props.customThemeCss
  );

  if (!opened) {
    return (
      <Trigger
        opened={opened}
        logoUrl={trigger?.image}
        severity={trigger?.severity}
        onToggleBot={onToggleCb}
      />
    );
  }

  return (
    <DispatcherContext.Provider value={dispatch}>
      <div
        className={`dumbot-webpart-main flex p-reset w-full h-full ${className || ''}`}
        ref={botRef as any}
      >
        <ChatBotContainer>
          <ChatBotContentWrapper>
            <Header
              onClose={() => onToggleCb(false)}
              isEnd={state.finished || false}
              onBack={onBack}
              loading={!!state.loading}
            />
            <ChatBotContent>
              {interactionTakesAll && Interaction}
              {!interactionTakesAll && (
                <AutoscrollPanel>
                  <GridLayout>
                    <Messages
                      active={state.active}
                      processed={state.processed}
                      onProcessed={messagesProcessed}
                      userDisplayName={props.userDisplayName}
                      customMessageDisplay={props.customMessageDisplay}
                    />
                    {!interactionOnFooter && Interaction}
                  </GridLayout>
                </AutoscrollPanel>
              )}
            </ChatBotContent>
            {interactionOnFooter && Interaction}
            {footerVisible && (
              <Footer/>
            )}
          </ChatBotContentWrapper>
        </ChatBotContainer>
      </div>
    </DispatcherContext.Provider>
  );
};

export const DumbotCB = (
  props: IDmbtProps & {
    settings?: IBotSettings;
    savedState?: IDmbtState;
    shape: IDmbtShape;
    log?: boolean;
    middlewares?: DmbtMiddlewhare[];
    isDarkTheme?: boolean;
    document: Document,
    window: Window,
    userDisplayName: string,
  }
) => {
  const renderer = React.useMemo(
    () => createDOMRenderer(props.document),
    [props.document]);

  const settings = {
    ...DefaultBotSettings,
    ...(props.settings || {})
  };
  
  const reducer = createReducer(props.shape, props.externalVariables);
  const initialState = getInitialState(
    props.shape,
    props.savedState,
    props.externalVariables
  );
  const baseMiddlewares = [thunkMiddleware, eventBusMiddleware];
  if (props.log) {
    baseMiddlewares.push(logMiddleware);
  }
  const middlewares = (props.middlewares || []).concat(baseMiddlewares);

  const onGetInteractionNode = (id?: string) => {
    if (!id) {
      return undefined;
    }
    return props.shape.nodes[id];
  };
  return (
    <>
      <RendererProvider
        renderer={renderer}
        targetDocument={props.document}
      >
        <IdPrefixProvider value="dmbtApp-">
          <FluentProvider theme={props.isDarkTheme ? webDarkTheme : webLightTheme} targetDocument={props.document} className='w-full h-full flex'>
            <BotSettingsContext.Provider value={settings}>
              <DumbotInner
                {...props}
                reducer={reducer}
                initialState={initialState}
                middlewares={middlewares}
                settings={settings}
                onGetInteractionNode={onGetInteractionNode}
              />
            </BotSettingsContext.Provider>
          </FluentProvider>
        </IdPrefixProvider>
      </RendererProvider>
    </>
  );
};
