import * as React from "react";

export const LoadingStep = (props: { justify: 'start' | 'end' | 'center' }) => {
    const justify = `justify-content-${props.justify}`;
    return (
      <div className={`message-loading align-content-end flex gap-1 ${justify}`}>
        <div
          className="message-loading-step"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="message-loading-step"
          style={{ animationDelay: '.2s' }}
        />
        <div
          className="message-loading-step"
          style={{ animationDelay: '.4s' }}
        />
      </div>
    );
  };
  