import * as React from 'react';
import { BotSettingsContext } from '../core';

export const Footer = () => {
  const settings = React.useContext(BotSettingsContext);

  return (
    <div className='bot-footer bot-bars flex p-toolbar'>
          <strong className="footer-disclaimer">{settings.footerText}</strong>
    </div>
  );
};
