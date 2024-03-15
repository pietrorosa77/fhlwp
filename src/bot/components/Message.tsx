
import { BotSettingsContext, ErrorBoundary, parseTime } from '../core';
import { IDmbtMessage } from '../../definitions';
import { MessageAvatar } from './MessageAvatar';
import {
  ArrayOutput,
  ColorOutput,
  DateTimeDisplay,
  DefaultOutput,
  DisplayMessage,
  DisplayPassword
} from './DisplayAnswer';
import * as React from 'react';

export interface IMessageProps {
  message: IDmbtMessage;
  active?: boolean;
  userDisplayName: string;
  customMessageDisplay: Map<string, (props: IDmbtMessage) => JSX.Element>;
}

const DisplayMessageMap = new Map<
  string,
  (props: IDmbtMessage & { onReady?: () => void }) => JSX.Element
>([
  ['color', ColorOutput],
  ['array', ArrayOutput],
  ['date', DateTimeDisplay],
  ['time', DateTimeDisplay],
  ['number', DefaultOutput],
  ['object', DefaultOutput],
  ['json', DefaultOutput],
  ['text', DefaultOutput],
  ['message', DisplayMessage],
  ['error', DefaultOutput],
  ['password', DisplayPassword]
]);

export const MessageContainer = (props: {
  children: any;
  className?: string;
  isUser?: boolean;
  leader: boolean;
}) => {
  const direction = props.isUser ? 'flex-row-reverse' : 'flex-row';

  const className = `dmbt-message-container flex ${direction} outline-none flex-nowrap justify-content-start gap-4 p1 ${
    props.leader ? 'mt-3' : 'mt-1'
  } message-part-${props.isUser ? 'user' : ''} ${props.className || ''}`;
  return <div className={className}>{props.children}</div>;
};

const checkUserDisplay = (nickSetting: string | undefined, username: string) => {
  if(!nickSetting || nickSetting === '{usernamed}') {
    return username;
  }

  return nickSetting;
}

export const Message = (props: IMessageProps) => {
  const botSettings = React.useContext(BotSettingsContext);
  const metadata = props.message.meta;
  const isUser = metadata.isUser;
  const bubbleClassName = isUser
    ? 'message-bubble-user'
    : 'message-bubble-others';

  const avatar =
    metadata.avatarSrc ||
    (isUser ? botSettings.userAvatar : botSettings.botAvatar);

  const nickName =
    metadata?.nickname ||
    (isUser ? checkUserDisplay(botSettings.userNick, props.userDisplayName) : botSettings.dumbotNick);

  const messageTime = parseTime(metadata.time || '');

  React.useEffect(() => {
    console.log('Mounting', props.message.id);
  }, [props.message.id]);

  const Display =
    props.customMessageDisplay.get(props.message.output.type) ||
    DisplayMessageMap.get(props.message.output.type);

  return (
    <MessageContainer
      isUser={isUser}
      className={metadata.containerclassName}
      leader={!!metadata.leadingGroup}
    >
      {!botSettings.disableAvatars && (
        <MessageAvatar
          className={metadata.avatarClassName}
          active={!!props.active}
          leading={!!metadata.leadingGroup}
          stay={!!metadata.hasAvatar}
          user={!!isUser}
          src={avatar}
          nickName={nickName as string}
        />
      )}
      <div
        className={`p-component fadein animation-duration-500 message-bubble ${bubbleClassName} flex flex-column p-2 gap-0`}
      >
        {botSettings.showMessageNickName && (
          <div className="message-bubble-nickname flex">{nickName}</div>
        )}
        <div className="message-bubble-content">
          <ErrorBoundary onDismiss={() => null}>
            {Display ? (
              <Display {...props.message} />
            ) : (
              <DefaultOutput {...props.message} />
            )}
          </ErrorBoundary>
        </div>
        {botSettings.showMessageClock && metadata.time && (
          <div className="message-bubble-clock flex">{`${
            messageTime.hours
          }:${(messageTime.minutes.toString() as any).padStart(2, '0')}`}</div>
        )}
      </div>
    </MessageContainer>
  );
};
