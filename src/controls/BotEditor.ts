
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { nanoid } from 'nanoid';
import {
  IPropertyPaneCustomFieldProps,
  IPropertyPaneField,
  PropertyPaneFieldType
} from '@microsoft/sp-property-pane';
import { DumbotEditor, IDumbotEditorProps } from './DumbotEditor';
import { update } from '@microsoft/sp-lodash-subset';
import { IDmbtShape } from '../definitions';



interface IPropertyPaneBotEditorInternalProps extends IDumbotEditorProps, IPropertyPaneCustomFieldProps {
}



export class BotEditor implements IPropertyPaneField<IDumbotEditorProps> {
  public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
  public targetProperty: string;
  public properties: IPropertyPaneBotEditorInternalProps;
  private elem: HTMLElement;

  constructor(targetProperty: string, properties: IDumbotEditorProps) {
    this.targetProperty = targetProperty;
    this.properties = {
      key: nanoid(10),
      botShape: properties.botShape,
      onRender: this.onRender.bind(this),
      onDispose: this.onDispose.bind(this),
      onSave: properties.onSave,
      isDarkTheme: properties.isDarkTheme,
      description:properties.description
    };
  }

  public render(): void {
    if (!this.elem) {
      return;
    }

    this.onRender(this.elem);
  }

  private onDispose(element: HTMLElement): void {
    ReactDom.unmountComponentAtNode(element);
  }

  private onRender(elem: HTMLElement): void {
    if (!this.elem) {
      this.elem = elem;
    }

    const element: React.ReactElement<IDumbotEditorProps> = React.createElement(DumbotEditor, {
      botShape: this.properties.botShape,
      onSave: this.onSave.bind(this),
      isDarkTheme: this.properties.isDarkTheme,
      description: this.properties.description
    });
    ReactDom.render(element, elem);
  }

  private onSave(chart: IDmbtShape): void {
    // store new value in web part properties
    update(this.properties, 'botShape', (): any => { return JSON.stringify(chart); });
    this.properties.onSave(chart);
  }
}