
import * as React from 'react';
import { IBotSettings } from '../definitions';
import { createPortal } from 'react-dom';

import * as strings from 'DumbotWebPartStrings';
import {
    FluentProvider,
    webLightTheme,
    webDarkTheme,
    Button,
    IdPrefixProvider
} from "@fluentui/react-components";
import { EditorToolbar } from './DumbotEditor';
// @ts-ignore
import { JSONEditor, isTextContent } from './flowChart';
import { DefaultBotSettings } from '../bot/core';

export interface IDumbotSettingsEditorProps {
    description: string;
    onSave: (settimgs: IBotSettings) => void;
    isDarkTheme: boolean;
    settings: string;
}


const containerStyle: React.CSSProperties = {
    height: '100vh',
    width: '100vw',
    position: 'fixed',
    top: 0,
    right: 0,
    zIndex: 1000
}


const holderStyle: React.CSSProperties = {
    width: '100%',
    height: 'calc(100% - 50px)'
}



const InnerEditorComponent = (props: {
    isDarkTheme: boolean,
    settings: IBotSettings,
    description: string,
    onSave: (settings: IBotSettings) => void,
    onCancel: () => void,
}) => {
    const jsonHolder = React.useRef(null);
    const editor = React.useRef<JSONEditor>();


    const closeEditor = (settings?: IBotSettings) => {
        editor.current.destroy().then(() => {
            if (settings) {
                props.onSave(settings);
                return;
            }
            props.onCancel()

        });

    }

    const onSave = () => {
        const value = editor.current.get();
        const settings: IBotSettings = isTextContent(value)
            ? JSON.parse(value.text || "{}")
            : value.json;

        closeEditor(settings)
    }

    const onCancel = () => {
        closeEditor();
    }

    React.useEffect(() => {
        const content: any = {
            text: undefined,
            json: {
                ...props.settings,
            },
        };
        editor.current = new JSONEditor({
            target: jsonHolder.current,
            props: {
                content
            },
        });
    }, []);

    return (
        <IdPrefixProvider value="dmbtSettingsEditor-">
            <FluentProvider theme={props.isDarkTheme ? webDarkTheme : webLightTheme}>
                <div className='dumbot-editor-container' style={containerStyle}>
                    <EditorToolbar onCancel={onCancel} onConfirm={onSave} description={props.description} />
                    <div style={holderStyle} className='dumbot-editor-holder' ref={jsonHolder} />
                </div>
            </FluentProvider>
        </IdPrefixProvider>
    )
}

export const DumbotSettingsEditor = (props: IDumbotSettingsEditorProps) => {
    const [opened, setOpened] = React.useState(false);
    const settingsRef = React.useRef<IBotSettings>(props.settings ? JSON.parse(props.settings) : DefaultBotSettings);

    function openEditor() {
        setOpened(true);
    }

    function onCancel() {
        setOpened(false);
    }

    function onSave(settings: IBotSettings) {
        settingsRef.current = settings;
        props.onSave(settings);
        setOpened(false);
    }

    return (
        <div>
            <Button onClick={openEditor} appearance='secondary'>{strings.ConfigureBotSettings} </Button>
            {opened &&
                createPortal(
                    <InnerEditorComponent
                        description={props.description}
                        isDarkTheme={props.isDarkTheme}
                        settings={settingsRef.current}
                        onCancel={onCancel}
                        onSave={onSave}
                    />
                    , document.body)
            }
        </div>
    );
}