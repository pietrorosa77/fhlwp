import { BotSettingsContext } from '../core';
import * as React from 'react';
import { Button } from '@fluentui/react-components';

export const Trigger = (props: {
  logoUrl?: string;
  opened: boolean;
  severity?:
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | undefined;
  onToggleBot: (toggled: boolean) => void;
}) => {
  const toggleBot = React.useCallback(() => {
    props.onToggleBot(!props.opened);
  }, [props.opened]);
  const settings = React.useContext(BotSettingsContext);

  if (props.opened) {
    return null;
  }

  return (
    <div className='dumbot-webpart-main dumbot-trigger-container'>
      <Button appearance="primary" onClick={toggleBot} className='dumbot-trigger-button'>
        <img
          alt="logo"
          src={props.logoUrl || settings.botAvatar}
          className='dumbot-trigger-image'
        />
      </Button>
    </div>
  );
};
