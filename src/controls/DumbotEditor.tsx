
import * as React from 'react';
import './flowchart.css';
// @ts-ignore
import { FChart } from './flowChart';
import './DumbotEditor.module.scss';
import { IChartActions, IDmbtNode, IDmbtShape } from '../definitions';
import { availableNodes, getInitialSchema } from './nodes';
import { createPortal } from 'react-dom';
import * as strings from 'DumbotWebPartStrings';
import { nanoid } from 'nanoid';
import { cloneDeep } from '@microsoft/sp-lodash-subset';
import {
    FluentProvider,
    webLightTheme,
    webDarkTheme,
    Button,
    IdPrefixProvider
} from "@fluentui/react-components";
import { OpenNodeSettingsEditor } from './NodeEditor';

export interface IDumbotEditorProps {
    botShape: string;
    description: string;
    onSave: (chart: IDmbtShape) => void;
    isDarkTheme: boolean;
}

const containerStyle: React.CSSProperties = {
    height: '100vh',
    width: '100vw',
    position: 'fixed',
    top: 0,
    right: 0,
    zIndex: 1000
}

const toolbarStyle: React.CSSProperties = {
    height: '50px',
    width: '100%',
    gap: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#000000',
    fontFamily: "Segoe UI"
}

const toolbarDescStyle : React.CSSProperties =
    { color: '#ffffff', display: 'flex', width: '100%', justifyContent: 'center' }


const holderStyle: React.CSSProperties = {
    width: '100%',
    height: 'calc(100% - 50px)'
}

const toolbarSaveStyle: React.CSSProperties = {
    marginRight: '10px'
}

export const EditorToolbar = (props: { onConfirm: () => void, onCancel: () => void, description: string }) => {
    return (
        <div style={toolbarStyle}>
            <div style={toolbarDescStyle}><h2>{props.description}</h2></div>
            <Button onClick={props.onCancel} appearance='secondary'>{strings.BotCancel} </Button>
            <Button onClick={props.onConfirm} appearance='primary'  style={toolbarSaveStyle}>{strings.BotSave} </Button>
        </div>
    )
}

const InnerEditorComponent = (props: {
    isDarkTheme: boolean,
    chart: IDmbtShape,
    description: string,
    onConfirm: () => void,
    onCancel: () => void,
    onHistoryChange: (chartcb: IDmbtShape) => void,
    onLoad: (actionsCb: IChartActions) => void,
    onNodeChanged: (oldNode: IDmbtNode, newNode: IDmbtNode) => void
}) => {
    const editorRootId = React.useRef(`dmbtedit_${nanoid(5)}`);


    React.useEffect(() => {
        startFlowchart()
    }, []);

    function startFlowchart() {
        const chartProps = {
            chart: cloneDeep(props.chart),
            width: '100%',
            height: '100%',
            availableNodes: availableNodes,
            onHistoryChange: (chartcb: IDmbtShape) => {
                props.onHistoryChange(chartcb)
            },
            onLoad: (actionsCb: IChartActions) => {
                props.onLoad(actionsCb)
            },
            onCustomEditNode: (node: IDmbtNode) => {
                OpenNodeSettingsEditor(node, props.onNodeChanged, props.isDarkTheme);
            },
            customTheme: {
                fontFamily: '"Segoe UI"'
            }
        };
        FChart(chartProps, editorRootId.current);
    }

    return (
        <IdPrefixProvider value="dmbtEditor-">
            <FluentProvider theme={props.isDarkTheme ? webDarkTheme : webLightTheme}>
                <link
                    href="https://ka-f.fontawesome.com/releases/v6.5.1/css/free.min.css?token=6bd2a426a2"
                    rel="stylesheet"
                />
                <div className='dumbot-editor-container' style={containerStyle}>
                    <EditorToolbar onCancel={props.onCancel} onConfirm={props.onConfirm} description={props.description} />
                    <div style={holderStyle} className='dumbot-editor-holder' id={editorRootId.current} />
                </div>
            </FluentProvider>
        </IdPrefixProvider>
    )
}

export const DumbotEditor = (props: IDumbotEditorProps) => {
    const [opened, setOpened] = React.useState(false);
    const actions = React.useRef<IChartActions>();
    const draftChart = React.useRef(getChart());
    const chart = React.useRef(getChart());

    function getChart() {
        if (props.botShape) {
            return JSON.parse(props.botShape);
        }

        return getInitialSchema('spfxBot');
    }

    function onHistoryChange(chartcb: IDmbtShape) {
        draftChart.current = chartcb;
    }

    function onLoad(actionsCb: IChartActions) {
        actions.current = actionsCb;
    }

    function onNodeChanged(oldNode: IDmbtNode, newNode: IDmbtNode) {
        actions.current?.onNodeChanged(newNode.id, newNode);
    }

    function openEditor() {
        setOpened(true);
    }


    function onCancel() {
        draftChart.current = chart.current;
        setOpened(false);
    }

    function onConfirm() {
        chart.current = draftChart.current;
        chart.current.version=nanoid(10)
        props.onSave(chart.current);
        setOpened(false);
    }

    return (
        <div>
            <Button onClick={openEditor} appearance='primary'>{strings.ConfigureBot} </Button>
            {opened &&
                createPortal(
                    <InnerEditorComponent
                        description={props.description}
                        isDarkTheme={props.isDarkTheme}
                        chart={chart.current} 
                        onCancel={onCancel}
                        onConfirm={onConfirm}
                        onHistoryChange={onHistoryChange}
                        onNodeChanged={onNodeChanged}
                        onLoad={onLoad} />
                    , document.body)
            }
        </div>
    );
}