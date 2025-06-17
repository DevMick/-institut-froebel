import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#005AA9', // Rotary Blue
    secondary: '#F7A81B', // Rotary Gold
    error: '#B00020',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#000000',
    disabled: '#757575',
    placeholder: '#9E9E9E',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#FF4081',
  },
  roundness: 4,
  animation: {
    scale: 1.0,
  },
}; 