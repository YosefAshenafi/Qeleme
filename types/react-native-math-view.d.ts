declare module 'react-native-math-view' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  interface MathViewProps {
    math: string;
    resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
    style?: ViewStyle;
    mathJaxOptions?: {
      displayMessages?: boolean;
      messageStyle?: { color: string };
    };
  }

  export default class MathView extends Component<MathViewProps> {}
}
