import { nanoid } from 'nanoid';
import * as React from "react";
import * as ReactDOM from "react-dom";
import {
    Dialog,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
    Button,
    FluentProvider,
    webDarkTheme,
    webLightTheme,
} from "@fluentui/react-components";
import { IDmbtNode } from "../definitions";
import * as strings from 'DumbotWebPartStrings';
// @ts-ignore
import { JSONEditor, updateNodeSettings, getNodeToEdit } from './flowChart';

const NodeSettingsEditor = (props: { node: IDmbtNode, onNodeChanged: (oldNode: IDmbtNode, newNode: IDmbtNode) => void, onClose: () => void }) => {

    const jsonHolder = React.useRef(null);
    const editor = React.useRef<JSONEditor>();

    const destroyEditor = () => {
        editor.current.destroy().then((value: any) => {
            props.onClose();
        });

    }

    const saveContent = () => {
        const updatedNode = updateNodeSettings(props.node,  editor.current);
        props.onNodeChanged(props.node,updatedNode);
        destroyEditor();
    }

    const onCancel = () => {
        destroyEditor();
    }

    React.useEffect(() => {
        const nodeEdit = getNodeToEdit(JSON.parse(JSON.stringify(props.node)));
        const content: any = {
            text: undefined,
            json: {
                ...nodeEdit,
            },
        };

        editor.current = new JSONEditor({
            target: jsonHolder.current,
            props: {
                content,
            },
        });

    }, []);

    return (
        <Dialog defaultOpen={true}>
            <DialogSurface className='node_editor'>
                <DialogBody>
                    <DialogTitle>{strings.NodeEditorSettingsTitle}</DialogTitle>
                    <DialogContent>
                        <div ref={jsonHolder} />
                    </DialogContent>
                    <DialogActions>
                        <Button appearance="secondary" onClick={onCancel}>{strings.NodeEditorSettingsCancel}</Button>
                        <Button appearance="primary" onClick={saveContent}>{strings.NodeEditorSettingsSave}</Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    )
}

export const OpenNodeSettingsEditor = (node: IDmbtNode, onNodeChanged: (oldNode: IDmbtNode, newNode: IDmbtNode) => void, isDarkTheme: boolean) => {
    const editorHolder = document.createElement('div');
    editorHolder.id = nanoid(10);
    const el = document.body.appendChild(editorHolder);

    ReactDOM.render(
        <FluentProvider theme={isDarkTheme ? webDarkTheme : webLightTheme}>
            <NodeSettingsEditor node={node} onNodeChanged={onNodeChanged} onClose={() => {
                ReactDOM.unmountComponentAtNode(el);
                document.body.removeChild(el);
            }} />
        </FluentProvider>, el);
}