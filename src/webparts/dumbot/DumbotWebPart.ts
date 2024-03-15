import * as React from 'react';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'DumbotWebPartStrings';
import Dumbot from './components/Dumbot';
import { IDumbotProps } from './components/IDumbotProps';
import { BotEditor } from '../../controls/BotEditor';
import { IBotSettings, IDmbtShape } from '../../definitions';
import { update } from '@microsoft/sp-lodash-subset';
import * as ReactDOM from 'react-dom';
import { BotSettingsEditor } from '../../controls/BotSettingsEditor';

export interface IDumbotWebPartProps {
  description: string;
  botShape: string;
  mode: 'popup' | 'chat' | 'inline' | 'full';
  customBotCss?: string;
  customHostContainerCss?: string;
  initiallyClosed?: boolean;
  settings: string;
}

export default class DumbotWebPart extends BaseClientSideWebPart<IDumbotWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {
    const element: React.ReactElement<IDumbotProps> = React.createElement(
      Dumbot,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
        botShape: this.properties.botShape,
        mode: this.properties.mode || 'inline',
        customThemeCss: this.properties.customBotCss,
        customHostContainerCss: this.properties.customHostContainerCss,
        initiallyClosed: this.properties.initiallyClosed || false,
        settings: this.properties.settings
      }
    );

    ReactDOM.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }



  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDOM.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneDropdown('mode', {
                  label: strings.ModeFieldLabel,
                  selectedKey: this.properties.mode,
                  options: [
                    { key: 'inline', text: 'Inline' },
                    { key: 'popup', text: 'Popup' },
                    { key: 'full', text: 'Full' },
                    { key: 'chat', text: 'Chat' }
                  ]
                }),
                PropertyPaneTextField('customHostContainerCss', {
                  label: 'customize host container css (check available variables)',
                  multiline: true
                }),
                PropertyPaneTextField('customBotCss', {
                  label: 'customize bot css (check available variables)',
                  multiline: true
                }),
                PropertyPaneToggle('initiallyClosed', {
                  checked: this.properties.initiallyClosed || false,
                  label: 'Initially Closed'
                }),
                new BotSettingsEditor('settings', {
                  settings: this.properties.settings,
                  onSave: this.onSaveSettings.bind(this),
                  isDarkTheme: this._isDarkTheme,
                  description: this.properties.description
                }),
                new BotEditor('botShape', {
                  botShape: this.properties.botShape,
                  onSave: this.onSaveShape.bind(this),
                  isDarkTheme: this._isDarkTheme,
                  description: this.properties.description
                })
              ]
            }
          ]
        }
      ]
    };
  }

  private onSaveShape(chart: IDmbtShape): void {
    update(this.properties, 'botShape', (): any => { return JSON.stringify(chart); });
    // refresh web part
    this.render();
  }

  private onSaveSettings(settings: IBotSettings): void {
    update(this.properties, 'settings', (): any => { return JSON.stringify(settings); });
    // refresh web part
    this.render();
  }
}
