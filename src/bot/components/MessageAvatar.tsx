import { Avatar } from "@fluentui/react-components";
import * as React from "react";

export interface IMessageAvatarProps {
  user: boolean;
  active: boolean;
  stay: boolean;
  leading: boolean;
  className?: string;
  src?: string;
  nickName: string;
}

export const MessageAvatar = (props: IMessageAvatarProps) => {
  const label = props.src ? undefined : props.nickName;
  return (
    <div className="flex align-self-stretch relative align-items-end">
      <Avatar
        className={`fadein animation-duration-500 message-avatar from-${
          props.user ? 'me' : 'others'
        } ${props.className || ''}`}
        image={ {src: props.src}}
        name={label}
        size={48}
        shape="circular"
        style={{ visibility: props.stay ? undefined : 'hidden' }}
      />
    </div>
  );
};
