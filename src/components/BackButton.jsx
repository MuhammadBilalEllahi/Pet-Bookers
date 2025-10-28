import {useTranslation} from 'react-i18next';
import {TouchableOpacity} from 'react-native';
import {ThemedIcon} from './Icon';
import {useTheme} from '../theme/ThemeContext';

export const BackButton = ({onPress, fill, iconName}) => {
  const {i18n} = useTranslation();
  const {theme, isDark} = useTheme();

  // Use theme color if no fill is provided
  const iconFill =
    fill || (isDark ? theme['text-basic-color'] : theme['text-basic-color']);

  return (
    <TouchableOpacity onPress={onPress}>
      <ThemedIcon
        name={
          iconName ||
          (i18n.dir() === 'rtl'
            ? 'arrow-forward-outline'
            : 'arrow-back-outline')
        }
        style={{
          fill: iconFill,
        }}
        iconStyle={{
          width: 30,
          height: 30,
        }}
      />
    </TouchableOpacity>
  );
};
