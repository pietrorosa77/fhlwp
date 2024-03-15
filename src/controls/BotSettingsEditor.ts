
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { nanoid } from 'nanoid';
import {
  IPropertyPaneCustomFieldProps,
  IPropertyPaneField,
  PropertyPaneFieldType
} from '@microsoft/sp-property-pane';
import { update } from '@microsoft/sp-lodash-subset';
import { IBotSettings } from '../definitions';
import { DumbotSettingsEditor, IDumbotSettingsEditorProps } from './DumbotSettingsEditor';

interface IPropertyPaneBotEditorInternalProps extends IDumbotSettingsEditorProps, IPropertyPaneCustomFieldProps {
}

export class BotSettingsEditor implements IPropertyPaneField<IDumbotSettingsEditorProps> {
  public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
  public targetProperty: string;
  public properties: IPropertyPaneBotEditorInternalProps;
  private elem: HTMLElement;

  constructor(targetProperty: string, properties: IDumbotSettingsEditorProps) {
    this.targetProperty = targetProperty;
    this.properties = {
      key: nanoid(10),
      onRender: this.onRender.bind(this),
      onDispose: this.onDispose.bind(this),
      onSave: properties.onSave,
      isDarkTheme: properties.isDarkTheme,
      description:properties.description,
      settings: properties.settings
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

    const element: React.ReactElement<IDumbotSettingsEditorProps> = React.createElement(DumbotSettingsEditor, {
      settings: this.properties.settings,
      onSave: this.onSave.bind(this),
      isDarkTheme: this.properties.isDarkTheme,
      description: this.properties.description
    });
    ReactDom.render(element, elem);
  }

  private onSave(settings: IBotSettings): void {
    // store new value in web part properties
    update(this.properties, 'settings', (): any => { return JSON.stringify(settings); });
    this.properties.onSave(settings);
  }
}