import {useTranslation} from 'react-i18next';
import {Layout, Text, useTheme} from '@ui-kitten/components';
import {TouchableOpacity} from 'react-native';
import {ThemedIcon} from '../Icon';
import {flexeStyles, spacingStyles} from '../../utils/globalStyles';

export const ProfileActionButton = ({
  title,
  rightTitle,
  iconName,
  rightIconName,
  onPress,
}) => {
  const theme = useTheme();
  const {i18n} = useTranslation();
  return (
    <TouchableOpacity
      style={[
        flexeStyles.row,
        flexeStyles.itemsCenter,
        flexeStyles.contentBetween,
        spacingStyles.py8,
      ]}
      onPress={onPress}>
      <Layout style={[flexeStyles.row, flexeStyles.itemsCenter]}>
        <ThemedIcon name={iconName} iconStyle={{marginRight: 10}} />
        <Text category="s1" style={{color: theme['text-hint-color']}}>
          {title}
        </Text>
      </Layout>
      <Layout style={[flexeStyles.row, flexeStyles.itemsCenter]}>
        {rightTitle && <Text appearance="hint">{rightTitle}</Text>}
        <ThemedIcon
          name={
            rightIconName
              ? rightIconName
              : i18n.dir() === 'rtl'
              ? 'arrow-ios-back-outline'
              : 'arrow-ios-forward-outline'
          }
        />
      </Layout>
    </TouchableOpacity>
  );
};
