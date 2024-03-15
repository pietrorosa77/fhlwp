
import * as React from 'react';
import {
  Avatar, Button
} from "@fluentui/react-components";
import {
  DismissCircleRegular,
  ArrowResetRegular,
  ArrowStepBackRegular
} from "@fluentui/react-icons";
import { BotSettingsContext } from '../core';

export interface IBotHeaderProps {
  onClose: () => void;
  isEnd: boolean;
  onBack: () => void;
  loading: boolean;
}

export const Header = (props: IBotHeaderProps) => {
  const settings = React.useContext(BotSettingsContext);
  const backIcon = props.isEnd ? <ArrowResetRegular /> : <ArrowStepBackRegular />;

  if (settings.hideHeader) {
    return (
      <div className='bot-header-compaq'>
        <Button icon={backIcon} appearance='outline' shape='circular' onClick={props.onBack} />
        <Button icon={<DismissCircleRegular />} appearance='outline' shape='circular' onClick={props.onClose} className='bot-header-compaq-close'/>
      </div>
    );
  }


  return (
    <div className='bot-header bot-bars flex p-toolbar'>
      <div><Avatar image={{ src: settings.headerLogo }} size={36} shape="circular" className='dmbt-header-avatar' /></div>
      <h1 className='flex-1'><span className='p-toolbar-group-start'>{settings.headerText}</span></h1>
      <div className='flex column-gap-1'>
        <Button icon={backIcon} appearance='secondary' shape='circular' onClick={props.onBack} />
        <Button icon={<DismissCircleRegular />} appearance='secondary' shape='circular' onClick={props.onClose} />
      </div>
    </div>

  );
};
