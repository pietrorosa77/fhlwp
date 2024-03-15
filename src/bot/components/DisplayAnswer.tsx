import { HtmlRenderer } from '../core';
import { IDmbtMessage } from '../../definitions';
import * as React from 'react';

const getDateTimeString = (type: 'date' | 'time', value: Date) => {
  if (type === 'date') {
    return value.toDateString();
  }

  return value.toTimeString();
};
export const DateTimeDisplay = (props: IDmbtMessage) => {
  if (props.output.value instanceof Date) {
    return getDateTimeString(props.output.type as any, props.output.value);
  }
  if (Array.isArray(props.output.value)) {
    const output = props.output.value.map((entry: Date | string, i: number) => {
      return (
        <div key={i}>
          {entry instanceof Date
            ? getDateTimeString(props.output.type as any, entry)
            : entry}
        </div>
      );
    });
    return <>{output}</>;
  }

  return props.output.value;
};

export const DefaultOutput = (props: IDmbtMessage) => {
  return HtmlRenderer(props.output.value);
};

export const DisplayMessage = (props: IDmbtMessage) => {
  return HtmlRenderer(props.content);
};

export const ArrayOutput = (props: IDmbtMessage) => {
  const output = props.output.value.map((entry: any, i: number) => (
    <div key={i}>{HtmlRenderer(entry)}</div>
  ));
  return <>{output}</>;
};

export const ColorOutput = (props: IDmbtMessage) => {
  return (
    <div style={{ backgroundColor: props.output.value }} />
    //   disabled
    //   value={props.output.value}
    //   format={(props.meta.format as any) || 'hex'}
    // />
  );
};

