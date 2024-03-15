import * as React from 'react';
import './Dumbot.module.scss';
import type { IDumbotProps } from './IDumbotProps';
import { DumbotCB } from '../../../bot/Bot';
import { IBotSettings, IDmbtShape, IDmbtState, SimpleAction } from '../../../definitions';
import { nanoid } from 'nanoid';
import { computeExternalVariables, loadInstanceFromClient, renderBotFrameHtml, saveInstanceToClient } from '../../../bot/core';
import { compress, decompress } from 'lz-string';

import '../../../bot/core/dumbotHost.css';
import IFrame, { FrameContext } from '@uiw/react-iframe';
import * as strings from 'DumbotWebPartStrings';

const urlParams = new URLSearchParams(window.location.search);
const botId = urlParams.get('botKey') || nanoid(8);

function DumbotAppWrapper(props: {
  shape: IDmbtShape,
  isDarkTheme: boolean,
  document: Document,
  window: Window,
  userDisplayName: string,
  mode?: 'full' | 'popup' | 'inline' | 'chat';
  onToggle: (opened: boolean) => void;
  initiallyClosed: boolean;
  settings?: IBotSettings;
}) {
  const [error, setError] = React.useState();
  const [botData, setBotData] = React.useState<{
    shape: IDmbtShape;
    savedState?: IDmbtState;
  }>();
  const tempProgress = React.useRef<IDmbtState>();
  const externalVariables = computeExternalVariables(
    props.settings?.externalVariables || {}
  );

  const trackBotProgress = (
    action: 'onStateChanged' | 'onBotFinished',
    state: IDmbtState
  ) => {
    tempProgress.current = state;
    try {
      const compressedState = compress(JSON.stringify(state));
      saveInstanceToClient(botId, compressedState);
    } catch (error) {
      console.error(error);
    }
  };

  const tryGetClientSavedInstance = async (): Promise<
    IDmbtState | undefined
  > => {
    const botStateCompressed = loadInstanceFromClient(botId);
    if (!botStateCompressed) {
      return undefined;
    }

    try {
      return JSON.parse(decompress(botStateCompressed));
    } catch (error) {
      console.error(error);
      return undefined;
    }
  };

  const onStateChanged = (data: {
    next: IDmbtState;
    prev: IDmbtState;
    action: SimpleAction;
  }) => {
    trackBotProgress('onStateChanged', data.next);
  };

  const onBotFinished = async (state: IDmbtState) => {
    trackBotProgress('onBotFinished', state);
  };

  React.useEffect(() => {
    tryGetClientSavedInstance().then((savedState) => {
      setBotData({
        shape: props.shape,
        savedState
      })
    }).catch((err) => {
      console.error(err);
      setError(err as any);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.shape.version]);

  if (error) {
    return (
      <div>Error loading Dumbot (check console for details)</div>
    );
  }

  if (!botData) {
    return null;
  }


  return (
    <DumbotCB
      settings={props.settings}
      key={botId}
      botUUID={botId}
      mode={props.mode}
      uuid={botId}
      log={urlParams.get('log') === '1'}
      savedState={botData.savedState}
      shape={botData.shape}
      // customMessageDisplay={CustomMessageDisplay}
      // customInteractions={DumbotExtensions}
      onStateChanged={onStateChanged}
      onBotFinished={onBotFinished}
      isDarkTheme={props.isDarkTheme}
      externalVariables={externalVariables}
      document={props.document}
      window={props.window}
      userDisplayName={props.userDisplayName}
      initiallyClosed={props.initiallyClosed}
      onToggle={props.onToggle}
    />
  );
}

export default class Dumbot extends React.Component<IDumbotProps, { opened: boolean }> {
  constructor(props: IDumbotProps) {
    super(props);
    this.state = { opened: props.initiallyClosed ? false : true };
  }

  private onToggle = (opened: boolean) => {
    this.setState({ opened });
  }

  public render(): React.ReactElement<IDumbotProps> {
    const {
      isDarkTheme,
      mode,
      customThemeCss,
      customHostContainerCss,
      userDisplayName
    } = this.props;

    const classMap = {
      popup: 'dmbt-mode-popup',
      chat: 'dmbt-mode-chat',
      inline: 'dmbt-mode-inline',
      full: 'dmbt-mode-full',
      closedInline: 'dmbt-trigger-inline',
      closed: 'dmbt-trigger'
    }

    const modeSizes = {
      inline: {
        height: '600px',
        width: '500px'
      },
      full: {
        height: '100vh',
        width: '100vw'
      },
      popup: {
        height: '80%',
        width: '80%'
      },
      chat: {
        height: 'calc(100vh - 50px)',
        width: '500px'
      }
    };

    const sizes = modeSizes[mode];
    const initialContent = renderBotFrameHtml(customThemeCss || '');

    if (
      !this.props.botShape
    ) {
      return <div>{strings.StartEditingBot}</div>;
    }

    const classKey = this.state.opened ? this.props.mode || 'inline' : (this.props.mode && this.props.mode !== 'inline') ? 'closed' : 'closedInline';
    const containerClass = classMap[classKey];

    return (
      <>
        <style type='text/css'>
          {
            `:root {
              --dmbt-mode-height: ${sizes.height};
              --dmbt-mode-width: ${sizes.width};
            }
            ${customHostContainerCss || ''}
            `
          }
        </style>
        <div className={`dmbt-main-wp dmbt-container ${containerClass}`}>
          <IFrame initialContent={initialContent} className={`dmbt-iframe ${!this.state.opened && 'dmbt-iframe-trigger'}`} mountTarget='#root' frameBorder={0}>
            <FrameContext.Consumer>
              {(frameData: any) => {
                return (
                  <DumbotAppWrapper
                    shape={JSON.parse(this.props.botShape)}
                    isDarkTheme={isDarkTheme}
                    document={frameData.document}
                    window={frameData.window}
                    onToggle={this.onToggle}
                    userDisplayName={userDisplayName}
                    initiallyClosed={this.props.initiallyClosed}
                    settings={this.props.settings ? JSON.parse(this.props.settings) : undefined}
                  />
                );
              }}
            </FrameContext.Consumer>
          </IFrame>
        </div>
      </>
    );
  }
}
