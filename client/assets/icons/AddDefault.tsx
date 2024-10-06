import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

const AddDefault: React.FC<SvgProps> = (props) => (
  <Svg width="26" height="26" viewBox="0 0 26 26" fill="none" {...props}>
    <Path
      d="M13 6 L13 20 M6 13 L20 13"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export default AddDefault;
