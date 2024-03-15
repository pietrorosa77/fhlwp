
import { BotSettingsContext } from '../core';
import { IBotSettings, IDmbtMessage } from '../../definitions';
import { LoadingStep } from './LoadingStep';
import { Message } from './Message';
import * as React from 'react';

interface IMessagesProps {
  processed: IDmbtMessage[];
  active: IDmbtMessage[];
  onProcessed: (last: IDmbtMessage) => void;
  customMessageDisplay?: Map<string, (props: IDmbtMessage) => JSX.Element>;
  userDisplayName: string;
}

const getAdjustedProcessedMessages = (processed: IDmbtMessage[]) => {
  const orderedGroup = processed.reduce(
    (acc, curr, index) => {
      const startNew =
        !acc.last ||
        acc.last.meta?.isUser !== curr.meta?.isUser ||
        acc.last.meta?.silent !== curr.meta?.silent ||
        acc.last.meta?.nickname !== curr.meta?.nickname;

      if (startNew) {
        if (acc.group.length) {
          acc.messages.push(acc.group);
        }
        acc.group = [curr as any] as any;
      } else {
        acc.group = acc.group.concat(curr as any) as any;
      }
      acc.last = curr;
      // acc.last =
      //   curr.output.type !== "message" || curr.meta.silent
      //     ? undefined
      //     : (curr as any);
      //curr;
      if (index === processed.length - 1) {
        acc.messages.push(acc.group);
      }
      return acc;
    },
    {
      last: undefined as IDmbtMessage | undefined,
      messages: [] as any,
      group: [] as any
    }
  );

  const messagesGroup = orderedGroup.messages as Array<IDmbtMessage[]>;

  return messagesGroup.reduce((acc, el) => {
    const messages = el.map((m, i) => ({
      ...m,
      meta: {
        ...m.meta,
        hasAvatar: i === el.length - 1,
        leadingGroup: i === 0
      }
    }));
    return acc.concat(messages);
  }, []);
};

export const Messages = (props: IMessagesProps) => {
  const processedStr = JSON.stringify(props.processed.map((m) => m.id));
  const activeStr = JSON.stringify(props.active.map((m) => m.id));
  const botSettings: IBotSettings = React.useContext(BotSettingsContext);
  const messageDelay = botSettings.messageDelay || 1500;
  const [processed, setProcessed] = React.useState<IDmbtMessage[]>([]);
  const [activeQueue, setActiveQueue] = React.useState<IDmbtMessage[]>();
  const activeQueueLength = activeQueue?.length;
  const [active, setActive] = React.useState<IDmbtMessage>();

  React.useEffect(() => {
    setProcessed(props.processed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processedStr]);

  React.useEffect(() => {
    setActiveQueue(props.active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStr]);

  React.useEffect(() => {
    if (activeQueueLength === undefined) {
      return;
    }

    if (activeQueueLength === 0) {
      props.onProcessed(processed[processed.length - 1]);
      return;
    }

    let timer: any = 0;

    const queueCopy = [...(activeQueue as IDmbtMessage[])];
    const newActive = queueCopy.shift() as IDmbtMessage;
    setActive(newActive);
    timer = setTimeout(
      () => {
        setActive(undefined);
        setProcessed(processed.concat(newActive));
        setActiveQueue(queueCopy);
      },
      newActive.meta.isUser ? 300 : messageDelay
    );
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQueueLength, messageDelay]);

  const adjustedProcessed = getAdjustedProcessedMessages(processed).filter(
    (m) => (botSettings.viewSilentNodes ? m : !m.meta.silent)
  );
  const processedList = adjustedProcessed.map((m, i) => {
    return (
      <Message
        key={`${m.id}-${i}`}
        active={i === adjustedProcessed.length - 1}
        message={m}
        userDisplayName={props.userDisplayName}
        customMessageDisplay={props.customMessageDisplay || new Map()}
      />
    );
  });

  return (
    <>
      <div className="processedBlock">{processedList}</div>
      {active && <LoadingStep justify="start" />}
    </>
  );
};
