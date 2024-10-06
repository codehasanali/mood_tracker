import React from 'react';
import HomeFocused from '../assets/icons/HomeFocused';
import HomeDefault from '../assets/icons/HomeDefault';
import SettingsFocused from '../assets/icons/SettingsFocused';
import SettingsDefault from '../assets/icons/SettingsDefault';
import { SvgProps } from 'react-native-svg';
import CalendarFocused from '../assets/icons/CalendarFocuesd';
import CalendarDefault from '../assets/icons/CalendarDefault';

interface IconProps {
  name: 'Home' | 'Calendar' | 'Settings';
  focused?: boolean;
  size?: number;
  color?: string;
}

const Icon: React.FC<IconProps> = ({ name, focused = false, size = 24, color = 'black' }) => {
  const props: SvgProps = { width: size, height: size, color };

  switch (name) {
    case 'Home':
      return focused ? <HomeFocused {...props} /> : <HomeDefault {...props} />;
    case 'Settings':
      return focused ? <SettingsFocused {...props} /> : <SettingsDefault {...props} />;
    case 'Calendar':
      return focused ? <CalendarFocused {...props} /> : <CalendarDefault {...props} />;
    default:
      return null;
  }
};

export default Icon;