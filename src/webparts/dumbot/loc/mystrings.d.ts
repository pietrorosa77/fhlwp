declare interface IDumbotWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  ModeFieldLabel: string;
  AppLocalEnvironmentSharePoint: string;
  AppLocalEnvironmentTeams: string;
  AppLocalEnvironmentOffice: string;
  AppLocalEnvironmentOutlook: string;
  AppSharePointEnvironment: string;
  AppTeamsTabEnvironment: string;
  AppOfficeEnvironment: string;
  AppOutlookEnvironment: string;
  UnknownEnvironment: string;
  ConfigureBot: string;
  EditorHeader: string;
  BotSave: string;
  BotCancel: string;
  NodeEditorSettingsTitle: string;
  NodeEditorSettingsSave: string;
  NodeEditorSettingsCancel: string;
  StartEditingBot: string;
  ConfigureBotSettings: string;
}

declare module 'DumbotWebPartStrings' {
  const strings: IDumbotWebPartStrings;
  export = strings;
}
