import {useTranslation} from 'react-i18next';
import {Layout, Text, useTheme, Icon} from '@ui-kitten/components';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import {ThemedIcon} from '../Icon';
import {flexeStyles, spacingStyles} from '../../utils/globalStyles';

export const ProfileActionButton = ({
  title,
  subtitle,
  rightTitle,
  iconName,
  rightIconName,
  onPress,
}) => {
  const theme = useTheme();
  const {i18n} = useTranslation();
  return (
    <TouchableOpacity style={[styles.actionRow,spacingStyles.px32]} onPress={onPress}>
      <View style={styles.actionIconCircle}>
        <Icon name={iconName} fill="#222" style={{ width: 22, height: 22 }} />
      </View>
      <View style={styles.actionTextContainer}>
        <Text style={styles.actionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.actionSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.actionArrowBox}>
        <Icon
          name={rightIconName
            ? rightIconName
            : i18n.dir() === 'rtl'
            ? 'arrow-ios-back-outline'
            : 'arrow-ios-forward'}
          fill="#888"
          style={{ width: 18, height: 18 }}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    backgroundColor: 'transparent',
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  actionTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  actionArrowBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
