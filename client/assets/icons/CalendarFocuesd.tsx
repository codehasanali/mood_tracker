import React from 'react';
import Svg, { Rect, Path, SvgProps } from 'react-native-svg';

const CalendarFocused: React.FC<SvgProps> = (props) => {
  return (
    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" {...props}>
      <Rect x={3} y={6} width={18} height={15} rx={2} stroke="white" strokeWidth={2} />
      <Path d="M4 11H20" stroke="white" strokeWidth={2} strokeLinecap="round" />
      <Path d="M9 16H15" stroke="white" strokeWidth={2} strokeLinecap="round" />
      <Path d="M8 3L8 7" stroke="white" strokeWidth={2} strokeLinecap="round" />
      <Path d="M16 3L16 7" stroke="white" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
};

export default CalendarFocused;
