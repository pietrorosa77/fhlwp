export interface IDumbotProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  botShape: string;
  customThemeCss?: string;
  customHostContainerCss?: string;
  mode: 'popup' | 'chat' | 'inline' | 'full';
  initiallyClosed: boolean;
  settings?: string;
}
