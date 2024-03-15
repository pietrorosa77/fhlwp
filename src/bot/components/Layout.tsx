import * as React from "react";

export const ChatBotContainer = (props: { children: any }) => {
    return (
      <div className="chatbot-root-container fadein animation-duration-1000 w-full h-full flex flex-row overflow-hidden">
        {props.children}
      </div>
    );
  };
  
  export const ChatBotContentWrapper = (props: { children: any }) => {
    return (
      <div className="flex flex-column flex-nowrap w-full h-full overflow-hidden relative">
        {props.children}
      </div>
    );
  };
  
  export const ChatBotContent = (props: { children: any }) => {
    return (
      <div className="w-full h-full overflow-hidden main-bot-content">
        {props.children}
      </div>
    );
  };
  
  export const GridLayout = (props: {
    children: any;
    contentClassName?: string;
  }) => {
    return (
      <div className="bot-grid-layout bot-grid">
        <div className="bot-grid-left"/>
        <div className={`bot-grid-center ${props.contentClassName || ''}`}>
          {props.children}
        </div>
        <div className="bot-grid-right"/>
      </div>
    );
  };
  