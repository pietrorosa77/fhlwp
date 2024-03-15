
import { Body1, Button, Input, InputProps, Textarea, useId } from '@fluentui/react-components';
import { IDmbtInteractionProps } from '../../../definitions';
import { useQuestion } from './helpers';
import {
    SendFilled
} from "@fluentui/react-icons";
import * as React from 'react';

export const Question = (props: IDmbtInteractionProps) => {
    const afterId = useId("sendAnswer");
    const [onChange, onKeyDown, onSend, valid, text, inpProps] =
        useQuestion<InputProps>(props);
    const className = `${inpProps.className}${!valid ? ' dmbt-invalid' : ''}`;
    const btnClass = `${inpProps.sendClassName}${!valid ? ' dmbt-button-danger' : ''}`;

    return (
        <div className='flex flex-column'>
            {!inpProps.multiline && (<Input
                value={text}
                onKeyDown={onKeyDown}
                onChange={onChange}
                className={className}
                pattern={inpProps.pattern}
                appearance={inpProps.appearance || 'outline'}
                placeholder={inpProps.placeholder}
                type={inpProps.type}
                size={inpProps.size}
                contentAfter={<Button
                    className={btnClass}
                    onClick={onSend}
                    appearance="transparent"
                    icon={<SendFilled />}
                    size="small"
                    aria-label="Send your answer"
                />}
                id={afterId}
            />)}
            {inpProps.multiline && (
               <Textarea appearance='outline' value={text}
                    placeholder={inpProps.placeholder}
                    contentEditable='true'
                    resize='vertical'
                    onKeyDown={onKeyDown}
                    onChange={onChange}
                    className={className} />
                 
            )}
            {inpProps.description && <Body1>
                {inpProps.description}
            </Body1>}
        </div>
    );
};
